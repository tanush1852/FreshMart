import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose'; // If you're using ES Modules

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 512,
    responseMimeType: "text/plain",
  };
  
/**
 * Get the current user's cart
 */
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ customer: req.user._id }).populate('products.product');
        if (!cart) {
            return res.status(200).json({ products: [], total: 0 });
        }
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Add a product to the cart
 */
export const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: `${product.name} is out of stock` });
        }

        let cart = await Cart.findOne({ customer: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                customer: req.user._id,
                products: [{ product: productId, quantity }],
                total: product.price * quantity,
            });
        } else {
            const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

            if (productIndex > -1) {
                // Update quantity if product already in cart
                cart.products[productIndex].quantity += quantity;
            } else {
                // Add new product to cart
                cart.products.push({ product: productId, quantity });
            }

            // Recalculate total
            cart.total += product.price * quantity;
            await cart.save();
        }

        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Remove a product from the cart
 */
export const removeFromCart = async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const cart = await Cart.findOne({ customer: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Update total
        const product = await Product.findById(productId);
        cart.total -= product.price * cart.products[productIndex].quantity;

        // Remove product from cart
        cart.products.splice(productIndex, 1);

        if (cart.products.length === 0) {
            await Cart.findByIdAndDelete(cart._id);
            return res.status(200).json({ message: 'Cart is now empty' });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Clear the cart
 */
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOneAndDelete({ customer: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Convert cart to order
 */
export const cartToOrder = async (req, res) => {
    try {
        // Find cart and populate products with complete storeOwner information
        const cart = await Cart.findOne({ customer: req.user._id })
            .populate({
                path: 'products.product',
                populate: {
                    path: 'storeOwner',
                    select: 'address name' // Make sure these fields exist in your User schema
                }
            });

        if (!cart || !cart.products.length) {
            return res.status(404).json({ 
                message: 'Cart not found or empty' 
            });
        }

        // Validate all products and check stock in one pass
        const stockValidationErrors = [];
        const validProducts = [];

        for (const item of cart.products) {
            const product = item.product;
            
            if (!product || !product._id) {
                stockValidationErrors.push(`Invalid product reference found in cart`);
                continue;
            }

            // Fetch latest product data to ensure stock accuracy
            const currentProduct = await Product.findById(product._id)
                .populate('storeOwner', 'address name');
            
            if (!currentProduct) {
                stockValidationErrors.push(`Product ${product._id} no longer exists`);
                continue;
            }

            if (currentProduct.stock < item.quantity) {
                stockValidationErrors.push(
                    `${currentProduct.name} does not have enough stock. Requested: ${item.quantity}, Available: ${currentProduct.stock}`
                );
                continue;
            }

            validProducts.push({
                product: currentProduct,
                quantity: item.quantity
            });
        }

        if (stockValidationErrors.length > 0) {
            return res.status(400).json({
                message: 'Stock validation failed',
                errors: stockValidationErrors
            });
        }

        // Start a transaction
        const session = await mongoose.startSession();
        let order = null;

        try {
            await session.withTransaction(async () => {
                // Create order
                const orderData = {
                    customer: req.user._id,
                    products: validProducts.map(item => ({
                        product: item.product._id,
                        quantity: item.quantity,
                        price: item.product.price,
                        storeOwner: item.product.storeOwner._id
                    })),
                    total: cart.total,
                    status: 'pending'
                };

                order = await Order.create([orderData], { session });
                order = order[0];

                // Update product stock
                const stockUpdatePromises = validProducts.map(item => 
                    Product.findByIdAndUpdate(
                        item.product._id,
                        { $inc: { stock: -item.quantity } },
                        { session, new: true }
                    )
                );

                await Promise.all(stockUpdatePromises);

                // Clear the cart
                await Cart.findByIdAndDelete(cart._id, { session });
            });

            // Calculate delivery estimate if addresses are available
            let estimatedDeliveryTime = null;

            if (req.user.address) {
                try {
                    const apiKey = process.env.GEMINI_API_KEY;
                    if (!apiKey) {
                        console.log('Gemini API key not configured');
                    } else {
                        const genAI = new GoogleGenerativeAI(apiKey); // Ensure proper initialization

                        const uniqueStoreAddresses = [...new Set(
                            validProducts
                                .map(item => item.product.storeOwner?.address)
                                .filter(address => address && address.trim().length > 0)
                        )];

                        if (uniqueStoreAddresses.length > 0) {
                            console.log('Unique store addresses:', uniqueStoreAddresses);

                            const geminiInput = `
                                Calculate the estimated delivery time for an order.
                                Store Locations: ${uniqueStoreAddresses.join('; ')}
                                Customer Address: ${req.user.address}
                                Rules:
                                - Consider average traffic conditions
                                - Account for order processing time of 1 hour
                                - Return only the number of hours as a decimal between 1 and 72
                                - If multiple store locations, use the farthest one
                                Example response: 24.5
                            `.trim();

                            console.log('Sending to Gemini:', geminiInput);

                            // Assuming genAI has a sendMessage method
                            const geminiResponse = await genAI.sendMessage({
                                model: "gemini-1.5-flash",
                                prompt: geminiInput
                            });

                            const deliveryHours = parseFloat(geminiResponse.response);

                            if (!isNaN(deliveryHours) && deliveryHours > 0 && deliveryHours <= 72) {
                                estimatedDeliveryTime = deliveryHours;
                                console.log('Estimated delivery hours:', deliveryHours);
                            } else {
                                console.log('Invalid delivery hours:', deliveryHours);
                            }
                        } else {
                            console.log('No valid store addresses found');
                        }
                    }
                } catch (error) {
                    console.error('---');
                }
            }

            // Fallback to random minutes between 15-45 if delivery time could not be estimated
            if (!estimatedDeliveryTime) {
                const randomMinutes = Math.floor(Math.random() * (45 - 15 + 1)) + 15;
                estimatedDeliveryTime = randomMinutes / 60; // Convert minutes to hours
                console.log(`Fallback delivery estimate: ${randomMinutes} minutes`);
            }

            return res.status(201).json({
                message: 'Order created successfully',
                order: order,
                estimatedDeliveryTime: estimatedDeliveryTime
                    ? `${(estimatedDeliveryTime * 60).toFixed(0)} minutes`
                    : 'Could not estimate delivery time'
            });

        } catch (error) {
            console.error('Transaction error:', error);
            await session.abortTransaction();
            throw new Error(`Failed to process order: ${error.message}`);
        } finally {
            await session.endSession();
        }

    } catch (err) {
        console.error('Order creation failed:', err);
        return res.status(500).json({ 
            message: 'Failed to process order',
            error: err.message 
        });
    }
};

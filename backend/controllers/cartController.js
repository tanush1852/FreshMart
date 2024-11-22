import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';


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
        const cart = await Cart.findOne({ customer: req.user._id }).populate('products.product');
        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Check if all products are in stock
        for (const item of cart.products) {
            const product = item.product;
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `${product.name} does not have enough stock. Available: ${product.stock}`
                });
            }
        }

        // Create order from cart
        const order = await Order.create({
            customer: req.user._id,
            products: cart.products,
            total: cart.total,
            status: 'pending'
        });

        // Update product stock
        for (const item of cart.products) {
            await Product.findByIdAndUpdate(
                item.product._id,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Clear the cart after creating order
        await Cart.findByIdAndDelete(cart._id);

        res.status(201).json({ 
            message: 'Order created successfully', 
            order 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

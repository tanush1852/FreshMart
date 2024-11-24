import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

export const placeOrder = async (req, res) => {
    const { items } = req.body;

    // Ensure `items` is an array
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items array is required and cannot be empty' });
    }

    try {
        let total = 0;
        const products = []; // Prepare the products array to match schema

        for (const item of items) {
            const product = await Product.findById(item.productId); // Use `productId` from request
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `${product.name} is out of stock` });
            }

            // Update the total and prepare the products array
            total += product.price * item.quantity;
            products.push({ product: product._id, quantity: item.quantity });
        }

        // Create the order
        const order = await Order.create({
            customer: req.user._id,
            products,
            total,
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;
    
        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
          return res.status(404).json({ message: 'Cart not found' });
        }
    
        // Remove the product from the cart
        const productIndex = cart.products.findIndex(
          item => item.product.toString() === productId
        );
    
        if (productIndex === -1) {
          return res.status(404).json({ message: 'Product not found in cart' });
        }
    
        // Remove the product at the found index
        cart.products.splice(productIndex, 1);
    
        // Save the cart
        await cart.save();
    
        // Populate the cart before sending response
        const populatedCart = await Cart.findById(cart._id)
          .populate('products.product');
    
        res.json(populatedCart);
      } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Error removing item from cart' });
      }
    };
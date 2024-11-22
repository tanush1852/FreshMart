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
    const { id } = req.params;
    try {
        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the user is authorized to delete this order
        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this order' });
        }

        await Order.findByIdAndDelete(id);
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

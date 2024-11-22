import express from 'express';
import { getCart, addToCart, removeFromCart, clearCart, cartToOrder } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Assuming you have a middleware for authentication

const router = express.Router();

router.get('/', protect, getCart); // Get current user's cart
router.post('/add', protect, addToCart); // Add a product to the cart
router.post('/remove', protect, removeFromCart); // Remove a product from the cart
router.delete('/clear', protect, clearCart); // Clear the cart
router.post('/order', protect, cartToOrder); // Convert cart to order

export default router;

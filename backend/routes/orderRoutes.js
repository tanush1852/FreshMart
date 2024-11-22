import express from 'express';
import { placeOrder, deleteOrder } from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, placeOrder);
router.delete('/:id', protect, deleteOrder);

export default router;

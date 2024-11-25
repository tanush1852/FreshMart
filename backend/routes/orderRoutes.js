import express from 'express';
import { placeOrder, deleteOrder,braintreeTokenController } from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, placeOrder);
router.delete('/:id', protect, deleteOrder);
router.get('/pay/card',protect,braintreeTokenController);

export default router;

import express from 'express';
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, isStoreOwner } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/allProducts', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, isStoreOwner, addProduct);
router.put('/:id', protect, isStoreOwner, updateProduct);
router.delete('/:id', protect, isStoreOwner, deleteProduct);

export default router;

import express from 'express';
import { 
    getProducts, 
    getAllProducts, 
    getProductById, 
    addProduct, 
    updateProduct, 
    deleteProduct 
} from '../controllers/productController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/all', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (authentication required)
router.get('/', protect, getProducts);
router.post('/', protect, addProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;

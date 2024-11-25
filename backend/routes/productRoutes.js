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
import { upload } from '../middlewares/multer.middleware.js';


const router = express.Router();

// Public routes (no authentication required)
router.get('/all', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (authentication required)
router.get('/', protect, getProducts);
router.post('/', protect, upload.single('image'), addProduct);
router.put('/:id', protect, upload.single('image'), updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;

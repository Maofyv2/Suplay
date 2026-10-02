import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from '../controllers/productController.js';
import { uploadProductImage } from '../middleware/upload.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProductById);
router.post('/', optionalAuth, uploadProductImage.single('image'), createProduct);
router.put('/:id', optionalAuth, uploadProductImage.single('image'), updateProduct);
router.delete('/:id', optionalAuth, deleteProduct);
router.patch('/:id/stock', updateStock);

export default router;

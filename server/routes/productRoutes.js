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
import { authorize, optionalAuth, protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProductById);
router.post('/', protect, authorize('supplier', 'admin'), uploadProductImage.single('image'), createProduct);
router.put('/:id', protect, authorize('supplier', 'admin'), uploadProductImage.single('image'), updateProduct);
router.delete('/:id', protect, authorize('supplier', 'admin'), deleteProduct);
router.patch('/:id/stock', protect, authorize('admin'), updateStock);

export default router;

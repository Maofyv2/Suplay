import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';
import { authorize, protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', protect, authorize('user'), createOrder);
router.patch('/:id/status', optionalAuth, updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);

export default router;

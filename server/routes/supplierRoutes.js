import express from 'express';
import {
  getSuppliers,
  getSupplierById,
  updateSupplier,
  toggleSupplierVerification,
  deleteSupplier,
} from '../controllers/supplierController.js';

const router = express.Router();

router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.put('/:id', updateSupplier);
router.patch('/:id/verify', toggleSupplierVerification);
router.delete('/:id', deleteSupplier);

export default router;

import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  changeUserStatus,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/status', changeUserStatus);
router.delete('/:id', deleteUser);

export default router;

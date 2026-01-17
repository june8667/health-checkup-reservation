import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getAllReservations,
  updateReservationStatus,
  getAllPayments,
  getAllUsers,
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Reservations management
router.get('/reservations', getAllReservations);
router.patch('/reservations/:id/status', updateReservationStatus);

// Payments management
router.get('/payments', getAllPayments);

// Users management
router.get('/users', getAllUsers);

// Packages management
router.get('/packages', getAllPackages);
router.get('/packages/:id', getPackageById);
router.post('/packages', createPackage);
router.put('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);

export default router;

import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getAllReservations,
  updateReservationStatus,
  rescheduleReservation,
  deleteReservation,
  getAllPayments,
  getAllUsers,
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  getBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
  deleteBlockedSlotsByDate,
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
router.patch('/reservations/:id/reschedule', rescheduleReservation);
router.delete('/reservations/:id', deleteReservation);

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

// Blocked slots management (시간 차단 관리)
router.get('/blocked-slots', getBlockedSlots);
router.post('/blocked-slots', createBlockedSlot);
router.delete('/blocked-slots/:id', deleteBlockedSlot);
router.post('/blocked-slots/clear', deleteBlockedSlotsByDate);

export default router;

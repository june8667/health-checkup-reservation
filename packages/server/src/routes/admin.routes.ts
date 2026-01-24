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
  updateUser,
  deleteUser,
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  reorderPackages,
  getBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
  deleteBlockedSlotsByDate,
  backupDatabase,
  restoreDatabase,
  generateSampleData,
  generateFakeUsers,
  clearTestData,
  getAllExaminationItems,
  createExaminationItem,
  updateExaminationItem,
  deleteExaminationItem,
  reorderExaminationItems,
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
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Packages management
router.get('/packages', getAllPackages);
router.get('/packages/:id', getPackageById);
router.post('/packages', createPackage);
router.put('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);
router.post('/packages/reorder', reorderPackages);

// Examination items management (검진항목 관리)
router.get('/examination-items', getAllExaminationItems);
router.post('/examination-items', createExaminationItem);
router.put('/examination-items/:id', updateExaminationItem);
router.delete('/examination-items/:id', deleteExaminationItem);
router.post('/examination-items/reorder', reorderExaminationItems);

// Blocked slots management (시간 차단 관리)
router.get('/blocked-slots', getBlockedSlots);
router.post('/blocked-slots', createBlockedSlot);
router.delete('/blocked-slots/:id', deleteBlockedSlot);
router.post('/blocked-slots/clear', deleteBlockedSlotsByDate);

// Database management
router.get('/database/backup', backupDatabase);
router.post('/database/restore', restoreDatabase);
router.post('/database/sample-data', generateSampleData);
router.post('/database/fake-users', generateFakeUsers);
router.post('/database/clear', clearTestData);

export default router;

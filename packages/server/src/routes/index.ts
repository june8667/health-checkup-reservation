import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import packageRoutes from './package.routes';
import reservationRoutes from './reservation.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';
import { User } from '../models/User';
import { Reservation } from '../models/Reservation';
import { Payment } from '../models/Payment';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/packages', packageRoutes);
router.use('/reservations', reservationRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 테스트용: 모든 데이터 삭제
router.delete('/test/reset', async (req, res) => {
  try {
    await User.deleteMany({});
    await Reservation.deleteMany({});
    await Payment.deleteMany({});
    res.json({ success: true, message: '모든 데이터가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: '데이터 삭제에 실패했습니다.' });
  }
});

export default router;

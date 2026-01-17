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
import { Hospital } from '../models/Hospital';
import { Package } from '../models/Package';

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

// 테스트용: 샘플 데이터 생성
router.post('/test/seed', async (req, res) => {
  try {
    // 기존 병원, 패키지 삭제
    await Hospital.deleteMany({});
    await Package.deleteMany({});

    // 샘플 병원 생성
    const hospital = await Hospital.create({
      name: '건강검진센터',
      description: '최신 의료장비를 갖춘 종합 건강검진 센터입니다.',
      address: {
        zipCode: '06234',
        address1: '서울특별시 강남구 테헤란로 123',
        address2: '건강빌딩 5층',
      },
      phone: '02-1234-5678',
      email: 'info@healthcenter.com',
      businessHours: [
        { dayOfWeek: 0, openTime: '09:00', closeTime: '13:00', isHoliday: true }, // 일요일 휴무
        { dayOfWeek: 1, openTime: '08:00', closeTime: '17:00', isHoliday: false },
        { dayOfWeek: 2, openTime: '08:00', closeTime: '17:00', isHoliday: false },
        { dayOfWeek: 3, openTime: '08:00', closeTime: '17:00', isHoliday: false },
        { dayOfWeek: 4, openTime: '08:00', closeTime: '17:00', isHoliday: false },
        { dayOfWeek: 5, openTime: '08:00', closeTime: '17:00', isHoliday: false },
        { dayOfWeek: 6, openTime: '09:00', closeTime: '13:00', isHoliday: false }, // 토요일 오전만
      ],
      timeSlots: [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30',
      ],
      facilities: ['주차장', '엘리베이터', '휠체어', '수유실'],
      parkingInfo: '지하 주차장 2시간 무료',
      isActive: true,
    });

    // 샘플 패키지 생성
    const packages = await Package.insertMany([
      {
        name: '기본 건강검진',
        description: '필수 검사 항목으로 구성된 기본 건강검진 패키지입니다.',
        category: 'basic',
        items: [
          { name: '신체계측', description: '신장, 체중, 체성분 분석' },
          { name: '혈압측정', description: '혈압 및 맥박 측정' },
          { name: '혈액검사', description: '기본 혈액검사 16종' },
          { name: '소변검사', description: '소변 정밀검사' },
          { name: '흉부 X-ray', description: '흉부 방사선 촬영' },
        ],
        price: 150000,
        discountPrice: 120000,
        duration: 60,
        hospitalId: hospital._id,
        targetGender: 'all',
        availableDays: [1, 2, 3, 4, 5, 6],
        maxReservationsPerSlot: 10,
        isActive: true,
        displayOrder: 1,
        tags: ['기본', '추천'],
      },
      {
        name: '표준 건강검진',
        description: '기본 검진에 주요 암 검사가 추가된 표준 패키지입니다.',
        category: 'standard',
        items: [
          { name: '기본검진 전항목', description: '기본 건강검진 모든 항목 포함' },
          { name: '위내시경', description: '위 및 식도 내시경 검사' },
          { name: '복부 초음파', description: '간, 담낭, 췌장, 신장 검사' },
          { name: '심전도', description: '심장 기능 검사' },
          { name: '갑상선 검사', description: '갑상선 기능 및 초음파' },
        ],
        price: 350000,
        discountPrice: 300000,
        duration: 120,
        hospitalId: hospital._id,
        targetGender: 'all',
        availableDays: [1, 2, 3, 4, 5],
        maxReservationsPerSlot: 8,
        isActive: true,
        displayOrder: 2,
        tags: ['인기', '추천'],
      },
      {
        name: '프리미엄 종합검진',
        description: '전신 정밀검사가 포함된 프리미엄 종합검진 패키지입니다.',
        category: 'premium',
        items: [
          { name: '표준검진 전항목', description: '표준 건강검진 모든 항목 포함' },
          { name: 'CT 검사', description: '흉부/복부 CT' },
          { name: 'MRI 검사', description: '뇌 MRI 또는 척추 MRI 선택' },
          { name: '대장내시경', description: '대장 정밀 내시경' },
          { name: '종양표지자 검사', description: '주요 암 표지자 검사' },
          { name: '골밀도 검사', description: '골다공증 검사' },
        ],
        price: 800000,
        discountPrice: 700000,
        duration: 240,
        hospitalId: hospital._id,
        targetGender: 'all',
        availableDays: [1, 2, 3, 4, 5],
        maxReservationsPerSlot: 5,
        isActive: true,
        displayOrder: 3,
        tags: ['프리미엄', 'VIP'],
      },
      {
        name: '여성 특화검진',
        description: '여성 건강에 특화된 검진 패키지입니다.',
        category: 'specialized',
        items: [
          { name: '기본검진 전항목', description: '기본 건강검진 모든 항목 포함' },
          { name: '유방 촬영', description: '유방 X-ray 촬영' },
          { name: '유방 초음파', description: '유방 정밀 초음파' },
          { name: '자궁경부 검사', description: '자궁경부암 검사' },
          { name: '난소 초음파', description: '난소 및 자궁 초음파' },
          { name: '여성호르몬 검사', description: '에스트로겐 등 호르몬 검사' },
        ],
        price: 450000,
        discountPrice: 380000,
        duration: 150,
        hospitalId: hospital._id,
        targetGender: 'female',
        availableDays: [1, 2, 3, 4, 5],
        maxReservationsPerSlot: 6,
        isActive: true,
        displayOrder: 4,
        tags: ['여성', '특화'],
      },
    ]);

    res.json({
      success: true,
      message: '샘플 데이터가 생성되었습니다.',
      data: {
        hospital: { _id: hospital._id, name: hospital.name },
        packages: packages.map(p => ({ _id: p._id, name: p.name })),
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: '샘플 데이터 생성에 실패했습니다.' });
  }
});

export default router;

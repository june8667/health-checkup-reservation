import { Router } from 'express';
import bcrypt from 'bcryptjs';
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
import { generateAccessToken } from '../utils/jwt';

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
        { dayOfWeek: 0, openTime: '10:00', closeTime: '13:00', isHoliday: true }, // 일요일 휴무
        { dayOfWeek: 1, openTime: '10:00', closeTime: '18:00', isHoliday: false },
        { dayOfWeek: 2, openTime: '10:00', closeTime: '18:00', isHoliday: false },
        { dayOfWeek: 3, openTime: '10:00', closeTime: '18:00', isHoliday: false },
        { dayOfWeek: 4, openTime: '10:00', closeTime: '18:00', isHoliday: false },
        { dayOfWeek: 5, openTime: '10:00', closeTime: '18:00', isHoliday: false },
        { dayOfWeek: 6, openTime: '10:00', closeTime: '13:00', isHoliday: false }, // 토요일 오전만
      ],
      timeSlots: [
        '10:00', '10:30', '11:00', '11:30',
        '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
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

// 테스트용: 가짜 회원 1000명 생성
router.post('/test/fake-users', async (req, res) => {
  try {
    const count = req.body.count || 1000;
    const hashedPassword = await bcrypt.hash('test1234', 10);

    // 한국 이름 생성용 데이터
    const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
    const firstNamesMale = ['민준', '서준', '도윤', '예준', '시우', '주원', '하준', '지호', '준서', '준우', '현우', '지훈', '도현', '건우', '우진', '민재', '현준', '선우', '서진', '연우'];
    const firstNamesFemale = ['서윤', '서연', '지우', '하윤', '하은', '민서', '지유', '윤서', '채원', '수아', '지아', '다은', '예은', '수빈', '지민', '채은', '유진', '소윤', '예린', '시은'];

    const users = [];
    const existingEmails = new Set((await User.find({}, 'email')).map(u => u.email));

    for (let i = 0; i < count; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const firstName = gender === 'male'
        ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
        : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
      const name = lastName + firstName;

      // 고유한 이메일 생성
      let email;
      let attempts = 0;
      do {
        const randomNum = Math.floor(Math.random() * 100000);
        email = `fake${i}_${randomNum}@test.com`;
        attempts++;
      } while (existingEmails.has(email) && attempts < 10);

      existingEmails.add(email);

      // 랜덤 생년월일 (1960~2005년)
      const year = 1960 + Math.floor(Math.random() * 45);
      const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
      const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
      const birthDate = `${year}-${month}-${day}`;

      // 랜덤 전화번호
      const phone = `010${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;

      users.push({
        email,
        password: hashedPassword,
        name,
        phone,
        birthDate,
        gender,
        role: 'user',
        isPhoneVerified: true,
        marketingConsent: Math.random() > 0.5,
      });
    }

    // 배치로 삽입 (100개씩)
    const batchSize = 100;
    let inserted = 0;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await User.insertMany(batch, { ordered: false }).catch(() => {});
      inserted += batch.length;
    }

    res.json({
      success: true,
      message: `가짜 회원 ${count}명이 생성되었습니다.`,
      data: { count: inserted },
    });
  } catch (error) {
    console.error('Fake users error:', error);
    res.status(500).json({ success: false, message: '가짜 회원 생성에 실패했습니다.' });
  }
});

// 테스트용: 랜덤 관리자로 로그인
router.post('/test/login-admin', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(404).json({ success: false, message: '관리자 계정이 없습니다.' });
    }

    const accessToken = generateAccessToken(admin);

    admin.lastLoginAt = new Date();
    await admin.save();

    res.json({
      success: true,
      message: '관리자로 로그인되었습니다.',
      data: {
        user: {
          _id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error('Test admin login error:', error);
    res.status(500).json({ success: false, message: '로그인에 실패했습니다.' });
  }
});

// 테스트용: 랜덤 일반회원으로 로그인
router.post('/test/login-user', async (req, res) => {
  try {
    // 관리자가 아닌 일반 회원 중 랜덤 선택
    const count = await User.countDocuments({ role: 'user' });
    if (count === 0) {
      return res.status(404).json({ success: false, message: '일반 회원이 없습니다.' });
    }

    const randomIndex = Math.floor(Math.random() * count);
    const user = await User.findOne({ role: 'user' }).skip(randomIndex);

    if (!user) {
      return res.status(404).json({ success: false, message: '회원을 찾을 수 없습니다.' });
    }

    const accessToken = generateAccessToken(user);

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: `${user.name}(으)로 로그인되었습니다.`,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error('Test user login error:', error);
    res.status(500).json({ success: false, message: '로그인에 실패했습니다.' });
  }
});

export default router;

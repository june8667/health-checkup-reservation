import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';
import { Reservation } from '../models/Reservation';
import { Payment } from '../models/Payment';
import { Package } from '../models/Package';
import { Hospital } from '../models/Hospital';
import { BlockedSlot } from '../models/BlockedSlot';
import { ExaminationItem } from '../models/ExaminationItem';

const adminService = new AdminService();

export async function getDashboardStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await adminService.getDashboardStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllReservations(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, status, startDate, endDate, search } = req.query;

    const result = await adminService.getAllReservations(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      {
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        search: search as string,
      }
    );

    res.json({
      success: true,
      data: {
        items: result.reservations,
        total: result.total,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        totalPages: Math.ceil(result.total / (limit ? Number(limit) : 20)),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReservationStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status, memo } = req.body;

    const reservation = await adminService.updateReservationStatus(id, status, memo);

    res.json({
      success: true,
      message: '예약 상태가 업데이트되었습니다.',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
}

export async function rescheduleReservation(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      res.status(400).json({
        success: false,
        message: '날짜와 시간을 입력해주세요.',
      });
      return;
    }

    const reservation = await adminService.rescheduleReservation(
      id,
      new Date(date),
      time
    );

    if (!reservation) {
      res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다.',
      });
      return;
    }

    res.json({
      success: true,
      message: '예약 일정이 변경되었습니다.',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReservation(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await adminService.deleteReservation(id);

    res.json({
      success: true,
      message: '예약이 삭제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllPayments(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, status, startDate, endDate, search } = req.query;

    const result = await adminService.getAllPayments(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      {
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        search: search as string,
      }
    );

    res.json({
      success: true,
      data: {
        items: result.payments,
        total: result.total,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        totalPages: Math.ceil(result.total / (limit ? Number(limit) : 20)),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, search, role } = req.query;

    const result = await adminService.getAllUsers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      {
        search: search as string,
        role: role as string,
      }
    );

    res.json({
      success: true,
      data: {
        items: result.users,
        total: result.total,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        totalPages: Math.ceil(result.total / (limit ? Number(limit) : 20)),
      },
    });
  } catch (error) {
    next(error);
  }
}

// 사용자 관리
export async function updateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { name, phone, birthDate, gender, role, isVerified, marketingConsent } = req.body;

    const user = await adminService.updateUser(id, {
      name,
      phone,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      gender,
      role,
      isVerified,
      marketingConsent,
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: '회원을 찾을 수 없습니다.',
      });
      return;
    }

    res.json({
      success: true,
      message: '회원 정보가 수정되었습니다.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await adminService.deleteUser(id);

    res.json({
      success: true,
      message: '회원이 삭제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
}

// 패키지 관리
export async function getAllPackages(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, search, category, isActive } = req.query;

    const result = await adminService.getAllPackages(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      {
        search: search as string,
        category: category as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      }
    );

    res.json({
      success: true,
      data: {
        items: result.packages,
        total: result.total,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        totalPages: Math.ceil(result.total / (limit ? Number(limit) : 20)),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPackageById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const pkg = await adminService.getPackageById(id);

    if (!pkg) {
      res.status(404).json({
        success: false,
        message: '패키지를 찾을 수 없습니다.',
      });
      return;
    }

    res.json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
}

export async function createPackage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pkg = await adminService.createPackage(req.body);

    res.status(201).json({
      success: true,
      message: '패키지가 등록되었습니다.',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePackage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const pkg = await adminService.updatePackage(id, req.body);

    if (!pkg) {
      res.status(404).json({
        success: false,
        message: '패키지를 찾을 수 없습니다.',
      });
      return;
    }

    res.json({
      success: true,
      message: '패키지가 수정되었습니다.',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePackage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await adminService.deletePackage(id);

    res.json({
      success: true,
      message: '패키지가 삭제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
}

export async function reorderPackages(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      res.status(400).json({
        success: false,
        message: '잘못된 요청 형식입니다.',
      });
      return;
    }

    const bulkOps = items.map((item: { id: string; displayOrder: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await Package.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: '순서가 변경되었습니다.',
    });
  } catch (error) {
    next(error);
  }
}

// 차단된 시간 관리
export async function getBlockedSlots(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { startDate, endDate, packageId } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: '시작일과 종료일을 입력해주세요.',
      });
      return;
    }

    const slots = await adminService.getBlockedSlots(
      new Date(startDate as string),
      new Date(endDate as string),
      packageId as string
    );

    res.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
}

export async function createBlockedSlot(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date, time, times, packageId, reason } = req.body;

    if (!date) {
      res.status(400).json({
        success: false,
        message: '날짜를 입력해주세요.',
      });
      return;
    }

    // 여러 시간 한번에 차단
    if (times && Array.isArray(times)) {
      const slots = await adminService.bulkCreateBlockedSlots(
        new Date(date),
        times,
        req.user!.userId,
        packageId,
        reason
      );
      res.status(201).json({
        success: true,
        message: '시간이 차단되었습니다.',
        data: slots,
      });
      return;
    }

    // 단일 시간 차단
    if (!time) {
      res.status(400).json({
        success: false,
        message: '시간을 입력해주세요.',
      });
      return;
    }

    const slot = await adminService.createBlockedSlot(
      new Date(date),
      time,
      req.user!.userId,
      packageId,
      reason
    );

    res.status(201).json({
      success: true,
      message: '시간이 차단되었습니다.',
      data: slot,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBlockedSlot(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await adminService.deleteBlockedSlot(id);

    res.json({
      success: true,
      message: '차단이 해제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBlockedSlotsByDate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date, packageId } = req.body;

    if (!date) {
      res.status(400).json({
        success: false,
        message: '날짜를 입력해주세요.',
      });
      return;
    }

    await adminService.deleteBlockedSlotsByDate(new Date(date), packageId);

    res.json({
      success: true,
      message: '해당 날짜의 차단이 모두 해제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
}

// 샘플 데이터 생성
export async function generateSampleData(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let createdItemsCount = 0;
    let createdPackagesCount = 0;
    let createdReservationsCount = 0;

    // 1. 샘플 검진항목 생성 (없는 경우)
    const existingItems = await ExaminationItem.countDocuments();
    if (existingItems === 0) {
      const sampleExaminationItems = [
        { name: '신체계측', description: '신장, 체중, 체질량지수(BMI), 혈압, 맥박 측정', price: 10000, category: '기본검사', displayOrder: 1 },
        { name: '시력/청력검사', description: '시력, 색각, 청력 측정', price: 15000, category: '기본검사', displayOrder: 2 },
        { name: '혈액검사(일반)', description: 'CBC, 빈혈, 백혈구, 혈소판 검사', price: 30000, category: '혈액검사', displayOrder: 3 },
        { name: '혈액검사(간기능)', description: 'AST, ALT, GGT, 빌리루빈, 알부민', price: 35000, category: '혈액검사', displayOrder: 4 },
        { name: '혈액검사(신장기능)', description: 'BUN, 크레아티닌, 요산', price: 25000, category: '혈액검사', displayOrder: 5 },
        { name: '혈액검사(당뇨)', description: '공복혈당, 당화혈색소(HbA1c)', price: 20000, category: '혈액검사', displayOrder: 6 },
        { name: '혈액검사(지질)', description: '총콜레스테롤, HDL, LDL, 중성지방', price: 25000, category: '혈액검사', displayOrder: 7 },
        { name: '갑상선기능검사', description: 'TSH, Free T4', price: 40000, category: '혈액검사', displayOrder: 8 },
        { name: '소변검사', description: '요단백, 요당, 요잠혈, pH', price: 15000, category: '기본검사', displayOrder: 9 },
        { name: '흉부 X-ray', description: '폐결핵, 폐암, 심장비대 확인', price: 30000, category: '영상검사', displayOrder: 10 },
        { name: '심전도검사', description: '부정맥, 허혈성 심장질환 확인', price: 25000, category: '심혈관검사', displayOrder: 11 },
        { name: '복부 초음파', description: '간, 담낭, 췌장, 신장, 비장 검사', price: 80000, category: '영상검사', displayOrder: 12 },
        { name: '위내시경', description: '식도, 위, 십이지장 검사 (수면비 별도)', price: 100000, category: '내시경검사', displayOrder: 13 },
        { name: '대장내시경', description: '대장, 직장 검사 (수면비 별도)', price: 150000, category: '내시경검사', displayOrder: 14 },
        { name: '유방 초음파', description: '유방암, 유방 질환 검사 (여성)', price: 80000, category: '영상검사', displayOrder: 15 },
        { name: '유방 X-ray', description: '유방촬영술 (여성)', price: 50000, category: '영상검사', displayOrder: 16 },
        { name: '자궁경부암검사', description: 'Pap smear (여성)', price: 30000, category: '여성검사', displayOrder: 17 },
        { name: '전립선검사', description: 'PSA 검사 (남성)', price: 30000, category: '남성검사', displayOrder: 18 },
        { name: '골밀도검사', description: '골다공증 검사', price: 50000, category: '영상검사', displayOrder: 19 },
        { name: '경동맥 초음파', description: '동맥경화, 협착 확인', price: 70000, category: '심혈관검사', displayOrder: 20 },
      ];

      await ExaminationItem.insertMany(sampleExaminationItems);
      createdItemsCount = sampleExaminationItems.length;
    }

    // 검진항목 조회
    const allItems = await ExaminationItem.find({ isActive: true });

    // 2. 국가건강검진 1차 패키지 확인 및 생성
    const nationalPackageExists = await Package.findOne({ name: '국가건강검진 1차' });
    if (!nationalPackageExists && allItems.length > 0) {
      const selectItemsForNational = (names: string[]) => {
        return allItems
          .filter(item => names.includes(item.name))
          .map(item => ({ name: item.name, description: item.description, price: item.price }));
      };
      const nationalHealthItems = selectItemsForNational(['신체계측', '시력/청력검사', '혈액검사(일반)', '혈액검사(간기능)', '혈액검사(당뇨)', '혈액검사(지질)', '소변검사', '흉부 X-ray']);

      await Package.create({
        name: '국가건강검진 1차',
        description: '국민건강보험공단에서 제공하는 기본 건강검진 프로그램입니다. 만 20세 이상 건강보험 가입자라면 2년마다 무료로 받을 수 있습니다.',
        category: 'basic',
        items: nationalHealthItems,
        price: 0,
        discountPrice: 0,
        duration: 30,
        targetGender: 'all',
        availableDays: [1, 2, 3, 4, 5],
        maxReservationsPerSlot: 30,
        isActive: true,
        displayOrder: 0,
        tags: ['국가검진', '무료', '추천'],
      });
      createdPackagesCount++;
    }

    // 국가5대암검진 패키지 확인 및 생성
    const cancerScreeningExists = await Package.findOne({ name: '국가5대암검진' });
    if (!cancerScreeningExists && allItems.length > 0) {
      const selectItemsForCancer = (names: string[]) => {
        return allItems
          .filter(item => names.includes(item.name))
          .map(item => ({ name: item.name, description: item.description, price: item.price }));
      };
      const cancerScreeningItems = selectItemsForCancer(['위내시경', '대장내시경', '복부 초음파', '유방 초음파', '유방 X-ray', '자궁경부암검사']);

      await Package.create({
        name: '국가5대암검진',
        description: '국민건강보험공단에서 지원하는 5대암(위암, 대장암, 간암, 유방암, 자궁경부암) 검진 프로그램입니다. 연령 및 성별에 따라 무료로 받을 수 있습니다.',
        category: 'basic',
        items: cancerScreeningItems,
        price: 0,
        discountPrice: 0,
        duration: 120,
        targetGender: 'all',
        availableDays: [1, 2, 3, 4, 5],
        maxReservationsPerSlot: 15,
        isActive: true,
        displayOrder: 1,
        tags: ['국가검진', '무료', '암검진'],
      });
      createdPackagesCount++;
    }

    // 3. 기타 샘플 패키지 생성 (없는 경우)
    const existingPackages = await Package.countDocuments();
    if (existingPackages <= 1 && allItems.length > 0) {
      // 항목 선택 헬퍼 함수
      const selectItems = (names: string[]) => {
        return allItems
          .filter(item => names.includes(item.name))
          .map(item => ({ name: item.name, description: item.description, price: item.price }));
      };

      const calculatePrice = (items: { price: number }[]) => {
        return items.reduce((sum, item) => sum + item.price, 0);
      };

      // 기본검진 패키지
      const basicItems = selectItems(['신체계측', '시력/청력검사', '혈액검사(일반)', '소변검사', '흉부 X-ray']);
      const basicPrice = calculatePrice(basicItems);

      // 표준검진 패키지
      const standardItems = selectItems([
        '신체계측', '시력/청력검사', '혈액검사(일반)', '혈액검사(간기능)',
        '혈액검사(신장기능)', '혈액검사(당뇨)', '혈액검사(지질)',
        '소변검사', '흉부 X-ray', '심전도검사', '복부 초음파'
      ]);
      const standardPrice = calculatePrice(standardItems);

      // 프리미엄검진 패키지
      const premiumItems = selectItems([
        '신체계측', '시력/청력검사', '혈액검사(일반)', '혈액검사(간기능)',
        '혈액검사(신장기능)', '혈액검사(당뇨)', '혈액검사(지질)', '갑상선기능검사',
        '소변검사', '흉부 X-ray', '심전도검사', '복부 초음파', '위내시경',
        '골밀도검사', '경동맥 초음파'
      ]);
      const premiumPrice = calculatePrice(premiumItems);

      // 종합검진 패키지 (대장내시경 포함)
      const comprehensiveItems = selectItems([
        '신체계측', '시력/청력검사', '혈액검사(일반)', '혈액검사(간기능)',
        '혈액검사(신장기능)', '혈액검사(당뇨)', '혈액검사(지질)', '갑상선기능검사',
        '소변검사', '흉부 X-ray', '심전도검사', '복부 초음파', '위내시경',
        '대장내시경', '골밀도검사', '경동맥 초음파'
      ]);
      const comprehensivePrice = calculatePrice(comprehensiveItems);

      // 여성 전용 패키지
      const femaleItems = selectItems([
        '신체계측', '시력/청력검사', '혈액검사(일반)', '혈액검사(간기능)',
        '혈액검사(당뇨)', '혈액검사(지질)', '갑상선기능검사',
        '소변검사', '흉부 X-ray', '심전도검사', '복부 초음파', '위내시경',
        '유방 초음파', '유방 X-ray', '자궁경부암검사', '골밀도검사'
      ]);
      const femalePrice = calculatePrice(femaleItems);

      // 남성 전용 패키지
      const maleItems = selectItems([
        '신체계측', '시력/청력검사', '혈액검사(일반)', '혈액검사(간기능)',
        '혈액검사(당뇨)', '혈액검사(지질)', '갑상선기능검사',
        '소변검사', '흉부 X-ray', '심전도검사', '복부 초음파', '위내시경',
        '전립선검사', '경동맥 초음파'
      ]);
      const malePrice = calculatePrice(maleItems);

      const samplePackages = [
        {
          name: '기본 건강검진',
          description: '필수 항목으로 구성된 기본 건강검진 패키지입니다. 건강 상태를 빠르게 확인할 수 있습니다.',
          category: 'basic',
          items: basicItems,
          price: basicPrice,
          discountPrice: Math.round(basicPrice * 0.9),
          duration: 60,
          targetGender: 'all',
          availableDays: [1, 2, 3, 4, 5],
          maxReservationsPerSlot: 20,
          isActive: true,
          displayOrder: 1,
          tags: ['추천', '빠른검진'],
        },
        {
          name: '표준 건강검진',
          description: '혈액검사와 영상검사를 포함한 표준 건강검진 패키지입니다.',
          category: 'standard',
          items: standardItems,
          price: standardPrice,
          discountPrice: Math.round(standardPrice * 0.85),
          duration: 120,
          targetGender: 'all',
          availableDays: [1, 2, 3, 4, 5],
          maxReservationsPerSlot: 15,
          isActive: true,
          displayOrder: 2,
          tags: ['인기', '추천'],
        },
        {
          name: '프리미엄 건강검진',
          description: '위내시경을 포함한 정밀 건강검진 패키지입니다. 주요 암과 성인병을 조기에 발견할 수 있습니다.',
          category: 'premium',
          items: premiumItems,
          price: premiumPrice,
          discountPrice: Math.round(premiumPrice * 0.8),
          duration: 180,
          targetGender: 'all',
          availableDays: [1, 2, 3, 4, 5],
          maxReservationsPerSlot: 10,
          isActive: true,
          displayOrder: 3,
          tags: ['프리미엄', '정밀검진'],
        },
        {
          name: '종합 건강검진',
          description: '위/대장내시경을 포함한 가장 포괄적인 건강검진 패키지입니다.',
          category: 'premium',
          items: comprehensiveItems,
          price: comprehensivePrice,
          discountPrice: Math.round(comprehensivePrice * 0.75),
          duration: 240,
          targetGender: 'all',
          availableDays: [1, 2, 3, 4, 5],
          maxReservationsPerSlot: 8,
          isActive: true,
          displayOrder: 4,
          tags: ['종합', '내시경'],
        },
        {
          name: '여성 정밀 건강검진',
          description: '여성 특화 검사를 포함한 프리미엄 건강검진 패키지입니다.',
          category: 'specialized',
          items: femaleItems,
          price: femalePrice,
          discountPrice: Math.round(femalePrice * 0.8),
          duration: 180,
          targetGender: 'female',
          availableDays: [1, 2, 3, 4, 5],
          maxReservationsPerSlot: 10,
          isActive: true,
          displayOrder: 5,
          tags: ['여성전용', '유방검사'],
        },
        {
          name: '남성 정밀 건강검진',
          description: '남성 특화 검사를 포함한 프리미엄 건강검진 패키지입니다.',
          category: 'specialized',
          items: maleItems,
          price: malePrice,
          discountPrice: Math.round(malePrice * 0.8),
          duration: 180,
          targetGender: 'male',
          availableDays: [1, 2, 3, 4, 5],
          maxReservationsPerSlot: 10,
          isActive: true,
          displayOrder: 6,
          tags: ['남성전용', '전립선검사'],
        },
      ];

      await Package.insertMany(samplePackages);
      createdPackagesCount = samplePackages.length;
    }

    // 3. 샘플 예약 데이터 생성
    const users = await User.find({ role: 'user' }).limit(10);
    const packages = await Package.find({ isActive: true });

    if (users.length > 0 && packages.length > 0) {
      const sampleReservations = [];
      const now = new Date();

      for (let i = 0; i < 20; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const pkg = packages[Math.floor(Math.random() * packages.length)];
        const daysOffset = Math.floor(Math.random() * 30) - 15;
        const reservationDate = new Date(now);
        reservationDate.setDate(reservationDate.getDate() + daysOffset);

        const times = ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00'];
        const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

        sampleReservations.push({
          reservationNumber: `R${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          userId: user._id,
          packageId: pkg._id,
          hospitalId: pkg.hospitalId,
          reservationDate,
          reservationTime: times[Math.floor(Math.random() * times.length)],
          patientInfo: {
            name: user.name,
            phone: user.phone,
            birthDate: user.birthDate,
            gender: user.gender,
          },
          totalAmount: pkg.price,
          discountAmount: pkg.discountPrice ? pkg.price - pkg.discountPrice : 0,
          finalAmount: pkg.discountPrice || pkg.price,
          status: statuses[Math.floor(Math.random() * statuses.length)],
        });
      }

      await Reservation.insertMany(sampleReservations);
      createdReservationsCount = sampleReservations.length;
    }

    const messages = [];
    if (createdItemsCount > 0) messages.push(`검진항목 ${createdItemsCount}개`);
    if (createdPackagesCount > 0) messages.push(`패키지 ${createdPackagesCount}개`);
    if (createdReservationsCount > 0) messages.push(`예약 ${createdReservationsCount}건`);

    if (messages.length === 0) {
      res.json({
        success: true,
        message: '이미 샘플 데이터가 존재합니다. 새로운 예약 데이터만 생성하려면 회원이 필요합니다.',
      });
      return;
    }

    res.json({
      success: true,
      message: `샘플 데이터가 생성되었습니다: ${messages.join(', ')}`,
    });
  } catch (error) {
    next(error);
  }
}

// 가짜 회원 생성
export async function generateFakeUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const count = parseInt(req.body.count) || 1000;
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const koreanLastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
    const koreanFirstNames = ['민준', '서연', '예준', '서윤', '도윤', '지우', '시우', '하윤', '주원', '지호'];

    const fakeUsers = [];
    for (let i = 0; i < count; i++) {
      const lastName = koreanLastNames[Math.floor(Math.random() * koreanLastNames.length)];
      const firstName = koreanFirstNames[Math.floor(Math.random() * koreanFirstNames.length)];
      const name = lastName + firstName;

      const birthYear = 1950 + Math.floor(Math.random() * 50);
      const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');

      fakeUsers.push({
        email: `fake${Date.now()}${i}@test.com`,
        password: hashedPassword,
        name,
        phone: `010${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        birthDate: new Date(`${birthYear}-${birthMonth}-${birthDay}`),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        role: 'user',
        isVerified: true,
        marketingConsent: Math.random() > 0.5,
      });
    }

    await User.insertMany(fakeUsers);

    res.json({
      success: true,
      message: `가짜 회원 ${count}명이 생성되었습니다.`,
    });
  } catch (error) {
    next(error);
  }
}

// 데이터 삭제 (테스트 데이터만)
export async function clearTestData(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { target } = req.body;

    let message = '';

    if (target === 'users' || target === 'all') {
      // fake 이메일을 가진 사용자만 삭제
      const result = await User.deleteMany({ email: { $regex: /^fake.*@test\.com$/ } });
      message += `가짜 회원 ${result.deletedCount}명 삭제. `;
    }

    if (target === 'reservations' || target === 'all') {
      const result = await Reservation.deleteMany({});
      message += `예약 ${result.deletedCount}건 삭제. `;
    }

    if (target === 'payments' || target === 'all') {
      const result = await Payment.deleteMany({});
      message += `결제 ${result.deletedCount}건 삭제. `;
    }

    res.json({
      success: true,
      message: message || '삭제된 데이터가 없습니다.',
    });
  } catch (error) {
    next(error);
  }
}

// Database backup
export async function backupDatabase(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { type } = req.query;
    const dateStr = new Date().toISOString().slice(0, 10);

    let backup: any;
    let filename: string;

    if (type === 'config') {
      // 설정 데이터만 백업 (병원, 패키지, 검진항목)
      const [packages, hospitals, examinationItems] = await Promise.all([
        Package.find().lean(),
        Hospital.find().lean(),
        ExaminationItem.find().lean(),
      ]);

      backup = {
        exportedAt: new Date().toISOString(),
        backupType: 'config',
        description: '설정 데이터 (병원, 패키지, 검진항목)',
        collections: {
          hospitals,
          packages,
          examinationItems,
        },
      };
      filename = `backup-config-${dateStr}.json`;

    } else if (type === 'operations') {
      // 운영 데이터만 백업 (회원, 예약, 결제, 차단슬롯)
      const [users, reservations, payments, blockedSlots] = await Promise.all([
        User.find().lean(),
        Reservation.find().lean(),
        Payment.find().lean(),
        BlockedSlot.find().lean(),
      ]);

      backup = {
        exportedAt: new Date().toISOString(),
        backupType: 'operations',
        description: '운영 데이터 (회원, 예약, 결제, 차단슬롯)',
        collections: {
          users,
          reservations,
          payments,
          blockedSlots,
        },
      };
      filename = `backup-operations-${dateStr}.json`;

    } else {
      // 전체 백업
      const [users, reservations, payments, packages, hospitals, blockedSlots, examinationItems] = await Promise.all([
        User.find().lean(),
        Reservation.find().lean(),
        Payment.find().lean(),
        Package.find().lean(),
        Hospital.find().lean(),
        BlockedSlot.find().lean(),
        ExaminationItem.find().lean(),
      ]);

      backup = {
        exportedAt: new Date().toISOString(),
        backupType: 'all',
        description: '전체 데이터',
        collections: {
          users,
          reservations,
          payments,
          packages,
          hospitals,
          blockedSlots,
          examinationItems,
        },
      };
      filename = `backup-all-${dateStr}.json`;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (error) {
    next(error);
  }
}

// Database restore
export async function restoreDatabase(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { backupData } = req.body;

    if (!backupData || !backupData.collections) {
      res.status(400).json({
        success: false,
        message: '유효하지 않은 백업 파일입니다.',
      });
      return;
    }

    const { collections, backupType } = backupData;
    const restoredCollections: string[] = [];

    // 설정 데이터 복원
    if (collections.hospitals) {
      await Hospital.deleteMany({});
      if (collections.hospitals.length > 0) {
        await Hospital.insertMany(collections.hospitals);
      }
      restoredCollections.push(`병원 ${collections.hospitals.length}개`);
    }

    if (collections.packages) {
      await Package.deleteMany({});
      if (collections.packages.length > 0) {
        await Package.insertMany(collections.packages);
      }
      restoredCollections.push(`패키지 ${collections.packages.length}개`);
    }

    if (collections.examinationItems) {
      await ExaminationItem.deleteMany({});
      if (collections.examinationItems.length > 0) {
        await ExaminationItem.insertMany(collections.examinationItems);
      }
      restoredCollections.push(`검진항목 ${collections.examinationItems.length}개`);
    }

    // 운영 데이터 복원
    if (collections.users) {
      await User.deleteMany({});
      if (collections.users.length > 0) {
        await User.insertMany(collections.users);
      }
      restoredCollections.push(`회원 ${collections.users.length}명`);
    }

    if (collections.reservations) {
      await Reservation.deleteMany({});
      if (collections.reservations.length > 0) {
        await Reservation.insertMany(collections.reservations);
      }
      restoredCollections.push(`예약 ${collections.reservations.length}건`);
    }

    if (collections.payments) {
      await Payment.deleteMany({});
      if (collections.payments.length > 0) {
        await Payment.insertMany(collections.payments);
      }
      restoredCollections.push(`결제 ${collections.payments.length}건`);
    }

    if (collections.blockedSlots) {
      await BlockedSlot.deleteMany({});
      if (collections.blockedSlots.length > 0) {
        await BlockedSlot.insertMany(collections.blockedSlots);
      }
      restoredCollections.push(`차단슬롯 ${collections.blockedSlots.length}개`);
    }

    res.json({
      success: true,
      message: `데이터가 복원되었습니다: ${restoredCollections.join(', ')}`,
      backupType: backupType || 'unknown',
      restoredCollections,
    });
  } catch (error) {
    next(error);
  }
}

// 검진항목 관리
export async function getAllExaminationItems(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { search, isActive } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const items = await ExaminationItem.find(query).sort({ displayOrder: 1, name: 1 });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
}

export async function createExaminationItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, description, price, category, isActive, displayOrder } = req.body;

    const item = new ExaminationItem({
      name,
      description,
      price: price || 0,
      category,
      isActive: isActive !== false,
      displayOrder: displayOrder || 0,
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: '검진항목이 등록되었습니다.',
      data: item,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: '이미 존재하는 검진항목 이름입니다.',
      });
      return;
    }
    next(error);
  }
}

export async function updateExaminationItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, price, category, isActive, displayOrder } = req.body;

    const item = await ExaminationItem.findByIdAndUpdate(
      id,
      { name, description, price, category, isActive, displayOrder },
      { new: true, runValidators: true }
    );

    if (!item) {
      res.status(404).json({
        success: false,
        message: '검진항목을 찾을 수 없습니다.',
      });
      return;
    }

    res.json({
      success: true,
      message: '검진항목이 수정되었습니다.',
      data: item,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: '이미 존재하는 검진항목 이름입니다.',
      });
      return;
    }
    next(error);
  }
}

export async function deleteExaminationItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const item = await ExaminationItem.findByIdAndDelete(id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: '검진항목을 찾을 수 없습니다.',
      });
      return;
    }

    res.json({
      success: true,
      message: '검진항목이 삭제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
}

export async function reorderExaminationItems(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      res.status(400).json({
        success: false,
        message: '잘못된 요청 형식입니다.',
      });
      return;
    }

    const bulkOps = items.map((item: { id: string; displayOrder: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await ExaminationItem.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: '순서가 변경되었습니다.',
    });
  } catch (error) {
    next(error);
  }
}

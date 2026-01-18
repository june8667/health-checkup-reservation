import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';
import { Reservation } from '../models/Reservation';
import { Payment } from '../models/Payment';
import { Package } from '../models/Package';
import { Hospital } from '../models/Hospital';
import { BlockedSlot } from '../models/BlockedSlot';

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
    // 샘플 패키지와 병원 데이터는 이미 seed에서 처리되므로
    // 여기서는 샘플 예약 데이터를 생성합니다
    const users = await User.find({ role: 'user' }).limit(10);
    const packages = await Package.find({ isActive: true });

    if (users.length === 0 || packages.length === 0) {
      res.status(400).json({
        success: false,
        message: '샘플 데이터 생성을 위한 기본 데이터가 없습니다.',
      });
      return;
    }

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

    res.json({
      success: true,
      message: `샘플 예약 데이터 ${sampleReservations.length}건이 생성되었습니다.`,
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
    const [users, reservations, payments, packages, hospitals, blockedSlots] = await Promise.all([
      User.find().lean(),
      Reservation.find().lean(),
      Payment.find().lean(),
      Package.find().lean(),
      Hospital.find().lean(),
      BlockedSlot.find().lean(),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      collections: {
        users,
        reservations,
        payments,
        packages,
        hospitals,
        blockedSlots,
      },
    };

    const filename = `db-backup-${new Date().toISOString().slice(0, 10)}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (error) {
    next(error);
  }
}

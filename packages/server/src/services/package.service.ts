import { Package, IPackage } from '../models/Package';
import { Hospital } from '../models/Hospital';
import { Reservation } from '../models/Reservation';
import { BlockedSlot } from '../models/BlockedSlot';
import { AppError } from '../middleware/error.middleware';
import { startOfDay, endOfDay, format } from 'date-fns';

interface PackageQuery {
  category?: string;
  targetGender?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export class PackageService {
  async findAll(query: PackageQuery): Promise<{ packages: IPackage[]; total: number }> {
    const {
      category,
      targetGender,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = query;

    const filter: any = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (targetGender && targetGender !== 'all') {
      filter.$or = [
        { targetGender: targetGender },
        { targetGender: 'all' },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.$or = filter.$or || [];
      const priceCondition: any = {};
      if (minPrice !== undefined) priceCondition.$gte = minPrice;
      if (maxPrice !== undefined) priceCondition.$lte = maxPrice;

      filter.$and = [
        {
          $or: [
            { discountPrice: priceCondition },
            { $and: [{ discountPrice: { $exists: false } }, { price: priceCondition }] },
          ],
        },
      ];
    }

    const [packages, total] = await Promise.all([
      Package.find(filter)
        .populate('hospitalId', 'name address phone')
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Package.countDocuments(filter),
    ]);

    return { packages, total };
  }

  async findById(id: string): Promise<IPackage> {
    const pkg = await Package.findById(id).populate(
      'hospitalId',
      'name description address phone businessHours timeSlots facilities parkingInfo'
    );

    if (!pkg) {
      throw new AppError('패키지를 찾을 수 없습니다.', 404);
    }

    return pkg;
  }

  async getAvailableSlots(
    packageId: string,
    date: Date
  ): Promise<{ time: string; available: boolean; remainingSlots: number }[]> {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      throw new AppError('패키지를 찾을 수 없습니다.', 404);
    }

    // 기본 시간 슬롯 생성 (10:00 ~ 18:00, 30분 단위, 점심시간 12:00~13:00 제외)
    const defaultTimeSlots = [
      '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30',
    ];

    // 일요일(0)은 휴무
    const dayOfWeek = date.getUTCDay();
    if (dayOfWeek === 0) {
      return defaultTimeSlots.map(time => ({
        time,
        available: false,
        remainingSlots: 0,
      }));
    }

    // 해당 날짜의 기존 예약 조회
    const [existingReservations, blockedSlots] = await Promise.all([
      Reservation.find({
        packageId,
        reservationDate: {
          $gte: startOfDay(date),
          $lte: endOfDay(date),
        },
        status: { $in: ['pending', 'confirmed'] },
      }),
      // 차단된 시간 조회 (해당 패키지 또는 전체)
      BlockedSlot.find({
        date: {
          $gte: startOfDay(date),
          $lte: endOfDay(date),
        },
        $or: [
          { packageId: packageId },
          { packageId: null },
          { packageId: { $exists: false } },
        ],
      }),
    ]);

    const reservationCountByTime = existingReservations.reduce(
      (acc, res) => {
        acc[res.reservationTime] = (acc[res.reservationTime] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // 차단된 시간 Set
    const blockedTimes = new Set(blockedSlots.map(bs => bs.time));

    const maxSlots = pkg.maxReservationsPerSlot || 10;

    // 시간 슬롯 반환
    return defaultTimeSlots.map((time) => {
      // 차단된 시간인지 확인
      if (blockedTimes.has(time)) {
        return {
          time,
          available: false,
          remainingSlots: 0,
        };
      }

      const reservedCount = reservationCountByTime[time] || 0;
      const remainingSlots = maxSlots - reservedCount;

      return {
        time,
        available: remainingSlots > 0,
        remainingSlots: Math.max(0, remainingSlots),
      };
    });
  }

  async getCategories(): Promise<string[]> {
    const categories = await Package.distinct('category', { isActive: true });
    return categories;
  }
}

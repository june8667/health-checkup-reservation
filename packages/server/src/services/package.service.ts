import { Package, IPackage } from '../models/Package';
import { Hospital } from '../models/Hospital';
import { Reservation } from '../models/Reservation';
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
    const pkg = await Package.findById(packageId).populate('hospitalId');
    if (!pkg) {
      throw new AppError('패키지를 찾을 수 없습니다.', 404);
    }

    const hospital = await Hospital.findById(pkg.hospitalId);
    if (!hospital) {
      throw new AppError('병원 정보를 찾을 수 없습니다.', 404);
    }

    // UTC 기준으로 요일 계산 (타임존 문제 방지)
    const dayOfWeek = date.getUTCDay();

    console.log('[getAvailableSlots] date:', date, 'dayOfWeek:', dayOfWeek, 'availableDays:', pkg.availableDays);

    // Check if the day is available for this package
    if (!pkg.availableDays.includes(dayOfWeek)) {
      return [];
    }

    // Check hospital business hours
    const businessHour = hospital.businessHours.find(
      (bh) => bh.dayOfWeek === dayOfWeek
    );

    console.log('[getAvailableSlots] businessHour:', businessHour, 'hospital.timeSlots:', hospital.timeSlots);

    if (!businessHour || businessHour.isHoliday) {
      console.log('[getAvailableSlots] No business hour or holiday');
      return [];
    }

    if (!hospital.timeSlots || hospital.timeSlots.length === 0) {
      console.log('[getAvailableSlots] No timeSlots defined');
      return [];
    }

    // Get existing reservations for the date
    const existingReservations = await Reservation.find({
      packageId,
      reservationDate: {
        $gte: startOfDay(date),
        $lte: endOfDay(date),
      },
      status: { $in: ['pending', 'confirmed'] },
    });

    const reservationCountByTime = existingReservations.reduce(
      (acc, res) => {
        acc[res.reservationTime] = (acc[res.reservationTime] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Generate available slots
    return hospital.timeSlots.map((time) => {
      const reservedCount = reservationCountByTime[time] || 0;
      const remainingSlots = pkg.maxReservationsPerSlot - reservedCount;

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

import { User } from '../models/User';
import { Reservation } from '../models/Reservation';
import { Payment } from '../models/Payment';
import { Package } from '../models/Package';
import { BlockedSlot } from '../models/BlockedSlot';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface DashboardStats {
  totalUsers: number;
  totalReservations: number;
  totalRevenue: number;
  todayReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  monthlyStats: MonthlyStats[];
  recentReservations: any[];
  popularPackages: any[];
}

export interface MonthlyStats {
  month: string;
  reservations: number;
  revenue: number;
}

export class AdminService {
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const [
      totalUsers,
      totalReservations,
      revenueResult,
      todayReservations,
      pendingReservations,
      confirmedReservations,
      monthlyStats,
      recentReservations,
      popularPackages,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Reservation.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Reservation.countDocuments({
        reservationDate: { $gte: startOfToday, $lte: endOfToday },
      }),
      Reservation.countDocuments({ status: 'pending' }),
      Reservation.countDocuments({ status: 'confirmed' }),
      this.getMonthlyStats(),
      this.getRecentReservations(),
      this.getPopularPackages(),
    ]);

    return {
      totalUsers,
      totalReservations,
      totalRevenue: revenueResult[0]?.total || 0,
      todayReservations,
      pendingReservations,
      confirmedReservations,
      monthlyStats,
      recentReservations,
      popularPackages,
    };
  }

  private async getMonthlyStats(): Promise<MonthlyStats[]> {
    const stats: MonthlyStats[] = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const [reservationCount, revenueResult] = await Promise.all([
        Reservation.countDocuments({
          createdAt: { $gte: start, $lte: end },
        }),
        Payment.aggregate([
          {
            $match: {
              status: 'paid',
              paidAt: { $gte: start, $lte: end },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

      stats.push({
        month: format(monthDate, 'yyyy-MM'),
        reservations: reservationCount,
        revenue: revenueResult[0]?.total || 0,
      });
    }

    return stats;
  }

  private async getRecentReservations(): Promise<any[]> {
    return Reservation.find()
      .populate('userId', 'name email phone')
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
  }

  private async getPopularPackages(): Promise<any[]> {
    const result = await Reservation.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: '$packageId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const packageIds = result.map((r) => r._id);
    const packages = await Package.find({ _id: { $in: packageIds } }).lean();

    return result.map((r) => {
      const pkg = packages.find((p) => p._id.toString() === r._id.toString());
      return {
        package: pkg,
        reservationCount: r.count,
      };
    });
  }

  async getAllReservations(
    page: number = 1,
    limit: number = 20,
    filters: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    } = {}
  ): Promise<{ reservations: any[]; total: number }> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      query.reservationDate = {};
      if (filters.startDate) {
        query.reservationDate.$gte = startOfDay(filters.startDate);
      }
      if (filters.endDate) {
        query.reservationDate.$lte = endOfDay(filters.endDate);
      }
    }

    if (filters.search) {
      query.$or = [
        { reservationNumber: { $regex: filters.search, $options: 'i' } },
        { 'patientInfo.name': { $regex: filters.search, $options: 'i' } },
        { 'patientInfo.phone': { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [reservations, total] = await Promise.all([
      Reservation.find(query)
        .populate('userId', 'name email phone')
        .populate('packageId', 'name price')
        .populate('paymentId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Reservation.countDocuments(query),
    ]);

    return { reservations, total };
  }

  async updateReservationStatus(
    reservationId: string,
    status: string,
    memo?: string
  ): Promise<any> {
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      {
        status,
        ...(memo && { adminMemo: memo }),
      } as any,
      { new: true }
    ).populate('userId packageId paymentId');

    return reservation;
  }

  async rescheduleReservation(
    reservationId: string,
    date: Date,
    time: string
  ): Promise<any> {
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      {
        reservationDate: startOfDay(date),
        reservationTime: time,
      },
      { new: true }
    ).populate('userId packageId paymentId');

    return reservation;
  }

  async deleteReservation(reservationId: string): Promise<void> {
    await Reservation.findByIdAndDelete(reservationId);
  }

  async getAllPayments(
    page: number = 1,
    limit: number = 20,
    filters: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    } = {}
  ): Promise<{ payments: any[]; total: number }> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      query.paidAt = {};
      if (filters.startDate) {
        query.paidAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.paidAt.$lte = filters.endDate;
      }
    }

    if (filters.search) {
      query.$or = [
        { orderId: { $regex: filters.search, $options: 'i' } },
        { paymentKey: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate({
          path: 'reservationId',
          populate: { path: 'packageId', select: 'name' },
        })
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Payment.countDocuments(query),
    ]);

    return { payments, total };
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 20,
    filters: { search?: string; role?: string } = {}
  ): Promise<{ users: any[]; total: number }> {
    const query: any = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return { users, total };
  }

  // 패키지 관리
  async getAllPackages(
    page: number = 1,
    limit: number = 20,
    filters: { search?: string; category?: string; isActive?: boolean } = {}
  ): Promise<{ packages: any[]; total: number }> {
    const query: any = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [packages, total] = await Promise.all([
      Package.find(query)
        .populate('hospitalId', 'name')
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Package.countDocuments(query),
    ]);

    return { packages, total };
  }

  async createPackage(data: any): Promise<any> {
    const pkg = await Package.create(data);
    return pkg;
  }

  async updatePackage(packageId: string, data: any): Promise<any> {
    const pkg = await Package.findByIdAndUpdate(
      packageId,
      data,
      { new: true }
    ).populate('hospitalId', 'name');
    return pkg;
  }

  async deletePackage(packageId: string): Promise<void> {
    await Package.findByIdAndDelete(packageId);
  }

  async getPackageById(packageId: string): Promise<any> {
    return Package.findById(packageId).populate('hospitalId', 'name').lean();
  }

  // 차단된 시간 관리
  async getBlockedSlots(
    startDate: Date,
    endDate: Date,
    packageId?: string
  ): Promise<any[]> {
    const query: any = {
      date: { $gte: startOfDay(startDate), $lte: endOfDay(endDate) },
    };
    if (packageId) {
      query.packageId = packageId;
    }

    return BlockedSlot.find(query)
      .populate('packageId', 'name')
      .populate('createdBy', 'name')
      .sort({ date: 1, time: 1 })
      .lean();
  }

  async createBlockedSlot(
    date: Date,
    time: string,
    createdBy: string,
    packageId?: string,
    reason?: string
  ): Promise<any> {
    const blockedSlot = await BlockedSlot.create({
      date: startOfDay(date),
      time,
      packageId: packageId || null,
      reason,
      createdBy,
    });
    return blockedSlot;
  }

  async deleteBlockedSlot(blockedSlotId: string): Promise<void> {
    await BlockedSlot.findByIdAndDelete(blockedSlotId);
  }

  async bulkCreateBlockedSlots(
    date: Date,
    times: string[],
    createdBy: string,
    packageId?: string,
    reason?: string
  ): Promise<any[]> {
    const slots = times.map(time => ({
      date: startOfDay(date),
      time,
      packageId: packageId || null,
      reason,
      createdBy,
    }));
    return BlockedSlot.insertMany(slots);
  }

  async deleteBlockedSlotsByDate(date: Date, packageId?: string): Promise<void> {
    const query: any = {
      date: { $gte: startOfDay(date), $lte: endOfDay(date) },
    };
    if (packageId) {
      query.packageId = packageId;
    }
    await BlockedSlot.deleteMany(query);
  }
}

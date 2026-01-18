import { Reservation, IReservation } from '../models/Reservation';
import { Package } from '../models/Package';
import { AppError } from '../middleware/error.middleware';
import { generateReservationNumber } from '../utils/helpers';
import { startOfDay, endOfDay, differenceInDays } from 'date-fns';

interface CreateReservationInput {
  userId: string;
  packageId: string;
  reservationDate: Date;
  reservationTime: string;
  patientInfo: {
    name: string;
    phone: string;
    birthDate: Date;
    gender: 'male' | 'female';
  };
  memo?: string;
  status?: 'pending' | 'confirmed';
}

export class ReservationService {
  async create(input: CreateReservationInput): Promise<IReservation> {
    const pkg = await Package.findById(input.packageId);
    if (!pkg) {
      throw new AppError('패키지를 찾을 수 없습니다.', 404);
    }

    // Check if slot is available
    const existingCount = await Reservation.countDocuments({
      packageId: input.packageId,
      reservationDate: {
        $gte: startOfDay(input.reservationDate),
        $lte: endOfDay(input.reservationDate),
      },
      reservationTime: input.reservationTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingCount >= pkg.maxReservationsPerSlot) {
      throw new AppError('해당 시간대는 예약이 마감되었습니다.', 400);
    }

    const reservationNumber = generateReservationNumber();
    const totalAmount = pkg.price;
    const discountAmount = pkg.discountPrice ? pkg.price - pkg.discountPrice : 0;
    const finalAmount = pkg.discountPrice || pkg.price;

    const reservation = await Reservation.create({
      reservationNumber,
      userId: input.userId,
      packageId: input.packageId,
      hospitalId: pkg.hospitalId,
      reservationDate: input.reservationDate,
      reservationTime: input.reservationTime,
      patientInfo: input.patientInfo,
      totalAmount,
      discountAmount,
      finalAmount,
      status: input.status || 'confirmed',
      memo: input.memo,
    });

    return reservation;
  }

  async findById(id: string, userId?: string): Promise<IReservation> {
    const query: any = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const reservation = await Reservation.findOne(query)
      .populate('packageId', 'name description price discountPrice duration items')
      .populate('hospitalId', 'name address phone');

    if (!reservation) {
      throw new AppError('예약을 찾을 수 없습니다.', 404);
    }

    return reservation;
  }

  async findByNumber(reservationNumber: string, userId?: string): Promise<IReservation> {
    const query: any = { reservationNumber };
    if (userId) {
      query.userId = userId;
    }

    const reservation = await Reservation.findOne(query)
      .populate('packageId', 'name description price discountPrice duration items')
      .populate('hospitalId', 'name address phone');

    if (!reservation) {
      throw new AppError('예약을 찾을 수 없습니다.', 404);
    }

    return reservation;
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{ reservations: IReservation[]; total: number }> {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const [reservations, total] = await Promise.all([
      Reservation.find(query)
        .populate('packageId', 'name price discountPrice description items')
        .populate('hospitalId', 'name address phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Reservation.countDocuments(query),
    ]);

    return { reservations, total };
  }

  async cancel(
    id: string,
    userId: string,
    reason: string
  ): Promise<{ reservation: IReservation; refundAmount: number }> {
    const reservation = await Reservation.findOne({ _id: id, userId });

    if (!reservation) {
      throw new AppError('예약을 찾을 수 없습니다.', 404);
    }

    if (!['pending', 'confirmed'].includes(reservation.status)) {
      throw new AppError('취소할 수 없는 예약입니다.', 400);
    }

    // Calculate refund based on cancellation policy
    const daysUntilReservation = differenceInDays(
      reservation.reservationDate,
      new Date()
    );

    let refundRate = 1;
    if (daysUntilReservation < 1) {
      refundRate = 0; // No refund on same day
    } else if (daysUntilReservation < 3) {
      refundRate = 0.5; // 50% refund within 3 days
    } else if (daysUntilReservation < 7) {
      refundRate = 0.8; // 80% refund within 7 days
    }

    const refundAmount = Math.floor(reservation.finalAmount * refundRate);

    reservation.status = 'cancelled';
    reservation.cancelledAt = new Date();
    reservation.cancelReason = reason;
    reservation.refundAmount = refundAmount;

    await reservation.save();

    return { reservation, refundAmount };
  }

  async updateNotes(
    id: string,
    userId: string,
    specialNotes: string
  ): Promise<IReservation> {
    const reservation = await Reservation.findOne({ _id: id, userId });

    if (!reservation) {
      throw new AppError('예약을 찾을 수 없습니다.', 404);
    }

    reservation.specialNotes = specialNotes;
    await reservation.save();

    return reservation;
  }

  async updateStatus(
    id: string,
    status: IReservation['status'],
    adminMemo?: string
  ): Promise<IReservation> {
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          ...(adminMemo && { adminMemo }),
          ...(status === 'cancelled' && { cancelledAt: new Date() }),
        },
      },
      { new: true }
    );

    if (!reservation) {
      throw new AppError('예약을 찾을 수 없습니다.', 404);
    }

    return reservation;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    }
  ): Promise<{ reservations: IReservation[]; total: number }> {
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      query.reservationDate = {};
      if (filters.startDate) {
        query.reservationDate.$gte = startOfDay(filters.startDate);
      }
      if (filters.endDate) {
        query.reservationDate.$lte = endOfDay(filters.endDate);
      }
    }

    if (filters?.search) {
      query.$or = [
        { reservationNumber: { $regex: filters.search, $options: 'i' } },
        { 'patientInfo.name': { $regex: filters.search, $options: 'i' } },
        { 'patientInfo.phone': { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [reservations, total] = await Promise.all([
      Reservation.find(query)
        .populate('packageId', 'name price')
        .populate('hospitalId', 'name')
        .populate('userId', 'email name phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Reservation.countDocuments(query),
    ]);

    return { reservations, total };
  }
}

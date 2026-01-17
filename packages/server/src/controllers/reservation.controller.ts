import { Response, NextFunction } from 'express';
import { ReservationService } from '../services/reservation.service';
import { AuthRequest } from '../middleware/auth.middleware';

const reservationService = new ReservationService();

export async function createReservation(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reservation = await reservationService.create({
      userId: req.user!.userId,
      packageId: req.body.packageId,
      reservationDate: new Date(req.body.reservationDate),
      reservationTime: req.body.reservationTime,
      patientInfo: req.body.patientInfo,
      memo: req.body.memo,
    });

    res.status(201).json({
      success: true,
      message: '예약이 생성되었습니다.',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReservationById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reservation = await reservationService.findById(
      req.params.id,
      req.user?.role === 'admin' ? undefined : req.user?.userId
    );

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReservationByNumber(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reservation = await reservationService.findByNumber(
      req.params.reservationNumber,
      req.user?.role === 'admin' ? undefined : req.user?.userId
    );

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyReservations(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, status } = req.query;

    const result = await reservationService.findByUserId(
      req.user!.userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status as string
    );

    res.json({
      success: true,
      data: {
        items: result.reservations,
        total: result.total,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        totalPages: Math.ceil(result.total / (limit ? Number(limit) : 10)),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelReservation(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { reason } = req.body;
    const result = await reservationService.cancel(
      req.params.id,
      req.user!.userId,
      reason || '고객 요청에 의한 취소'
    );

    res.json({
      success: true,
      message: '예약이 취소되었습니다.',
      data: {
        reservation: result.reservation,
        refundAmount: result.refundAmount,
      },
    });
  } catch (error) {
    next(error);
  }
}

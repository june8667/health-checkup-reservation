import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth.middleware';

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

import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middleware/auth.middleware';

const paymentService = new PaymentService();

export async function preparePayment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { reservationId } = req.body;
    const result = await paymentService.preparePayment(
      reservationId,
      req.user!.userId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmPayment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { paymentKey, orderId, amount } = req.body;
    const payment = await paymentService.confirmPayment(paymentKey, orderId, amount);

    res.json({
      success: true,
      message: '결제가 완료되었습니다.',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelPayment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { paymentKey } = req.params;
    const { cancelReason, cancelAmount } = req.body;

    const payment = await paymentService.cancelPayment(
      paymentKey,
      cancelReason,
      cancelAmount
    );

    res.json({
      success: true,
      message: '결제가 취소되었습니다.',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPaymentByKey(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payment = await paymentService.findByPaymentKey(req.params.paymentKey);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyPayments(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = req.query;
    const result = await paymentService.findByUserId(
      req.user!.userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10
    );

    res.json({
      success: true,
      data: {
        items: result.payments,
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

// Webhook for Toss Payments
export async function handleWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // TODO: Verify webhook signature
    const { eventType, data } = req.body;

    console.log('[Toss Webhook]', eventType, data);

    // Handle different event types
    switch (eventType) {
      case 'PAYMENT_STATUS_CHANGED':
        // Handle payment status change
        break;
      case 'VIRTUAL_ACCOUNT_DEPOSIT':
        // Handle virtual account deposit
        break;
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

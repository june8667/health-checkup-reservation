import axios from 'axios';
import { Payment, IPayment, PaymentMethod } from '../models/Payment';
import { Reservation } from '../models/Reservation';
import { AppError } from '../middleware/error.middleware';
import { generateOrderId } from '../utils/helpers';
import { env } from '../config/env';

const TOSS_API_URL = 'https://api.tosspayments.com/v1';

export class PaymentService {
  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${env.tossSecretKey}:`).toString('base64')}`;
  }

  async preparePayment(
    reservationId: string,
    userId: string
  ): Promise<{
    orderId: string;
    amount: number;
    orderName: string;
    customerName: string;
    successUrl: string;
    failUrl: string;
  }> {
    const reservation = await Reservation.findOne({
      _id: reservationId,
      userId,
      status: 'pending',
    }).populate('packageId', 'name');

    if (!reservation) {
      throw new AppError('예약을 찾을 수 없습니다.', 404);
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      reservationId,
      status: { $in: ['ready', 'paid'] },
    });

    if (existingPayment) {
      if (existingPayment.status === 'paid') {
        throw new AppError('이미 결제가 완료된 예약입니다.', 400);
      }
      // Return existing ready payment
      return {
        orderId: existingPayment.orderId,
        amount: existingPayment.amount,
        orderName: (reservation.packageId as any).name,
        customerName: reservation.patientInfo.name,
        successUrl: `${env.clientUrl}/payment/success`,
        failUrl: `${env.clientUrl}/payment/fail`,
      };
    }

    const orderId = generateOrderId();

    // Create payment record
    await Payment.create({
      paymentKey: `PENDING_${orderId}`,
      orderId,
      reservationId: reservation._id,
      userId,
      amount: reservation.finalAmount,
      method: 'card',
      status: 'ready',
      pgProvider: 'tosspayments',
    });

    return {
      orderId,
      amount: reservation.finalAmount,
      orderName: (reservation.packageId as any).name,
      customerName: reservation.patientInfo.name,
      successUrl: `${env.clientUrl}/payment/success`,
      failUrl: `${env.clientUrl}/payment/fail`,
    };
  }

  async confirmPayment(
    paymentKey: string,
    orderId: string,
    amount: number
  ): Promise<IPayment> {
    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      throw new AppError('결제 정보를 찾을 수 없습니다.', 404);
    }

    if (payment.amount !== amount) {
      throw new AppError('결제 금액이 일치하지 않습니다.', 400);
    }

    try {
      // Call Toss Payments API
      const response = await axios.post(
        `${TOSS_API_URL}/payments/confirm`,
        { paymentKey, orderId, amount },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );

      const tossData = response.data;

      // Update payment record
      payment.paymentKey = paymentKey;
      payment.status = 'paid';
      payment.method = this.mapPaymentMethod(tossData.method);
      payment.paidAt = new Date(tossData.approvedAt);
      payment.receiptUrl = tossData.receipt?.url;
      payment.rawResponse = tossData;

      if (tossData.card) {
        payment.cardInfo = {
          company: tossData.card.company,
          number: tossData.card.number,
          installmentPlanMonths: tossData.card.installmentPlanMonths,
          isInterestFree: tossData.card.isInterestFree,
          approveNo: tossData.card.approveNo,
        };
      }

      await payment.save();

      // Update reservation status
      await Reservation.findByIdAndUpdate(payment.reservationId, {
        status: 'confirmed',
        paymentId: payment._id,
      });

      return payment;
    } catch (error: any) {
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.failReason = error.response?.data?.message || error.message;
      await payment.save();

      throw new AppError(
        error.response?.data?.message || '결제 승인에 실패했습니다.',
        400
      );
    }
  }

  async cancelPayment(
    paymentKey: string,
    cancelReason: string,
    cancelAmount?: number
  ): Promise<IPayment> {
    const payment = await Payment.findOne({ paymentKey });

    if (!payment || payment.status !== 'paid') {
      throw new AppError('취소할 수 있는 결제가 없습니다.', 400);
    }

    const amount = cancelAmount || payment.amount;

    try {
      const response = await axios.post(
        `${TOSS_API_URL}/payments/${paymentKey}/cancel`,
        { cancelReason, cancelAmount: amount },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );

      const cancel = {
        cancelledAt: new Date(),
        cancelAmount: amount,
        cancelReason,
        refundStatus: 'completed' as const,
        transactionKey: response.data.cancels?.[0]?.transactionKey,
      };

      payment.cancels = payment.cancels || [];
      payment.cancels.push(cancel);
      payment.status = amount === payment.amount ? 'cancelled' : 'partial_cancelled';

      await payment.save();

      return payment;
    } catch (error: any) {
      throw new AppError(
        error.response?.data?.message || '결제 취소에 실패했습니다.',
        400
      );
    }
  }

  async findByPaymentKey(paymentKey: string): Promise<IPayment> {
    const payment = await Payment.findOne({ paymentKey }).populate(
      'reservationId'
    );

    if (!payment) {
      throw new AppError('결제 정보를 찾을 수 없습니다.', 404);
    }

    return payment;
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ payments: IPayment[]; total: number }> {
    const [payments, total] = await Promise.all([
      Payment.find({ userId, status: { $ne: 'ready' } })
        .populate('reservationId', 'reservationNumber reservationDate')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Payment.countDocuments({ userId, status: { $ne: 'ready' } }),
    ]);

    return { payments, total };
  }

  private mapPaymentMethod(tossMethod: string): PaymentMethod {
    const methodMap: Record<string, PaymentMethod> = {
      카드: 'card',
      가상계좌: 'virtual_account',
      계좌이체: 'bank_transfer',
      카카오페이: 'kakaopay',
      네이버페이: 'naverpay',
      토스페이: 'tosspay',
    };
    return methodMap[tossMethod] || 'card';
  }
}

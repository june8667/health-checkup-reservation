import { Schema, model, Document, Types } from 'mongoose';

export type PaymentStatus =
  | 'ready'
  | 'paid'
  | 'cancelled'
  | 'partial_cancelled'
  | 'failed';

export type PaymentMethod =
  | 'card'
  | 'kakaopay'
  | 'naverpay'
  | 'tosspay'
  | 'bank_transfer'
  | 'virtual_account';

export interface IPayment extends Document {
  paymentKey: string;
  orderId: string;
  reservationId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  pgProvider: 'tosspayments' | 'iamport';
  cardInfo?: {
    company: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    approveNo: string;
  };
  virtualAccount?: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    dueDate: Date;
    depositorName: string;
  };
  receiptUrl?: string;
  cancels?: {
    cancelledAt: Date;
    cancelAmount: number;
    cancelReason: string;
    refundStatus: 'pending' | 'completed' | 'failed';
    transactionKey?: string;
  }[];
  paidAt?: Date;
  failedAt?: Date;
  failReason?: string;
  rawResponse?: object;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentKey: { type: String, required: true, unique: true },
    orderId: { type: String, required: true, unique: true },
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['card', 'kakaopay', 'naverpay', 'tosspay', 'bank_transfer', 'virtual_account'],
      required: true,
    },
    status: {
      type: String,
      enum: ['ready', 'paid', 'cancelled', 'partial_cancelled', 'failed'],
      default: 'ready',
    },
    pgProvider: {
      type: String,
      enum: ['tosspayments', 'iamport'],
      required: true,
    },
    cardInfo: {
      company: String,
      number: String,
      installmentPlanMonths: Number,
      isInterestFree: Boolean,
      approveNo: String,
    },
    virtualAccount: {
      bankCode: String,
      bankName: String,
      accountNumber: String,
      dueDate: Date,
      depositorName: String,
    },
    receiptUrl: String,
    cancels: [
      {
        cancelledAt: Date,
        cancelAmount: Number,
        cancelReason: String,
        refundStatus: { type: String, enum: ['pending', 'completed', 'failed'] },
        transactionKey: String,
      },
    ],
    paidAt: Date,
    failedAt: Date,
    failReason: String,
    rawResponse: Schema.Types.Mixed,
  },
  {
    timestamps: true,
    collection: 'payments',
  }
);

paymentSchema.index({ paymentKey: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ reservationId: 1 });

export const Payment = model<IPayment>('Payment', paymentSchema);

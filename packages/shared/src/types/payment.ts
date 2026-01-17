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

export interface CardInfo {
  company: string;
  number: string;
  installmentPlanMonths: number;
  isInterestFree: boolean;
  approveNo: string;
}

export interface VirtualAccountInfo {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  dueDate: string;
  depositorName: string;
}

export interface PaymentCancel {
  cancelledAt: string;
  cancelAmount: number;
  cancelReason: string;
  refundStatus: 'pending' | 'completed' | 'failed';
  transactionKey?: string;
}

export interface Payment {
  _id: string;
  paymentKey: string;
  orderId: string;
  reservationId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  pgProvider: 'tosspayments' | 'iamport';
  cardInfo?: CardInfo;
  virtualAccount?: VirtualAccountInfo;
  receiptUrl?: string;
  cancels?: PaymentCancel[];
  paidAt?: string;
  failedAt?: string;
  failReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPrepareResponse {
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  customerEmail: string;
  successUrl: string;
  failUrl: string;
}

export interface PaymentConfirmInput {
  paymentKey: string;
  orderId: string;
  amount: number;
}

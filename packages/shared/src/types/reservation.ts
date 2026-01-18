import { Gender } from './user';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface PatientInfo {
  name: string;
  phone: string;
  birthDate: string;
  gender: Gender;
}

export interface AdditionalOption {
  optionId: string;
  name: string;
  price: number;
}

export interface Reservation {
  _id: string;
  reservationNumber: string;
  userId: string;
  packageId: string;
  hospitalId: string;
  reservationDate: string;
  reservationTime: string;
  patientInfo: PatientInfo;
  additionalOptions?: AdditionalOption[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: ReservationStatus;
  paymentId?: string;
  memo?: string;
  adminMemo?: string;
  cancelledAt?: string;
  cancelReason?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationCreateInput {
  packageId: string;
  reservationDate: string;
  reservationTime: string;
  patientInfo: PatientInfo;
  additionalOptions?: { optionId: string }[];
  memo?: string;
  status?: 'pending' | 'confirmed';
}

export interface ReservationWithDetails extends Reservation {
  package?: {
    name: string;
    price: number;
    discountPrice?: number;
  };
  hospital?: {
    name: string;
    address: {
      address1: string;
      address2?: string;
    };
    phone: string;
  };
}

import { Schema, model, Document, Types } from 'mongoose';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface IReservation extends Document {
  reservationNumber: string;
  userId: Types.ObjectId;
  packageId: Types.ObjectId;
  hospitalId: Types.ObjectId;
  reservationDate: Date;
  reservationTime: string;
  patientInfo: {
    name: string;
    phone: string;
    birthDate: Date;
    gender: 'male' | 'female';
  };
  additionalOptions?: {
    optionId: Types.ObjectId;
    name: string;
    price: number;
  }[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: ReservationStatus;
  paymentId?: Types.ObjectId;
  memo?: string;
  specialNotes?: string;
  adminMemo?: string;
  cancelledAt?: Date;
  cancelReason?: string;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    reservationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    reservationDate: { type: Date, required: true },
    reservationTime: { type: String, required: true },
    patientInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      birthDate: { type: Date, required: true },
      gender: { type: String, enum: ['male', 'female'], required: true },
    },
    additionalOptions: [
      {
        optionId: Schema.Types.ObjectId,
        name: String,
        price: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    memo: String,
    specialNotes: String,
    adminMemo: String,
    cancelledAt: Date,
    cancelReason: String,
    refundAmount: Number,
  },
  {
    timestamps: true,
    collection: 'reservations',
  }
);

reservationSchema.index({ reservationNumber: 1 });
reservationSchema.index({ userId: 1, status: 1 });
reservationSchema.index({ reservationDate: 1, reservationTime: 1, hospitalId: 1 });
reservationSchema.index({ status: 1, createdAt: -1 });

export const Reservation = model<IReservation>('Reservation', reservationSchema);

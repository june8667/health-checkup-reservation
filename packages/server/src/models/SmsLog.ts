import { Schema, model, Document, Types } from 'mongoose';

export interface ISmsLog extends Document {
  userId?: Types.ObjectId;
  reservationId?: Types.ObjectId;
  phone: string;
  message: string;
  type:
    | 'verification'
    | 'reservation_confirm'
    | 'reservation_reminder'
    | 'reservation_cancel'
    | 'marketing';
  status: 'pending' | 'sent' | 'failed';
  provider: 'aligo' | 'nhn' | 'sens';
  messageId?: string;
  sentAt?: Date;
  failReason?: string;
  createdAt: Date;
}

const smsLogSchema = new Schema<ISmsLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation' },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'verification',
        'reservation_confirm',
        'reservation_reminder',
        'reservation_cancel',
        'marketing',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    provider: {
      type: String,
      enum: ['aligo', 'nhn', 'sens'],
      required: true,
    },
    messageId: String,
    sentAt: Date,
    failReason: String,
  },
  {
    timestamps: true,
    collection: 'sms_logs',
  }
);

smsLogSchema.index({ userId: 1 });
smsLogSchema.index({ createdAt: -1 });
smsLogSchema.index({ type: 1, status: 1 });

export const SmsLog = model<ISmsLog>('SmsLog', smsLogSchema);

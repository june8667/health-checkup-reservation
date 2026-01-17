import { Schema, model, Document, Types } from 'mongoose';

export interface IBlockedSlot extends Document {
  date: Date;
  time: string;
  packageId?: Types.ObjectId; // null이면 모든 패키지에 적용
  reason?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const blockedSlotSchema = new Schema<IBlockedSlot>(
  {
    date: { type: Date, required: true },
    time: { type: String, required: true },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package' },
    reason: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    collection: 'blocked_slots',
  }
);

blockedSlotSchema.index({ date: 1, time: 1, packageId: 1 });

export const BlockedSlot = model<IBlockedSlot>('BlockedSlot', blockedSlotSchema);

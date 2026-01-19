import { Schema, model, Document, Types } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  description: string;
  category: 'basic' | 'standard' | 'premium' | 'specialized' | 'custom';
  items: {
    itemId?: Types.ObjectId;
    name: string;
    description?: string;
    price?: number;
  }[];
  price: number;
  discountPrice?: number;
  duration: number;
  hospitalId?: Types.ObjectId;
  targetGender: 'male' | 'female' | 'all';
  targetAgeMin?: number;
  targetAgeMax?: number;
  availableDays: number[];
  maxReservationsPerSlot: number;
  isActive: boolean;
  displayOrder: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'specialized', 'custom'],
      required: true,
    },
    items: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: 'ExaminationItem' },
        name: { type: String, required: true },
        description: String,
        price: Number,
      },
    ],
    price: { type: Number, required: true },
    discountPrice: Number,
    duration: { type: Number, required: true, default: 120 },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    targetGender: {
      type: String,
      enum: ['male', 'female', 'all'],
      default: 'all',
    },
    targetAgeMin: Number,
    targetAgeMax: Number,
    availableDays: [{ type: Number, min: 0, max: 6 }],
    maxReservationsPerSlot: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    tags: [String],
  },
  {
    timestamps: true,
    collection: 'packages',
  }
);

packageSchema.index({ category: 1, isActive: 1 });
packageSchema.index({ hospitalId: 1 });
packageSchema.index({ price: 1 });

export const Package = model<IPackage>('Package', packageSchema);

import { Schema, model, Document } from 'mongoose';

export interface IExaminationItem extends Document {
  name: string;
  description?: string;
  price: number;
  category?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const examinationItemSchema = new Schema<IExaminationItem>(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    price: { type: Number, required: true, default: 0 },
    category: String,
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'examination_items',
  }
);

examinationItemSchema.index({ isActive: 1, displayOrder: 1 });
examinationItemSchema.index({ name: 'text' });

export const ExaminationItem = model<IExaminationItem>('ExaminationItem', examinationItemSchema);

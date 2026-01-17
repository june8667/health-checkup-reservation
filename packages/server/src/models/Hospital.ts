import { Schema, model, Document } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  description?: string;
  address: {
    zipCode: string;
    address1: string;
    address2?: string;
    lat?: number;
    lng?: number;
  };
  phone: string;
  email?: string;
  businessHours: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isHoliday: boolean;
  }[];
  timeSlots: string[];
  images?: string[];
  facilities?: string[];
  parkingInfo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const hospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true },
    description: String,
    address: {
      zipCode: { type: String, required: true },
      address1: { type: String, required: true },
      address2: String,
      lat: Number,
      lng: Number,
    },
    phone: { type: String, required: true },
    email: String,
    businessHours: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 },
        openTime: String,
        closeTime: String,
        isHoliday: { type: Boolean, default: false },
      },
    ],
    timeSlots: [String],
    images: [String],
    facilities: [String],
    parkingInfo: String,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'hospitals',
  }
);

export const Hospital = model<IHospital>('Hospital', hospitalSchema);

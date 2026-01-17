import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone: string;
  birthDate: Date;
  gender: 'male' | 'female';
  address?: {
    zipCode: string;
    address1: string;
    address2?: string;
  };
  role: 'user' | 'admin';
  isVerified: boolean;
  phoneVerified: boolean;
  marketingConsent: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: {
      type: String,
      required: true,
    },
    birthDate: { type: Date, required: true },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    address: {
      zipCode: String,
      address1: String,
      address2: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    marketingConsent: { type: Boolean, default: false },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });

export const User = model<IUser>('User', userSchema);

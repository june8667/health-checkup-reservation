export type PackageCategory = 'basic' | 'standard' | 'premium' | 'specialized';
export type TargetGender = 'male' | 'female' | 'all';

export interface PackageItem {
  name: string;
  description?: string;
}

export interface Package {
  _id: string;
  name: string;
  description: string;
  category: PackageCategory;
  items: PackageItem[];
  price: number;
  discountPrice?: number;
  duration: number;
  hospitalId: string;
  targetGender: TargetGender;
  targetAgeMin?: number;
  targetAgeMax?: number;
  availableDays: number[];
  maxReservationsPerSlot: number;
  isActive: boolean;
  displayOrder: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Hospital {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  remainingSlots: number;
}

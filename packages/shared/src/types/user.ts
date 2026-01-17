export type UserRole = 'user' | 'admin';
export type Gender = 'male' | 'female';

export interface Address {
  zipCode: string;
  address1: string;
  address2?: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  birthDate: string;
  gender: Gender;
  address?: Address;
  role: UserRole;
  isVerified: boolean;
  phoneVerified: boolean;
  marketingConsent: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateInput {
  email: string;
  password: string;
  name: string;
  phone: string;
  birthDate: string;
  gender: Gender;
  address?: Address;
  marketingConsent?: boolean;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface UserUpdateInput {
  name?: string;
  phone?: string;
  address?: Address;
  marketingConsent?: boolean;
}

import apiClient from './client';
import type { User, UserCreateInput, UserLoginInput, ApiResponse } from '@health-checkup/shared';

export async function register(data: UserCreateInput): Promise<ApiResponse<{ _id: string; email: string; name: string }>> {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
}

export async function login(data: UserLoginInput): Promise<ApiResponse<{ user: User; accessToken: string }>> {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
}

export async function logout(): Promise<ApiResponse> {
  const response = await apiClient.post('/auth/logout');
  return response.data;
}

export async function sendPhoneCode(phone: string): Promise<ApiResponse> {
  const response = await apiClient.post('/auth/send-phone-code', { phone });
  return response.data;
}

export async function verifyPhone(phone: string, code: string): Promise<ApiResponse> {
  const response = await apiClient.post('/auth/verify-phone', { phone, code });
  return response.data;
}

export async function getMe(): Promise<ApiResponse<User>> {
  const response = await apiClient.get('/users/me');
  return response.data;
}

export async function updateMe(data: Record<string, unknown>): Promise<ApiResponse<User>> {
  const response = await apiClient.put('/users/me', data);
  return response.data;
}

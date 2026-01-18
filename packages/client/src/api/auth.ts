import apiClient from './client';
import type { User, UserCreateInput, UserLoginInput, ApiResponse } from '@health-checkup/shared';

export async function register(data: UserCreateInput & { role?: string }): Promise<ApiResponse<{ _id: string; email: string; name: string }>> {
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

// 테스트용: 모든 데이터 삭제
export async function resetAllData(): Promise<ApiResponse> {
  const response = await apiClient.delete('/test/reset');
  return response.data;
}

// 테스트용: 샘플 데이터 생성
export async function seedSampleData(): Promise<ApiResponse> {
  const response = await apiClient.post('/test/seed');
  return response.data;
}

// 테스트용: 가짜 회원 생성
export async function createFakeUsers(count: number = 1000): Promise<ApiResponse> {
  const response = await apiClient.post('/test/fake-users', { count });
  return response.data;
}

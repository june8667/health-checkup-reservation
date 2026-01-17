import apiClient from './client';
import type { Package, TimeSlot, ApiResponse, PaginatedResponse } from '@health-checkup/shared';

interface PackageQuery {
  category?: string;
  targetGender?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export async function getPackages(query: PackageQuery = {}): Promise<ApiResponse<PaginatedResponse<Package>>> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, String(value));
    }
  });

  const response = await apiClient.get(`/packages?${params.toString()}`);
  return response.data;
}

export async function getPackageById(id: string): Promise<ApiResponse<Package>> {
  const response = await apiClient.get(`/packages/${id}`);
  return response.data;
}

export async function getAvailableSlots(packageId: string, date: string): Promise<ApiResponse<TimeSlot[]>> {
  const response = await apiClient.get(`/packages/${packageId}/available-slots?date=${date}`);
  return response.data;
}

export async function getCategories(): Promise<ApiResponse<string[]>> {
  const response = await apiClient.get('/packages/categories');
  return response.data;
}

import apiClient from './client';

export interface DashboardStats {
  totalUsers: number;
  totalReservations: number;
  totalRevenue: number;
  todayReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  monthlyStats: { month: string; reservations: number; revenue: number }[];
  recentReservations: any[];
  popularPackages: any[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getDashboardStats() {
  const { data } = await apiClient.get<{ success: boolean; data: DashboardStats }>(
    '/admin/dashboard'
  );
  return data;
}

export async function getAdminReservations(params: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  const { data } = await apiClient.get<{ success: boolean; data: PaginatedResponse<any> }>(
    '/admin/reservations',
    { params }
  );
  return data;
}

export async function updateReservationStatus(
  id: string,
  status: string,
  memo?: string
) {
  const { data } = await apiClient.patch(`/admin/reservations/${id}/status`, {
    status,
    memo,
  });
  return data;
}

export async function getAdminPayments(params: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  const { data } = await apiClient.get<{ success: boolean; data: PaginatedResponse<any> }>(
    '/admin/payments',
    { params }
  );
  return data;
}

export async function getAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const { data } = await apiClient.get<{ success: boolean; data: PaginatedResponse<any> }>(
    '/admin/users',
    { params }
  );
  return data;
}

// 패키지 관리 API
export async function getAdminPackages(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}) {
  const { data } = await apiClient.get<{ success: boolean; data: PaginatedResponse<any> }>(
    '/admin/packages',
    { params }
  );
  return data;
}

export async function getAdminPackageById(id: string) {
  const { data } = await apiClient.get(`/admin/packages/${id}`);
  return data;
}

export interface PackageInput {
  name: string;
  description: string;
  category: 'basic' | 'standard' | 'premium' | 'specialized';
  items: { name: string; description?: string }[];
  price: number;
  discountPrice?: number;
  duration: number;
  hospitalId: string;
  targetGender: 'male' | 'female' | 'all';
  targetAgeMin?: number;
  targetAgeMax?: number;
  availableDays: number[];
  maxReservationsPerSlot: number;
  isActive: boolean;
  displayOrder: number;
  tags?: string[];
}

export async function createAdminPackage(data: PackageInput) {
  const response = await apiClient.post('/admin/packages', data);
  return response.data;
}

export async function updateAdminPackage(id: string, data: Partial<PackageInput>) {
  const response = await apiClient.put(`/admin/packages/${id}`, data);
  return response.data;
}

export async function deleteAdminPackage(id: string) {
  const response = await apiClient.delete(`/admin/packages/${id}`);
  return response.data;
}

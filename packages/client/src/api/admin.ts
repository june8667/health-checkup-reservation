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

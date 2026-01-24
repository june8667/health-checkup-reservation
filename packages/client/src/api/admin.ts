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

export async function rescheduleReservation(data: {
  id: string;
  date: string;
  time: string;
}) {
  const response = await apiClient.patch(`/admin/reservations/${data.id}/reschedule`, {
    date: data.date,
    time: data.time,
  });
  return response.data;
}

export async function deleteReservation(id: string) {
  const response = await apiClient.delete(`/admin/reservations/${id}`);
  return response.data;
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

export interface UserUpdateInput {
  name?: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  role?: 'user' | 'admin';
  isVerified?: boolean;
  marketingConsent?: boolean;
}

export async function updateAdminUser(id: string, data: UserUpdateInput) {
  const response = await apiClient.put(`/admin/users/${id}`, data);
  return response.data;
}

export async function deleteAdminUser(id: string) {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
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
  category: 'basic' | 'standard' | 'premium' | 'specialized' | 'custom';
  items: { itemId?: string; name: string; description?: string; price?: number }[];
  price: number;
  discountPrice?: number;
  duration: number;
  hospitalId?: string;
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

export async function reorderPackages(items: { id: string; displayOrder: number }[]) {
  const response = await apiClient.post('/admin/packages/reorder', { items });
  return response.data;
}

// 차단된 시간 관리 API
export async function getBlockedSlots(params: {
  startDate: string;
  endDate: string;
  packageId?: string;
}) {
  const response = await apiClient.get('/admin/blocked-slots', { params });
  return response.data;
}

export async function createBlockedSlot(data: {
  date: string;
  time?: string;
  times?: string[];
  packageId?: string;
  reason?: string;
}) {
  const response = await apiClient.post('/admin/blocked-slots', data);
  return response.data;
}

export async function deleteBlockedSlot(id: string) {
  const response = await apiClient.delete(`/admin/blocked-slots/${id}`);
  return response.data;
}

export async function clearBlockedSlotsByDate(data: {
  date: string;
  packageId?: string;
}) {
  const response = await apiClient.post('/admin/blocked-slots/clear', data);
  return response.data;
}

// 스케줄용 예약 조회 (날짜 범위)
export async function getScheduleReservations(params: {
  startDate: string;
  endDate: string;
}) {
  const response = await apiClient.get('/admin/reservations', {
    params: {
      ...params,
      limit: 1000,
    },
  });
  return response.data;
}

// 데이터베이스 백업
export type BackupType = 'config' | 'operations' | 'all';

export async function downloadDatabaseBackup(type: BackupType = 'all') {
  const response = await apiClient.get('/admin/database/backup', {
    params: { type },
    responseType: 'blob',
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  const filenameMap = {
    config: `backup-config-${dateStr}.json`,
    operations: `backup-operations-${dateStr}.json`,
    all: `backup-all-${dateStr}.json`,
  };

  const blob = new Blob([response.data], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filenameMap[type];
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// 데이터베이스 복원
export async function restoreDatabaseBackup(backupData: any) {
  const response = await apiClient.post('/admin/database/restore', { backupData });
  return response.data;
}

// 샘플 데이터 생성
export async function generateSampleData() {
  const response = await apiClient.post('/admin/database/sample-data');
  return response.data;
}

// 가짜 회원 생성
export async function generateFakeUsers(count: number = 1000) {
  const response = await apiClient.post('/admin/database/fake-users', { count });
  return response.data;
}

// 테스트 데이터 삭제
export async function clearTestData(target: 'users' | 'reservations' | 'payments' | 'all') {
  const response = await apiClient.post('/admin/database/clear', { target });
  return response.data;
}

// 검진항목 관리 API
export interface ExaminationItemInput {
  name: string;
  description?: string;
  price: number;
  category?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface ExaminationItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export async function getExaminationItems(params?: { search?: string; isActive?: boolean }) {
  const response = await apiClient.get('/admin/examination-items', { params });
  return response.data;
}

export async function createExaminationItem(data: ExaminationItemInput) {
  const response = await apiClient.post('/admin/examination-items', data);
  return response.data;
}

export async function updateExaminationItem(id: string, data: Partial<ExaminationItemInput>) {
  const response = await apiClient.put(`/admin/examination-items/${id}`, data);
  return response.data;
}

export async function deleteExaminationItem(id: string) {
  const response = await apiClient.delete(`/admin/examination-items/${id}`);
  return response.data;
}

export async function reorderExaminationItems(items: { id: string; displayOrder: number }[]) {
  const response = await apiClient.post('/admin/examination-items/reorder', { items });
  return response.data;
}

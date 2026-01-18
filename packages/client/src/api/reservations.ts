import apiClient from './client';
import type { Reservation, ReservationCreateInput, ApiResponse, PaginatedResponse } from '@health-checkup/shared';

export async function createReservation(data: ReservationCreateInput): Promise<ApiResponse<Reservation>> {
  const response = await apiClient.post('/reservations', data);
  return response.data;
}

export async function getReservationById(id: string): Promise<ApiResponse<Reservation>> {
  const response = await apiClient.get(`/reservations/${id}`);
  return response.data;
}

export async function getReservationByNumber(reservationNumber: string): Promise<ApiResponse<Reservation>> {
  const response = await apiClient.get(`/reservations/number/${reservationNumber}`);
  return response.data;
}

export async function getMyReservations(
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) {
    params.append('status', status);
  }
  const response = await apiClient.get(`/reservations/my?${params.toString()}`);
  return response.data;
}

export async function cancelReservation(id: string, reason?: string): Promise<ApiResponse<{ reservation: Reservation; refundAmount: number }>> {
  const response = await apiClient.post(`/reservations/${id}/cancel`, { reason });
  return response.data;
}

export async function updateReservationNotes(id: string, specialNotes: string): Promise<ApiResponse<Reservation>> {
  const response = await apiClient.patch(`/reservations/${id}/notes`, { specialNotes });
  return response.data;
}

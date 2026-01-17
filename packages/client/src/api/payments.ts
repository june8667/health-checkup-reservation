import apiClient from './client';
import type { Payment, PaymentPrepareResponse, PaymentConfirmInput, ApiResponse, PaginatedResponse } from '@health-checkup/shared';

export async function preparePayment(reservationId: string): Promise<ApiResponse<PaymentPrepareResponse>> {
  const response = await apiClient.post('/payments/prepare', { reservationId });
  return response.data;
}

export async function confirmPayment(data: PaymentConfirmInput): Promise<ApiResponse<Payment>> {
  const response = await apiClient.post('/payments/confirm', data);
  return response.data;
}

export async function cancelPayment(paymentKey: string, cancelReason: string, cancelAmount?: number): Promise<ApiResponse<Payment>> {
  const response = await apiClient.post(`/payments/${paymentKey}/cancel`, { cancelReason, cancelAmount });
  return response.data;
}

export async function getPaymentByKey(paymentKey: string): Promise<ApiResponse<Payment>> {
  const response = await apiClient.get(`/payments/${paymentKey}`);
  return response.data;
}

export async function getMyPayments(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Payment>>> {
  const response = await apiClient.get(`/payments/my?page=${page}&limit=${limit}`);
  return response.data;
}

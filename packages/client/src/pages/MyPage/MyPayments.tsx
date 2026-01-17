import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getMyPayments } from '../../api/payments';
import { PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../../constants/labels';
import Button from '../../components/common/Button';

export default function MyPayments() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-payments', page],
    queryFn: () => getMyPayments(page, 10),
  });

  const payments = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'partial_cancelled':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">결제 내역</h2>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">결제 내역이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {payments.map((payment: any) => (
              <div key={payment._id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      주문번호: {payment.orderId}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {payment.paidAt && format(new Date(payment.paidAt), 'yyyy.MM.dd HH:mm')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {PAYMENT_METHOD_LABELS[payment.method]}
                      {payment.cardInfo && ` (${payment.cardInfo.company})`}
                    </p>
                    {payment.reservationId?.reservationNumber && (
                      <p className="text-sm text-gray-500">
                        예약번호: {payment.reservationId.reservationNumber}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(payment.amount)}원
                  </span>
                </div>

                {payment.cancels && payment.cancels.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-red-600">
                      취소금액: {formatPrice(payment.cancels.reduce((sum: number, c: any) => sum + c.cancelAmount, 0))}원
                    </p>
                  </div>
                )}

                {payment.receiptUrl && (
                  <div className="mt-3">
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      영수증 보기
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                이전
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { CreditCard, Smartphone } from 'lucide-react';
import { getReservationById } from '../api/reservations';
import { preparePayment } from '../api/payments';
import Button from '../components/common/Button';

declare global {
  interface Window {
    TossPayments: any;
  }
}

export default function Payment() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'kakaopay' | 'naverpay'>('card');

  const { data, isLoading: reservationLoading } = useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: () => getReservationById(reservationId!),
    enabled: !!reservationId,
  });

  const reservation = data?.data;

  useEffect(() => {
    // Load Toss Payments SDK
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handlePayment = async () => {
    if (!reservation) return;

    setIsLoading(true);
    try {
      const { data: paymentData } = await preparePayment(reservationId!);

      if (!paymentData) {
        throw new Error('결제 정보를 가져올 수 없습니다.');
      }

      const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
      if (!clientKey) {
        // Dev mode: simulate payment success
        toast.info('개발 모드: 결제를 시뮬레이션합니다.');
        navigate(`/payment/success?orderId=${paymentData.orderId}&paymentKey=SIMULATED_${Date.now()}&amount=${paymentData.amount}`);
        return;
      }

      const tossPayments = await window.TossPayments(clientKey);

      const methodMap = {
        card: '카드',
        kakaopay: '카카오페이',
        naverpay: '네이버페이',
      };

      await tossPayments.requestPayment(methodMap[selectedMethod], {
        amount: paymentData.amount,
        orderId: paymentData.orderId,
        orderName: paymentData.orderName,
        customerName: paymentData.customerName,
        successUrl: paymentData.successUrl,
        failUrl: paymentData.failUrl,
      });
    } catch (error: any) {
      if (error.code === 'USER_CANCEL') {
        toast.info('결제가 취소되었습니다.');
      } else {
        toast.error(error.message || '결제 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (reservationLoading) {
    return (
      <div className="page-container">
        <div className="max-w-xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="card p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <p className="text-gray-500">예약 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const pkg = reservation.packageId as any;

  return (
    <div className="page-container">
      <div className="max-w-xl mx-auto">
        <h1 className="page-title">결제하기</h1>

        {/* Order Summary */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">주문 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">예약번호</span>
              <span className="font-medium">{reservation.reservationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">검진 패키지</span>
              <span className="font-medium">{pkg?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">검진 일시</span>
              <span className="font-medium">
                {format(new Date(reservation.reservationDate), 'yyyy년 M월 d일 (EEE)', {
                  locale: ko,
                })}{' '}
                {reservation.reservationTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">수검자</span>
              <span className="font-medium">{reservation.patientInfo.name}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">결제 수단</h2>
          <div className="space-y-3">
            <button
              onClick={() => setSelectedMethod('card')}
              className={`w-full p-4 rounded-lg border flex items-center ${
                selectedMethod === 'card'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-6 h-6 mr-3 text-gray-600" />
              <span className="font-medium">신용카드</span>
            </button>
            <button
              onClick={() => setSelectedMethod('kakaopay')}
              className={`w-full p-4 rounded-lg border flex items-center ${
                selectedMethod === 'kakaopay'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Smartphone className="w-6 h-6 mr-3 text-yellow-500" />
              <span className="font-medium">카카오페이</span>
            </button>
            <button
              onClick={() => setSelectedMethod('naverpay')}
              className={`w-full p-4 rounded-lg border flex items-center ${
                selectedMethod === 'naverpay'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Smartphone className="w-6 h-6 mr-3 text-green-500" />
              <span className="font-medium">네이버페이</span>
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">총 결제 금액</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatPrice(reservation.finalAmount)}원
            </span>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          {formatPrice(reservation.finalAmount)}원 결제하기
        </Button>
      </div>
    </div>
  );
}

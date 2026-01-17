import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { confirmPayment } from '../api/payments';
import Button from '../components/common/Button';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    const processPayment = async () => {
      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.');
        setIsProcessing(false);
        return;
      }

      try {
        await confirmPayment({
          paymentKey,
          orderId,
          amount: Number(amount),
        });
        toast.success('결제가 완료되었습니다.');
      } catch (err: any) {
        setError(err.response?.data?.message || '결제 확인 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [paymentKey, orderId, amount]);

  if (isProcessing) {
    return (
      <div className="page-container">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 처리 중...</h1>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 확인 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/mypage/reservations">
            <Button>내 예약 확인하기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">예약이 완료되었습니다</h1>
        <p className="text-gray-600 mb-8">
          검진 예약이 성공적으로 완료되었습니다.<br />
          예약 확인 문자가 발송됩니다.
        </p>

        <div className="space-y-3">
          <Link to="/mypage/reservations" className="block">
            <Button className="w-full">예약 내역 확인</Button>
          </Link>
          <Link to="/" className="block">
            <Button variant="outline" className="w-full">홈으로</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

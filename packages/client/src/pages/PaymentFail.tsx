import { Link, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Button from '../components/common/Button';

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="page-container">
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제에 실패했습니다</h1>
        <p className="text-gray-600 mb-2">
          {message || '결제 처리 중 오류가 발생했습니다.'}
        </p>
        {code && (
          <p className="text-sm text-gray-500 mb-8">오류 코드: {code}</p>
        )}

        <div className="space-y-3">
          <Link to="/mypage/reservations" className="block">
            <Button className="w-full">예약 내역에서 다시 결제</Button>
          </Link>
          <Link to="/" className="block">
            <Button variant="outline" className="w-full">홈으로</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

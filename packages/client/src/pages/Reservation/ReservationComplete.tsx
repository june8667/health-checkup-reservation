import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CheckCircle, Calendar, User, Package, MapPin, Phone } from 'lucide-react';
import { getReservationById } from '../../api/reservations';
import { GENDER_LABELS } from '../../constants/labels';
import Button from '../../components/common/Button';

export default function ReservationComplete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => getReservationById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (error) {
      navigate('/mypage');
    }
  }, [error, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatBirthDate = (birthDate: string) => {
    if (!birthDate) return '-';
    // ISO date or YYYYMMDD
    const cleaned = birthDate.split('T')[0].replace(/-/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
    return birthDate;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const reservation = data?.data;

  if (!reservation) {
    return null;
  }

  const pkg = reservation.packageId as any;
  const hospital = reservation.hospitalId as any;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">예약이 완료되었습니다!</h1>
          <p className="text-gray-600">
            예약번호: <span className="font-semibold text-primary-600">{reservation.reservationNumber}</span>
          </p>
        </div>

        {/* Reservation Details */}
        <div className="space-y-4">
          {/* 검진 정보 */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              검진 정보
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">검진 패키지</span>
                <span className="font-medium">{pkg?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">검진 일시</span>
                <span className="font-medium">
                  {format(new Date(reservation.reservationDate), 'yyyy년 M월 d일 (EEE)', { locale: ko })} {reservation.reservationTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">소요 시간</span>
                <span className="font-medium">약 {pkg?.duration || 60}분</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">결제 금액</span>
                <span className="font-medium text-primary-600">{formatPrice(reservation.finalAmount)}원</span>
              </div>
            </div>
          </div>

          {/* 수검자 정보 */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              수검자 정보
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">이름</span>
                <span className="font-medium">{reservation.patientInfo?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">연락처</span>
                <span className="font-medium">{reservation.patientInfo?.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">생년월일</span>
                <span className="font-medium">{formatBirthDate(reservation.patientInfo?.birthDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">성별</span>
                <span className="font-medium">
                  {reservation.patientInfo?.gender ? GENDER_LABELS[reservation.patientInfo.gender] : '-'}
                </span>
              </div>
              {reservation.memo && (
                <div className="pt-3 border-t">
                  <span className="text-gray-500 block mb-1">특이사항</span>
                  <span className="text-gray-900">{reservation.memo}</span>
                </div>
              )}
            </div>
          </div>

          {/* 검진센터 정보 */}
          {hospital && (
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                검진센터 정보
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">검진센터</span>
                  <span className="font-medium">{hospital.name}</span>
                </div>
                {hospital.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">주소</span>
                    <span className="font-medium text-right">
                      {hospital.address.address1} {hospital.address.address2}
                    </span>
                  </div>
                )}
                {hospital.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">연락처</span>
                    <a href={`tel:${hospital.phone}`} className="font-medium text-primary-600 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {hospital.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 안내사항 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              검진 전 안내사항
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 검진 전날 저녁 9시 이후 금식해주세요.</li>
              <li>• 검진 당일 아침 물을 포함한 모든 음식 섭취를 삼가해주세요.</li>
              <li>• 예약 시간 10분 전까지 도착해주세요.</li>
              <li>• 신분증을 반드시 지참해주세요.</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/mypage" className="flex-1">
            <Button variant="outline" className="w-full">
              내 예약 보기
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button className="w-full">
              홈으로 가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

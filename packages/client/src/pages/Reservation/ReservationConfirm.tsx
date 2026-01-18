import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { useReservationStore } from '../../store/reservationStore';
import { createReservation } from '../../api/reservations';
import { GENDER_LABELS } from '../../constants/labels';
import Button from '../../components/common/Button';

export default function ReservationConfirm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { selectedPackage, selectedDate, selectedTime, patientInfo, memo, reset } =
    useReservationStore();

  useEffect(() => {
    if (!selectedPackage || !selectedDate || !selectedTime || !patientInfo) {
      navigate('/reservation/select-package');
    }
  }, [selectedPackage, selectedDate, selectedTime, patientInfo, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 생년월일 포맷 (YYYYMMDD -> YYYY-MM-DD)
  const formatBirthDate = (birthDate: string) => {
    if (birthDate.length === 8) {
      return `${birthDate.slice(0, 4)}-${birthDate.slice(4, 6)}-${birthDate.slice(6, 8)}`;
    }
    return birthDate;
  };

  const handleSubmit = async () => {
    if (!selectedPackage || !selectedDate || !selectedTime || !patientInfo) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await createReservation({
        packageId: selectedPackage._id,
        reservationDate: format(selectedDate, 'yyyy-MM-dd'),
        reservationTime: selectedTime,
        patientInfo: {
          ...patientInfo,
          birthDate: patientInfo.birthDate,
        },
        memo,
        status: 'confirmed',
      });

      if (response.success && response.data) {
        reset();
        navigate(`/reservation/complete/${response.data._id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '예약에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/reservation/patient-info');
  };

  if (!selectedPackage || !selectedDate || !selectedTime || !patientInfo) {
    return null;
  }

  const finalPrice = selectedPackage.discountPrice || selectedPackage.price;

  return (
    <div>
      <p className="text-gray-600 mb-6">예약 정보를 확인해주세요.</p>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Package Info */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">검진 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">검진 패키지</span>
              <span className="font-medium">{selectedPackage.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">검진 일시</span>
              <span className="font-medium">
                {format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })} {selectedTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">소요 시간</span>
              <span className="font-medium">약 {selectedPackage.duration}분</span>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">수검자 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">이름</span>
              <span className="font-medium">{patientInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">연락처</span>
              <span className="font-medium">{patientInfo.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">생년월일</span>
              <span className="font-medium">{formatBirthDate(patientInfo.birthDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">성별</span>
              <span className="font-medium">{GENDER_LABELS[patientInfo.gender]}</span>
            </div>
            {memo && (
              <div className="pt-3 border-t">
                <span className="text-gray-600 block mb-1">특이사항</span>
                <span className="text-gray-900">{memo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">결제 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">검진 비용</span>
              <span className="font-medium">{formatPrice(selectedPackage.price)}원</span>
            </div>
            {selectedPackage.discountPrice && (
              <div className="flex justify-between text-red-600">
                <span>할인</span>
                <span>-{formatPrice(selectedPackage.price - selectedPackage.discountPrice)}원</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t text-lg">
              <span className="font-semibold">총 결제 금액</span>
              <span className="font-bold text-primary-600">{formatPrice(finalPrice)}원</span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">예약 전 확인사항</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 검진 전날 저녁 9시 이후 금식해주세요.</li>
            <li>• 검진 당일 아침 물을 포함한 모든 음식 섭취를 삼가해주세요.</li>
            <li>• 예약 취소는 검진일 7일 전까지 가능합니다.</li>
          </ul>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
          <Button variant="outline" onClick={handleBack} className="w-full sm:w-auto">
            이전
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading} size="lg" className="w-full sm:w-auto">
            예약하기
          </Button>
        </div>
      </div>
    </div>
  );
}

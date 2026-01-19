import { Outlet, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useReservationStore } from '../../store/reservationStore';

const steps = [
  { path: '/reservation/select-package', label: '패키지\n선택' },
  { path: '/reservation/select-date', label: '날짜/\n시간' },
  { path: '/reservation/patient-info', label: '정보\n입력' },
  { path: '/reservation/confirm', label: '예약\n확인' },
];

export default function ReservationLayout() {
  const location = useLocation();
  const { selectedPackage, selectedDate, selectedTime } = useReservationStore();
  const currentStepIndex = steps.findIndex((step) => {
    // /reservation 경로도 첫 번째 스텝으로 처리
    if (location.pathname === '/reservation' && step.path === '/reservation/select-package') {
      return true;
    }
    return step.path === location.pathname;
  });

  // 각 스텝의 활성화 여부 체크
  const isStepActive = (index: number) => {
    switch (index) {
      case 0:
        return selectedPackage !== null;
      case 1:
        return selectedDate !== null && selectedTime !== null;
      case 2:
      case 3:
        // 3번, 4번 스텝은 페이지에 들어가면 바로 활성화
        return index === currentStepIndex;
      default:
        return false;
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">검진 예약</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          {/* 연결선 - 원들 사이에 위치 */}
          <div className="absolute top-5 left-0 right-0 flex justify-between px-[calc(12.5%+20px)]">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`flex-1 h-1 ${
                  index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* 스텝 원과 라벨 */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={step.path} className="flex flex-col items-center w-1/4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors z-10 ${
                    index < currentStepIndex || (index === currentStepIndex && isStepActive(index))
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStepIndex || (index === currentStepIndex && isStepActive(index)) ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-[12px] sm:text-sm mt-2 text-center whitespace-pre-line ${
                    index < currentStepIndex || (index === currentStepIndex && isStepActive(index))
                      ? 'text-primary-600 font-medium'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}

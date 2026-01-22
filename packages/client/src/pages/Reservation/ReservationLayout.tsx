import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Check, Stethoscope, X, Clock, Calendar, ChevronRight, Activity } from 'lucide-react';
import { useReservationStore } from '../../store/reservationStore';

const steps = [
  { path: '/reservation/select-date', label: '날짜/\n시간' },
  { path: '/reservation/patient-info', label: '정보\n입력' },
  { path: '/reservation/confirm', label: '예약\n확인' },
];

export default function ReservationLayout() {
  const location = useLocation();
  const { selectedPackage, selectedDate, selectedTime } = useReservationStore();
  const [showDetailModal, setShowDetailModal] = useState(false);

  const currentStepIndex = steps.findIndex((step) => {
    // /reservation 경로도 첫 번째 스텝(날짜/시간 선택)으로 처리
    if (location.pathname === '/reservation' && step.path === '/reservation/select-date') {
      return true;
    }
    return step.path === location.pathname;
  });

  // 각 스텝의 활성화 여부 체크
  const isStepActive = (index: number) => {
    switch (index) {
      case 0:
        return selectedDate !== null && selectedTime !== null;
      case 1:
      case 2:
        // 2번, 3번 스텝은 페이지에 들어가면 바로 활성화
        return index === currentStepIndex;
      default:
        return false;
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">검진 예약</h1>

      {/* 선택된 패키지 정보 */}
      {selectedPackage && (
        <button
          onClick={() => setShowDetailModal(true)}
          className="mb-6 w-full bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200 hover:border-primary-300 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-primary-600 font-medium">예약 중인 검진</p>
              <h2 className="text-lg font-bold text-gray-900">{selectedPackage.name}</h2>
            </div>
            {selectedPackage.price === 0 ? (
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                무료
              </span>
            ) : (
              <span className="text-primary-700 font-bold">
                {new Intl.NumberFormat('ko-KR').format(selectedPackage.discountPrice || selectedPackage.price)}원
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-primary-400" />
          </div>
        </button>
      )}

      {/* 패키지 상세 모달 */}
      {showDetailModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: 'calc(100vh - 100px)' }} onClick={(e) => e.stopPropagation()}>
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedPackage.name}</h3>
                    <p className="text-primary-100 text-xs">국민건강보험공단 지원</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* 모달 바디 */}
            <div className="p-5 overflow-y-auto flex-1">
              {/* 설명 */}
              <p className="text-gray-600 text-sm mb-4">{selectedPackage.description}</p>

              {/* 기본 정보 */}
              <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>약 {selectedPackage.duration}분</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  <span>평일 가능</span>
                </div>
                {selectedPackage.price === 0 ? (
                  <span className="ml-auto bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                    무료
                  </span>
                ) : (
                  <span className="ml-auto text-lg font-bold text-primary-600">
                    {new Intl.NumberFormat('ko-KR').format(selectedPackage.discountPrice || selectedPackage.price)}원
                  </span>
                )}
              </div>

              {/* 검진 항목 */}
              {selectedPackage.items && selectedPackage.items.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-primary-600" />
                    검진 항목 ({selectedPackage.items.length}개)
                  </h4>
                  <div className="grid gap-1.5">
                    {selectedPackage.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          {/* 연결선 - 원들 사이에 위치 */}
          <div className="absolute top-5 left-0 right-0 flex justify-between px-[calc(16.67%+20px)]">
            {[0, 1].map((index) => (
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
              <div key={step.path} className="flex flex-col items-center w-1/3">
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

import { Outlet, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';

const steps = [
  { path: '/reservation/select-package', label: '패키지 선택' },
  { path: '/reservation/select-date', label: '날짜/시간' },
  { path: '/reservation/patient-info', label: '정보 입력' },
  { path: '/reservation/confirm', label: '예약 확인' },
];

export default function ReservationLayout() {
  const location = useLocation();
  const currentStepIndex = steps.findIndex((step) => step.path === location.pathname);

  return (
    <div className="page-container">
      <h1 className="page-title">검진 예약</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.path} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    index < currentStepIndex
                      ? 'bg-primary-600 text-white'
                      : index === currentStepIndex
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-sm mt-2 ${
                    index <= currentStepIndex ? 'text-primary-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-24 h-1 mx-2 ${
                    index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
}

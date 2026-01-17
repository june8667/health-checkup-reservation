import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Calendar from 'react-calendar';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getAvailableSlots } from '../../api/packages';
import { useReservationStore } from '../../store/reservationStore';
import Button from '../../components/common/Button';
import 'react-calendar/dist/Calendar.css';

export default function SelectDate() {
  const navigate = useNavigate();
  const { selectedPackage, selectedDate, selectedTime, setSelectedDate, setSelectedTime } =
    useReservationStore();

  const [calendarDate, setCalendarDate] = useState<Date>(selectedDate || new Date());

  useEffect(() => {
    if (!selectedPackage) {
      navigate('/reservation/select-package');
    }
  }, [selectedPackage, navigate]);

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['available-slots', selectedPackage?._id, selectedDate?.toISOString()],
    queryFn: () =>
      getAvailableSlots(selectedPackage!._id, format(selectedDate!, 'yyyy-MM-dd')),
    enabled: !!selectedPackage && !!selectedDate,
  });

  const slots = slotsData?.data || [];

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setCalendarDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (selectedDate && selectedTime) {
      navigate('/reservation/patient-info');
    }
  };

  const handleBack = () => {
    navigate('/reservation/select-package');
  };

  const minDate = addDays(new Date(), 1);
  const maxDate = addDays(new Date(), 90);

  const tileDisabled = ({ date }: { date: Date }) => {
    return isBefore(date, startOfDay(minDate));
  };

  if (!selectedPackage) {
    return null;
  }

  return (
    <div>
      <p className="text-gray-600 mb-6">원하시는 검진 날짜와 시간을 선택해주세요.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">날짜 선택</h3>
          <div className="flex justify-center">
            <Calendar
              onChange={(value) => handleDateChange(value as Date)}
              value={selectedDate || calendarDate}
              minDate={minDate}
              maxDate={maxDate}
              tileDisabled={tileDisabled}
              locale="ko-KR"
              className="!border-0 !w-full"
              formatDay={(_locale, date) => format(date, 'd')}
            />
          </div>
        </div>

        {/* Time Slots */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">시간 선택</h3>
          {!selectedDate ? (
            <p className="text-gray-500 text-center py-8">날짜를 먼저 선택해주세요.</p>
          ) : slotsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              선택한 날짜에 예약 가능한 시간이 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedTime === slot.time
                      ? 'bg-primary-600 text-white'
                      : slot.available
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      : 'bg-red-50 text-red-400 border border-red-200 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                  {slot.available ? (
                    <span className="block text-xs opacity-75">
                      {slot.remainingSlots}자리
                    </span>
                  ) : (
                    <span className="block text-xs">마감</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Info */}
      {selectedDate && selectedTime && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <p className="text-primary-800">
            <strong>선택하신 일시:</strong>{' '}
            {format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })} {selectedTime}
          </p>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handleBack}>
          이전
        </Button>
        <Button onClick={handleNext} disabled={!selectedDate || !selectedTime} size="lg">
          다음 단계
        </Button>
      </div>
    </div>
  );
}

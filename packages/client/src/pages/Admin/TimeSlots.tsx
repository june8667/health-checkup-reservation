import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, Lock, Unlock } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
  clearBlockedSlotsByDate,
  getAdminPackages,
} from '../../api/admin';
import Button from '../../components/common/Button';

const DEFAULT_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

export default function TimeSlots() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // 패키지 목록 조회
  const { data: packagesData } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: () => getAdminPackages({ limit: 100 }),
  });

  // 차단된 시간 조회
  const { data: blockedData, isLoading } = useQuery({
    queryKey: ['blockedSlots', format(currentWeekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd'), selectedPackageId],
    queryFn: () => getBlockedSlots({
      startDate: format(currentWeekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      packageId: selectedPackageId || undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: createBlockedSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedSlots'] });
      toast.success('시간이 차단되었습니다.');
      setSelectedSlots(new Set());
    },
    onError: () => {
      toast.error('차단에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlockedSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedSlots'] });
      toast.success('차단이 해제되었습니다.');
    },
    onError: () => {
      toast.error('차단 해제에 실패했습니다.');
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearBlockedSlotsByDate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedSlots'] });
      toast.success('해당 날짜의 차단이 모두 해제되었습니다.');
    },
    onError: () => {
      toast.error('차단 해제에 실패했습니다.');
    },
  });

  const packages = packagesData?.data?.items || [];
  const blockedSlots = blockedData?.data || [];

  // 차단된 시간 맵 생성 (날짜-시간 -> blockedSlot)
  const blockedMap = new Map<string, any>();
  blockedSlots.forEach((slot: any) => {
    const dateStr = format(new Date(slot.date), 'yyyy-MM-dd');
    const key = `${dateStr}-${slot.time}`;
    blockedMap.set(key, slot);
  });

  const isBlocked = (date: Date, time: string) => {
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    return blockedMap.has(key);
  };

  const getBlockedSlot = (date: Date, time: string) => {
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    return blockedMap.get(key);
  };

  const toggleSlotSelection = (date: Date, time: string) => {
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedSlots(newSelected);
  };

  const isSelected = (date: Date, time: string) => {
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    return selectedSlots.has(key);
  };

  const handleBlockSelected = () => {
    if (selectedSlots.size === 0) {
      toast.warning('차단할 시간을 선택해주세요.');
      return;
    }

    // 날짜별로 그룹화
    const byDate = new Map<string, string[]>();
    selectedSlots.forEach(key => {
      const [date, time] = key.split('-').reduce((acc, part, idx) => {
        if (idx < 3) {
          acc[0] = acc[0] ? `${acc[0]}-${part}` : part;
        } else {
          acc[1] = part;
        }
        return acc;
      }, ['', '']);

      const dateKey = key.substring(0, 10);
      const timeKey = key.substring(11);

      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey)!.push(timeKey);
    });

    // 각 날짜별로 차단 요청
    byDate.forEach((times, date) => {
      createMutation.mutate({
        date,
        times,
        packageId: selectedPackageId || undefined,
      });
    });
  };

  const handleUnblockSlot = (slot: any) => {
    if (window.confirm('이 시간의 차단을 해제하시겠습니까?')) {
      deleteMutation.mutate(slot._id);
    }
  };

  const handleClearDay = (date: Date) => {
    if (window.confirm(`${format(date, 'M월 d일')}의 모든 차단을 해제하시겠습니까?`)) {
      clearMutation.mutate({
        date: format(date, 'yyyy-MM-dd'),
        packageId: selectedPackageId || undefined,
      });
    }
  };

  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const isSunday = (date: Date) => date.getDay() === 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">시간 차단 관리</h1>
        <div className="flex gap-2">
          {selectedSlots.size > 0 && (
            <Button
              onClick={handleBlockSelected}
              isLoading={createMutation.isPending}
            >
              <Lock className="w-4 h-4 mr-2" />
              선택한 {selectedSlots.size}개 차단
            </Button>
          )}
        </div>
      </div>

      {/* 필터 및 네비게이션 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">전체 패키지</option>
              {packages.map((pkg: any) => (
                <option key={pkg._id} value={pkg._id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevWeek}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              오늘
            </button>
            <span className="px-4 py-2 font-medium">
              {format(currentWeekStart, 'yyyy년 M월', { locale: ko })}
            </span>
            <button
              onClick={nextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 시간표 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  시간
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={`px-2 py-3 text-center text-xs font-medium uppercase tracking-wider min-w-[100px] ${
                      isSunday(day) ? 'text-red-500 bg-red-50' : 'text-gray-500'
                    }`}
                  >
                    <div>{format(day, 'EEE', { locale: ko })}</div>
                    <div className="text-lg font-bold">{format(day, 'd')}</div>
                    {!isSunday(day) && blockedSlots.some((s: any) =>
                      format(new Date(s.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                    ) && (
                      <button
                        onClick={() => handleClearDay(day)}
                        className="mt-1 text-xs text-red-500 hover:text-red-700"
                      >
                        전체해제
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : (
                DEFAULT_TIME_SLOTS.map((time) => (
                  <tr key={time} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {time}
                    </td>
                    {weekDays.map((day) => {
                      const blocked = isBlocked(day, time);
                      const blockedSlot = getBlockedSlot(day, time);
                      const selected = isSelected(day, time);
                      const sunday = isSunday(day);

                      // 지난 시간인지 확인
                      const [hours, minutes] = time.split(':').map(Number);
                      const slotDateTime = new Date(day);
                      slotDateTime.setHours(hours, minutes, 0, 0);
                      const isPast = slotDateTime < new Date();

                      return (
                        <td
                          key={`${day.toISOString()}-${time}`}
                          className="px-2 py-2 text-center"
                        >
                          {sunday ? (
                            <div className="py-2 text-xs text-gray-400 bg-gray-50 rounded">휴무</div>
                          ) : isPast ? (
                            <div className="py-2 text-xs text-red-400 bg-red-50 rounded border border-red-100">
                              지난시간
                            </div>
                          ) : blocked ? (
                            <button
                              onClick={() => handleUnblockSlot(blockedSlot)}
                              className="w-full py-2 px-2 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors border border-red-200"
                              title={blockedSlot?.reason || '클릭하여 차단 해제'}
                            >
                              <Lock className="w-3 h-3 inline mr-1" />
                              차단됨
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleSlotSelection(day, time)}
                              className={`w-full py-2 px-2 rounded text-xs font-medium transition-colors ${
                                selected
                                  ? 'bg-blue-200 text-blue-800 ring-2 ring-blue-500 border border-blue-300'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                              }`}
                            >
                              {selected ? '선택됨' : '차단가능'}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 안내 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium mb-2">사용 방법:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>차단할 시간을 클릭하여 선택한 후 "선택한 N개 차단" 버튼을 클릭하세요.</li>
          <li>차단된 시간을 클릭하면 차단을 해제할 수 있습니다.</li>
          <li>특정 패키지만 차단하려면 상단에서 패키지를 선택하세요.</li>
          <li>일요일은 기본 휴무일입니다.</li>
        </ul>
      </div>
    </div>
  );
}

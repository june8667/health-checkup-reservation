import { useState, useEffect, useRef, useCallback, DragEvent, TouchEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { format, addDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Lock, User, GripVertical, X, Phone, Mail, Calendar, Package, CreditCard, Move } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
  clearBlockedSlotsByDate,
  getAdminPackages,
  getScheduleReservations,
  rescheduleReservation,
  deleteReservation,
  updateReservationStatus,
} from '../../api/admin';
import Button from '../../components/common/Button';

const DEFAULT_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

const STATUS_OPTIONS = [
  { value: 'confirmed', label: '예약확정' },
  { value: 'completed', label: '검진완료' },
  { value: 'cancelled', label: '취소' },
  { value: 'no_show', label: '노쇼' },
];

export default function Schedule() {
  const [searchParams] = useSearchParams();
  const highlightDate = searchParams.get('date');
  const highlightTime = searchParams.get('time');

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    if (highlightDate) {
      return startOfWeek(parseISO(highlightDate), { weekStartsOn: 1 });
    }
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  });
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [draggedReservation, setDraggedReservation] = useState<any>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // 터치 드래그 관련 상태
  const [touchDragMode, setTouchDragMode] = useState(false);
  const [touchDragPosition, setTouchDragPosition] = useState<{ x: number; y: number } | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const cellMapRef = useRef<Map<string, DOMRect>>(new Map());

  // 예약 상세 모달
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editMemo, setEditMemo] = useState<string>('');

  const queryClient = useQueryClient();

  // Navigate to week containing highlighted date if URL params change
  useEffect(() => {
    if (highlightDate) {
      setCurrentWeekStart(startOfWeek(parseISO(highlightDate), { weekStartsOn: 1 }));
    }
  }, [highlightDate]);

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // 패키지 목록 조회
  const { data: packagesData } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: () => getAdminPackages({ limit: 100 }),
  });

  // 차단된 시간 조회
  const { data: blockedData, isLoading: blockedLoading } = useQuery({
    queryKey: ['blockedSlots', format(currentWeekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd'), selectedPackageId],
    queryFn: () => getBlockedSlots({
      startDate: format(currentWeekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      packageId: selectedPackageId || undefined,
    }),
  });

  // 예약 조회
  const { data: reservationsData, isLoading: reservationsLoading } = useQuery({
    queryKey: ['scheduleReservations', format(currentWeekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd')],
    queryFn: () => getScheduleReservations({
      startDate: format(currentWeekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
    }),
  });

  const isLoading = blockedLoading || reservationsLoading;

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

  const rescheduleMutation = useMutation({
    mutationFn: rescheduleReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleReservations'] });
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
      toast.success('예약 일정이 변경되었습니다.');
    },
    onError: () => {
      toast.error('예약 일정 변경에 실패했습니다.');
    },
  });

  const deleteReservationMutation = useMutation({
    mutationFn: deleteReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleReservations'] });
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
      toast.success('예약이 삭제되어 예약 가능 상태로 변경되었습니다.');
    },
    onError: () => {
      toast.error('예약 삭제에 실패했습니다.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, memo }: { id: string; status: string; memo?: string }) =>
      updateReservationStatus(id, status, memo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleReservations'] });
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
      toast.success('예약 정보가 업데이트되었습니다.');
      setSelectedReservation(null);
    },
    onError: () => {
      toast.error('업데이트에 실패했습니다.');
    },
  });

  const packages = packagesData?.data?.items || [];
  const blockedSlots = blockedData?.data || [];
  const reservations = reservationsData?.data?.items || [];

  // 차단된 시간 맵 생성 (날짜-시간 -> blockedSlot)
  const blockedMap = new Map<string, any>();
  blockedSlots.forEach((slot: any) => {
    const dateStr = format(new Date(slot.date), 'yyyy-MM-dd');
    const key = `${dateStr}-${slot.time}`;
    blockedMap.set(key, slot);
  });

  // 예약 맵 생성 (날짜-시간 -> reservation[]) - 결제대기(pending) 제외
  const reservationMap = new Map<string, any[]>();
  reservations
    .filter((res: any) => res.status !== 'pending')
    .forEach((res: any) => {
      const dateStr = format(new Date(res.reservationDate), 'yyyy-MM-dd');
      const key = `${dateStr}-${res.reservationTime}`;
      if (!reservationMap.has(key)) {
        reservationMap.set(key, []);
      }
      reservationMap.get(key)!.push(res);
    });

  // 상태별 스타일 설정
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: '예약확정' };
      case 'completed':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: '검진완료' };
      case 'cancelled':
        return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300', label: '취소' };
      case 'no_show':
        return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', label: '노쇼' };
      default:
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: status };
    }
  };

  const isBlocked = (date: Date, time: string) => {
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    return blockedMap.has(key);
  };

  const getBlockedSlot = (date: Date, time: string) => {
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    return blockedMap.get(key);
  };

  const getReservations = (date: Date, time: string) => {
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    return reservationMap.get(key) || [];
  };

  const isHighlighted = (date: Date, time: string) => {
    return highlightDate === format(date, 'yyyy-MM-dd') && highlightTime === time;
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

  const openReservationModal = (reservation: any) => {
    setSelectedReservation(reservation);
    setEditStatus(reservation.status);
    setEditMemo(reservation.adminMemo || '');
  };

  const closeReservationModal = () => {
    setSelectedReservation(null);
    setEditStatus('');
    setEditMemo('');
  };

  const handleUpdateReservation = () => {
    if (!selectedReservation) return;
    updateStatusMutation.mutate({
      id: selectedReservation._id,
      status: editStatus,
      memo: editMemo,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, reservation: any) => {
    setDraggedReservation(reservation);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', reservation._id);
  };

  const handleDragEnd = () => {
    setDraggedReservation(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, date: Date, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    setDropTarget(key);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, date: Date, time: string) => {
    e.preventDefault();
    setDropTarget(null);

    if (!draggedReservation) return;

    const newDate = format(date, 'yyyy-MM-dd');
    const newTime = time;

    // Check if it's the same slot
    const currentDate = format(new Date(draggedReservation.reservationDate), 'yyyy-MM-dd');
    if (currentDate === newDate && draggedReservation.reservationTime === newTime) {
      return;
    }

    if (window.confirm(`예약을 ${format(date, 'M월 d일')} ${time}으로 변경하시겠습니까?`)) {
      rescheduleMutation.mutate({
        id: draggedReservation._id,
        date: newDate,
        time: newTime,
      });
    }

    setDraggedReservation(null);
  };

  const isDropTarget = (date: Date, time: string) => {
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    return dropTarget === key;
  };

  // 셀 위치 맵 업데이트
  const updateCellMap = useCallback(() => {
    if (!tableRef.current) return;
    const cells = tableRef.current.querySelectorAll('[data-cell-key]');
    cellMapRef.current.clear();
    cells.forEach((cell) => {
      const key = cell.getAttribute('data-cell-key');
      if (key) {
        cellMapRef.current.set(key, cell.getBoundingClientRect());
      }
    });
  }, []);

  // 터치 위치에서 셀 키 찾기
  const findCellAtPosition = useCallback((x: number, y: number): string | null => {
    for (const [key, rect] of cellMapRef.current.entries()) {
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return key;
      }
    }
    return null;
  }, []);

  // 터치 드래그 핸들러
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>, reservation: any) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };

    // 1초 후 드래그 모드 활성화
    touchTimerRef.current = setTimeout(() => {
      // 진동 피드백 (지원되는 경우)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      setDraggedReservation(reservation);
      setTouchDragMode(true);
      setTouchDragPosition({ x: touch.clientX, y: touch.clientY });
      updateCellMap();

      toast.info('예약을 이동할 위치로 끌어다 놓으세요', { autoClose: 2000 });
    }, 1000);
  }, [updateCellMap]);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];

    // 롱프레스 전에 움직이면 타이머 취소
    if (touchTimerRef.current && touchStartRef.current) {
      const dx = Math.abs(touch.clientX - touchStartRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartRef.current.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    }

    // 드래그 모드일 때
    if (touchDragMode && draggedReservation) {
      e.preventDefault();
      setTouchDragPosition({ x: touch.clientX, y: touch.clientY });

      // 현재 터치 위치의 셀 찾기
      const cellKey = findCellAtPosition(touch.clientX, touch.clientY);
      setDropTarget(cellKey);
    }
  }, [touchDragMode, draggedReservation, findCellAtPosition]);

  const handleTouchEnd = useCallback((_e: TouchEvent<HTMLDivElement>) => {
    // 타이머 취소
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }

    // 드래그 모드가 아니면 클릭으로 처리
    if (!touchDragMode) {
      touchStartRef.current = null;
      return;
    }

    // 드롭 처리
    if (draggedReservation && dropTarget) {
      const [dateStr, time] = dropTarget.split('-').reduce((acc, part, idx) => {
        if (idx < 3) {
          acc[0] = acc[0] ? `${acc[0]}-${part}` : part;
        } else {
          acc[1] = acc[1] ? `${acc[1]}:${part}` : part;
        }
        return acc;
      }, ['', ''] as [string, string]);

      const currentDate = format(new Date(draggedReservation.reservationDate), 'yyyy-MM-dd');

      if (currentDate !== dateStr || draggedReservation.reservationTime !== time) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const targetDate = new Date(year, month - 1, day);

        if (window.confirm(`예약을 ${format(targetDate, 'M월 d일')} ${time}으로 변경하시겠습니까?`)) {
          rescheduleMutation.mutate({
            id: draggedReservation._id,
            date: dateStr,
            time: time,
          });
        }
      }
    }

    // 상태 초기화
    setTouchDragMode(false);
    setTouchDragPosition(null);
    setDraggedReservation(null);
    setDropTarget(null);
    touchStartRef.current = null;
  }, [touchDragMode, draggedReservation, dropTarget, rescheduleMutation]);

  const handleTouchCancel = useCallback(() => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    setTouchDragMode(false);
    setTouchDragPosition(null);
    setDraggedReservation(null);
    setDropTarget(null);
    touchStartRef.current = null;
  }, []);

  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const isSunday = (date: Date) => date.getDay() === 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">스케줄 관리</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          {selectedSlots.size > 0 && (
            <Button
              onClick={handleBlockSelected}
              isLoading={createMutation.isPending}
              className="w-full sm:w-auto text-sm"
            >
              <Lock className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">선택한 </span>{selectedSlots.size}개 차단
            </Button>
          )}
        </div>
      </div>

      {/* 필터 및 네비게이션 */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">전체 패키지</option>
              {packages.map((pkg: any) => (
                <option key={pkg._id} value={pkg._id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <button
              onClick={prevWeek}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              오늘
            </button>
            <span className="px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap">
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
      <div className="bg-white rounded-lg shadow overflow-hidden -mx-4 sm:mx-0 sm:rounded-lg">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-14 sm:w-20 sticky left-0 bg-gray-50 z-10">
                  시간
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={`px-1 sm:px-2 py-2 sm:py-3 text-center text-xs font-medium uppercase tracking-wider min-w-[70px] sm:min-w-[100px] ${
                      isSunday(day) ? 'text-red-500 bg-red-50' : 'text-gray-500'
                    }`}
                  >
                    <div>{format(day, 'EEE', { locale: ko })}</div>
                    <div className="text-base sm:text-lg font-bold">{format(day, 'd')}</div>
                    {!isSunday(day) && blockedSlots.some((s: any) =>
                      format(new Date(s.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                    ) && (
                      <button
                        onClick={() => handleClearDay(day)}
                        className="mt-1 text-[10px] sm:text-xs text-red-500 hover:text-red-700"
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
                    <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      {time}
                    </td>
                    {weekDays.map((day) => {
                      const blocked = isBlocked(day, time);
                      const blockedSlot = getBlockedSlot(day, time);
                      const slotReservations = getReservations(day, time);
                      const selected = isSelected(day, time);
                      const sunday = isSunday(day);
                      const highlighted = isHighlighted(day, time);

                      // 지난 시간인지 확인
                      const [hours, minutes] = time.split(':').map(Number);
                      const slotDateTime = new Date(day);
                      slotDateTime.setHours(hours, minutes, 0, 0);
                      const isPast = slotDateTime < new Date();

                      return (
                        <td
                          key={`${day.toISOString()}-${time}`}
                          className={`px-1 sm:px-2 py-1 sm:py-2 text-center ${highlighted ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}
                        >
                          {sunday ? (
                            <div className="py-2 text-xs text-gray-400 bg-gray-50 rounded">휴무</div>
                          ) : slotReservations.length > 0 ? (
                            <div className="w-full space-y-1">
                              {slotReservations.map((res: any) => {
                                const statusStyle = getStatusStyle(res.status);
                                const isCancelled = res.status === 'cancelled';
                                const isDraggable = !isCancelled && res.status !== 'completed';

                                return (
                                  <div
                                    key={res._id}
                                    draggable={isDraggable}
                                    onDragStart={isDraggable ? (e) => handleDragStart(e, res) : undefined}
                                    onDragEnd={isDraggable ? handleDragEnd : undefined}
                                    onTouchStart={isDraggable ? (e) => handleTouchStart(e, res) : undefined}
                                    onTouchMove={isDraggable ? handleTouchMove : undefined}
                                    onTouchEnd={isDraggable ? handleTouchEnd : undefined}
                                    onTouchCancel={isDraggable ? handleTouchCancel : undefined}
                                    onClick={() => !touchDragMode && openReservationModal(res)}
                                    className={`w-full py-1 px-1 ${statusStyle.bg} ${statusStyle.text} rounded text-xs font-medium border ${statusStyle.border} hover:opacity-80 transition-opacity cursor-pointer ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''} ${touchDragMode && draggedReservation?._id === res._id ? 'opacity-50 ring-2 ring-primary-500' : ''}`}
                                    title="클릭하여 상세 보기 (길게 누르면 이동)"
                                  >
                                    <div className="flex items-center justify-center gap-1">
                                      {isDraggable && <GripVertical className="w-3 h-3 opacity-50 hidden sm:block" />}
                                      {isDraggable && <Move className="w-3 h-3 opacity-50 sm:hidden" />}
                                      <User className="w-3 h-3" />
                                      <span className={isCancelled ? 'line-through' : ''}>{res.patientInfo?.name || res.userId?.name || '예약자'}</span>
                                    </div>
                                    <div className="text-[10px] truncate opacity-75">
                                      {res.packageId?.name || '패키지'}
                                    </div>
                                    <div className="text-[10px] font-bold">
                                      [{statusStyle.label}]
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
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
                            <div
                              data-cell-key={`${format(day, 'yyyy-MM-dd')}-${time}`}
                              onDragOver={(e) => handleDragOver(e, day, time)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, day, time)}
                              className={`w-full transition-all ${isDropTarget(day, time) ? 'ring-2 ring-green-400 bg-green-50 rounded' : ''}`}
                            >
                              <button
                                onClick={() => !touchDragMode && toggleSlotSelection(day, time)}
                                className={`w-full py-2 px-2 rounded text-xs font-medium transition-colors ${
                                  selected
                                    ? 'bg-blue-200 text-blue-800 ring-2 ring-blue-500 border border-blue-300'
                                    : isDropTarget(day, time)
                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                }`}
                              >
                                {isDropTarget(day, time) ? '여기에 놓기' : selected ? '선택됨' : '예약가능'}
                              </button>
                            </div>
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

      {/* 범례 및 안내 */}
      <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg text-xs sm:text-sm text-gray-600">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-200 rounded flex-shrink-0"></div>
            <span>예약확정</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border border-blue-200 rounded flex-shrink-0"></div>
            <span>검진완료</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-100 border border-orange-200 rounded flex-shrink-0"></div>
            <span>노쇼</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 border border-gray-300 rounded flex-shrink-0"></div>
            <span>취소</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-50 border border-blue-200 rounded flex-shrink-0"></div>
            <span>예약가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border border-red-200 rounded flex-shrink-0"></div>
            <span>차단됨</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-50 border border-red-100 rounded flex-shrink-0"></div>
            <span>지난시간</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-50 border border-gray-200 rounded flex-shrink-0"></div>
            <span>휴무</span>
          </div>
        </div>
        <details className="sm:hidden">
          <summary className="font-medium mb-2 cursor-pointer">사용 방법 보기</summary>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>예약 카드를 클릭하면 상세 정보를 확인할 수 있습니다.</li>
            <li><strong>예약 카드를 1초간 길게 누르면</strong> 다른 시간으로 이동할 수 있습니다.</li>
            <li>차단할 시간을 클릭하여 선택 후 차단 버튼을 누르세요.</li>
            <li>차단된 시간을 클릭하면 해제됩니다.</li>
          </ul>
        </details>
        <div className="hidden sm:block">
          <p className="font-medium mb-2">사용 방법:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>예약확정 카드를 드래그하여 다른 예약가능 시간으로 이동할 수 있습니다.</li>
            <li>예약 카드를 클릭하면 상세 정보 확인 및 상태 변경이 가능합니다.</li>
            <li>차단할 시간을 클릭하여 선택한 후 "선택한 N개 차단" 버튼을 클릭하세요.</li>
            <li>차단된 시간을 클릭하면 차단을 해제할 수 있습니다.</li>
            <li>특정 패키지만 차단하려면 상단에서 패키지를 선택하세요.</li>
            <li>일요일은 기본 휴무일입니다.</li>
          </ul>
        </div>
      </div>

      {/* 터치 드래그 인디케이터 */}
      {touchDragMode && touchDragPosition && draggedReservation && (
        <div
          className="fixed pointer-events-none z-50 bg-primary-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium"
          style={{
            left: touchDragPosition.x - 60,
            top: touchDragPosition.y - 50,
          }}
        >
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4" />
            <span>{draggedReservation.patientInfo?.name || '예약자'}</span>
          </div>
          <div className="text-xs opacity-75 mt-1">
            {dropTarget ? '손을 떼면 이동' : '이동할 위치로'}
          </div>
        </div>
      )}

      {/* 예약 상세 모달 */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">예약 상세 정보</h3>
              <button
                onClick={closeReservationModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* 예약 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  예약 정보
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">예약번호</span>
                    <p className="font-medium">{selectedReservation.reservationNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">예약일시</span>
                    <p className="font-medium">
                      {format(new Date(selectedReservation.reservationDate), 'yyyy-MM-dd')} {selectedReservation.reservationTime}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">현재 상태</span>
                    <p className={`font-medium ${getStatusStyle(selectedReservation.status).text}`}>
                      {getStatusStyle(selectedReservation.status).label}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">예약일</span>
                    <p className="font-medium">
                      {format(new Date(selectedReservation.createdAt), 'yyyy-MM-dd HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 고객 정보 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  고객 정보
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 w-16">이름</span>
                    <span className="font-medium">{selectedReservation.patientInfo?.name || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 w-16">연락처</span>
                    <span className="font-medium">{selectedReservation.patientInfo?.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 w-16">이메일</span>
                    <span className="font-medium">{selectedReservation.userId?.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 w-16">생년월일</span>
                    <span className="font-medium">{selectedReservation.patientInfo?.birthDate || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 w-16">성별</span>
                    <span className="font-medium">
                      {selectedReservation.patientInfo?.gender === 'male' ? '남성' :
                       selectedReservation.patientInfo?.gender === 'female' ? '여성' : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 패키지 및 결제 정보 */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  패키지 및 결제
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 w-16">패키지</span>
                    <span className="font-medium">{selectedReservation.packageId?.name || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 w-16">결제금액</span>
                    <span className="font-medium">{formatPrice(selectedReservation.finalAmount || 0)}원</span>
                  </div>
                </div>
              </div>

              {/* 상태 변경 */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">상태 변경</h4>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 관리자 메모 */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">관리자 메모</h4>
                <textarea
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="메모를 입력하세요"
                />
              </div>
            </div>

            <div className="flex justify-between gap-2 p-4 border-t sticky bottom-0 bg-white">
              {selectedReservation.status === 'cancelled' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (window.confirm('취소된 예약을 삭제하시겠습니까?')) {
                      deleteReservationMutation.mutate(selectedReservation._id);
                      closeReservationModal();
                    }
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  예약 삭제
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="secondary"
                  onClick={closeReservationModal}
                >
                  닫기
                </Button>
                <Button
                  onClick={handleUpdateReservation}
                  isLoading={updateStatusMutation.isPending}
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

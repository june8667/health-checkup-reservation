import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { Search, Filter, Calendar } from 'lucide-react';
import { getAdminReservations, updateReservationStatus, deleteReservation } from '../../api/admin';
import Button from '../../components/common/Button';
import ReservationDetailModal from '../../components/ReservationDetailModal';

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'pending', label: '결제대기' },
  { value: 'confirmed', label: '예약확정' },
  { value: 'completed', label: '검진완료' },
  { value: 'cancelled', label: '취소' },
  { value: 'no_show', label: '노쇼' },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat('ko-KR').format(price);
}

export default function Reservations() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminReservations', page, search, status],
    queryFn: () => getAdminReservations({ page, limit: 20, search, status }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminMemo }: { id: string; status: string; adminMemo?: string }) =>
      updateReservationStatus(id, status, adminMemo),
    onSuccess: () => {
      toast.success('예약 상태가 업데이트되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
      queryClient.invalidateQueries({ queryKey: ['scheduleReservations'] });
      setSelectedReservation(null);
    },
    onError: () => {
      toast.error('상태 업데이트에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReservation,
    onSuccess: () => {
      toast.success('예약이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
      queryClient.invalidateQueries({ queryKey: ['scheduleReservations'] });
      setSelectedReservation(null);
    },
    onError: () => {
      toast.error('예약 삭제에 실패했습니다.');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleUpdate = (id: string, data: { status?: string; adminMemo?: string }) => {
    if (data.status) {
      updateMutation.mutate({
        id,
        status: data.status,
        adminMemo: data.adminMemo,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const reservations = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  const goToSchedule = (reservation: any) => {
    const date = format(new Date(reservation.reservationDate), 'yyyy-MM-dd');
    const time = reservation.reservationTime;
    navigate(`/admin/schedule?date=${date}&time=${time}`);
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-8">예약 관리</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="예약번호, 이름, 연락처 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5 hidden sm:block" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button type="submit" className="flex-shrink-0">검색</Button>
          </div>
        </form>
      </div>

      {/* 모바일 카드 뷰 */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
            로딩 중...
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            예약이 없습니다.
          </div>
        ) : (
          reservations.map((reservation: any) => (
            <div
              key={reservation._id}
              onClick={() => setSelectedReservation(reservation)}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <StatusBadge status={reservation.status} />
                  <p className="text-xs text-gray-500 mt-1">{reservation.reservationNumber}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSchedule(reservation);
                  }}
                  className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
                >
                  <Calendar className="w-3 h-3" />
                  스케줄
                </button>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{reservation.patientInfo?.name}</p>
                <p className="text-sm text-gray-500">{reservation.patientInfo?.phone}</p>
                <p className="text-sm text-gray-600">{reservation.packageId?.name}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-500">
                    {format(new Date(reservation.reservationDate), 'MM/dd', { locale: ko })} {reservation.reservationTime}
                  </span>
                  <span className="font-medium text-primary-600">{formatPrice(reservation.finalAmount)}원</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 데스크톱 테이블 뷰 */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  패키지
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    예약이 없습니다.
                  </td>
                </tr>
              ) : (
                reservations.map((reservation: any) => (
                  <tr
                    key={reservation._id}
                    onClick={() => setSelectedReservation(reservation)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.reservationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reservation.patientInfo?.name}</div>
                      <div className="text-sm text-gray-500">{reservation.patientInfo?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.packageId?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(reservation.reservationDate), 'yyyy-MM-dd', { locale: ko })}{' '}
                      {reservation.reservationTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(reservation.finalAmount)}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={reservation.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToSchedule(reservation);
                        }}
                        className="text-green-600 hover:text-green-800 flex items-center gap-1"
                      >
                        <Calendar className="w-4 h-4" />
                        스케줄
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 px-4 py-3 bg-white rounded-lg shadow flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            총 {data?.data?.total}건 중 {(page - 1) * 20 + 1}-
            {Math.min(page * 20, data?.data?.total || 0)}건
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              이전
            </button>
            <span className="px-3 py-1 text-sm">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* 예약 상세 모달 */}
      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          isAdmin={true}
          onClose={() => setSelectedReservation(null)}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          isUpdating={updateMutation.isPending}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: '결제대기', className: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: '예약확정', className: 'bg-green-100 text-green-800' },
    cancelled: { label: '취소', className: 'bg-red-100 text-red-800' },
    completed: { label: '검진완료', className: 'bg-blue-100 text-blue-800' },
    no_show: { label: '노쇼', className: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { Search, Filter, X, Calendar, User, Phone, Mail, Package, CreditCard } from 'lucide-react';
import { getAdminReservations, updateReservationStatus, deleteReservation } from '../../api/admin';
import Button from '../../components/common/Button';

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
  const [newStatus, setNewStatus] = useState('');
  const [memo, setMemo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminReservations', page, search, status],
    queryFn: () => getAdminReservations({ page, limit: 20, search, status }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, memo }: { id: string; status: string; memo?: string }) =>
      updateReservationStatus(id, status, memo),
    onSuccess: () => {
      toast.success('예약 상태가 업데이트되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
      queryClient.invalidateQueries({ queryKey: ['scheduleReservations'] });
      setSelectedReservation(null);
      setNewStatus('');
      setMemo('');
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'text-yellow-800', label: '결제대기' };
      case 'confirmed':
        return { text: 'text-green-800', label: '예약확정' };
      case 'completed':
        return { text: 'text-blue-800', label: '검진완료' };
      case 'cancelled':
        return { text: 'text-red-800', label: '취소' };
      case 'no_show':
        return { text: 'text-orange-800', label: '노쇼' };
      default:
        return { text: 'text-gray-800', label: status };
    }
  };

  const openReservationModal = (reservation: any) => {
    setSelectedReservation(reservation);
    setNewStatus(reservation.status);
    setMemo(reservation.adminMemo || '');
  };

  const closeReservationModal = () => {
    setSelectedReservation(null);
    setNewStatus('');
    setMemo('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleUpdateStatus = () => {
    if (!selectedReservation || !newStatus) return;
    updateMutation.mutate({
      id: selectedReservation._id,
      status: newStatus,
      memo,
    });
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">예약 관리</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="예약번호, 이름, 연락처 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit">검색</Button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    onClick={() => openReservationModal(reservation)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              총 {data?.data?.total}건 중 {(page - 1) * 20 + 1}-
              {Math.min(page * 20, data?.data?.total || 0)}건
            </div>
            <div className="flex gap-2">
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
      </div>

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
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {STATUS_OPTIONS.filter((o) => o.value).map((option) => (
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
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
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
                      deleteMutation.mutate(selectedReservation._id);
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
                  onClick={handleUpdateStatus}
                  isLoading={updateMutation.isPending}
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

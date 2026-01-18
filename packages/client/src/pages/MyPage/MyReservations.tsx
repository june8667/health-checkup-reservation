import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronRight, X, Package as PackageIcon, User, MapPin, Calendar, CreditCard } from 'lucide-react';
import { getMyReservations, cancelReservation } from '../../api/reservations';
import { RESERVATION_STATUS_LABELS, GENDER_LABELS } from '../../constants/labels';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

export default function MyReservations() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [detailReservation, setDetailReservation] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-reservations', page, statusFilter],
    queryFn: () => getMyReservations(page, 10, statusFilter || undefined),
  });

  const reservations = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('예약을 취소하시겠습니까?')) return;

    setCancellingId(id);
    try {
      const response = await cancelReservation(id);
      toast.success(
        `예약이 취소되었습니다. 환불 예정 금액: ${formatPrice(response.data?.refundAmount || 0)}원`
      );
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '예약 취소에 실패했습니다.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">예약 내역</h2>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input w-auto"
        >
          <option value="">전체</option>
          <option value="pending">결제 대기</option>
          <option value="confirmed">예약 확정</option>
          <option value="completed">검진 완료</option>
          <option value="cancelled">예약 취소</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 mb-4">예약 내역이 없습니다.</p>
          <Link to="/reservation">
            <Button>예약하러가기</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reservations.map((reservation: any) => (
              <div key={reservation._id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {RESERVATION_STATUS_LABELS[reservation.status]}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      예약번호: {reservation.reservationNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailReservation(reservation)}
                    className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">
                  {reservation.packageId?.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {format(new Date(reservation.reservationDate), 'yyyy년 M월 d일 (EEE)', {
                    locale: ko,
                  })}{' '}
                  {reservation.reservationTime}
                </p>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-primary-600">
                    {formatPrice(reservation.finalAmount)}원
                  </span>

                  <div className="flex gap-2">
                    {reservation.status === 'pending' && (
                      <Link to={`/payment/${reservation._id}`}>
                        <Button size="sm">결제하기</Button>
                      </Link>
                    )}
                    {['pending', 'confirmed'].includes(reservation.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(reservation._id)}
                        isLoading={cancellingId === reservation._id}
                      >
                        취소
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                이전
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}

      {/* 상세보기 모달 */}
      {detailReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">예약 상세</h3>
              <button
                onClick={() => setDetailReservation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 예약 정보 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">예약 정보</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">예약번호</span>
                    <span className="font-medium">{detailReservation.reservationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">예약일시</span>
                    <span className="font-medium">
                      {detailReservation.reservationDate && format(new Date(detailReservation.reservationDate), 'yyyy년 M월 d일 (EEE)', {
                        locale: ko,
                      })}{' '}
                      {detailReservation.reservationTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">상태</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        detailReservation.status
                      )}`}
                    >
                      {RESERVATION_STATUS_LABELS[detailReservation.status]}
                    </span>
                  </div>
                </div>
              </div>

              {/* 검진 패키지 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <PackageIcon className="w-5 h-5 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">검진 패키지</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-1">
                    {detailReservation.packageId?.name}
                  </h5>
                  {detailReservation.packageId?.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {detailReservation.packageId.description}
                    </p>
                  )}
                  {detailReservation.packageId?.items && detailReservation.packageId.items.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">검진 항목:</p>
                      <ul className="space-y-2">
                        {detailReservation.packageId.items.map((item: any, index: number) => (
                          <li key={index} className="bg-white rounded border p-2">
                            <span className="font-medium text-gray-900">{item.name || item}</span>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 수검자 정보 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">수검자 정보</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이름</span>
                    <span className="font-medium">{detailReservation.patientInfo?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">연락처</span>
                    <span className="font-medium">{detailReservation.patientInfo?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">생년월일</span>
                    <span className="font-medium">{detailReservation.patientInfo?.birthDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">성별</span>
                    <span className="font-medium">
                      {GENDER_LABELS[detailReservation.patientInfo?.gender] || detailReservation.patientInfo?.gender}
                    </span>
                  </div>
                </div>
              </div>

              {/* 검진센터 정보 */}
              {detailReservation.hospitalId && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <h4 className="font-semibold text-gray-900">검진센터 정보</h4>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">센터명</span>
                      <span className="font-medium">{detailReservation.hospitalId.name}</span>
                    </div>
                    {detailReservation.hospitalId.address && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">주소</span>
                        <span className="font-medium text-right">
                          {detailReservation.hospitalId.address.address1} {detailReservation.hospitalId.address.address2}
                        </span>
                      </div>
                    )}
                    {detailReservation.hospitalId.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">연락처</span>
                        <span className="font-medium">{detailReservation.hospitalId.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 결제 정보 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">결제 정보</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 금액</span>
                    <span className="font-semibold text-primary-600">
                      {formatPrice(detailReservation.finalAmount)}원
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              {['pending', 'confirmed'].includes(detailReservation.status) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCancel(detailReservation._id);
                    setDetailReservation(null);
                  }}
                >
                  예약 취소
                </Button>
              )}
              <Button onClick={() => setDetailReservation(null)}>닫기</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

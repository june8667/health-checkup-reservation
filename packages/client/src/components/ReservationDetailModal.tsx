import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X, Calendar, Package, User, MapPin, CreditCard, FileText, MessageSquare } from 'lucide-react';
import Button from './common/Button';
import { RESERVATION_STATUS_LABELS, GENDER_LABELS } from '../constants/labels';

interface ReservationDetailModalProps {
  reservation: any;
  isAdmin?: boolean;
  onClose: () => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: { status?: string; adminMemo?: string; specialNotes?: string }) => void;
  isUpdating?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: '결제대기' },
  { value: 'confirmed', label: '예약확정' },
  { value: 'completed', label: '검진완료' },
  { value: 'cancelled', label: '취소' },
  { value: 'no_show', label: '노쇼' },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat('ko-KR').format(price);
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'no_show':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function ReservationDetailModal({
  reservation,
  isAdmin = false,
  onClose,
  onCancel,
  onDelete,
  onUpdate,
  isUpdating = false,
}: ReservationDetailModalProps) {
  const [status, setStatus] = useState(reservation.status);
  const [adminMemo, setAdminMemo] = useState(reservation.adminMemo || '');
  const [specialNotes, setSpecialNotes] = useState(reservation.specialNotes || reservation.memo || '');

  useEffect(() => {
    setStatus(reservation.status);
    setAdminMemo(reservation.adminMemo || '');
    setSpecialNotes(reservation.specialNotes || reservation.memo || '');
  }, [reservation]);

  const handleSave = () => {
    if (onUpdate) {
      if (isAdmin) {
        onUpdate(reservation._id, { status, adminMemo });
      } else {
        onUpdate(reservation._id, { specialNotes });
      }
    }
  };

  const hasChanges = isAdmin
    ? status !== reservation.status || adminMemo !== (reservation.adminMemo || '')
    : specialNotes !== (reservation.specialNotes || reservation.memo || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900">예약 상세</h3>
          <button
            onClick={onClose}
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
                <span className="font-medium">{reservation.reservationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">예약일시</span>
                <span className="font-medium">
                  {reservation.reservationDate &&
                    format(new Date(reservation.reservationDate), 'yyyy년 M월 d일 (EEE)', {
                      locale: ko,
                    })}{' '}
                  {reservation.reservationTime}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">상태</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                  {RESERVATION_STATUS_LABELS[reservation.status] || reservation.status}
                </span>
              </div>
            </div>
          </div>

          {/* 검진 패키지 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-gray-900">검진 패키지</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-1">
                {reservation.packageId?.name}
              </h5>
              {reservation.packageId?.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {reservation.packageId.description}
                </p>
              )}
              {reservation.packageId?.items && reservation.packageId.items.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">검진 항목:</p>
                  <ul className="space-y-2">
                    {reservation.packageId.items.map((item: any, index: number) => (
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
                <span className="font-medium">{reservation.patientInfo?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">연락처</span>
                <span className="font-medium">{reservation.patientInfo?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">생년월일</span>
                <span className="font-medium">{reservation.patientInfo?.birthDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">성별</span>
                <span className="font-medium">
                  {GENDER_LABELS[reservation.patientInfo?.gender] || reservation.patientInfo?.gender}
                </span>
              </div>
            </div>
          </div>

          {/* 검진센터 정보 */}
          {reservation.hospitalId && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h4 className="font-semibold text-gray-900">검진센터 정보</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">센터명</span>
                  <span className="font-medium">{reservation.hospitalId.name}</span>
                </div>
                {reservation.hospitalId.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">주소</span>
                    <span className="font-medium text-right">
                      {reservation.hospitalId.address.address1} {reservation.hospitalId.address.address2}
                    </span>
                  </div>
                )}
                {reservation.hospitalId.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">연락처</span>
                    <span className="font-medium">{reservation.hospitalId.phone}</span>
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
                  {formatPrice(reservation.finalAmount)}원
                </span>
              </div>
            </div>
          </div>

          {/* 특이사항 (고객 수정 가능) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-gray-900">특이사항</h4>
            </div>
            {isAdmin ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {reservation.specialNotes || reservation.memo || '등록된 특이사항이 없습니다.'}
                </p>
              </div>
            ) : (
              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="알레르기, 복용 중인 약물 등 검진에 참고할 사항을 입력해주세요"
              />
            )}
          </div>

          {/* 관리자 메모 (관리자만 수정 가능) */}
          {isAdmin && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                <h4 className="font-semibold text-gray-900">관리자 메모</h4>
              </div>
              <textarea
                value={adminMemo}
                onChange={(e) => setAdminMemo(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="관리자 메모를 입력하세요"
              />
            </div>
          )}

          {/* 상태 변경 (관리자만) */}
          {isAdmin && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h4 className="font-semibold text-gray-900">상태 변경</h4>
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between gap-3">
          <div>
            {isAdmin && reservation.status === 'cancelled' && onDelete && (
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm('취소된 예약을 삭제하시겠습니까?')) {
                    onDelete(reservation._id);
                  }
                }}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                예약 삭제
              </Button>
            )}
            {!isAdmin && ['pending', 'confirmed'].includes(reservation.status) && onCancel && (
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm('예약을 취소하시겠습니까?')) {
                    onCancel(reservation._id);
                  }
                }}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                예약 취소
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
            {hasChanges && onUpdate && (
              <Button onClick={handleSave} isLoading={isUpdating}>
                저장
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import Button from './common/Button';

interface UserDetailModalProps {
  user: any;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

const GENDER_OPTIONS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
];

const ROLE_OPTIONS = [
  { value: 'user', label: '일반회원' },
  { value: 'admin', label: '관리자' },
];

export default function UserDetailModal({
  user,
  onClose,
  onUpdate,
  onDelete,
  isUpdating = false,
}: UserDetailModalProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    birthDate: user.birthDate ? format(new Date(user.birthDate), 'yyyy-MM-dd') : '',
    gender: user.gender || 'male',
    role: user.role || 'user',
    isVerified: user.isVerified || false,
    marketingConsent: user.marketingConsent || false,
  });

  useEffect(() => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      birthDate: user.birthDate ? format(new Date(user.birthDate), 'yyyy-MM-dd') : '',
      gender: user.gender || 'male',
      role: user.role || 'user',
      isVerified: user.isVerified || false,
      marketingConsent: user.marketingConsent || false,
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = () => {
    onUpdate(user._id, formData);
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      onDelete(user._id);
    }
  };

  const hasChanges =
    formData.name !== user.name ||
    formData.phone !== user.phone ||
    formData.birthDate !== (user.birthDate ? format(new Date(user.birthDate), 'yyyy-MM-dd') : '') ||
    formData.gender !== user.gender ||
    formData.role !== user.role ||
    formData.isVerified !== user.isVerified ||
    formData.marketingConsent !== user.marketingConsent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900">회원 상세정보</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 이메일 (수정 불가) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">이메일</label>
            </div>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500"
            />
          </div>

          {/* 이름 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">이름</label>
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 연락처 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">연락처</label>
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 생년월일 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">생년월일</label>
            </div>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">성별</label>
            <div className="flex gap-4">
              {GENDER_OPTIONS.map(option => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={formData.gender === option.value}
                    onChange={handleChange}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 권한 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">권한</label>
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {ROLE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 체크박스들 */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">이메일 인증됨</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="marketingConsent"
                checked={formData.marketingConsent}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">마케팅 수신 동의</span>
            </label>
          </div>

          {/* 가입일/최근 로그인 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">가입일</span>
              <span className="text-gray-900">
                {user.createdAt && format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">최근 로그인</span>
              <span className="text-gray-900">
                {user.lastLoginAt
                  ? format(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm')
                  : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            회원 삭제
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
            {hasChanges && (
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

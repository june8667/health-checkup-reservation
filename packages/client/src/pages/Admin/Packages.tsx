import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search, Filter, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getAdminPackages,
  createAdminPackage,
  updateAdminPackage,
  deleteAdminPackage,
  PackageInput,
  getExaminationItems,
  ExaminationItem,
} from '../../api/admin';
import Button from '../../components/common/Button';
import ExaminationItems from './ExaminationItems';

const CATEGORY_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'basic', label: '기본검진' },
  { value: 'standard', label: '표준검진' },
  { value: 'premium', label: '프리미엄' },
  { value: 'specialized', label: '특화검진' },
  { value: 'custom', label: '선택 건강검진' },
];

const GENDER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
];

const DAY_OPTIONS = [
  { value: 0, label: '일' },
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' },
];

interface PackageFormData {
  name: string;
  description: string;
  category: 'basic' | 'standard' | 'premium' | 'specialized' | 'custom';
  selectedItemIds: string[];
  price: string;
  discountPrice: string;
  duration: number;
  targetGender: 'male' | 'female' | 'all';
  targetAgeMin?: number;
  targetAgeMax?: number;
  availableDays: number[];
  maxReservationsPerSlot: number;
  isActive: boolean;
  displayOrder: number;
  tags: string[];
}

const initialFormData: PackageFormData = {
  name: '',
  description: '',
  category: 'basic',
  selectedItemIds: [],
  price: '',
  discountPrice: '',
  duration: 120,
  targetGender: 'all',
  targetAgeMin: undefined,
  targetAgeMax: undefined,
  availableDays: [1, 2, 3, 4, 5],
  maxReservationsPerSlot: 10,
  isActive: true,
  displayOrder: 0,
  tags: [],
};

export default function Packages() {
  const [activeTab, setActiveTab] = useState<'packages' | 'items'>('packages');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [formData, setFormData] = useState<PackageFormData>(initialFormData);

  const queryClient = useQueryClient();

  // 검진항목 목록 조회 (패키지 생성/수정 시 사용)
  const { data: examinationItemsData } = useQuery({
    queryKey: ['examinationItems'],
    queryFn: () => getExaminationItems({ isActive: true }),
  });
  const allExaminationItems: ExaminationItem[] = examinationItemsData?.data || [];

  const { data, isLoading } = useQuery({
    queryKey: ['adminPackages', page, search, category],
    queryFn: () => getAdminPackages({ page, limit: 20, search, category }),
  });

  const createMutation = useMutation({
    mutationFn: createAdminPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPackages'] });
      toast.success('패키지가 등록되었습니다.');
      closeModal();
    },
    onError: () => {
      toast.error('패키지 등록에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PackageInput> }) =>
      updateAdminPackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPackages'] });
      toast.success('패키지가 수정되었습니다.');
      closeModal();
    },
    onError: () => {
      toast.error('패키지 수정에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPackages'] });
      toast.success('패키지가 삭제되었습니다.');
    },
    onError: () => {
      toast.error('패키지 삭제에 실패했습니다.');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingPackage(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: any) => {
    setEditingPackage(pkg);
    // 기존 패키지의 items에서 itemId 추출 또는 이름으로 매칭
    const itemIds = pkg.items?.map((item: any) => {
      // itemId가 있으면 사용
      if (item.itemId) return item.itemId;
      // 없으면 이름으로 매칭 시도 (기존 데이터 호환)
      const found = allExaminationItems.find((ei) => ei.name === item.name);
      return found?._id;
    }).filter(Boolean) || [];

    setFormData({
      name: pkg.name,
      description: pkg.description,
      category: pkg.category,
      selectedItemIds: itemIds,
      price: pkg.price?.toString() || '',
      discountPrice: pkg.discountPrice?.toString() || '',
      duration: pkg.duration,
      targetGender: pkg.targetGender,
      targetAgeMin: pkg.targetAgeMin,
      targetAgeMax: pkg.targetAgeMax,
      availableDays: pkg.availableDays || [1, 2, 3, 4, 5],
      maxReservationsPerSlot: pkg.maxReservationsPerSlot,
      isActive: pkg.isActive,
      displayOrder: pkg.displayOrder,
      tags: pkg.tags || [],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 선택된 검진항목들을 items 배열로 변환 (itemId 포함하여 저장)
    const selectedItems = formData.selectedItemIds
      .map((id) => allExaminationItems.find((item) => item._id === id))
      .filter(Boolean)
      .map((item) => ({
        itemId: item!._id,
        name: item!.name,
        description: item!.description,
        price: item!.price,
      }));

    // 검진항목 가격 합산
    const itemsTotalPrice = selectedItems.reduce((sum, item) => sum + (item.price || 0), 0);

    const discountPriceNum = formData.discountPrice ? parseInt(formData.discountPrice.replace(/,/g, '')) : undefined;

    const submitData: Partial<PackageInput> = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      items: selectedItems,
      price: itemsTotalPrice,
      discountPrice: discountPriceNum,
      duration: formData.duration,
      targetGender: formData.targetGender,
      targetAgeMin: formData.targetAgeMin,
      targetAgeMax: formData.targetAgeMax,
      availableDays: formData.availableDays,
      maxReservationsPerSlot: formData.maxReservationsPerSlot,
      isActive: formData.isActive,
      displayOrder: formData.displayOrder,
      tags: formData.tags,
    };

    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage._id, data: submitData });
    } else {
      createMutation.mutate(submitData as PackageInput);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('이 패키지를 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelectedIds = formData.selectedItemIds.includes(itemId)
      ? formData.selectedItemIds.filter((id) => id !== itemId)
      : [...formData.selectedItemIds, itemId];
    setFormData({ ...formData, selectedItemIds: newSelectedIds });
  };

  const toggleDay = (day: number) => {
    const newDays = formData.availableDays.includes(day)
      ? formData.availableDays.filter((d) => d !== day)
      : [...formData.availableDays, day].sort();
    setFormData({ ...formData, availableDays: newDays });
  };

  // 선택된 검진항목 가격 합산
  const getSelectedItemsTotalPrice = () => {
    return formData.selectedItemIds.reduce((sum, id) => {
      const item = allExaminationItems.find((ei) => ei._id === id);
      return sum + (item?.price || 0);
    }, 0);
  };

  const packages = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  // 패키지의 items 배열에서 가격 합산 계산
  const getPackageItemsTotal = (pkg: any) => {
    if (!pkg.items || pkg.items.length === 0) return 0;
    return pkg.items.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">패키지 관리</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'packages'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          패키지 관리
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'items'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          검진항목 관리
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'items' ? (
        <ExaminationItems />
      ) : (
        <>
          {/* Package Management Content */}
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateModal} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              새 패키지 등록
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="패키지명, 설명 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5 hidden sm:block" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {CATEGORY_OPTIONS.map((option) => (
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
        ) : packages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            등록된 패키지가 없습니다.
          </div>
        ) : (
          packages.map((pkg: any) => (
            <div key={pkg._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryBadge category={pkg.category} />
                    <span
                      className={`px-2 text-xs font-semibold rounded-full ${
                        pkg.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {pkg.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900">{pkg.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pkg.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div>
                  {pkg.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-400">
                        {getPackageItemsTotal(pkg).toLocaleString()}원
                      </span>
                      <span className="text-red-600 font-bold">
                        {pkg.discountPrice.toLocaleString()}원
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium">{getPackageItemsTotal(pkg).toLocaleString()}원</span>
                  )}
                </div>
                <span className="text-gray-500">{pkg.duration}분</span>
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
                  패키지명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  소요시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
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
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    등록된 패키지가 없습니다.
                  </td>
                </tr>
              ) : (
                packages.map((pkg: any) => (
                  <tr key={pkg._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {pkg.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CategoryBadge category={pkg.category} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pkg.discountPrice ? (
                        <div>
                          <span className="line-through text-gray-400">
                            {getPackageItemsTotal(pkg).toLocaleString()}원
                          </span>
                          <br />
                          <span className="text-red-600 font-medium">
                            {pkg.discountPrice.toLocaleString()}원
                          </span>
                        </div>
                      ) : (
                        <span>{getPackageItemsTotal(pkg).toLocaleString()}원</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pkg.duration}분
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          pkg.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {pkg.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(pkg.createdAt), 'yyyy-MM-dd', { locale: ko })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(pkg)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg sm:text-xl font-bold">
                {editingPackage ? '패키지 수정' : '새 패키지 등록'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  패키지명 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리 *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as PackageFormData['category'],
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {CATEGORY_OPTIONS.filter((o) => o.value).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대상 성별
                  </label>
                  <select
                    value={formData.targetGender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetGender: e.target.value as PackageFormData['targetGender'],
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가격 (원)
                    <span className="text-xs text-gray-500 ml-1">(검진항목 가격 합산)</span>
                  </label>
                  <input
                    type="text"
                    value={getSelectedItemsTotalPrice().toLocaleString()}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                    placeholder="검진항목 선택 시 자동 계산"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    할인가격 (원)
                  </label>
                  <input
                    type="text"
                    value={formData.discountPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, discountPrice: e.target.value.replace(/[^0-9]/g, '') })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 120000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    소요시간 (분) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    슬롯당 최대 예약 수
                  </label>
                  <input
                    type="number"
                    value={formData.maxReservationsPerSlot}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxReservationsPerSlot: parseInt(e.target.value) || 10,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검진 항목 선택
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.selectedItemIds.length}개 선택됨)
                  </span>
                </label>
                {allExaminationItems.length === 0 ? (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                    등록된 검진항목이 없습니다. 먼저 검진항목 관리 탭에서 항목을 등록해주세요.
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                    {allExaminationItems.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => toggleItemSelection(item._id)}
                        className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                          formData.selectedItemIds.includes(item._id) ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center ${
                              formData.selectedItemIds.includes(item._id)
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {formData.selectedItemIds.includes(item._id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500">{item.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          {item.price.toLocaleString()}원
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예약 가능 요일
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAY_OPTIONS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm font-medium ${
                        formData.availableDays.includes(day.value)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  활성화 (체크 해제 시 예약 불가)
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white pb-2">
                <Button type="button" variant="outline" onClick={closeModal} className="w-full sm:w-auto">
                  취소
                </Button>
                <Button
                  type="submit"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {editingPackage ? '수정' : '등록'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const categoryConfig: Record<string, { label: string; className: string }> = {
    basic: { label: '기본검진', className: 'bg-blue-100 text-blue-800' },
    standard: { label: '표준검진', className: 'bg-green-100 text-green-800' },
    premium: { label: '프리미엄', className: 'bg-purple-100 text-purple-800' },
    specialized: { label: '특화검진', className: 'bg-orange-100 text-orange-800' },
    custom: { label: '선택 건강검진', className: 'bg-teal-100 text-teal-800' },
  };

  const config = categoryConfig[category] || {
    label: category,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getExaminationItems,
  createExaminationItem,
  updateExaminationItem,
  deleteExaminationItem,
  ExaminationItem,
  ExaminationItemInput,
} from '../../api/admin';
import Button from '../../components/common/Button';

interface ExaminationItemFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  isActive: boolean;
  displayOrder: number;
}

const initialFormData: ExaminationItemFormData = {
  name: '',
  description: '',
  price: '',
  category: '',
  isActive: true,
  displayOrder: 0,
};

export default function ExaminationItems() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExaminationItem | null>(null);
  const [formData, setFormData] = useState<ExaminationItemFormData>(initialFormData);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['examinationItems', search],
    queryFn: () => getExaminationItems({ search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: createExaminationItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examinationItems'] });
      toast.success('검진항목이 등록되었습니다.');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '검진항목 등록에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExaminationItemInput> }) =>
      updateExaminationItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examinationItems'] });
      toast.success('검진항목이 수정되었습니다.');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '검진항목 수정에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExaminationItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examinationItems'] });
      toast.success('검진항목이 삭제되었습니다.');
    },
    onError: () => {
      toast.error('검진항목 삭제에 실패했습니다.');
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ExaminationItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || '',
      isActive: item.isActive,
      displayOrder: item.displayOrder,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: ExaminationItemInput = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseInt(formData.price.replace(/,/g, '')) || 0,
      category: formData.category || undefined,
      isActive: formData.isActive,
      displayOrder: formData.displayOrder,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('이 검진항목을 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const items = data?.data || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div>
      {/* Search & Add */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="검진항목명 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            새 검진항목 등록
          </Button>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  검진항목명
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  상태
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    등록된 검진항목이 없습니다.
                  </td>
                </tr>
              ) : (
                items.map((item: ExaminationItem) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(item.price)}원
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-800 p-1"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-bold">
                {editingItem ? '검진항목 수정' : '새 검진항목 등록'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  검진항목명 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: 혈액검사"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: 일반 혈액검사 (CBC)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원) *</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value.replace(/[^0-9]/g, '') })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: 50000"
                  required
                />
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
                  활성화
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeModal}>
                  취소
                </Button>
                <Button
                  type="submit"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingItem ? '수정' : '등록'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

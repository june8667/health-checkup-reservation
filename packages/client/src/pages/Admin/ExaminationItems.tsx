import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit, Trash2, X, GripVertical } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  getExaminationItems,
  createExaminationItem,
  updateExaminationItem,
  deleteExaminationItem,
  reorderExaminationItems,
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

interface SortableItemProps {
  item: ExaminationItem;
  onEdit: (item: ExaminationItem) => void;
  onDelete: (id: string) => void;
  formatPrice: (price: number) => string;
}

function SortableItem({ item, onEdit, onDelete, formatPrice }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 sm:p-3 bg-white border-b border-gray-100 hover:bg-gray-50 ${
        isDragging ? 'shadow-lg z-10' : ''
      }`}
    >
      {/* 드래그 핸들 */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
        aria-label="순서 변경"
      >
        <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* 항목 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {item.name}
          </span>
          {/* 모바일에서 상태 표시 */}
          <span
            className={`flex-shrink-0 px-1.5 py-0.5 text-xs font-medium rounded ${
              item.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {item.isActive ? '활성' : '비활성'}
          </span>
        </div>
        {item.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {item.description}
          </p>
        )}
      </div>

      {/* 가격 */}
      <div className="flex-shrink-0 text-right">
        <span className="text-sm font-medium text-gray-900">
          {formatPrice(item.price)}원
        </span>
      </div>

      {/* 관리 버튼 */}
      <div className="flex-shrink-0 flex gap-1">
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
          aria-label="수정"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item._id)}
          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
          aria-label="삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ExaminationItems() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExaminationItem | null>(null);
  const [formData, setFormData] = useState<ExaminationItemFormData>(initialFormData);
  const [items, setItems] = useState<ExaminationItem[]>([]);

  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data, isLoading } = useQuery({
    queryKey: ['examinationItems', search],
    queryFn: () => getExaminationItems({ search: search || undefined }),
  });

  useEffect(() => {
    if (data?.data) {
      setItems(data.data);
    }
  }, [data]);

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

  const reorderMutation = useMutation({
    mutationFn: reorderExaminationItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examinationItems'] });
      toast.success('순서가 변경되었습니다.');
    },
    onError: () => {
      toast.error('순서 변경에 실패했습니다.');
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // 서버에 순서 변경 요청
      const reorderedItems = newItems.map((item, index) => ({
        id: item._id,
        displayOrder: index,
      }));
      reorderMutation.mutate(reorderedItems);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div>
      {/* Search & Add */}
      <div className="bg-white rounded-lg shadow p-3 mb-4">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="검진항목명 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <Button onClick={openCreateModal} className="flex-shrink-0 px-3 sm:px-4">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">새 검진항목</span>
          </Button>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* 안내 메시지 */}
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            왼쪽 핸들을 드래그하여 순서를 변경할 수 있습니다
          </p>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-gray-500">로딩 중...</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            등록된 검진항목이 없습니다.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <SortableItem
                    key={item._id}
                    item={item}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">
                {editingItem ? '검진항목 수정' : '새 검진항목 등록'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  검진항목명 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

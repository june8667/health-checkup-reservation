import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Check } from 'lucide-react';
import { getPackages } from '../../api/packages';
import { useReservationStore } from '../../store/reservationStore';
import { PACKAGE_CATEGORY_LABELS } from '../../constants/labels';
import Button from '../../components/common/Button';

export default function SelectPackage() {
  const navigate = useNavigate();
  const { selectedPackage, setSelectedPackage } = useReservationStore();

  const { data, isLoading } = useQuery({
    queryKey: ['packages', 'all'],
    queryFn: () => getPackages({ limit: 50 }),
  });

  const packages = data?.data?.items || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleSelect = (pkg: any) => {
    setSelectedPackage(pkg);
  };

  const handleNext = () => {
    if (selectedPackage) {
      navigate('/reservation/select-date');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-600 mb-6">원하시는 검진 패키지를 선택해주세요.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {packages.map((pkg) => (
          <button
            key={pkg._id}
            onClick={() => handleSelect(pkg)}
            className={`card p-4 text-left transition-all ${
              selectedPackage?._id === pkg._id
                ? 'ring-2 ring-primary-600 border-primary-600'
                : 'hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                {PACKAGE_CATEGORY_LABELS[pkg.category] || pkg.category}
              </span>
              {selectedPackage?._id === pkg._id && (
                <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 mb-1">{pkg.name}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pkg.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>{pkg.duration}분</span>
              </div>
              <div className="font-bold text-primary-600">
                {pkg.discountPrice
                  ? formatPrice(pkg.discountPrice)
                  : formatPrice(pkg.price)}
                원
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!selectedPackage} size="lg">
          다음 단계
        </Button>
      </div>
    </div>
  );
}

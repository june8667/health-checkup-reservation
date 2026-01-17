import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPin, Phone, Check, ChevronLeft } from 'lucide-react';
import { getPackageById } from '../api/packages';
import { PACKAGE_CATEGORY_LABELS, GENDER_LABELS } from '../constants/labels';
import Button from '../components/common/Button';
import { useReservationStore } from '../store/reservationStore';

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const setSelectedPackage = useReservationStore((state) => state.setSelectedPackage);

  const { data, isLoading, error } = useQuery({
    queryKey: ['package', id],
    queryFn: () => getPackageById(id!),
    enabled: !!id,
  });

  const pkg = data?.data;
  const hospital = pkg?.hospitalId as any;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">패키지를 찾을 수 없습니다.</p>
          <Link to="/packages">
            <Button variant="outline">패키지 목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link
        to="/packages"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        패키지 목록
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
              {PACKAGE_CATEGORY_LABELS[pkg.category] || pkg.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">{pkg.name}</h1>
            <p className="text-gray-600">{pkg.description}</p>
          </div>

          {/* Package Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">검진 정보</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">소요 시간</span>
                <p className="font-medium">{pkg.duration}분</p>
              </div>
              <div>
                <span className="text-gray-500">대상</span>
                <p className="font-medium">{GENDER_LABELS[pkg.targetGender]}</p>
              </div>
              {pkg.targetAgeMin && pkg.targetAgeMax && (
                <div>
                  <span className="text-gray-500">권장 연령</span>
                  <p className="font-medium">{pkg.targetAgeMin}세 ~ {pkg.targetAgeMax}세</p>
                </div>
              )}
            </div>
          </div>

          {/* Included Items */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">검진 항목</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pkg.items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                    {item.description && (
                      <p className="text-sm text-gray-500">{item.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Hospital Info */}
          {hospital && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">검진 장소</h2>
              <h3 className="font-medium text-gray-900 mb-2">{hospital.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{hospital.address?.address1} {hospital.address?.address2}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{hospital.phone}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Price & CTA */}
        <div className="md:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="mb-6">
              <div className="flex items-center mb-1">
                <Clock className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-500">약 {pkg.duration}분 소요</span>
              </div>
              <div className="mt-4">
                {pkg.discountPrice ? (
                  <>
                    <span className="text-gray-400 line-through text-lg">
                      {formatPrice(pkg.price)}원
                    </span>
                    <div className="text-3xl font-bold text-primary-600">
                      {formatPrice(pkg.discountPrice)}원
                    </div>
                    <span className="text-sm text-red-500">
                      {Math.round((1 - pkg.discountPrice / pkg.price) * 100)}% 할인
                    </span>
                  </>
                ) : (
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(pkg.price)}원
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/reservation/select-date"
              onClick={() => setSelectedPackage(pkg)}
            >
              <Button className="w-full" size="lg">
                예약하기
              </Button>
            </Link>

            <p className="text-xs text-gray-500 text-center mt-4">
              예약 후 결제를 진행합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

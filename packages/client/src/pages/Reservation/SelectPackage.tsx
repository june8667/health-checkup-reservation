import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Check, Info, X } from 'lucide-react';
import { getPackages } from '../../api/packages';
import { useReservationStore } from '../../store/reservationStore';
import { PACKAGE_CATEGORY_LABELS } from '../../constants/labels';
import Button from '../../components/common/Button';

export default function SelectPackage() {
  const navigate = useNavigate();
  const { selectedPackage, setSelectedPackage, selectedItems, setSelectedItems } = useReservationStore();
  const [detailPackage, setDetailPackage] = useState<any>(null);
  const [tempSelectedItems, setTempSelectedItems] = useState<{ [key: string]: boolean }>({});

  const { data, isLoading } = useQuery({
    queryKey: ['packages', 'all'],
    queryFn: () => getPackages({ limit: 50 }),
  });

  const packages = data?.data?.items || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 상세보기 모달이 열릴 때 tempSelectedItems 초기화
  useEffect(() => {
    if (detailPackage && detailPackage.category === 'custom') {
      const initial: { [key: string]: boolean } = {};
      detailPackage.items?.forEach((item: any) => {
        // 이미 선택된 항목이 있으면 그 상태를 유지
        const existingItem = selectedItems.find((si) => si.name === item.name);
        initial[item.name] = existingItem?.selected || false;
      });
      setTempSelectedItems(initial);
    }
  }, [detailPackage]);

  const handleTempItemToggle = (itemName: string) => {
    setTempSelectedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const getTempSelectedTotal = () => {
    if (!detailPackage?.items) return 0;
    return detailPackage.items
      .filter((item: any) => tempSelectedItems[item.name])
      .reduce((sum: number, item: any) => sum + (item.price || 0), 0);
  };

  const hasAnyTempSelection = () => {
    return Object.values(tempSelectedItems).some((v) => v);
  };

  const handleSelect = (pkg: any) => {
    // 같은 패키지를 다시 클릭하면 선택 해제
    if (selectedPackage?._id === pkg._id) {
      setSelectedPackage(null);
    } else {
      setSelectedPackage(pkg);
    }
  };

  const handleClearSelection = () => {
    setSelectedPackage(null);
  };

  const handleNext = () => {
    if (selectedPackage) {
      window.scrollTo(0, 0);
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
    <div onClick={handleClearSelection}>
      <p className="text-gray-600 mb-6">원하시는 검진 패키지를 선택해주세요.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" onClick={(e) => e.stopPropagation()}>
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

            <div className="flex items-center justify-between mb-3">
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

            <div
              onClick={(e) => {
                e.stopPropagation();
                setDetailPackage(pkg);
              }}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              상세보기
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <Button onClick={handleNext} disabled={!selectedPackage} size="lg">
          다음 단계
        </Button>
      </div>

      {/* 패키지 상세 모달 */}
      {detailPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">{detailPackage.name}</h3>
              <button
                onClick={() => setDetailPackage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* 기본 정보 */}
              <div>
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                  {PACKAGE_CATEGORY_LABELS[detailPackage.category] || detailPackage.category}
                </span>
                <p className="text-gray-600 mt-2 text-sm">{detailPackage.description}</p>
              </div>

              {/* 가격 및 소요시간 */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>약 {detailPackage.duration}분</span>
                </div>
                <div>
                  {detailPackage.discountPrice ? (
                    <div className="text-right">
                      <span className="text-sm text-gray-400 line-through mr-2">
                        {formatPrice(detailPackage.price)}원
                      </span>
                      <span className="font-bold text-primary-600">
                        {formatPrice(detailPackage.discountPrice)}원
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-primary-600">
                      {formatPrice(detailPackage.price)}원
                    </span>
                  )}
                </div>
              </div>

              {/* 검진 항목 */}
              {detailPackage.items && detailPackage.items.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    검진 항목
                    {detailPackage.category === 'custom' && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (원하는 항목을 선택하세요)
                      </span>
                    )}
                  </h4>
                  {detailPackage.category === 'custom' ? (
                    <ul className="space-y-2">
                      {detailPackage.items.map((item: any, index: number) => (
                        <li
                          key={index}
                          onClick={() => handleTempItemToggle(item.name)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            tempSelectedItems[item.name]
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              tempSelectedItems[item.name]
                                ? 'border-primary-600 bg-primary-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {tempSelectedItems[item.name] && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{item.name}</span>
                              {item.price && (
                                <span className="text-primary-600 font-medium">
                                  {formatPrice(item.price)}원
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="space-y-2">
                      {detailPackage.items.map((item: any, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary-500 mt-0.5">•</span>
                          <div>
                            <span className="font-medium text-gray-900">{item.name}</span>
                            {item.description && (
                              <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* 선택 건강검진 총액 표시 */}
              {detailPackage.category === 'custom' && hasAnyTempSelection() && (
                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">선택 항목 총액</span>
                    <span className="text-xl font-bold text-primary-600">
                      {formatPrice(getTempSelectedTotal())}원
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t sticky bottom-0 bg-white flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDetailPackage(null)}
                className="flex-1"
              >
                닫기
              </Button>
              {detailPackage.category === 'custom' ? (
                <Button
                  onClick={() => {
                    // 선택한 항목들을 저장
                    const items = detailPackage.items.map((item: any) => ({
                      ...item,
                      selected: tempSelectedItems[item.name] || false,
                    }));
                    setSelectedItems(items);
                    setSelectedPackage(detailPackage);
                    setDetailPackage(null);
                  }}
                  disabled={!hasAnyTempSelection()}
                  className="flex-1"
                >
                  {hasAnyTempSelection()
                    ? `${formatPrice(getTempSelectedTotal())}원 선택`
                    : '항목을 선택하세요'}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setSelectedPackage(detailPackage);
                    setDetailPackage(null);
                  }}
                  className="flex-1"
                >
                  이 패키지 선택
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

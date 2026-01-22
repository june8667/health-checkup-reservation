import { useNavigate } from 'react-router-dom';
import { Calendar, Shield, Clock, Award, Check, Stethoscope, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPackages } from '../api/packages';
import { useReservationStore } from '../store/reservationStore';
import { useAuthStore } from '../store/authStore';
import type { Package } from '@health-checkup/shared';

export default function Home() {
  const navigate = useNavigate();
  const { setSelectedPackage } = useReservationStore();
  const { isAuthenticated } = useAuthStore();

  // 패키지 목록 조회하여 '국가건강검진 1차' 찾기
  const { data: packagesData, isLoading: isLoadingPackage } = useQuery({
    queryKey: ['packages', 'default'],
    queryFn: () => getPackages({ limit: 50 }),
  });

  // '국가건강검진 1차' 또는 첫 번째 패키지 사용
  const defaultPackage = packagesData?.data?.items?.find(
    (pkg: Package) => pkg.name === '국가건강검진 1차'
  ) || packagesData?.data?.items?.[0];

  // 패키지 정보 (로딩 중이거나 없을 때 기본값)
  const packageInfo = defaultPackage || {
    name: '국가건강검진 1차',
    description: '국민건강보험공단에서 제공하는 기본 건강검진 프로그램입니다.',
    duration: 30,
    price: 0,
    discountPrice: 0,
  };

  const handleReservation = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/reservation/select-date' } } });
      return;
    }
    if (defaultPackage) {
      setSelectedPackage(defaultPackage);
    }
    navigate('/reservation/select-date');
  };
  const features = [
    {
      icon: Calendar,
      title: '간편한 예약',
      description: '원하는 날짜와 시간에 간편하게 검진을 예약하세요.',
    },
    {
      icon: Shield,
      title: '안전한 결제',
      description: '토스페이먼츠를 통한 안전하고 편리한 결제 시스템',
    },
    {
      icon: Clock,
      title: '빠른 확인',
      description: '예약 즉시 확인 문자를 받아보세요.',
    },
    {
      icon: Award,
      title: '품질 보증',
      description: '검증된 검진센터에서 최고의 서비스를 제공합니다.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700/80 to-primary-900/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[50px] pb-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              건강한 삶의 시작,<br />
              지금 검진을 예약하세요
            </h1>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              전문 의료진과 최신 장비로 정확한 건강검진을 제공합니다.
              온라인으로 간편하게 예약하고 관리하세요.
            </p>
            <div className="flex justify-center">
              {/* 국가건강검진 1차 카드 */}
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
                {/* 카드 헤더 */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{packageInfo.name}</h3>
                        <p className="text-primary-100 text-sm">국민건강보험공단 지원</p>
                      </div>
                    </div>
                    <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      무료
                    </div>
                  </div>
                </div>

                {/* 카드 바디 */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{packageInfo.description}</p>

                  {/* 검진 항목 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary-600" />
                      주요 검진 항목
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {(defaultPackage?.items || [
                        { name: '신체계측' },
                        { name: '시력/청력검사' },
                        { name: '혈액검사' },
                        { name: '소변검사' },
                        { name: '흉부 X-ray' },
                        { name: '구강검진' },
                      ]).slice(0, 6).map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{item.name}</span>
                        </div>
                      ))}
                    </div>
                    {defaultPackage?.items && defaultPackage.items.length > 6 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        외 {defaultPackage.items.length - 6}개 항목 포함
                      </p>
                    )}
                  </div>

                  {/* 하단 정보 */}
                  <div className="flex items-center justify-between py-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">약 {packageInfo.duration}분</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">평일 가능</span>
                      </div>
                    </div>
                  </div>

                  {/* 예약하기 버튼 */}
                  <button
                    onClick={handleReservation}
                    disabled={isLoadingPackage}
                    className="w-full py-4 text-lg font-bold text-white bg-gradient-to-b from-primary-400 via-primary-500 to-primary-600 rounded-xl border-b-4 border-primary-700 hover:border-b-2 hover:mt-[2px] hover:mb-[-2px] active:border-b-0 active:mt-1 active:mb-[-4px] transition-all duration-75 disabled:opacity-50"
                  >
                    {isLoadingPackage ? '로딩중...' : '지금 예약하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              왜 저희 서비스를 선택해야 할까요?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              편리하고 안전한 건강검진 예약 시스템으로 여러분의 건강을 지켜드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

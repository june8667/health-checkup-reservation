import { Link } from 'react-router-dom';
import { Calendar, Shield, Clock, Award } from 'lucide-react';
import Button from '../components/common/Button';

export default function Home() {
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
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              건강한 삶의 시작,<br />
              지금 검진을 예약하세요
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              전문 의료진과 최신 장비로 정확한 건강검진을 제공합니다.
              온라인으로 간편하게 예약하고 관리하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/packages">
                <Button size="lg" variant="secondary">
                  검진 패키지 보기
                </Button>
              </Link>
              <Link to="/reservation">
                <Button size="lg" variant="secondary" className="!bg-white !text-primary-600 hover:!bg-primary-50">
                  지금 예약하기
                </Button>
              </Link>
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

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              건강검진, 더 이상 미루지 마세요
            </h2>
            <p className="text-primary-100 mb-6 max-w-xl mx-auto">
              정기적인 건강검진은 질병의 조기 발견과 예방에 필수적입니다.
              지금 바로 예약하세요.
            </p>
            <Link to="/packages">
              <Button size="lg" variant="secondary">
                패키지 확인하기
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Users,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { getDashboardStats } from '../../api/admin';

function formatPrice(price: number) {
  return new Intl.NumberFormat('ko-KR').format(price);
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  suffix = '',
  onClick,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  suffix?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? formatPrice(value) : value}
            {suffix}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: getDashboardStats,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 h-28"></div>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.data;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-8">대시보드</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="총 회원수"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-blue-500"
          suffix="명"
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="총 예약수"
          value={stats?.totalReservations || 0}
          icon={CalendarCheck}
          color="bg-green-500"
          suffix="건"
          onClick={() => navigate('/admin/reservations')}
        />
        <StatCard
          title="총 매출"
          value={stats?.totalRevenue || 0}
          icon={CreditCard}
          color="bg-purple-500"
          suffix="원"
        />
        <StatCard
          title="오늘 예약"
          value={stats?.todayReservations || 0}
          icon={TrendingUp}
          color="bg-orange-500"
          suffix="건"
        />
        <StatCard
          title="결제 대기"
          value={stats?.pendingReservations || 0}
          icon={Clock}
          color="bg-yellow-500"
          suffix="건"
        />
        <StatCard
          title="확정 예약"
          value={stats?.confirmedReservations || 0}
          icon={CheckCircle}
          color="bg-teal-500"
          suffix="건"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">월별 통계</h2>
          <div className="space-y-4">
            {stats?.monthlyStats?.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{month.month}</span>
                <div className="flex items-center gap-6">
                  <span className="text-sm">
                    예약 <strong>{month.reservations}</strong>건
                  </span>
                  <span className="text-sm">
                    매출 <strong>{formatPrice(month.revenue)}</strong>원
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Packages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 패키지</h2>
          <div className="space-y-4">
            {stats?.popularPackages?.map((item, index) => (
              <div key={item.package?._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full text-xs font-bold mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-900">{item.package?.name}</span>
                </div>
                <span className="text-sm text-gray-500">{item.reservationCount}건</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">최근 예약</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  패키지
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentReservations?.map((reservation) => (
                <tr key={reservation._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reservation.reservationNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.patientInfo?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.packageId?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(reservation.reservationDate), 'yyyy-MM-dd', {
                      locale: ko,
                    })}{' '}
                    {reservation.reservationTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ReservationStatusBadge status={reservation.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReservationStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: '결제대기', className: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: '예약확정', className: 'bg-green-100 text-green-800' },
    cancelled: { label: '취소', className: 'bg-red-100 text-red-800' },
    completed: { label: '검진완료', className: 'bg-blue-100 text-blue-800' },
    no_show: { label: '노쇼', className: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}

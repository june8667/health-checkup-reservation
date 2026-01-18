import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Users,
  Package,
  Clock,
  Database,
  ArrowLeft,
} from 'lucide-react';

const navItems = [
  { path: '/admin', label: '대시보드', icon: LayoutDashboard, end: true },
  { path: '/admin/reservations', label: '예약 관리', icon: CalendarCheck },
  { path: '/admin/payments', label: '결제 관리', icon: CreditCard },
  { path: '/admin/users', label: '회원 관리', icon: Users },
  { path: '/admin/packages', label: '패키지 관리', icon: Package },
  { path: '/admin/schedule', label: '스케줄 관리', icon: Clock },
  { path: '/admin/database', label: 'DB 관리', icon: Database },
];

export default function AdminLayout() {
  const { user } = useAuthStore();

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 모바일 헤더 + 네비게이션 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white">
        <header className="px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <h1 className="text-lg font-bold">관리자</h1>
          <NavLink
            to="/"
            className="text-sm text-gray-400 hover:text-white flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            돌아가기
          </NavLink>
        </header>

        {/* 모바일 네비게이션 - 가로 스크롤 */}
        <nav className="flex overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* 데스크탑 Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-gray-900 text-white z-50">
        <div className="p-6">
          <h1 className="text-xl font-bold">관리자 페이지</h1>
          <p className="text-sm text-gray-400 mt-1">{user?.name}</p>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <NavLink
            to="/"
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>돌아가기</span>
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-[140px] lg:pt-[50px] p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

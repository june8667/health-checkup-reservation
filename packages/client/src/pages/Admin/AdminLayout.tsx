import { useState } from 'react';
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
  Menu,
  X,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 모바일 헤더 */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 text-gray-900 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">관리자</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-[30vw] lg:w-64 bg-gray-900/70 backdrop-blur-sm lg:bg-gray-900 lg:backdrop-blur-none text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3 lg:p-6 flex items-center justify-between">
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold">관리자 페이지</h1>
            <p className="text-sm text-gray-400 mt-1">{user?.name}</p>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-2 lg:mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center px-3 lg:px-6 py-3 text-xs lg:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-6">
          <NavLink
            to="/"
            onClick={closeSidebar}
            className="flex items-center text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">돌아가기</span>
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

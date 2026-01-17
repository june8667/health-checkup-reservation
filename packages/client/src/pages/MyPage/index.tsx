import { NavLink, Outlet } from 'react-router-dom';
import { Calendar, CreditCard, User } from 'lucide-react';

const navItems = [
  { to: '/mypage/reservations', icon: Calendar, label: '예약 내역' },
  { to: '/mypage/payments', icon: CreditCard, label: '결제 내역' },
  { to: '/mypage/profile', icon: User, label: '내 정보' },
];

export default function MyPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">마이페이지</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="md:w-48 flex-shrink-0">
          <ul className="flex md:flex-col gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

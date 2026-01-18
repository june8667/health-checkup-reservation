import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout as logoutApi } from '../../api/auth';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/');
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:h-[74px] md:items-center py-2 md:py-0">
          {/* 로고 */}
          <div className="flex justify-center md:justify-start h-[58px] md:h-auto overflow-visible">
            <Link to="/" className="flex items-center">
              <img src="/headerlogo.png" alt="건강검진예약" className="h-[77px] md:h-28 w-auto" />
            </Link>
          </div>

          {/* Navigation - 로고 아래에 표시 */}
          <div className="flex items-center justify-center md:justify-end flex-wrap gap-x-2 gap-y-1 mt-2 md:mt-0">
            {isAuthenticated ? (
              <>
                <Link
                  to="/reservation"
                  className="text-[14px] sm:text-base md:text-lg text-gray-600 hover:text-primary-600 font-medium transition-colors whitespace-nowrap"
                >
                  예약하기
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/packages"
                  className="text-[14px] sm:text-base md:text-lg text-gray-600 hover:text-primary-600 font-medium transition-colors whitespace-nowrap"
                >
                  검진 패키지
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/mypage"
                  className="text-[14px] sm:text-base md:text-lg text-gray-600 hover:text-primary-600 font-medium transition-colors whitespace-nowrap"
                >
                  마이페이지
                </Link>
                {user?.role === 'admin' && (
                  <>
                    <span className="text-gray-300">|</span>
                    <Link
                      to="/admin"
                      className="text-[14px] sm:text-base md:text-lg text-purple-600 hover:text-purple-800 font-medium transition-colors whitespace-nowrap"
                    >
                      관리자
                    </Link>
                  </>
                )}
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleLogout}
                  className="text-[14px] sm:text-base md:text-lg text-gray-600 hover:text-primary-600 font-medium transition-colors whitespace-nowrap"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/packages"
                  className="text-[14px] sm:text-base md:text-lg text-gray-600 hover:text-primary-600 font-medium transition-colors whitespace-nowrap"
                >
                  검진 패키지
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/login"
                  className="text-[14px] sm:text-base md:text-lg text-gray-600 hover:text-primary-600 font-medium transition-colors whitespace-nowrap"
                >
                  로그인
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/register"
                  className="text-[14px] sm:text-base md:text-lg text-primary-600 hover:text-primary-700 font-medium transition-colors whitespace-nowrap"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

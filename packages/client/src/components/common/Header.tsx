import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Calendar, Menu, X, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { logout as logoutApi } from '../../api/auth';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="로고" className="h-12 w-auto" />
              <span className="text-xl font-bold text-primary-600">건강검진예약</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/packages"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              검진 패키지
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/reservation"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>예약하기</span>
                </Link>
                <Link
                  to="/mypage"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>마이페이지</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>관리자</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/packages"
                className="text-gray-600 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                검진 패키지
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/reservation"
                    className="text-gray-600 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    예약하기
                  </Link>
                  <Link
                    to="/mypage"
                    className="text-gray-600 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-purple-600 hover:text-purple-800 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      관리자
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-600 hover:text-primary-600 font-medium"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-600 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

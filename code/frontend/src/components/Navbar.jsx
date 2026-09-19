import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Grid, 
  Calendar, 
  Timer, 
  BarChart3, 
  BookOpen, 
  User, 
  LogOut, 
  PlusCircle,
  ChevronDown
} from 'lucide-react';

const Navbar = ({ onOpenCreateTask }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-4 z-40 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="bg-white/90 backdrop-blur-md border-2 border-[#2D2424] rounded-full px-4 py-2.5 shadow-pop flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link to="/topics" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-[#FF8F7E] border-2 border-[#2D2424] flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:rotate-12 transition-transform">
            ⚡
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl text-[#2D2424] tracking-tight flex items-center gap-1">
              TaskFlow <Sparkles className="w-4 h-4 text-[#FF5CA8] fill-current" />
            </span>
            <span className="font-script text-xs text-[#FF8F7E] -mt-1 hidden sm:inline">Solar Pastel Pop</span>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1 bg-[#FFF4E6] p-1 rounded-full border border-[#2D2424]/10">
            <Link
              to="/topics"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive('/topics')
                  ? 'bg-[#FF8F7E] text-white shadow-sm'
                  : 'text-[#2D2424] hover:bg-white/60'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Khối chủ đề
            </Link>

            <span
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-gray-400 cursor-not-allowed"
              title="Phát triển ở Use Case tiếp theo"
            >
              <Calendar className="w-3.5 h-3.5" />
              Lịch tuần
            </span>

            <span
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-gray-400 cursor-not-allowed"
              title="Phát triển ở Use Case tiếp theo"
            >
              <Timer className="w-3.5 h-3.5" />
              Pomodoro
            </span>

            <span
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-gray-400 cursor-not-allowed"
              title="Phát triển ở Use Case tiếp theo"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Thống kê
            </span>

            <span
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-gray-400 cursor-not-allowed"
              title="Phát triển ở Use Case tiếp theo"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Nhật ký
            </span>
          </nav>
        )}

        {/* Right Action Section */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Create Task Button */}
              {onOpenCreateTask && (
                <button
                  onClick={onOpenCreateTask}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF5CA8] hover:bg-[#FF8F7E] text-white font-bold text-xs shadow-sm border-2 border-[#2D2424] transition-all hover:scale-105 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Tạo Task</span>
                </button>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full bg-[#FFF4E6] border-2 border-[#2D2424] hover:bg-white transition-colors"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-7 h-7 rounded-full object-cover border border-[#2D2424]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#30D5C8] border border-[#2D2424] text-[#2D2424] font-black text-xs flex items-center justify-center">
                      {user?.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="font-bold text-xs text-[#2D2424] max-w-[100px] truncate hidden lg:inline">
                    {user?.full_name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#2D2424]" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-[#2D2424] rounded-2xl shadow-pop p-2 z-50 animate-in fade-in zoom-in duration-150">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="font-bold text-xs text-[#2D2424] truncate">{user?.full_name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#2D2424] hover:bg-[#FFF4E6] rounded-xl transition-colors mt-1"
                    >
                      <User className="w-4 h-4 text-[#FF8F7E]" />
                      Hồ sơ cá nhân
                    </Link>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-xs font-bold text-[#2D2424] hover:bg-[#FFF4E6] transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full bg-[#FF8F7E] hover:bg-[#FF5CA8] text-white font-bold text-xs border-2 border-[#2D2424] shadow-sm transition-all hover:scale-105"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

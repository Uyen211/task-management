import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không trùng khớp. Vui lòng kiểm tra lại!');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      navigate('/topics');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          setError(detail);
        } else if (Array.isArray(detail)) {
          setError(detail.map((item) => item.msg).join(', '));
        } else {
          setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!');
        }
      } else {
        setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border-4 border-[#2D2424] rounded-3xl p-6 sm:p-8 shadow-pop-lg relative overflow-hidden">
        {/* Top Decorative Spark */}
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#30D5C8] rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-[#2D2424]">
          🚀
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF4E6] border border-[#2D2424] text-xs font-bold text-[#FF8F7E] mb-3">
            <Sparkles className="w-3.5 h-3.5 fill-current" /> Solar Pastel Pop
          </div>
          <h1 className="font-display font-extrabold text-3xl text-[#2D2424]">Tạo Tài Khoản</h1>
          <p className="font-script text-sm text-[#FF8F7E] mt-1">Bắt đầu hành trình học tập cùng TaskFlow!</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3 rounded-2xl bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase tracking-wider">
              Họ và tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF8F7E] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="hocvien@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF8F7E] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase tracking-wider">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="Mật khẩu tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF8F7E] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase tracking-wider">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF8F7E] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-[#FF8F7E] hover:bg-[#FF5CA8] text-white font-display font-extrabold text-sm border-2 border-[#2D2424] shadow-pop transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Đang tạo tài khoản...</span>
            ) : (
              <>
                <span>Tạo Tài Khoản Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center border-t border-gray-100 pt-5">
          <p className="text-xs font-bold text-gray-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-[#FF5CA8] underline font-extrabold hover:text-[#FF8F7E]">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

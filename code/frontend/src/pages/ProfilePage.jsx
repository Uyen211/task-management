import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Image, KeyRound, CheckCircle, AlertCircle, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSavingProfile(true);

    try {
      await updateProfile({ full_name: fullName, avatar_url: avatarUrl });
      setProfileMsg({ type: 'success', text: 'Cập nhật hồ sơ cá nhân thành công!' });
    } catch (err) {
      console.error(err);
      setProfileMsg({ type: 'error', text: 'Không thể cập nhật hồ sơ. Vui lòng thử lại!' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu mới không khớp với xác nhận!' });
      return;
    }

    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }

    setSavingPwd(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPwdMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setPwdMsg({ type: 'error', text: err.response.data.detail });
      } else {
        setPwdMsg({ type: 'error', text: 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!' });
      }
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white border-4 border-[#2D2424] rounded-3xl p-6 sm:p-8 shadow-pop flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#2D2424] shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#30D5C8] border-4 border-[#2D2424] text-[#2D2424] font-display font-extrabold text-3xl flex items-center justify-center">
              {fullName?.charAt(0) || 'U'}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-[#FF8F7E] text-white p-2 rounded-full border-2 border-[#2D2424]">
            ✨
          </div>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <span className="inline-block px-3 py-1 rounded-full bg-[#FFF4E6] border border-[#2D2424] text-xs font-bold text-[#FF8F7E]">
            Hồ sơ cá nhân
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#2D2424]">
            {user?.full_name}
          </h1>
          <p className="text-xs font-bold text-gray-500">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Update Profile Form */}
        <div className="bg-white border-4 border-[#2D2424] rounded-3xl p-6 shadow-pop space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <User className="w-5 h-5 text-[#FF8F7E]" />
            <h2 className="font-display font-extrabold text-lg text-[#2D2424]">Thông tin cá nhân</h2>
          </div>

          {profileMsg.text && (
            <div
              className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center gap-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-red-50 border-red-500 text-red-700'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase">Họ và tên</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase">Email (Cố định)</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-100 border-2 border-gray-300 text-xs font-bold text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase">URL Ảnh đại diện</label>
              <div className="relative">
                <Image className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 px-6 rounded-full bg-[#FF8F7E] hover:bg-[#FF5CA8] text-white font-display font-extrabold text-xs border-2 border-[#2D2424] shadow-sm hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white border-4 border-[#2D2424] rounded-3xl p-6 shadow-pop space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <KeyRound className="w-5 h-5 text-[#FF5CA8]" />
            <h2 className="font-display font-extrabold text-lg text-[#2D2424]">Đổi Mật Khẩu</h2>
          </div>

          {pwdMsg.text && (
            <div
              className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center gap-2 ${
                pwdMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-red-50 border-red-500 text-red-700'
              }`}
            >
              {pwdMsg.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase">Mật khẩu mới</label>
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] focus:outline-none focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={savingPwd}
              className="w-full py-3 px-6 rounded-full bg-[#FF5CA8] hover:bg-[#FF8F7E] text-white font-display font-extrabold text-xs border-2 border-[#2D2424] shadow-sm hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{savingPwd ? 'Đang xử lý...' : 'Xác Nhận Đổi Mật Khẩu'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useState } from 'react';
import api from '../services/api';
import { X, Sparkles, Plus, Palette } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Xanh lam', code: '#3B82F6' },
  { name: 'Xanh lá', code: '#10B981' },
  { name: 'Tím DL', code: '#8B5CF6' },
  { name: 'Cam RAG', code: '#F59E0B' },
  { name: 'Hồng AI', code: '#EC4899' },
  { name: 'Đỏ Agent', code: '#EF4444' },
  { name: 'Xám MLOps', code: '#64748B' },
  { name: 'Xanh ngọc KTPM', code: '#14B8A6' },
  { name: 'Vàng DSA', code: '#EAB308' },
];

const CreateTopicModal = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [colorCode, setColorCode] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/topics', {
        title,
        description,
        color_code: colorCode,
      });
      setTitle('');
      setDescription('');
      if (onCreated) onCreated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Không thể tạo chủ đề mới. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2424]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border-4 border-[#2D2424] rounded-3xl p-6 sm:p-8 shadow-pop-lg relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF8F7E] text-white flex items-center justify-center font-bold text-sm border-2 border-[#2D2424]">
              🎨
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl text-[#2D2424]">Thêm Khối Chủ Đề Mới</h2>
              <span className="font-script text-xs text-[#FF8F7E]">Phân loại lộ trình học tập & công việc</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFF4E6] border-2 border-[#2D2424] flex items-center justify-center text-[#2D2424] hover:bg-[#FF5CA8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#2D2424] mb-1.5 uppercase">Tên Chủ Đề (*)</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Tiếng Anh Cơ Bản, Machine Learning..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2424] mb-1.5 uppercase">Mô Tả Chủ Đề</label>
            <textarea
              rows={3}
              placeholder="Mô tả mục tiêu học tập hoặc nội dung công việc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] focus:outline-none focus:bg-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2424] mb-2 uppercase flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#FF5CA8]" /> Mã Màu Chủ Đề
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setColorCode(c.code)}
                  title={c.name}
                  className={`w-8 h-8 rounded-full border-2 border-[#2D2424] transition-all flex items-center justify-center ${
                    colorCode === c.code ? 'scale-125 ring-2 ring-[#FF8F7E] shadow-sm' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.code }}
                >
                  {colorCode === c.code && <span className="text-white text-xs font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-[#2D2424] font-bold text-xs border-2 border-[#2D2424]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-3 px-4 rounded-full bg-[#FF8F7E] hover:bg-[#FF5CA8] text-white font-display font-extrabold text-xs border-2 border-[#2D2424] shadow-pop transition-all hover:scale-105"
            >
              {loading ? 'Đang tạo...' : 'Tạo Chủ Đề'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTopicModal;

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateTask } from '../services/api';

const EditTaskModal = ({ isOpen, onClose, task, topics = [], onUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic_id: '',
    scheduled_date: '',
    start_time: '',
    end_time: '',
    target_pomodoro: 1,
    status: 'PENDING',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        topic_id: task.topic_id || '',
        scheduled_date: task.scheduled_date || '',
        start_time: task.start_time || '',
        end_time: task.end_time || '',
        target_pomodoro: task.target_pomodoro || 1,
        status: task.status || 'PENDING',
      });
      setError(null);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên công việc');
      return;
    }
    if (!formData.scheduled_date) {
      setError('Vui lòng chọn ngày thực hiện');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        topic_id: formData.topic_id || null,
        scheduled_date: formData.scheduled_date,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        target_pomodoro: parseInt(formData.target_pomodoro, 10),
        status: formData.status,
      };

      await updateTask(task.id, payload);
      setLoading(false);
      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.detail || 'Không thể cập nhật công việc');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2424]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FFF4E6] border-4 border-[#2D2424] rounded-3xl p-6 md:p-8 shadow-pop relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border-2 border-[#2D2424] flex items-center justify-center font-bold text-[#2D2424] hover:bg-[#FF8F7E] hover:text-white transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FF8F7E] border-2 border-[#2D2424] flex items-center justify-center text-white font-black text-xl shadow-sm">
            ✏️
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-[#2D2424]">
              Chỉnh Sửa Công Việc
            </h2>
            <p className="font-script text-xs text-[#FF5CA8]">Cập nhật thông tin chi tiết task</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-2xl flex items-center gap-2 text-red-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-black text-[#2D2424] uppercase tracking-wider mb-1.5">
              Tên công việc <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ví dụ: Ôn tập Đại số tuyến tính..."
              className="w-full px-4 py-3 bg-white border-2 border-[#2D2424] rounded-2xl font-bold text-sm text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#FF8F7E]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black text-[#2D2424] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#FF8F7E]" /> Mô tả chi tiết
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ghi chú nội dung bài học hoặc mục tiêu..."
              className="w-full px-4 py-3 bg-white border-2 border-[#2D2424] rounded-2xl font-medium text-xs text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#FF8F7E]"
            />
          </div>

          {/* Topic & Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Topic Select */}
            <div>
              <label className="block text-xs font-black text-[#2D2424] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#30D5C8]" /> Khối Chủ Đề
              </label>
              <select
                value={formData.topic_id}
                onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-[#2D2424] rounded-2xl font-bold text-xs text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#30D5C8]"
              >
                <option value="">-- Không gắn chủ đề --</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-black text-[#2D2424] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5CA8]" /> Trạng Thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-[#2D2424] rounded-2xl font-bold text-xs text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#FF5CA8]"
              >
                <option value="PENDING">Chưa thực hiện (PENDING)</option>
                <option value="IN_PROGRESS">Đang thực hiện (IN_PROGRESS)</option>
                <option value="COMPLETED">Đã hoàn thành (COMPLETED)</option>
              </select>
            </div>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-xs font-black text-[#2D2424] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#FF8F7E]" /> Ngày thực hiện <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-[#2D2424] rounded-2xl font-bold text-xs text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#FF8F7E]"
            />
          </div>

          {/* Start Time & End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-[#2D2424] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FF8F7E]" /> Giờ bắt đầu
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-[#2D2424] rounded-2xl font-bold text-xs text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#FF8F7E]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#2D2424] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FF8F7E]" /> Giờ kết thúc
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-[#2D2424] rounded-2xl font-bold text-xs text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#FF8F7E]"
              />
            </div>
          </div>

          {/* Pomodoro Counter */}
          <div className="bg-white border-2 border-[#2D2424] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-[#2D2424] flex items-center gap-1">
                🍅 Số quả Pomodoro mục tiêu
              </p>
              <p className="text-[10px] text-gray-500 font-medium">Mỗi quả tương ứng 25 phút tập trung</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, target_pomodoro: Math.max(1, formData.target_pomodoro - 1) })}
                className="w-8 h-8 rounded-full bg-[#FFF4E6] border-2 border-[#2D2424] font-black text-base text-[#2D2424] hover:bg-[#FF8F7E] hover:text-white transition-colors flex items-center justify-center shadow-sm"
              >
                -
              </button>
              <span className="font-display font-black text-lg text-[#2D2424] min-w-[20px] text-center">
                {formData.target_pomodoro}
              </span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, target_pomodoro: formData.target_pomodoro + 1 })}
                className="w-8 h-8 rounded-full bg-[#FFF4E6] border-2 border-[#2D2424] font-black text-base text-[#2D2424] hover:bg-[#FF5CA8] hover:text-white transition-colors flex items-center justify-center shadow-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2D2424]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full font-bold text-xs text-[#2D2424] hover:bg-gray-200 border-2 border-[#2D2424] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#FF8F7E] hover:bg-[#FF5CA8] text-white font-extrabold text-xs border-2 border-[#2D2424] shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;

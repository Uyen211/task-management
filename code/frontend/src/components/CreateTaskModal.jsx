import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Plus, Minus, Calendar, Clock, BookOpen, PlusCircle } from 'lucide-react';

const CreateTaskModal = ({ isOpen, onClose, onCreated, topics = [], onOpenCreateTopic, initialTopicId = null, initialDate = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState(initialTopicId || '');
  const [scheduledDate, setScheduledDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [targetPomodoro, setTargetPomodoro] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTopicId(initialTopicId || '');
      setScheduledDate(initialDate || new Date().toISOString().split('T')[0]);
      setError('');
    }
  }, [initialTopicId, initialDate, isOpen]);


  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Tên công việc không được để trống!');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        topic_id: topicId || null,
        scheduled_date: scheduledDate,
        start_time: startTime ? `${startTime}:00` : null,
        end_time: endTime ? `${endTime}:00` : null,
        target_pomodoro: targetPomodoro,
      };

      const res = await api.post('/tasks', payload);
      setTitle('');
      setDescription('');
      setTargetPomodoro(1);
      if (onCreated) onCreated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Không thể tạo công việc. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2424]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border-4 border-[#2D2424] rounded-3xl p-6 sm:p-8 shadow-pop-lg relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF5CA8] text-white flex items-center justify-center font-bold text-sm border-2 border-[#2D2424]">
              📌
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl text-[#2D2424]">Tạo Công Việc Mới</h2>
              <span className="font-script text-xs text-[#FF8F7E]">Lên kế hoạch chi tiết cho mục tiêu học tập</span>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#2D2424] mb-1.5 uppercase">Tên công việc (*)</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Ôn tập Toán ML, Đọc 3 đoạn văn Tiếng Anh..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] focus:outline-none focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#2D2424] mb-1.5 uppercase">Mô tả chi tiết</label>
            <textarea
              rows={2}
              placeholder="Chi tiết các bước thực hiện..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] focus:outline-none focus:bg-white resize-none"
            />
          </div>

          {/* Topic Selector & Inline Create */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#2D2424] uppercase flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#30D5C8]" /> Khối chủ đề
              </label>
              {onOpenCreateTopic && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreateTopic();
                  }}
                  className="text-[11px] font-bold text-[#FF5CA8] hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" /> Tạo chủ đề mới
                </button>
              )}
            </div>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] focus:outline-none focus:bg-white"
            >
              <option value="">-- Không phân loại (Tự do) --</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Scheduled Date & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FF8F7E]" /> Ngày thực hiện
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#30D5C8]" /> Giờ bắt đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2424] mb-1 uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FF5CA8]" /> Giờ kết thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424]"
              />
            </div>
          </div>

          {/* Target Pomodoro Counter */}
          <div className="bg-[#FFF4E6] border-2 border-[#2D2424] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-[#2D2424]">Số Quả Pomodoro Mục Tiêu</span>
              <span className="text-[10px] text-gray-500">Mỗi quả tương đương 25 phút tập trung</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTargetPomodoro(Math.max(1, targetPomodoro - 1))}
                className="w-8 h-8 rounded-full bg-white border-2 border-[#2D2424] flex items-center justify-center font-bold text-[#2D2424] hover:bg-[#FF8F7E] hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 font-display font-extrabold text-lg text-[#2D2424]">
                <span>{targetPomodoro}</span>
                <span>🍅</span>
              </div>

              <button
                type="button"
                onClick={() => setTargetPomodoro(targetPomodoro + 1)}
                className="w-8 h-8 rounded-full bg-white border-2 border-[#2D2424] flex items-center justify-center font-bold text-[#2D2424] hover:bg-[#FF8F7E] hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
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
              {loading ? 'Đang lưu...' : 'Lưu Công Việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;

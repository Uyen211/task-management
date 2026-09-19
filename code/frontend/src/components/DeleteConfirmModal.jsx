import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { deleteTask } from '../services/api';

const DeleteConfirmModal = ({ isOpen, onClose, task, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !task) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteTask(task.id);
      setLoading(false);
      onDeleted && onDeleted();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.detail || 'Không thể xóa công việc này.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2424]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FFF4E6] border-4 border-[#2D2424] rounded-3xl p-6 shadow-pop relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border-2 border-[#2D2424] flex items-center justify-center font-bold text-[#2D2424] hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <div className="w-14 h-14 rounded-full bg-[#FF8F7E]/20 border-2 border-[#2D2424] flex items-center justify-center text-red-500 font-black text-2xl mb-3">
            🗑️
          </div>
          <h3 className="font-display font-black text-xl text-[#2D2424]">Xác Nhận Xóa Công Việc</h3>
          <p className="font-medium text-xs text-gray-600 mt-1 max-w-xs">
            Bạn có chắc chắn muốn xóa công việc dưới đây không? Thao tác này không thể hoàn tác.
          </p>
        </div>

        {/* Task Preview Card */}
        <div className="bg-white border-2 border-[#2D2424] rounded-2xl p-4 mb-4">
          <p className="font-bold text-sm text-[#2D2424] truncate">{task.title}</p>
          {task.topic_title && (
            <span
              className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black text-white"
              style={{ backgroundColor: task.topic_color || '#30D5C8' }}
            >
              {task.topic_title}
            </span>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-xs font-bold text-center mb-3">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full font-bold text-xs text-[#2D2424] bg-white hover:bg-gray-100 border-2 border-[#2D2424] transition-colors"
          >
            Hủy Thao Tác
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 rounded-full bg-[#FF5C5C] hover:bg-red-600 text-white font-extrabold text-xs border-2 border-[#2D2424] shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Đang xóa...' : 'Xác Nhận Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

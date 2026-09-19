import React from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Play, 
  CheckCircle, 
  Edit3, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  AlertCircle 
} from 'lucide-react';

const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  onStartPomodoro,
  onQuickComplete,
}) => {
  if (!isOpen || !task) return null;

  const isCompleted = task.status === 'COMPLETED';
  const isInProgress = task.status === 'IN_PROGRESS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2424]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border-4 border-[#2D2424] rounded-3xl p-6 sm:p-8 shadow-pop-lg relative overflow-hidden space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b-2 border-gray-100 pb-4">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              {task.topic_title ? (
                <span
                  className="px-3 py-1 rounded-full text-xs font-black text-white border border-[#2D2424]"
                  style={{ backgroundColor: task.topic_color || '#FF8F7E' }}
                >
                  {task.topic_title}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-gray-500 bg-gray-100 border border-gray-300">
                  Tự do
                </span>
              )}

              {isCompleted ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                  ✓ Hoàn thành
                </span>
              ) : isInProgress ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300 animate-pulse">
                  ⚡ Đang làm
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
                  ⏳ Chưa làm
                </span>
              )}
            </div>

            <h2 className={`font-display font-extrabold text-2xl text-[#2D2424] mt-2 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFF4E6] border-2 border-[#2D2424] flex items-center justify-center text-[#2D2424] hover:bg-[#FF5CA8] hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Description */}
        <div className="bg-[#FFF4E6]/50 border-2 border-[#2D2424]/20 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Mô tả công việc</h3>
          <p className="text-xs font-bold text-[#2D2424] whitespace-pre-wrap leading-relaxed">
            {task.description || 'Chưa có mô tả chi tiết cho công việc này.'}
          </p>
        </div>

        {/* Task Details Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border-2 border-[#2D2424] rounded-2xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-[#FF8F7E]/20 text-[#FF8F7E] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Thời gian</span>
              <span className="text-xs font-bold text-[#2D2424] block">
                {task.start_time
                  ? `${task.start_time.slice(0, 5)}${task.end_time ? ' - ' + task.end_time.slice(0, 5) : ''}`
                  : 'Cả ngày'}
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#2D2424] rounded-2xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-[#FF5CA8]/20 text-[#FF5CA8] flex items-center justify-center font-bold">
              🍅
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Pomodoro</span>
              <span className="text-xs font-bold text-[#2D2424] block">
                {task.completed_pomodoro || 0} / {task.target_pomodoro} Quả
              </span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t-2 border-gray-100 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isCompleted && onStartPomodoro && (
              <button
                onClick={() => {
                  onClose();
                  onStartPomodoro(task);
                }}
                className="px-4 py-2.5 rounded-full bg-[#FF8F7E] hover:bg-[#FF5CA8] text-white font-extrabold text-xs border-2 border-[#2D2424] shadow-sm hover:scale-105 transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Chạy Pomodoro</span>
              </button>
            )}

            {onQuickComplete && (
              <button
                onClick={() => {
                  onClose();
                  onQuickComplete(task);
                }}
                className={`px-4 py-2.5 rounded-full font-bold text-xs border-2 border-[#2D2424] shadow-sm hover:scale-105 transition-all flex items-center gap-1.5 ${
                  isCompleted
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-[#30D5C8] hover:bg-[#7FE7E2] text-[#2D2424]'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isCompleted ? 'Đánh dấu chưa xong' : 'Hoàn thành'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(task);
                }}
                className="p-2.5 rounded-full bg-gray-100 hover:bg-[#30D5C8] text-gray-700 hover:text-white border-2 border-[#2D2424] transition-all"
                title="Sửa công việc"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(task);
                }}
                className="p-2.5 rounded-full bg-gray-100 hover:bg-red-500 text-gray-700 hover:text-white border-2 border-[#2D2424] transition-all"
                title="Xóa công việc"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;

import React from 'react';
import { Clock, Play, Edit3, Trash2, CheckCircle, Circle, AlertCircle } from 'lucide-react';

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStartPomodoro,
  onQuickComplete,
  isDraggable = false,
  dragAttributes,
  dragListeners,
}) => {
  const isCompleted = task.status === 'COMPLETED';
  const isInProgress = task.status === 'IN_PROGRESS';

  return (
    <div
      className={`group relative bg-white border-2 border-[#2D2424] rounded-2xl p-3.5 shadow-sm hover:shadow-pop transition-all duration-200 flex flex-col justify-between ${
        isCompleted ? 'opacity-75 bg-gray-50/80' : ''
      }`}
    >
      {/* Top Header: Topic Badge + Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {task.topic_title ? (
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-white truncate max-w-[130px]"
            style={{ backgroundColor: task.topic_color || '#FF8F7E' }}
          >
            {task.topic_title}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-400 bg-gray-100">
            Tự do
          </span>
        )}

        <div className="flex items-center gap-1">
          {isCompleted ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
              Hoàn thành
            </span>
          ) : isInProgress ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300 animate-pulse">
              Đang làm
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
              Chưa làm
            </span>
          )}
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="mb-2">
        <h4
          className={`font-bold text-sm text-[#2D2424] leading-snug line-clamp-2 ${
            isCompleted ? 'line-through text-gray-500' : ''
          }`}
        >
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 font-medium">
            {task.description}
          </p>
        )}
      </div>

      {/* Time & Pomodoro Progress Row */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100 mb-2">
        <div className="flex items-center gap-1 font-semibold text-[#2D2424]">
          <Clock className="w-3 h-3 text-[#FF8F7E]" />
          <span>
            {task.start_time
              ? `${task.start_time.slice(0, 5)}${task.end_time ? ' - ' + task.end_time.slice(0, 5) : ''}`
              : 'Cả ngày'}
          </span>
        </div>

        <div className="flex items-center gap-1 font-bold text-[#FF8F7E]">
          <span>🍅</span>
          <span>
            {task.completed_pomodoro || 0}/{task.target_pomodoro}
          </span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between pt-1">
        {/* Quick Complete Button */}
        <button
          onClick={() => onQuickComplete && onQuickComplete(task)}
          className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${
            isCompleted ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-600'
          }`}
          title={isCompleted ? 'Đánh dấu chưa xong' : 'Đánh dấu xong'}
        >
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 fill-emerald-100" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{isCompleted ? 'Xong' : 'Hoàn thành'}</span>
        </button>

        {/* Start Pomodoro, Edit & Delete */}
        <div className="flex items-center gap-1">
          {!isCompleted && onStartPomodoro && (
            <button
              onClick={() => onStartPomodoro(task)}
              className="p-1.5 rounded-full bg-[#FF8F7E]/10 hover:bg-[#FF8F7E] text-[#FF8F7E] hover:text-white transition-all shadow-xs"
              title="Bắt đầu Pomodoro"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-[#30D5C8] text-gray-600 hover:text-white transition-all"
              title="Chỉnh sửa công việc"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(task)}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-[#FF5C5C] text-gray-600 hover:text-white transition-all"
              title="Xóa công việc"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

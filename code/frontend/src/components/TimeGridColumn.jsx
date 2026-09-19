import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import DraggableTaskCard from './DraggableTaskCard';
import { Plus } from 'lucide-react';

const VIETNAMESE_DAYS = {
  Monday: 'Thứ Hai',
  Tuesday: 'Thứ Ba',
  Wednesday: 'Thứ Tư',
  Thursday: 'Thứ Năm',
  Friday: 'Thứ Sáu',
  Saturday: 'Thứ Bảy',
  Sunday: 'Chủ Nhật',
};

const TimeGridColumn = ({
  day,
  isToday,
  onEditTask,
  onDeleteTask,
  onStartPomodoro,
  onQuickCompleteTask,
  onAddTaskOnDate,
  onSelectTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: day.date,
    data: { date: day.date },
  });

  const formattedDateStr = new Date(day.date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });

  const vnDayName = VIETNAMESE_DAYS[day.day_of_week] || day.day_of_week;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[550px] bg-[#FFF4E6]/50 border-2 border-[#2D2424] rounded-2xl p-2.5 transition-colors duration-200 ${
        isOver ? 'bg-[#30D5C8]/20 border-dashed border-[#30D5C8]' : ''
      } ${isToday ? 'ring-2 ring-[#FF8F7E] bg-[#FF8F7E]/5' : ''}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#2D2424]/10">
        <div>
          <span className="font-display font-extrabold text-xs text-[#2D2424] block">
            {vnDayName}
          </span>
          <span
            className={`font-script text-[11px] font-bold ${
              isToday ? 'text-[#FF8F7E]' : 'text-gray-500'
            }`}
          >
            {formattedDateStr} {isToday && '(Hôm nay)'}
          </span>
        </div>

        <button
          onClick={() => onAddTaskOnDate && onAddTaskOnDate(day.date)}
          className="w-6 h-6 rounded-full bg-white border border-[#2D2424] flex items-center justify-center text-[#2D2424] hover:bg-[#FF8F7E] hover:text-white transition-colors"
          title={`Thêm task vào ${vnDayName}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Task Cards List */}
      <div className="flex-1 space-y-2.5">
        {day.tasks && day.tasks.length > 0 ? (
          day.tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStartPomodoro={onStartPomodoro}
              onQuickComplete={onQuickCompleteTask}
              onSelectTask={onSelectTask}
            />
          ))

        ) : (
          <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-2 text-center">
            <span className="text-xl opacity-40">☕</span>
            <span className="font-script text-[10px] text-gray-400 mt-1">Trống task</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeGridColumn;

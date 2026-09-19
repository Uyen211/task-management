import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

const DraggableTaskCard = ({
  task,
  onEdit,
  onDelete,
  onStartPomodoro,
  onQuickComplete,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle icon */}
      <div
        {...listeners}
        {...attributes}
        className="absolute top-2 right-2 w-6 h-6 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200/80 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 z-10"
        title="Kéo để di chuyển mốc thời gian"
      >
        ::
      </div>

      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onStartPomodoro={onStartPomodoro}
        onQuickComplete={onQuickComplete}
      />
    </div>
  );
};

export default DraggableTaskCard;

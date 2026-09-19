import React from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import TimeGridColumn from './TimeGridColumn';
import TaskCard from './TaskCard';

const WeeklyCalendarGrid = ({
  weeklyData,
  onTaskDragDrop,
  onEditTask,
  onDeleteTask,
  onStartPomodoro,
  onQuickCompleteTask,
  onAddTaskOnDate,
}) => {
  const [activeTask, setActiveTask] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px drag distance before activating drag
      },
    })
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const handleDragStart = (event) => {
    const { active } = event;
    const task = active.data.current?.task;
    setActiveTask(task || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newScheduledDate = over.id; // The date string from TimeGridColumn droppable ID

    if (active.data.current?.task?.scheduled_date !== newScheduledDate) {
      onTaskDragDrop(taskId, newScheduledDate);
    }
  };

  if (!weeklyData || !weeklyData.days) {
    return (
      <div className="py-20 text-center font-bold text-gray-500">
        Đang tải dữ liệu Lịch tuần...
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weeklyData.days.map((day) => (
          <TimeGridColumn
            key={day.date}
            day={day}
            isToday={day.date === todayStr}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onStartPomodoro={onStartPomodoro}
            onQuickCompleteTask={onQuickCompleteTask}
            onAddTaskOnDate={onAddTaskOnDate}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-64 rotate-3 shadow-2xl opacity-90 pointer-events-none">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default WeeklyCalendarGrid;

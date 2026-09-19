import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  PlusCircle, 
  RefreshCw, 
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';
import WeeklyCalendarGrid from '../components/WeeklyCalendarGrid';
import EditTaskModal from '../components/EditTaskModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import PomodoroTimerModal from '../components/PomodoroTimerModal';
import { 
  getWeeklyCalendar, 
  dragDropTask, 
  updateTask, 
  startPomodoro, 
  getTasks 
} from '../services/api';

const WeeklyCalendarPage = ({ onOpenCreateTask, topics = [] }) => {
  const [currentMonday, setCurrentMonday] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diffToMonday));
    return monday.toISOString().split('T')[0];
  });

  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [activePomodoroSession, setActivePomodoroSession] = useState(null);
  const [activePomodoroTask, setActivePomodoroTask] = useState(null);

  // Fetch weekly calendar data
  const fetchWeeklyCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWeeklyCalendar(currentMonday);
      setWeeklyData(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Không thể tải dữ liệu lịch tuần. Vui lòng thử lại.');
      console.error('Failed to fetch calendar:', err);
    }
  }, [currentMonday]);

  useEffect(() => {
    fetchWeeklyCalendar();
  }, [fetchWeeklyCalendar]);

  // Listen for global task created event
  useEffect(() => {
    const handleTaskCreated = () => {
      fetchWeeklyCalendar();
    };
    window.addEventListener('taskCreated', handleTaskCreated);
    return () => window.removeEventListener('taskCreated', handleTaskCreated);
  }, [fetchWeeklyCalendar]);

  // Week Navigator Handlers
  const handlePrevWeek = () => {
    const date = new Date(currentMonday);
    date.setDate(date.getDate() - 7);
    setCurrentMonday(date.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const date = new Date(currentMonday);
    date.setDate(date.getDate() + 7);
    setCurrentMonday(date.toISOString().split('T')[0]);
  };

  const handleCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diffToMonday));
    setCurrentMonday(monday.toISOString().split('T')[0]);
  };

  // Drag & Drop Task Handler
  const handleTaskDragDrop = async (taskId, newScheduledDate) => {
    if (!weeklyData) return;

    // Optimistic UI Update
    const previousWeeklyData = JSON.parse(JSON.stringify(weeklyData));
    let draggedTask = null;

    const newDays = weeklyData.days.map((day) => {
      // Remove task from old day
      const filteredTasks = day.tasks.filter((t) => {
        if (t.id === taskId) {
          draggedTask = { ...t, scheduled_date: newScheduledDate };
          return false;
        }
        return true;
      });
      return { ...day, tasks: filteredTasks };
    });

    // Add task to new day
    if (draggedTask) {
      const targetDay = newDays.find((d) => d.date === newScheduledDate);
      if (targetDay) {
        targetDay.tasks.push(draggedTask);
      }
    }

    setWeeklyData({ ...weeklyData, days: newDays });

    // Call Backend API
    try {
      await dragDropTask(taskId, {
        scheduled_date: newScheduledDate,
        start_time: draggedTask?.start_time || null,
        end_time: draggedTask?.end_time || null,
      });
      fetchWeeklyCalendar(); // Refresh clean state
    } catch (err) {
      console.error('Failed to update drag-drop position:', err);
      setWeeklyData(previousWeeklyData); // Rollback on failure
    }
  };

  // Quick Complete Toggle
  const handleQuickCompleteTask = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await updateTask(task.id, { status: newStatus });
      fetchWeeklyCalendar();
    } catch (err) {
      console.error('Failed to quick complete task:', err);
    }
  };

  // Start Pomodoro Session
  const handleStartPomodoro = async (task) => {
    try {
      const res = await startPomodoro(task.id, 25);
      setActivePomodoroSession(res.data);
      setActivePomodoroTask(task);
    } catch (err) {
      console.error('Failed to start pomodoro session:', err);
    }
  };

  // Format Date Range Header Text
  const formatDateRangeText = () => {
    if (!weeklyData) return '';
    const start = new Date(weeklyData.start_date);
    const end = new Date(weeklyData.end_date);
    return `${start.getDate()}/${start.getMonth() + 1}/${start.getFullYear()} – ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Top Banner Header */}
      <div className="bg-white border-4 border-[#2D2424] rounded-3xl p-6 md:p-8 shadow-pop mb-6 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#FF8F7E]/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FF8F7E] text-white border border-[#2D2424]">
                📌 UC05 - Calendar Grid
              </span>
              <span className="font-script text-xs text-[#FF5CA8] font-bold">
                Kéo - Thả Phân Bổ Thời Gian
              </span>
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl text-[#2D2424]">
              Lịch Công Việc Theo Tuần 📅
            </h1>
            <p className="text-xs md:text-sm font-medium text-gray-600 mt-1">
              Quản lý và kéo thả phân bổ các nhiệm vụ học tập từ Thứ 2 đến Chủ Nhật
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCreateTask}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#FF8F7E] hover:bg-[#FF5CA8] text-white font-black text-xs border-2 border-[#2D2424] shadow-pop transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Task Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigator Bar */}
      <div className="bg-[#FFF4E6] border-2 border-[#2D2424] rounded-2xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Previous / Today / Next Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-white border-2 border-[#2D2424] font-bold text-xs text-[#2D2424] hover:bg-[#FF8F7E] hover:text-white transition-all shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Tuần trước</span>
          </button>

          <button
            onClick={handleCurrentWeek}
            className="px-4 py-2 rounded-full bg-[#30D5C8] text-[#2D2424] font-black text-xs border-2 border-[#2D2424] hover:bg-teal-300 transition-all shadow-xs"
          >
            Hôm nay
          </button>

          <button
            onClick={handleNextWeek}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-white border-2 border-[#2D2424] font-bold text-xs text-[#2D2424] hover:bg-[#FF8F7E] hover:text-white transition-all shadow-xs"
          >
            <span className="hidden sm:inline">Tuần sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Date Range Display */}
        <div className="flex items-center gap-2 font-display font-extrabold text-sm md:text-base text-[#2D2424]">
          <CalendarIcon className="w-4 h-4 text-[#FF8F7E]" />
          <span>{formatDateRangeText()}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchWeeklyCalendar}
          className="p-2 rounded-full bg-white border-2 border-[#2D2424] hover:bg-gray-100 text-[#2D2424] transition-colors"
          title="Tải lại lịch tuần"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Weekly Calendar Grid */}
      {loading && !weeklyData ? (
        <div className="min-h-[400px] flex items-center justify-center bg-white border-2 border-[#2D2424] rounded-3xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#FF8F7E] border-t-transparent rounded-full animate-spin" />
            <span className="font-bold text-xs text-gray-500">Đang tải lịch công việc...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border-2 border-red-500 rounded-3xl text-center">
          <p className="font-bold text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={fetchWeeklyCalendar}
            className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-full border-2 border-[#2D2424]"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <WeeklyCalendarGrid
          weeklyData={weeklyData}
          onTaskDragDrop={handleTaskDragDrop}
          onEditTask={(task) => setEditingTask(task)}
          onDeleteTask={(task) => setDeletingTask(task)}
          onStartPomodoro={handleStartPomodoro}
          onQuickCompleteTask={handleQuickCompleteTask}
          onAddTaskOnDate={(date) => {
            onOpenCreateTask && onOpenCreateTask(date);
          }}
        />
      )}

      {/* Embedded Modals */}
      <EditTaskModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        topics={topics}
        onUpdated={() => {
          fetchWeeklyCalendar();
        }}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        task={deletingTask}
        onDeleted={() => {
          fetchWeeklyCalendar();
        }}
      />

      <PomodoroTimerModal
        isOpen={Boolean(activePomodoroSession)}
        onClose={() => {
          setActivePomodoroSession(null);
          setActivePomodoroTask(null);
        }}
        sessionData={activePomodoroSession}
        task={activePomodoroTask}
        onCompleted={() => {
          fetchWeeklyCalendar();
        }}
        onCancelled={() => {
          fetchWeeklyCalendar();
        }}
      />
    </div>
  );
};

export default WeeklyCalendarPage;

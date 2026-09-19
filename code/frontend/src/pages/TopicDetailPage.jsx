import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Calendar, 
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import CreateTaskModal from '../components/CreateTaskModal';

const TopicDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTopicDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/topics/${id}`);
      setTopic(res.data);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải chi tiết chủ đề. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicDetail();
  }, [id]);

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa công việc "${taskTitle}"?`)) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchTopicDetail();
      } catch (err) {
        console.error(err);
        alert('Không thể xóa công việc. Vui lòng thử lại!');
      }
    }
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchTopicDetail();
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật trạng thái task!');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-10 h-10 border-4 border-[#FF8F7E] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-script text-sm text-[#FF8F7E]">Đang tải chi tiết chủ đề...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="p-4 rounded-3xl bg-red-50 border-4 border-red-500 text-red-700 text-xs font-bold">
          {error || 'Không tìm thấy chủ đề.'}
        </div>
        <Link
          to="/topics"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF8F7E] text-white font-bold text-xs border-2 border-[#2D2424]"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách chủ đề
        </Link>
      </div>
    );
  }

  const progress = topic.total_tasks > 0 
    ? Math.round((topic.completed_tasks / topic.total_tasks) * 100) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        to="/topics"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] hover:bg-[#FFF4E6] shadow-sm transition-all hover:-translate-x-1"
      >
        <ArrowLeft className="w-4 h-4" /> Tất cả khối chủ đề
      </Link>

      {/* Topic Header Banner */}
      <div className="bg-white border-4 border-[#2D2424] rounded-3xl p-6 sm:p-8 shadow-pop relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full border-2 border-[#2D2424]"
                style={{ backgroundColor: topic.color_code }}
              />
              <span className="font-script text-xs text-[#FF8F7E]">Khối Chủ Đề Đang Thực Hiện</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#2D2424]">
              {topic.title}
            </h1>
            {topic.description && (
              <p className="text-xs sm:text-sm font-bold text-gray-600 max-w-2xl">{topic.description}</p>
            )}
          </div>

          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="px-6 py-3 rounded-full bg-[#FF8F7E] hover:bg-[#FF5CA8] text-white font-display font-extrabold text-xs border-2 border-[#2D2424] shadow-pop transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Task Vào Chủ Đề</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-500">Tiến độ công việc ({topic.completed_tasks}/{topic.total_tasks} hoàn thành)</span>
            <span className="text-[#2D2424] font-display">{progress}%</span>
          </div>

          <div className="w-full bg-[#FFF4E6] h-3.5 rounded-full border border-[#2D2424] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: topic.color_code || '#FF8F7E',
              }}
            />
          </div>
        </div>
      </div>

      {/* Task Filters & Search */}
      <div className="bg-white border-4 border-[#2D2424] rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#2D2424] focus:outline-none focus:bg-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#FFF4E6] p-1 rounded-full border border-[#2D2424]/20 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING', label: 'Chờ làm' },
            { id: 'IN_PROGRESS', label: 'Đang làm' },
            { id: 'COMPLETED', label: 'Đã xong' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#FF8F7E] text-white shadow-sm'
                  : 'text-[#2D2424] hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#FFF4E6] border-4 border-dashed border-[#2D2424] rounded-3xl p-8 text-center space-y-3">
            <p className="font-script text-base text-[#FF8F7E]">
              {tasks.length === 0 ? 'Chủ đề này chưa có công việc nào' : 'Không tìm thấy công việc phù hợp với bộ lọc'}
            </p>
            {tasks.length === 0 && (
              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF8F7E] text-white font-bold text-xs border-2 border-[#2D2424] shadow-sm hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" /> Thêm công việc đầu tiên
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white border-4 border-[#2D2424] rounded-3xl p-5 shadow-pop hover:shadow-pop-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                task.status === 'COMPLETED' ? 'opacity-75 bg-emerald-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Checkbox toggle */}
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="mt-0.5 text-[#2D2424] hover:text-[#FF8F7E] transition-colors"
                >
                  {task.status === 'COMPLETED' ? (
                    <CheckSquare className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Square className="w-6 h-6 text-gray-400" />
                  )}
                </button>

                {/* Task Details */}
                <div className="space-y-1">
                  <h4
                    className={`font-display font-extrabold text-base text-[#2D2424] ${
                      task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                  )}

                  {/* Task Metadata */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold text-gray-500">
                    <span className="flex items-center gap-1 bg-[#FFF4E6] px-2.5 py-0.5 rounded-full border border-[#2D2424]/20">
                      <Calendar className="w-3 h-3 text-[#FF8F7E]" />
                      {task.scheduled_date}
                    </span>

                    {task.start_time && (
                      <span className="flex items-center gap-1 bg-[#FFF4E6] px-2.5 py-0.5 rounded-full border border-[#2D2424]/20">
                        <Clock className="w-3 h-3 text-[#30D5C8]" />
                        {task.start_time.substring(0, 5)} {task.end_time ? `- ${task.end_time.substring(0, 5)}` : ''}
                      </span>
                    )}

                    <span className="flex items-center gap-1 bg-[#FFF4E6] px-2.5 py-0.5 rounded-full border border-[#2D2424]/20">
                      <span>{task.completed_pomodoro}/{task.target_pomodoro}</span>
                      <span>🍅</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border border-[#2D2424] ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {task.status === 'COMPLETED' ? 'Đã xong' : task.status === 'IN_PROGRESS' ? 'Đang làm' : 'Chờ làm'}
                </span>

                <button
                  onClick={() => handleDeleteTask(task.id, task.title)}
                  className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-[#2D2424] flex items-center justify-center transition-colors"
                  title="Xóa công việc"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Create Task */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreated={() => fetchTopicDetail()}
        initialTopicId={topic.id}
      />
    </div>
  );
};

export default TopicDetailPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import CreateTopicModal from '../components/CreateTopicModal';

const TopicGridPage = ({ onOpenCreateTask }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/topics');
      setTopics(res.data);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách khối chủ đề. Vui lòng kiểm tra lại backend!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleDeleteTopic = async (topicId, topicTitle, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa chủ đề "${topicTitle}"? Các công việc liên quan sẽ được chuyển về tự do.`)) {
      try {
        await api.delete(`/topics/${topicId}`);
        fetchTopics();
      } catch (err) {
        console.error(err);
        alert('Không thể xóa chủ đề. Vui lòng thử lại!');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-white border-4 border-[#2D2424] rounded-3xl p-6 sm:p-10 shadow-pop relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF4E6] border-2 border-[#2D2424] text-xs font-bold text-[#FF8F7E]">
            <Sparkles className="w-3.5 h-3.5 fill-current" /> Lộ Trình Học Tập & Quản Lý Công Việc
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#2D2424] leading-tight">
            Khối Chủ Đề <span className="font-script text-[#FF5CA8] italic font-normal">Học Tập</span>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-600 max-w-xl">
            Phân loại lộ trình thành các khối chủ đề độc lập. Theo dõi tiến độ hoàn thành task và tích lũy Pomodoro hàng ngày.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 z-10 w-full md:w-auto">
          <button
            onClick={() => setIsCreateTopicOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#30D5C8] hover:bg-[#7FE7E2] text-[#2D2424] font-display font-extrabold text-xs border-2 border-[#2D2424] shadow-pop transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Chủ Đề Mới</span>
          </button>

          {onOpenCreateTask && (
            <button
              onClick={onOpenCreateTask}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#FF8F7E] hover:bg-[#FF5CA8] text-white font-display font-extrabold text-xs border-2 border-[#2D2424] shadow-pop transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Task Mới</span>
            </button>
          )}
        </div>

        {/* Background Spark Decoration */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FFF4E6] rounded-full border-4 border-[#2D2424]/10 pointer-events-none" />
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-10 h-10 border-4 border-[#FF8F7E] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-script text-sm text-[#FF8F7E]">Đang tải các khối chủ đề...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-3xl bg-red-50 border-4 border-red-500 text-red-700 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Topic Cards Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const progress = topic.total_tasks > 0 
              ? Math.round((topic.completed_tasks / topic.total_tasks) * 100) 
              : 0;

            return (
              <Link
                key={topic.id}
                to={`/topics/${topic.id}`}
                className="group bg-white border-4 border-[#2D2424] rounded-3xl p-6 shadow-pop hover:shadow-pop-lg transition-all hover:-translate-y-1 relative flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Color Badge & Actions */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border-2 border-[#2D2424] shadow-sm"
                        style={{ backgroundColor: topic.color_code }}
                      />
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-bold border border-[#2D2424] text-[#2D2424]"
                        style={{ backgroundColor: `${topic.color_code}25` }}
                      >
                        {topic.total_tasks} Tasks
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteTopic(topic.id, topic.title, e)}
                      title="Xóa chủ đề"
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 border border-[#2D2424] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-display font-extrabold text-lg text-[#2D2424] group-hover:text-[#FF8F7E] transition-colors mb-2 line-clamp-1">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 min-h-[36px] mb-4">
                    {topic.description || 'Chưa có mô tả chi tiết cho chủ đề này.'}
                  </p>
                </div>

                {/* Progress Bar & Stats */}
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-500">Tiến độ hoàn thành</span>
                    <span className="text-[#2D2424] font-display">{progress}%</span>
                  </div>

                  <div className="w-full bg-[#FFF4E6] h-3 rounded-full border border-[#2D2424] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: topic.color_code || '#FF8F7E',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {topic.completed_tasks} / {topic.total_tasks} xong
                    </span>

                    <span className="text-xs font-bold text-[#FF8F7E] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Add New Topic Card */}
          <button
            onClick={() => setIsCreateTopicOpen(true)}
            className="bg-[#FFF4E6] border-4 border-dashed border-[#2D2424] rounded-3xl p-6 hover:bg-white transition-all flex flex-col items-center justify-center text-center gap-3 min-h-[220px] group shadow-sm hover:shadow-pop"
          >
            <div className="w-12 h-12 rounded-full bg-[#FF8F7E] border-2 border-[#2D2424] text-white flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-extrabold text-base text-[#2D2424] block">
                Thêm Khối Chủ Đề Mới
              </span>
              <span className="font-script text-xs text-[#FF8F7E]">
                Tạo chủ đề để phân loại lộ trình
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Modal Create Topic */}
      <CreateTopicModal
        isOpen={isCreateTopicOpen}
        onClose={() => setIsCreateTopicOpen(false)}
        onCreated={() => fetchTopics()}
      />
    </div>
  );
};

export default TopicGridPage;

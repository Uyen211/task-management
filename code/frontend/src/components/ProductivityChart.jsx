import React from 'react';
import { BarChart3, PieChart, Sparkles } from 'lucide-react';

const ProductivityChart = ({ productivityData, selectedPeriod, onPeriodChange }) => {
  if (!productivityData) return null;

  const { daily_breakdown = [], top_topics = [], total_completed_tasks = 0, total_pomodoros = 0 } = productivityData;

  // Max count for scaling bars
  const maxTasks = Math.max(...daily_breakdown.map((d) => d.completed_tasks), 1);
  const maxPomos = Math.max(...daily_breakdown.map((d) => d.completed_pomodoros), 1);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white border-4 border-[#2D2424] rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FF8F7E] text-white flex items-center justify-center font-bold text-sm border-2 border-[#2D2424]">
            📊
          </div>
          <span className="font-display font-black text-lg text-[#2D2424]">
            Phân Tích Năng Suất Học Tập
          </span>
        </div>

        {/* Period Tabs */}
        <div className="flex items-center gap-1 bg-[#FFF4E6] p-1 rounded-full border border-[#2D2424]/20">
          {[
            { id: 'week', label: 'Tuần này' },
            { id: 'month', label: 'Tháng này' },
            { id: 'all', label: 'Tất cả' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onPeriodChange(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedPeriod === tab.id
                  ? 'bg-[#FF8F7E] text-white shadow-sm'
                  : 'text-[#2D2424] hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Daily Breakdown Bars & Top Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Breakdown Visual Bars */}
        <div className="lg:col-span-2 bg-white border-4 border-[#2D2424] rounded-3xl p-6 shadow-pop">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-extrabold text-base text-[#2D2424] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#FF8F7E]" />
              Thống Kê Theo Ngày ({daily_breakdown.length} ngày)
            </h3>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF8F7E] border border-[#2D2424]" />
                Task hoàn thành
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#30D5C8] border border-[#2D2424]" />
                Pomodoro 🍅
              </span>
            </div>
          </div>

          {daily_breakdown.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-gray-400">
              Chưa có dữ liệu thống kê cho khoảng thời gian này
            </div>
          ) : (
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
              {daily_breakdown.map((item) => {
                const dateStr = new Date(item.date).toLocaleDateString('vi-VN', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                });
                const taskPercent = Math.round((item.completed_tasks / maxTasks) * 100);
                const pomoPercent = Math.round((item.completed_pomodoros / maxPomos) * 100);

                return (
                  <div key={item.date} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2D2424]">
                      <span>{dateStr}</span>
                      <span className="text-gray-500">
                        {item.completed_tasks} Tasks | {item.completed_pomodoros} 🍅
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* Task Bar */}
                      <div className="w-full bg-[#FFF4E6] h-3 rounded-full border border-[#2D2424] overflow-hidden">
                        <div
                          className="h-full bg-[#FF8F7E] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(item.completed_tasks > 0 ? 8 : 0, taskPercent)}%` }}
                        />
                      </div>
                      {/* Pomodoro Bar */}
                      <div className="w-full bg-[#FFF4E6] h-3 rounded-full border border-[#2D2424] overflow-hidden">
                        <div
                          className="h-full bg-[#30D5C8] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(item.completed_pomodoros > 0 ? 8 : 0, pomoPercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Topics List */}
        <div className="bg-[#FFF4E6] border-4 border-[#2D2424] rounded-3xl p-6 shadow-pop flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-base text-[#2D2424] flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-[#FF5CA8]" />
              Top Chủ Đề Cống Hiến
            </h3>

            {top_topics.length === 0 ? (
              <div className="py-12 text-center font-script text-xs text-gray-500">
                Chưa có chủ đề nào hoàn thành task
              </div>
            ) : (
              <div className="space-y-3">
                {top_topics.map((topic) => (
                  <div
                    key={topic.topic_title}
                    className="bg-white border-2 border-[#2D2424] rounded-2xl p-3 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-[#2D2424] shrink-0"
                        style={{ backgroundColor: topic.color_code }}
                      />
                      <span className="font-bold text-xs text-[#2D2424] truncate max-w-[140px]">
                        {topic.topic_title}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block font-black text-xs text-[#2D2424]">
                        {topic.completed_tasks} Tasks
                      </span>
                      <span className="font-bold text-[10px] text-[#FF8F7E]">
                        🍅 {topic.completed_pomodoros}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-[#2D2424]/10 text-center">
            <span className="font-script text-xs text-[#FF5CA8] font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> Duy trì học tập liên tục mỗi ngày!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityChart;

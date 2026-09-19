import React from 'react';
import { Calendar, CheckCircle2, Timer, BookOpen } from 'lucide-react';

const DailySummaryBlock = ({ summaryData, selectedDate }) => {
  if (!summaryData) return null;

  const { total_completed_tasks = 0, total_pomodoros = 0, topics_summary = [] } = summaryData;

  const dateStr = new Date(selectedDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-[#FFF4E6] border-4 border-[#2D2424] rounded-3xl p-6 shadow-pop space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#2D2424]/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FF8F7E] border-2 border-[#2D2424] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            📝
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-[#2D2424]">
              Tóm Tắt Hoạt Động Ngày
            </h3>
            <p className="font-script text-xs font-bold text-[#FF8F7E]">{dateStr}</p>
          </div>
        </div>

        {/* Totals */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border-2 border-[#2D2424] px-3.5 py-1.5 rounded-full shadow-xs text-xs font-black text-[#2D2424]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{total_completed_tasks} Tasks</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white border-2 border-[#2D2424] px-3.5 py-1.5 rounded-full shadow-xs text-xs font-black text-[#2D2424]">
            <Timer className="w-4 h-4 text-[#FF8F7E]" />
            <span>{total_pomodoros} 🍅</span>
          </div>
        </div>
      </div>

      {/* Topics Summary Pills */}
      <div>
        <p className="text-xs font-bold text-gray-500 mb-2.5 flex items-center gap-1 uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-[#30D5C8]" /> Các chủ đề đã tiếp thu trong ngày:
        </p>

        {topics_summary.length === 0 ? (
          <p className="font-script text-xs text-gray-400 italic">
            Chưa có công việc nào hoàn thành trong ngày này. Hãy hoàn thành 1 task để hiện tóm tắt!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {topics_summary.map((t) => (
              <div
                key={t.topic_title}
                className="bg-white border-2 border-[#2D2424] rounded-2xl px-3.5 py-2 shadow-xs flex items-center gap-2"
              >
                <span
                  className="w-3 h-3 rounded-full border border-[#2D2424]"
                  style={{ backgroundColor: t.color_code || '#FF8F7E' }}
                />
                <span className="font-bold text-xs text-[#2D2424]">{t.topic_title}</span>
                <span className="text-[10px] font-black text-gray-500 bg-[#FFF4E6] px-2 py-0.5 rounded-full border border-[#2D2424]/20">
                  {t.completed_tasks} tasks • {t.completed_pomodoros} 🍅
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailySummaryBlock;

import React from 'react';
import { Flame, Trophy, CheckCircle2, Timer } from 'lucide-react';

const StreakMetricCard = ({ streakData }) => {
  if (!streakData) return null;

  const metrics = [
    {
      id: 'current_streak',
      title: 'Chuỗi Hiện Tại',
      value: `${streakData.current_streak || 0} Ngày`,
      subtitle: streakData.current_streak > 0 ? 'Đang giữ phong độ tốt!' : 'Bắt đầu 1 task để mở chuỗi!',
      icon: Flame,
      color: '#FF8F7E',
      textColor: 'text-[#FF8F7E]',
      bgColor: 'bg-[#FF8F7E]/10',
    },
    {
      id: 'longest_streak',
      title: 'Kỷ Lục Chuỗi',
      value: `${streakData.longest_streak || 0} Ngày`,
      subtitle: 'Thành tích duy trì dài nhất',
      icon: Trophy,
      color: '#FF5CA8',
      textColor: 'text-[#FF5CA8]',
      bgColor: 'bg-[#FF5CA8]/10',
    },
    {
      id: 'total_completed_tasks',
      title: 'Tổng Task Hoàn Thành',
      value: `${streakData.total_completed_tasks || 0}`,
      subtitle: 'Công việc đã chinh phục',
      icon: CheckCircle2,
      color: '#30D5C8',
      textColor: 'text-[#30D5C8]',
      bgColor: 'bg-[#30D5C8]/10',
    },
    {
      id: 'total_pomodoros',
      title: 'Tổng Quả Pomodoro',
      value: `${streakData.total_pomodoros || 0} 🍅`,
      subtitle: 'Phiên 25 phút tập trung',
      icon: Timer,
      color: '#FF8F7E',
      textColor: 'text-[#FF8F7E]',
      bgColor: 'bg-[#FF8F7E]/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className="bg-white border-4 border-[#2D2424] rounded-3xl p-5 shadow-pop hover:shadow-pop-lg transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-xs text-gray-500 uppercase tracking-wider">
                {m.title}
              </span>
              <div
                className={`w-10 h-10 rounded-2xl border-2 border-[#2D2424] ${m.bgColor} flex items-center justify-center shadow-xs`}
              >
                <Icon className={`w-5 h-5 ${m.textColor}`} />
              </div>
            </div>

            <div>
              <span className="font-display font-black text-3xl md:text-4xl text-[#2D2424]">
                {m.value}
              </span>
              <p className="font-script text-xs font-bold text-gray-500 mt-1">
                {m.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StreakMetricCard;

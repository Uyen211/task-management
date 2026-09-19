import React, { useState, useEffect } from 'react';
import StreakMetricCard from '../components/StreakMetricCard';
import ProductivityChart from '../components/ProductivityChart';
import { getUserStreak, getProductivityStats } from '../services/api';
import { RefreshCw, Trophy, Flame } from 'lucide-react';

const StatsPage = () => {
  const [streakData, setStreakData] = useState(null);
  const [productivityData, setProductivityData] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [streakRes, prodRes] = await Promise.all([
        getUserStreak(),
        getProductivityStats(period),
      ]);
      setStreakData(streakRes.data);
      setProductivityData(prodRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border-4 border-[#2D2424] rounded-3xl p-6 md:p-8 shadow-pop relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FF5CA8] text-white border border-[#2D2424]">
                🏆 UC07 - Streak & Analytics
              </span>
              <span className="font-script text-xs text-[#FF8F7E] font-bold">
                Chuỗi Làm Việc & Thống Kê
              </span>
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl text-[#2D2424] flex items-center gap-2">
              Chuỗi Ngày & Năng Suất <Flame className="w-8 h-8 text-[#FF8F7E] fill-current" />
            </h1>
            <p className="text-xs md:text-sm font-medium text-gray-600 mt-1">
              Theo dõi tiến độ tích lũy công việc, quả Pomodoro và giữ vững chuỗi ngày rèn luyện
            </p>
          </div>

          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FFF4E6] hover:bg-white text-[#2D2424] font-bold text-xs border-2 border-[#2D2424] shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {loading && !streakData ? (
        <div className="min-h-[300px] flex items-center justify-center bg-white border-4 border-[#2D2424] rounded-3xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#FF8F7E] border-t-transparent rounded-full animate-spin" />
            <span className="font-bold text-xs text-gray-500">Đang tổng hợp dữ liệu thống kê...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border-4 border-red-500 rounded-3xl text-center">
          <p className="font-bold text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-full border-2 border-[#2D2424]"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* Streak Metrics Row */}
          <StreakMetricCard streakData={streakData} />

          {/* Productivity Chart & Top Topics */}
          <ProductivityChart
            productivityData={productivityData}
            selectedPeriod={period}
            onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
          />
        </>
      )}
    </div>
  );
};

export default StatsPage;

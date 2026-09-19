import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Square, CheckCircle2, Coffee, Sparkles, RefreshCw } from 'lucide-react';
import { completePomodoro, cancelPomodoro, completeTaskEarly } from '../services/api';

const PomodoroTimerModal = ({ isOpen, onClose, sessionData, task, onCompleted, onCancelled }) => {
  const [mode, setMode] = useState('WORK'); // 'WORK' or 'BREAK'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [streakNotification, setStreakNotification] = useState(null);

  const initialWorkTime = (sessionData?.duration_minutes || 25) * 60;
  const breakTime = 5 * 60; // 5 minutes break

  const timerRef = useRef(null);

  // Web Audio API Chime Sound Generator
  const playCompletionChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Play pleasant C-major arpeggio (C5, E5, G5, C6)
      playTone(523.25, 0, 0.3);
      playTone(659.25, 0.15, 0.3);
      playTone(783.99, 0.3, 0.4);
      playTone(1046.50, 0.45, 0.6);
    } catch (err) {
      console.log('Audio playback error:', err);
    }
  };

  useEffect(() => {
    if (isOpen && sessionData) {
      setMode('WORK');
      setTimeLeft(initialWorkTime);
      setIsRunning(true);
      setStreakNotification(null);
    }
  }, [isOpen, sessionData]);

  // Countdown timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(timerRef.current);
      handleTimerEnd();
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  if (!isOpen || !task || !sessionData) return null;

  const handleTimerEnd = async () => {
    setIsRunning(false);
    playCompletionChime();

    if (mode === 'WORK') {
      // Call Backend Complete Pomodoro
      try {
        setLoading(true);
        const res = await completePomodoro(sessionData.id);
        setLoading(false);

        if (res.data.streak_updated) {
          setStreakNotification(`🔥 Bạn đạt chuỗi ${res.data.current_streak} ngày làm việc liên tục!`);
        }

        onCompleted && onCompleted(res.data);

        // Switch to Break Mode automatically
        setMode('BREAK');
        setTimeLeft(breakTime);
        setIsRunning(true);
      } catch (err) {
        setLoading(false);
        console.error('Failed to complete pomodoro:', err);
      }
    } else {
      // Break finished
      onClose();
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy phiên Pomodoro dở dang này không?')) {
      try {
        setIsRunning(false);
        await cancelPomodoro(sessionData.id);
        onCancelled && onCancelled();
        onClose();
      } catch (err) {
        console.error('Failed to cancel session:', err);
        onClose();
      }
    }
  };

  const handleCompleteEarly = async () => {
    try {
      setIsRunning(false);
      await completeTaskEarly(task.id);
      onCompleted && onCompleted();
      onClose();
    } catch (err) {
      console.error('Failed to complete task early:', err);
    }
  };

  // Format time mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage
  const totalDuration = mode === 'WORK' ? initialWorkTime : breakTime;
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2424]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg border-4 border-[#2D2424] rounded-3xl p-6 md:p-8 shadow-pop relative transition-colors duration-500 ${
          mode === 'WORK' ? 'bg-[#FFF4E6]' : 'bg-[#E6FFFA]'
        }`}
      >
        {/* Top Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-[#2D2424] shadow-sm flex items-center gap-1 ${
                mode === 'WORK'
                  ? 'bg-[#FF8F7E] text-white'
                  : 'bg-[#30D5C8] text-[#2D2424]'
              }`}
            >
              {mode === 'WORK' ? (
                <>🍅 Phiên Tập Trung</>
              ) : (
                <><Coffee className="w-3.5 h-3.5" /> Thơi Gian Nghỉ</>
              )}
            </span>
          </div>

          <button
            onClick={handleCancel}
            className="w-9 h-9 rounded-full bg-white border-2 border-[#2D2424] flex items-center justify-center font-bold text-[#2D2424] hover:bg-red-100 transition-all shadow-sm"
            title="Hủy phiên Pomodoro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Info Header */}
        <div className="text-center mb-6">
          <h3 className="font-display font-black text-xl text-[#2D2424] line-clamp-1">
            {task.title}
          </h3>
          {task.topic_title && (
            <span
              className="inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-black text-white"
              style={{ backgroundColor: task.topic_color || '#FF8F7E' }}
            >
              {task.topic_title}
            </span>
          )}
        </div>

        {/* Streak Notification Banner */}
        {streakNotification && (
          <div className="mb-4 p-3 bg-[#FF5CA8] text-white border-2 border-[#2D2424] rounded-2xl text-center text-xs font-black shadow-sm animate-bounce flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{streakNotification}</span>
          </div>
        )}

        {/* Circular Timer Visual */}
        <div className="flex flex-col items-center justify-center my-6 relative">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="#E5E7EB"
                strokeWidth="16"
                fill="transparent"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke={mode === 'WORK' ? '#FF8F7E' : '#30D5C8'}
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Timer Digits Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-black text-5xl text-[#2D2424] tracking-tight">
                {formattedTime}
              </span>
              <span className="font-script text-xs font-bold text-gray-500 mt-1">
                {mode === 'WORK' ? 'Tập trung học tập' : 'Thư giãn đầu óc'}
              </span>
            </div>
          </div>

          {/* Pomodoro Progress Counter */}
          <div className="mt-4 flex items-center gap-2 bg-white/80 border-2 border-[#2D2424] px-4 py-1.5 rounded-full shadow-sm">
            <span className="text-xs font-extrabold text-[#2D2424]">Mục tiêu:</span>
            <span className="font-display font-black text-sm text-[#FF8F7E]">
              🍅 {task.completed_pomodoro || 0} / {task.target_pomodoro}
            </span>
          </div>
        </div>

        {/* Timer Control Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm border-2 border-[#2D2424] shadow-pop transition-all hover:scale-105 active:scale-95 ${
              isRunning
                ? 'bg-[#FF5CA8] text-white hover:bg-pink-600'
                : 'bg-[#30D5C8] text-[#2D2424] hover:bg-teal-300'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" /> Tạm Dừng
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Tiếp Tục
              </>
            )}
          </button>

          {/* Complete Task Early Button */}
          <button
            onClick={handleCompleteEarly}
            className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs border-2 border-[#2D2424] shadow-sm transition-all hover:scale-105"
            title="Đánh dấu hoàn thành sớm task này"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Hoàn thành Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimerModal;

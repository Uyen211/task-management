import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react';
import DailySummaryBlock from '../components/DailySummaryBlock';
import JournalRichEditor from '../components/JournalRichEditor';
import { 
  getDailySummary, 
  getJournalEntry, 
  saveJournalEntry, 
  getJournalDraft, 
  saveJournalDraft 
} from '../services/api';

const JournalPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [summaryData, setSummaryData] = useState(null);
  const [journalEntry, setJournalEntry] = useState(null);
  const [journalDraft, setJournalDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchJournalData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Daily Summary
      const summaryRes = await getDailySummary(selectedDate);
      setSummaryData(summaryRes.data);

      // 2. Fetch Saved Journal Entry (404 handled gracefully)
      try {
        const entryRes = await getJournalEntry(selectedDate);
        setJournalEntry(entryRes.data);
      } catch (err) {
        setJournalEntry(null);
      }

      // 3. Fetch Journal Draft (404 handled gracefully)
      try {
        const draftRes = await getJournalDraft(selectedDate);
        setJournalDraft(draftRes.data?.draft_content || null);
      } catch (err) {
        setJournalDraft(null);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load journal data:', err);
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchJournalData();
  }, [fetchJournalData]);

  // Handle Auto-save draft (triggered 30s after user stops typing)
  const handleAutoSaveDraft = async (draftText) => {
    try {
      await saveJournalDraft({
        journal_date: selectedDate,
        draft_content: draftText,
      });
    } catch (err) {
      console.error('Failed to auto-save draft:', err);
    }
  };

  // Handle Save Official Journal Entry
  const handleSaveEntry = async ({ content_html, content_markdown }) => {
    setSaving(true);
    setNotification(null);
    try {
      await saveJournalEntry({
        journal_date: selectedDate,
        content_html,
        content_markdown,
      });
      setSaving(false);
      setNotification('✨ Bài nhật ký đã được lưu thành công!');
      fetchJournalData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setSaving(false);
      console.error('Failed to save journal entry:', err);
      alert('Không thể lưu bài nhật ký. Vui lòng thử lại!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border-4 border-[#2D2424] rounded-3xl p-6 md:p-8 shadow-pop relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#30D5C8] text-[#2D2424] border border-[#2D2424]">
                📘 UC08 - Journal & Notes
              </span>
              <span className="font-script text-xs text-[#FF8F7E] font-bold">
                Nhật Ký Học Tập Cá Nhân
              </span>
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl text-[#2D2424] flex items-center gap-2">
              Nhật Ký & Ghi Chú <BookOpen className="w-8 h-8 text-[#30D5C8]" />
            </h1>
            <p className="text-xs md:text-sm font-medium text-gray-600 mt-1">
              Xem tóm tắt thành quả trong ngày và ghi lại trải nghiệm học tập, ghi chú quan trọng
            </p>
          </div>

          {/* Date Picker Selector */}
          <div className="flex items-center gap-2 bg-[#FFF4E6] p-2 rounded-2xl border-2 border-[#2D2424]">
            <CalendarIcon className="w-4 h-4 text-[#FF8F7E]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-xs text-[#2D2424] focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 bg-emerald-100 border-2 border-emerald-500 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-black animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-white border-4 border-[#2D2424] rounded-3xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#30D5C8] border-t-transparent rounded-full animate-spin" />
            <span className="font-bold text-xs text-gray-500">Đang tải nhật ký & tóm tắt...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Daily Activity Summary Block */}
          <DailySummaryBlock summaryData={summaryData} selectedDate={selectedDate} />

          {/* Rich-Text / Markdown Editor */}
          <JournalRichEditor
            initialContent={journalEntry?.content_markdown || ''}
            draftContent={journalDraft}
            onSaveEntry={handleSaveEntry}
            onAutoSaveDraft={handleAutoSaveDraft}
            loading={saving}
          />
        </>
      )}
    </div>
  );
};

export default JournalPage;

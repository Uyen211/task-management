import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Quote, 
  Code, 
  Eye, 
  Edit3, 
  Save, 
  Sparkles, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { parseMarkdownToHtml } from '../utils/markdown';

const JournalRichEditor = ({
  initialContent = '',
  draftContent = null,
  onSaveEntry,
  onAutoSaveDraft,
  loading = false,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isPreview, setIsPreview] = useState(false);
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState(null);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  const autoSaveTimerRef = useRef(null);

  // Sync content when initialContent or draftContent changes
  useEffect(() => {
    setContent(initialContent || '');
    if (draftContent && draftContent !== initialContent) {
      setShowDraftPrompt(true);
    } else {
      setShowDraftPrompt(false);
    }
  }, [initialContent, draftContent]);

  // Auto-save draft 30s after typing stops
  const handleContentChange = (newVal) => {
    setContent(newVal);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (newVal.trim() && onAutoSaveDraft) {
        onAutoSaveDraft(newVal);
        const timeStr = new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastAutoSavedTime(timeStr);
      }
    }, 30000); // 30 seconds
  };

  // Toolbar Formatting helper for Markdown
  const applyFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('journal-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${prefix}${selectedText || 'văn bản'}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    handleContentChange(newContent);
  };

  const handleRestoreDraft = () => {
    if (draftContent) {
      setContent(draftContent);
      setShowDraftPrompt(false);
    }
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    const contentHtml = parseMarkdownToHtml(content);
    onSaveEntry && onSaveEntry({ content_html: contentHtml, content_markdown: content });
  };


  return (
    <div className="bg-white border-4 border-[#2D2424] rounded-3xl p-6 shadow-pop space-y-4">
      {/* Draft Restore Prompt Banner */}
      {showDraftPrompt && (
        <div className="p-4 bg-[#FF5CA8]/10 border-2 border-[#FF5CA8] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2D2424]">
            <AlertCircle className="w-4 h-4 text-[#FF5CA8] shrink-0" />
            <span>Phát hiện bản nháp chưa lưu trước đó cho ngày này!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3.5 py-1.5 rounded-full bg-[#FF5CA8] text-white text-xs font-bold shadow-xs hover:scale-105 transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khôi phục bản nháp
            </button>
            <button
              type="button"
              onClick={() => setShowDraftPrompt(false)}
              className="px-3 py-1.5 rounded-full bg-white border border-[#2D2424] text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      {/* Editor Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-gray-100 pb-3">
        {/* Formatting Buttons */}
        <div className="flex items-center gap-1 bg-[#FFF4E6] p-1 rounded-2xl border border-[#2D2424]/20 flex-wrap">
          <button
            type="button"
            onClick={() => applyFormatting('**', '**')}
            className="p-1.5 rounded-xl hover:bg-white text-[#2D2424] font-black text-xs transition-colors"
            title="In đậm (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('*', '*')}
            className="p-1.5 rounded-xl hover:bg-white text-[#2D2424] font-black text-xs transition-colors"
            title="In nghiêng (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('<u>', '</u>')}
            className="p-1.5 rounded-xl hover:bg-white text-[#2D2424] font-black text-xs transition-colors"
            title="Gạch chân (Underline)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button
            type="button"
            onClick={() => applyFormatting('\n- ')}
            className="p-1.5 rounded-xl hover:bg-white text-[#2D2424] font-black text-xs transition-colors"
            title="Danh sách (Bullet List)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('\n> ')}
            className="p-1.5 rounded-xl hover:bg-white text-[#2D2424] font-black text-xs transition-colors"
            title="Trích dẫn (Quote)"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('`', '`')}
            className="p-1.5 rounded-xl hover:bg-white text-[#2D2424] font-black text-xs transition-colors"
            title="Mã Code"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Status & Preview Toggle */}
        <div className="flex items-center gap-3">
          {lastAutoSavedTime && (
            <span className="text-[10px] font-bold text-[#FF5CA8] flex items-center gap-1 bg-[#FFF4E6] px-2.5 py-1 rounded-full border border-[#2D2424]/10">
              <Sparkles className="w-3 h-3 fill-current" /> Đã tự động lưu nháp ({lastAutoSavedTime})
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-[#2D2424] transition-all ${
              isPreview ? 'bg-[#30D5C8] text-[#2D2424]' : 'bg-white hover:bg-gray-100 text-[#2D2424]'
            }`}
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'Chế độ sửa' : 'Xem trước'}</span>
          </button>
        </div>
      </div>

      {/* Main Textarea or Preview Body */}
      {isPreview ? (
        <div className="min-h-[250px] p-4 bg-[#FFF4E6]/40 border-2 border-[#2D2424] rounded-2xl font-medium text-sm text-[#2D2424] prose max-w-none">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(content) }} />
          ) : (

            <span className="text-gray-400 font-script">Nội dung nhật ký trống...</span>
          )}
        </div>
      ) : (
        <textarea
          id="journal-textarea"
          rows={10}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Hôm nay bạn đã học được những kiến thức gì? Cảm nhận và ghi chú quan trọng..."
          className="w-full p-4 bg-[#FFF4E6]/30 border-2 border-[#2D2424] rounded-2xl font-medium text-sm text-[#2D2424] focus:outline-none focus:bg-white resize-y"
        />
      )}

      {/* Footer Save Button */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] font-medium text-gray-500">
          Tự động lưu nháp sau mỗi 30 giây dừng gõ
        </span>

        <button
          type="button"
          onClick={handleSaveSubmit}
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF8F7E] hover:bg-[#FF5CA8] text-white font-extrabold text-xs border-2 border-[#2D2424] shadow-pop transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Đang lưu...' : 'Lưu Bài Nhật Ký'}</span>
        </button>
      </div>
    </div>
  );
};

export default JournalRichEditor;

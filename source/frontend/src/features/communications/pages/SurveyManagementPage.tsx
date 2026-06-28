import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/axios';
import { useToastStore } from '@/components/ToastNotification';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip as ChartTooltip
} from 'recharts';
import { 
  HelpCircle,
  Trash2,
  Plus,
  X,
  Calendar,
  Users,
  FileSpreadsheet,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';

interface SurveyQuestion {
  id: string;
  questionText: string;
  questionType: string;
  isRequired: boolean;
  options: string[];
}

interface Survey {
  id: string;
  title: string;
  description: string;
  status: number; // 0: Draft, 1: Active, 2: Closed
  createdAt: string;
  endsAt: string | null;
  questionCount: number;
  respondentCount: number;
  creatorName: string;
}

interface QuestionStats {
  questionId: string;
  questionText: string;
  questionType: string;
  totalReplies: number;
  answers?: string[]; // For text
  chartData?: { name: string; value: number }[]; // For radio/checkbox
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const SurveyManagementPage = () => {
  const { user } = useAuthStore();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Builder Modal States
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Stats Modal States
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [surveyStats, setSurveyStats] = useState<QuestionStats[]>([]);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response: any = await apiClient.get('/Surveys/admin');
      setSurveys(response.data);
    } catch (error) {
      console.error('Fetch surveys error:', error);
      useToastStore.getState().addToast({
        title: 'Lỗi tải dữ liệu',
        message: 'Không thể kết nối đến máy chủ để tải danh sách khảo sát.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Builder functions
  const handleOpenBuilder = () => {
    setTitle('');
    setDescription('');
    setEndsAt('');
    setQuestions([
      { questionText: '', questionType: 'radio', isRequired: true, options: ['Tốt', 'Bình thường', 'Chưa tốt'] }
    ]);
    setIsBuilderOpen(true);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', questionType: 'radio', isRequired: true, options: ['Lựa chọn 1', 'Lựa chọn 2'] }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    setQuestions(questions.map((q, i) => i === idx ? { ...q, questionText: text } : q));
  };

  const handleQuestionTypeChange = (idx: number, type: string) => {
    setQuestions(questions.map((q, i) => {
      if (i === idx) {
        return { 
          ...q, 
          questionType: type,
          options: type === 'text' ? [] : ['Lựa chọn 1', 'Lựa chọn 2']
        };
      }
      return q;
    }));
  };

  const handleAddOption = (qIdx: number) => {
    setQuestions(questions.map((q, i) => {
      if (i === qIdx) {
        return { ...q, options: [...q.options, `Lựa chọn ${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    setQuestions(questions.map((q, i) => {
      if (i === qIdx) {
        return { ...q, options: q.options.filter((_: any, oIdx: number) => oIdx !== optIdx) };
      }
      return q;
    }));
  };

  const handleOptionTextChange = (qIdx: number, optIdx: number, text: string) => {
    setQuestions(questions.map((q, i) => {
      if (i === qIdx) {
        const newOpts = [...q.options];
        newOpts[optIdx] = text;
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const handleSaveSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate questions
    const invalidQuestion = questions.find(q => !q.questionText.trim());
    if (invalidQuestion) {
      alert('Vui lòng điền nội dung câu hỏi cho tất cả các mục!');
      return;
    }

    try {
      await apiClient.post('/Surveys', {
        creatorId: user?.id,
        title,
        description,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        questions: questions.map(q => ({
          questionText: q.questionText,
          questionType: q.questionType,
          isRequired: q.isRequired,
          options: q.questionType === 'text' ? null : q.options
        }))
      });

      useToastStore.getState().addToast({
        title: '🎉 Tạo khảo sát thành công',
        message: 'Khảo sát nháp mới đã được tạo và lưu trữ.',
        type: 'success'
      });

      setIsBuilderOpen(false);
      fetchSurveys();
    } catch (error) {
      console.error('Save survey error:', error);
      useToastStore.getState().addToast({
        title: 'Lỗi lưu dữ liệu',
        message: 'Đã xảy ra lỗi khi lưu khảo sát.',
        type: 'danger'
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: number) => {
    // Determine next status: Draft(0) -> Active(1), Active(1) -> Closed(2)
    const nextStatus = currentStatus === 0 ? 1 : 2;
    const actionText = nextStatus === 1 ? 'mở kích hoạt công khai' : 'đóng kết thúc';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} cuộc khảo sát này không?`)) return;

    try {
      await apiClient.post(`/Surveys/${id}/toggle-status?status=${nextStatus}`);
      useToastStore.getState().addToast({
        title: 'Cập nhật trạng thái',
        message: `Khảo sát đã được chuyển sang trạng thái mới.`,
        type: 'success'
      });
      fetchSurveys();
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (!window.confirm('CẢNH BÁO: Xóa khảo sát sẽ xóa toàn bộ câu hỏi và đáp án đã thu thập. Bạn chắc chắn muốn xóa chứ?')) return;

    try {
      await apiClient.delete(`/Surveys/${id}`);
      useToastStore.getState().addToast({
        title: 'Đã xóa khảo sát',
        message: 'Khảo sát đã được gỡ khỏi hệ thống.',
        type: 'success'
      });
      setSurveys(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Delete survey error:', error);
    }
  };

  const handleViewStats = async (survey: Survey) => {
    setSelectedSurvey(survey);
    setIsStatsOpen(true);
    setStatsLoading(true);
    try {
      const response: any = await apiClient.get(`/Surveys/${survey.id}/stats`);
      setSurveyStats(response.data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
      useToastStore.getState().addToast({
        title: 'Lỗi tải thống kê',
        message: 'Không thể tải kết quả biểu đồ phân tích.',
        type: 'danger'
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center shrink-0"><Activity size={8} className="mr-0.5 animate-pulse" /> Đang khảo sát</span>;
      case 2:
        return <span className="bg-gray-50 text-gray-500 border border-gray-150 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">Đã đóng</span>;
      default:
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">Bản nháp</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">NeoBoard - Khảo sát ý kiến</h2>
          <p className="text-xs text-gray-400 mt-1">Tạo các câu hỏi thăm dò ý kiến sinh viên và phân tích kết quả bằng biểu đồ trực quan thực tế.</p>
        </div>

        <button
          onClick={handleOpenBuilder}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus size={14} className="mr-1.5" /> Tạo khảo sát mới
        </button>
      </div>

      {/* Survey List */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 italic text-xs">Đang tải danh sách khảo sát...</div>
      ) : surveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {surveys.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl border border-gray-150 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getStatusBadge(s.status)}
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.creatorName.split(' ').pop()} tạo</span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-950 text-xs leading-snug">{s.title}</h3>
                  {s.description && (
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                  <div>
                    <span className="text-gray-950 text-xs block font-black">{s.questionCount}</span>
                    Câu hỏi
                  </div>
                  <div>
                    <span className="text-gray-950 text-xs block font-black">{s.respondentCount}</span>
                    Lượt phản hồi
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 flex items-center justify-between">
                <span className="text-[9px] text-gray-400 font-bold">
                  {s.endsAt ? `Hạn: ${new Date(s.endsAt).toLocaleDateString('vi-VN')}` : 'Không giới hạn hạn'}
                </span>

                <div className="flex items-center space-x-1.5">
                  {s.status === 0 && (
                    <button
                      onClick={() => handleToggleStatus(s.id, 0)}
                      className="px-2 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold border border-emerald-100 transition-colors"
                    >
                      Kích hoạt
                    </button>
                  )}
                  {s.status === 1 && (
                    <button
                      onClick={() => handleToggleStatus(s.id, 1)}
                      className="px-2 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg font-bold border border-gray-150 transition-colors"
                    >
                      Kết thúc
                    </button>
                  )}
                  <button
                    onClick={() => handleViewStats(s)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-100 hover:border-blue-100 transition-all"
                    title="Xem biểu đồ phân tích"
                  >
                    <BarChart3 size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteSurvey(s.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-gray-100 hover:border-red-100 transition-all"
                    title="Xóa khảo sát"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 bg-white rounded-3xl border border-gray-150 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <p className="font-black text-gray-800 uppercase text-xs">Chưa có khảo sát nào</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Nhấn Tạo khảo sát để thu thập ý kiến người dùng!</p>
          </div>
        </div>
      )}

      {/* Survey Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-gray-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center">
                <Plus size={16} className="text-blue-600 mr-2" /> Dựng khảo sát mới
              </h3>
              <button 
                onClick={() => setIsBuilderOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSurvey} className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-black text-gray-500 uppercase tracking-wider text-[10px]">Tên khảo sát</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ví dụ: Đánh giá chất lượng thực hành IoT"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-black text-gray-500 uppercase tracking-wider text-[10px]">Ngày kết thúc (Tùy chọn)</label>
                  <input
                    type="date"
                    value={endsAt}
                    onChange={e => setEndsAt(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-black text-gray-500 uppercase tracking-wider text-[10px]">Mô tả khảo sát</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Điền hướng dẫn hoặc lý do làm cuộc khảo sát này..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-medium resize-none"
                />
              </div>

              {/* Questions List Builder */}
              <div className="space-y-4 border-t border-gray-150 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-gray-950 uppercase tracking-wider text-[10px] flex items-center">
                    <HelpCircle size={12} className="mr-1 text-blue-600" /> Danh sách câu hỏi ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl flex items-center gap-1 border border-blue-100"
                  >
                    <Plus size={10} /> Thêm câu hỏi
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 hover:bg-white p-1 rounded-full border border-transparent hover:border-gray-200 transition-all"
                    >
                      <X size={12} />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pr-6">
                      <div className="sm:col-span-8 space-y-1">
                        <label className="font-black text-gray-400 uppercase tracking-wider text-[9px]">Câu hỏi {qIdx + 1}</label>
                        <input
                          type="text"
                          required
                          value={q.questionText}
                          onChange={e => handleQuestionTextChange(qIdx, e.target.value)}
                          placeholder="Nhập nội dung câu hỏi..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-blue-500 rounded-xl outline-none font-bold"
                        />
                      </div>
                      <div className="sm:col-span-4 space-y-1">
                        <label className="font-black text-gray-400 uppercase tracking-wider text-[9px]">Kiểu trả lời</label>
                        <select
                          value={q.questionType}
                          onChange={e => handleQuestionTypeChange(qIdx, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-blue-500 rounded-xl outline-none font-bold cursor-pointer"
                        >
                          <option value="radio">Chọn một (Radio)</option>
                          <option value="checkbox">Chọn nhiều (Checkbox)</option>
                          <option value="text">Tự luận (Text)</option>
                        </select>
                      </div>
                    </div>

                    {/* Question Choice Options Builder (Only for radio/checkbox) */}
                    {q.questionType !== 'text' && (
                      <div className="pl-4 border-l-2 border-blue-200 space-y-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-black text-gray-400 uppercase tracking-wider text-[8px]">Các đáp án trắc nghiệm</span>
                          <button
                            type="button"
                            onClick={() => handleAddOption(qIdx)}
                            className="text-[9px] font-bold text-blue-600 hover:underline flex items-center"
                          >
                            <Plus size={8} className="mr-0.5" /> Thêm đáp án
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt: string, optIdx: number) => (
                            <div key={optIdx} className="flex items-center space-x-1.5">
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={e => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                                className="flex-grow px-2 py-1.5 bg-white border border-gray-250 focus:border-blue-500 rounded-lg outline-none text-[11px]"
                              />
                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(qIdx, optIdx)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X size={10} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit builder */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors uppercase tracking-wider text-[10px]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all uppercase tracking-wider text-[10px] shadow-sm active:scale-95"
                >
                  Tạo bản nháp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Survey Stats Modal (Recharts) */}
      {isStatsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-gray-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150">
              <div>
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center">
                  <TrendingUp size={16} className="text-blue-600 mr-2" /> Kết quả khảo sát thực tế
                </h3>
                <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{selectedSurvey?.title}</span>
              </div>
              <button 
                onClick={() => setIsStatsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {statsLoading ? (
              <div className="py-16 text-center text-gray-400 italic text-xs">Đang phân tích kết quả thống kê...</div>
            ) : (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                {surveyStats.length > 0 ? (
                  surveyStats.map((stat, idx) => (
                    <div key={stat.questionId} className="bg-gray-50/70 p-5 rounded-2xl border border-gray-150 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">Câu {idx + 1} ({stat.questionType})</span>
                          <h4 className="font-bold text-gray-900 text-xs mt-0.5">{stat.questionText}</h4>
                        </div>
                        <span className="bg-gray-100 text-gray-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
                          {stat.totalReplies} Phản hồi
                        </span>
                      </div>

                      {/* Display Chart for choices or list for text */}
                      {stat.questionType === 'text' ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {stat.answers && stat.answers.length > 0 ? (
                            stat.answers.map((ans, aIdx) => (
                              <div key={aIdx} className="bg-white p-2.5 rounded-xl border border-gray-150/70 flex gap-2">
                                <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 border border-blue-100">
                                  {aIdx + 1}
                                </div>
                                <p className="text-[11px] text-gray-700 leading-relaxed font-medium">{ans}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-gray-400 font-bold italic">Chưa có câu trả lời tự luận nào.</p>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          {/* Recharts Chart representation */}
                          <div className="md:col-span-8 h-44 w-full">
                            {/* Checkbox (multiple choice) - bar chart, Radio - pie chart */}
                            {stat.questionType === 'checkbox' ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stat.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
                                  <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                                  <ChartTooltip contentStyle={{ fontSize: 9, borderRadius: '8px' }} />
                                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                    {stat.chartData?.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={stat.chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={65}
                                    paddingAngle={2}
                                    dataKey="value"
                                  >
                                    {stat.chartData?.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <ChartTooltip contentStyle={{ fontSize: 9, borderRadius: '8px' }} />
                                </PieChart>
                              </ResponsiveContainer>
                            )}
                          </div>

                          {/* Options legend and percentages */}
                          <div className="md:col-span-4 space-y-2">
                            {stat.chartData?.map((data, dIdx) => {
                              const total = stat.chartData?.reduce((acc, curr) => acc + curr.value, 0) || 1;
                              const pct = ((data.value / total) * 100).toFixed(1);
                              return (
                                <div key={dIdx} className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                                  <div className="flex items-center space-x-1.5 min-w-0">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[dIdx % COLORS.length] }} />
                                    <span className="font-bold text-gray-700 truncate max-w-[120px]">{data.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[10px]">
                                    <span className="font-black text-gray-900">{data.value} phiếu</span>
                                    <span className="text-gray-400 font-bold">({pct}%)</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-gray-400 italic">Khảo sát này chưa có lượt nộp phản hồi nào để phân tích dữ liệu.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyManagementPage;

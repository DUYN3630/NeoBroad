import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  Calendar, 
  ChevronRight,
  QrCode,
  ArrowRight,
  Info,
  Laptop,
  Monitor,
  Speaker,
  Trello,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Search,
  CheckCircle2,
  RefreshCw,
  FileText,
  X,
  Check,
  Phone,
  MessageSquare,
  Star,
  Heart,
  Send,
  User
} from 'lucide-react';
import { useToastStore } from '@/components/ToastNotification';
import { signalRService } from '@/lib/signalrService';

interface BorrowedItem {
  id: string;
  requestId: string;
  assetName: string;
  serialNumber: string;
  type: string;
  requestDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  requestStatus: string;
  conditionOnBorrow: string;
  conditionOnReturn: string;
  evidencePhotoUrl: string;
  transactionHash?: string;
  assetId?: string;
  assetStatus?: string;
}

const StudentPortal = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [rawRequests, setRawRequests] = useState<any[]>([]);
  const [borrowedItems, setBorrowedItems] = useState<BorrowedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'timeline' | 'surveys'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Student Timeline & Surveys States
  const [timelinePosts, setTimelinePosts] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [studentCommentInputs, setStudentCommentInputs] = useState<{ [postId: string]: string }>({});
  const [activeSurveys, setActiveSurveys] = useState<any[]>([]);
  const [surveysLoading, setSurveysLoading] = useState(false);
  const [currentSurveyForQuiz, setCurrentSurveyForQuiz] = useState<any | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: any }>({});
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});

  // Report Failure Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedAssetForReport, setSelectedAssetForReport] = useState<BorrowedItem | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [reportUrgency, setReportUrgency] = useState('Medium');

  // Support Center Modal States
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [activeSupportTab, setActiveSupportTab] = useState<'regulations' | 'schedule' | 'hotline' | 'feedback'>('regulations');
  
  // Feedback Form States
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Chất lượng thiết bị');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const handleOpenReportModal = (record: BorrowedItem) => {
    setSelectedAssetForReport(record);
    setReportDescription('');
    setReportUrgency('Medium');
    setIsReportModalOpen(true);
  };

  const handleSubmittingFailure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForReport || !user) return;

    try {
      const payload = {
        assetId: selectedAssetForReport.assetId,
        reportedBy: user.fullName || 'Sinh viên',
        urgency: reportUrgency,
        description: reportDescription
      };
      await apiClient.post('/Maintenance/Failures', payload);
      setIsReportModalOpen(false);
      alert('Đã gửi báo cáo hỏng hóc thiết bị thành công! Thủ kho và kỹ thuật viên đã được thông báo.');
      fetchData();
    } catch (err) {
      alert('Gửi báo cáo sự cố thất bại. Vui lòng thử lại sau.');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setFeedbackSubmitting(false);
    setIsSupportModalOpen(false);
    
    // Add success toast
    useToastStore.getState().addToast({
      title: '💬 Góp ý thành công',
      message: 'Cảm ơn ý kiến quý giá của bạn để cải thiện chất lượng dịch vụ!',
      type: 'success'
    });

    // Reset form
    setFeedbackRating(5);
    setFeedbackCategory('Chất lượng thiết bị');
    setFeedbackComment('');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user) {
        const response: any = await apiClient.get(`/Borrow/MyRequests/${user.id}`);
        setRawRequests(response.data);
        
        const items: BorrowedItem[] = [];
        response.data.forEach((r: any) => {
          if (r.items && r.items.length > 0) {
            r.items.forEach((item: any) => {
              items.push({
                id: item.id,
                assetId: item.assetId,
                assetStatus: item.asset?.status || 'Active',
                requestId: r.id,
                assetName: item.asset?.name || 'Thiết bị không tên',
                serialNumber: item.asset?.serialNumber || 'N/A',
                type: item.asset?.type || 'N/A',
                requestDate: r.requestDate,
                expectedReturnDate: r.expectedReturnDate,
                actualReturnDate: item.actualReturnDate,
                requestStatus: r.status,
                conditionOnBorrow: item.conditionOnBorrow || 'Tốt',
                conditionOnReturn: item.conditionOnReturn || 'Chưa hoàn trả',
                evidencePhotoUrl: r.evidencePhotoUrl,
                transactionHash: r.transactionHash
              });
            });
          }
        });
        setBorrowedItems(items);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimelinePosts = async () => {
    setTimelineLoading(true);
    try {
      const response: any = await apiClient.get('/Timeline');
      setTimelinePosts(response.data);
    } catch (error) {
      console.error('Fetch timeline error:', error);
    } finally {
      setTimelineLoading(false);
    }
  };

  const fetchStudentSurveys = async () => {
    if (!user) return;
    setSurveysLoading(true);
    try {
      const response: any = await apiClient.get(`/Surveys/active?userId=${user.id}`);
      setActiveSurveys(response.data);
    } catch (error) {
      console.error('Fetch active surveys error:', error);
    } finally {
      setSurveysLoading(false);
    }
  };

  const handleStudentLike = async (postId: string) => {
    try {
      const response: any = await apiClient.post(`/Timeline/${postId}/like`);
      setTimelinePosts(prevPosts => 
        prevPosts.map(p => p.id === postId ? { ...p, likeCount: response.data.likes } : p)
      );
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleStudentCommentSubmit = async (postId: string) => {
    const commentText = studentCommentInputs[postId];
    if (!commentText || !commentText.trim() || !user) return;

    try {
      const response: any = await apiClient.post(`/Timeline/${postId}/comments`, {
        authorId: user.id,
        content: commentText
      });

      setTimelinePosts(prevPosts => 
        prevPosts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              commentCount: p.commentCount + 1,
              comments: [...p.comments, response.data.comment]
            };
          }
          return p;
        })
      );

      setStudentCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const handleStartQuiz = (survey: any) => {
    setCurrentSurveyForQuiz(survey);
    setQuizAnswers({});
  };

  const handleQuizAnswerChange = (qId: string, answer: any) => {
    setQuizAnswers(prev => ({
      ...prev,
      [qId]: answer
    }));
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSurveyForQuiz || !user) return;

    // Check if required questions are answered
    for (const q of currentSurveyForQuiz.questions) {
      if (q.isRequired && !quizAnswers[q.id]) {
        alert(`Vui lòng trả lời câu hỏi: "${q.questionText}"`);
        return;
      }
    }

    try {
      const answersPayload = Object.keys(quizAnswers).map(qId => {
        const val = quizAnswers[qId];
        let answerStr = '';
        if (Array.isArray(val)) {
          answerStr = JSON.stringify(val);
        } else {
          answerStr = String(val);
        }

        return {
          questionId: qId,
          answer: answerStr
        };
      });

      await apiClient.post(`/Surveys/${currentSurveyForQuiz.id}/submit`, {
        userId: user.id,
        answers: answersPayload
      });

      useToastStore.getState().addToast({
        title: '🎉 Khảo sát hoàn tất',
        message: 'Cảm ơn bạn đã tham gia đóng góp ý kiến!',
        type: 'success'
      });

      setCurrentSurveyForQuiz(null);
      fetchStudentSurveys();
    } catch (error: any) {
      console.error('Submit quiz error:', error);
      alert(error.response?.data?.message || 'Không thể gửi câu trả lời khảo sát. Vui lòng thử lại sau.');
    }
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response: any = await apiClient.get('/News');
        setNews(response.data);
      } catch (error) {
        console.error('Fetch news error:', error);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchData();
    fetchNews();
    fetchTimelinePosts();
    fetchStudentSurveys();

    // Subscribe to real-time timeline posts and surveys
    const unsubscribeNewPost = signalRService.subscribe('ReceiveTimelinePost', (newPost) => {
      const formattedPost = {
        ...newPost,
        comments: newPost.comments || []
      };
      setTimelinePosts(prev => {
        if (prev.some(p => p.id === formattedPost.id)) return prev;
        return [formattedPost, ...prev];
      });
    });

    const unsubscribeNewSurvey = signalRService.subscribe('ReceiveNewSurvey', (newSurvey) => {
      fetchStudentSurveys();
    });

    return () => {
      unsubscribeNewPost();
      unsubscribeNewSurvey();
    };
  }, [user]);

  const categories = [
    { name: 'Laptop & Máy tính', icon: <Laptop size={24} />, count: 12, color: 'blue', tab: 'assets', type: 'Laptop' },
    { name: 'Thiết bị trình chiếu', icon: <Monitor size={24} />, count: 5, color: 'purple', tab: 'assets', type: 'Monitor' },
    { name: 'Âm thanh & Micro', icon: <Speaker size={24} />, count: 8, color: 'orange', tab: 'assets', type: 'Printer' }, // Maps to Printer since there is no speaker type seeded
    { name: 'Dụng cụ thí nghiệm', icon: <Trello size={24} />, count: 20, color: 'green', tab: 'toolsets', type: 'All' },
  ];

  // Stats calculations
  const approvedCount = borrowedItems.filter(item => item.requestStatus === 'Approved' && !item.actualReturnDate).length;
  const pendingCount = rawRequests.filter(r => r.status === 'Pending').length;

  const getOverdueItems = () => {
    const today = new Date();
    return borrowedItems.filter(item => {
      if (item.requestStatus !== 'Approved' || item.actualReturnDate) return false;
      const dueDate = new Date(item.expectedReturnDate);
      return dueDate < today;
    });
  };

  const getNearDueItems = () => {
    const today = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    return borrowedItems.filter(item => {
      if (item.requestStatus !== 'Approved' || item.actualReturnDate) return false;
      const dueDate = new Date(item.expectedReturnDate);
      return dueDate >= today && dueDate <= twoDaysFromNow;
    });
  };

  const overdueItems = getOverdueItems();
  const nearDueItems = getNearDueItems();

  // Format date helper
  const formatDateString = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  // Filtered History Items
  const filteredHistoryItems = borrowedItems.filter(item => {
    const matchesSearch = item.assetName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending') return matchesSearch && item.requestStatus === 'Pending';
    if (statusFilter === 'in_use') return matchesSearch && item.requestStatus === 'Approved' && !item.actualReturnDate;
    if (statusFilter === 'returned') return matchesSearch && item.actualReturnDate !== null;
    if (statusFilter === 'overdue') {
      const isOverdue = item.requestStatus === 'Approved' && !item.actualReturnDate && new Date(item.expectedReturnDate) < new Date();
      return matchesSearch && isOverdue;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* 1. WARNING BANNERS & MINI CARDS AT THE TOP */}
      <div className="space-y-4">
        {/* OVERDUE WARNING BANNER */}
        {overdueItems.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-4 flex items-start space-x-4 shadow-sm animate-pulse">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-black text-red-800 text-xs uppercase tracking-wider">CẢNH BÁO: Quá hạn trả thiết bị!</h4>
              <p className="text-xs text-red-600 mt-1 font-medium">
                Bạn đang giữ <span className="font-bold">{overdueItems.length} thiết bị quá hạn</span>. Vui lòng mang ngay tới quầy bàn giao của thủ kho để hoàn trả để tránh bị phạt khóa tài khoản.
              </p>
            </div>
          </div>
        )}

        {/* NEAR DUE WARNING BANNER */}
        {nearDueItems.length > 0 && (
          <div className="space-y-2">
            {nearDueItems.map((item) => (
              <div key={item.id} className="bg-orange-50/90 border-l-4 border-orange-400 rounded-2xl p-4 flex items-start space-x-4 shadow-sm">
                <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-black text-orange-850 text-xs uppercase tracking-wider">Chú ý: Thiết bị sắp hết hạn trả</h4>
                  <p className="text-xs text-orange-700 mt-1 font-medium">
                    ⚠️ Chú ý: Thiết bị <span className="font-bold text-orange-950">[{item.assetName}]</span> của bạn sẽ đến hạn trả vào ngày <span className="font-bold text-orange-950">{formatDateString(item.expectedReturnDate)}</span>. Vui lòng mang tới quầy bàn giao đúng hạn để tránh bị phạt khóa tài khoản.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STATS TILES (Dashboard Mini Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Thiết bị đang mượn</p>
              <p className="text-xl font-black text-gray-800 mt-1">{approvedCount} Thiết bị</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={18} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Đơn chờ duyệt</p>
              <p className="text-xl font-black text-gray-800 mt-1">{pendingCount} Đơn</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClipboardList size={18} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Cảnh báo trễ hạn</p>
              <p className={`text-xl font-black mt-1 ${overdueItems.length > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                {overdueItems.length} Thiết bị
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${overdueItems.length > 0 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
              <AlertTriangle size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTROLLER */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center space-x-2 transition-all ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package size={16} />
            <span>Tổng quan & Mượn đồ</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center space-x-2 transition-all ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText size={16} />
            <span>Lịch sử mượn trả & Tra cứu Blockchain</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center space-x-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare size={16} />
            <span>Bảng tin Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('surveys')}
            className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center space-x-2 transition-all ${
              activeTab === 'surveys'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ClipboardList size={16} />
            <span>Khảo sát ý kiến</span>
          </button>
        </nav>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          
          {/* HERO BANNER */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 md:p-12 text-white shadow-lg">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Package size={200} />
            </div>
            <div className="relative z-10 max-w-2xl">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-3 opacity-80">NeoBoard Service Hub</h2>
                <h1 className="text-3xl md:text-4xl font-black mb-6 leading-[1.2] tracking-tight">
                    Xin chào, {user?.fullName?.split(' ').pop()}! <br/>
                    Bạn muốn mượn thiết bị học tập nào hôm nay?
                </h1>
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => navigate('/student/assets')}
                        className="px-6 py-3.5 bg-white text-blue-600 rounded-xl font-black text-xs tracking-wider flex items-center shadow-md hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        ĐĂNG KÝ MƯỢN THIẾT BỊ <ArrowRight size={16} className="ml-2" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className="px-6 py-3.5 bg-blue-700/30 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold text-xs tracking-wider hover:bg-blue-700/50 transition-all"
                    >
                        Lịch sử & Chữ ký số
                    </button>
                </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: CATEGORIES & NEWS & HELD ITEMS */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* CURRENTLY HELD ITEMS */}
              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center space-x-2">
                      <span>Thiết bị đang giữ</span>
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest border border-blue-100">
                        {approvedCount} Món
                      </span>
                    </h3>
                    {approvedCount > 0 && (
                      <span className="text-xs text-gray-400 font-bold">Vui lòng hoàn trả đúng hạn</span>
                    )}
                 </div>
                 
                 <div className="space-y-4">
                    {loading ? (
                       <div className="p-12 text-center text-gray-400 italic">Đang kiểm tra kho cá nhân...</div>
                    ) : borrowedItems.filter(item => item.requestStatus === 'Approved' && !item.actualReturnDate).length > 0 ? (
                       borrowedItems.filter(item => item.requestStatus === 'Approved' && !item.actualReturnDate).map((record) => (
                          <div key={record.id} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-5 group">
                              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform overflow-hidden border border-gray-100 shrink-0">
                                  {record.evidencePhotoUrl ? (
                                      <img src={`http://localhost:5054${record.evidencePhotoUrl}`} alt="Evidence" className="w-full h-full object-cover" />
                                  ) : (
                                      <Package size={24} />
                                  )}
                              </div>
                              <div className="flex-grow text-center sm:text-left">
                                  <h4 className="font-bold text-gray-900 text-base">{record.assetName}</h4>
                                  <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">{record.serialNumber} • {record.type}</p>
                                  <div className="flex items-center justify-center sm:justify-start space-x-4 mt-2">
                                      <div className="flex items-center text-xs">
                                          <Clock size={12} className="mr-1.5 text-blue-500" />
                                          <span className="text-gray-400 font-bold tracking-tighter mr-1.5">Hạn trả:</span>
                                          <span className="text-red-500 font-black">{new Date(record.expectedReturnDate).toLocaleDateString('vi-VN')}</span>
                                      </div>
                                  </div>
                              </div>
                              {record.assetStatus === 'Broken' ? (
                                <span className="px-3 py-1.5 bg-red-50 text-red-650 rounded-xl text-xs font-black border border-red-100 flex items-center shrink-0">
                                  <AlertTriangle size={12} className="mr-1 text-red-500" /> Đang báo hỏng
                                </span>
                              ) : (
                                <button 
                                  onClick={() => handleOpenReportModal(record)}
                                  className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 shrink-0"
                                >
                                    Báo lỗi/Hỏng
                                </button>
                              )}
                          </div>
                       ))
                    ) : (
                       <div className="p-12 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-center">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Info size={20} className="text-gray-300" />
                          </div>
                          <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">Bạn hiện không giữ thiết bị nào</p>
                       </div>
                    )}
                 </div>
              </section>

              {/* CATEGORIES BROWSE */}
              <section>
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Danh mục thiết bị</h3>
                      <button onClick={() => navigate('/student/assets')} className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {categories.map((cat, i) => (
                          <div 
                              key={i} 
                              onClick={() => navigate('/student/assets', { state: { tab: cat.tab, category: cat.type } })}
                              className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
                          >
                              <div className={`w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                                  {cat.icon}
                                  </div>
                              <p className="font-bold text-gray-800 text-xs leading-tight">{cat.name}</p>
                              <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{cat.count} Sẵn sàng</p>
                          </div>
                      ))}
                  </div>
              </section>

              {/* TECH NEWS SECTION */}
              <section>
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Tin tức & Công nghệ học thuật</h3>
                  </div>
                  {newsLoading ? (
                      <div className="p-8 text-center text-gray-400 italic text-xs">Đang tải tin tức...</div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {news.slice(0, 3).map((item, idx) => (
                              <a href={item.url} target="_blank" rel="noopener noreferrer" key={idx} className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-100 transition-all flex flex-col group">
                                  <div className="h-32 overflow-hidden relative">
                                      <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                          Tech News
                                      </span>
                                  </div>
                                  <div className="p-4 flex-grow flex flex-col justify-between space-y-2 bg-white">
                                      <div>
                                          <h4 className="font-bold text-gray-800 text-xs leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</h4>
                                          <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                                      </div>
                                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold pt-2 border-t border-gray-50">
                                          <span>{item.author?.substring(0,10)}...</span>
                                          <span>{new Date(item.publishedAt).toLocaleDateString('vi-VN')}</span>
                                      </div>
                                  </div>
                              </a>
                          ))}
                      </div>
                  )}
              </section>

            </div>

            {/* RIGHT COLUMN: QR PERSONAL CODE & INFO */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm text-center">
                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Mã định danh mượn đồ</h4>
                    <div className="w-32 h-32 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto border-2 border-dashed border-gray-200 shadow-inner mb-4 relative group cursor-pointer">
                        <QrCode size={80} className="text-gray-800" />
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">MSSV: SV1001</span>
                        </div>
                    </div>
                    <p className="text-lg font-black text-gray-900 tracking-tighter">SV1001</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 leading-relaxed">
                      Đưa mã này cho Thủ kho tại quầy <br/>để duyệt nhận & trả thiết bị nhanh.
                    </p>
                </div>

                <div className="bg-gray-950 p-6 rounded-2xl text-white shadow-md">
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-blue-400 mb-4 flex items-center">
                        <Info size={14} className="mr-2" /> Trung tâm hỗ trợ sinh viên
                    </h4>
                    <ul className="space-y-3">
                        {[
                          { name: 'Quy chế đền bù mất/hỏng đồ', tab: 'regulations' },
                          { name: 'Lịch làm việc phòng thiết bị', tab: 'schedule' },
                          { name: 'Hotline hỗ trợ kỹ thuật', tab: 'hotline' },
                          { name: 'Góp ý chất lượng dịch vụ', tab: 'feedback' }
                        ].map((item, i) => (
                            <li 
                              key={i} 
                              className="flex items-center justify-between group cursor-pointer text-xs"
                              onClick={() => {
                                setActiveSupportTab(item.tab as any);
                                setIsSupportModalOpen(true);
                              }}
                            >
                                <span className="text-gray-400 group-hover:text-white transition-colors">{item.name}</span>
                                <ChevronRight size={12} className="text-gray-600 group-hover:text-blue-400 transition-all" />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: HISTORY & BLOCKCHAIN TRACING */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-200 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center">
                <ShieldCheck className="text-blue-600 mr-2" size={20} />
                Sổ cái Lịch sử mượn & Chữ ký số Blockchain
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Các giao dịch mượn trả được băm mã hóa SHA-256 kèm hình ảnh minh chứng để đảm bảo tính toàn vẹn tuyệt đối.
              </p>
            </div>
            
            <button 
              onClick={fetchData}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center self-start md:self-center transition-all"
            >
              <RefreshCw size={12} className="mr-1.5" /> Làm mới
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm thiết bị hoặc số Serial..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt mượn</option>
              <option value="in_use">Đang cầm đồ</option>
              <option value="returned">Đã hoàn trả</option>
              <option value="overdue">Quá hạn trả</option>
            </select>
          </div>

          {/* History List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-gray-400 italic text-xs">Đang tải sổ cái giao dịch...</div>
            ) : filteredHistoryItems.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thiết bị</th>
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày mượn</th>
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hạn trả / Thực tế</th>
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tình trạng lúc trả</th>
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Xác minh số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {filteredHistoryItems.map((item) => {
                    const isOverdue = item.requestStatus === 'Approved' && !item.actualReturnDate && new Date(item.expectedReturnDate) < new Date();
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-900">{item.assetName}</p>
                          <p className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">{item.serialNumber} • {item.type}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-500 font-medium">
                          {new Date(item.requestDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center text-gray-400 text-[10px]">
                              <span className="w-12 shrink-0">Hạn trả:</span>
                              <span className="font-bold text-gray-600">{new Date(item.expectedReturnDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="flex items-center text-[10px]">
                              <span className="w-12 shrink-0 text-gray-400">Trả thực:</span>
                              <span className={`font-bold ${item.actualReturnDate ? 'text-green-600' : 'text-gray-400 italic'}`}>
                                {item.actualReturnDate ? new Date(item.actualReturnDate).toLocaleDateString('vi-VN') : 'Chưa trả'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {item.actualReturnDate ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.conditionOnReturn?.includes('Báo mất')
                                ? 'bg-red-50 text-red-600 border border-red-100'
                                : item.conditionOnReturn?.includes('Hỏng') || item.conditionOnReturn?.includes('Lỗi')
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : 'bg-green-50 text-green-600 border border-green-100'
                            }`}>
                              {item.conditionOnReturn}
                            </span>
                          ) : (
                            <span className="text-gray-300 italic text-[10px]">Chưa trả</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {item.actualReturnDate ? (
                            item.conditionOnReturn?.includes('Báo mất') ? (
                              <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-red-200">
                                Đã mất - Chờ đền bù
                              </span>
                            ) : item.conditionOnReturn?.includes('Hỏng') || item.conditionOnReturn?.includes('Lỗi') ? (
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-250">
                                Hỏng - Đang sửa chữa
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-green-100">
                                Đã hoàn trả
                              </span>
                            )
                          ) : item.requestStatus === 'Pending' ? (
                            <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-orange-100 animate-pulse">
                              Chờ duyệt mượn
                            </span>
                          ) : item.requestStatus === 'Rejected' ? (
                            <span className="px-2.5 py-0.5 bg-red-50 text-red-500 rounded-full text-[9px] font-black uppercase tracking-wider border border-red-100">
                              Đã từ chối
                            </span>
                          ) : isOverdue ? (
                            <span className="px-2.5 py-0.5 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-red-200 animate-pulse">
                              Quá hạn trả
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-blue-100">
                              Đang sử dụng
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {item.transactionHash ? (
                            <button
                              onClick={() => setSelectedHash(item.transactionHash!)}
                              className="px-2.5 py-1 bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-500 transition-all flex items-center mx-auto"
                            >
                              <ShieldCheck size={11} className="mr-1 text-green-500" />
                              Blockchain
                            </button>
                          ) : (
                            <span className="text-gray-300 italic text-[10px]">Chưa ký số</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-gray-400 italic text-xs border border-dashed border-gray-100 rounded-2xl">
                Không tìm thấy dữ liệu mượn trả nào phù hợp.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center">
              <MessageSquare className="text-blue-600 mr-2" size={20} />
              Bảng tin Timeline
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Xem các hoạt động, sự kiện và chia sẻ từ ban quản trị và thảo luận cùng cộng đồng NeoBoard.
            </p>
          </div>

          {timelineLoading ? (
            <div className="py-12 text-center text-gray-400 italic text-xs">Đang tải bảng tin...</div>
          ) : timelinePosts.length > 0 ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {timelinePosts.map((post) => {
                const isExpanded = !!expandedComments[post.id];
                return (
                  <div key={post.id} className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-5 flex items-center space-x-3.5 border-b border-gray-50">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black border border-blue-100 uppercase text-xs">
                        {post.authorName ? post.authorName.charAt(0) : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-xs text-gray-900">{post.authorName}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            post.authorRole === 0 ? 'bg-red-55 text-red-700 border border-red-100' :
                            post.authorRole === 1 ? 'bg-amber-55 text-amber-700 border border-amber-100' :
                            post.authorRole === 2 ? 'bg-purple-55 text-purple-700 border border-purple-100' :
                            'bg-blue-55 text-blue-700 border border-blue-100'
                          }`}>
                            {post.authorRole === 0 ? 'Admin' : post.authorRole === 1 ? 'Staff' : post.authorRole === 2 ? 'Teacher' : 'Student'}
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold block mt-0.5">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')} {new Date(post.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      {post.title && <h3 className="font-black text-sm text-gray-900 leading-snug">{post.title}</h3>}
                      <p className="text-xs text-gray-700 leading-relaxed font-medium whitespace-pre-line">{post.content}</p>
                      {post.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 max-h-72 flex items-center justify-center">
                          <img src={post.imageUrl} alt="Timeline cover" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Footer buttons */}
                    <div className="px-5 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center space-x-4">
                      <button 
                        onClick={() => handleStudentLike(post.id)}
                        className="flex items-center space-x-1.5 text-xs text-gray-500 hover:text-red-500 font-bold transition-colors"
                      >
                        <Heart size={14} className="fill-transparent stroke-current hover:fill-red-500" />
                        <span>{post.likeCount} Thích</span>
                      </button>
                      <button 
                        onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="flex items-center space-x-1.5 text-xs text-gray-500 hover:text-blue-600 font-bold transition-colors"
                      >
                        <MessageSquare size={14} />
                        <span>{post.commentCount} Bình luận</span>
                      </button>
                    </div>

                    {/* Comments Area */}
                    {isExpanded && (
                      <div className="p-5 bg-gray-50/30 border-t border-gray-100 space-y-4">
                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                            {post.comments.map((comment: any) => (
                              <div key={comment.id} className="flex items-start space-x-2.5 bg-white p-3 rounded-2xl border border-gray-150/70">
                                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[9px] font-black shrink-0 border border-gray-250 uppercase">
                                  {comment.authorName ? comment.authorName.charAt(0) : 'U'}
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center space-x-1.5 flex-wrap">
                                    <span className="font-bold text-[10px] text-gray-900">{comment.authorName}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                      comment.authorRole === 0 ? 'bg-red-50 text-red-650 border border-red-100' :
                                      comment.authorRole === 1 ? 'bg-amber-50 text-amber-650 border border-amber-100' :
                                      comment.authorRole === 2 ? 'bg-purple-50 text-purple-650 border border-purple-100' :
                                      'bg-blue-50 text-blue-650 border border-blue-100'
                                    }`}>
                                      {comment.authorRole === 0 ? 'Admin' : comment.authorRole === 1 ? 'Staff' : comment.authorRole === 2 ? 'Teacher' : 'Student'}
                                    </span>
                                    <span className="text-[8px] text-gray-400 font-medium">
                                      {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-700 leading-relaxed font-medium">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 italic">Chưa có bình luận nào. Hãy bắt đầu thảo luận!</p>
                        )}

                        {/* Add Comment Input */}
                        <div className="flex items-center space-x-2.5">
                          <input 
                            type="text" 
                            placeholder="Viết bình luận của bạn..." 
                            value={studentCommentInputs[post.id] || ''}
                            onChange={e => setStudentCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleStudentCommentSubmit(post.id);
                            }}
                            className="flex-grow px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                          />
                          <button 
                            onClick={() => handleStudentCommentSubmit(post.id)}
                            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                          >
                            <Send size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 bg-white rounded-3xl border border-gray-150 text-center flex flex-col items-center justify-center space-y-4 shadow-sm max-w-2xl mx-auto">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="font-black text-gray-800 uppercase text-xs">Bảng tin trống</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">Hiện tại chưa có bài viết timeline nào được chia sẻ.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SURVEYS */}
      {activeTab === 'surveys' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center">
              <ClipboardList className="text-blue-600 mr-2" size={20} />
              Khảo sát ý kiến sinh viên
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Ý kiến của bạn giúp chúng tôi nâng cấp hệ thống dịch vụ phòng thực hành tốt hơn.
            </p>
          </div>

          {surveysLoading ? (
            <div className="py-12 text-center text-gray-400 italic text-xs">Đang tải các cuộc khảo sát...</div>
          ) : activeSurveys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeSurveys.map((survey) => (
                <div key={survey.id} className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        survey.hasSubmitted 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-150' 
                          : 'bg-blue-50 text-blue-600 border-blue-150'
                      }`}>
                        {survey.hasSubmitted ? 'Đã hoàn thành' : 'Chưa tham gia'}
                      </span>
                      {survey.endsAt && (
                        <span className="text-[9px] text-gray-400 font-bold">
                          Hạn trả lời: {new Date(survey.endsAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-gray-900 text-sm">{survey.title}</h4>
                    {survey.description && (
                      <p className="text-xs text-gray-500 font-medium line-clamp-3 leading-relaxed">{survey.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[9px] text-gray-400 font-black uppercase">
                      {survey.questions ? `${survey.questions.length} Câu hỏi` : '0 Câu hỏi'}
                    </span>
                    {survey.hasSubmitted ? (
                      <span className="text-xs text-emerald-600 font-black flex items-center space-x-1 uppercase tracking-wider">
                        <CheckCircle2 size={12} className="mr-0.5 text-emerald-500" /> Đã gửi phản hồi
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStartQuiz(survey)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all"
                      >
                        Làm khảo sát
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 bg-white rounded-3xl border border-gray-150 text-center flex flex-col items-center justify-center space-y-4 shadow-sm max-w-2xl mx-auto">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                <ClipboardList size={24} />
              </div>
              <div>
                <p className="font-black text-gray-800 uppercase text-xs">Không có cuộc khảo sát nào</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">Hiện không có cuộc khảo sát ý kiến nào đang diễn ra dành cho bạn.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Survey Quiz Wizard Modal */}
      {currentSurveyForQuiz && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 border border-gray-100 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 mb-4">
              <div>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block font-bold">Khảo sát ý kiến</span>
                <h3 className="text-sm font-black text-gray-950 uppercase mt-0.5">{currentSurveyForQuiz.title}</h3>
              </div>
              <button 
                onClick={() => setCurrentSurveyForQuiz(null)}
                className="text-gray-400 hover:text-gray-650 p-1 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {currentSurveyForQuiz.description && (
              <p className="text-xs text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium leading-relaxed">{currentSurveyForQuiz.description}</p>
            )}

            <form onSubmit={handleQuizSubmit} className="space-y-6 text-xs">
              {currentSurveyForQuiz.questions.map((q: any, index: number) => (
                <div key={q.id} className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-150">
                  <h4 className="font-bold text-gray-900 leading-snug">
                    {index + 1}. {q.questionText} {q.isRequired && <span className="text-red-500">*</span>}
                  </h4>

                  {/* Render based on question type */}
                  {q.questionType === 'text' ? (
                    <textarea
                      rows={3}
                      required={q.isRequired}
                      value={quizAnswers[q.id] || ''}
                      onChange={e => handleQuizAnswerChange(q.id, e.target.value)}
                      placeholder="Nhập câu trả lời tự luận của bạn ở đây..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-250 rounded-xl outline-none focus:border-blue-500 resize-none font-medium text-xs"
                    />
                  ) : q.questionType === 'checkbox' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                      {q.options.map((opt: string) => {
                        const isChecked = (quizAnswers[q.id] || []).includes(opt);
                        return (
                          <label key={opt} className="flex items-center space-x-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const currentList = quizAnswers[q.id] || [];
                                let newList;
                                if (currentList.includes(opt)) {
                                  newList = currentList.filter((item: string) => item !== opt);
                                } else {
                                  newList = [...currentList, opt];
                                }
                                handleQuizAnswerChange(q.id, newList);
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="font-bold text-gray-700">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    // radio options
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                      {q.options.map((opt: string) => {
                        const isChecked = quizAnswers[q.id] === opt;
                        return (
                          <label key={opt} className="flex items-center space-x-2.5 cursor-pointer select-none">
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              checked={isChecked}
                              onChange={() => handleQuizAnswerChange(q.id, opt)}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="font-bold text-gray-700">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setCurrentSurveyForQuiz(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-all uppercase tracking-wider text-[9px]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all uppercase tracking-wider text-[9px] shadow-md active:scale-95"
                >
                  Nộp khảo sát
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Hash View Modal */}
      {selectedHash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-5">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
                <ShieldCheck size={24} className="text-green-500" />
              </div>
              <div>
                <h3 className="font-black text-gray-950 uppercase text-xs tracking-wider">Chữ ký số giao dịch Blockchain</h3>
                <p className="text-[10px] text-gray-400 mt-1">Chuỗi băm SHA-256 mã hóa không thể sửa đổi được tạo tự động khi bàn giao.</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl font-mono text-[10px] text-gray-600 break-all border border-gray-100 select-all leading-normal">
                {selectedHash}
              </div>

              <div className="flex items-center justify-center space-x-2 text-[9px] text-green-600 font-bold uppercase">
                <CheckCircle2 size={12} />
                <span>Trạng thái: Toàn vẹn chuỗi liên kết</span>
              </div>

              <button 
                onClick={() => setSelectedHash(null)}
                className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Đóng tra cứu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Report Failure Modal */}
      {isReportModalOpen && selectedAssetForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-250 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50/30">
              <h2 className="text-sm font-black text-red-750 flex items-center uppercase tracking-wide">
                <AlertTriangle size={16} className="mr-2 text-red-650" /> Báo cáo thiết bị hỏng hóc
              </h2>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-xl hover:bg-red-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmittingFailure} className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Thiết bị báo cáo</p>
                  <p className="font-bold text-gray-900 text-sm mt-1">{selectedAssetForReport.assetName}</p>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5 uppercase tracking-wider">{selectedAssetForReport.serialNumber} • {selectedAssetForReport.type}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Người báo cáo</label>
                    <input type="text" disabled value={user?.fullName || ''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Mức độ khẩn cấp</label>
                    <select 
                      className="w-full px-4 py-3 bg-white border border-gray-250 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                      value={reportUrgency} 
                      onChange={e => setReportUrgency(e.target.value)}
                    >
                      <option value="Low">Thấp (Low)</option>
                      <option value="Medium">Trung bình (Medium)</option>
                      <option value="High">Cao (High)</option>
                      <option value="Critical">Khẩn cấp (Critical)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Mô tả chi tiết sự cố <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={4} 
                    required 
                    value={reportDescription} 
                    onChange={e => setReportDescription(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-gray-250 rounded-2xl text-xs outline-none focus:border-red-500 transition-all resize-none" 
                    placeholder="Vui lòng mô tả chi tiết tình trạng lỗi (Ví dụ: màn hình không lên nguồn, sọc ngang màn hình...)" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsReportModalOpen(false)} 
                  className="px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:bg-gray-50 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-5 rounded-2xl flex items-center uppercase text-[10px] tracking-wider shadow-md transition-all active:scale-[0.98]"
                >
                  <Check size={14} className="mr-1.5" /> Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Center Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[580px] border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Left Sidebar */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-8">
                  <div className="bg-blue-600 p-2 rounded-xl text-white">
                    <Info size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 leading-tight">HỖ TRỢ SINH VIÊN</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">NeoBoard Helpdesk</p>
                  </div>
                </div>
                
                <nav className="space-y-1">
                  {[
                    { id: 'regulations', label: 'Quy chế đền bù', icon: FileText },
                    { id: 'schedule', label: 'Lịch làm việc', icon: Calendar },
                    { id: 'hotline', label: 'Hotline liên hệ', icon: Phone },
                    { id: 'feedback', label: 'Góp ý dịch vụ', icon: MessageSquare }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = activeSupportTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSupportTab(tab.id as any)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                            : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-800'
                        }`}
                      >
                        <IconComponent size={15} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              
              <div className="text-[10px] text-gray-400 font-medium pt-4 border-t border-gray-100">
                Phiên bản hỗ trợ v2.1 <br/>© 2026 NeoBoard
              </div>
            </div>
            
            {/* Right Content Panel */}
            <div className="flex-grow flex flex-col h-full bg-white">
              {/* Header */}
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                  {activeSupportTab === 'regulations' && '📄 QUY CHẾ ĐỀN BÙ MẤT & HƯ HỎNG THIẾT BỊ'}
                  {activeSupportTab === 'schedule' && '📅 LỊCH LÀM VIỆC CỦA PHÒNG THIẾT BỊ'}
                  {activeSupportTab === 'hotline' && '☎️ HOTLINE HỖ TRỢ KỸ THUẬT & KHẨN CẤP'}
                  {activeSupportTab === 'feedback' && '💬 GÓP Ý CHẤT LƯỢNG DỊCH VỤ & THIẾT BỊ'}
                </h4>
                <button 
                  onClick={() => setIsSupportModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Main Tab Content */}
              <div className="p-8 flex-grow overflow-y-auto">
                {activeSupportTab === 'regulations' && (
                  <div className="space-y-5 text-xs text-gray-600 leading-relaxed">
                    <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex gap-3">
                      <AlertTriangle className="text-red-500 flex-shrink-0" size={18} />
                      <div>
                        <h5 className="font-bold text-red-900 mb-0.5">Lưu ý quan trọng đối với sinh viên</h5>
                        <p className="text-[11px] text-red-700 font-medium">Tất cả các tài sản mượn từ phòng máy đều thuộc quyền sở hữu của nhà trường. Mọi hành vi tự ý đem ra ngoài trường không khai báo hoặc cố ý phá hoại sẽ bị xử lý nghiêm theo quy định kỷ luật.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h6 className="font-black text-gray-800 uppercase text-[10px] tracking-wider mb-2">1. Quy định đền bù do làm MẤT thiết bị</h6>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Mua đền bù thiết bị mới có cùng model, cấu hình và hãng sản xuất hoặc có thông số kỹ thuật tương đương trở lên.</li>
                          <li>Trong trường hợp không tìm mua được sản phẩm tương đương trên thị trường, sinh viên sẽ đền bù bằng tiền mặt trị giá 100% giá trị gốc của thiết bị tại thời điểm mua của nhà trường.</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h6 className="font-black text-gray-800 uppercase text-[10px] tracking-wider mb-2">2. Quy định đền bù do làm HỎNG thiết bị</h6>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Nếu thiết bị có thể sửa chữa được: Sinh viên chịu toàn bộ chi phí sửa chữa, thay thế linh kiện chính hãng tại trung tâm dịch vụ ủy quyền.</li>
                          <li>Nếu thiết bị bị hỏng hoàn toàn (không sửa được): Áp dụng quy chế đền bù tương đương như trường hợp làm mất thiết bị.</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h6 className="font-black text-gray-800 uppercase text-[10px] tracking-wider mb-2">3. Các trường hợp miễn trừ đền bù</h6>
                        <p className="pl-4">
                          Sinh viên được miễn trách nhiệm đền bù nếu thiết bị gặp sự cố hao mòn tự nhiên (hết tuổi thọ linh kiện, lỗi phần sụn...) và được kỹ thuật viên hoặc thủ kho xác nhận kiểm thử trước đó.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeSupportTab === 'schedule' && (
                  <div className="space-y-6">
                    <p className="text-xs text-gray-500">Phòng quản lý thiết bị và bàn giao công cụ thực hành mở cửa phục vụ sinh viên mượn/trả trong khung giờ hành chính cố định.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-150">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Thứ Hai - Thứ Sáu</span>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-gray-800">Sáng: 07:30 - 11:30</p>
                          <p className="text-sm font-black text-gray-800">Chiều: 13:00 - 17:00</p>
                        </div>
                        <span className="text-[9px] text-blue-600 font-bold block mt-3">Mở cửa bình thường</span>
                      </div>
                      
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-150">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Thứ Bảy</span>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-gray-800">Sáng: 08:00 - 11:30</p>
                          <p className="text-sm text-gray-400 font-bold">Chiều: Nghỉ</p>
                        </div>
                        <span className="text-[9px] text-amber-600 font-bold block mt-3">Chỉ xử lý trả thiết bị</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
                      <p className="flex items-start gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                        <span><strong>Địa điểm:</strong> Phòng D301 – Tòa nhà D (Phòng kho & Quản lý thiết bị khoa CNTT).</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                        <span><strong>Quy tắc trả đồ:</strong> Sinh viên vui lòng đem trả thiết bị trước giờ đóng cửa <strong>tối thiểu 15 phút</strong> để kiểm kho đầy đủ số lượng và chất lượng linh kiện, tránh ùn tắc tại quầy dịch vụ.</span>
                      </p>
                    </div>
                  </div>
                )}
                
                {activeSupportTab === 'hotline' && (
                  <div className="space-y-6">
                    <p className="text-xs text-gray-500">Trong trường hợp khẩn cấp khi sử dụng thiết bị (cháy nổ, rò điện, hỏng hóc nghiêm trọng ảnh hưởng buổi học...), xin vui lòng liên hệ ngay:</p>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                            <Phone size={18} />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-gray-800 leading-tight">Đường dây nóng phòng quản lý</h5>
                            <p className="text-[10px] text-gray-400 font-medium">Giờ hành chính (Thứ 2 - Thứ 7)</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-blue-600 hover:underline cursor-pointer">028.7300.2245 (Nhánh 103)</span>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2.5 rounded-xl text-green-600">
                            <Phone size={18} />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-gray-800 leading-tight">Thầy Nguyễn Văn Nhân Viên (Zalo/SĐT)</h5>
                            <p className="text-[10px] text-gray-400 font-medium">Phụ trách kỹ thuật & bảo trì</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-green-600 hover:underline cursor-pointer">0987.654.321</span>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-red-100 p-2.5 rounded-xl text-red-600">
                            <Info size={18} />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-gray-800 leading-tight">Hộp thư hỗ trợ qua Email</h5>
                            <p className="text-[10px] text-gray-400 font-medium">Tiếp nhận phản hồi kỹ thuật</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-red-600 hover:underline cursor-pointer">support-equipment@neoboard.edu.vn</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeSupportTab === 'feedback' && (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Mức độ hài lòng</label>
                      <div className="flex items-center space-x-2 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className={`p-1.5 transition-all ${
                              star <= feedbackRating ? 'text-amber-500 scale-110' : 'text-gray-250 hover:text-amber-300'
                            }`}
                          >
                            <Star size={24} fill={star <= feedbackRating ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                        <span className="text-xs text-gray-400 font-bold ml-2">
                          {feedbackRating === 5 && '😍 Rất hài lòng'}
                          {feedbackRating === 4 && '😀 Hài lòng'}
                          {feedbackRating === 3 && '😐 Bình thường'}
                          {feedbackRating === 2 && '🙁 Không hài lòng'}
                          {feedbackRating === 1 && '😡 Rất thất vọng'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Phân loại góp ý</label>
                        <select 
                          className="w-full px-4 py-3 bg-white border border-gray-250 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                          value={feedbackCategory} 
                          onChange={e => setFeedbackCategory(e.target.value)}
                        >
                          <option value="Chất lượng thiết bị">Chất lượng thiết bị</option>
                          <option value="Thái độ phục vụ">Thái độ phục vụ của thủ kho</option>
                          <option value="Quy trình mượn trả">Quy trình bàn giao & nhận trả</option>
                          <option value="Ứng dụng NeoBoard">Trải nghiệm ứng dụng NeoBoard</option>
                          <option value="Khác">Góp ý khác</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Ý kiến chi tiết <span className="text-red-500">*</span></label>
                      <textarea 
                        rows={4} 
                        required 
                        value={feedbackComment} 
                        onChange={e => setFeedbackComment(e.target.value)} 
                        className="w-full px-4 py-3 bg-white border border-gray-250 rounded-2xl text-xs outline-none focus:border-blue-500 transition-all resize-none" 
                        placeholder="Hãy chia sẻ trải nghiệm thực tế hoặc ý kiến đóng góp của bạn để chúng tôi phục vụ tốt hơn..." 
                      />
                    </div>
                    
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button 
                        type="button" 
                        onClick={() => setIsSupportModalOpen(false)} 
                        className="px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:bg-gray-50 rounded-xl transition-all"
                      >
                        Đóng
                      </button>
                      <button 
                        type="submit" 
                        disabled={feedbackSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 px-5 rounded-2xl flex items-center uppercase text-[10px] tracking-wider shadow-md transition-all active:scale-[0.98]"
                      >
                        {feedbackSubmitting ? (
                          <>
                            <RefreshCw size={14} className="mr-1.5 animate-spin" /> Đang gửi...
                          </>
                        ) : (
                          <>
                            <Check size={14} className="mr-1.5" /> Gửi góp ý
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;

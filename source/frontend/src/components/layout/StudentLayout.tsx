import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { signalRService } from '@/lib/signalrService';
import { useToastStore, ToastContainer } from '@/components/ToastNotification';
import { useNotificationStore } from '@/stores/notificationStore';
import { 
  User, 
  LogOut, 
  Bell, 
  LayoutDashboard, 
  Package, 
  Calendar, 
  ShieldAlert,
  ChevronDown,
  Monitor,
  Search,
  Menu,
  X
} from 'lucide-react';

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { notifications, markAllAsRead, markAsRead, clearAll } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [showNoti, setShowNoti] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Start SignalR connection for the logged-in student/teacher
  useEffect(() => {
    if (user && user.id) {
      signalRService.startConnection(user.role, user.id);

      const unsubscribeStatusChanged = signalRService.subscribe('ReceiveRequestStatusChanged', (data) => {
        const title = data.status === 'Approved' ? '🎉 YÊU CẦU ĐƯỢC DUYỆT' : '❌ YÊU CẦU BỊ TỪ CHỐI';
        const msg = data.message || `Đơn mượn của bạn đã thay đổi trạng thái thành: ${data.status}`;

        useToastStore.getState().addToast({
          title,
          message: msg,
          type: data.status === 'Approved' ? 'success' : 'error'
        });

        useNotificationStore.getState().addNotification({
          title,
          message: msg,
          type: data.status === 'Approved' ? 'success' : 'error',
          route: '/student/portal'
        });
      });

      const unsubscribeReturnConfirm = signalRService.subscribe('ReceiveReturnConfirmation', (data) => {
        const title = '✅ ĐÃ TRẢ THIẾT BỊ';
        const msg = data.message || `Đã ghi nhận trả thành công thiết bị [${data.itemName}]`;

        useToastStore.getState().addToast({
          title,
          message: msg,
          type: 'success'
        });

        useNotificationStore.getState().addNotification({
          title,
          message: msg,
          type: 'success',
          route: '/student/portal'
        });
      });

      const unsubscribeAnnouncement = signalRService.subscribe('ReceiveAnnouncement', (data) => {
        const title = data.priority === 2 ? '🚨 THÔNG BÁO KHẨN CẤP' : data.priority === 1 ? '⚠️ THÔNG BÁO QUAN TRỌNG' : '📢 THÔNG BÁO MỚI';
        const msg = `[${data.authorName}]: ${data.title}`;

        useToastStore.getState().addToast({
          title,
          message: msg,
          type: data.priority === 2 ? 'error' : data.priority === 1 ? 'warning' : 'info'
        });

        useNotificationStore.getState().addNotification({
          title,
          message: msg,
          type: data.priority === 2 ? 'error' : data.priority === 1 ? 'warning' : 'info',
          route: '/student/portal'
        });
      });

      const unsubscribeTimelinePost = signalRService.subscribe('ReceiveTimelinePost', (data) => {
        const title = '📢 BẢNG TIN NEOBOARD';
        const content = data.content || '';
        const msg = `${data.authorName} vừa đăng một bài viết mới: "${content.length > 60 ? content.substring(0, 60) + '...' : content}"`;

        useToastStore.getState().addToast({
          title,
          message: msg,
          type: 'info'
        });

        useNotificationStore.getState().addNotification({
          title,
          message: msg,
          type: 'info',
          route: '/student/portal'
        });
      });

      const unsubscribeNewSurvey = signalRService.subscribe('ReceiveNewSurvey', (data) => {
        const title = '📋 KHẢO SÁT Ý KIẾN MỚI';
        const msg = `Khảo sát: "${data.title}"`;

        useToastStore.getState().addToast({
          title,
          message: msg,
          type: 'success'
        });

        useNotificationStore.getState().addNotification({
          title,
          message: msg,
          type: 'success',
          route: '/student/portal'
        });
      });

      return () => {
        unsubscribeStatusChanged();
        unsubscribeReturnConfirm();
        unsubscribeAnnouncement();
        unsubscribeTimelinePost();
        unsubscribeNewSurvey();
        signalRService.stopConnection();
      };
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNoti(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { text: "Bàn làm việc", path: "/student/portal", icon: <LayoutDashboard size={18} /> },
    { text: "Đăng ký mượn mới", path: "/student/assets", icon: <Calendar size={18} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Navigation Bar - Horizontal like a Website */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            
            {/* Logo & Main Nav */}
            <div className="flex items-center space-x-10">
              <Link to="/student/portal" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-[#0066cc] rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                  <span className="text-white font-black text-xl">N</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-lg tracking-tighter text-gray-900 leading-none">NeoBoard</span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Student Portal</span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {link.icon}
                    <span>{link.text}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Right Side Tools */}
            <div className="flex items-center space-x-4">
              {/* Search Bar - Modern Style */}
              <div className="hidden lg:flex items-center relative group">
                <Search size={16} className="absolute left-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Tìm thiết bị..." 
                  className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-2xl text-sm w-48 focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:w-64 transition-all outline-none"
                />
              </div>

              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => {
                    setShowNoti(!showNoti);
                    if (!showNoti) markAllAsRead();
                  }}
                  className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-full relative transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {showNoti && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hộp thư thông báo</span>
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="text-[10px] text-red-500 hover:underline font-bold">
                          Xóa tất cả
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-gray-400 font-medium">
                          Không có thông báo mới nào
                        </div>
                      ) : (
                        notifications.map((noti) => (
                           <div 
                            key={noti.id} 
                            className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors flex gap-2 cursor-pointer ${
                              !noti.read ? 'bg-blue-50/30' : ''
                            }`}
                            onClick={() => {
                              markAsRead(noti.id);
                              if (noti.route) {
                                navigate(noti.route);
                                setShowNoti(false);
                              }
                            }}
                          >
                            <div className="flex-grow">
                              <p className="text-[11px] font-bold text-gray-800 leading-tight mb-0.5">{noti.title}</p>
                              <p className="text-[10px] text-gray-500 leading-snug font-medium">{noti.message}</p>
                              <span className="text-[9px] text-gray-300 font-bold mt-1 block">{noti.time}</span>
                            </div>
                            {!noti.read && (
                              <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-gray-100 mx-2"></div>

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-3 p-1 rounded-full hover:bg-gray-50 transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-black shadow-md border-2 border-white">
                    {user?.fullName?.charAt(0) || 'S'}
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 py-4 border-b border-gray-50">
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Đang đăng nhập</p>
                      <p className="text-sm font-black text-gray-900 truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-2">
                      {/* Back to Admin Feature for Admins visiting Student Portal */}
                      {(user?.role === 0 || user?.role === 1) && (
                        <button 
                          onClick={() => navigate('/')}
                          className="w-full flex items-center px-5 py-3 text-sm font-black text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-colors"
                        >
                          <ShieldAlert size={18} className="mr-3" /> Quay lại Quản trị
                        </button>
                      )}
                      
                      <button className="w-full flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={18} className="mr-3 text-gray-400" /> Thông tin cá nhân
                      </button>
                    </div>

                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} className="mr-3" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button className="md:hidden p-2 text-gray-500" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 p-4 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => `block px-4 py-3 rounded-xl text-sm font-bold ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {link.icon}
                  <span>{link.text}</span>
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content with Container for better look as a Website */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb or Breadcrumbs can go here */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>

      {/* Modern Footer for Student Portal */}
      <footer className="bg-white border-t border-gray-100 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm font-medium">© 2026 NeoBoard EDU-AMS. Tất cả quyền được bảo lưu.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">Hỗ trợ kỹ thuật</a>
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">Quy định mượn trả</a>
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
};

export default StudentLayout;

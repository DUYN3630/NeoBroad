import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/axios';
import { signalRService } from '@/lib/signalrService';
import { useToastStore, ToastContainer } from '@/components/ToastNotification';
import { useNotificationStore } from '@/stores/notificationStore';
import { 
  Home, 
  Database, 
  ClipboardList, 
  ClipboardCheck, 
  Shield, 
  BarChart, 
  LogOut, 
  ChevronDown,
  User,
  Menu,
  Bell,
  Search,
  X,
  AlertCircle,
  Briefcase,
  Layers,
  Eye,
  UserCircle,
  Settings
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  path?: string;
  subItems?: { text: string; path: string; roles?: number[] }[];
  isOpen?: boolean;
  onToggle?: () => void;
}

const SidebarItem = ({ icon, text, path, subItems, isOpen, onToggle }: SidebarItemProps) => {
  const location = useLocation();
  const isActive = path ? location.pathname === path : subItems?.some(s => location.pathname === s.path);

  return (
    <div className="mb-1">
      {path ? (
        <NavLink 
          to={path}
          className={({ isActive }) => `flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 rounded-xl mx-2 ${
            isActive 
              ? 'bg-[#0066cc] text-white shadow-lg shadow-blue-100' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className={isActive ? 'text-white' : 'text-gray-400'}>{icon}</span>
            <span className="text-[13px] font-bold">{text}</span>
          </div>
        </NavLink>
      ) : (
        <div 
          onClick={onToggle}
          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 rounded-xl mx-2 ${
            isActive && !isOpen
              ? 'bg-blue-50 text-[#0066cc]' 
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className={isActive && !isOpen ? 'text-[#0066cc]' : 'text-gray-400'}>{icon}</span>
            <span className="text-[13px] font-bold">{text}</span>
          </div>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      )}
      
      {subItems && isOpen && (
        <div className="mt-1 ml-6 border-l-2 border-blue-50 pl-4 space-y-1 animate-in slide-in-from-left-2 duration-300">
          {subItems.map((sub, idx) => (
            <NavLink 
              key={`${text}-sub-${idx}`} 
              to={sub.path}
              className={({ isActive }) => `block py-2 text-[12px] transition-colors ${
                isActive ? 'text-[#0066cc] font-black' : 'text-gray-400 hover:text-[#0066cc] font-medium'
              }`}
            >
              {sub.text}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const { notifications, markAllAsRead, markAsRead, clearAll } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [showNoti, setShowNoti] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Start SignalR connection for the logged-in admin/staff
  useEffect(() => {
    if (user && user.id) {
      signalRService.startConnection(user.role, user.id);

      const unsubscribeNewRequest = signalRService.subscribe('ReceiveNewRequest', (data) => {
        const title = data.isLargeRequest ? '⚠️ ĐĂNG KÝ SỐ LƯỢNG LỚN' : '📬 Yêu cầu mượn mới';
        const msg = `${data.studentName} (${data.studentCode}) đã đăng ký mượn: ${data.assetNames}`;

        useToastStore.getState().addToast({
          title,
          message: msg,
          type: data.isLargeRequest ? 'warning' : 'info'
        });

        useNotificationStore.getState().addNotification({
          title,
          message: msg,
          type: data.isLargeRequest ? 'warning' : 'info',
          route: '/assets/requests'
        });
      });

      const unsubscribeFailureReport = signalRService.subscribe('ReceiveFailureReport', (data) => {
        const title = '🚨 BÁO HỎNG THIẾT BỊ';
        const msg = `Thiết bị [${data.assetName}] được báo hỏng bởi ${data.reportedBy}. Lý do: ${data.description}`;

        useToastStore.getState().addToast({
          title,
          message: msg,
          type: 'error'
        });

        useNotificationStore.getState().addNotification({
          title,
          message: msg,
          type: 'error',
          route: '/maintenance/failures'
        });
      });

      const unsubscribeMaintenance = signalRService.subscribe('ReceiveMaintenanceAssignment', (data) => {
        const title = '🛠️ PHÂN CÔNG BẢO TRÌ';
        const msg = data.message || `Bạn được phân công sửa chữa thiết bị [${data.assetName}]`;

        useToastStore.getState().addToast({
          title,
          message: msg,
          type: 'info'
        });

        useNotificationStore.getState().addNotification({
          title,
          message: msg,
          type: 'info',
          route: '/my-tasks'
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
          route: '/timeline' // When clicked, routes to timeline
        });
      });

      const unsubscribeTimelinePost = signalRService.subscribe('ReceiveTimelinePost', (data) => {
        const title = '📢 BẢNG TIN NEOBOARD';
        const msg = `${data.authorName} vừa đăng một bài viết mới: "${data.content.length > 60 ? data.content.substring(0, 60) + '...' : data.content}"`;

        useToastStore.getState().addToast({
          title,
          message: msg,
          type: 'info'
        });

        useNotificationStore.getState().addNotification({
          title,
          message: msg,
          type: 'info',
          route: '/timeline'
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
          route: '/surveys'
        });
      });

      const unsubscribeBruteForceAlert = signalRService.subscribe('ReceiveBruteForceAlert', (data) => {
        const title = '⚠️ CẢNH BÁO TẤN CÔNG BRUTE-FORCE';
        const msg = `Hành vi đăng nhập thất bại liên tiếp (${data.attempts} lần) từ Email/SĐT: ${data.email} | IP: ${data.ipAddress}`;

        useToastStore.getState().addToast({
          title,
          message: msg,
          type: 'error'
        });

        useNotificationStore.getState().addNotification({
          title,
          message: msg,
          type: 'error',
          route: '/admin/access'
        });
      });

      return () => {
        unsubscribeNewRequest();
        unsubscribeFailureReport();
        unsubscribeMaintenance();
        unsubscribeAnnouncement();
        unsubscribeTimelinePost();
        unsubscribeNewSurvey();
        unsubscribeBruteForceAlert();
        signalRService.stopConnection();
      };
    }
  }, [user?.id, user?.role]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNoti(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { text: "Dashboard", icon: <Home size={18} />, path: "/" },
    { 
      text: "NeoBoard - Truyền thông", 
      icon: <Layers size={18} />, 
      roles: [0, 1],
      subItems: [
        { text: "Bảng tin Timeline", path: "/timeline" },
        { text: "Thông báo công ty", path: "/announcements" },
        { text: "Khảo sát ý kiến", path: "/surveys" }
      ] 
    },
    { 
      text: "AMS - Quản lý thiết bị", 
      icon: <Database size={18} />, 
      roles: [0, 1],
      subItems: [
        { text: "Danh sách thiết bị", path: "/assets" },
        { text: "Quản lý Toolset", path: "/toolsets" },
        { text: "Duyệt yêu cầu mượn", path: "/assets/requests", roles: [0] },
        { text: "Quầy giao dịch (Phát đồ)", path: "/assets/counter" },
        { text: "Sức khỏe thiết bị", path: "/assets/health" },
        { text: "Lịch bảo trì định kỳ", path: "/maintenance/schedule", roles: [0] }
      ] 
    },
    { 
      text: "AMS - Phiếu bảo trì", 
      icon: <ClipboardList size={18} />, 
      roles: [0, 1],
      subItems: [
        { text: "Phiếu bảo trì (Maintenance)", path: "/maintenance/tickets" },
        { text: "Phiếu báo hỏng (Failure)", path: "/maintenance/failures" },
        { text: "Phiếu sửa chữa (Repair)", path: "/maintenance/repairs" }
      ] 
    },
    { 
      text: "AMS - Phân công công việc", 
      icon: <ClipboardCheck size={18} />, 
      roles: [0, 1],
      subItems: [
        { text: "Nhiệm vụ của tôi", path: "/my-tasks" },
        { text: "Tạo công việc mới", path: "/tasks/create", roles: [0] },
        { text: "Theo dõi tiến độ", path: "/tasks/progress", roles: [0] }
      ] 
    },
    { 
      text: "Hệ thống & Quyền hạn", 
      icon: <Shield size={18} />, 
      roles: [0],
      subItems: [
        { text: "Quản lý người dùng", path: "/admin/users" },
        { text: "Vai trò & Phân quyền", path: "/admin/roles" },
        { text: "Nhật ký hoạt động", path: "/admin/access" },
        { text: "Blockchain Auditor", path: "/admin/blockchain" }
      ] 
    },
    { 
      text: "Báo cáo & Thống kê", 
      icon: <BarChart size={18} />, 
      roles: [0, 1],
      subItems: [
        { text: "Báo cáo thiết bị", path: "/reports/assets" },
        { text: "Báo cáo bảo trì", path: "/reports/maintenance" },
        { text: "Báo cáo công việc", path: "/reports/tasks" }
      ] 
    },
  ];

  const filteredMenuItems = menuItems
    .filter(item => !item.roles || item.roles.includes(user?.role ?? -1))
    .map(item => ({
      ...item,
      subItems: item.subItems?.filter(sub => !sub.roles || sub.roles.includes(user?.role ?? -1))
    }));

  const getRoleName = (role: number | undefined) => {
    switch(role) {
      case 0: return 'Super Admin';
      case 1: return 'Staff / IT';
      case 2: return 'Teacher';
      case 3: return 'Student';
      default: return 'Guest';
    }
  };

  useEffect(() => {
    const activeMenu = filteredMenuItems.find(item => 
      item.subItems?.some(sub => location.pathname === sub.path)
    );
    if (activeMenu && !openMenus.includes(activeMenu.text)) {
      setOpenMenus(prev => [...prev, activeMenu.text]);
    }
  }, [location.pathname]);

  const toggleMenu = (text: string) => {
    setOpenMenus(prev => 
      prev.includes(text) ? prev.filter(t => t !== text) : [...prev, text]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f4f7fa]">
      {!isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(true)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-200 flex flex-col shadow-sm transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-[#0066cc]">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-[#0066cc] font-bold text-xl">N</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white uppercase">NeoBoard SaaS</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/70 p-1 hover:bg-white/10 rounded-md"><X size={20} /></button>
        </div>

        <div className="flex-grow overflow-y-auto py-6 scrollbar-hide">
          {filteredMenuItems.map((item, idx) => (
            <SidebarItem 
              key={`menu-item-${idx}`}
              {...item}
              isOpen={openMenus.includes(item.text)}
              onToggle={() => toggleMenu(item.text)}
            />
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
           <div className="p-3 bg-white rounded-xl border border-gray-100 text-center shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">NeoBoard EDU-AMS</p>
              <p className="text-[9px] text-gray-300">Version 2.0.26 Beta</p>
           </div>
        </div>
      </aside>

      {/* Header & Content */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-20">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
                <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="text" placeholder="Tìm kiếm tài sản, nghiệp vụ..." className="pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm w-72 focus:ring-2 focus:ring-[#0066cc]/10 focus:bg-white focus:border-gray-200 transition-all outline-none" />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="relative" ref={notificationRef}>
              <div 
                className="relative cursor-pointer text-gray-400 hover:text-[#0066cc] transition-all p-2.5 hover:bg-gray-50 rounded-full" 
                onClick={() => {
                  setShowNoti(!showNoti);
                  if (!showNoti) markAllAsRead();
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border border-white">
                    {unreadCount}
                  </span>
                )}
              </div>

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
            
            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
               <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 p-1.5 pr-3 hover:bg-gray-50 rounded-full transition-all border border-transparent hover:border-gray-100"
               >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0066cc] to-blue-400 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-100">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                     <p className="text-[13px] font-black leading-tight text-gray-700">{user?.fullName}</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{getRoleName(user?.role)}</p>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
               </button>

               {/* Dropdown Menu */}
               {isUserMenuOpen && (
                 <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Tài khoản truy cập</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <button 
                        onClick={() => { navigate('/profile'); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <User size={16} className="mr-3 opacity-60" /> Hồ sơ cá nhân
                      </button>

                      {/* Switch Portal Feature for Admin/Staff */}
                      {(user?.role === 0 || user?.role === 1) && (
                        <button 
                          onClick={() => { navigate('/student/portal'); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center px-4 py-2.5 text-sm font-black text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-colors"
                        >
                          <Eye size={16} className="mr-3" /> Xem Portal Sinh viên
                        </button>
                      )}

                      <button 
                        className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 transition-colors"
                      >
                        <Settings size={16} className="mr-3 opacity-60" /> Cài đặt hệ thống
                      </button>
                    </div>

                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} className="mr-3" /> Đăng xuất
                      </button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLayout;

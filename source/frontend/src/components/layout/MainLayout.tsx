import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/axios';
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
  History,
  Lock,
  FileText,
  PieChart,
  CalendarDays
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  path?: string;
  subItems?: { text: string; path: string }[];
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
          className={({ isActive }) => `flex items-center justify-between px-4 py-2.5 cursor-pointer transition-all duration-200 rounded-md mx-2 ${
            isActive 
              ? 'bg-[#0066cc] text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className={isActive ? 'text-white' : 'text-gray-500'}>{icon}</span>
            <span className="text-[13px] font-bold">{text}</span>
          </div>
        </NavLink>
      ) : (
        <div 
          onClick={onToggle}
          className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-all duration-200 rounded-md mx-2 ${
            isActive && !isOpen
              ? 'bg-[#0066cc]/10 text-[#0066cc]' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className={isActive && !isOpen ? 'text-[#0066cc]' : 'text-gray-500'}>{icon}</span>
            <span className="text-[13px] font-bold">{text}</span>
          </div>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      )}
      
      {subItems && isOpen && (
        <div className="mt-1 ml-4 border-l-2 border-blue-50 pl-4 space-y-1">
          {subItems.map((sub, idx) => (
            <NavLink 
              key={`${text}-sub-${idx}`} 
              to={sub.path}
              className={({ isActive }) => `block py-2 text-[12px] transition-colors ${
                isActive ? 'text-[#0066cc] font-black' : 'text-gray-500 hover:text-[#0066cc] font-medium'
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

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNoti, setShowNoti] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { text: "Dashboard", icon: <Home size={18} />, path: "/" },
    { 
      text: "NeoBoard - Truyền thông", 
      icon: <Layers size={18} />, 
      subItems: [
        { text: "Bảng tin Timeline", path: "/timeline" },
        { text: "Thông báo công ty", path: "/announcements" },
        { text: "Khảo sát ý kiến", path: "/surveys" }
      ] 
    },
    { 
      text: "AMS - Quản lý thiết bị", 
      icon: <Database size={18} />, 
      subItems: [
        { text: "Danh sách thiết bị", path: "/assets" },
        { text: "Quản lý Toolset", path: "/toolsets" },
        { text: "Lịch bảo trì định kỳ", path: "/maintenance/schedule" }
      ] 
    },
    { 
      text: "AMS - Phiếu bảo trì", 
      icon: <ClipboardList size={18} />, 
      subItems: [
        { text: "Phiếu bảo trì (Maintenance)", path: "/maintenance/tickets" },
        { text: "Phiếu báo hỏng (Failure)", path: "/maintenance/failures" },
        { text: "Phiếu sửa chữa (Repair)", path: "/maintenance/repairs" }
      ] 
    },
    { 
      text: "AMS - Phân công công việc", 
      icon: <ClipboardCheck size={18} />, 
      subItems: [
        { text: "Tạo công việc mới", path: "/tasks/create" },
        { text: "Theo dõi tiến độ", path: "/tasks/progress" }
      ] 
    },
    { 
      text: "Hệ thống & Quyền hạn", 
      icon: <Shield size={18} />, 
      subItems: [
        { text: "Quản lý người dùng", path: "/admin/users" },
        { text: "Vai trò & Phân quyền", path: "/admin/roles" },
        { text: "Nhật ký hoạt động", path: "/admin/access" }
      ] 
    },
    { 
      text: "Báo cáo & Thống kê", 
      icon: <BarChart size={18} />, 
      subItems: [
        { text: "Báo cáo thiết bị", path: "/reports/assets" },
        { text: "Báo cáo bảo trì", path: "/reports/maintenance" },
        { text: "Báo cáo công việc", path: "/reports/tasks" }
      ] 
    },
  ];

  // Tự động mở menu cha khi đang ở trang con
  useEffect(() => {
    const activeMenu = menuItems.find(item => 
      item.subItems?.some(sub => location.pathname === sub.path)
    );
    if (activeMenu && !openMenus.includes(activeMenu.text)) {
      setOpenMenus(prev => [...prev, activeMenu.text]);
    }
  }, [location.pathname]);

  useEffect(() => {
    apiClient.get('/Notifications').then(res => setNotifications(res.data)).catch(() => {});
  }, []);

  const toggleMenu = (text: string) => {
    setOpenMenus(prev => 
      prev.includes(text) ? prev.filter(t => t !== text) : [...prev, text]
    );
  };

  return (
    <div className="flex h-screen bg-[#f4f7fa]">
      {!isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(true)}></div>
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-200 flex flex-col shadow-sm transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-[#0066cc]">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#0066cc] font-bold text-xl">N</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white uppercase">NeoBoard SaaS</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/70 p-1 hover:bg-white/10 rounded-md"><X size={20} /></button>
        </div>

        <div className="flex-grow overflow-y-auto py-4 scrollbar-hide">
          {menuItems.map((item, idx) => (
            <SidebarItem 
              key={`menu-item-${idx}`}
              {...item}
              isOpen={openMenus.includes(item.text)}
              onToggle={() => toggleMenu(item.text)}
            />
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded-xl transition-all" onClick={() => navigate('/profile')}>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0066cc] font-bold border-2 border-white shadow-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-grow overflow-hidden text-left">
              <p className="text-[13px] font-bold truncate text-gray-700">{user?.fullName || 'Guest'}</p>
              <p className="text-[10px] text-gray-400 truncate uppercase font-bold tracking-tighter">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-grow flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-20">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
                <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="text" placeholder="Tìm kiếm thông minh..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm w-72 focus:ring-2 focus:ring-[#0066cc]/10 focus:bg-white transition-all outline-none" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 lg:space-x-5">
            <div className="relative cursor-pointer text-gray-400 hover:text-[#0066cc] transition-all p-2 hover:bg-gray-50 rounded-full" onClick={() => setShowNoti(!showNoti)}>
              <Bell size={20} />
              {notifications.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white font-black">{notifications.length}</span>}
            </div>
            <div className="h-8 w-px bg-gray-100"></div>
            <div className="flex items-center space-x-3 cursor-pointer group p-1 pr-3 hover:bg-gray-50 rounded-full transition-all" onClick={() => navigate('/profile')}>
               <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-100">{user?.fullName?.charAt(0) || 'U'}</div>
               <div className="text-left hidden sm:block">
                  <p className="text-[13px] font-bold leading-tight text-gray-700 group-hover:text-[#0066cc] transition-colors">{user?.fullName}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Online</p>
               </div>
            </div>
          </div>
        </header>

        {showNoti && (
            <div className="absolute top-16 right-4 lg:right-8 w-72 lg:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <h4 className="font-bold text-sm text-[#1a1a1a]">Thông báo</h4>
                    <button onClick={() => setShowNoti(false)} className="p-1 hover:bg-gray-100 rounded-md"><X size={16} className="text-gray-400" /></button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((n, idx) => (
                        <div key={`noti-${idx}`} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${n.type === 'Alert' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                {n.type === 'Alert' ? <AlertCircle size={16} /> : <Briefcase size={16} />}
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-gray-700 leading-tight">{n.title}</p>
                                <p className="text-[11px] text-gray-500 my-1">{n.message}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{n.time}</p>
                            </div>
                        </div>
                    )) : <div className="p-8 text-center text-gray-400 text-xs italic">Không có thông báo mới</div>}
                </div>
            </div>
        )}

        <main className="flex-grow overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

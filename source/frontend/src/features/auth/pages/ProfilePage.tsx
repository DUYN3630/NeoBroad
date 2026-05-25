import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/stores/authStore';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Bell, 
  LogOut,
  Camera,
  MapPin,
  Phone,
  Info,
  ChevronRight
} from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuthStore();

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Thông tin cá nhân</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý thông tin tài khoản và bảo mật của bạn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: AVATAR & QUICK INFO */}
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center text-[#0066cc] text-4xl font-bold border-4 border-white shadow-md">
                        {user?.fullName.charAt(0)}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-500 hover:text-[#0066cc]">
                        <Camera size={16} />
                    </button>
                </div>
                <h2 className="text-xl font-bold text-[#1a1a1a]">{user?.fullName}</h2>
                <p className="text-gray-400 text-sm mb-6">{user?.email}</p>
                <div className="flex items-center justify-center space-x-2">
                    <span className="px-3 py-1 bg-blue-50 text-[#0066cc] text-[10px] font-bold rounded-full uppercase tracking-wider">Quản trị viên</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-[#1a1a1a] mb-4 flex items-center text-sm">
                    <Info size={16} className="mr-2 text-blue-500" /> Liên hệ nhanh
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <Phone size={14} className="mr-3 text-gray-400" /> 0987.654.321
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={14} className="mr-3 text-gray-400" /> Tòa nhà A, Khu công nghệ cao
                    </div>
                </div>
            </div>
        </div>

        {/* CỘT PHẢI: CHI TIẾT & SETTINGS */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <h3 className="font-bold text-[#1a1a1a]">Thiết lập tài khoản</h3>
                    <button className="text-[#0066cc] text-xs font-bold hover:underline">Chỉnh sửa</button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Họ và tên</label>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <User size={16} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-700">{user?.fullName}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Email công việc</label>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-70">
                            <Mail size={16} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-700">{user?.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-8 space-y-6">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg mr-4">
                                <Key size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-700">Đổi mật khẩu</p>
                                <p className="text-xs text-gray-400">Thay đổi định kỳ để bảo mật tài khoản</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-4">
                                <Bell size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-700">Cấu hình thông báo</p>
                                <p className="text-xs text-gray-400">Nhận email khi có thiết bị hỏng hóc</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500" />
                    </button>

                    <button 
                        onClick={logout}
                        className="w-full flex items-center p-4 hover:bg-red-50 rounded-xl transition-colors group"
                    >
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg mr-4 group-hover:bg-red-100">
                            <LogOut size={18} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-red-600">Đăng xuất</p>
                            <p className="text-xs text-red-400">Thoát khỏi phiên làm việc hiện tại</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;

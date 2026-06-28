import React from 'react';
import { Lock, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

const AccessManagementPage = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý quyền truy cập</h1>
        <p className="text-gray-500 text-sm mt-1">Cấu hình các giao thức bảo mật và kiểm soát truy cập hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center"><Lock size={18} className="mr-2 text-red-500" /> Giao thức bảo mật</h3>
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                        <p className="text-sm font-bold text-gray-700">Xác thực 2 yếu tố (2FA)</p>
                        <p className="text-xs text-gray-400">Yêu cầu mã OTP khi đăng nhập Admin</p>
                    </div>
                    <div className="w-10 h-5 bg-gray-200 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                        <p className="text-sm font-bold text-gray-700">Giới hạn IP truy cập</p>
                        <p className="text-xs text-gray-400">Chỉ cho phép truy cập từ mạng nội bộ</p>
                    </div>
                    <div className="w-10 h-5 bg-blue-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                </div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center"><UserCheck size={18} className="mr-2 text-[#0072C6]" /> Nhật ký truy cập</h3>
            <div className="space-y-4">
                {[
                    { user: 'admin', time: 'Vừa xong', ip: '192.168.1.1', status: 'Thành công' },
                    { user: 'tech_01', time: '10 phút trước', ip: '113.161.x.x', status: 'Thành công' },
                    { user: 'guest_user', time: '1 giờ trước', ip: 'Unknown', status: 'Bị từ chối' },
                ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                        <span className="font-bold text-gray-600">{log.user}</span>
                        <span className="text-gray-400">{log.ip}</span>
                        <span className={log.status === 'Thành công' ? 'text-green-500' : 'text-red-500'}>{log.status}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </>
  );
};

export default AccessManagementPage;

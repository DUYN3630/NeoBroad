import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/axios';
import { AlertCircle } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (user.role === 2 || user.role === 3)) {
        navigate('/student/portal');
        return;
    }
    apiClient.get('/Maintenance/DashboardStats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Hệ thống Quản lý tài sản (AMS)</h1>
        <p className="text-gray-500 text-sm">Trình điều khiển trung tâm dành cho quản trị viên.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Tổng tài sản</h3>
            <p className="text-3xl font-black text-[#1a1a1a]">{loading ? '...' : stats?.totalAssets}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Đang bảo trì</h3>
            <p className="text-3xl font-black text-orange-500">{loading ? '...' : stats?.pendingFailures}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Tỷ lệ hoạt động</h3>
            <p className="text-3xl font-black text-green-500">98%</p>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start space-x-4">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
              <AlertCircle size={24} />
          </div>
          <div>
              <h4 className="font-bold text-blue-900">Mẹo quản trị nhanh</h4>
              <p className="text-blue-700 text-sm mt-1 leading-relaxed">
                  Bạn có thể nhấn vào Avatar góc phải để chuyển sang "Giao diện Sinh viên" nhằm kiểm tra trải nghiệm người dùng cuối mà không cần đăng xuất.
              </p>
          </div>
      </div>
    </>
  );
};

export default DashboardPage;

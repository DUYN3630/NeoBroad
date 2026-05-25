import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import apiClient from '../api/apiClient';
import { AlertCircle } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/Dashboard/Stats');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Không thể tải dữ liệu thống kê.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Người dùng", value: stats?.totalUsers || 0, color: "blue" },
    { label: "Bài đăng", value: stats?.totalPosts || 0, color: "orange" },
    { label: "Thông báo", value: stats?.totalAnnouncements || 0, color: "red" },
    { label: "Khảo sát", value: stats?.totalSurveys || 0, color: "green" },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Tổng quan Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Chào mừng bạn quay trở lại với hệ thống NeoBoard.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center text-sm font-medium">
          <AlertCircle size={18} className="mr-2" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-[13px] font-medium uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold text-[#1a1a1a]">{loading ? "..." : stat.value}</h3>
              <span className={`text-${stat.color}-500 text-xs font-bold`}>Real-time</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h3 className="font-bold text-[#1a1a1a]">Hoạt động gần đây</h3>
          <button className="text-[#0066cc] text-xs font-bold hover:underline">Xem tất cả</button>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 uppercase text-[11px] font-bold tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Hoạt động</th>
                <th className="px-6 py-4">Người thực hiện</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#1a1a1a]">Cập nhật trạng thái thiết bị #AMS-102</p>
                    <p className="text-xs text-gray-400">Máy tính xách tay Dell XPS 15</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Nguyễn Văn A</td>
                  <td className="px-6 py-4 text-gray-500">10 phút trước</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-md">Hoàn thành</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;

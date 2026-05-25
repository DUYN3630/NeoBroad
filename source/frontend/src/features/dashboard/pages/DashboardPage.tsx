import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import apiClient from '@/lib/axios';
import { 
  Database, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight 
} from 'lucide-react';

interface Stats {
  totalAssets: number;
  brokenAssets: number;
  pendingFailures: number;
  scheduledMaintenances: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/Maintenance/DashboardStats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching dashboard stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Tổng thiết bị", value: stats?.totalAssets || 0, color: "blue", icon: <Database size={20} /> },
    { label: "Đang bị hỏng", value: stats?.brokenAssets || 0, color: "red", icon: <AlertTriangle size={20} /> },
    { label: "Yêu cầu sửa chữa", value: stats?.pendingFailures || 0, color: "orange", icon: <Clock size={20} /> },
    { label: "Lịch bảo trì tới", value: stats?.scheduledMaintenances || 0, color: "green", icon: <CheckCircle2 size={20} /> },
  ];

  return (
    <MainLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Tổng quan Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Hệ thống đang quản lý toàn bộ tài sản và quy trình bảo trì.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-2 text-xs font-bold text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Hệ thống trực tuyến</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500/30 transition-all group cursor-default">
            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {stat.icon}
            </div>
            <p className="text-gray-500 text-[13px] font-medium uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-3xl font-bold text-[#1a1a1a]">{loading ? "..." : stat.value}</h3>
              <div className="flex items-center text-green-500 text-[11px] font-bold pb-1">
                <TrendingUp size={12} className="mr-1" /> +2.5%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: HOẠT ĐỘNG GẦN ĐÂY */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <h3 className="font-bold text-[#1a1a1a] flex items-center">
                    <Clock size={16} className="mr-2 text-blue-500" />
                    Hoạt động gần đây
                </h3>
                <button className="text-[#0066cc] text-xs font-bold hover:underline flex items-center">
                    Xem tất cả <ChevronRight size={14} />
                </button>
            </div>
            <div className="p-0">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100 bg-gray-50/10">
                            <th className="px-6 py-3">Sự kiện</th>
                            <th className="px-6 py-3">Trạng thái</th>
                            <th className="px-6 py-3">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {[
                            { event: "Cập nhật tài sản #AMS-102", status: "Xong", time: "10 phút trước", color: "green" },
                            { event: "Yêu cầu sửa chữa mới", status: "Chờ", time: "1 giờ trước", color: "orange" },
                            { event: "Bảo trì định kỳ định kỳ", status: "Xong", time: "3 giờ trước", color: "green" },
                            { event: "Tạo người dùng mới", status: "Mới", time: "Hôm qua", color: "blue" },
                        ].map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-[#1a1a1a]">{item.event}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 bg-${item.color}-50 text-${item.color}-600 text-[10px] font-bold rounded-md border border-${item.color}-100`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400 text-xs">{item.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* CỘT PHẢI: TRẠNG THÁI HỆ THỐNG */}
        <div className="space-y-6">
            <div className="bg-[#0066cc] rounded-xl p-6 text-white shadow-lg shadow-blue-200">
                <h4 className="font-bold text-lg mb-2">Thông báo bảo trì</h4>
                <p className="text-blue-100 text-sm mb-4 leading-relaxed">Có 3 thiết bị cần được bảo trì trong tuần này để đảm bảo hiệu suất tốt nhất.</p>
                <button className="w-full py-2.5 bg-white text-[#0066cc] rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm">
                    Xem danh sách ngay
                </button>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-bold text-[#1a1a1a] mb-4">Phân bổ thiết bị</h4>
                <div className="space-y-4">
                    {[
                        { label: "Văn phòng", count: 450, total: 600, color: "blue" },
                        { label: "Sản xuất", count: 120, total: 200, color: "green" },
                        { label: "Dự phòng", count: 30, total: 100, color: "orange" },
                    ].map((item, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-bold text-gray-600">{item.label}</span>
                                <span className="text-gray-400">{item.count} / {item.total}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full bg-${item.color}-500 transition-all duration-1000`} 
                                    style={{ width: `${(item.count / item.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;

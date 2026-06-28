import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/axios';
import { 
  Database, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight,
  PieChart as PieIcon,
  Layers,
  Wrench
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface Stats {
  totalAssets: number;
  brokenAssets: number;
  pendingFailures: number;
  scheduledMaintenances: number;
  
  availabilityRate: number;
  slaRatio: number;
  totalCostThisMonth: number;
  pendingBorrowCount: number;

  assetDistribution?: { type: string; active: number; maintenance: number; broken: number }[];
  monthlyTrends?: { month: string; completed: number; created: number }[];
  techWorkload?: { name: string; done: number; pending: number }[];
  
  criticalAlerts?: { id: string; name: string; code: string; location: string }[];
  upcomingMaintenances?: { id: string; assetName: string; scheduledDate: string; description: string }[];
  pendingRequests?: { id: string; requesterName: string; purpose: string; createdAt: string }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nếu là Sinh viên/Giáo viên, tự động chuyển về Portal riêng
    if (user && (user.role === 2 || user.role === 3)) {
      navigate('/student/portal');
      return;
    }

    apiClient.get('/Maintenance/DashboardStats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching dashboard stats:', err))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const statCards = [
    { label: "Tỷ lệ Sẵn sàng", value: `${stats?.availabilityRate ?? 0}%`, color: "emerald", icon: <CheckCircle2 size={20} /> },
    { label: "Đúng hạn SLA", value: `${stats?.slaRatio ?? 0}%`, color: "blue", icon: <TrendingUp size={20} /> },
    { label: "Chi phí bảo trì (Tháng)", value: `${(stats?.totalCostThisMonth ?? 0).toLocaleString('vi-VN')}đ`, color: "purple", icon: <Wrench size={20} /> },
    { label: "Thiết bị đang hỏng", value: stats?.brokenAssets ?? 0, color: "red", icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Tổng quan Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Báo cáo hiệu suất vận hành cơ sở vật chất và công tác kỹ thuật.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-2 text-xs font-bold text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Hệ thống trực tuyến</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-gray-300 transition-all cursor-default flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-xs font-black uppercase tracking-wider">{stat.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center
                ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : ''}
                ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : ''}
                ${stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : ''}
                ${stat.color === 'red' ? 'bg-red-50 text-red-600' : ''}
              `}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-xl font-black text-gray-900 leading-none">
              {loading ? "..." : stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Row 1: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: LineChart for Maintenance Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-6 flex items-center text-xs uppercase tracking-wider">
            <TrendingUp size={14} className="mr-2 text-blue-500" />
            Biến động công tác bảo trì & sửa chữa (6 tháng gần đây)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyTrends || []} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: 10 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 700 }} />
                <Line type="monotone" dataKey="completed" name="Đã hoàn thành" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                <Line type="monotone" dataKey="created" name="Đã lập lịch" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Stacked Bar Chart for Asset Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-6 flex items-center text-xs uppercase tracking-wider">
            <Layers size={14} className="mr-2 text-emerald-500" />
            Trạng thái thiết bị theo nhóm
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.assetDistribution || []} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: '8px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 700 }} />
                <Bar dataKey="active" name="Hoạt động tốt" stackId="a" fill="#10b981" />
                <Bar dataKey="maintenance" name="Bảo trì" stackId="a" fill="#f59e0b" />
                <Bar dataKey="broken" name="Đang hỏng" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Tech workload & Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Horizontal Bar Chart for Technician Workload */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-6 flex items-center text-xs uppercase tracking-wider">
            <Wrench size={14} className="mr-2 text-purple-500" />
            Khối lượng công việc theo Kỹ thuật viên
          </h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.techWorkload || []}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} width={110} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: '8px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 700 }} />
                <Bar dataKey="done" name="Đã xong" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="pending" name="Đang xử lý" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent activity table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/10">
            <h3 className="font-bold text-[#1a1a1a] flex items-center text-xs uppercase tracking-wider">
              <Clock size={14} className="mr-2 text-blue-500" />
              Hoạt động gần đây
            </h3>
          </div>
          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 uppercase text-[9px] font-black tracking-widest border-b border-gray-150 bg-gray-50/10">
                  <th className="px-6 py-3">Sự kiện</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {[
                  { event: "Cập nhật tài sản #AMS-102", status: "Xong", time: "10 phút trước", color: "green" },
                  { event: "Yêu cầu sửa chữa mới", status: "Chờ", time: "1 giờ trước", color: "orange" },
                  { event: "Bảo trì thiết bị định kỳ", status: "Xong", time: "3 giờ trước", color: "green" },
                  { event: "Đã phê duyệt yêu cầu mượn", status: "Mới", time: "Hôm qua", color: "blue" },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{item.event}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 bg-${item.color}-50 text-${item.color}-600 text-[10px] font-bold rounded-md border border-${item.color}-100`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-[10px] font-bold">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Actionable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Urgent Broken Assets Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-700 flex items-center text-xs uppercase tracking-wider">
            <AlertTriangle size={14} className="mr-2 text-red-500 animate-pulse" /> Cảnh báo thiết bị hỏng
          </h4>
          <div className="space-y-3">
            {stats?.criticalAlerts && stats.criticalAlerts.length > 0 ? (
              stats.criticalAlerts.map((item, idx) => (
                <div key={idx} className="p-3 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-xl flex flex-col space-y-1 transition-colors">
                  <span className="font-bold text-gray-900 text-xs">{item.name}</span>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold">
                    <span>Mã: {item.code}</span>
                    <span>Phòng: {item.location}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 font-bold italic text-[10px]">
                Không có thiết bị hỏng cần báo cáo gấp.
              </div>
            )}
          </div>
        </div>

        {/* Preventative Maintenance Schedules */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-700 flex items-center text-xs uppercase tracking-wider">
            <Clock size={14} className="mr-2 text-blue-500" /> Lịch bảo trì sắp tới
          </h4>
          <div className="space-y-3">
            {stats?.upcomingMaintenances && stats.upcomingMaintenances.length > 0 ? (
              stats.upcomingMaintenances.map((item, idx) => (
                <div key={idx} className="p-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl flex flex-col space-y-1 transition-colors">
                  <span className="font-bold text-gray-900 text-xs">{item.assetName}</span>
                  <p className="text-gray-500 text-[10px] font-bold line-clamp-1">{item.description}</p>
                  <span className="text-[9px] text-blue-600 font-black mt-1 uppercase">
                    Hạn: {new Date(item.scheduledDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 font-bold italic text-[10px]">
                Không có lịch bảo trì sắp tới.
              </div>
            )}
          </div>
        </div>

        {/* Pending Approval Request List */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-700 flex items-center text-xs uppercase tracking-wider">
            <CheckCircle2 size={14} className="mr-2 text-purple-500" /> Đơn mượn chờ duyệt
          </h4>
          <div className="space-y-3">
            {stats?.pendingRequests && stats.pendingRequests.length > 0 ? (
              stats.pendingRequests.map((item, idx) => (
                <div key={idx} className="p-3 bg-purple-50/50 hover:bg-purple-50 border border-purple-100 rounded-xl flex flex-col space-y-1 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-xs">{item.requesterName}</span>
                    <button 
                      onClick={() => navigate('/assets/requests')}
                      className="text-[9px] text-purple-700 hover:underline font-black uppercase"
                    >
                      Duyệt ngay
                    </button>
                  </div>
                  <p className="text-gray-500 text-[10px] font-bold line-clamp-1">Mục đích: {item.purpose}</p>
                  <span className="text-[9px] text-gray-400 font-black">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 font-bold italic text-[10px]">
                Không có đơn mượn nào cần duyệt.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

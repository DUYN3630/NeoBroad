import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { theme } = useTheme();
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
    { 
      label: "Tỷ lệ Sẵn sàng", 
      value: `${stats?.availabilityRate ?? 0}%`, 
      trend: "+2.4%",
      icon: <CheckCircle2 size={14} strokeWidth={1.5} className="text-gray-400 dark:text-gray-500" />,
      sparklineColor: "#10b981",
      sparklineData: [
        { value: 92 }, 
        { value: 94 }, 
        { value: 93 }, 
        { value: 95 }, 
        { value: 94 }, 
        { value: stats?.availabilityRate ?? 96 }
      ]
    },
    { 
      label: "Đúng hạn SLA", 
      value: `${stats?.slaRatio ?? 0}%`, 
      trend: "+5.1%",
      icon: <TrendingUp size={14} strokeWidth={1.5} className="text-gray-400 dark:text-gray-500" />,
      sparklineColor: "#3b82f6",
      sparklineData: [
        { value: 85 }, 
        { value: 87 }, 
        { value: 86 }, 
        { value: 89 }, 
        { value: 88 }, 
        { value: stats?.slaRatio ?? 90 }
      ]
    },
    { 
      label: "Chi phí bảo trì (Tháng)", 
      value: `${(stats?.totalCostThisMonth ?? 0).toLocaleString('vi-VN')}đ`, 
      trend: "-1.2%",
      icon: <Wrench size={14} strokeWidth={1.5} className="text-gray-400 dark:text-gray-500" />,
      sparklineColor: "#8b5cf6",
      sparklineData: [
        { value: 45 }, 
        { value: 48 }, 
        { value: 51 }, 
        { value: 49 }, 
        { value: 46 }, 
        { value: stats?.totalCostThisMonth ? stats.totalCostThisMonth / 1000000 : 35 }
      ]
    },
    { 
      label: "Thiết bị đang hỏng", 
      value: stats?.brokenAssets ?? 0, 
      trend: "-12%",
      icon: <AlertTriangle size={14} strokeWidth={1.5} className="text-red-500" />,
      sparklineColor: "#ef4444",
      sparklineData: [
        { value: 8 }, 
        { value: 6 }, 
        { value: 7 }, 
        { value: 4 }, 
        { value: 3 }, 
        { value: stats?.brokenAssets ?? 2 }
      ]
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tổng quan Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Báo cáo hiệu suất vận hành cơ sở vật chất và công tác kỹ thuật.</p>
        </div>
        <div className="bg-[var(--bg-card)] px-4 py-2 rounded-lg border border-[var(--border-color)] shadow-sm flex items-center space-x-2 text-xs font-bold text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Hệ thống trực tuyến</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)] hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 cursor-default flex items-center justify-between shadow-sm">
            {/* Left side: Label, value, trend */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400 dark:text-gray-500 text-[10px] font-medium tracking-wide uppercase">{stat.label}</span>
                {stat.icon}
              </div>
              <div className="flex items-baseline space-x-1.5">
                <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight leading-none">
                  {loading ? "..." : stat.value}
                </h3>
                <span className={`text-[10px] font-medium ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>

            {/* Right side: Sparkline Chart */}
            <div className="w-20 h-10 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stat.sparklineData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={stat.sparklineColor} 
                    strokeWidth={1.5} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: LineChart for Maintenance Trend */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <h3 className="font-bold text-[var(--text-primary)] mb-6 flex items-center text-xs uppercase tracking-wider">
            <TrendingUp size={16} strokeWidth={1.5} className="mr-2 text-gray-400 dark:text-gray-500" />
            Biến động công tác bảo trì & sửa chữa (6 tháng gần đây)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyTrends || []} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#374151' : '#f0f0f0'} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                <Tooltip 
                  contentStyle={theme === 'dark' 
                    ? { backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb', borderRadius: '12px', fontSize: 10 } 
                    : { backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', borderRadius: '12px', fontSize: 10 }
                  } 
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 700, color: theme === 'dark' ? '#f9fafb' : '#111827' }} />
                <Line type="monotone" dataKey="completed" name="Đã hoàn thành" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                <Line type="monotone" dataKey="created" name="Đã lập lịch" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Stacked Bar Chart for Asset Distribution */}
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <h3 className="font-bold text-[var(--text-primary)] mb-6 flex items-center text-xs uppercase tracking-wider">
            <Layers size={16} strokeWidth={1.5} className="mr-2 text-gray-400 dark:text-gray-500" />
            Trạng thái thiết bị theo nhóm
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.assetDistribution || []} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#374151' : '#f0f0f0'} />
                <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                <Tooltip 
                  contentStyle={theme === 'dark' 
                    ? { backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb', borderRadius: '12px', fontSize: 10 } 
                    : { backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', borderRadius: '12px', fontSize: 10 }
                  } 
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 700, color: theme === 'dark' ? '#f9fafb' : '#111827' }} />
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
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <h3 className="font-bold text-[var(--text-primary)] mb-6 flex items-center text-xs uppercase tracking-wider">
            <Wrench size={16} strokeWidth={1.5} className="mr-2 text-gray-400 dark:text-gray-500" />
            Khối lượng công việc theo Kỹ thuật viên
          </h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.techWorkload || []}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? '#374151' : '#f0f0f0'} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} width={110} />
                <Tooltip 
                  contentStyle={theme === 'dark' 
                    ? { backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb', borderRadius: '12px', fontSize: 10 } 
                    : { backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', borderRadius: '12px', fontSize: 10 }
                  } 
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 700, color: theme === 'dark' ? '#f9fafb' : '#111827' }} />
                <Bar dataKey="done" name="Đã xong" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="pending" name="Đang xử lý" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent activity table */}
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-gray-50/10">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center text-xs uppercase tracking-wider">
              <Clock size={16} strokeWidth={1.5} className="mr-2 text-gray-400 dark:text-gray-500" />
              Hoạt động gần đây
            </h3>
          </div>
          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 uppercase text-[9px] font-black tracking-widest border-b border-[var(--border-color)] bg-gray-50/10">
                  <th className="px-6 py-3">Sự kiện</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] font-medium">
                {[
                  { event: "Cập nhật tài sản #AMS-102", status: "Xong", time: "10 phút trước", color: "green" },
                  { event: "Yêu cầu sửa chữa mới", status: "Chờ", time: "1 giờ trước", color: "orange" },
                  { event: "Bảo trì thiết bị định kỳ", status: "Xong", time: "3 giờ trước", color: "green" },
                  { event: "Đã phê duyệt yêu cầu mượn", status: "Mới", time: "Hôm qua", color: "blue" },
                ].map((item, idx) => {
                  const badgeClass = item.color === 'green' ? 'badge-done' : item.color === 'orange' ? 'badge-in-progress' : 'badge-todo';
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[var(--text-primary)]">{item.event}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border border-transparent ${badgeClass}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-450 text-[10px] font-bold">{item.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Actionable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Urgent Broken Assets Alerts */}
        <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-4">
          <h4 className="font-bold text-[var(--text-primary)] flex items-center text-xs uppercase tracking-wider">
            <AlertTriangle size={16} strokeWidth={1.5} className="mr-2 text-red-500 animate-pulse" /> Cảnh báo thiết bị hỏng
          </h4>
          <div className="space-y-3">
            {stats?.criticalAlerts && stats.criticalAlerts.length > 0 ? (
              stats.criticalAlerts.map((item, idx) => (
                <div key={idx} className="p-3 bg-[var(--bg-high)] border border-[var(--color-high)]/20 hover:opacity-95 rounded-xl flex flex-col space-y-1 transition-colors">
                  <span className="font-bold text-[var(--text-primary)] text-xs">{item.name}</span>
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
        <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-4">
          <h4 className="font-bold text-[var(--text-primary)] flex items-center text-xs uppercase tracking-wider">
            <Clock size={16} strokeWidth={1.5} className="mr-2 text-gray-400 dark:text-gray-500" /> Lịch bảo trì sắp tới
          </h4>
          <div className="space-y-3">
            {stats?.upcomingMaintenances && stats.upcomingMaintenances.length > 0 ? (
              stats.upcomingMaintenances.map((item, idx) => (
                <div key={idx} className="p-3 bg-[var(--bg-in-progress)] border border-[var(--color-in-progress)]/20 hover:opacity-95 rounded-xl flex flex-col space-y-1 transition-colors">
                  <span className="font-bold text-[var(--text-primary)] text-xs">{item.assetName}</span>
                  <p className="text-gray-500 text-[10px] font-bold line-clamp-1">{item.description}</p>
                  <span className="text-[9px] text-[var(--color-in-progress)] font-black mt-1 uppercase">
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
        <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-4">
          <h4 className="font-bold text-[var(--text-primary)] flex items-center text-xs uppercase tracking-wider">
            <CheckCircle2 size={16} strokeWidth={1.5} className="mr-2 text-gray-400 dark:text-gray-500" /> Đơn mượn chờ duyệt
          </h4>
          <div className="space-y-3">
            {stats?.pendingRequests && stats.pendingRequests.length > 0 ? (
              stats.pendingRequests.map((item, idx) => (
                <div key={idx} className="p-3 bg-[var(--bg-testing)] border border-[var(--color-testing)]/20 hover:opacity-95 rounded-xl flex flex-col space-y-1 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-primary)] text-xs">{item.requesterName}</span>
                    <button 
                      onClick={() => navigate('/assets/requests')}
                      className="text-[9px] text-[var(--color-testing)] hover:underline font-black uppercase"
                    >
                      Duyệt ngay
                    </button>
                  </div>
                  <p className="text-gray-500 text-[10px] font-bold line-clamp-1">Mục đích: {item.purpose}</p>
                  <span className="text-[9px] text-gray-450 font-black">
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

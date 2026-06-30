import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Pagination from '@/components/common/Pagination';
import { 
  Activity, 
  Battery, 
  BatteryWarning, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  History,
  ArrowUpRight,
  Settings,
  ShieldAlert,
  Calendar,
  DollarSign,
  Package,
  Wrench
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReChartsTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface AssetHealthData {
  id: string;
  name: string;
  serialNumber: string;
  type: string;
  batteryHealth: number | null;
  batteryCycle: number | null;
  healthStatus: 'Good' | 'Warning' | 'Critical';
  nextMaintenance: string;
  healthNotes: string;
}

interface HealthAnalytics {
  total: number;
  available: number;
  inUse: number;
  maintenance: number;
  broken: number;
  totalCostThisMonth: number;
}

const AssetHealthPage = () => {
  const [healthData, setHealthData] = useState<AssetHealthData[]>([]);
  const [analytics, setAnalytics] = useState<HealthAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch health report list
      const healthRes = await apiClient.get('/Maintenance/HealthReport');
      if (healthRes.data) {
        setHealthData(healthRes.data);
      }

      // 2. Fetch live health analytics from backend API
      const response: any = await apiClient.get('/Maintenance/HealthAnalytics');
      if (response.data) {
        setAnalytics(response.data);
      }
      setCurrentPage(1);
    } catch (error) {
      console.error('Fetch health data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Paginated health data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHealthData = healthData.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'text-green-600 bg-green-50 border-green-100';
      case 'Warning': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level < 20) return '#ef4444'; // Red
    if (level < 50) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  // Pie chart config for status distribution
  const pieData = analytics ? [
    { name: 'Sẵn sàng', value: analytics.available, color: '#10b981' },     // Green
    { name: 'Đang mượn', value: analytics.inUse, color: '#3b82f6' },        // Blue
    { name: 'Bảo trì', value: analytics.maintenance, color: '#f59e0b' },    // Amber
    { name: 'Hỏng hóc', value: analytics.broken, color: '#ef4444' },        // Red
  ] : [];

  const totalStatusCount = analytics ? (analytics.available + analytics.inUse + analytics.maintenance + analytics.broken) : 1;
  const healthScore = analytics 
    ? Math.round(((analytics.available + analytics.inUse) / (analytics.total || 1)) * 100) 
    : 85;

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
            <Activity className="mr-3 text-blue-600" size={28} />
            GIÁM SÁT SỨC KHỎE THIẾT BỊ
          </h1>
          <p className="text-gray-500 text-sm mt-1">Phân tích thực trạng tài sản thiết bị và quản lý dòng chi phí bảo trì.</p>
        </div>
        
        <div className="flex space-x-3">
           <button 
             onClick={fetchData}
             className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center shadow-sm"
           >
              <History size={14} className="mr-1.5" /> Làm mới
           </button>
           <button className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center shadow-md">
              <Settings size={14} className="mr-1.5" /> Thiết lập
           </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                  <Package size={18} />
               </div>
               <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Tổng thiết bị</span>
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">
              {isLoading ? '...' : analytics?.total || 0}
            </p>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Thiết bị trong kho</p>
         </div>
         
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                  <Wrench size={18} />
               </div>
               <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Bảo trì & Hỏng</span>
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">
              {isLoading ? '...' : (analytics ? (analytics.maintenance + analytics.broken) : 0)}
            </p>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Cần được xử lý kỹ thuật</p>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 bg-red-50 rounded-xl text-red-600">
                  <DollarSign size={18} />
               </div>
               <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Chi phí bảo trì</span>
            </div>
            <p className="text-xl font-black text-red-600 tracking-tighter py-1">
              {isLoading ? '...' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(analytics?.totalCostThisMonth || 0)}
            </p>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Hoàn thành trong tháng này</p>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
                  <CheckCircle2 size={18} />
               </div>
               <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Sẵn sàng vận hành</span>
            </div>
            <p className="text-3xl font-black text-green-600 tracking-tighter">
              {isLoading ? '...' : `${healthScore}%`}
            </p>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Tỷ lệ khả dụng hệ thống</p>
         </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
         {/* Status Pie Chart */}
         <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Phân bố tình trạng thiết bị</h3>
               <div className="h-[240px] flex items-center justify-center relative">
                  {isLoading ? (
                    <span className="text-xs text-gray-400 italic">Đang vẽ biểu đồ...</span>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                       <PieChart>
                          <Pie
                             data={pieData}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={80}
                             paddingAngle={4}
                             dataKey="value"
                          >
                             {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                  )}
                  {/* Center percentage summary */}
                  <div className="absolute flex flex-col items-center">
                     <span className="text-2xl font-black text-gray-900 tracking-tight">{analytics?.total || 0}</span>
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Thiết bị</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-4 border-t border-gray-100">
               {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                     <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                     <span className="text-gray-500 truncate">{item.name}:</span>
                     <span className="text-gray-900 ml-auto">{item.value}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Battery Health Bar Chart */}
         <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Top thiết bị có dung lượng Pin thấp nhất</h3>
            <div className="h-[280px]">
               {isLoading ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">Đang tải...</div>
               ) : (
                  <ResponsiveContainer width="100%" height={280}>
                     <BarChart data={healthData.filter(d => d.batteryHealth !== null)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="serialNumber" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <ReChartsTooltip 
                           contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                           cursor={{fill: '#f8fafc'}}
                        />
                        <Bar dataKey="batteryHealth" radius={[4, 4, 0, 0]} barSize={36}>
                           {healthData.filter(d => d.batteryHealth !== null).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getBatteryColor(entry.batteryHealth || 0)} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               )}
            </div>
         </div>
      </div>

      {/* LOWER AREA: PRIORITY QUEUE & DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Maintenance Queue */}
         <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Bảo trì khẩn cấp & Cảnh báo</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar flex-grow">
               {healthData.filter(d => d.healthStatus !== 'Good').map(item => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-100 transition-all">
                     <div className={`p-2 rounded-lg ${getStatusColor(item.healthStatus)}`}>
                        {item.healthStatus === 'Critical' ? <BatteryWarning size={18} /> : <AlertTriangle size={18} />}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between">
                           <p className="text-sm font-black text-gray-900">{item.name}</p>
                           <span className="text-[10px] font-bold text-gray-405">{item.serialNumber}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{item.healthNotes}</p>
                        <div className="flex items-center mt-3 text-[10px] font-bold">
                           <Clock size={12} className="mr-1 text-gray-400" />
                           <span className="text-gray-400 uppercase tracking-tighter">Hạn bảo trì:</span>
                           <span className="ml-2 text-blue-600">{item.nextMaintenance}</span>
                        </div>
                     </div>
                     <button className="p-1 text-gray-300 hover:text-blue-600 transition-colors">
                        <ArrowUpRight size={16} />
                     </button>
                  </div>
               ))}
            </div>
         </div>

         {/* Detailed Table */}
         <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Chi tiết sức khỏe thiết bị trong kho</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thiết bị</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Pin / Chu kỳ</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bảo trì định kỳ</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                     {currentHealthData.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-4">
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <p className="text-[9px] font-mono text-gray-400 mt-0.5">{item.serialNumber} • {item.type}</p>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusColor(item.healthStatus)}`}>
                                 {item.healthStatus === 'Critical' ? 'Khẩn cấp' : item.healthStatus === 'Warning' ? 'Cảnh báo' : 'Tốt'}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              {item.batteryHealth !== null ? (
                                 <div className="flex flex-col items-center">
                                    <div className="flex items-center space-x-2">
                                       <Battery size={14} style={{color: getBatteryColor(item.batteryHealth)}} />
                                       <span className="font-bold" style={{color: getBatteryColor(item.batteryHealth)}}>{item.batteryHealth}%</span>
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-medium mt-1">{item.batteryCycle} chu kỳ</span>
                                 </div>
                              ) : (
                                 <div className="text-center text-gray-300">N/A</div>
                              )}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                 <Calendar size={14} className="text-gray-400" />
                                 <span className="font-medium text-gray-600">{item.nextMaintenance}</span>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            
            <div className="p-4 border-t border-gray-100">
               <Pagination
                 totalItems={healthData.length}
                 itemsPerPage={itemsPerPage}
                 currentPage={currentPage}
                 onPageChange={setCurrentPage}
               />
            </div>
         </div>
      </div>
    </>
  );
};

export default AssetHealthPage;

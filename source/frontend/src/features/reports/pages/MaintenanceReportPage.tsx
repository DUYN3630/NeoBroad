import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import apiClient from '@/lib/axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Wallet, TrendingUp, Calendar, Download, Filter, History, PieChart as PieIcon } from 'lucide-react';

const MaintenanceReportPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/Reports/MaintenanceHistory')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MainLayout><div className="p-8 text-center">Đang trích xuất lịch sử...</div></MainLayout>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Báo cáo Lịch sử Bảo trì</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi biến động chi phí và hiệu quả bảo dưỡng định kỳ.</p>
        </div>
        <button className="k-button-primary flex items-center text-xs uppercase shadow-lg shadow-blue-100">
            <Download size={14} className="mr-2" /> Xuất dữ liệu Excel
        </button>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Chi phí Bảo trì (Maintenance)</p>
            <h2 className="text-2xl font-black text-gray-700">{formatCurrency(data?.totalMaintenanceCost || 0)}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-orange-500">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Chi phí Sửa chữa (Repair)</p>
            <h2 className="text-2xl font-black text-gray-700">{formatCurrency(data?.totalRepairCost || 0)}</h2>
        </div>
        <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-xl border border-gray-800 border-l-4 border-l-green-500">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1 text-white/50">Tổng ngân sách đã chi</p>
            <h2 className="text-2xl font-black text-white">{formatCurrency((data?.totalMaintenanceCost || 0) + (data?.totalRepairCost || 0))}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART BIẾN ĐỘNG CHI PHÍ */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-[#1a1a1a] mb-8 flex items-center text-sm uppercase tracking-widest">
                <TrendingUp size={18} className="mr-2 text-blue-500" /> Xu hướng chi phí theo tháng
            </h3>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.monthlyStats || []}>
                        <defs>
                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0072C6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#0072C6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold'}} tickFormatter={(v)=>`${v/1000000}M`} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="cost" stroke="#0072C6" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* NHẬT KÝ CHI TIẾT */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-700 text-xs uppercase tracking-widest">Top chi phí theo thiết bị</h3>
                <Filter size={14} className="text-gray-300" />
            </div>
            <div className="flex-grow p-6 space-y-6 overflow-y-auto max-h-[350px]">
                {[
                    { name: 'Server Dell R740', cost: 15000000, type: 'Maintenance' },
                    { name: 'Máy in Canon 3300', cost: 2500000, type: 'Repair' },
                    { name: 'UPS APC 3000VA', cost: 8900000, type: 'Maintenance' },
                    { name: 'Router Cisco X', cost: 1200000, type: 'Repair' },
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${item.type === 'Maintenance' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                            <div>
                                <p className="text-xs font-bold text-gray-700">{item.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{item.type}</p>
                            </div>
                        </div>
                        <p className="text-xs font-black text-gray-600">{formatCurrency(item.cost)}</p>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-gray-50 rounded-b-2xl text-center">
                <button className="text-[10px] font-black text-[#0072C6] uppercase tracking-widest hover:underline">Xem báo cáo chi tiết</button>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MaintenanceReportPage;

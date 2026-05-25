import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import apiClient from '@/lib/axios';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { FileBarChart, Filter, Download, Search, Table as TableIcon, LayoutDashboard, Database } from 'lucide-react';

const COLORS = ['#0072C6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const AssetReportPage = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard or table

  useEffect(() => {
    apiClient.get('/Reports/AssetStatus')
      .then(res => setReportData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MainLayout><div className="p-8 text-center">Đang phân tích dữ liệu...</div></MainLayout>;

  return (
    <MainLayout>
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Báo cáo Trạng thái Thiết bị</h1>
          <p className="text-gray-500 text-sm">Phân tích chuyên sâu về hiện trạng và phân bổ tài sản toàn hệ thống.</p>
        </div>
        <div className="flex items-center space-x-3">
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                <button 
                    onClick={() => setViewMode('dashboard')}
                    className={`p-2 rounded-md flex items-center text-xs font-bold uppercase transition-all ${viewMode === 'dashboard' ? 'bg-blue-50 text-[#0072C6]' : 'text-gray-400'}`}
                >
                    <LayoutDashboard size={14} className="mr-1.5" /> Thống kê
                </button>
                <button 
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md flex items-center text-xs font-bold uppercase transition-all ${viewMode === 'table' ? 'bg-blue-50 text-[#0072C6]' : 'text-gray-400'}`}
                >
                    <TableIcon size={14} className="mr-1.5" /> Chi tiết
                </button>
            </div>
            <button className="k-button-primary flex items-center text-xs uppercase shadow-lg shadow-blue-100">
                <Download size={14} className="mr-2" /> Xuất báo cáo
            </button>
        </div>
      </div>

      {/* FILTER BAR - "MỘT ĐỐNG THÔNG TIN LỌC" */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
                <label className="k-label">Phòng ban sở hữu</label>
                <select className="k-input"><option>Tất cả phòng ban</option></select>
            </div>
            <div>
                <label className="k-label">Nhà sản xuất</label>
                <select className="k-input"><option>Tất cả hãng</option></select>
            </div>
            <div>
                <label className="k-label">Khoảng thời gian mua</label>
                <input type="month" className="k-input" />
            </div>
            <div className="flex items-end">
                <button className="w-full py-2 bg-gray-100 text-gray-600 rounded font-bold text-xs uppercase hover:bg-gray-200 transition-all flex items-center justify-center">
                    <Filter size={14} className="mr-2" /> Áp dụng bộ lọc
                </button>
            </div>
        </div>
      </div>

      {viewMode === 'dashboard' ? (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* TỔNG QUAN GIÁ TRỊ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[#0072C6] rounded-2xl p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                    <Database size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-transform duration-500" />
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">Tổng giá trị tài sản</p>
                    <h2 className="text-3xl font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reportData?.totalValue || 0)}</h2>
                    <div className="mt-6 flex items-center text-blue-200 text-xs font-bold">
                        <span className="bg-white/20 px-2 py-1 rounded mr-2">+12%</span> So với cùng kỳ năm trước
                    </div>
                </div>
                
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <h3 className="font-bold text-gray-700 mb-6 uppercase text-xs tracking-widest">Phân bổ theo phòng ban</h3>
                    <div className="h-24 flex items-end space-x-2">
                        {(reportData?.ByDepartment || []).map((d:any, i:number) => (
                            <div key={i} className="flex-grow group relative">
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{d.name}: {d.value}</div>
                                <div className="bg-blue-100 rounded-t-sm w-full transition-all hover:bg-[#0072C6]" style={{ height: `${(d.value / Math.max(...(reportData?.ByDepartment?.map((x:any)=>x.value) || [1]))) * 100}%` }}></div>
                                <p className="text-[10px] text-gray-400 mt-2 truncate text-center">{d.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BIỂU ĐỒ TRẠNG THÁI & LOẠI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-[#1a1a1a] mb-8 flex items-center text-sm uppercase tracking-wide">
                        <FileBarChart size={18} className="mr-2 text-blue-500" /> Tỷ lệ trạng thái vận hành
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={reportData?.ByStatus || []} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {(reportData?.ByStatus || []).map((_:any, index:number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-[#1a1a1a] mb-8 flex items-center text-sm uppercase tracking-wide">
                        <LayoutDashboard size={18} className="mr-2 text-green-500" /> Phân loại theo thiết bị
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData?.ByType || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fontWeight: 'bold'}} axisLine={false} />
                                <Tooltip cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in slide-in-from-right-4">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="k-grid-header">
                        <th className="px-6 py-4">Hạng mục thống kê</th>
                        <th className="px-6 py-4 text-center">Số lượng</th>
                        <th className="px-6 py-4 text-right">Tỷ lệ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {(reportData?.ByStatus || []).map((s:any, i:number) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-700">Trạng thái: {s.name}</td>
                            <td className="px-6 py-4 text-center font-mono">{s.value}</td>
                            <td className="px-6 py-4 text-right text-gray-400">{(s.value / (reportData?.ByStatus?.reduce((a:any,b:any)=>a+b.value,0) || 1) * 100).toFixed(1)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </MainLayout>
  );
};

export default AssetReportPage;

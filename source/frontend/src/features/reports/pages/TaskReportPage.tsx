import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import apiClient from '@/lib/axios';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { CheckCircle2, Clock, User, Award, ListChecks, Download } from 'lucide-react';

const TaskReportPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/Reports/TaskCompletion')
      .then(res => setData(res.data))
      .catch(err => {
        console.error('Error fetching task report:', err);
        setData({
            Overall: { Total: 0, Done: 0, InProgress: 0, ToDo: 0 },
            ByPriority: [],
            ByTechnician: []
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MainLayout><div className="p-8 text-center text-gray-500 italic">Đang tính toán hiệu suất công việc...</div></MainLayout>;

  // Đảm bảo data không null trước khi render
  const safeData = data || {
    Overall: { Total: 1, Done: 0, InProgress: 0, ToDo: 0 },
    ByPriority: [],
    ByTechnician: []
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Báo cáo Hiệu suất Công việc</h1>
          <p className="text-gray-500 text-sm mt-1">Đánh giá tiến độ hoàn thành task và năng suất của đội ngũ kỹ thuật.</p>
        </div>
        <button className="k-button-primary flex items-center text-xs uppercase shadow-lg shadow-blue-100">
            <Download size={14} className="mr-2" /> In báo cáo hiệu suất
        </button>
      </div>

      {/* OVERALL PROGRESS */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">Tổng quan tiến độ hệ thống</h3>
            <span className="text-2xl font-black text-[#0072C6]">
                {((safeData.Overall.Done / (safeData.Overall.Total || 1)) * 100).toFixed(1)}%
            </span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-green-500" style={{ width: `${(safeData.Overall.Done / (safeData.Overall.Total || 1) * 100)}%` }}></div>
            <div className="h-full bg-blue-400" style={{ width: `${(safeData.Overall.InProgress / (safeData.Overall.Total || 1) * 100)}%` }}></div>
            <div className="h-full bg-gray-300" style={{ width: `${(safeData.Overall.ToDo / (safeData.Overall.Total || 1) * 100)}%` }}></div>
        </div>
        <div className="grid grid-cols-3 mt-6 gap-4">
            <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span className="text-xs text-gray-500 font-bold uppercase">Đã xong ({safeData.Overall.Done})</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                <span className="text-xs text-gray-500 font-bold uppercase">Đang làm ({safeData.Overall.InProgress})</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                <span className="text-xs text-gray-500 font-bold uppercase">Chưa làm ({safeData.Overall.ToDo})</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* HIỆU SUẤT THEO NHÂN VIÊN */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-[#1a1a1a] mb-8 flex items-center text-sm uppercase tracking-wide">
                <User size={18} className="mr-2 text-blue-500" /> Công việc theo nhân sự
            </h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={safeData.ByTechnician}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                        <Bar dataKey="value" fill="#0072C6" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* CÔNG VIỆC THEO ƯU TIÊN */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-[#1a1a1a] mb-8 flex items-center text-sm uppercase tracking-wide">
                <ListChecks size={18} className="mr-2 text-orange-500" /> Phân loại theo mức độ ưu tiên
            </h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={safeData.ByPriority} innerRadius={60} outerRadius={90} dataKey="value">
                            {safeData.ByPriority.map((_:any, index:number) => <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#3b82f6', '#10b981'][index % 4]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TaskReportPage;

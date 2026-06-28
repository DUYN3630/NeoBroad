import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ClipboardCheck, TrendingUp, CheckCircle2, Clock, Download } from 'lucide-react';

const TaskReportPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/Reports/Tasks')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportExcel = async () => {
    try {
      const response = await apiClient.get('/Reports/Tasks/Export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_CongViec_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error", err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 italic">Đang tính toán hiệu suất công việc...</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-10 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center">
              <ClipboardCheck className="mr-3 text-[#0066cc]" size={28} />
              Báo cáo hiệu suất công việc
          </h1>
          <p className="text-gray-500 text-sm mt-1">Đánh giá tốc độ xử lý và chất lượng hoàn thành Task của đội ngũ kỹ thuật.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportExcel}
            className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-50 transition-all text-gray-700"
          >
              <Download size={18} className="mr-2 text-gray-400" /> Xuất Excel
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-[#0066cc] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-md hover:bg-[#0052a3]"
          >
              <Download size={18} className="mr-2" /> Tải báo cáo PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {[
              { label: "Tasks Hoàn thành", value: `${data?.completedTasks || 0}`, trend: "+12%", icon: <CheckCircle2 className="text-green-500" /> },
              { label: "Đúng hạn (SLA)", value: `${data?.slaRatio || 0}%`, trend: "+2%", icon: <TrendingUp className="text-blue-500" /> },
              { label: "Thời gian xử lý TB", value: `${data?.averageProcessingTimeHours || 0}h`, trend: "-10%", icon: <Clock className="text-orange-500" /> },
              { label: "Task tồn đọng", value: `${data?.pendingTasks || 0}`, trend: "-5%", icon: <Clock className="text-red-500" /> },
          ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-gray-50 rounded-lg">{item.icon}</div>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{item.trend}</span>
                  </div>
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">{item.label}</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{item.value}</h3>
              </div>
          ))}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-8">Khối lượng công việc theo nhân viên</h3>
          <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={data?.technicianWorkload || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Bar dataKey="done" fill="#0066cc" radius={[4, 4, 0, 0]} name="Đã hoàn thành" />
                      <Bar dataKey="pending" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Đang xử lý" />
                  </RechartsBarChart>
              </ResponsiveContainer>
          </div>
      </div>
    </>
  );
};

export default TaskReportPage;

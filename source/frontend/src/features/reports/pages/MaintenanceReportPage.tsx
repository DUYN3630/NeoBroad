import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { History, Calendar, Download } from 'lucide-react';

const MaintenanceReportPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/Reports/Maintenance')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Đang trích xuất lịch sử...</div>;

  const handleExportExcel = async () => {
    try {
      const response = await apiClient.get('/Reports/Maintenance/Export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_BaoTri_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error", err);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Báo cáo công tác bảo trì</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi chi phí và hiệu quả của quy trình bảo trì dự báo.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Chi phí bảo trì năm nay</p>
              <h2 className="text-3xl font-black text-gray-900">{(data?.totalCostYear || 0).toLocaleString('vi-VN')}đ</h2>
              <div className="mt-4 flex items-center text-red-500 text-xs font-bold">
                  <span className="bg-red-50 px-2 py-0.5 rounded-md border border-red-100">+15% so với năm ngoái</span>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tỷ lệ thiết bị hoạt động tốt</p>
              <h2 className="text-3xl font-black text-gray-900">{data?.goodAssetRatio || 0}%</h2>
              <div className="mt-4 flex items-center text-green-500 text-xs font-bold">
                  <span className="bg-green-50 px-2 py-0.5 rounded-md border border-green-100">+2.4% mục tiêu</span>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Số Ticket trung bình / tháng</p>
              <h2 className="text-3xl font-black text-gray-900">{data?.averageTicketsPerMonth || 0}</h2>
              <div className="mt-4 flex items-center text-blue-500 text-xs font-bold">
                  <span className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Mới cập nhật</span>
              </div>
          </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-8 flex items-center">
              <History size={20} className="mr-3 text-blue-600" />
              Biến động chi phí bảo trì theo tháng (Triệu VNĐ)
          </h3>
          <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.monthlyCosts || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Line type="monotone" dataKey="cost" stroke="#0066cc" strokeWidth={4} dot={{r: 6, fill: '#0066cc', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8}} />
                  </LineChart>
              </ResponsiveContainer>
          </div>
      </div>
    </>
  );
};

export default MaintenanceReportPage;

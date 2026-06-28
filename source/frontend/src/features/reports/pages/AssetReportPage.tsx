import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { 
  PieChart as RechartsPieChart, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Pie
} from 'recharts';
import { Download, Filter, FileText, PieChart as PieIcon, BarChart as BarIcon } from 'lucide-react';

const AssetReportPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/Reports/Assets')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Đang phân tích dữ liệu...</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/Reports/Assets/Export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_TaiSan_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error", err);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Báo cáo tài sản & thiết bị</h1>
          <p className="text-gray-500 text-sm mt-1">Phân tích chuyên sâu về tình trạng và phân bổ tài sản.</p>
        </div>
        <div className="flex space-x-3">
            <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-50 transition-all">
                <Filter size={18} className="mr-2 text-gray-400" /> Lọc báo cáo
            </button>
            <button 
                onClick={handleExport}
                className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-black transition-all"
            >
                <Download size={18} className="mr-2" /> Xuất Excel
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Biểu đồ phân bổ theo loại */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center">
                <PieIcon size={18} className="mr-2 text-blue-500" />
                Phân bổ thiết bị theo loại
            </h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={data?.typeDistribution || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {COLORS.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Biểu đồ tình trạng */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center">
                <BarIcon size={18} className="mr-2 text-green-500" />
                Trạng thái vận hành
            </h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={data?.statusDistribution || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="count" fill="#0066cc" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-700">Dữ liệu chi tiết</h3>
              <FileText size={20} className="text-gray-300" />
          </div>
          <div className="space-y-4">
              {[
                { label: "Tổng giá trị tài sản", value: `${(data?.totalValue || 0).toLocaleString('vi-VN')} VNĐ`, trend: "+12%" },
                { label: "Khấu hao trong tháng", value: `${(data?.monthlyDepreciation || 0).toLocaleString('vi-VN')} VNĐ`, trend: "-2%" },
                { label: "Tỷ lệ sử dụng trung bình", value: `${data?.averageUsageRate || 0}%`, trend: "+5%" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-medium">{item.label}</span>
                    <div className="flex items-center space-x-4">
                        <span className="font-bold text-[#1a1a1a]">{item.value}</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${item.trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {item.trend}
                        </span>
                    </div>
                </div>
              ))}
          </div>
      </div>
    </>
  );
};

export default AssetReportPage;

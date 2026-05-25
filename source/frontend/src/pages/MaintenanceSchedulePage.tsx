import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import apiClient from '../api/apiClient';
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Schedule {
  id: number;
  assetName: string;
  scheduledDate: string;
  description: string;
  status: string;
}

const MaintenanceSchedulePage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/Maintenance/Schedules')
      .then(res => setSchedules(res.data))
      .finally(() => setLoading(false));
  }, []);

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-50 text-blue-600';
      case 'overdue': return 'bg-red-50 text-red-600';
      case 'completed': return 'bg-green-50 text-green-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý lịch bảo trì</h1>
        <p className="text-gray-500 text-sm">Theo dõi và lên kế hoạch bảo trì định kỳ cho thiết bị.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-700">Thiết bị</th>
              <th className="px-6 py-4 font-bold text-gray-700">Ngày dự kiến</th>
              <th className="px-6 py-4 font-bold text-gray-700">Mô tả</th>
              <th className="px-6 py-4 font-bold text-gray-700">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
            ) : schedules.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-[#1a1a1a]">{s.assetName}</td>
                <td className="px-6 py-4 text-gray-600 flex items-center">
                  <Calendar size={14} className="mr-2 text-gray-400" />
                  {new Date(s.scheduledDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 text-gray-500">{s.description}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${getStatusStyle(s.status)}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
};

export default MaintenanceSchedulePage;

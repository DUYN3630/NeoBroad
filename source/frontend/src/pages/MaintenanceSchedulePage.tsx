import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Schedule {
  id: number;
  assetName: string;
  nextDate: string;
  status: string;
}

const MaintenanceSchedulePage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/Maintenance/Schedules')
      .then((res: any) => setSchedules(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Lịch bảo trì hệ thống</h1>
        <p className="text-gray-500 text-sm">Các mốc thời gian bảo trì dự phòng cho các thiết bị quan trọng.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Tên thiết bị</th>
              <th className="px-6 py-4">Ngày bảo trì</th>
              <th className="px-6 py-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-400">Đang tải lịch trình...</td></tr>
            ) : schedules.length > 0 ? (
              schedules.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700">{s.assetName}</td>
                  <td className="px-6 py-4 flex items-center text-gray-500">
                    <Calendar size={14} className="mr-2" />
                    {new Date(s.nextDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      s.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">Không có lịch bảo trì nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MaintenanceSchedulePage;

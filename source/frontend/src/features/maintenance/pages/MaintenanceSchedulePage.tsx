import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ScheduleModal from '../components/ScheduleModal';
import apiClient from '@/lib/axios';
import { Calendar, Clock, Plus, Search } from 'lucide-react';

interface Schedule {
  id: number;
  assetId: number;
  scheduledDate: string;
  description: string;
  status: string;
}

const MaintenanceSchedulePage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/Maintenance/Schedules');
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSaveSchedule = async (data: any) => {
    try {
        await apiClient.post('/Maintenance/Schedules', data);
        setIsModalOpen(false);
        fetchSchedules();
        alert('Đã lên lịch bảo trì thành công!');
    } catch (err) {
        alert('Lỗi khi lên lịch!');
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'scheduled': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'overdue': return 'bg-red-50 text-red-600 border-red-100';
      case 'completed': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý lịch bảo trì</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi và lên kế hoạch bảo trì định kỳ cho thiết bị.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0066cc] hover:bg-[#0052a3] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm transition-all"
        >
          <Plus size={18} className="mr-2" /> Lập lịch mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-200">
              <th className="px-6 py-4">ID Thiết bị</th>
              <th className="px-6 py-4">Ngày dự kiến</th>
              <th className="px-6 py-4">Mô tả công việc</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-6 py-8"></td></tr>)
            ) : schedules.length > 0 ? (
              schedules.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#1a1a1a]">#AST-{s.assetId}</td>
                  <td className="px-6 py-4 text-gray-600 flex items-center mt-1">
                    <Calendar size={14} className="mr-2 text-gray-400" />
                    {new Date(s.scheduledDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-gray-500 italic">"{s.description}"</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">Không có lịch bảo trì nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchedule}
      />
    </MainLayout>
  );
};

export default MaintenanceSchedulePage;

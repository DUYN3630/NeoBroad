import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  User,
  Search
} from 'lucide-react';

const MyTasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
        // Mocking name for demo: 'Nguyễn Văn Kỹ Thuật'
        const demoName = 'Nguyễn Văn Kỹ Thuật';
        apiClient.get(`/Tasks/MyTasks/${demoName}`)
          .then(res => setTasks(res.data))
          .catch(err => console.error(err))
          .finally(() => setLoading(false));
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-50 text-green-600 border-green-100';
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Lịch trình công việc của tôi</h1>
          <p className="text-gray-500 text-sm mt-1">Chào {user?.fullName}, đây là danh sách nhiệm vụ bạn cần thực hiện.</p>
        </div>
        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase">Hôm nay</p>
                <p className="text-xs font-bold text-gray-700">{new Date().toLocaleDateString('vi-VN')}</p>
            </div>
            <Calendar size={20} className="text-[#0072C6]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: DANH SÁCH TASK */}
        <div className="lg:col-span-2 space-y-4">
            {loading ? (
                <div className="p-12 text-center text-gray-400">Đang tải lịch trình...</div>
            ) : tasks.length > 0 ? (
                tasks.map((task) => (
                    <div key={task.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start justify-between group">
                        <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-xl ${task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#0072C6]'}`}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-700 group-hover:text-[#0072C6] transition-colors">{task.title}</h3>
                                <p className="text-xs text-gray-400 mt-1 mb-3">{task.description}</p>
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        <Calendar size={12} className="mr-1" /> Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="p-2 text-gray-300 hover:text-[#0072C6] hover:bg-blue-50 rounded-full transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                ))
            ) : (
                <div className="p-12 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-center">
                    <p className="text-gray-400 italic">Bạn chưa được giao công việc nào trong hôm nay.</p>
                </div>
            )}
        </div>

        {/* CỘT PHẢI: THÔNG TIN PHỤ */}
        <div className="space-y-6">
            <div className="bg-[#1a1a1a] p-6 rounded-2xl text-white shadow-xl">
                <h4 className="font-bold mb-4 flex items-center text-sm uppercase tracking-widest text-green-400">
                    <CheckCircle2 size={16} className="mr-2" /> Thống kê năng suất
                </h4>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Công việc hoàn thành</span>
                        <span className="font-mono font-bold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Tỷ lệ đúng hạn</span>
                        <span className="font-mono font-bold text-green-400">95%</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 text-xs uppercase">Ghi chú từ Quản lý</h4>
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <p className="text-xs text-yellow-700 leading-relaxed italic">
                        "Lưu ý kiểm tra kỹ hệ thống phòng cháy chữa cháy tại kho B trong tuần này."
                    </p>
                </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyTasksPage;

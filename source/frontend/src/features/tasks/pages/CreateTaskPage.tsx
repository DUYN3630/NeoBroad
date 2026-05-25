import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TaskModal from '../components/TaskModal';
import apiClient from '@/lib/axios';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Clock, 
  User, 
  AlertCircle,
  Hash,
  Tag,
  Calendar
} from 'lucide-react';

interface WorkTask {
  id: string;
  taskCode: string;
  title: string;
  taskType: string;
  relatedAssetId: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string;
  supervisor: string;
  startDate: string;
  dueDate: string;
}

const CreateTaskPage = () => {
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WorkTask | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/Tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSaveTask = async (data: any) => {
    try {
        await apiClient.post('/Tasks', data);
        setIsModalOpen(false);
        fetchTasks();
        alert('Đã giao công việc thành công!');
    } catch (err) {
        alert('Lỗi hệ thống khi giao việc!');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-700 bg-red-100 border-red-200';
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Normal': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Giao phó công việc bảo trì</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý và phân phối nhiệm vụ kỹ thuật cho đội ngũ nhân viên.</p>
        </div>
        <button 
            onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
            className="k-button-primary flex items-center text-xs uppercase"
        >
          <Plus size={18} className="mr-2" /> Tạo công việc mới
        </button>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="k-grid-header">
              <th className="px-6 py-3">Mã số & Tiêu đề</th>
              <th className="px-6 py-3">Loại</th>
              <th className="px-6 py-3">Người thực hiện</th>
              <th className="px-6 py-3 text-center">Ưu tiên</th>
              <th className="px-6 py-3 text-center">Hạn chót</th>
              <th className="px-6 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="px-6 py-8"></td></tr>)
            ) : tasks.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                        <p className="text-[10px] font-black text-[#0072C6] uppercase mb-0.5 flex items-center"><Hash size={10} className="mr-1" /> {t.taskCode}</p>
                        <p className="font-bold text-gray-700">{t.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center text-gray-500 italic"><Tag size={12} className="mr-1.5" /> {t.taskType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                            <User size={14} />
                        </div>
                        <span className="font-medium text-gray-600">{t.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityColor(t.priority)}`}>
                        {t.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400 font-mono text-[11px]">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString('vi-VN') : '---'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase">
                        {t.status}
                    </span>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialData={selectedTask}
      />
    </MainLayout>
  );
};

export default CreateTaskPage;

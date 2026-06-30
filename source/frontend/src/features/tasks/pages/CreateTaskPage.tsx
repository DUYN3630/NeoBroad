import React, { useState, useEffect } from 'react';
import TaskModal from '../components/TaskModal';
import apiClient from '@/lib/axios';
import Pagination from '@/components/common/Pagination';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Clock, 
  User,
  CheckCircle2,
  Tag,
  Calendar
} from 'lucide-react';

interface WorkTask {
  id?: string;
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
  requirements: string;
}

const CreateTaskPage = () => {
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WorkTask | null>(null);
  
  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get('/Tasks');
      setTasks(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSaveTask = async (data: WorkTask) => {
    try {
        if (data.id) {
          await apiClient.put(`/Tasks/${data.id}`, data);
        } else {
          await apiClient.post('/Tasks', data);
        }
        setIsModalOpen(false);
        fetchTasks();
        alert('Đã lưu công việc thành công!');
    } catch (err) {
        alert('Lỗi hệ thống khi lưu việc!');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => 
    (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.taskCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginated tasks
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center">
            <ClipboardCheck className="mr-3 text-[#0066cc]" size={28} />
            Phân công công việc
          </h1>
          <p className="text-gray-500 text-sm mt-1">Giao việc và điều phối nhân sự kỹ thuật trong hệ thống.</p>
        </div>
        <button 
          onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
          className="bg-[#1a1a1a] hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg transition-all"
        >
          <Plus size={20} className="mr-2" /> Giao việc mới
        </button>
      </div>

      <div className="bg-white rounded-t-2xl shadow-sm border-t border-x border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm task..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all" 
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
              <th className="px-6 py-4">Công việc</th>
              <th className="px-6 py-4">Người thực hiện</th>
              <th className="px-6 py-4">Hạn chót</th>
              <th className="px-6 py-4">Ưu tiên</th>
              <th className="px-6 py-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-6 py-10"></td></tr>)
            ) : currentTasks.length > 0 ? (
              currentTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{task.title}</p>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">{task.taskCode}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                            {task.assignedTo ? task.assignedTo.charAt(0) : 'U'}
                        </div>
                        <span className="font-medium text-gray-700">{task.assignedTo || 'Chưa phân công'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-500 text-xs">
                        <Calendar size={14} className="mr-2" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center text-xs font-bold text-gray-400">
                        <Clock size={14} className="mr-1.5" /> {task.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">Hiện tại chưa có công việc nào được tạo.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={filteredTasks.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialData={selectedTask}
      />
    </>
  );
};

export default CreateTaskPage;

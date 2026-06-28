import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  User,
  Search
} from 'lucide-react';

const TaskProgressPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get('/Tasks');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-600';
      case 'In Progress': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Theo dõi tiến độ công việc</h1>
          <p className="text-gray-500 text-sm mt-1">Bảng giám sát trạng thái thực hiện các nhiệm vụ kỹ thuật thời gian thực.</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl text-blue-600 font-bold text-sm border border-blue-100">
            <TrendingUp size={16} />
            <span>Hiệu suất: 92%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {['Pending', 'In Progress', 'Done'].map((status) => (
          <div key={status} className="flex flex-col h-full bg-gray-50/50 rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="font-black text-gray-400 uppercase text-[11px] tracking-widest flex items-center">
                {status === 'Pending' && <Clock size={14} className="mr-2" />}
                {status === 'In Progress' && <TrendingUp size={14} className="mr-2" />}
                {status === 'Done' && <CheckCircle2 size={14} className="mr-2" />}
                {status}
              </h3>
              <span className="bg-white px-2 py-0.5 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-500 shadow-sm">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>

            <div className="space-y-4 flex-grow">
              {loading ? (
                <div className="p-10 text-center text-gray-300 italic text-xs">Đang tải...</div>
              ) : tasks.filter(t => t.status === status).length > 0 ? (
                tasks.filter(t => t.status === status).map((task) => (
                  <div key={task.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                        }`}>
                            {task.priority}
                        </span>
                        <ChevronRight size={14} className="text-gray-200 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h4 className="font-bold text-gray-700 text-sm mb-4 leading-snug">{task.title}</h4>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                {task.assignedTo?.charAt(0) || 'U'}
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">{task.assignedTo}</span>
                        </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 border-2 border-dashed border-gray-100 rounded-xl text-center">
                    <p className="text-[10px] text-gray-300 italic uppercase font-bold tracking-tighter">Trống</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TaskProgressPage;

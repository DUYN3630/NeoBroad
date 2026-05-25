import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import apiClient from '@/lib/axios';
import { 
  Clock, 
  User,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';

interface WorkTask {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string;
}

const TaskProgressPage = () => {
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [loading, setLoading] = useState(true);

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

  const moveTask = async (id: number, newStatus: string) => {
    try {
        await apiClient.patch(`/Tasks/${id}/status`, JSON.stringify(newStatus), {
            headers: { 'Content-Type': 'application/json' }
        });
        fetchTasks();
    } catch (err) {
        alert('Lỗi khi chuyển trạng thái!');
    }
  };

  const renderColumn = (title: string, status: string, color: string) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className="flex flex-col h-full min-w-[300px] bg-gray-50/50 rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1a1a1a] flex items-center">
                <span className={`w-2 h-2 rounded-full bg-${color}-500 mr-2`}></span>
                {title}
                <span className="ml-2 text-xs text-gray-400 font-medium">({columnTasks.length})</span>
            </h3>
            <button className="text-gray-400"><MoreHorizontal size={16} /></button>
        </div>

        <div className="space-y-4 overflow-y-auto">
            {columnTasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                            {task.priority}
                        </span>
                        <div className="flex items-center text-[10px] text-gray-400">
                            <Clock size={10} className="mr-1" /> 2d
                        </div>
                    </div>
                    <h4 className="font-bold text-sm text-[#1a1a1a] mb-1">{task.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 italic">"{task.description}"</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-white">
                                {task.assignedTo.charAt(0)}
                            </div>
                            <span className="text-[10px] font-medium text-gray-600">{task.assignedTo}</span>
                        </div>
                        
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {status === 'To Do' && (
                                <button onClick={() => moveTask(task.id, 'In Progress')} className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><ChevronRight size={14} /></button>
                            )}
                            {status === 'In Progress' && (
                                <button onClick={() => moveTask(task.id, 'Done')} className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100"><CheckCircle2 size={14} /></button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {columnTasks.length === 0 && (
                <div className="py-8 text-center text-gray-300 text-xs italic border-2 border-dashed border-gray-100 rounded-xl">Trống</div>
            )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Bảng tiến độ công việc</h1>
        <p className="text-gray-500 text-sm mt-1">Theo dõi quy trình thực hiện task theo dạng Kanban.</p>
      </div>

      <div className="flex space-x-6 h-[calc(100vh-250px)] overflow-x-auto pb-4">
        {renderColumn("Chờ thực hiện", "To Do", "gray")}
        {renderColumn("Đang thực hiện", "In Progress", "blue")}
        {renderColumn("Hoàn thành", "Done", "green")}
      </div>
    </MainLayout>
  );
};

export default TaskProgressPage;

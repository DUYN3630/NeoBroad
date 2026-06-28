import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { 
  History, 
  User, 
  Tag, 
  Clock, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle
} from 'lucide-react';

const ActivityLogPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/Activities')
      .then(res => setLogs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'Create': return <PlusCircle size={14} className="text-green-500" />;
      case 'Update': return <Edit3 size={14} className="text-blue-500" />;
      case 'Delete': return <Trash2 size={14} className="text-red-500" />;
      case 'Success': return <CheckCircle size={14} className="text-indigo-500" />;
      default: return <History size={14} className="text-gray-400" />;
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Nhật ký hoạt động</h1>
        <p className="text-gray-500 text-sm mt-1">Ghi lại toàn bộ lịch sử tương tác của người dùng trên hệ thống.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-0">
            {loading ? (
                <div className="p-8 text-center text-gray-400">Đang tải nhật ký...</div>
            ) : (
                <div className="divide-y divide-gray-50">
                    {logs.map((log) => (
                        <div key={log.id} className="p-6 hover:bg-gray-50/50 transition-colors flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                                    {getActionIcon(log.type)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-700">
                                        <span className="text-[#0066cc] font-black">{log.user}</span> {log.action.toLowerCase()} <span className="italic text-gray-500">"{log.target}"</span>
                                    </p>
                                    <div className="flex items-center mt-1 space-x-3">
                                        <span className="flex items-center text-[11px] text-gray-400">
                                            <Clock size={12} className="mr-1" /> {log.time}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-bold uppercase tracking-tighter">
                                            {log.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-300 hover:text-gray-500 transition-colors text-xs font-bold uppercase tracking-widest">Chi tiết</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default ActivityLogPage;

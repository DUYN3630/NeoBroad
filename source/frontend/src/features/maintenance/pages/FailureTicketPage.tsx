import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FailureModal from '../components/FailureModal';
import RepairModal from '../components/RepairModal';
import apiClient from '@/lib/axios';
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  Clock, 
  User,
  CheckCircle2,
  MoreHorizontal,
  Wrench
} from 'lucide-react';

interface FailureTicket {
  id: number;
  assetId: number;
  reportedBy: string;
  description: string;
  status: string;
  reportedDate: string;
}

const FailureTicketPage = () => {
  const [failures, setFailures] = useState<FailureTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [selectedFailure, setSelectedFailure] = useState<FailureTicket | null>(null);

  const fetchFailures = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/Maintenance/Failures');
      setFailures(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFailures();
  }, []);

  const handleSaveFailure = async (data: any) => {
    try {
        await apiClient.post('/Maintenance/Failures', data);
        setIsFailureModalOpen(false);
        fetchFailures();
        alert('Đã gửi báo cáo hỏng hóc thành công!');
    } catch (err) {
        alert('Gửi báo cáo thất bại!');
    }
  };

  const handleApproveFailure = async (repairData: any) => {
    try {
        await apiClient.post('/Maintenance/ApproveFailure', repairData);
        setIsRepairModalOpen(false);
        fetchFailures(); // Cập nhật lại list (trạng thái sẽ đổi sang In Progress)
        alert('Đã phê duyệt và tạo phiếu sửa chữa!');
    } catch (err) {
        alert('Phê duyệt thất bại!');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded-full flex items-center w-fit"><Clock size={12} className="mr-1" /> Chờ duyệt</span>;
      case 'in progress':
        return <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full flex items-center w-fit"><Clock size={12} className="mr-1" /> Đang xử lý</span>;
      case 'resolved':
        return <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full flex items-center w-fit"><CheckCircle2 size={12} className="mr-1" /> Đã xử lý</span>;
      default:
        return <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-full flex items-center w-fit">{status}</span>;
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Phiếu báo hỏng thiết bị</h1>
          <p className="text-gray-500 text-sm mt-1">Nơi tiếp nhận và xử lý các sự cố thiết bị từ nhân viên.</p>
        </div>
        <button 
            onClick={() => setIsFailureModalOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm transition-all"
        >
          <AlertTriangle size={18} className="mr-2" /> Báo hỏng thiết bị
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
            <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Tìm phiếu hỏng..." className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-md text-xs w-full outline-none" />
            </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
              <th className="px-6 py-4">Mã số</th>
              <th className="px-6 py-4">Người báo</th>
              <th className="px-6 py-4">Mô tả sự cố</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [1, 2].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-6 py-8"></td></tr>)
            ) : failures.length > 0 ? (
              failures.map((f) => (
                <tr key={f.id} className="hover:bg-red-50/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-400">#FL-{f.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <User size={14} />
                        </div>
                        <span className="font-medium text-[#1a1a1a]">{f.reportedBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs italic">"{f.description}"</td>
                  <td className="px-6 py-4">{getStatusBadge(f.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {f.status === 'Pending' && (
                        <button 
                            onClick={() => { setSelectedFailure(f); setIsRepairModalOpen(true); }}
                            className="bg-blue-50 text-[#0066cc] px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-100 flex items-center ml-auto transition-all"
                        >
                            <Wrench size={14} className="mr-1.5" /> Duyệt & Sửa
                        </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Hiện tại không có báo cáo hỏng hóc nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FailureModal 
        isOpen={isFailureModalOpen}
        onClose={() => setIsFailureModalOpen(false)}
        onSave={handleSaveFailure}
      />

      <RepairModal 
        isOpen={isRepairModalOpen}
        onClose={() => setIsRepairModalOpen(false)}
        onApprove={handleApproveFailure}
        failureData={selectedFailure}
      />
    </MainLayout>
  );
};

export default FailureTicketPage;

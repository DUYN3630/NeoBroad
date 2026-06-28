import React, { useState, useEffect } from 'react';
import MaintenanceTicketModal from '../components/MaintenanceTicketModal';
import apiClient from '@/lib/axios';
import { 
  ClipboardList, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react';

interface MaintenanceTicket {
  id: string;
  assetId: string;
  technician: string;
  description: string;
  status: string;
  maintenanceDate: string;
  totalCost: number;
  verificationResult: string;
}

const MaintenanceTicketPage = () => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/Maintenance/Tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSaveTicket = async (data: any) => {
    try {
        await apiClient.post('/Maintenance/Tickets', data);
        setIsModalOpen(false);
        fetchTickets();
        alert('Ghi nhận kết quả bảo trì thành công!');
    } catch (err) {
        alert('Lưu phiếu thất bại!');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý Maintenance Ticket</h1>
          <p className="text-gray-500 text-sm mt-1">Kết quả thực hiện bảo trì và chi phí duy tu thiết bị.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="k-button-primary flex items-center text-xs uppercase"
        >
          <Plus size={18} className="mr-2" /> Lập phiếu kết quả
        </button>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="k-grid-header">
              <th className="px-6 py-3">Mã phiếu</th>
              <th className="px-6 py-3">Kỹ thuật viên</th>
              <th className="px-6 py-3">Nội dung thực hiện</th>
              <th className="px-6 py-3">Chi phí</th>
              <th className="px-6 py-3 text-center">Kết quả</th>
              <th className="px-6 py-3 text-right">Ngày lập</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="px-6 py-8"></td></tr>)
            ) : tickets.length > 0 ? (
              tickets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[#0072C6]">#MT-{t.id.substring(0, 5)}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{t.technician}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs italic">"{t.description}"</td>
                  <td className="px-6 py-4 font-bold text-orange-600 font-mono">{formatCurrency(t.totalCost)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        t.verificationResult === 'Passed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                        {t.verificationResult}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-400 font-mono text-[11px]">
                    {new Date(t.maintenanceDate).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Không tìm thấy phiếu nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <MaintenanceTicketModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTicket}
      />
    </>
  );
};

export default MaintenanceTicketPage;

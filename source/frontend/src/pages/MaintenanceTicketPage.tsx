import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import apiClient from '../api/apiClient';
import { ClipboardList, User, DollarSign, Tag } from 'lucide-react';

interface Ticket {
  id: number;
  assetName: string;
  requestDate: string;
  technician: string;
  description: string;
  cost: number;
  status: string;
}

const MaintenanceTicketPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/Maintenance/Tickets')
      .then(res => setTickets(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý Maintenance Ticket</h1>
          <p className="text-gray-500 text-sm">Danh sách các phiếu yêu cầu bảo trì và sửa chữa.</p>
        </div>
        <button className="bg-[#0066cc] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#0052a3]">
          Tạo Ticket mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Đang tải phiếu ghi...</div>
        ) : tickets.map(t => (
          <div key={t.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-[#0066cc] rounded-lg">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1a1a1a]">{t.assetName}</h3>
                  <p className="text-xs text-gray-400">Mã phiếu: #TKT-{t.id} | Ngày: {new Date(t.requestDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                t.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {t.status}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-lg border-l-4 border-gray-200">
              {t.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center text-gray-500">
                  <User size={14} className="mr-2" />
                  <span className="font-medium">{t.technician}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <DollarSign size={14} className="mr-1 text-green-500" />
                  <span className="font-bold text-gray-700">{t.cost.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>
              <button className="text-[#0066cc] text-sm font-bold hover:underline">Chi tiết phiếu</button>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default MaintenanceTicketPage;

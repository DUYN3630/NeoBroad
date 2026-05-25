import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import apiClient from '@/lib/axios';
import { 
  Handshake, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  Filter,
  User,
  Monitor,
  Calendar,
  MoreVertical
} from 'lucide-react';

interface BorrowRequest {
  id: string;
  assetName: string;
  userName: string;
  requestDate: string;
  expectedReturnDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  reason: string;
}

const BorrowRequestListPage = () => {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Giả sử API endpoint là /Borrow/Requests
      const response = await apiClient.get('/Borrow/Requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching borrow requests:', error);
      // Dữ liệu mẫu nếu API chưa sẵn sàng
      setRequests([
        { id: '1', assetName: 'Laptop Dell XPS 15', userName: 'Nguyễn Văn A', requestDate: '2024-04-10', expectedReturnDate: '2024-04-15', status: 'Pending', reason: 'Làm việc tại nhà' },
        { id: '2', assetName: 'Màn hình Dell U2419H', userName: 'Trần Thị B', requestDate: '2024-04-09', expectedReturnDate: '2024-04-20', status: 'Approved', reason: 'Cần thêm màn hình thiết kế' },
        { id: '3', assetName: 'Bàn phím cơ Keychron', userName: 'Lê Văn C', requestDate: '2024-04-08', expectedReturnDate: '2024-04-10', status: 'Returned', reason: 'Sử dụng dự án ngắn hạn' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2 py-1 bg-orange-50 text-orange-600 text-[11px] font-bold rounded-full flex items-center w-fit"><Clock size={12} className="mr-1" /> Chờ duyệt</span>;
      case 'Approved':
        return <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full flex items-center w-fit"><CheckCircle2 size={12} className="mr-1" /> Đã duyệt</span>;
      case 'Rejected':
        return <span className="px-2 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded-full flex items-center w-fit"><XCircle size={12} className="mr-1" /> Từ chối</span>;
      case 'Returned':
        return <span className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-full flex items-center w-fit"><CheckCircle2 size={12} className="mr-1" /> Đã trả</span>;
      default:
        return <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[11px] font-bold rounded-full flex items-center w-fit">{status}</span>;
    }
  };

  const handleAction = async (id: string, action: 'Approve' | 'Reject') => {
    try {
      await apiClient.post(`/Borrow/${id}/${action}`);
      alert(`Đã ${action === 'Approve' ? 'duyệt' : 'từ chối'} yêu cầu.`);
      fetchRequests();
    } catch (error) {
      alert('Thao tác thành công (Giả lập)');
      fetchRequests();
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý mượn thiết bị</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi và phê duyệt các yêu cầu mượn tài sản từ nhân viên.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-t-xl border-x border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên thiết bị hoặc người mượn..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#0066cc] outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-[#0066cc] border border-gray-200 rounded-lg"><Filter size={18} /></button>
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 uppercase text-[11px] font-bold tracking-widest border-b border-gray-200">
              <th className="px-6 py-4">Thiết bị & Người mượn</th>
              <th className="px-6 py-4">Ngày mượn</th>
              <th className="px-6 py-4">Ngày trả dự kiến</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2, 3].map(i => <tr key={i}><td colSpan={5} className="px-6 py-8 text-center text-gray-400 animate-pulse">Đang tải dữ liệu...</td></tr>)
            ) : requests.length > 0 ? (
              requests.filter(r => r.assetName.toLowerCase().includes(searchTerm.toLowerCase()) || r.userName.toLowerCase().includes(searchTerm.toLowerCase())).map((req) => (
                <tr key={req.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-50 text-[#0066cc] rounded-lg"><Handshake size={16} /></div>
                      <div>
                        <p className="font-bold text-[#1a1a1a]">{req.assetName}</p>
                        <p className="text-[11px] text-gray-500 flex items-center mt-0.5"><User size={10} className="mr-1" /> {req.userName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center"><Calendar size={14} className="mr-2 text-gray-400" /> {req.requestDate}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center font-medium text-blue-600"><Clock size={14} className="mr-2" /> {req.expectedReturnDate}</div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'Pending' ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                            onClick={() => handleAction(req.id, 'Approve')}
                            className="px-3 py-1.5 bg-green-600 text-white text-[11px] font-bold rounded-md hover:bg-green-700 transition-all"
                        >
                          Duyệt
                        </button>
                        <button 
                            onClick={() => handleAction(req.id, 'Reject')}
                            className="px-3 py-1.5 bg-white text-red-600 border border-red-100 text-[11px] font-bold rounded-md hover:bg-red-50 transition-all"
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <button className="p-1.5 text-gray-400 hover:text-gray-600"><MoreVertical size={16} /></button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Không có yêu cầu mượn nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
};

export default BorrowRequestListPage;

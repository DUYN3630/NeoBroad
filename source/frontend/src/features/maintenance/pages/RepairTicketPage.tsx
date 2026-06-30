import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Pagination from '@/components/common/Pagination';
import { 
  Calendar, 
  Clock,
  Printer,
  Search
} from 'lucide-react';

interface RepairTicket {
  id: number;
  assetId: number;
  technicianName: string;
  repairDetails: string;
  estimatedCost: number;
  status: string;
  startDate: string;
}

const RepairTicketPage = () => {
  const [repairs, setRepairs] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/Maintenance/Repairs');
      setRepairs(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handlePrint = (r: RepairTicket) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>PHIẾU SỬA CHỮA #RP-${r.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; }
            .sign { text-align: center; width: 200px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HỆ THỐNG QUẢN LÝ TÀI SẢN (AMS)</h1>
            <h2>PHIẾU SỬA CHỮA THIẾT BỊ</h2>
            <p>Mã số: #RP-${r.id}</p>
          </div>
          <div class="row"><span class="label">Ngày lập:</span> <span>${new Date(r.startDate).toLocaleDateString('vi-VN')}</span></div>
          <div class="row"><span class="label">Kỹ thuật viên:</span> <span>${r.technicianName}</span></div>
          <div class="row"><span class="label">ID Thiết bị:</span> <span>#AST-${r.assetId}</span></div>
          <div class="row"><span class="label">Nội dung sửa chữa:</span> <span>${r.repairDetails}</span></div>
          <div class="row"><span class="label">Chi phí dự kiến:</span> <span>${formatCurrency(r.estimatedCost)}</span></div>
          <div class="row"><span class="label">Trạng thái:</span> <span>${r.status}</span></div>
          
          <div class="footer">
            <div class="sign"><p>Người lập phiếu</p><br/><br/>(Ký tên)</div>
            <div class="sign"><p>Kỹ thuật viên</p><br/><br/>(Ký tên)</div>
            <div class="sign"><p>Xác nhận của Admin</p><br/><br/>(Ký tên)</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filter repairs
  const filteredRepairs = repairs.filter(r => 
    (r.technicianName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.repairDetails || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginated repairs
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRepairs = filteredRepairs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Phiếu sửa chữa thiết bị</h1>
        <p className="text-gray-500 text-sm">Theo dõi tiến độ sửa chữa và điều phối kỹ thuật viên.</p>
      </div>

      <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
            <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Tìm phiếu sửa chữa..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-md text-xs w-full outline-none" 
                />
            </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <th className="px-6 py-4">Mã phiếu</th>
              <th className="px-6 py-4">Kỹ thuật viên</th>
              <th className="px-6 py-4">Chi phí dự kiến</th>
              <th className="px-6 py-4">Ngày bắt đầu</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
            ) : currentRepairs.length > 0 ? (
              currentRepairs.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-[#0066cc]">#RP-{r.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold">
                            {r.technicianName ? r.technicianName.charAt(0) : 'U'}
                        </div>
                        <span className="font-bold text-gray-700">{r.technicianName || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-orange-600">{formatCurrency(r.estimatedCost)}</td>
                  <td className="px-6 py-4 text-gray-500 flex items-center">
                    <Calendar size={14} className="mr-2" />
                    {new Date(r.startDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full flex items-center w-fit">
                        <Clock size={12} className="mr-1" /> {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => handlePrint(r)}
                        className="p-1.5 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-md transition-all"
                        title="In phiếu sửa chữa"
                    >
                        <Printer size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Chưa có thiết bị nào đang sửa chữa.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={filteredRepairs.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default RepairTicketPage;

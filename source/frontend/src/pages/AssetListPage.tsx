import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import BorrowModal from '@/components/common/BorrowModal';
import { 
  Search, 
  Plus, 
  Laptop, 
  Monitor, 
  Printer, 
  Network,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Database,
  Handshake
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  type: string;
  status: string;
  lastMaintenance: string | null;
}

const AssetListPage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // State cho Borrow Modal
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{id: string, name: string} | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response: any = await apiClient.get('/Assets');
      setAssets(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Không thể lấy danh sách thiết bị. Vui lòng kiểm tra Backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleBorrowClick = (asset: Asset) => {
    setSelectedAsset({ id: asset.id, name: asset.name });
    setIsBorrowModalOpen(true);
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'laptop': return <Laptop size={16} className="text-blue-500" />;
      case 'monitor': return <Monitor size={16} className="text-purple-500" />;
      case 'printer': return <Printer size={16} className="text-orange-500" />;
      case 'network': return <Network size={16} className="text-green-500" />;
      default: return <Database size={16} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <span className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-full flex items-center w-fit"><CheckCircle2 size={12} className="mr-1" /> Sẵn sàng</span>;
      case 'inuse':
        return <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full flex items-center w-fit"><Handshake size={12} className="mr-1" /> Đang cho mượn</span>;
      case 'maintenance':
        return <span className="px-2 py-1 bg-orange-50 text-orange-600 text-[11px] font-bold rounded-full flex items-center w-fit"><Clock size={12} className="mr-1" /> Bảo trì</span>;
      case 'broken':
        return <span className="px-2 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded-full flex items-center w-fit"><AlertCircle size={12} className="mr-1" /> Hỏng</span>;
      default:
        return <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[11px] font-bold rounded-full flex items-center w-fit">{status}</span>;
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý thiết bị</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách toàn bộ tài sản và thiết bị trong hệ thống.</p>
        </div>
        <button className="bg-[#0066cc] hover:bg-[#0052a3] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm transition-all">
          <Plus size={18} className="mr-2" /> Thêm thiết bị
        </button>
      </div>

      <div className="bg-white p-4 rounded-t-xl border-x border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc serial number..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#0066cc] outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm flex items-center justify-center border-b border-gray-200">
            <AlertCircle size={18} className="mr-2" /> {error}
          </div>
        )}
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 uppercase text-[11px] font-bold tracking-widest border-b border-gray-200">
              <th className="px-6 py-4">Thiết bị</th>
              <th className="px-6 py-4">Loại</th>
              <th className="px-6 py-4">Serial Number</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2, 3].map(i => <tr key={i}><td colSpan={5} className="px-6 py-8 text-center text-gray-400 animate-pulse">Đang tải...</td></tr>)
            ) : filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">{getIcon(asset.type)}</div>
                      <span className="font-bold text-[#1a1a1a]">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{asset.type}</td>
                  <td className="px-6 py-4 font-mono text-[13px] text-gray-500">{asset.serialNumber}</td>
                  <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {asset.status.toLowerCase() === 'available' && (
                        <button 
                          onClick={() => handleBorrowClick(asset)}
                          className="px-3 py-1.5 bg-blue-50 text-[#0066cc] text-[11px] font-bold rounded-md hover:bg-[#0066cc] hover:text-white transition-all flex items-center"
                        >
                          <Handshake size={14} className="mr-1" /> mượn ngay
                        </button>
                      )}
                      <button className="p-1.5 text-gray-400 hover:text-[#0066cc]"><Edit size={16} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Không tìm thấy thiết bị nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <BorrowModal 
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        asset={selectedAsset}
        onSuccess={() => {
          alert('Yêu cầu mượn của bạn đã được gửi và đang chờ duyệt!');
          fetchAssets();
        }}
      />
    </>
  );
};

export default AssetListPage;

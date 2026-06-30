import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AssetModal, { Asset } from '../components/AssetModal';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import Pagination from '@/components/common/Pagination';
import { 
  Search, 
  Plus, 
  Filter, 
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
  X
} from 'lucide-react';

const API_URL = '/Assets';

const AssetListPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 0;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(API_URL);
      setAssets(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus]);

  const handleSaveAsset = async (assetData: any) => {
    try {
      if (assetData.id) {
        await apiClient.put(`${API_URL}/${assetData.id}`, assetData);
      } else {
        await apiClient.post(API_URL, assetData);
      }
      setIsModalOpen(false);
      fetchAssets();
    } catch (error) {
      alert('Lưu thất bại!');
    }
  };

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'laptop': return <Laptop size={16} className="text-blue-500" />;
      case 'monitor': return <Monitor size={16} className="text-purple-500" />;
      case 'printer': return <Printer size={16} className="text-orange-500" />;
      case 'network': return <Network size={16} className="text-green-500" />;
      default: return <Database size={16} className="text-gray-500" />;
    }
  };

  const requiresMaintenance = (asset: any) => {
    if (!asset.maintenanceIntervalMonths) return false;
    const refDateStr = asset.lastMaintenance || asset.purchaseDate || asset.createdAt;
    if (!refDateStr) return false;
    
    const refDate = new Date(refDateStr);
    refDate.setMonth(refDate.getMonth() + asset.maintenanceIntervalMonths);
    
    return refDate < new Date();
  };

  const getStatusBadge = (asset: any) => {
    const status = asset.status;
    const isOverdue = requiresMaintenance(asset);
    
    let badge;
    switch (status?.toLowerCase()) {
      case 'active':
        badge = <span className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-full flex items-center w-fit"><CheckCircle2 size={12} className="mr-1" /> Hoạt động</span>;
        break;
      case 'maintenance':
        badge = <span className="px-2 py-1 bg-orange-50 text-orange-600 text-[11px] font-bold rounded-full flex items-center w-fit"><Clock size={12} className="mr-1" /> Bảo trì</span>;
        break;
      case 'broken':
        badge = <span className="px-2 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded-full flex items-center w-fit"><AlertCircle size={12} className="mr-1" /> Hỏng</span>;
        break;
      default:
        badge = <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[11px] font-bold rounded-full flex items-center w-fit">{status}</span>;
        break;
    }

    if (isOverdue && status?.toLowerCase() !== 'maintenance' && status?.toLowerCase() !== 'broken') {
      return (
        <div className="flex flex-col gap-1">
          {badge}
          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black rounded-md flex items-center w-fit animate-pulse">
            <Clock size={10} className="mr-1" /> Trễ bảo trì
          </span>
        </div>
      );
    }

    return badge;
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || a.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || a.type === filterType;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Paginated assets
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý thiết bị</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách toàn bộ tài sản và thiết bị trong hệ thống.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setSelectedAsset(null); setIsModalOpen(true); }}
            className="bg-[#0066cc] hover:bg-[#0052a3] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm"
          >
            <Plus size={18} className="mr-2" /> Thêm thiết bị
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-t-xl border-x border-t border-gray-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Tìm theo tên hoặc serial number..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0066cc]/10 focus:border-[#0066cc] outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm font-bold transition-all ${
                    showFilter ? 'bg-blue-50 border-blue-200 text-[#0066cc]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
                <Filter size={16} />
                <span>Bộ lọc nâng cao</span>
            </button>
        </div>

        {showFilter && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap gap-6 animate-in slide-in-from-top-2 duration-200">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Loại thiết bị</label>
                    <div className="flex flex-wrap gap-2">
                        {['All', 'Laptop', 'Monitor', 'Printer', 'Network'].map(type => (
                            <button 
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                    filterType === type ? 'bg-[#0066cc] text-white' : 'bg-white text-gray-500 border border-gray-200'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Trạng thái</label>
                    <div className="flex flex-wrap gap-2">
                        {['All', 'Active', 'Maintenance', 'Broken'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                    filterStatus === status ? 'bg-[#0066cc] text-white' : 'bg-white text-gray-500 border border-gray-200'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={() => { setFilterType('All'); setFilterStatus('All'); }}
                        className="text-[11px] font-bold text-gray-400 hover:text-red-500 flex items-center mb-1"
                    >
                        <X size={14} className="mr-1" /> Xóa bộ lọc
                    </button>
                </div>
            </div>
        )}
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 uppercase text-[11px] font-bold tracking-widest border-b border-gray-200">
              <th className="px-6 py-4">Thiết bị</th>
              <th className="px-6 py-4">Mã thiết bị</th>
              <th className="px-6 py-4">Serial Number</th>
              <th className="px-6 py-4">Vị trí</th>
              <th className="px-6 py-4">Hạn bảo trì</th>
              <th className="px-6 py-4">Trạng thái</th>
              {isAdmin && <th className="px-6 py-4 text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2].map(i => <tr key={i} className="animate-pulse"><td colSpan={isAdmin ? 7 : 6} className="px-6 py-8"></td></tr>)
            ) : currentAssets.length > 0 ? (
              currentAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                        {getIcon(asset.type)}
                      </div>
                      <div>
                        <Link to={`/assets/${asset.id}`} className="font-bold text-[#1a1a1a] hover:text-[#0066cc] hover:underline transition-colors">
                          {asset.name}
                        </Link>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{asset.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[13px] font-bold text-[#0066cc]">{asset.assetCode || 'N/A'}</td>
                  <td className="px-6 py-4 font-mono text-[13px] text-gray-500">{asset.serialNumber || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{asset.location || 'Kho chính'}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                    {(() => {
                      if (!asset.maintenanceIntervalMonths) return 'N/A';
                      const refDateStr = asset.lastMaintenance || asset.purchaseDate || asset.createdAt;
                      if (!refDateStr) return 'N/A';
                      const refDate = new Date(refDateStr);
                      refDate.setMonth(refDate.getMonth() + asset.maintenanceIntervalMonths);
                      const isOverdue = refDate < new Date();
                      return (
                        <span className={isOverdue ? 'text-amber-600 font-black' : 'text-gray-500'}>
                          {refDate.toLocaleDateString('vi-VN')}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(asset)}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => { setSelectedAsset(asset); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-md transition-all"><Edit size={16} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr><td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-gray-400 italic">Không tìm thấy thiết bị nào phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={filteredAssets.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <AssetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAsset}
        initialData={selectedAsset}
      />
    </>
  );
};

export default AssetListPage;

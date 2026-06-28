import React, { useState, useEffect } from 'react';
import ToolsetModal from '../components/ToolsetModal';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { 
  Search, 
  Plus, 
  Filter, 
  Wrench,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Hammer,
  HandMetal,
  RotateCcw
} from 'lucide-react';

interface Toolset {
  id?: string;
  code: string;
  name: string;
  description: string;
  status: string;
  totalQuantity: number;
  availableQuantity: number;
  location: string;
  custodian: string;
  supplier: string;
  purchaseDate?: string;
  warrantyMonths: number;
  itemsDetail: string;
  lastMaintenanceDate?: string;
  department?: string;
}

const API_URL = '/Toolsets';

const ToolsetListPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 0;

  const [toolsets, setToolsets] = useState<Toolset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToolset, setSelectedToolset] = useState<Toolset | null>(null);

  const fetchToolsets = async () => {
    setLoading(true);
    try {
      const response: any = await apiClient.get(API_URL);
      setToolsets(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToolsets();
  }, []);

  const handleToggleStatus = async (id: string | undefined) => {
    if (!id) return;
    try {
        await apiClient.put(`${API_URL}/${id}/ToggleStatus`);
        fetchToolsets();
    } catch (err) {
        alert('Thao tác mượn/trả thất bại!');
    }
  };

  const handleSaveToolset = async (toolsetData: Toolset) => {
    try {
      if (toolsetData.id) {
        await apiClient.put(`${API_URL}/${toolsetData.id}`, toolsetData);
      } else {
        await apiClient.post(API_URL, toolsetData);
      }
      setIsModalOpen(false);
      fetchToolsets();
    } catch (error) {
      alert('Lưu dữ liệu thất bại!');
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Xóa bộ công cụ này?')) {
      await apiClient.delete(`${API_URL}/${id}`);
      fetchToolsets();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 flex items-center w-fit"><CheckCircle2 size={12} className="mr-1" /> Sẵn sàng</span>;
      case 'inuse':
        return <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 flex items-center w-fit"><HandMetal size={12} className="mr-1" /> Đang sử dụng</span>;
      default:
        return <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-full border border-gray-100 flex items-center w-fit">{status}</span>;
    }
  };

  const filteredToolsets = toolsets.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý Bộ công cụ</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi việc mượn trả dụng cụ bảo trì.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setSelectedToolset(null); setIsModalOpen(true); }}
            className="bg-[#0066cc] hover:bg-[#0052a3] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm"
          >
            <Plus size={18} className="mr-2" /> Thêm bộ công cụ
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Tên Bộ công cụ</th>
              <th className="px-6 py-4">Số lượng</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-6 py-8"></td></tr>)
            ) : filteredToolsets.length > 0 ? (
              filteredToolsets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Hammer size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a1a1a]">{t.name}</p>
                        <p className="text-[11px] text-gray-400 italic">{t.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-gray-600">
                    {t.availableQuantity} / {t.totalQuantity}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleToggleStatus(t.id)}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center transition-all ${
                            t.status === 'Available' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {t.status === 'Available' ? <><HandMetal size={14} className="mr-1.5" /> Mượn dùng</> : <><RotateCcw size={14} className="mr-1.5" /> Trả lại</>}
                      </button>
                      {isAdmin && (
                        <>
                          <button onClick={() => { setSelectedToolset(t); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">Trống.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ToolsetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveToolset}
        initialData={selectedToolset}
      />
    </>
  );
};

export default ToolsetListPage;

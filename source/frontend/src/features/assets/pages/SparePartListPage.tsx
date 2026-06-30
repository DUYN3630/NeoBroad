import React, { useState, useEffect } from 'react';
import SparePartModal from '../components/SparePartModal';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import Pagination from '@/components/common/Pagination';
import { 
  Box, 
  Plus, 
  MapPin, 
  Tag, 
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';

interface SparePart {
  id: string;
  name: string;
  category: string;
  stockQuantity: number;
  unitPrice: number;
  location: string;
  supplier?: string;
}

const SparePartListPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 0;

  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchParts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/SpareParts');
      setParts(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleSavePart = async (data: any) => {
    try {
        if (data.id) {
            await apiClient.put(`/SpareParts/${data.id}`, data);
        } else {
            await apiClient.post('/SpareParts', data);
        }
        setIsModalOpen(false);
        fetchParts();
    } catch (err) {
        alert('Lưu thất bại!');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Paginated parts
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParts = parts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Kho phụ tùng thay thế</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý linh kiện dự phòng cho công tác sửa chữa.</p>
        </div>
        {isAdmin && (
          <button 
              onClick={() => { setSelectedPart(null); setIsModalOpen(true); }}
              className="k-button-primary flex items-center text-xs uppercase"
          >
            <Plus size={18} className="mr-2" /> Nhập kho mới
          </button>
        )}
      </div>

      <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="k-grid-header">
              <th className="px-6 py-3">Linh kiện</th>
              <th className="px-6 py-3">Danh mục</th>
              <th className="px-6 py-3 text-center">Tồn kho</th>
              <th className="px-6 py-3 text-right">Đơn giá</th>
              {isAdmin && <th className="px-6 py-3 text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2].map(i => <tr key={i} className="animate-pulse"><td colSpan={isAdmin ? 5 : 4} className="px-6 py-8"></td></tr>)
            ) : currentParts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                        <p className="font-bold text-gray-700">{p.name}</p>
                        <p className="text-[10px] text-gray-400 flex items-center uppercase tracking-tighter mt-0.5"><MapPin size={10} className="mr-1" /> {p.location}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-[#0072C6] text-[10px] font-bold rounded border border-blue-100">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                        <span className={`font-mono font-bold mr-2 ${p.stockQuantity < 5 ? 'text-red-500' : 'text-gray-700'}`}>{p.stockQuantity}</span>
                        {p.stockQuantity < 5 && <AlertCircle size={14} className="text-red-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-600">{formatCurrency(p.unitPrice)}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => { setSelectedPart(p); setIsModalOpen(true); }} className="p-1 text-gray-400 hover:text-blue-600"><Edit size={16} /></button>
                          <button className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={parts.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <SparePartModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePart}
        initialData={selectedPart}
      />
    </>
  );
};

export default SparePartListPage;

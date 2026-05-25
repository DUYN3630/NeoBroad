import React, { useState } from 'react';
import { X, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../stores/authStore';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    id: string;
    name: string;
  } | null;
  onSuccess: () => void;
}

const BorrowModal = ({ isOpen, onClose, asset, onSuccess }: BorrowModalProps) => {
  const { user } = useAuthStore();
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        userId: user.id,
        expectedReturnDate: expectedReturnDate,
        purpose: purpose,
        items: [
          {
            assetId: asset.id,
            quantity: 1,
            conditionOnBorrow: "Good"
          }
        ]
      };

      await apiClient.post('/Borrow/Request', requestData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting borrow request:', err);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-[#1a1a1a]">Yêu cầu mượn thiết bị</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-md transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-[11px] text-blue-500 font-bold uppercase tracking-wider">Thiết bị đang chọn</p>
            <p className="text-sm font-bold text-blue-900">{asset.name}</p>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1 flex items-center">
              <Calendar size={14} className="mr-1" /> Ngày dự kiến trả
            </label>
            <input 
              type="date" 
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#0066cc] outline-none"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1 flex items-center">
              <MessageSquare size={14} className="mr-1" /> Mục đích mượn
            </label>
            <textarea 
              rows={3}
              required
              placeholder="Ví dụ: Sử dụng cho tiết thực hành vật lý tại phòng 101..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#0066cc] outline-none resize-none"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center">
              <AlertCircle size={16} className="mr-2" /> {error}
            </div>
          )}

          <div className="pt-4 flex space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#0066cc] text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-100 hover:bg-[#0052a3] disabled:opacity-50 transition-all"
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BorrowModal;

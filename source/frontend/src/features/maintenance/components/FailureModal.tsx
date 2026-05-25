import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, User, Info } from 'lucide-react';
import apiClient from '@/lib/axios';

interface FailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const FailureModal: React.FC<FailureModalProps> = ({ isOpen, onClose, onSave }) => {
  const [assets, setAssets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    assetId: '',
    reportedBy: 'Administrator',
    urgency: 'Medium',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/Assets').then(res => setAssets(res.data)).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded shadow-2xl w-full max-w-xl overflow-hidden border border-gray-300">
        <div className="flex items-center justify-between px-6 py-3 border-b border-red-100 bg-red-50/30">
          <h2 className="text-sm font-bold text-red-700 flex items-center uppercase tracking-wide">
            <AlertTriangle size={16} className="mr-2" /> Báo cáo sự cố thiết bị (Báo hỏng)
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label className="k-label">Thiết bị gặp sự cố <span className="text-red-500">*</span></label>
              <select required className="k-input" value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})}>
                <option value="">-- Chọn thiết bị trong danh sách --</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="k-label">Người báo cáo</label>
                    <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" disabled value={formData.reportedBy} className="k-input pl-10 bg-gray-50 cursor-not-allowed" />
                    </div>
                </div>
                <div>
                    <label className="k-label">Mức độ khẩn cấp</label>
                    <select className="k-input font-bold" value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                        <option value="Low" className="text-gray-500">Thấp (Low)</option>
                        <option value="Medium" className="text-orange-500">Trung bình (Medium)</option>
                        <option value="High" className="text-red-500">Cao (High)</option>
                        <option value="Critical" className="text-red-700">Khẩn cấp (Critical)</option>
                    </select>
                </div>
            </div>
            
            <div>
              <label className="k-label">Mô tả tình trạng lỗi chi tiết</label>
              <textarea rows={4} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="k-input resize-none" placeholder="VD: Máy tự động tắt nguồn sau 5 phút sử dụng, có khét nhẹ..." />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500 uppercase">Hủy bỏ</button>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded shadow-sm flex items-center uppercase text-xs transition-all">
              <Check size={16} className="mr-2" /> Gửi báo cáo hỏng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FailureModal;

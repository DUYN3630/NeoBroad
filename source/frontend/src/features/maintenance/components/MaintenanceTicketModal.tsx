import React, { useState, useEffect } from 'react';
import { X, Check, Save, ShieldCheck, DollarSign, User } from 'lucide-react';
import apiClient from '@/lib/axios';

interface MaintenanceTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const MaintenanceTicketModal: React.FC<MaintenanceTicketModalProps> = ({ isOpen, onClose, onSave }) => {
  const [assets, setAssets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    assetId: '',
    technician: '',
    description: '',
    totalCost: 0,
    verificationResult: 'Passed',
    maintenanceDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/Assets').then(res => setAssets(res.data)).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-300">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#f8f9fa]">
          <h2 className="text-sm font-bold text-gray-700 flex items-center uppercase tracking-wide">
            <ShieldCheck size={16} className="mr-2 text-[#0072C6]" />
            Lập phiếu kết quả bảo trì thiết bị
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="k-label">Thiết bị bảo trì <span className="text-red-500">*</span></label>
              <select required className="k-input font-bold" value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})}>
                <option value="">-- Chọn thiết bị trong danh sách --</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>)}
              </select>
            </div>

            <div>
              <label className="k-label flex items-center"><User size={12} className="mr-1" /> Kỹ thuật viên thực hiện</label>
              <input type="text" required value={formData.technician} onChange={e => setFormData({...formData, technician: e.target.value})} className="k-input" />
            </div>

            <div>
              <label className="k-label">Ngày thực hiện</label>
              <input type="date" value={formData.maintenanceDate} onChange={e => setFormData({...formData, maintenanceDate: e.target.value})} className="k-input" />
            </div>

            <div>
              <label className="k-label flex items-center"><DollarSign size={12} className="mr-1" /> Chi phí bảo trì (VNĐ)</label>
              <input type="number" required value={formData.totalCost} onChange={e => setFormData({...formData, totalCost: parseFloat(e.target.value)})} className="k-input font-mono text-right" />
            </div>

            <div>
              <label className="k-label">Kết quả kiểm định</label>
              <select value={formData.verificationResult} onChange={e => setFormData({...formData, verificationResult: e.target.value})} className="k-input font-bold text-green-600">
                <option value="Passed">Đạt chuẩn (Passed)</option>
                <option value="Failed">Không đạt (Failed)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="k-label">Nội dung bảo trì chi tiết</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="k-input resize-none" placeholder="Mô tả các hạng mục đã thực hiện..." />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500 uppercase">Hủy</button>
            <button type="submit" className="k-button-primary flex items-center uppercase text-xs">
              <Check size={16} className="mr-2" /> Hoàn tất phiếu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceTicketModal;

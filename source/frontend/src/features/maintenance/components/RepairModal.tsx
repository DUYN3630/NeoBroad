import React, { useState } from 'react';
import { X, Check, Save, Wrench, DollarSign, List, User } from 'lucide-react';

interface RepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: any) => void;
  failureData: any;
}

const RepairModal: React.FC<RepairModalProps> = ({ isOpen, onClose, onApprove, failureData }) => {
  const [formData, setFormData] = useState({
    technicianName: '',
    repairDetails: '',
    replacedParts: '',
    laborCost: 0,
    partsCost: 0,
    estimatedCompletionDate: ''
  });

  if (!isOpen || !failureData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-300">
        <div className="flex items-center justify-between px-6 py-3 border-b border-blue-200 bg-[#f8f9fa]">
          <h2 className="text-sm font-bold text-gray-700 flex items-center uppercase tracking-wide">
            <Wrench size={16} className="mr-2 text-[#0072C6]" />
            Phê duyệt & Điều phối sửa chữa thiết bị
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onApprove(formData); }} className="p-0">
          <div className="p-8 max-h-[75vh] overflow-y-auto bg-white space-y-8">
            
            {/* THÔNG TIN SỰ CỐ GỐC */}
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-[10px] font-black text-red-400 uppercase mb-1">Sự cố đang chờ xử lý:</p>
                <p className="text-sm font-medium text-red-700 italic">"{failureData.description}"</p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="col-span-2">
                    <label className="k-label flex items-center"><User size={12} className="mr-1" /> Kỹ thuật viên phụ trách sửa chữa</label>
                    <input type="text" required value={formData.technicianName} onChange={e => setFormData({...formData, technicianName: e.target.value})} className="k-input" placeholder="Nhập tên nhân viên thực hiện..." />
                </div>

                <div>
                    <label className="k-label">Ngày dự kiến hoàn thành</label>
                    <input type="date" required value={formData.estimatedCompletionDate} onChange={e => setFormData({...formData, estimatedCompletionDate: e.target.value})} className="k-input" />
                </div>

                <div className="col-span-2">
                    <label className="k-label flex items-center"><List size={12} className="mr-1" /> Danh sách linh kiện thay thế (nếu có)</label>
                    <textarea rows={2} value={formData.replacedParts} onChange={e => setFormData({...formData, replacedParts: e.target.value})} className="k-input resize-none" placeholder="VD: Màn hình Dell 24 inch (x1), Cáp nguồn (x1)..." />
                </div>

                <div>
                    <label className="k-label flex items-center"><DollarSign size={12} className="mr-1" /> Chi phí nhân công (VNĐ)</label>
                    <input type="number" required value={formData.laborCost} onChange={e => setFormData({...formData, laborCost: parseFloat(e.target.value)})} className="k-input text-right font-mono" />
                </div>

                <div>
                    <label className="k-label flex items-center"><DollarSign size={12} className="mr-1" /> Chi phí linh kiện (VNĐ)</label>
                    <input type="number" required value={formData.partsCost} onChange={e => setFormData({...formData, partsCost: parseFloat(e.target.value)})} className="k-input text-right font-mono" />
                </div>

                <div className="col-span-2">
                    <label className="k-label">Ghi chú phương án sửa chữa</label>
                    <textarea rows={3} value={formData.repairDetails} onChange={e => setFormData({...formData, repairDetails: e.target.value})} className="k-input resize-none" placeholder="Mô tả các bước xử lý kỹ thuật..." />
                </div>
            </div>
          </div>

          <div className="bg-[#f1f3f5] px-8 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500 uppercase">Hủy bỏ</button>
            <button type="submit" className="k-button-primary flex items-center uppercase text-xs">
              <Check size={16} className="mr-2" /> Phê duyệt sửa chữa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairModal;

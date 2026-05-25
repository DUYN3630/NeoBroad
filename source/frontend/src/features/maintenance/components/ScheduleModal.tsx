import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Clock, User, ShieldCheck, DollarSign, List } from 'lucide-react';
import apiClient from '@/lib/axios';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [assets, setAssets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    assetId: '',
    title: '',
    maintenanceType: 'Preventive', // Preventive, Corrective, Predictive
    startDate: '',
    endDate: '',
    priority: 'Normal',
    technician: '',
    contractor: '', // Nhà thầu thực hiện (nếu thuê ngoài)
    estimatedCost: 0,
    maintenanceCycle: 'Once',
    description: '',
    checklist: '' // Các bước kiểm tra
  });

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/Assets').then(res => setAssets(res.data)).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-300">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#f8f9fa]">
          <h2 className="text-sm font-bold text-gray-700 flex items-center uppercase tracking-wide">
            <Calendar size={16} className="mr-2 text-[#0072C6]" />
            Lập kế hoạch & Điều phối bảo trì tài sản
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
        </div>

        <div className="flex border-b border-gray-100 bg-white">
            <button type="button" onClick={() => setActiveTab('info')} className={`px-6 py-3 text-xs font-bold uppercase border-b-2 ${activeTab === 'info' ? 'border-[#0072C6] text-[#0072C6]' : 'border-transparent text-gray-400'}`}>Thông tin kế hoạch</button>
            <button type="button" onClick={() => setActiveTab('details')} className={`px-6 py-3 text-xs font-bold uppercase border-b-2 ${activeTab === 'details' ? 'border-[#0072C6] text-[#0072C6]' : 'border-transparent text-gray-400'}`}>Quy trình & Nhân sự</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="p-8 h-[65vh] overflow-y-auto bg-white">
            {activeTab === 'info' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 animate-in fade-in duration-200">
                    <div className="col-span-2">
                        <label className="k-label">Tên kế hoạch bảo trì <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="k-input" placeholder="VD: Bảo trì hệ thống máy tính phòng Kỹ thuật quý 2" />
                    </div>
                    <div>
                        <label className="k-label">Thiết bị mục tiêu</label>
                        <select required className="k-input" value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})}>
                            <option value="">-- Chọn tài sản --</option>
                            {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Loại hình bảo trì</label>
                        <select className="k-input" value={formData.maintenanceType} onChange={e => setFormData({...formData, maintenanceType: e.target.value})}>
                            <option value="Preventive">Bảo trì phòng ngừa (Định kỳ)</option>
                            <option value="Corrective">Bảo trì khắc phục (Sửa lỗi)</option>
                            <option value="Predictive">Bảo trì dự đoán</option>
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Ngày bắt đầu</label>
                        <input type="date" required className="k-input" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                    </div>
                    <div>
                        <label className="k-label">Ngày hoàn thành dự kiến</label>
                        <input type="date" className="k-input" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                    </div>
                    <div>
                        <label className="k-label">Chu kỳ lập lại</label>
                        <select className="k-input" value={formData.maintenanceCycle} onChange={e => setFormData({...formData, maintenanceCycle: e.target.value})}>
                            <option value="Once">Thực hiện một lần</option>
                            <option value="Monthly">Hàng tháng</option>
                            <option value="Quarterly">Hàng quý</option>
                            <option value="Yearly">Hàng năm</option>
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Độ ưu tiên thực hiện</label>
                        <select className="k-input font-bold" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                            <option value="Low">Thấp</option>
                            <option value="Normal">Bình thường</option>
                            <option value="High">Cao (Quan trọng)</option>
                            <option value="Urgent">Khẩn cấp</option>
                        </select>
                    </div>
                </div>
            )}

            {activeTab === 'details' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 animate-in fade-in duration-200">
                    <div>
                        <label className="k-label flex items-center"><User size={12} className="mr-1" /> Nhân viên nội bộ phụ trách</label>
                        <input type="text" className="k-input" value={formData.technician} onChange={e => setFormData({...formData, technician: e.target.value})} placeholder="Tên kỹ thuật viên..." />
                    </div>
                    <div>
                        <label className="k-label">Đơn vị thầu ngoài (nếu có)</label>
                        <input type="text" className="k-input" value={formData.contractor} onChange={e => setFormData({...formData, contractor: e.target.value})} placeholder="Tên công ty dịch vụ..." />
                    </div>
                    <div>
                        <label className="k-label flex items-center"><DollarSign size={12} className="mr-1" /> Ngân sách dự kiến (VNĐ)</label>
                        <input type="number" className="k-input text-right font-mono" value={formData.estimatedCost} onChange={e => setFormData({...formData, estimatedCost: parseFloat(e.target.value)})} />
                    </div>
                    <div className="col-span-2">
                        <label className="k-label flex items-center"><List size={12} className="mr-1" /> Quy trình kiểm tra (Checklist)</label>
                        <textarea rows={4} className="k-input resize-none font-mono text-xs" value={formData.checklist} onChange={e => setFormData({...formData, checklist: e.target.value})} placeholder="Các bước cần thực hiện..." />
                    </div>
                    <div className="col-span-2">
                        <label className="k-label">Mô tả mục tiêu bảo trì</label>
                        <textarea rows={3} className="k-input resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                </div>
            )}
          </div>

          <div className="bg-[#f1f3f5] px-8 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500 uppercase">Hủy bỏ</button>
            <button type="submit" className="k-button-primary flex items-center uppercase text-xs">
              <Check size={16} className="mr-2" /> Lưu kế hoạch bảo trì
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;

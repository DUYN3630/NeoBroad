import React, { useState, useEffect } from 'react';
import { X, Save, Info, List, MapPin, User, Calendar, Hash, Wrench } from 'lucide-react';

interface Toolset {
  id?: number;
  code: string;
  name: string;
  description: string;
  status: string;
  quantity: number;
  location: string;
  custodian: string;
  supplier: string;
  purchaseDate?: string;
  warrantyMonths: number;
  itemsDetail: string;
  lastMaintenanceDate?: string;
}

interface ToolsetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Toolset) => void;
  initialData?: Toolset | null;
}

const ToolsetModal: React.FC<ToolsetModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Toolset>({
    code: '', name: '', description: '', status: 'Available', quantity: 1,
    location: '', custodian: '', supplier: '', purchaseDate: '', warrantyMonths: 12,
    itemsDetail: '', lastMaintenanceDate: ''
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({
        code: '', name: '', description: '', status: 'Available', quantity: 1,
        location: '', custodian: '', supplier: '', purchaseDate: '', warrantyMonths: 12,
        itemsDetail: '', lastMaintenanceDate: ''
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'warrantyMonths' ? parseInt(value) || 0 : value 
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-300">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#f8f9fa]">
          <h2 className="text-sm font-bold text-gray-700 flex items-center uppercase">
            <Wrench size={16} className="mr-2 text-[#0072C6]" />
            {initialData ? `Chỉnh sửa dụng cụ: ${initialData.code}` : 'Khai báo bộ dụng cụ kỹ thuật mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
        </div>

        <div className="flex border-b border-gray-100 bg-white">
            <button type="button" onClick={() => setActiveTab('general')} className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 ${activeTab === 'general' ? 'border-[#0072C6] text-[#0072C6] bg-blue-50/50' : 'border-transparent text-gray-400'}`}>Thông tin quản lý</button>
            <button type="button" onClick={() => setActiveTab('items')} className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 ${activeTab === 'items' ? 'border-[#0072C6] text-[#0072C6] bg-blue-50/50' : 'border-transparent text-gray-400'}`}>Danh mục vật tư bên trong</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="p-8 h-[55vh] overflow-y-auto bg-white">
            {activeTab === 'general' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <div>
                        <label className="k-label">Mã bộ dụng cụ <span className="text-red-500">*</span></label>
                        <input type="text" name="code" required value={formData.code} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Tên bộ dụng cụ <span className="text-red-500">*</span></label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Người chịu trách nhiệm</label>
                        <input type="text" name="custodian" value={formData.custodian} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Vị trí lưu kho</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Số lượng</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Trạng thái</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="k-input">
                            <option value="Available">Sẵn sàng</option>
                            <option value="InUse">Đang sử dụng</option>
                            <option value="Broken">Đã hỏng</option>
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Nhà cung cấp</label>
                        <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Ngày mua</label>
                        <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="k-input" />
                    </div>
                </div>
            )}

            {activeTab === 'items' && (
                <div className="space-y-4">
                    <label className="k-label">Kê khai chi tiết các dụng cụ bên trong (Mỗi dòng một mục)</label>
                    <textarea 
                        name="itemsDetail"
                        rows={10}
                        value={formData.itemsDetail}
                        onChange={handleChange}
                        className="k-input font-mono text-xs leading-relaxed"
                        placeholder="VD:&#10;1. Tua vít Bake (x2)&#10;2. Kềm cắt (x1)&#10;3. Đồng hồ vạn năng (x1)"
                    />
                </div>
            )}
          </div>

          <div className="bg-[#f1f3f5] px-8 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500 uppercase">Hủy</button>
            <button type="submit" className="k-button-primary flex items-center uppercase text-xs">
              <Save size={16} className="mr-2" /> Lưu bộ dụng cụ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToolsetModal;

import React, { useState, useEffect } from 'react';
import { X, Save, Info, List, MapPin, User, Calendar, Hash, Wrench } from 'lucide-react';
import apiClient from '@/lib/axios';

interface UserOption {
  id: string;
  fullName: string;
  email: string;
}

export interface Toolset {
  id?: string;
  code: string;
  name: string;
  description: string;
  status: string;
  totalQuantity: number;
  availableQuantity?: number;
  location: string;
  custodian: string;
  supplier: string;
  purchaseDate?: string;
  warrantyMonths: number;
  itemsDetail: string;
  lastMaintenanceDate?: string;
  department?: string;
}

interface ToolsetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Toolset) => void;
  initialData?: Toolset | null;
}

const ToolsetModal: React.FC<ToolsetModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [formData, setFormData] = useState<Toolset>({
    code: '', name: '', description: '', status: 'Available', totalQuantity: 1,
    location: '', custodian: '', supplier: '', purchaseDate: '', warrantyMonths: 12,
    itemsDetail: '', lastMaintenanceDate: '', department: ''
  });

  // Fetch users from API for custodian dropdown
  useEffect(() => {
    if (isOpen) {
      apiClient.get('/Users')
        .then(res => {
          if (Array.isArray(res.data)) {
            setUsers(res.data);
          }
        })
        .catch(err => console.error('Error fetching users for custodian select:', err));
    }
  }, [isOpen]);

  const handleAutoGenerateCode = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const generatedCode = `TLS-${year}-${randomNum}`;
    setFormData(prev => ({
      ...prev,
      code: generatedCode
    }));
  };

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({
        code: '', name: '', description: '', status: 'Available', totalQuantity: 1,
        location: '', custodian: '', supplier: '', purchaseDate: '', warrantyMonths: 12,
        itemsDetail: '', lastMaintenanceDate: '', department: ''
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'totalQuantity' || name === 'warrantyMonths' ? parseInt(value) || 0 : value 
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
                        <div className="flex space-x-2">
                          <input type="text" name="code" required value={formData.code || ''} onChange={handleChange} className="k-input flex-grow" placeholder="VD: TLS-2024-001" />
                          <button 
                            type="button" 
                            onClick={handleAutoGenerateCode}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs font-bold text-gray-700 transition-colors uppercase whitespace-nowrap"
                          >
                            Tự tạo mã
                          </button>
                        </div>
                    </div>
                    <div>
                        <label className="k-label">Tên bộ dụng cụ <span className="text-red-500">*</span></label>
                        <input type="text" name="name" required value={formData.name || ''} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Phòng ban quản lý</label>
                        <select name="department" value={formData.department || ''} onChange={handleChange} className="k-input">
                            <option value="">-- Chọn phòng ban --</option>
                            <option value="Phòng Kỹ thuật">Phòng Kỹ thuật</option>
                            <option value="Phòng Hành chính">Phòng Hành chính</option>
                            <option value="Phòng Kế toán">Phòng Kế toán</option>
                            <option value="Phòng Nhân sự">Phòng Nhân sự</option>
                            <option value="Phòng Đào tạo">Phòng Đào tạo</option>
                            <option value="Bộ phận Kho">Bộ phận Kho</option>
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Người chịu trách nhiệm</label>
                        <select name="custodian" value={formData.custodian || ''} onChange={handleChange} className="k-input">
                            <option value="">-- Chọn người chịu trách nhiệm --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.fullName}>{u.fullName}</option>
                            ))}
                            {users.length === 0 && (
                                <>
                                    <option value="Nguyễn Văn A">Nguyễn Văn A (IT)</option>
                                    <option value="Trần Thị B">Trần Thị B (Hành chính)</option>
                                    <option value="Lê Văn C">Lê Văn C (Kỹ thuật)</option>
                                </>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Vị trí lưu kho</label>
                        <select name="location" value={formData.location || ''} onChange={handleChange} className="k-input">
                            <option value="">-- Chọn vị trí lưu kho --</option>
                            <option value="Kho kỹ thuật - Tầng 1">Kho kỹ thuật - Tầng 1</option>
                            <option value="Kho tổng - Tầng B1">Kho tổng - Tầng B1</option>
                            <option value="Phòng Lab - Tòa A">Phòng Lab - Tòa A</option>
                            <option value="Phòng Lab - Tòa B">Phòng Lab - Tòa B</option>
                            <option value="Phòng Kỹ thuật">Phòng Kỹ thuật</option>
                            <option value="Kho phụ tùng">Kho phụ tùng</option>
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Số lượng</label>
                        <input type="number" name="totalQuantity" value={formData.totalQuantity ?? 1} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Trạng thái</label>
                        <select name="status" value={formData.status || 'Available'} onChange={handleChange} className="k-input">
                            <option value="Available">Sẵn sàng</option>
                            <option value="InUse">Đang sử dụng</option>
                            <option value="Broken">Đã hỏng</option>
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Nhà cung cấp</label>
                        <input type="text" name="supplier" value={formData.supplier || ''} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Ngày mua</label>
                        <input type="date" name="purchaseDate" value={formatDateForInput(formData.purchaseDate)} onChange={handleChange} className="k-input" />
                    </div>
                </div>
            )}

            {activeTab === 'items' && (
                <div className="space-y-4">
                    <label className="k-label">Kê khai chi tiết các dụng cụ bên trong (Mỗi dòng một mục)</label>
                    <textarea 
                        name="itemsDetail"
                        rows={10}
                        value={formData.itemsDetail || ''}
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

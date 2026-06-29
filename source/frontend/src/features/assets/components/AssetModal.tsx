import React, { useState, useEffect } from 'react';
import { X, Save, Info, ShoppingCart, Cpu, MapPin, ShieldCheck, FileText } from 'lucide-react';
import apiClient from '@/lib/axios';

export interface Asset {
  id?: string;
  assetCode: string;
  name: string;
  model: string;
  serialNumber: string;
  type: string;
  status: string;
  department: string;
  location: string;
  custodian: string;
  manufacturer: string;
  supplier: string;
  invoiceNumber: string;
  price: number;
  purchaseDate?: string;
  warrantyMonths: number;
  warrantyExpiration?: string;
  technicalSpecs: string;
  notes: string;
  maintenanceIntervalMonths: number;
  assignedTechnicianId?: string;
  lastMaintenance?: string;
  createdAt?: string;
}

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => void;
  initialData?: Asset | null;
}

interface UserOption {
  id: string;
  fullName: string;
  email: string;
}

const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [formData, setFormData] = useState<Asset>({
    assetCode: '', name: '', model: '', serialNumber: '', type: 'Laptop', status: 'Active',
    department: '', location: '', custodian: '', manufacturer: '', supplier: '', invoiceNumber: '',
    price: 0, purchaseDate: '', warrantyMonths: 12, warrantyExpiration: '', technicalSpecs: '', notes: '',
    maintenanceIntervalMonths: 6, assignedTechnicianId: ''
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

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({
        assetCode: '', name: '', model: '', serialNumber: '', type: 'Laptop', status: 'Active',
        department: '', location: '', custodian: '', manufacturer: '', supplier: '', invoiceNumber: '',
        price: 0, purchaseDate: '', warrantyMonths: 12, warrantyExpiration: '', technicalSpecs: '', notes: '',
        maintenanceIntervalMonths: 6, assignedTechnicianId: ''
    });
  }, [initialData, isOpen]);

  // Auto calculate warranty expiration date
  useEffect(() => {
    if (formData.purchaseDate && formData.warrantyMonths) {
      const pDate = new Date(formData.purchaseDate);
      if (!isNaN(pDate.getTime())) {
        pDate.setMonth(pDate.getMonth() + formData.warrantyMonths);
        const expString = pDate.toISOString().split('T')[0];
        if (formData.warrantyExpiration !== expString) {
          setFormData(prev => ({
            ...prev,
            warrantyExpiration: expString
          }));
        }
      }
    } else {
      if (formData.warrantyExpiration !== '') {
        setFormData(prev => ({
          ...prev,
          warrantyExpiration: ''
        }));
      }
    }
  }, [formData.purchaseDate, formData.warrantyMonths]);

  if (!isOpen) return null;

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: (name === 'price' || name === 'warrantyMonths') ? parseFloat(value) || 0 : value 
    }));
  };

  const handleAutoGenerateCode = () => {
    const prefixMap: { [key: string]: string } = {
      'Laptop': 'LAP',
      'Monitor': 'MON',
      'Printer': 'PRN',
      'Network': 'NET',
      'Server': 'SRV'
    };
    const prefix = prefixMap[formData.type || 'Laptop'] || 'AST';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const generatedCode = `${prefix}-${year}-${randomNum}`;
    setFormData(prev => ({
      ...prev,
      assetCode: generatedCode
    }));
  };

  const TabButton = ({ id, label, icon }: {id: string, label: string, icon: any}) => (
    <button 
        type="button"
        onClick={() => setActiveTab(id)}
        className={`flex items-center px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === id ? 'border-[#0072C6] text-[#0072C6] bg-blue-50/50' : 'border-transparent text-gray-400 hover:text-gray-600'
        }`}
    >
        {React.cloneElement(icon, { size: 14, className: 'mr-2' })}
        {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-300">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#f8f9fa]">
          <h2 className="text-sm font-bold text-gray-700 flex items-center uppercase">
            <FileText size={16} className="mr-2 text-[#0072C6]" />
            {initialData ? `Cập nhật tài sản: ${initialData.assetCode}` : 'Khai báo tài sản hệ thống mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-100 bg-white">
            <TabButton id="general" label="Thông tin chung" icon={<Info />} />
            <TabButton id="purchase" label="Mua hàng & Vị trí" icon={<ShoppingCart />} />
            <TabButton id="specs" label="Kỹ thuật & Ghi chú" icon={<Cpu />} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="p-8 h-[60vh] overflow-y-auto bg-white">
            
            {/* TAB 1: THÔNG TIN CHUNG */}
            {activeTab === 'general' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 animate-in fade-in duration-200">
                    <div>
                        <label className="k-label">Mã tài sản <span className="text-red-500">*</span></label>
                        <div className="flex space-x-2">
                          <input type="text" name="assetCode" required value={formData.assetCode || ''} onChange={handleChange} className="k-input flex-grow" placeholder="VD: AST-2024-001" />
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
                        <label className="k-label">Tên thiết bị <span className="text-red-500">*</span></label>
                        <input type="text" name="name" required value={formData.name || ''} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Model / Dòng máy</label>
                        <input type="text" name="model" value={formData.model || ''} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Serial Number</label>
                        <input type="text" name="serialNumber" value={formData.serialNumber || ''} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Loại tài sản</label>
                        <select name="type" value={formData.type || 'Laptop'} onChange={handleChange} className="k-input">
                            <option value="Laptop">Máy tính xách tay (Laptop)</option>
                            <option value="Monitor">Màn hình (Monitor)</option>
                            <option value="Printer">Máy in / Scan</option>
                            <option value="Network">Thiết bị mạng (Router/Switch)</option>
                            <option value="Server">Máy chủ (Server)</option>
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Trạng thái vận hành</label>
                        <select name="status" value={formData.status || 'Active'} onChange={handleChange} className="k-input font-bold text-[#0072C6]">
                            <option value="Active">Đang hoạt động</option>
                            <option value="Maintenance">Đang bảo trì</option>
                            <option value="Broken">Hỏng hóc / Chờ sửa</option>
                            <option value="Disposed">Đã thanh lý</option>
                        </select>
                    </div>
                </div>
            )}

            {/* TAB 2: MUA HÀNG & VỊ TRÍ */}
            {activeTab === 'purchase' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 animate-in fade-in duration-200">
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
                        <label className="k-label">Người sử dụng / Giữ máy</label>
                        <select name="custodian" value={formData.custodian || ''} onChange={handleChange} className="k-input">
                            <option value="">-- Chọn người sử dụng --</option>
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
                    <div className="col-span-2">
                        <label className="k-label">Vị trí lắp đặt chi tiết</label>
                        <div className="relative">
                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="k-input pl-10" placeholder="VD: Tòa nhà A, Phòng 302, Kệ 1" />
                        </div>
                    </div>
                    <div>
                        <label className="k-label">Nhà sản xuất</label>
                        <input type="text" name="manufacturer" value={formData.manufacturer || ''} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Nhà cung cấp (Supplier)</label>
                        <input type="text" name="supplier" value={formData.supplier || ''} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Giá trị tài sản (VNĐ)</label>
                        <input type="number" name="price" value={formData.price ?? 0} onChange={handleChange} className="k-input text-right font-mono font-bold" />
                        {(formData.price ?? 0) > 0 && (
                          <span className="text-[11px] text-green-600 font-bold block mt-1">
                            Định dạng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.price ?? 0)}
                          </span>
                        )}
                    </div>
                    <div>
                        <label className="k-label">Số hóa đơn mua hàng</label>
                        <input type="text" name="invoiceNumber" value={formData.invoiceNumber || ''} onChange={handleChange} className="k-input" />
                    </div>
                </div>
            )}

            {/* TAB 3: KỸ THUẬT & GHI CHÚ */}
            {activeTab === 'specs' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="k-label">Ngày mua hàng</label>
                            <input type="date" name="purchaseDate" value={formatDateForInput(formData.purchaseDate)} onChange={handleChange} className="k-input" />
                        </div>
                        <div>
                            <label className="k-label">Thời hạn bảo hành (Tháng)</label>
                            <input type="number" name="warrantyMonths" value={formData.warrantyMonths ?? 12} onChange={handleChange} className="k-input" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="k-label">Chu kỳ bảo trì định kỳ</label>
                            <select name="maintenanceIntervalMonths" value={formData.maintenanceIntervalMonths ?? 6} onChange={handleChange} className="k-input">
                                <option value={3}>3 Tháng</option>
                                <option value={6}>6 Tháng</option>
                                <option value={12}>12 Tháng</option>
                                <option value={24}>24 Tháng</option>
                            </select>
                        </div>
                        <div>
                            <label className="k-label">Kỹ thuật viên phụ trách</label>
                            <select name="assignedTechnicianId" value={formData.assignedTechnicianId || ''} onChange={handleChange} className="k-input">
                                <option value="">-- Chưa gán kỹ thuật viên --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                                ))}
                              </select>
                        </div>
                    </div>
                    <div>
                        <label className="k-label text-gray-500">Ngày hết hạn bảo hành (Tự động tính)</label>
                        <input type="date" name="warrantyExpiration" value={formatDateForInput(formData.warrantyExpiration)} readOnly className="k-input bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed font-bold" />
                    </div>
                    <div>
                        <label className="k-label flex items-center"><Cpu size={12} className="mr-1" /> Thông số kỹ thuật chi tiết</label>
                        <textarea name="technicalSpecs" rows={4} value={formData.technicalSpecs || ''} onChange={handleChange} className="k-input resize-none font-mono text-xs" placeholder="VD: CPU i7-12700H, RAM 16GB, SSD 512GB..." />
                    </div>
                    <div>
                        <label className="k-label">Ghi chú bổ sung</label>
                        <textarea name="notes" rows={3} value={formData.notes || ''} onChange={handleChange} className="k-input resize-none" />
                    </div>
                </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="bg-[#f1f3f5] px-8 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 uppercase">Hủy bỏ</button>
            <button type="submit" className="k-button-primary flex items-center uppercase text-xs">
              <Save size={16} className="mr-2" /> Lưu toàn bộ thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;

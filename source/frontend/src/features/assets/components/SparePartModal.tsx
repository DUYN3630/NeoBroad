import React, { useState, useEffect } from 'react';
import { X, Save, Box, Tag, MapPin, DollarSign } from 'lucide-react';

interface SparePart {
  id?: string;
  name: string;
  category: string;
  stockQuantity: number;
  unitPrice: number;
  location: string;
  supplier?: string;
}

interface SparePartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SparePart) => void;
  initialData?: SparePart | null;
}

const SparePartModal: React.FC<SparePartModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<SparePart>({
    name: '',
    category: 'RAM',
    stockQuantity: 0,
    unitPrice: 0,
    location: '',
    supplier: ''
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ name: '', category: 'RAM', stockQuantity: 0, unitPrice: 0, location: '', supplier: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-300">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#f8f9fa]">
          <h2 className="text-sm font-bold text-gray-700 flex items-center uppercase">
            <Box size={16} className="mr-2 text-[#0072C6]" />
            {initialData ? 'Cập nhật linh kiện' : 'Nhập kho linh kiện mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="k-label">Tên linh kiện / Phụ tùng <span className="text-red-500">*</span></label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="k-input" placeholder="VD: RAM DDR4 8GB Kingston" />
            </div>
            <div>
              <label className="k-label">Danh mục</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="k-input">
                <option value="RAM">Bộ nhớ (RAM)</option>
                <option value="Storage">Ổ cứng (SSD/HDD)</option>
                <option value="Display">Màn hình</option>
                <option value="Battery">Pin / Nguồn</option>
                <option value="Other">Khác</option>
              </select>
            </div>
            <div>
              <label className="k-label">Vị trí trong kho</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="k-input" placeholder="VD: Kệ A1, Tủ 2" />
            </div>
            <div>
              <label className="k-label">Số lượng nhập</label>
              <input type="number" required value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: parseInt(e.target.value)})} className="k-input font-bold" />
            </div>
            <div>
              <label className="k-label">Đơn giá nhập (VNĐ)</label>
              <input type="number" required value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value)})} className="k-input text-right font-mono" />
            </div>
            <div className="col-span-2">
              <label className="k-label">Nhà cung cấp</label>
              <input type="text" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="k-input" />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500 uppercase">Hủy</button>
            <button type="submit" className="k-button-primary flex items-center uppercase text-xs">
              <Save size={16} className="mr-2" /> Lưu vào kho
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SparePartModal;

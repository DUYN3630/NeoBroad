import React, { useState, useEffect } from 'react';
import { X, Save, Shield, CheckSquare, Square, Info } from 'lucide-react';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    permissions: [] as string[]
  });

  const permissionList = [
    { id: 'assets.view', label: 'Xem danh sách thiết bị' },
    { id: 'assets.create', label: 'Thêm thiết bị mới' },
    { id: 'assets.edit', label: 'Chỉnh sửa thiết bị' },
    { id: 'assets.delete', label: 'Xóa thiết bị' },
    { id: 'tickets.manage', label: 'Quản lý phiếu (Tickets)' },
    { id: 'tasks.assign', label: 'Giao việc cho nhân viên' },
    { id: 'admin.users', label: 'Quản lý người dùng' },
    { id: 'admin.roles', label: 'Cấu hình vai trò & Quyền' },
  ];

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ name: '', code: '', description: '', permissions: [] });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const togglePermission = (id: string) => {
    setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(id) 
            ? prev.permissions.filter(p => p !== id) 
            : [...prev.permissions, id]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-300">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#f8f9fa]">
          <h2 className="text-sm font-bold text-gray-700 flex items-center uppercase">
            <Shield size={16} className="mr-2 text-[#0072C6]" />
            {initialData ? 'Cấu hình quyền hạn vai trò' : 'Thiết lập vai trò mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-5">
                <h3 className="text-[11px] font-black text-[#0072C6] uppercase border-b border-blue-50 pb-2">Thông tin vai trò</h3>
                <div>
                    <label className="k-label">Tên vai trò <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="k-input" placeholder="VD: Kỹ thuật viên trưởng" />
                </div>
                <div>
                    <label className="k-label">Mã định danh (Code)</label>
                    <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="k-input font-mono" placeholder="VD: TECH_LEAD" />
                </div>
                <div>
                    <label className="k-label">Mô tả chức năng</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="k-input resize-none" />
                </div>
            </div>

            <div className="space-y-5">
                <h3 className="text-[11px] font-black text-[#0072C6] uppercase border-b border-blue-50 pb-2">Phân quyền chi tiết</h3>
                <div className="max-h-[30vh] overflow-y-auto space-y-2 pr-2">
                    {permissionList.map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => togglePermission(p.id)}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
                        >
                            <span className="text-xs font-bold text-gray-600">{p.label}</span>
                            {formData.permissions.includes(p.id) 
                                ? <CheckSquare size={18} className="text-[#0072C6]" /> 
                                : <Square size={18} className="text-gray-300" />
                            }
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500 uppercase">Hủy bỏ</button>
            <button type="submit" className="k-button-primary flex items-center uppercase text-xs">
              <Save size={16} className="mr-2" /> Lưu cấu hình vai trò
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;

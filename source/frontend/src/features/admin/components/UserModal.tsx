import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield, Phone, MapPin, Briefcase, Lock, Key, Calendar } from 'lucide-react';

interface AmsUser {
  id?: string;
  username: string;
  email: string;
  fullName: string;
  employeeCode: string;
  roleName: string;
  department: string;
  jobTitle: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  isActive: boolean;
  password?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AmsUser) => void;
  initialData?: AmsUser | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState<AmsUser>({
    username: '', email: '', fullName: '', employeeCode: '', roleName: 'Student',
    department: '', jobTitle: '', phoneNumber: '', address: '', dateOfBirth: '',
    gender: 'Male', isActive: true, password: ''
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({
        username: '', email: '', fullName: '', employeeCode: '', roleName: 'Student',
        department: '', jobTitle: '', phoneNumber: '', address: '', dateOfBirth: '',
        gender: 'Male', isActive: true, password: ''
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-300">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#f8f9fa]">
          <h2 className="text-sm font-bold text-gray-700 flex items-center uppercase">
            <User size={16} className="mr-2 text-[#0072C6]" />
            {initialData ? `Cập nhật thành viên: ${initialData.username}` : 'Thêm thành viên hệ thống mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-100 bg-white">
            <button type="button" onClick={() => setActiveTab('account')} className={`px-6 py-3 text-xs font-bold uppercase border-b-2 ${activeTab === 'account' ? 'border-[#0072C6] text-[#0072C6]' : 'border-transparent text-gray-400'}`}>Tài khoản & Phân quyền</button>
            <button type="button" onClick={() => setActiveTab('profile')} className={`px-6 py-3 text-xs font-bold uppercase border-b-2 ${activeTab === 'profile' ? 'border-[#0072C6] text-[#0072C6]' : 'border-transparent text-gray-400'}`}>Thông tin cá nhân</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="p-8 h-[60vh] overflow-y-auto bg-white">
            
            {/* TAB 1: TÀI KHOẢN & PHÂN QUYỀN */}
            {activeTab === 'account' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 animate-in fade-in duration-200">
                    <div>
                        <label className="k-label">Tên đăng nhập <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" name="username" required value={formData.username} onChange={handleChange} className="k-input pl-10" />
                        </div>
                    </div>
                    <div>
                        <label className="k-label">Họ và tên đầy đủ <span className="text-red-500">*</span></label>
                        <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="k-input" />
                    </div>
                    {!initialData && (
                        <div>
                            <label className="k-label">Mật khẩu khởi tạo <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="k-input pl-10" />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="k-label">Email công việc <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="k-input pl-10" />
                        </div>
                    </div>
                    <div>
                        <label className="k-label">Vai trò (Role)</label>
                        <select name="roleName" value={formData.roleName} onChange={handleChange} className="k-input font-bold text-[#0072C6]">
                            <option value="Admin">Quản trị viên (Admin - Role 0)</option>
                            <option value="Staff">Kỹ thuật viên / Thủ kho (Staff - Role 1)</option>
                            <option value="Teacher">Giảng viên (Teacher - Role 2)</option>
                            <option value="Student">Sinh viên (Student - Role 3)</option>
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Phòng ban</label>
                        <input type="text" name="department" value={formData.department} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Chức danh</label>
                        <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="k-input" />
                    </div>
                    <div className="flex items-center space-x-2 pt-4">
                        <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-[#0072C6]" />
                        <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Kích hoạt tài khoản</label>
                    </div>
                </div>
            )}

            {/* TAB 2: THÔNG TIN CÁ NHÂN */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 animate-in fade-in duration-200">
                    <div>
                        <label className="k-label">Mã nhân viên</label>
                        <input type="text" name="employeeCode" value={formData.employeeCode} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Số điện thoại</label>
                        <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Ngày sinh</label>
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Giới tính</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="k-input">
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                            <option value="Other">Khác</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="k-label">Địa chỉ cư trú</label>
                        <div className="relative">
                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="k-input pl-10" />
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="bg-[#f1f3f5] px-8 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 uppercase">Hủy bỏ</button>
            <button type="submit" className="k-button-primary flex items-center uppercase text-xs">
              <Save size={16} className="mr-2" /> Lưu thông tin người dùng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;

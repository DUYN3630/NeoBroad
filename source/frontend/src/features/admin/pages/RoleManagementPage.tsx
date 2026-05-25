import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import RoleModal from '../components/RoleModal';
import apiClient from '@/lib/axios';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2,
  Lock,
  MoreHorizontal
} from 'lucide-react';

const RoleManagementPage = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/Roles');
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSaveRole = async (data: any) => {
    try {
        await apiClient.post('/Roles', data);
        setIsModalOpen(false);
        fetchRoles();
        alert('Cập nhật vai trò thành công!');
    } catch (err) {
        alert('Lưu thất bại!');
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý Vai trò & Quyền</h1>
          <p className="text-gray-500 text-sm mt-1">Thiết lập các nhóm quyền hạn cho từng chức danh công việc.</p>
        </div>
        <button 
            onClick={() => { setSelectedRole(null); setIsModalOpen(true); }}
            className="k-button-primary flex items-center text-xs uppercase"
        >
          <Plus size={18} className="mr-2" /> Thêm vai trò mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            [1, 2].map(i => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-2xl border border-gray-100"></div>)
        ) : roles.map((role) => (
            <div key={role.id} className="bg-white rounded p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 text-[#0072C6] rounded">
                        <Shield size={24} />
                    </div>
                    <div className="flex space-x-1">
                        <button onClick={() => { setSelectedRole(role); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit size={16} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-700 mb-1">{role.name}</h3>
                <p className="text-[11px] font-mono text-gray-400 mb-3 uppercase tracking-widest">{role.code || 'NO_CODE'}</p>
                <p className="text-xs text-gray-500 mb-6 line-clamp-2">{role.description}</p>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Quyền hạn đã cấp:</p>
                    <div className="flex flex-wrap gap-1">
                        {role.permissions === 'all' ? (
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-bold rounded uppercase">Toàn quyền</span>
                        ) : (
                            role.permissions?.split(',').slice(0, 3).map((p:string, idx:number) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded uppercase">{p.trim()}</span>
                            ))
                        )}
                        {role.permissions?.split(',').length > 3 && <span className="text-[9px] text-gray-400 font-bold ml-1">...</span>}
                    </div>
                </div>
            </div>
        ))}
      </div>

      <RoleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
        initialData={selectedRole}
      />
    </MainLayout>
  );
};

export default RoleManagementPage;

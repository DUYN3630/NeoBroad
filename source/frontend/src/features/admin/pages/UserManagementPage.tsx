import React, { useState, useEffect } from 'react';
import UserModal from '../components/UserModal';
import apiClient from '@/lib/axios';
import Pagination from '@/components/common/Pagination';
import { 
  User, 
  Mail, 
  Shield, 
  Plus, 
  Trash2, 
  Edit,
  Search,
  CheckCircle2,
  XCircle,
  Hash,
  Briefcase
} from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/Users');
      setUsers(res.data);
      setCurrentPage(1); // Reset page on data load
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (data: any) => {
    try {
        if (data.id) {
            await apiClient.put(`/Users/${data.id}`, data);
        } else {
            await apiClient.post('/Users', data);
        }
        setIsModalOpen(false);
        fetchUsers();
        alert('Cập nhật người dùng thành công!');
    } catch (err) {
        alert('Lưu thất bại!');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xóa người dùng này khỏi hệ thống?')) {
        await apiClient.delete(`/Users/${id}`);
        fetchUsers();
    }
  };

  // Paginated users
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý người dùng</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý danh sách nhân viên và thiết lập tài khoản truy cập.</p>
        </div>
        <button 
            onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
            className="k-button-primary flex items-center text-xs uppercase"
        >
          <Plus size={18} className="mr-2" /> Thêm thành viên
        </button>
      </div>

      <div className="bg-white rounded-t-xl shadow-sm border-t border-x border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="k-grid-header">
              <th className="px-6 py-3">Thành viên</th>
              <th className="px-6 py-3">Thông tin công việc</th>
              <th className="px-6 py-3 text-center">Vai trò</th>
              <th className="px-6 py-3 text-center">Trạng thái</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-6 py-8"></td></tr>)
            ) : currentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0072C6] font-bold border border-blue-100">
                            {u.fullName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-700">{u.fullName}</p>
                            <p className="text-[11px] text-gray-400 flex items-center"><Mail size={10} className="mr-1" /> {u.email}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-gray-600 flex items-center"><Briefcase size={12} className="mr-1 text-gray-400" /> {u.jobTitle || 'N/A'}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-0.5">{u.department || 'Phòng ban trống'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded border border-gray-200 uppercase">{u.roleName}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.isActive ? (
                        <span className="flex items-center justify-center text-green-600 text-[10px] font-bold"><CheckCircle2 size={14} className="mr-1" /> Hoạt động</span>
                    ) : (
                        <span className="flex items-center justify-center text-red-400 text-[10px] font-bold"><XCircle size={14} className="mr-1" /> Khóa</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => { setSelectedUser(u); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={users.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        initialData={selectedUser}
      />
    </>
  );
};

export default UserManagementPage;

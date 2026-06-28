import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/axios';
import { useToastStore } from '@/components/ToastNotification';
import { 
  Megaphone, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Plus, 
  X, 
  Calendar,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: number; // 0: Normal, 1: Important, 2: Urgent
  isPublished: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  authorName: string;
}

const AnnouncementManagementPage = () => {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState(0); // 0: Normal, 1: Important, 2: Urgent
  const [isPublished, setIsPublished] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response: any = await apiClient.get('/Announcements/admin');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Fetch announcements error:', error);
      useToastStore.getState().addToast({
        title: 'Lỗi tải dữ liệu',
        message: 'Không thể kết nối đến máy chủ để tải danh sách thông báo.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setPriority(0);
    setIsPublished(true);
    setExpiresAt('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (a: Announcement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setPriority(a.priority);
    setIsPublished(a.isPublished);
    setExpiresAt(a.expiresAt ? new Date(a.expiresAt).toISOString().split('T')[0] : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        authorId: user?.id,
        title,
        content,
        priority,
        isPublished,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
      };

      if (editingId) {
        await apiClient.put(`/Announcements/${editingId}`, payload);
        useToastStore.getState().addToast({
          title: '📢 Cập nhật thành công',
          message: 'Thông báo đã được sửa đổi.',
          type: 'success'
        });
      } else {
        await apiClient.post('/Announcements', payload);
        useToastStore.getState().addToast({
          title: '🎉 Phát sóng thành công',
          message: 'Thông báo mới đã được đăng tải và phát tới mọi người.',
          type: 'success'
        });
      }

      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Submit announcement error:', error);
      useToastStore.getState().addToast({
        title: 'Lỗi gửi dữ liệu',
        message: 'Đã xảy ra lỗi khi lưu thông báo.',
        type: 'danger'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này không?')) return;

    try {
      await apiClient.delete(`/Announcements/${id}`);
      useToastStore.getState().addToast({
        title: 'Đã xóa thông báo',
        message: 'Thông báo đã được gỡ bỏ khỏi hệ thống.',
        type: 'success'
      });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Delete announcement error:', error);
    }
  };

  const getPriorityDetails = (level: number) => {
    switch (level) {
      case 2:
        return {
          label: 'Khẩn cấp',
          badgeClass: 'bg-red-50 text-red-700 border-red-150',
          borderClass: 'border-red-200 bg-red-50/10',
          icon: <AlertTriangle className="text-red-500 shrink-0" size={16} />
        };
      case 1:
        return {
          label: 'Quan trọng',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-150',
          borderClass: 'border-amber-200 bg-amber-50/10',
          icon: <Megaphone className="text-amber-500 shrink-0" size={16} />
        };
      default:
        return {
          label: 'Thông thường',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-150',
          borderClass: 'border-gray-200 bg-white',
          icon: <Megaphone className="text-blue-500 shrink-0" size={16} />
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">NeoBoard - Thông báo công ty</h2>
          <p className="text-xs text-gray-400 mt-1">Phát sóng các thông báo quan trọng và khẩn cấp tới toàn bộ sinh viên, giáo viên và nhân viên.</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus size={14} className="mr-1.5" /> Tạo thông báo mới
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 italic text-xs">Đang tải danh sách thông báo...</div>
      ) : announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((a) => {
            const pInfo = getPriorityDetails(a.priority);
            return (
              <div 
                key={a.id} 
                className={`flex flex-col justify-between border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all ${pInfo.borderClass}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${pInfo.badgeClass}`}>
                      {pInfo.label}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {a.isPublished ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center">
                          <CheckCircle size={8} className="mr-0.5" /> Đã đăng
                        </span>
                      ) : (
                        <span className="bg-gray-50 text-gray-500 border border-gray-150 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                          Nháp
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    {pInfo.icon}
                    <h3 className="font-bold text-gray-900 text-xs leading-snug">{a.title}</h3>
                  </div>

                  <p className="text-[11px] text-gray-600 line-clamp-4 leading-relaxed">{a.content}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100/60 flex flex-col space-y-3">
                  {/* Meta details */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <Clock size={10} />
                      <span>{new Date(a.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {a.expiresAt && (
                      <div className="flex items-center space-x-1 text-red-500">
                        <Calendar size={10} />
                        <span>Hết hạn: {new Date(a.expiresAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => handleOpenEditModal(a)}
                      className="p-2 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl border border-gray-100 hover:border-blue-100 transition-all"
                      title="Sửa thông báo"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl border border-gray-100 hover:border-red-150 transition-all"
                      title="Xóa thông báo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 bg-white rounded-3xl border border-gray-150 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
            <Megaphone size={24} />
          </div>
          <div>
            <p className="font-black text-gray-800 uppercase text-xs">Chưa có thông báo nào</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Bấm nút góc trên bên phải để tạo thông báo đầu tiên!</p>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-gray-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center">
                <Megaphone size={16} className="text-blue-600 mr-2" />
                {editingId ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-black text-gray-500 uppercase tracking-wider text-[10px]">Tiêu đề thông báo</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ví dụ: Lịch đóng cửa phòng máy đợt lễ"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-500 uppercase tracking-wider text-[10px]">Nội dung thông báo</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Điền thông tin chi tiết về thông báo tại đây..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-medium transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="font-black text-gray-500 uppercase tracking-wider text-[10px]">Mức độ quan trọng</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold transition-all cursor-pointer"
                  >
                    <option value={0}>Thông thường (Normal)</option>
                    <option value={1}>Quan trọng (Important)</option>
                    <option value={2}>Khẩn cấp (Urgent)</option>
                  </select>
                </div>

                {/* Expiry Date */}
                <div className="space-y-1.5">
                  <label className="font-black text-gray-500 uppercase tracking-wider text-[10px]">Hạn hiển thị (Tùy chọn)</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Status checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  className="w-4 h-4 border border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isPublished" className="font-bold text-gray-700 cursor-pointer select-none">
                  Đăng tải công khai ngay khi lưu
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors uppercase tracking-wider text-[10px]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all uppercase tracking-wider text-[10px] shadow-sm flex items-center justify-center active:scale-95"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu lại & Đăng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManagementPage;

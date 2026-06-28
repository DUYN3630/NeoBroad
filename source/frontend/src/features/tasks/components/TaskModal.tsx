import React, { useState, useEffect } from 'react';
import { X, Save, ClipboardCheck, User, Calendar, AlertCircle, List, Settings, Briefcase } from 'lucide-react';
import apiClient from '@/lib/axios';

interface WorkTask {
  id?: string;
  taskCode: string;
  title: string;
  taskType: string;
  relatedAssetId: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string;
  supervisor: string;
  startDate: string;
  dueDate: string;
  requirements: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkTask) => void;
  initialData?: WorkTask | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [assets, setAssets] = useState<any[]>([]);
  const [formData, setFormData] = useState<WorkTask>({
    taskCode: '', title: '', taskType: 'Maintenance', relatedAssetId: '',
    description: '', priority: 'Normal', status: 'To Do',
    assignedTo: '', supervisor: '', startDate: '', dueDate: '', requirements: ''
  });

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/Assets').then(res => setAssets(res.data)).catch(() => {});
    }
    if (initialData) setFormData(initialData);
    else setFormData({
        taskCode: '', title: '', taskType: 'Maintenance', relatedAssetId: '',
        description: '', priority: 'Normal', status: 'To Do',
        assignedTo: '', supervisor: '', startDate: '', dueDate: '', requirements: ''
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-300">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#f8f9fa]">
          <h2 className="text-sm font-bold text-gray-700 flex items-center uppercase tracking-wide">
            <ClipboardCheck size={16} className="mr-2 text-[#0072C6]" />
            {initialData ? `Chỉnh sửa công việc: ${initialData.taskCode}` : 'Giao phó công việc bảo trì mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-100 bg-white">
            <button type="button" onClick={() => setActiveTab('general')} className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 ${activeTab === 'general' ? 'border-[#0072C6] text-[#0072C6] bg-blue-50/50' : 'border-transparent text-gray-400'}`}>Thông tin nhiệm vụ</button>
            <button type="button" onClick={() => setActiveTab('assignment')} className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 ${activeTab === 'assignment' ? 'border-[#0072C6] text-[#0072C6] bg-blue-50/50' : 'border-transparent text-gray-400'}`}>Nhân sự & Thời gian</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="p-8 h-[60vh] overflow-y-auto bg-white">
            
            {activeTab === 'general' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 animate-in fade-in duration-200">
                    <div>
                        <label className="k-label">Mã công việc <span className="text-red-500">*</span></label>
                        <input type="text" name="taskCode" required value={formData.taskCode || ''} onChange={handleChange} className="k-input" placeholder="VD: TASK-2024-001" />
                    </div>
                    <div>
                        <label className="k-label">Tiêu đề công việc <span className="text-red-500">*</span></label>
                        <input type="text" name="title" required value={formData.title || ''} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label">Loại công việc</label>
                        <select name="taskType" value={formData.taskType || 'Maintenance'} onChange={handleChange} className="k-input font-bold">
                            <option value="Maintenance">Bảo trì định kỳ</option>
                            <option value="Repair">Sửa chữa sự cố</option>
                            <option value="Inspection">Kiểm định thiết bị</option>
                            <option value="Installation">Lắp đặt mới</option>
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Thiết bị liên quan</label>
                        <select name="relatedAssetId" value={formData.relatedAssetId || ''} onChange={handleChange} className="k-input">
                            <option value="">-- Không liên quan thiết bị cụ thể --</option>
                            {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="k-label">Mô tả nội dung công việc</label>
                        <textarea name="description" rows={3} value={formData.description || ''} onChange={handleChange} className="k-input resize-none" placeholder="Chi tiết các bước thực hiện..." />
                    </div>
                    <div className="col-span-2">
                        <label className="k-label flex items-center"><Settings size={12} className="mr-1" /> Yêu cầu vật tư / công cụ đi kèm</label>
                        <textarea name="requirements" rows={2} value={formData.requirements || ''} onChange={handleChange} className="k-input resize-none bg-gray-50 border-dashed" placeholder="VD: Bộ đồ nghề mạng, Keo tản nhiệt, Ổ cứng thay thế..." />
                    </div>
                </div>
            )}

            {activeTab === 'assignment' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 animate-in fade-in duration-200">
                    <div>
                        <label className="k-label flex items-center"><User size={12} className="mr-1" /> Người thực hiện chính <span className="text-red-500">*</span></label>
                        <input type="text" name="assignedTo" required value={formData.assignedTo || ''} onChange={handleChange} className="k-input" placeholder="Tên kỹ thuật viên..." />
                    </div>
                    <div>
                        <label className="k-label flex items-center"><User size={12} className="mr-1" /> Người giám sát / Phê duyệt</label>
                        <input type="text" name="supervisor" value={formData.supervisor || ''} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label flex items-center"><Calendar size={12} className="mr-1" /> Ngày bắt đầu</label>
                        <input type="date" name="startDate" value={formatDateForInput(formData.startDate)} onChange={handleChange} className="k-input" />
                    </div>
                    <div>
                        <label className="k-label flex items-center"><Calendar size={12} className="mr-1" /> Hạn chót hoàn thành (Due Date)</label>
                        <input type="date" name="dueDate" value={formatDateForInput(formData.dueDate)} onChange={handleChange} className="k-input font-bold text-red-600" />
                    </div>
                    <div>
                        <label className="k-label">Độ ưu tiên</label>
                        <select name="priority" value={formData.priority || 'Normal'} onChange={handleChange} className="k-input">
                            <option value="Low">Thấp (Tùy nghi)</option>
                            <option value="Normal">Trung bình (Bình thường)</option>
                            <option value="High">Cao (Cần thực hiện ngay)</option>
                            <option value="Urgent">Khẩn cấp (Ưu tiên số 1)</option>
                        </select>
                    </div>
                    <div>
                        <label className="k-label">Trạng thái ban đầu</label>
                        <select name="status" value={formData.status || 'To Do'} onChange={handleChange} className="k-input">
                            <option value="To Do">Chờ thực hiện (To Do)</option>
                            <option value="In Progress">Đang triển khai</option>
                        </select>
                    </div>
                </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="bg-[#f1f3f5] px-8 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 uppercase tracking-wider">Hủy bỏ</button>
            <button type="submit" className="k-button-primary flex items-center uppercase tracking-wider text-xs">
              <Save size={16} className="mr-2" /> Lưu & Phát hành Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

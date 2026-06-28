import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  X,
  Camera,
  DollarSign,
  PenTool,
  Wrench
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
}

const MyTasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { user } = useAuthStore();

  // Complete Form State
  const [actionTaken, setActionTaken] = useState('');
  const [sparePartsUsed, setSparePartsUsed] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [verificationResult, setVerificationResult] = useState('Passed');
  const [notes, setNotes] = useState('');
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Helper functions for calendar
  const getStartOfWeek = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekDays = () => {
    const monday = getStartOfWeek(new Date());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getTasksCountForDate = (date: Date) => {
    return tasks.filter(t => isSameDay(new Date(t.dueDate), date)).length;
  };

  const filteredTasks = selectedDateFilter
    ? tasks.filter(t => isSameDay(new Date(t.dueDate), new Date(selectedDateFilter)))
    : tasks;

  const getDayLabel = (date: Date) => {
    const day = date.getDay();
    if (day === 0) return 'CN';
    return `T${day + 1}`;
  };

  const fetchTasks = () => {
    if (user) {
        setLoading(true);
        // Using user's full name to query their assigned tasks
        apiClient.get(`/Tasks/MyTasks/${user.fullName}`)
          .then(res => setTasks(res.data))
          .catch(err => console.error(err))
          .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleOpenDetailsModal = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleStartTask = async () => {
    if (!selectedTask) return;
    try {
      await apiClient.post(`/Maintenance/Tickets/${selectedTask.id}/start`);
      alert('Đã chuyển trạng thái công việc sang: Đang thực hiện (In Progress)!');
      setIsDetailsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    }
  };

  const handleOpenCompleteModal = () => {
    setActionTaken('');
    setSparePartsUsed('');
    setTotalCost(0);
    setVerificationResult('Passed');
    setNotes('');
    setEvidencePhoto(null);
    setPhotoPreview(null);
    setIsDetailsModalOpen(false);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_width = 1024;
          const max_height = 768;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_width) {
              height *= max_width / width;
              width = max_width;
            }
          } else {
            if (height > max_height) {
              width *= max_height / height;
              height = max_height;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 0.7 quality factor
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setEvidencePhoto(compressedBase64);
            setPhotoPreview(compressedBase64);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      const payload = {
        actionTaken,
        sparePartsUsed,
        totalCost,
        verificationResult,
        notes,
        evidencePhoto
      };

      await apiClient.post(`/Maintenance/Tickets/${selectedTask.id}/complete`, payload);
      alert('Đã hoàn tất nghiệm thu bảo trì thiết bị!');
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Gửi báo cáo nghiệm thu thất bại. Vui lòng kiểm tra lại.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-50 text-green-600 border-green-100';
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Lịch trình công việc của tôi</h1>
          <p className="text-gray-500 text-sm mt-1">Chào {user?.fullName || 'Kỹ thuật viên'}, đây là danh sách nhiệm vụ bảo trì bạn cần thực hiện.</p>
        </div>
        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase">Hôm nay</p>
                <p className="text-xs font-bold text-gray-700">{new Date().toLocaleDateString('vi-VN')}</p>
            </div>
            <Calendar size={20} className="text-[#0072C6]" />
        </div>
      </div>

      {/* LỊCH LÀM VIỆC TUẦN NÀY (WEEKLY WORK CALENDAR) */}
      <div className="mb-6 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black text-gray-450 uppercase tracking-widest">Lịch làm việc tuần này</h2>
          {selectedDateFilter && (
            <button 
              onClick={() => setSelectedDateFilter(null)}
              className="text-xs font-bold text-[#0072C6] hover:underline uppercase"
            >
              Xem tất cả ({tasks.length})
            </button>
          )}
        </div>
        <div className="grid grid-cols-7 gap-2.5">
          {weekDays.map((day, idx) => {
            const dateStr = day.toISOString().split('T')[0];
            const isSelected = selectedDateFilter === dateStr;
            const isToday = isSameDay(day, new Date());
            const taskCount = getTasksCountForDate(day);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDateFilter(isSelected ? null : dateStr)}
                className={`relative flex flex-col items-center p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : isToday
                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/50'
                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100 hover:border-gray-205'
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-wider mb-1">
                  {getDayLabel(day)}
                </span>
                <span className="text-base font-black tracking-tight">
                  {day.getDate()}
                </span>
                
                {taskCount > 0 && (
                  <span className={`absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full text-[9px] font-black flex items-center justify-center border shadow-sm ${
                    isSelected ? 'bg-white text-blue-600 border-blue-600' : 'bg-red-500 text-white border-white'
                  }`}>
                    {taskCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: DANH SÁCH TASK */}
        <div className="lg:col-span-2 space-y-4">
            {loading ? (
                <div className="p-12 text-center text-gray-400">Đang tải lịch trình...</div>
            ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                    <div 
                      key={task.id} 
                      onClick={() => handleOpenDetailsModal(task)}
                      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-start justify-between group cursor-pointer"
                    >
                        <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-xl ${task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#0072C6]'}`}>
                                <Wrench size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-700 group-hover:text-[#0072C6] transition-colors">{task.title}</h3>
                                <p className="text-xs text-gray-400 mt-1 mb-3">{task.description}</p>
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        <Calendar size={12} className="mr-1" /> Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="p-2 text-gray-300 group-hover:text-[#0072C6] group-hover:bg-blue-50 rounded-full transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                ))
            ) : (
                <div className="p-12 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-center">
                    <p className="text-gray-400 italic">Bạn chưa được giao công việc nào trong hôm nay.</p>
                </div>
            )}
        </div>

        {/* CỘT PHẢI: THÔNG TIN PHỤ */}
        <div className="space-y-6">
            <div className="bg-[#1a1a1a] p-6 rounded-2xl text-white shadow-xl">
                <h4 className="font-bold mb-4 flex items-center text-sm uppercase tracking-widest text-green-400">
                    <CheckCircle2 size={16} className="mr-2" /> Thống kê năng suất
                </h4>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Công việc chưa hoàn thành</span>
                        <span className="font-mono font-bold">{tasks.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Tỷ lệ đúng hạn</span>
                        <span className="font-mono font-bold text-green-400">95%</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 text-xs uppercase">Ghi chú từ Quản lý</h4>
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <p className="text-xs text-yellow-700 leading-relaxed italic">
                        "Hãy cập nhật hình ảnh nghiệm thu thực tế và kê khai linh kiện thay thế đầy đủ khi hoàn thành bảo trì."
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* MODAL NGHIỆM THU HOÀN THÀNH TICKET */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f8f9fa]">
              <h2 className="text-sm font-bold text-gray-700 uppercase flex items-center">
                <PenTool size={16} className="mr-2 text-[#0072C6]" />
                Nghiệm thu bảo trì: {selectedTask.title}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitCompletion} className="p-6 space-y-4">
              <div className="p-4 bg-blue-50/50 rounded-xl text-xs text-gray-600 mb-2 border border-blue-100/50">
                <p className="font-bold text-[#0072C6] mb-1">Mục tiêu kiểm tra:</p>
                <p className="italic">"{selectedTask.description}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="k-label">Hạng mục đã thực hiện <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={actionTaken} 
                    onChange={e => setActionTaken(e.target.value)} 
                    className="k-input" 
                    placeholder="VD: Vệ sinh máy, tra keo tản nhiệt, cài lại Win"
                  />
                </div>

                <div>
                  <label className="k-label">Linh kiện / Phụ tùng thay thế</label>
                  <input 
                    type="text" 
                    value={sparePartsUsed} 
                    onChange={e => setSparePartsUsed(e.target.value)} 
                    className="k-input" 
                    placeholder="Không có hoặc ghi tên linh kiện..." 
                  />
                </div>

                <div>
                  <label className="k-label flex items-center"><DollarSign size={12} className="mr-1" /> Chi phí sửa chữa (VNĐ)</label>
                  <input 
                    type="number" 
                    required 
                    value={totalCost} 
                    onChange={e => setTotalCost(parseFloat(e.target.value) || 0)} 
                    className="k-input font-mono text-right" 
                  />
                </div>

                <div>
                  <label className="k-label">Kết quả kiểm định sau sửa</label>
                  <select 
                    value={verificationResult} 
                    onChange={e => setVerificationResult(e.target.value)} 
                    className="k-input font-bold text-green-600"
                  >
                    <option value="Passed">Đạt chuẩn (Passed)</option>
                    <option value="Failed">Hỏng nặng / Cần thanh lý (Failed)</option>
                  </select>
                </div>

                <div>
                  <label className="k-label flex items-center"><Camera size={12} className="mr-1" /> Hình ảnh nghiệm thu thực tế</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                {photoPreview && (
                  <div className="col-span-2 flex items-center justify-center p-2 border rounded-xl bg-gray-50">
                    <img src={photoPreview} alt="Nghiệm thu" className="max-h-48 rounded object-contain" />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="k-label">Ghi chú bổ sung</label>
                  <textarea 
                    rows={2} 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="k-input resize-none" 
                    placeholder="Ghi nhận thêm thông tin..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-xs font-bold text-gray-500 uppercase">Hủy</button>
                <button type="submit" className="k-button-primary flex items-center uppercase text-xs">
                  <CheckCircle2 size={16} className="mr-2" /> Gửi báo cáo nghiệm thu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT CÔNG VIỆC */}
      {isDetailsModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f8f9fa]">
              <h2 className="text-sm font-bold text-gray-700 uppercase flex items-center">
                <Clock size={16} className="mr-2 text-[#0072C6]" />
                Chi tiết nhiệm vụ
              </h2>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                  selectedTask.priority === 'High' ? 'bg-red-50 text-red-500 border-red-150' : 'bg-blue-50 text-[#0072C6] border-blue-150'
                }`}>
                  Ưu tiên: {selectedTask.priority}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getStatusColor(selectedTask.status)}`}>
                  {selectedTask.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-gray-800">{selectedTask.title}</h3>
                <p className="text-xs text-gray-450 mt-1">Hạn thực hiện: {new Date(selectedTask.dueDate).toLocaleDateString('vi-VN')}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Mô tả công việc:</p>
                <p className="text-xs text-gray-650 leading-relaxed italic">"{selectedTask.description}"</p>
              </div>

              <div className="flex flex-col space-y-2 pt-2">
                {selectedTask.status === 'Pending' ? (
                  <button 
                    type="button"
                    onClick={handleStartTask}
                    className="w-full py-3 rounded-xl flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100/30 transition-all border border-transparent"
                  >
                    ⚡ Bắt đầu thực hiện
                  </button>
                ) : selectedTask.status === 'In Progress' ? (
                  <button 
                    type="button"
                    onClick={handleOpenCompleteModal}
                    className="w-full py-3 rounded-xl flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-green-600 hover:bg-green-750 text-white shadow-lg shadow-green-100/30 transition-all border border-transparent"
                  >
                    🛠️ Báo cáo & Nghiệm thu
                  </button>
                ) : (
                  <div className="p-3 bg-green-50 text-green-700 rounded-xl text-center text-xs font-bold">
                    ✅ Công việc đã hoàn thành
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="w-full py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 text-center uppercase transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyTasksPage;

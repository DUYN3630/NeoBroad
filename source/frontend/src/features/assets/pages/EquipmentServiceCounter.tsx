import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import SelfieCapture from '../components/SelfieCapture';
import QrScanner from '../components/QrScanner';
import { 
  Search, 
  User, 
  Package, 
  Calendar, 
  Info, 
  Plus, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Monitor, 
  QrCode,
  Handshake,
  Check,
  AlertTriangle,
  RefreshCw,
  Wrench
} from 'lucide-react';

interface Borrower {
  id: string;
  code: string;
  fullName: string;
  department: string;
  className?: string;
  status: 'Active' | 'Warning' | 'Locked';
}

interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  type: string;
  status: 'Available' | 'InUse' | 'Maintenance';
}

interface SessionLog {
  id: string;
  type: 'Approve' | 'Return';
  time: string;
  studentName: string;
  studentCode: string;
  detail: string;
}

const EquipmentServiceCounter = () => {
  const [activeTab, setActiveTab] = useState<'issue' | 'warehouse'>('warehouse');
  
  // Tab 1: Cấp phát mới (Issue) states
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState<Borrower | null>(null);
  const [cart, setCart] = useState<Asset[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    new Date(new Date().setHours(17, 0, 0, 0)).toISOString().split('T')[0]
  );
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrType, setQrQrType] = useState<'Student' | 'Asset'>('Student');

  // Tab 2: Quầy giao nhận nhanh (Warehouse Console) states
  const [warehouseSearchCode, setWarehouseSearchCode] = useState('');
  const [warehouseData, setWarehouseData] = useState<any | null>(null);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<{[itemId: string]: string}>({});
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);

  const fetchAvailable = async () => {
    try {
      const response: any = await apiClient.get('/Assets');
      if (response.data) {
        setAvailableAssets(response.data.filter((a: any) => a.status === 'Available'));
      }
    } catch (error) {
      console.error('Fetch assets error:', error);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const handleUserSearch = async (e?: React.FormEvent, manualCode?: string) => {
    if (e) e.preventDefault();
    const code = manualCode || searchUser;
    if (!code) return;

    try {
      const response: any = await apiClient.get(`/Students/search/${code}`);
      const result = response.data;
      if (result && result.success && result.data) {
        setSelectedUser({
          id: result.data.id,
          code: result.data.studentCode,
          fullName: result.data.fullName,
          department: result.data.department || 'N/A',
          className: result.data.className,
          status: 'Active'
        });
        setSearchUser('');
      } else {
        alert('Không tìm thấy thông tin sinh viên với mã này!');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi kết nối hệ thống!');
    }
  };

  const handleWarehouseSearch = async (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault();
    const code = codeOverride || warehouseSearchCode;
    if (!code) return;

    setWarehouseLoading(true);
    try {
      const response: any = await apiClient.get(`/Borrow/StudentPortalSummary/${code}`);
      if (response.data && response.data.student) {
        setWarehouseData(response.data);
        const initialConditions: {[itemId: string]: string} = {};
        response.data.activeItems.forEach((item: any) => {
          initialConditions[item.itemId] = 'Tốt';
        });
        setSelectedConditions(initialConditions);
      } else {
        alert('Không tìm thấy thông tin sinh viên.');
        setWarehouseData(null);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Không tìm thấy sinh viên hoặc lỗi kết nối.');
      setWarehouseData(null);
    } finally {
      setWarehouseLoading(false);
    }
  };

  const handleQrScan = (data: string) => {
    setIsQrOpen(false);
    if (qrType === 'Student') {
      if (activeTab === 'warehouse') {
        setWarehouseSearchCode(data);
        handleWarehouseSearch(undefined, data);
      } else {
        handleUserSearch(undefined, data);
      }
    } else {
      const found = availableAssets.find(a => a.serialNumber === data);
      if (found) addToCart(found);
      else alert(`Không tìm thấy hoặc máy ${data} đang bận.`);
    }
  };

  const addToCart = (asset: Asset) => {
    if (!cart.find(item => item.id === asset.id)) {
      setCart([...cart, asset]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!selectedUser) return alert('Vui lòng định danh người mượn trước!');
    if (cart.length === 0) return alert('Giỏ hàng đang trống!');
    if (!selfieData) return alert('Vui lòng chụp ảnh xác nhận bàn giao bộ thiết bị!');
    
    setIsSubmitting(true);
    try {
      const payload = {
        studentId: selectedUser.id,
        expectedReturnDate: expectedReturnDate,
        assetIds: cart.map(a => a.id),
        evidencePhoto: selfieData,
        purpose: "Sử dụng giảng dạy/học tập"
      };

      const res: any = await apiClient.post('/Borrow/create-request', payload);
      alert(`MƯỢN ĐỒ THÀNH CÔNG!\n- Số món: ${cart.length}\n- Hash: ${res.data.transactionHash.substring(0, 16)}...`);
      resetForm();
      fetchAvailable();
    } catch (error: any) {
      alert('Giao dịch thất bại: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setCart([]);
    setSelfieData(null);
  };

  const handleQuickApprove = async (requestId: string) => {
    try {
      const matchedReq = warehouseData?.pendingRequests.find((r: any) => r.id === requestId);
      await apiClient.post(`/Borrow/${requestId}/Approve`);
      
      // Add to sessionLogs
      if (matchedReq && warehouseData?.student) {
        setSessionLogs(prev => [
          {
            id: Date.now().toString(),
            type: 'Approve',
            time: new Date().toLocaleTimeString('vi-VN'),
            studentName: warehouseData.student.fullName,
            studentCode: warehouseData.student.studentCode,
            detail: `Duyệt mượn ${matchedReq.itemCount} thiết bị`
          },
          ...prev
        ]);
      }

      alert('Đã phê duyệt và bàn giao thiết bị thành công!');
      if (warehouseData?.student?.studentCode) {
        handleWarehouseSearch(undefined, warehouseData.student.studentCode);
      }
      fetchAvailable();
    } catch (error: any) {
      alert('Phê duyệt thất bại: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
    }
  };

  const handleQuickReturn = async (itemId: string) => {
    const condition = selectedConditions[itemId] || 'Tốt';
    try {
      const matchedItem = warehouseData?.activeItems.find((i: any) => i.itemId === itemId);
      await apiClient.post(`/Borrow/Return/${itemId}`, { condition });
      
      // Add to sessionLogs
      if (matchedItem && warehouseData?.student) {
        setSessionLogs(prev => [
          {
            id: Date.now().toString(),
            type: 'Return',
            time: new Date().toLocaleTimeString('vi-VN'),
            studentName: warehouseData.student.fullName,
            studentCode: warehouseData.student.studentCode,
            detail: `Nhận trả: ${matchedItem.assetName} (Tình trạng: ${condition})`
          },
          ...prev
        ]);
      }

      alert('Đã ghi nhận trả thiết bị thành công!');
      if (warehouseData?.student?.studentCode) {
        handleWarehouseSearch(undefined, warehouseData.student.studentCode);
      }
      fetchAvailable();
    } catch (error: any) {
      alert('Hoàn trả thất bại: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
    }
  };

  return (
    <>
      {/* HEADER PAGE */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
            <Handshake className="mr-3 text-blue-600" size={28} />
            QUẦY DỊCH VỤ THIẾT BỊ HỌC TẬP
        </h1>
        <p className="text-gray-500 text-sm mt-1">Cung cấp bảng điều khiển giao nhận nhanh hoặc đăng ký mượn mới.</p>
      </div>

      {/* TAB SELECTOR */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('warehouse')}
            className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center space-x-2 transition-all ${
              activeTab === 'warehouse'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Handshake size={16} />
            <span>Bàn giao & Nhận trả nhanh (Warehouse Console)</span>
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center space-x-2 transition-all ${
              activeTab === 'issue'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Plus size={16} />
            <span>Cấp phát mới (New Request)</span>
          </button>
        </nav>
      </div>

      {/* TAB CONTENT: WAREHOUSE QUICK PANEL */}
      {activeTab === 'warehouse' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* SEARCH BAR */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
              Nhập mã sinh viên hoặc quét QR định danh sinh viên
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleWarehouseSearch} className="flex-grow relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Nhập mã sinh viên (Ví dụ: SV1001)..." 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-150 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-bold transition-all"
                  value={warehouseSearchCode}
                  onChange={(e) => setWarehouseSearchCode(e.target.value)}
                />
              </form>
              <div className="flex gap-2">
                <button
                  onClick={() => { setQrQrType('Student'); setIsQrOpen(true); }}
                  className="px-5 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs flex items-center justify-center hover:bg-black transition-all shadow-md"
                >
                  <QrCode size={16} className="mr-2 text-blue-400" /> Quét QR Thẻ
                </button>
                <button
                  onClick={handleWarehouseSearch}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>

          {warehouseLoading ? (
            <div className="py-20 text-center text-gray-400 italic text-sm">
              Đang truy xuất thông tin kho từ hệ thống...
            </div>
          ) : warehouseData ? (
            <div className="space-y-6 animate-in zoom-in-98 duration-200">
              
              {/* STUDENT PROFILE CARD */}
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                    {warehouseData.student.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-950 leading-tight">{warehouseData.student.fullName}</h2>
                    <p className="text-xs text-blue-600 font-bold uppercase mt-0.5">
                      MSSV: {warehouseData.student.studentCode} — Khoa: {warehouseData.student.department || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500">
                  <p>Email: <span className="font-bold text-gray-800">{warehouseData.student.email}</span></p>
                  <p>SĐT: <span className="font-bold text-gray-800">{warehouseData.student.phoneNumber}</span></p>
                </div>
              </div>

              {/* DUAL WORKSPACE PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* COLUMN 1: PENDING REQUESTS */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-150 mb-4">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center">
                      <Handshake className="text-amber-500 mr-2" size={18} />
                      Đơn mượn chờ duyệt ({warehouseData.pendingRequests.length})
                    </h3>
                  </div>

                  <div className="space-y-4 flex-grow overflow-y-auto max-h-[450px] pr-2">
                    {warehouseData.pendingRequests.length > 0 ? (
                      warehouseData.pendingRequests.map((req: any) => (
                        <div key={req.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 hover:border-amber-200 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Ngày yêu cầu: {new Date(req.requestDate).toLocaleDateString('vi-VN')}</p>
                              <p className="text-[10px] text-red-500 font-bold uppercase">Hạn dự kiến: {new Date(req.expectedReturnDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-amber-100">
                              Chờ duyệt
                            </span>
                          </div>
                          
                          <div className="border-t border-gray-200/50 pt-2 space-y-1.5">
                            <p className="text-xs font-bold text-gray-500">Thiết bị đăng ký ({req.itemCount}):</p>
                            <div className="space-y-1">
                              {req.assets.map((asset: any, idx: number) => (
                                <p key={idx} className="text-xs text-gray-700 font-medium pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500">
                                  {asset.name} <span className="text-[10px] font-mono text-gray-400">({asset.serialNumber})</span>
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => handleQuickApprove(req.id)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center shadow-md transition-all active:scale-[0.98]"
                            >
                              <Check size={14} className="mr-1.5" /> Duyệt & Bàn giao
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-gray-300 italic text-xs border border-dashed border-gray-100 rounded-xl">
                        Không có đơn mượn nào đang chờ duyệt.
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 2: CURRENTLY HELD ITEMS */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-150 mb-4">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center">
                      <Package className="text-blue-600 mr-2" size={18} />
                      Thiết bị đang cầm ({warehouseData.activeItems.length})
                    </h3>
                  </div>

                  <div className="space-y-4 flex-grow overflow-y-auto max-h-[450px] pr-2">
                    {warehouseData.activeItems.length > 0 ? (
                      warehouseData.activeItems.map((item: any) => {
                        const isOverdue = new Date(item.expectedReturnDate) < new Date();
                        const currentCondition = selectedConditions[item.itemId] || 'Tốt';
                        return (
                          <div key={item.itemId} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 hover:border-blue-200 transition-all flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900">{item.assetName}</h4>
                                  <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">{item.serialNumber} • {item.type}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                  isOverdue ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                  {isOverdue ? 'Quá hạn' : 'Đang sử dụng'}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Hạn trả: {new Date(item.expectedReturnDate).toLocaleDateString('vi-VN')}</p>
                            </div>

                            <div className="border-t border-gray-200/50 pt-3 space-y-3">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <div className="flex items-center space-x-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0">Tình trạng trả:</label>
                                  <select 
                                    className="px-2 py-1 bg-white border border-gray-250 rounded-lg text-xs font-bold outline-none cursor-pointer"
                                    value={currentCondition}
                                    onChange={(e) => setSelectedConditions({...selectedConditions, [item.itemId]: e.target.value})}
                                  >
                                    <option value="Tốt">Tốt (Bình thường)</option>
                                    <option value="Hỏng nhẹ">Hỏng nhẹ / Trầy xước</option>
                                    <option value="Lỗi kỹ thuật">Lỗi kỹ thuật</option>
                                    <option value="Hỏng nặng">Hỏng nặng / Bể vỡ</option>
                                    <option value="Báo mất (Cần đền bù)">Báo mất (Cần đền bù)</option>
                                  </select>
                                </div>

                                <button
                                  onClick={() => handleQuickReturn(item.itemId)}
                                  className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center shadow-md transition-all active:scale-[0.98]"
                                >
                                  <CheckCircle2 size={13} className="mr-1.5 text-green-400" /> Xác nhận trả
                                </button>
                              </div>

                              {/* CONDITIONAL NOTIFICATION ALERTS */}
                              {currentCondition === 'Báo mất (Cần đền bù)' && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[10px] font-bold flex items-center space-x-2 animate-in fade-in duration-200">
                                  <AlertTriangle size={14} className="shrink-0 animate-bounce text-red-650" />
                                  <span>⚠️ THIẾT BỊ SẼ BỊ KHÓA & TẠO GHI CHÚ ĐỀN BÙ TRONG HỆ THỐNG KIỂM TOÁN.</span>
                                </div>
                              )}

                              {['Hỏng nhẹ', 'Lỗi kỹ thuật', 'Hỏng nặng'].includes(currentCondition) && (
                                <div className="p-3 bg-amber-50 border border-amber-250 text-amber-700 rounded-xl text-[10px] font-bold flex items-center space-x-2 animate-in fade-in duration-200">
                                  <Wrench size={14} className="shrink-0 text-amber-600" />
                                  <span>🔧 HỆ THỐNG TỰ ĐỘNG TẠO PHIẾU BẢO TRÌ (MAINTENANCE TICKET) CHO KỸ THUẬT VIÊN.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-gray-300 italic text-xs border border-dashed border-gray-100 rounded-xl">
                        Sinh viên hiện tại không giữ thiết bị nào.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* SESSION TRANSACTION HISTORY */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                 <div className="flex items-center justify-between pb-3 border-b border-gray-150 mb-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                       Lịch sử giao nhận trong phiên làm việc
                    </h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-black uppercase">
                       {sessionLogs.length} Giao dịch
                    </span>
                 </div>

                 <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {sessionLogs.length > 0 ? (
                       sessionLogs.map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-xs hover:bg-gray-100/50 transition-all">
                             <div className="flex flex-wrap items-center gap-3">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                   log.type === 'Approve' 
                                   ? 'bg-green-50 text-green-600 border-green-100' 
                                   : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                   {log.type === 'Approve' ? 'Bàn giao' : 'Thu hồi'}
                                </span>
                                <span className="text-gray-400 font-mono text-[10px]">{log.time}</span>
                                <span className="font-black text-gray-900">{log.studentName} <span className="text-gray-400 font-bold">({log.studentCode})</span></span>
                                <span className="text-gray-500 font-medium">— {log.detail}</span>
                             </div>
                             <span className="text-[9px] text-green-600 font-black uppercase flex items-center bg-green-50/55 px-2.5 py-1 rounded-lg border border-green-100">
                                <Check size={11} className="mr-1" /> Thành công
                             </span>
                          </div>
                       ))
                    ) : (
                       <p className="text-xs text-gray-400 italic py-6 text-center">
                          Chưa có giao dịch nào được thực hiện trong phiên này. Các giao dịch duyệt hoặc nhận trả sẽ tự động lưu vết tại đây.
                       </p>
                    )}
                 </div>
              </div>

            </div>
          ) : (
            <div className="py-20 bg-white rounded-2xl border-2 border-dashed border-gray-150 text-center">
              <AlertTriangle className="mx-auto text-gray-200 mb-3" size={48} />
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                Vui lòng nhập MSSV hoặc quét thẻ định danh của sinh viên để tiếp tục.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: NEW REQUEST ISSUE */}
      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
          <div className="lg:col-span-8 space-y-6">
            {/* IDENTIFY BORROWER */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <User size={100} />
               </div>
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                  <User size={14} className="mr-2" /> 1. Định danh người nhận
               </h3>

               {!selectedUser ? (
                  <div className="flex flex-col md:flex-row gap-4">
                     <form onSubmit={handleUserSearch} className="flex-grow relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input 
                          type="text" 
                          placeholder="Nhập MSSV hoặc Tên..." 
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                          value={searchUser}
                          onChange={(e) => setSearchUser(e.target.value)}
                        />
                     </form>
                     <button 
                      onClick={() => { setQrQrType('Student'); setIsQrOpen(true); }}
                      className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs flex items-center justify-center hover:bg-black transition-all shadow-lg shadow-gray-200"
                     >
                       <QrCode size={18} className="mr-2 text-blue-400" /> QUÉT THẺ
                     </button>
                  </div>
               ) : (
                  <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-in fade-in zoom-in-95">
                     <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                          {selectedUser.fullName.charAt(0)}
                        </div>
                        <div>
                           <p className="font-black text-gray-900 leading-tight">{selectedUser.fullName}</p>
                           <p className="text-[11px] text-blue-600 font-bold uppercase mt-0.5">{selectedUser.code} — {selectedUser.className}</p>
                        </div>
                     </div>
                     <button onClick={() => setSelectedUser(null)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <X size={18} />
                     </button>
                  </div>
               )}
            </div>

            {/* SMART BASKET */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                      <Package size={14} className="mr-2" /> 2. Giỏ hàng thiết bị (Smart Basket)
                  </h3>
                  <div className="flex space-x-2">
                      <button 
                          onClick={() => { setQrQrType('Asset'); setIsQrOpen(true); }}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center shadow-sm"
                      >
                          <QrCode size={14} className="mr-2 text-blue-600" /> Quét QR máy
                      </button>
                  </div>
               </div>

               <div className="p-6">
                  <div className="mb-6 relative">
                      <select 
                          className="w-full p-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-500 outline-none hover:border-blue-300 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                          onChange={(e) => {
                              const asset = availableAssets.find(a => a.id === e.target.value);
                              if (asset) addToCart(asset);
                              e.target.value = ""; 
                          }}
                          value=""
                      >
                          <option value="">+ Bấm vào đây để chọn thiết bị từ danh sách có sẵn...</option>
                          {availableAssets.filter(a => !cart.find(c => c.id === a.id)).map(asset => (
                              <option key={asset.id} value={asset.id}>
                                  [{asset.type}] {asset.name} — ({asset.serialNumber})
                              </option>
                          ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <Plus size={18} />
                      </div>
                  </div>

                  <div className="space-y-3">
                     {cart.length > 0 ? cart.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 transition-all group shadow-sm">
                           <div className="flex items-center space-x-4">
                              <span className="text-[10px] font-black text-gray-300 w-4">{idx + 1}.</span>
                              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                 <Monitor size={18} />
                              </div>
                              <div>
                                 <p className="text-sm font-black text-gray-800">{item.name}</p>
                                 <p className="text-[10px] font-mono text-gray-400">{item.serialNumber} — {item.type}</p>
                              </div>
                           </div>
                           <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                              <X size={18} />
                           </button>
                        </div>
                     )) : (
                        <div className="py-12 text-center border-2 border-dashed border-gray-50 rounded-2xl">
                           <Package size={40} className="mx-auto text-gray-100 mb-2" />
                           <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">Chưa có món đồ nào được chọn</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* RETURN DATE & NOTE */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex-grow">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">3. Ngày trả dự kiến</label>
                  <div className="relative">
                     <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input 
                       type="date" 
                       className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:border-blue-500 outline-none" 
                       value={expectedReturnDate}
                       onChange={(e) => setExpectedReturnDate(e.target.value)}
                     />
                  </div>
               </div>
               <div className="flex-grow">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ghi chú bộ thiết bị</label>
                  <input 
                      type="text" 
                      placeholder="Ví dụ: Đầy đủ 2 mic, 1 dây HDMI..." 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white" 
                  />
               </div>
            </div>
          </div>

          {/* VERIFY & SUBMIT PANEL */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 border-b border-gray-100 bg-gray-900 text-white">
                   <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Xác minh & Bàn giao</h3>
                </div>

                <div className="p-6">
                   <div className="mb-8">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">4. Hình ảnh bàn giao bộ đồ</label>
                      <SelfieCapture onCapture={(data) => setSelfieData(data)} />
                   </div>

                   <div className="pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-8">
                         <span className="text-sm font-bold text-gray-500 uppercase tracking-tighter">Tổng số thiết bị:</span>
                         <span className="text-3xl font-black text-blue-600">{cart.length}</span>
                      </div>
                      
                      <button 
                         disabled={!selectedUser || cart.length === 0 || !selfieData || isSubmitting}
                         onClick={handleSubmit}
                         className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest transition-all shadow-xl ${
                            !selectedUser || cart.length === 0 || !selfieData
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-100'
                         }`}
                      >
                         {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN CẤP PHÁT'}
                      </button>
                      
                      <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400">
                         <ShieldCheck size={14} className="text-green-500" />
                         <span className="text-[10px] font-bold uppercase tracking-tighter">Giao dịch được ký số SHA-256</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {isQrOpen && (
        <QrScanner 
          title={qrType === 'Student' ? "Quét thẻ định danh" : "Quét mã thiết bị"}
          onScan={handleQrScan}
          onClose={() => setIsQrOpen(false)}
        />
      )}
    </>
  );
};

export default EquipmentServiceCounter;

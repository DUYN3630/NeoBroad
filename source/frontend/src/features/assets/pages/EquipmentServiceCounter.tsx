import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import apiClient from '@/lib/axios';
import { 
  Search, 
  User, 
  Package, 
  Calendar, 
  Info, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Handshake,
  ArrowRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface Borrower {
  id: string;
  code: string;
  fullName: string;
  department: string;
  email: string;
  status: 'Active' | 'Warning' | 'Locked';
}

interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  type: string;
  status: 'Available' | 'InUse' | 'Maintenance';
}

const EquipmentServiceCounter = () => {
  const [step, setStep] = useState(1); // 1: Identify, 2: Select Assets, 3: Confirm
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState<Borrower | null>(null);
  const [cart, setCart] = useState<Asset[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchAsset, setSearchAsset] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  // Tìm kiếm người dùng thực tế từ API
  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUser) return;

    try {
      // Gọi API tìm kiếm theo mã (Email prefix)
      const response: any = await apiClient.get(`/Users/search?query=${searchUser}`);
      const result = response.data; // Lấy dữ liệu thực tế từ Axios response
      
      if (result && result.success && result.data) {
        setSelectedUser({
          id: result.data.id,
          code: searchUser,
          fullName: result.data.fullName,
          department: result.data.department || 'N/A',
          email: result.data.email,
          status: 'Active'
        });
        setStep(2);
      } else {
        alert('Không tìm thấy thông tin sinh viên/nhân viên với mã này!');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Lỗi kết nối hệ thống hoặc không tìm thấy người dùng!');
    }
  };

  // Lấy danh sách thiết bị sẵn sàng
  useEffect(() => {
    if (step === 2) {
      // Giả lập API lấy danh sách máy sẵn sàng
      setAssets([
        { id: 'a1', name: 'Laptop Dell XPS 15', serialNumber: 'DELL-XPS-001', type: 'Laptop', status: 'Available' },
        { id: 'a2', name: 'Chuột Logitech MX Master 3', serialNumber: 'LOGI-MX-002', type: 'Accessory', status: 'Available' },
        { id: 'a3', name: 'Màn hình Dell U2419H', serialNumber: 'DELL-MON-003', type: 'Monitor', status: 'Available' },
        { id: 'a4', name: 'Bàn phím Keychron K2', serialNumber: 'KEY-K2-004', type: 'Keyboard', status: 'Available' },
      ]);
    }
  }, [step]);

  const addToCart = (asset: Asset) => {
    if (!cart.find(item => item.id === asset.id)) {
      setCart([...cart, asset]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    if (cart.length === 0 || !expectedReturnDate) {
        alert('Vui lòng chọn thiết bị và ngày trả dự kiến!');
        return;
    }
    
    // Logic gửi API mượn thực tế ở đây
    alert('Giao dịch thành công! Phiếu mượn điện tử đã được tạo.');
    setStep(1);
    setSelectedUser(null);
    setCart([]);
    setSearchUser('');
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
            <Handshake className="mr-3 text-blue-600" size={28} />
            QUẦY GIAO DỊCH THIẾT BỊ
          </h1>
          <p className="text-gray-500 text-sm mt-1">Hệ thống cấp phát và tiếp nhận thiết bị nhanh cho sinh viên & nhân viên.</p>
        </div>
        
        {/* Progress Stepper */}
        <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
          <div className={`flex items-center px-3 py-1.5 rounded-lg transition-all ${step === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold mr-2">1</span>
            <span className="text-[11px] font-black uppercase tracking-wider">Nhận diện</span>
          </div>
          <ArrowRight size={14} className="text-gray-300" />
          <div className={`flex items-center px-3 py-1.5 rounded-lg transition-all ${step === 2 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold mr-2">2</span>
            <span className="text-[11px] font-black uppercase tracking-wider">Chọn đồ</span>
          </div>
          <ArrowRight size={14} className="text-gray-300" />
          <div className={`flex items-center px-3 py-1.5 rounded-lg transition-all ${step === 3 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold mr-2">3</span>
            <span className="text-[11px] font-black uppercase tracking-wider">Hoàn tất</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {step === 1 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard size={32} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Bắt đầu giao dịch mượn mới</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm">Vui lòng nhập Mã sinh viên hoặc Mã nhân viên để kiểm tra thông tin trên hệ thống.</p>
              
              <form onSubmit={handleUserSearch} className="max-w-md mx-auto relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Nhập mã MSSV / MSNV..." 
                  className="w-full pl-12 pr-32 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all text-lg font-bold"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                  KIỂM TRA
                </button>
              </form>
              
              <div className="mt-12 grid grid-cols-3 gap-4">
                 <div className="p-4 rounded-xl bg-gray-50 text-gray-500 text-xs font-medium border border-gray-100">
                    <CheckCircle2 size={16} className="mx-auto mb-2 text-green-500" />
                    Tự động điền tên
                 </div>
                 <div className="p-4 rounded-xl bg-gray-50 text-gray-500 text-xs font-medium border border-gray-100">
                    <ShieldCheck size={16} className="mx-auto mb-2 text-blue-500" />
                    Kiểm tra nợ cũ
                 </div>
                 <div className="p-4 rounded-xl bg-gray-50 text-gray-500 text-xs font-medium border border-gray-100">
                    <Clock size={16} className="mx-auto mb-2 text-purple-500" />
                    Ghi nhận giờ thực
                 </div>
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Asset Selector Area */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-bold text-sm flex items-center"><Package size={16} className="mr-2 text-blue-600" /> DANH SÁCH THIẾT BỊ SẴN SÀNG</h3>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm thiết bị..." 
                        className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-600 w-48"
                        value={searchAsset}
                        onChange={(e) => setSearchAsset(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 max-h-[400px] overflow-y-auto">
                   {assets.filter(a => a.name.toLowerCase().includes(searchAsset.toLowerCase())).map(asset => (
                     <div key={asset.id} className="group p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between" onClick={() => addToCart(asset)}>
                        <div className="flex items-center space-x-3">
                           <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                              <Monitor size={18} className="text-gray-500 group-hover:text-blue-600" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-gray-800">{asset.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{asset.serialNumber}</p>
                           </div>
                        </div>
                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                           <Plus size={14} />
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              {/* Transaction Notes */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                 <h3 className="font-bold text-sm mb-4 flex items-center"><Info size={16} className="mr-2 text-blue-600" /> THÔNG TIN BỔ SUNG</h3>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[11px] font-black text-gray-400 uppercase tracking-tighter mb-2">Ngày trả dự kiến</label>
                       <div className="relative">
                          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="date" 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:border-blue-600 outline-none" 
                            value={expectedReturnDate}
                            onChange={(e) => setExpectedReturnDate(e.target.value)}
                          />
                       </div>
                    </div>
                    <div>
                       <label className="block text-[11px] font-black text-gray-400 uppercase tracking-tighter mb-2">Ghi chú tình trạng giao</label>
                       <input type="text" placeholder="Ví dụ: Máy trầy xước nhẹ, đầy đủ sạc..." className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:border-blue-600 outline-none" />
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Transaction Summary / Sidebar */}
        <div className="lg:col-span-4">
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm sticky top-24 overflow-hidden">
              <div className="p-5 border-b border-gray-50 bg-gray-900 text-white">
                 <h3 className="font-bold text-xs uppercase tracking-widest text-blue-400">Tóm tắt giao dịch</h3>
              </div>
              
              <div className="p-6">
                 {/* User Info Section */}
                 <div className="mb-8">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Người mượn</label>
                    {selectedUser ? (
                       <div className="flex items-center space-x-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-200">
                             {selectedUser.fullName.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                             <p className="text-sm font-black text-gray-900 truncate">{selectedUser.fullName}</p>
                             <p className="text-[11px] text-blue-600 font-bold">{selectedUser.code}</p>
                          </div>
                          <button onClick={() => {setStep(1); setSelectedUser(null); setCart([]);}} className="ml-auto p-1 text-gray-400 hover:text-red-500">
                             <X size={14} />
                          </button>
                       </div>
                    ) : (
                       <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <User size={20} className="mx-auto mb-1 text-gray-300" />
                          <p className="text-[11px] text-gray-400 italic">Chưa xác định</p>
                       </div>
                    )}
                 </div>

                 {/* Cart Items Section */}
                 <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh sách chọn ({cart.length})</label>
                       {cart.length > 0 && <button onClick={() => setCart([])} className="text-[10px] font-bold text-red-500 hover:underline">Xóa hết</button>}
                    </div>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                       {cart.length > 0 ? cart.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg group">
                             <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-white rounded border border-gray-100">
                                   <Monitor size={12} className="text-blue-600" />
                                </div>
                                <span className="text-[12px] font-bold text-gray-700 truncate max-w-[150px]">{item.name}</span>
                             </div>
                             <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <X size={14} />
                             </button>
                          </div>
                       )) : (
                          <div className="text-center py-8 text-gray-300">
                             <Package size={24} className="mx-auto mb-2 opacity-20" />
                             <p className="text-[11px] italic">Chưa chọn thiết bị nào</p>
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                       <span className="text-sm font-bold text-gray-500">Tổng số lượng:</span>
                       <span className="text-lg font-black text-blue-600">{cart.length}</span>
                    </div>
                    
                    <button 
                       disabled={step < 2 || cart.length === 0}
                       onClick={handleSubmit}
                       className={`w-full py-4 rounded-xl font-black text-sm tracking-widest transition-all shadow-xl shadow-blue-100 ${
                          step >= 2 && cart.length > 0 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                       }`}
                    >
                       XÁC NHẬN & GIAO ĐỒ
                    </button>
                    
                    <div className="mt-4 flex items-center justify-center space-x-1 text-gray-400">
                       <AlertCircle size={10} />
                       <span className="text-[10px] font-medium italic">Giao dịch sẽ được lưu vào lịch sử hệ thống</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EquipmentServiceCounter;

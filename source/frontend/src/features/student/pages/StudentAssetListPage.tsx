import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Laptop, 
  Monitor, 
  Printer, 
  Network, 
  Database, 
  Search, 
  Plus, 
  Minus,
  ShoppingCart,
  Calendar,
  Camera,
  Check,
  AlertCircle,
  Clock,
  ShieldCheck,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Boxes,
  X,
  Hash,
  MapPin,
  Info,
  SlidersHorizontal
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  status: string;
  location: string;
}

interface Toolset {
  id: string;
  name: string;
  code: string;
  description: string;
  availableQuantity: number;
  totalQuantity: number;
  location: string;
  itemsDetail: string;
}

const ITEMS_PER_PAGE = 6;

const StudentAssetListPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { tab?: 'assets' | 'toolsets'; category?: string } | null;

  const [assets, setAssets] = useState<any[]>([]);
  const [debugRawAssets, setDebugRawAssets] = useState<any[]>([]);
  const [toolsets, setToolsets] = useState<Toolset[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'assets' | 'toolsets'
  const [activeTab, setActiveTab] = useState<'assets' | 'toolsets'>(state?.tab || 'assets');

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(state?.category || 'All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  const isFirstRender = React.useRef(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Cart State (Unified slide-out drawer cart)
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Toolset detail popover state
  const [selectedToolsetDetail, setSelectedToolsetDetail] = useState<Toolset | null>(null);
  
  // Checkout Form State
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Success state
  const [successData, setSuccessData] = useState<any | null>(null);

  // Group assets by name + type + location
  const groupAssets = (individualAssets: any[]) => {
    const groups: { [key: string]: any } = {};
    individualAssets.forEach(asset => {
      const key = `${asset.name}_${asset.type}_${asset.location}`;
      if (!groups[key]) {
        groups[key] = {
          id: key, // Dùng key làm ID định danh trong giỏ hàng
          name: asset.name,
          type: asset.type,
          location: asset.location || 'Không xác định',
          availableQuantity: 0,
          allAssetIds: [],
          serialNumbers: []
        };
      }
      groups[key].availableQuantity += 1;
      groups[key].allAssetIds.push(asset.id);
      if (asset.serialNumber) {
        groups[key].serialNumbers.push(asset.serialNumber);
      }
    });
    return Object.values(groups);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, toolsetsRes] = await Promise.all([
        apiClient.get('/Assets'),
        apiClient.get('/Toolsets')
      ]);
      
      setDebugRawAssets(assetsRes.data || []);
      
      // Hiển thị các thiết bị có trạng thái hoạt động bình thường (không hỏng hóc, đang bảo trì, đã thanh lý)
      const availableAssets = assetsRes.data.filter(
        (a: any) => {
          const status = a.status?.toLowerCase() || '';
          return status === 'active' || status === 'available' || status === 'sẵn sàng' || status === 'hoạt động' || status === '';
        }
      );
      
      // Gom nhóm các thiết bị cùng tên, cùng loại, cùng vị trí lưu kho
      const grouped = groupAssets(availableAssets);
      setAssets(grouped as any[]);

      // Hiển thị các bộ dụng cụ có số lượng khả dụng > 0
      const availableToolsets = toolsetsRes.data.filter((t: any) => t.availableQuantity > 0);
      setToolsets(availableToolsets);
    } catch (err) {
      console.error('Lỗi fetch dữ liệu đăng ký mượn:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch both Assets and Toolsets
  useEffect(() => {
    fetchData();
  }, []);

  // Reset pagination when category, location, search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLocation, activeTab]);

  const addToCart = (item: any, itemType: 'asset' | 'toolset') => {
    if (cart.some(cartItem => cartItem.id === item.id)) return;
    setCart([...cart, { 
      id: item.id,
      name: item.name,
      location: item.location,
      cartItemType: itemType,
      quantity: 1,
      availableQuantity: item.availableQuantity,
      allAssetIds: itemType === 'asset' ? item.allAssetIds : undefined
    }]);
  };

  const updateCartItemQuantity = (id: string, newQty: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const qty = Math.max(1, Math.min(newQty, item.availableQuantity));
        return { ...item, quantity: qty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEvidencePhoto(base64String);
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Vui lòng chọn ít nhất 1 thiết bị vào giỏ hàng.');
      return;
    }
    if (!expectedReturnDate) {
      alert('Vui lòng chọn ngày trả dự kiến.');
      return;
    }

    try {
      const assetIds: string[] = [];
      const toolsetItems: { toolsetId: string; quantity: number }[] = [];

      cart.forEach(item => {
        if (item.cartItemType === 'asset') {
          // Lấy đúng số lượng asset ID tương ứng với số lượng người dùng chọn
          const selectedIds = item.allAssetIds.slice(0, item.quantity);
          assetIds.push(...selectedIds);
        } else if (item.cartItemType === 'toolset') {
          toolsetItems.push({
            toolsetId: item.id,
            quantity: item.quantity
          });
        }
      });

      const payload = {
        studentId: user?.id,
        expectedReturnDate: new Date(expectedReturnDate).toISOString(),
        assetIds: assetIds,
        toolsetItems: toolsetItems,
        evidencePhoto: evidencePhoto,
        purpose: purpose
      };

      const res = await apiClient.post('/Borrow/create-request', payload);
      setSuccessData(res.data);
      setCart([]);
      setIsCartOpen(false);
      setExpectedReturnDate('');
      setPurpose('');
      setEvidencePhoto(null);
      setPhotoPreview(null);
      
      // Tải lại dữ liệu mới từ backend
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi đăng ký mượn thiết bị!');
    }
  };

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'laptop': return <Laptop size={20} className="text-blue-500" />;
      case 'monitor': return <Monitor size={20} className="text-purple-500" />;
      case 'printer': return <Printer size={20} className="text-orange-500" />;
      case 'network': return <Network size={20} className="text-green-500" />;
      default: return <Database size={20} className="text-gray-500" />;
    }
  };

  // Get distinct asset types and locations for filter
  const categories = ['All', ...Array.from(new Set(assets.map(a => a.type)))];
  const locations = ['All', ...Array.from(new Set([
    ...assets.map(a => a.location).filter(Boolean),
    ...toolsets.map(t => t.location).filter(Boolean)
  ]))];

  // Reset filters when tab changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSelectedCategory('All');
    setSelectedLocation('All');
    setSearchTerm('');
    setCurrentPage(1);
  }, [activeTab]);

  // Filtering Logic
  const getFilteredItems = () => {
    if (activeTab === 'assets') {
      return assets.filter(a => {
        const matchesSearch = a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (a.serialNumbers && a.serialNumbers.some((sn: string) => sn.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesCat = selectedCategory === 'All' || a.type === selectedCategory;
        const matchesLoc = selectedLocation === 'All' || a.location === selectedLocation;
        return !!(matchesSearch && matchesCat && matchesLoc);
      });
    } else {
      return toolsets.filter(t => {
        const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLoc = selectedLocation === 'All' || t.location === selectedLocation;
        return matchesSearch && matchesLoc;
      });
    }
  };

  const filteredItems = getFilteredItems();
  
  // Pagination Calculations
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/student/portal')} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase">Đăng ký mượn thiết bị mới</h1>
            <p className="text-gray-500 text-sm">Chọn thiết bị đơn lẻ hoặc bộ dụng cụ thực hành cần mượn.</p>
          </div>
        </div>
        
        {/* Toggle Tab */}
        <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200/50 shadow-inner">
          <button 
            onClick={() => setActiveTab('assets')}
            className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase transition-all flex items-center ${
              activeTab === 'assets' ? 'bg-white text-[#0066cc] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Boxes size={14} className="mr-1.5" /> Thiết bị đơn lẻ
          </button>
          <button 
            onClick={() => setActiveTab('toolsets')}
            className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase transition-all flex items-center ${
              activeTab === 'toolsets' ? 'bg-white text-[#0066cc] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wrench size={14} className="mr-1.5" /> Bộ dụng cụ thực hành
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm self-start">
          <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
            <SlidersHorizontal size={18} className="text-gray-700" />
            <h3 className="font-bold text-gray-800 text-sm uppercase">Bộ lọc tìm kiếm</h3>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Từ khóa</label>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={activeTab === 'assets' ? "Tên, serial..." : "Tên bộ, mã..."}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl text-xs focus:bg-white focus:border-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter (Only for Assets) */}
          {activeTab === 'assets' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loại thiết bị</label>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedCategory === cat 
                        ? 'bg-blue-50/50 border-blue-200 text-[#0066cc]' 
                        : 'bg-white border-transparent text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {cat === 'All' ? 'Tất cả loại máy' : cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vị trí lưu kho</label>
            <div className="flex flex-col gap-1.5">
              {locations.map((loc) => (
                <button 
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedLocation === loc 
                      ? 'bg-blue-50/50 border-blue-200 text-[#0066cc]' 
                      : 'bg-white border-transparent text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {loc === 'All' ? 'Tất cả vị trí' : loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assets Grid Section */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="p-12 text-center text-gray-400 italic">Đang tải danh sách tài nguyên...</div>
          ) : currentItems.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentItems.map((item) => {
                  const isInCart = cart.some(c => c.id === item.id);
                  
                  if (activeTab === 'assets') {
                    const asset = item as any;
                    return (
                      <div key={asset.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="p-3 bg-blue-50/80 rounded-2xl text-[#0066cc] group-hover:scale-110 transition-transform duration-300">
                              {getIcon(asset.type)}
                            </div>
                            <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-green-100">
                              Sẵn sàng
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-950 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{asset.name}</h4>
                            <div className="mt-4 space-y-2 text-[11px] text-gray-500">
                              <p className="flex items-center">
                                <span className="font-medium text-gray-400">Số lượng khả dụng:</span>
                                <strong className="ml-1.5 text-gray-800 font-bold bg-blue-50/50 px-1.5 py-0.5 rounded text-[10px]">{asset.availableQuantity} chiếc</strong>
                              </p>
                              {asset.availableQuantity === 1 && asset.serialNumbers?.[0] && (
                                <p className="flex items-center"><Hash size={13} className="mr-1.5 text-gray-400" /> <span className="font-mono uppercase tracking-wider">{asset.serialNumbers[0]}</span></p>
                              )}
                              <p className="flex items-center"><MapPin size={13} className="mr-1.5 text-gray-400" /> {asset.location || 'Không xác định'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{asset.type}</span>
                          {isInCart ? (
                            <div className="flex items-center space-x-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-inner">
                              <button
                                type="button"
                                onClick={() => {
                                  const cartItem = cart.find(c => c.id === asset.id);
                                  if (cartItem) {
                                    if (cartItem.quantity > 1) {
                                      updateCartItemQuantity(asset.id, cartItem.quantity - 1);
                                    } else {
                                      removeFromCart(asset.id);
                                    }
                                  }
                                }}
                                className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 font-black text-xs transition-all active:scale-90"
                              >
                                -
                              </button>
                              <span className="font-black text-xs text-gray-800 min-w-[16px] text-center">
                                {cart.find(c => c.id === asset.id)?.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const cartItem = cart.find(c => c.id === asset.id);
                                  if (cartItem) {
                                    updateCartItemQuantity(asset.id, cartItem.quantity + 1);
                                  }
                                }}
                                className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:text-[#0066cc] font-black text-xs transition-all active:scale-90"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => addToCart(asset, 'asset')}
                              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#0066cc] rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center transition-all"
                            >
                              <Plus size={12} className="mr-1" /> Chọn mượn
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    const toolset = item as Toolset;
                    return (
                      <div key={toolset.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="p-3 bg-amber-50/80 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform duration-300">
                              <Wrench size={18} />
                            </div>
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-amber-100">
                              Còn {toolset.availableQuantity} bộ
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-950 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{toolset.name}</h4>
                            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 min-h-[2rem] italic">{toolset.description}</p>
                            <div className="mt-4 space-y-2 text-[11px] text-gray-500">
                              <p className="flex items-center"><Hash size={13} className="mr-1.5 text-gray-400" /> Mã bộ: <span className="font-bold">{toolset.code}</span></p>
                              <p className="flex items-center"><MapPin size={13} className="mr-1.5 text-gray-400" /> {toolset.location || 'Kho kỹ thuật'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                          <button 
                            type="button"
                            onClick={() => setSelectedToolsetDetail(toolset)}
                            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl text-[11px] font-bold transition-all flex items-center"
                            title="Xem vật tư bên trong"
                          >
                            <Info size={14} className="mr-1 text-gray-400" /> Vật tư
                          </button>
                          {isInCart ? (
                            <div className="flex items-center space-x-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-inner">
                              <button
                                type="button"
                                onClick={() => {
                                  const cartItem = cart.find(c => c.id === toolset.id);
                                  if (cartItem) {
                                    if (cartItem.quantity > 1) {
                                      updateCartItemQuantity(toolset.id, cartItem.quantity - 1);
                                    } else {
                                      removeFromCart(toolset.id);
                                    }
                                  }
                                }}
                                className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 font-black text-xs transition-all active:scale-90"
                              >
                                -
                              </button>
                              <span className="font-black text-xs text-gray-800 min-w-[16px] text-center">
                                {cart.find(c => c.id === toolset.id)?.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const cartItem = cart.find(c => c.id === toolset.id);
                                  if (cartItem) {
                                    updateCartItemQuantity(toolset.id, cartItem.quantity + 1);
                                  }
                                }}
                                className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:text-[#0066cc] font-black text-xs transition-all active:scale-90"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => addToCart(toolset, 'toolset')}
                              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#0066cc] rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center transition-all"
                            >
                              <Plus size={12} className="mr-1" /> Chọn mượn
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-medium">
                    Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredItems.length)} trong tổng số {filteredItems.length} mục
                  </p>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-gray-700">{currentPage} / {totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 bg-white rounded-3xl border border-dashed border-gray-200 text-center text-gray-400 italic">
              Không có dữ liệu phù hợp nào khả dụng.
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-[#0066cc] text-white rounded-full shadow-2xl hover:bg-[#0052a3] hover:scale-105 active:scale-95 transition-all z-40 flex items-center justify-center group"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black border-2 border-white animate-bounce">
            {cart.length}
          </span>
        </button>
      )}

      {/* Slide-out Cart Drawer Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 transition-opacity duration-300"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Slide-out Cart Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 flex flex-col justify-between ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-black text-gray-900 uppercase tracking-tight flex items-center">
              <ShoppingCart size={20} className="mr-2 text-blue-600" /> Giỏ thiết bị mượn
            </h3>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <X size={20} />
            </button>
          </div>

          {cart.length > 0 ? (
            <form onSubmit={handleCheckout} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Thiết bị đã chọn ({cart.length})</label>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-gray-100">
                  {cart.map(item => (
                    <div key={item.id} className="flex flex-col py-3 border-b border-gray-100 gap-2 first:pt-0">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col truncate max-w-[280px]">
                          <span className="font-bold text-gray-800 truncate text-xs">{item.name}</span>
                          <span className="text-[9px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded font-black uppercase ${
                              item.cartItemType === 'asset' ? 'bg-blue-50 text-[#0066cc]' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {item.cartItemType === 'asset' ? 'Thiết bị' : 'Bộ dụng cụ'}
                            </span>
                            <span>•</span>
                            <span>{item.location}</span>
                          </span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors"
                        >
                          Xóa
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50/50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Số lượng mượn:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="font-black text-xs text-gray-800 min-w-[20px] text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all font-bold text-xs"
                          >
                            +
                          </button>
                          <span className="text-[10px] text-gray-400 font-medium">/ Tối đa {item.availableQuantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="k-label flex items-center text-xs"><Calendar size={13} className="mr-1.5 text-gray-400" /> Ngày trả dự kiến <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  required 
                  className="k-input" 
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                />
              </div>

              <div>
                <label className="k-label text-xs">Mục đích sử dụng thiết bị</label>
                <textarea 
                  rows={3} 
                  className="k-input resize-none" 
                  placeholder="Điền lý do mượn (ví dụ: làm đồ án tốt nghiệp, thực hành phòng máy)..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div>
                <label className="k-label flex items-center text-xs"><Camera size={13} className="mr-1.5 text-gray-400" /> Ảnh chụp Selfie xác thực</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {photoPreview && (
                <div className="flex items-center justify-center p-2 border rounded-2xl bg-gray-50 border-gray-200/50">
                  <img src={photoPreview} alt="Selfie" className="max-h-28 rounded-xl object-contain" />
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all mt-4 flex items-center justify-center shadow-lg shadow-blue-500/25"
              >
                GỬI YÊU CẦU ĐĂNG KÝ
              </button>
            </form>
          ) : (
            <div className="text-center py-12 text-gray-400 italic text-xs">
              Giỏ hàng của bạn đang trống.
            </div>
          )}
        </div>
      </div>

      {/* Toolset Detail Modal */}
      {selectedToolsetDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center text-sm uppercase">
                  <Wrench size={16} className="mr-2 text-amber-600" />
                  Chi tiết Bộ dụng cụ
                </h3>
                <button 
                  onClick={() => setSelectedToolsetDetail(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-gray-950">{selectedToolsetDetail.name}</p>
                <p className="text-xs text-gray-500">{selectedToolsetDetail.description}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/50">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">Vật tư phụ tùng bên trong</span>
                <div className="text-xs font-mono whitespace-pre-line text-gray-700 max-h-48 overflow-y-auto leading-relaxed">
                  {selectedToolsetDetail.itemsDetail || 'Không có chi tiết vật tư phụ tùng.'}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setSelectedToolsetDetail(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs uppercase transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-6">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
                <Check size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-950 uppercase">Đăng ký mượn thành công!</h3>
                <p className="text-xs text-gray-500 mt-2">Vui lòng đem mã SV tới quầy bàn giao của thủ kho để nhận đồ.</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl text-left border border-gray-100 space-y-4 font-mono text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Mã Hash giao dịch (Blockchain-lite)</span>
                  <div className="p-2.5 bg-blue-50/50 text-[#0066cc] rounded-xl font-bold border border-blue-100 break-all select-all">
                    {successData.transactionHash}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Mã Hash khối trước đó (Previous Hash)</span>
                  <div className="p-2.5 bg-gray-100 text-gray-500 rounded-xl break-all">
                    {successData.previousHash || 'Chưa có khối trước'}
                  </div>
                </div>

                <div className="flex items-center text-[10px] text-green-600 font-bold">
                  <ShieldCheck size={14} className="mr-1.5" /> Giao dịch đã được khóa mã hóa, bất biến trong nhật ký hệ thống.
                </div>
              </div>

              <button 
                onClick={() => setSuccessData(null)}
                className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              >
                ĐỒNG Ý & ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssetListPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import apiClient from '@/lib/axios';
import { 
  ArrowLeft, 
  Settings, 
  History, 
  Info, 
  Calendar, 
  ShieldCheck, 
  Cpu,
  Monitor,
  HardDrive,
  Hash
} from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  serialNumber: string;
  type: string;
  status: string;
  createdAt: string;
}

const AssetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/Assets/${id}`)
      .then(res => setAsset(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <MainLayout><div className="p-8 text-center">Đang tải...</div></MainLayout>;
  if (!asset) return <MainLayout><div className="p-8 text-center text-red-500">Không tìm thấy thiết bị!</div></MainLayout>;

  return (
    <MainLayout>
      <button 
        onClick={() => navigate('/assets')}
        className="flex items-center text-gray-500 hover:text-[#0066cc] mb-6 transition-colors font-bold text-sm"
      >
        <ArrowLeft size={18} className="mr-2" /> Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    asset.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                    {asset.status}
                </span>
            </div>
            
            <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0066cc]">
                    <Monitor size={48} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">{asset.name}</h1>
                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                        <span className="flex items-center"><Hash size={14} className="mr-1" /> {asset.serialNumber}</span>
                        <span className="flex items-center"><Settings size={14} className="mr-1" /> {asset.type}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-50">
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Ngày nhập kho</p>
                    <p className="text-sm font-bold text-gray-700">{new Date(asset.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Thời hạn bảo hành</p>
                    <p className="text-sm font-bold text-gray-700">36 tháng</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Phòng ban sở hữu</p>
                    <p className="text-sm font-bold text-[#0066cc]">Phòng Kỹ thuật</p>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-6 flex items-center">
                <Cpu size={20} className="mr-2 text-blue-500" /> Cấu hình chi tiết
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: "Vi xử lý (CPU)", value: "Intel Core i7-12700H", icon: <Cpu size={16} /> },
                    { label: "Bộ nhớ (RAM)", value: "16GB DDR5 4800MHz", icon: <Info size={16} /> },
                    { label: "Ổ cứng (SSD)", value: "512GB NVMe Gen 4", icon: <HardDrive size={16} /> },
                    { label: "Màn hình", value: "15.6 inch OLED 4K", icon: <Monitor size={16} /> },
                ].map((spec, i) => (
                    <div key={i} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-blue-500 mr-4">{spec.icon}</div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-bold uppercase">{spec.label}</p>
                            <p className="text-sm font-bold text-gray-700">{spec.value}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: LỊCH SỬ BẢO TRÌ */}
        <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-6 flex items-center">
                    <History size={20} className="mr-2 text-orange-500" /> Lịch sử bảo trì
                </h3>
                <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {[
                        { title: "Bảo trì định kỳ", date: "15/03/2026", status: "Xong" },
                        { title: "Thay bàn phím mới", date: "10/01/2026", status: "Xong" },
                        { title: "Kiểm tra hệ thống", date: "05/12/2025", status: "Xong" },
                    ].map((item, i) => (
                        <div key={i} className="relative pl-8">
                            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-4 border-orange-500 flex items-center justify-center z-10"></div>
                            <p className="text-sm font-bold text-gray-700">{item.title}</p>
                            <p className="text-xs text-gray-400">{item.date} • {item.status}</p>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-8 py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-[#0066cc] hover:text-[#0066cc] transition-all">
                    Xem toàn bộ lịch sử
                </button>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl shadow-gray-200">
                <h4 className="font-bold flex items-center mb-4">
                    <ShieldCheck size={18} className="mr-2 text-green-400" /> Trạng thái kiểm định
                </h4>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">Thiết bị này đã vượt qua tất cả các bài kiểm tra an toàn điện vào tháng 3/2026.</p>
                <div className="flex justify-between text-xs font-bold">
                    <span>Lần tới:</span>
                    <span className="text-green-400">15/09/2026</span>
                </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AssetDetailsPage;

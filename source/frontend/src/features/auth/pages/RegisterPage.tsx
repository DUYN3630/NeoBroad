import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '@/lib/axios';
import { User, Mail, Phone, Lock, CheckCircle2, ChevronRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import sideImage from '@/assets/images/Hinhanhthietbilophoc.jpg';

const RegisterPage = () => {
  const [step, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '', email: '', phone: '', fullName: '', password: '', code: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/Auth/register', formData);
      setActiveStep(2);
    } catch (err) {
      alert('Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SIDE - IMAGE */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <img 
            src={sideImage} 
            alt="Classroom Equipment" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0072C6]/90 to-[#001a33]/90 mix-blend-multiply"></div>
        
        <div className="relative z-10 flex flex-col justify-center p-16 text-white h-full">
            <div className="mb-12">
                <h1 className="text-5xl font-black mb-6 leading-tight tracking-tighter">
                    THIẾT LẬP <br /> TÀI KHOẢN MỚI
                </h1>
                <div className="w-20 h-1.5 bg-blue-400 rounded-full mb-8"></div>
                <p className="text-xl text-blue-100 font-medium max-w-md leading-relaxed">
                    Đăng ký để bắt đầu quản lý và tối ưu hóa tài sản hạ tầng trường học của bạn ngay hôm nay.
                </p>
            </div>

            <div className="space-y-8">
                {[
                    { t: "Quy trình 2 bước", d: "Xác thực bảo mật qua SĐT cá nhân." },
                    { t: "Truy cập tức thì", d: "Sẵn sàng quản lý hàng nghìn thiết bị." },
                ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-4">
                        <div className="p-2 bg-white/10 rounded-lg border border-white/20"><CheckCircle2 size={20} className="text-blue-300" /></div>
                        <div>
                            <p className="font-bold text-lg leading-tight">{item.t}</p>
                            <p className="text-sm text-blue-200/70 mt-1">{item.d}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 relative bg-white">
        <div className="w-full max-w-[480px]">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Đăng ký thành viên</h2>
                    <p className="text-gray-400 font-medium">Bước {step} của 2: {step === 1 ? 'Thông tin cá nhân' : 'Xác minh OTP'}</p>
                </div>
                {step === 2 && (
                    <button onClick={() => setActiveStep(1)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full transition-all border border-gray-100 shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                )}
            </div>

            {step === 1 ? (
                <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-1.5">
                            <label className="k-label">Họ và tên đầy đủ</label>
                            <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="k-input h-12" placeholder="VD: Nguyễn Văn A" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="k-label">Số điện thoại (Nhận mã xác thực)</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="k-input h-12 pl-10" placeholder="09xx xxx xxx" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="k-label">Địa chỉ Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="k-input h-12 pl-10" placeholder="user@ams.com" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="k-label">Mật khẩu bảo mật</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="k-input h-12 pl-10" placeholder="Tối thiểu 8 ký tự" />
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-[#1a1a1a] hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center space-x-3 mt-8 transition-all">
                        <span>{loading ? 'Đang gửi yêu cầu...' : 'Tiếp tục xác thực OTP'}</span>
                        {!loading && <ChevronRight size={18} />}
                    </button>
                </form>
            ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl flex items-start space-x-4 text-blue-700 text-sm leading-relaxed shadow-sm">
                        <ShieldCheck size={24} className="shrink-0 text-blue-500" />
                        <p>Chúng tôi đã gửi mã xác thực tới <span className="font-bold underline">{formData.phone}</span>. Mã có hiệu lực trong 5 phút.</p>
                    </div>
                    <div className="space-y-6">
                        <input type="text" maxLength={6} className="w-full text-center text-5xl font-black tracking-[0.5em] py-6 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#0072C6]/10 focus:border-[#0072C6] transition-all" placeholder="000000" />
                        <button className="w-full bg-[#0072C6] hover:bg-[#005a9e] text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-100 uppercase text-xs tracking-widest transition-all">Xác nhận & Hoàn tất</button>
                    </div>
                    <p className="text-center text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                        Không nhận được mã? <span className="text-[#0072C6] cursor-pointer hover:underline">Gửi lại yêu cầu</span>
                    </p>
                </div>
            )}

            <div className="mt-16 text-center pt-8 border-t border-gray-50">
                <p className="text-sm text-gray-500 font-medium">Đã có tài khoản hệ thống? <Link to="/login" className="text-[#0072C6] font-bold hover:underline ml-1">Đăng nhập</Link></p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/axios';
import { Mail, Lock, LogIn, RefreshCw, ChevronRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import sideImage from '@/assets/images/Hinhanhthietbilophoc.jpg';

const LoginPage = () => {
  const [formData, setFormData] = useState({ emailOrPhone: '', password: '', captcha: '', captchaID: '' });
  const [captchaImg, setCaptchaImg] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const fetchCaptcha = async () => {
    try {
      const response = await apiClient.get('/Auth/captcha');
      setCaptchaImg(response.data.captchaImage);
      setFormData(prev => ({ ...prev, captchaID: response.data.captchaID }));
    } catch (error) {
      console.error('Failed to fetch captcha');
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.post('/Auth/login', formData);
      setAuth(response.data.accessToken, response.data.user);
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Đăng nhập thất bại!');
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC ĐĂNG NHẬP GOOGLE ---
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Gửi Access Token nhận từ Google sang Backend để xác thực và lấy thông tin User
        const res = await apiClient.post('/Auth/google-login', { 
            idToken: tokenResponse.access_token 
        });
        
        setAuth(res.data.accessToken, res.data.user);
        alert('Đăng nhập bằng Google thành công!');
        navigate('/');
      } catch (err) {
        alert('Lỗi xác thực tài khoản Google!');
      } finally {
        setLoading(false);
      }
    },
    onError: () => alert('Đăng nhập Google thất bại!'),
  });

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SIDE - IMAGE */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <img 
            src={sideImage} 
            alt="Classroom Equipment" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0072C6]/80 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-end p-16 text-white h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-xl">
                <span className="text-[#0072C6] font-black text-2xl uppercase">A</span>
            </div>
            <h1 className="text-5xl font-black mb-4 leading-tight tracking-tighter uppercase text-white">
                AMS <br /> Infrastructure
            </h1>
            <p className="text-xl text-blue-50 font-medium max-w-md leading-relaxed opacity-90">
                Giải pháp quản lý tài sản và thiết bị trường học chuyên nghiệp, hiện đại và tin cậy.
            </p>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 relative bg-white">
        <div className="w-full max-w-[440px]">
            <div className="mb-12">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Chào mừng trở lại</h2>
                <p className="text-gray-400 font-medium">Vui lòng đăng nhập vào hệ thống quản trị</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="k-label">Tài khoản truy cập</label>
                    <input 
                        type="text" required
                        className="k-input h-12" 
                        placeholder="Email hoặc số điện thoại"
                        value={formData.emailOrPhone}
                        onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="k-label mb-0">Mật khẩu</label>
                        <Link to="/forgot-password" title="Khôi phục mật khẩu" className="text-[11px] font-bold text-[#0072C6] hover:underline uppercase">Quên?</Link>
                    </div>
                    <input 
                        type="password" required
                        className="k-input h-12" 
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <div>
                    <label className="k-label">Mã xác nhận bảo mật</label>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <input 
                            type="text" required
                            className="k-input h-12 text-center font-bold tracking-widest" 
                            placeholder="Mã Captcha"
                            value={formData.captcha}
                            onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
                        />
                        <div className="relative h-12 group cursor-pointer" onClick={fetchCaptcha}>
                            <img src={`data:image/png;base64,${captchaImg}`} alt="captcha" className="h-full w-full rounded border border-gray-200 object-cover" />
                            <div className="absolute inset-0 bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                <RefreshCw size={14} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" disabled={loading}
                    className="w-full bg-[#1a1a1a] hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center space-x-3 transition-all mt-6"
                >
                    <span>{loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}</span>
                    {!loading && <ChevronRight size={18} />}
                </button>
            </form>

            <div className="mt-10">
                <div className="relative flex items-center justify-center mb-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                    <span className="relative px-4 bg-white text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Hoặc đăng nhập với</span>
                </div>
                
                <button 
                    onClick={() => loginWithGoogle()}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-[11px] text-gray-500 uppercase tracking-widest shadow-sm"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="google" />
                    <span>{loading ? 'Vui lòng đợi...' : 'Tiếp tục với Google'}</span>
                </button>
            </div>

            <div className="mt-16 text-center">
                <p className="text-xs text-gray-400 font-medium">Chưa có tài khoản truy cập? <Link to="/register" className="text-[#0072C6] font-bold hover:underline ml-1">Đăng ký thành viên</Link></p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

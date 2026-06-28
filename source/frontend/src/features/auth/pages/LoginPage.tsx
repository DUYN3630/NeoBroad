import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/axios';
import { Mail, Lock, LogIn, RefreshCw, ChevronRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import sideImage from '@/assets/images/Hinhanhthietbilophoc.jpg';
import SmsOtpVerification from '../components/SmsOtpVerification';

const LoginPage = () => {
  const [formData, setFormData] = useState({ emailOrPhone: '', password: '', captcha: '', captchaID: '' });
  const [captchaImg, setCaptchaImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tempAuth, setTempAuth] = useState<{ accessToken: string; user: any } | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const fetchCaptcha = async () => {
    try {
      const response = await apiClient.get('/Auth/captcha');
      // API hiện tại trả về URL path: /shared/UserFiles/Captcha/xxx.png
      // Cần nối thêm baseURL nếu cần, hoặc để path tuyệt đối nếu proxy đúng
      setCaptchaImg(`http://localhost:5054${response.data.captchaImage}`);
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
      const response: any = await apiClient.post('/Auth/login', formData);
      const { accessToken, user } = response.data;
      
      // Lưu tạm phiên đăng nhập để chuyển sang bước SMS OTP
      setTempAuth({ accessToken, user });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Đăng nhập thất bại!');
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = (phoneNumber: string) => {
    if (!tempAuth) return;
    setAuth(tempAuth.accessToken, { ...tempAuth.user, phoneNumber, isPhoneVerified: true });
    
    // Chuyển hướng theo Role sau khi đã qua SMS OTP
    const user = tempAuth.user;
    if (user.role === 0 || user.role === 1) {
      navigate('/'); // Admin & Staff
    } else if (user.role === 2) {
      navigate('/teacher/dashboard');
    } else {
      navigate('/student/portal');
    }
  };

  const handleOtpCancel = () => {
    setTempAuth(null);
    fetchCaptcha();
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
        
        const { accessToken, user } = res.data;
        setAuth(accessToken, user);
        
        alert('Đăng nhập bằng Google thành công!');
        
        // Redirect based on role
        if (user.role === 0 || user.role === 1) {
          navigate('/'); // Admin & Staff
        } else if (user.role === 2) {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/portal');
        }
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
            {tempAuth ? (
              <SmsOtpVerification 
                userId={tempAuth.user.id}
                accessToken={tempAuth.accessToken}
                onSuccess={handleOtpSuccess}
                onCancel={handleOtpCancel}
              />
            ) : (
              <>
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
                            <div className="relative h-12 group cursor-pointer bg-gray-50 flex items-center justify-center rounded border border-gray-200" onClick={fetchCaptcha}>
                                {captchaImg ? (
                                    <img src={captchaImg} alt="captcha" className="h-full w-full rounded object-cover" />
                                ) : (
                                    <div className="animate-pulse flex space-x-2">
                                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                                    </div>
                                )}
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
              </>
            )}


        </div>
      </div>
    </div>
  );
};

export default LoginPage;

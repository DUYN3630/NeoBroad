import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, LogIn } from 'lucide-react';
import { API_BASE_URL, BACKEND_URL } from '@/lib/config';

const LoginPage = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaData, setCaptchaData] = useState({ captchaID: '', captchaImage: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Khởi tạo API client với cấu hình CORS
  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
  });

  const fetchCaptcha = async () => {
    try {
      const response = await api.get('/Auth/captcha');
      setCaptchaData(response.data);
    } catch (error) {
      console.error('Error fetching captcha:', error);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/Auth/login', {
        emailOrPhone,
        password,
        captcha,
        captchaID: captchaData.captchaID
      });

      if (response.data.success) {
        alert('Đăng nhập thành công!');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra');
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="k-bg-gradient min-h-screen flex items-center justify-center" 
         style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* K-CARD EMULATION */}
      <div className="bg-white rounded-[10px] shadow-[0px_4px_15px_rgba(0,0,0,0.2)] w-[400px]"
           style={{ padding: '20px' }}>
         
        <div className="mb-6">
          <h2 className="text-center text-[#212529]" 
              style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            Đăng nhập
          </h2>
        </div>

        {message && (
          <div className="text-center mb-4" 
               style={{ 
                 padding: '10px', 
                 borderRadius: '5px', 
                 backgroundColor: '#f8d7da', 
                 color: '#721c24', 
                 border: '1px solid #f5c6cb',
                 fontSize: '14px'
               }}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-[16px]">
          {/* FORM ITEM: EMAIL */}
          <div>
            <label className="block text-[13px] text-[#212529] mb-[4px]">
              Email hoặc Số điện thoại
            </label>
            <input
              type="text"
              className="w-full border border-[#dee2e6] rounded-[4px] px-[8px] py-[6px] text-[14px] outline-none focus:border-[#0066cc] focus:shadow-[0_0_0_2px_rgba(0,102,204,0.1)]"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              required
            />
          </div>

          {/* FORM ITEM: PASSWORD */}
          <div>
            <label className="block text-[13px] text-[#212529] mb-[4px]">
              Mật khẩu
            </label>
            <input
              type="password"
              className="w-full border border-[#dee2e6] rounded-[4px] px-[8px] py-[6px] text-[14px] outline-none focus:border-[#0066cc] focus:shadow-[0_0_0_2px_rgba(0,102,204,0.1)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* FORM ITEM: CAPTCHA */}
          <div>
            <label className="block text-[13px] text-[#212529] mb-[4px]">
              Xác minh Captcha
            </label>
            <div className="flex items-center space-x-[8px] mb-[8px]">
              <div className="relative border border-[#dee2e6] rounded-[4px] overflow-hidden bg-[#f8f9fa] h-[40px] flex-grow">
                {captchaData.captchaImage ? (
                  <img 
                    src={captchaData.captchaImage.startsWith('data:') || captchaData.captchaImage.startsWith('http') 
                      ? captchaData.captchaImage 
                      : `${BACKEND_URL}${captchaData.captchaImage}`} 
                    alt="captcha" 
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 animate-pulse"></div>
                )}
              </div>
              <button 
                type="button" 
                onClick={fetchCaptcha}
                className="p-[8px] hover:bg-gray-100 rounded-[4px] border border-[#dee2e6] text-[#6c757d]"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Nhập mã captcha"
              className="w-full border border-[#dee2e6] rounded-[4px] px-[8px] py-[6px] text-[14px] outline-none focus:border-[#0066cc]"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              required
            />
          </div>

          {/* LOGIN BUTTON: K-BUTTON PRIMARY */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-medium py-[10px] rounded-[4px] flex items-center justify-center space-x-2 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110 active:brightness-90'}`}
            style={{ 
              backgroundColor: '#0066cc', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontSize: '14px'
            }}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <>
                <LogIn size={18} />
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

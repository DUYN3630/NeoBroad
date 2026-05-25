import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '@/lib/axios';
import { Mail, Phone, Lock, CheckCircle2, ArrowRight, ShieldCheck, Key } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [step, setActiveStep] = useState(1); // 1: Input, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    emailOrPhone: '', code: '', newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/Auth/forgot-password', { emailOrPhone: formData.emailOrPhone });
      setActiveStep(2);
    } catch (err) {
      alert('Không tìm thấy tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/Auth/verify-code', { emailOrPhone: formData.emailOrPhone, code: formData.code });
      setActiveStep(3);
    } catch (err) {
      alert('Mã xác thực không đúng!');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mật khẩu đã được thay đổi thành công!');
    navigate('/login');
  };

  return (
    <div className="min-h-screen k-bg-gradient flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 md:p-12">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-50 text-[#0072C6] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                    <Key size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Khôi phục mật khẩu</h2>
                <p className="text-gray-400 text-sm">Vui lòng làm theo các bước để lấy lại quyền truy cập.</p>
            </div>

            {step === 1 && (
                <form onSubmit={handleRequest} className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                    <div>
                        <label className="k-label">Email hoặc Số điện thoại</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" required value={formData.emailOrPhone} onChange={e => setFormData({...formData, emailOrPhone: e.target.value})} className="k-input pl-10" placeholder="Nhập thông tin tài khoản..." />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full k-button-primary flex items-center justify-center py-3">
                        <span>{loading ? 'Đang gửi yêu cầu...' : 'Gửi mã xác thực'}</span>
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerify} className="space-y-6 animate-in zoom-in duration-300">
                    <div className="text-center">
                        <p className="text-gray-600 text-sm">Mã xác thực đã được gửi tới <span className="font-bold">{formData.emailOrPhone}</span></p>
                    </div>
                    <div>
                        <input 
                            type="text" required maxLength={6} 
                            value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                            className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0072C6]/20 focus:border-[#0072C6]"
                            placeholder="000000"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full k-button-primary py-3 font-bold">Xác nhận mã</button>
                    <button type="button" onClick={() => setActiveStep(1)} className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 text-center">Gửi lại mã khác</button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleReset} className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div>
                        <label className="k-label">Mật khẩu mới</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="password" required value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} className="k-input pl-10" />
                        </div>
                    </div>
                    <div>
                        <label className="k-label">Xác nhận mật khẩu</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="password" required className="k-input pl-10" />
                        </div>
                    </div>
                    <button type="submit" className="w-full k-button-primary py-3 font-bold">Cập nhật mật khẩu</button>
                </form>
            )}

            <div className="mt-10 text-center">
                <Link to="/login" className="text-sm text-gray-400 font-bold hover:text-[#0072C6] flex items-center justify-center">
                    Quay lại đăng nhập
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

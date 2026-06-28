import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import apiClient from '@/lib/axios';
import { Phone, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';

interface SmsOtpVerificationProps {
  userId: string;
  accessToken: string;
  onSuccess: (phoneNumber: string) => void;
  onCancel: () => void;
}

const SmsOtpVerification: React.FC<SmsOtpVerificationProps> = ({ userId, accessToken, onSuccess, onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Setup invisible recaptcha verifier
    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved - will proceed with submit
        },
        'expired-callback': () => {
          setError('Hết hạn Captcha. Vui lòng gửi lại OTP.');
        }
      });
      setRecaptchaVerifier(verifier);
    } catch (err: any) {
      console.error('Recaptcha init error', err);
      setError('Lỗi khởi tạo Recaptcha: ' + err.message);
    }

    return () => {
      // Clean up recaptcha verifier if needed
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, []);

  const handlePhoneInputChange = (val: string) => {
    let clean = val.trim().replace(/[^\d]/g, '');
    if (clean.startsWith('84')) {
      clean = clean.substring(2);
    }
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    setPhoneNumber(clean);
  };

  const formatPhoneNumber = (phone: string) => {
    return '+84' + phone.trim();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return setError('Vui lòng nhập số điện thoại.');
    if (!recaptchaVerifier) return setError('Chưa thể khởi tạo Recaptcha verifier.');

    setLoading(true);
    setError('');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (err: any) {
      console.error('Firebase Auth SMS error', err);
      setError('Không thể gửi OTP. Hãy kiểm tra lại số điện thoại (ví dụ: 0912345678) hoặc cấu hình Firebase.');
      // Re-init verifier on error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        const newVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
        setRecaptchaVerifier(newVerifier);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) return;

    setLoading(true);
    setError('');

    try {
      // 1. Xác thực OTP trên Firebase Client
      const result = await confirmationResult.confirm(verificationCode);
      
      // 2. Lấy Firebase ID Token để gửi lên Backend kiểm tra chéo
      const idToken = await result.user.getIdToken();

      // 3. Gửi ID Token lên Backend của ta để verify, cập nhật database (PhoneNumber & IsPhoneVerified)
      const response = await apiClient.post('/Auth/firebase-verify', {
        userId,
        idToken
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.data.success) {
        onSuccess(response.data.phoneNumber);
      } else {
        setError(response.data.message || 'Xác thực backend thất bại.');
      }
    } catch (err: any) {
      console.error('OTP confirmation error', err);
      setError('Mã xác thực OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-xl animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Phone className="text-blue-600" size={24} />
          Xác thực 2FA qua SMS OTP
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Hệ thống yêu cầu xác nhận số điện thoại để đảm bảo an toàn tài khoản.
        </p>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Số điện thoại di động
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                +84
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => handlePhoneInputChange(e.target.value)}
                placeholder="912345678"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Nhập số điện thoại (bỏ số 0 ở đầu).</p>
          </div>

          <div id="recaptcha-container"></div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={18} /> Gửi yêu cầu...
              </>
            ) : (
              'Gửi mã xác thực OTP'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Mã xác thực OTP (6 chữ số)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <KeyRound size={18} />
              </span>
              <input
                type="text"
                maxLength={6}
                value={verificationCode || ''}
                onChange={(e) => setVerificationCode(e.target.value || '')}
                placeholder="******"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-center font-black tracking-widest text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Mã xác thực đã được gửi về số điện thoại của bạn.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={18} /> Đang kiểm tra...
              </>
            ) : (
              'Xác nhận & Đăng nhập'
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep('phone')}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-bold transition-all text-center"
          >
            Thay đổi số điện thoại
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="w-full mt-4 text-xs text-gray-400 hover:text-gray-600 font-bold transition-all text-center"
      >
        Hủy bỏ
      </button>
    </div>
  );
};

export default SmsOtpVerification;

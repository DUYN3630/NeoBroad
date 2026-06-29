import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/axios';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  ipRestrictionEnabled: boolean;
}

interface AccessLog {
  user: string;
  ip: string;
  status: string;
  time: string;
}

const AccessManagementPage = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    ipRestrictionEnabled: false
  });
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, logsRes] = await Promise.all([
        apiClient.get('/Security/settings'),
        apiClient.get('/Security/logs')
      ]);
      setSettings(settingsRes.data);
      setLogs(logsRes.data);
    } catch (err: any) {
      console.error("Error loading access control data", err);
      setMessage({ text: 'Lỗi tải dữ liệu bảo mật từ hệ thống.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (key: keyof SecuritySettings) => {
    const updatedSettings = {
      ...settings,
      [key]: !settings[key]
    };
    
    setSaving(true);
    setMessage(null);
    
    // Cập nhật state cục bộ ngay lập tức để UI mượt mà (optimistic update)
    setSettings(updatedSettings);

    try {
      // Map đúng tên thực thể backend yêu cầu (PascalCase)
      const payload = {
        TwoFactorEnabled: updatedSettings.twoFactorEnabled,
        IpRestrictionEnabled: updatedSettings.ipRestrictionEnabled
      };
      
      const res = await apiClient.post('/Security/settings', payload);
      setMessage({ text: res.data.message || 'Cập nhật cấu hình thành công!', type: 'success' });
      
      // Tải lại nhật ký để thấy log thay đổi nếu có
      const logsRes = await apiClient.get('/Security/logs');
      setLogs(logsRes.data);
    } catch (err: any) {
      console.error("Error updating security settings", err);
      // Hoàn tác nếu lỗi
      setSettings(settings);
      setMessage({ 
        text: err.response?.data?.message || 'Cập nhật cấu hình thất bại. Bạn cần quyền Quản trị viên (Admin).', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
      // Ẩn thông báo sau 3 giây
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Quản lý quyền truy cập</h1>
          <p className="text-gray-500 text-sm mt-1">Cấu hình các giao thức bảo mật và kiểm soát truy cập hệ thống.</p>
        </div>
        <button 
          onClick={fetchData} 
          disabled={loading}
          className="p-2 hover:bg-gray-150 rounded-lg text-gray-500 hover:text-[#0072C6] transition-colors"
          title="Tải lại dữ liệu"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center space-x-2 text-sm font-semibold transition-all ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <AlertCircle size={18} />
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-64">
              <div className="h-6 bg-gray-250 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cấu hình giao thức */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center">
              <Lock size={18} className="mr-2 text-red-500" /> Giao thức bảo mật
            </h3>
            <div className="space-y-6">
              {/* Toggle 2FA */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-bold text-gray-700">Xác thực 2 yếu tố (2FA)</p>
                  <p className="text-xs text-gray-400">Yêu cầu mã OTP khi đăng nhập Admin</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('twoFactorEnabled')}
                  disabled={saving}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${
                    settings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-350'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                      settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle IP Restriction */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-bold text-gray-700">Giới hạn IP truy cập</p>
                  <p className="text-xs text-gray-400">Chỉ cho phép truy cập từ mạng nội bộ</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('ipRestrictionEnabled')}
                  disabled={saving}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${
                    settings.ipRestrictionEnabled ? 'bg-blue-600' : 'bg-gray-350'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                      settings.ipRestrictionEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Nhật ký truy cập */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center">
              <UserCheck size={18} className="mr-2 text-[#0072C6]" /> Nhật ký truy cập
            </h3>
            <div className="flex-1 overflow-y-auto max-h-72 pr-1 space-y-4">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  Chưa có lịch sử đăng nhập nào được ghi nhận.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-2.5 border-b border-gray-50 hover:bg-gray-50/50 px-2 rounded transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700 text-sm">{log.user}</span>
                      <span className="text-gray-400 mt-0.5">{log.time}</span>
                    </div>
                    <span className="text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{log.ip}</span>
                    <span className={`font-semibold px-2.5 py-1 rounded-full text-[10px] uppercase ${
                      log.status === 'Thành công' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessManagementPage;

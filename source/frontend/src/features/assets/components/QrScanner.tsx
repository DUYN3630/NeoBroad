import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title: string;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Không thể truy cập camera. Vui lòng cấp quyền.");
      }
    };

    startCamera();

    // Giả lập quét QR (vì không có thư viện giải mã QR sẵn trong bundle)
    // Trong thực tế sẽ dùng: new Html5QrcodeScanner(...)
    const timer = setTimeout(() => {
        // Sau 3s giả lập đã quét được mã
        // onScan("SV1001"); 
    }, 3000);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-black text-gray-900 uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        
        <div className="relative aspect-square bg-black">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <ShieldAlert size={48} className="text-red-500 mb-4" />
              <p className="text-white text-sm font-bold">{error}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
              
              {/* Scanner Overlay UI */}
              <div className="absolute inset-0 border-[40px] border-black/40 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-blue-500 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white -translate-x-1 -translate-y-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white translate-x-1 -translate-y-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white -translate-x-1 translate-y-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white translate-x-1 translate-y-1"></div>
                    
                    {/* Scanning Line Animation */}
                    <div className="w-full h-1 bg-blue-500 absolute top-0 animate-scan shadow-[0_0_15px_blue]"></div>
                </div>
              </div>
              
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest bg-black/40 inline-block px-4 py-1 rounded-full"> Đưa mã QR vào khung hình </p>
              </div>
            </>
          )}
        </div>

        <div className="p-8 bg-gray-50 flex flex-col space-y-4">
            <p className="text-xs text-gray-500 text-center italic">Đang chờ nhận diện mã định danh...</p>
            <div className="flex space-x-3">
                <button 
                  onClick={() => onScan("SV1001")}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                  Giả lập quét Student
                </button>
                <button 
                  onClick={() => onScan("DELL-LAT-101")}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                >
                  Giả lập quét Asset
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const ShieldAlert = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

export default QrScanner;

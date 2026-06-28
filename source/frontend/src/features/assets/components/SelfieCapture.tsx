import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SelfieCaptureProps {
  onCapture: (imageData: string) => void;
}

const SelfieCapture: React.FC<SelfieCaptureProps> = ({ onCapture }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const capture = () => {
    const canvas = document.createElement('canvas');
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const data = canvas.toDataURL('image/jpeg');
      setCapturedImage(data);
      onCapture(data);
      
      // Stop stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="flex flex-col items-center">
      {!capturedImage ? (
        <div className="relative w-full max-w-sm aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
          {!isStreaming ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <Camera size={48} className="mb-4 opacity-50" />
              <button 
                onClick={startCamera}
                className="px-6 py-2 bg-blue-600 rounded-full font-bold hover:bg-blue-700 transition-all"
              >
                MỞ CAMERA
              </button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={capture}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-blue-600 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="relative w-full max-w-sm aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-green-500 animate-in zoom-in-95 duration-300">
          <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
            <CheckCircle2 size={24} />
          </div>
          <button 
            onClick={retake}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/90 backdrop-blur rounded-full text-gray-900 font-bold text-sm flex items-center shadow-lg hover:bg-white transition-all"
          >
            <RefreshCw size={16} className="mr-2" />
            CHỤP LẠI
          </button>
        </div>
      )}
      <p className="mt-4 text-[11px] text-gray-500 font-medium uppercase tracking-widest italic">
        Yêu cầu chụp rõ mặt sinh viên cùng thiết bị
      </p>
    </div>
  );
};

export default SelfieCapture;

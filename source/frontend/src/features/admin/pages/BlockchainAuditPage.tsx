import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Cpu, 
  Link2,
  FileText,
  User,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface BlockchainBlock {
  id: string;
  studentCode: string;
  studentName: string;
  itemCount: number;
  itemsSummary: string;
  requestDate: string;
  previousHash: string;
  storedHash: string;
  computedHash: string;
  isHashValid: boolean;
  isChainValid: boolean;
}

interface AuditReport {
  isChainIntact: boolean;
  totalBlocks: number;
  invalidBlocksCount: number;
  blocks: BlockchainBlock[];
}

const BlockchainAuditPage = () => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/Borrow/VerifyBlockchain');
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const runAudit = async () => {
    setAuditing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Delay for dramatic simulation effect
      const res = await apiClient.get('/Borrow/VerifyBlockchain');
      setReport(res.data);
      alert('Đối soát và xác thực chữ ký SHA-256 hoàn tất!');
    } catch (err) {
      alert('Lỗi đối soát chuỗi Blockchain!');
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Blockchain Integrity Auditor</h1>
          <p className="text-gray-500 text-sm mt-1">Đối soát mật mã học chống giả mạo trực tiếp cơ sở dữ liệu.</p>
        </div>
        <button 
          onClick={runAudit}
          disabled={auditing}
          className="bg-[#1a1a1a] hover:bg-[#2b2b2b] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center shadow-lg transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={`mr-2 ${auditing ? 'animate-spin' : ''}`} />
          {auditing ? 'Đang mã hóa đối soát...' : 'Kiểm tra toàn chuỗi'}
        </button>
      </div>

      {/* Global Status Banner */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 italic">Đang tải lịch sử giao dịch...</div>
      ) : report ? (
        <div className={`p-6 rounded-[2rem] border ${
          report.isChainIntact 
            ? 'bg-green-50/50 border-green-100 text-green-800' 
            : 'bg-red-50/50 border-red-100 text-red-800'
        } flex items-start space-x-6 shadow-sm`}>
          <div className={`p-4 rounded-2xl ${report.isChainIntact ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {report.isChainIntact ? <ShieldCheck size={36} /> : <AlertTriangle size={36} />}
          </div>
          <div className="space-y-2 flex-grow">
            <h3 className="text-lg font-black uppercase tracking-tight">
              {report.isChainIntact ? 'CHUỖI AN TOÀN - DỮ LIỆU TOÀN VẸN 100%' : 'CẢNH BÁO: PHÁT HIỆN SỰ THAY ĐỔI DỮ LIỆU TRÁI PHÉP!'}
            </h3>
            <p className="text-xs opacity-90 leading-relaxed max-w-3xl">
              {report.isChainIntact 
                ? 'Hệ thống đã thực hiện kiểm định băm SHA-256 ngược từng khối giao dịch mượn thiết bị và so khớp chữ ký liên kết PreviousHash. Không phát hiện bất cứ sự can thiệp trực tiếp nào vào cơ sở dữ liệu.' 
                : `Phát hiện lỗi sai khớp băm mật mã học tại một số khối. Điều này chỉ ra rằng dữ liệu đã bị sửa đổi thủ công trực tiếp bằng SQL trong database mà không thông qua hệ thống API được cấp quyền.`
              }
            </p>
            <div className="flex space-x-6 pt-2 font-mono text-xs font-bold">
              <span>Tổng số khối (Blocks): {report.totalBlocks}</span>
              <span className={report.isChainIntact ? 'text-green-600' : 'text-red-600'}>
                Số khối bị lỗi: {report.invalidBlocksCount}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Blocks Visual List */}
      {!loading && report && (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">Sổ cái khối giao dịch (Ledger Blocks)</h3>
          
          <div className="space-y-4">
            {report.blocks.map((block, idx) => (
              <div 
                key={block.id} 
                className={`bg-white rounded-3xl border transition-all p-6 ${
                  !block.isHashValid || !block.isChainValid
                    ? 'border-red-300 ring-2 ring-red-100' 
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="bg-[#1a1a1a] text-white px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black uppercase">
                      BLOCK #{report.totalBlocks - idx}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">ID: {block.id.substring(0, 8)}...</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border flex items-center ${
                      block.isHashValid && block.isChainValid
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {block.isHashValid && block.isChainValid ? (
                        <>
                          <CheckCircle size={10} className="mr-1" /> Chữ ký khớp
                        </>
                      ) : (
                        <>
                          <XCircle size={10} className="mr-1" /> Sai khớp chữ ký (Bị sửa đổi!)
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Sinh viên mượn</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-[#0066cc] flex items-center justify-center font-bold text-[10px]">
                        {block.studentName?.charAt(0) || 'S'}
                      </div>
                      <span className="font-bold text-gray-700">{block.studentName} ({block.studentCode})</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Thời gian mượn</span>
                    <span className="text-gray-600 font-mono">{new Date(block.requestDate).toLocaleString('vi-VN')}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Thiết bị mượn</span>
                    <span className="text-gray-600 font-bold italic">"{block.itemsSummary}"</span>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-[10px] p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                  <div className="flex flex-wrap items-center">
                    <span className="text-gray-400 w-28 uppercase">Previous Hash:</span>
                    <span className="text-gray-500 break-all select-all font-bold">{block.previousHash}</span>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="text-gray-400 w-28 uppercase">Stored Hash:</span>
                    <span className={`break-all select-all font-black ${
                      block.isHashValid ? 'text-[#0066cc]' : 'text-red-600 font-black line-through'
                    }`}>{block.storedHash}</span>
                  </div>
                  {!block.isHashValid && (
                    <div className="flex flex-wrap items-center text-red-600 font-black pt-1 border-t border-red-50/50 mt-1">
                      <span className="w-28 uppercase">Computed Hash:</span>
                      <span className="break-all select-all">{block.computedHash}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainAuditPage;

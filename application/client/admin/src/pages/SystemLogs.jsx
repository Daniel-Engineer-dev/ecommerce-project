import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, RefreshCw, Search } from 'lucide-react';
import { API_ADMIN_URL } from '../config';

const API = API_ADMIN_URL;
const getToken = () => localStorage.getItem('adminToken');

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', search });
      const res = await fetch(`${API}/logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setLogs(data.logs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 space-y-6 bg-[#f5f7fa] min-h-screen"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-2">
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-1">
            Tra cứu thao tác quản trị & bảo mật
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Nhật ký Hệ thống
          </h1>
        </div>
        <button 
          onClick={fetchLogs} 
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#6ec6a0]' : ''} /> 
          Tải lại dữ liệu
        </button>
      </div>

      {/* Tool bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col md:flex-row gap-3 shadow-sm">
        <div className="flex items-center gap-3 bg-[#f5f7fa] border border-slate-100 px-4 py-2.5 rounded-xl flex-1 focus-within:bg-white focus-within:border-[#1a3a5c] transition-all">
          <Search size={16} className="text-slate-400" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Tìm theo hành động, bảng, record, user..." 
            className="bg-transparent outline-none text-sm w-full font-normal text-slate-800 placeholder:text-slate-400" 
          />
        </div>
        <button 
          onClick={fetchLogs} 
          className="px-6 py-2.5 rounded-xl bg-[#1a3a5c] hover:bg-[#132a44] text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Hành động</th>
                <th className="px-6 py-4">Đối tượng ảnh hưởng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {logs.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{log.username || 'System Admin'}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{log.role || 'System'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 font-semibold text-[10px] uppercase tracking-wider">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{log.table_name || '---'}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Record ID: #{log.record_id || '---'}</div>
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <History size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium text-sm">Không tìm thấy nhật ký phù hợp.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemLogs;

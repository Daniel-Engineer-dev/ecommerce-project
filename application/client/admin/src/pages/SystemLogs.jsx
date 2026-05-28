import React, { useEffect, useState } from 'react';
import { History, RefreshCw, Search } from 'lucide-react';

const API = 'http://localhost:5000/api/admin';
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
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <History size={28} /> Nhật ký hệ thống
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Tra cứu thao tác quản trị quan trọng để kiểm tra và truy vết.</p>
        </div>
        <button onClick={fetchLogs} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Tải lại
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex-1">
          <Search size={18} className="text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm action, bảng, record, user" className="bg-transparent outline-none text-sm w-full" />
        </div>
        <button onClick={fetchLogs} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold">Tìm</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Người dùng</th>
              <th className="p-4">Hành động</th>
              <th className="p-4">Đối tượng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.log_id} className="hover:bg-slate-50">
                <td className="p-4 text-xs text-slate-500">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                <td className="p-4">
                  <div className="font-bold text-slate-800">{log.username || 'System'}</div>
                  <div className="text-xs text-slate-400">{log.role || 'N/A'}</div>
                </td>
                <td className="p-4 font-black text-indigo-700">{log.action}</td>
                <td className="p-4 text-slate-600">{log.table_name || '-'} #{log.record_id || '-'}</td>
              </tr>
            ))}
            {!loading && logs.length === 0 && <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-bold">Chưa có nhật ký phù hợp.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemLogs;

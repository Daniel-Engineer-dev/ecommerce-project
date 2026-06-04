import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareWarning, RefreshCw, Send, CheckCircle } from 'lucide-react';
import { API_ADMIN_URL } from '../config';
import { apiFetch } from '../apiClient';

const API = API_ADMIN_URL;
const getToken = () => localStorage.getItem('adminToken');
const statuses = ['', 'Pending', 'Processing', 'Resolved', 'Rejected'];

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState('');
  const [reply, setReply] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '30' });
      if (status) params.set('status', status);
      const res = await apiFetch(`${API}/complaints?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setComplaints(data.complaints || []);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const updateStatus = async (id, nextStatus) => {
    const res = await apiFetch(`${API}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await res.json();
    showMessage(res.ok ? data.message : data.error || 'Update failed');
    if (res.ok) fetchComplaints();
  };

  const sendReply = async (id) => {
    const content = reply[id];
    if (!content?.trim()) return;
    const res = await apiFetch(`${API}/complaints/${id}/responses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    showMessage(res.ok ? data.message : data.error || 'Send failed');
    if (res.ok) {
      setReply((prev) => ({ ...prev, [id]: '' }));
      fetchComplaints();
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [status]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 space-y-6 bg-[#f5f7fa] min-h-screen relative"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-1">
            Hỗ trợ & CSKH
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Xử lý Khiếu nại
          </h1>
        </div>
        <div className="flex gap-3 self-start md:self-auto">
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="px-4 py-2.5 rounded-xl border border-slate-100 text-xs font-semibold bg-white text-slate-600 outline-none hover:border-slate-200 transition-colors shadow-sm"
          >
            {statuses.map((item) => <option key={item} value={item}>{item || 'Tất cả trạng thái'}</option>)}
          </select>
          <button 
            onClick={fetchComplaints} 
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#6ec6a0]' : ''} />
            Đồng bộ
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {complaints.map((item) => (
          <div key={item.complaint_id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">#{item.complaint_id}</span>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 uppercase tracking-wider">{item.priority}</span>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 uppercase tracking-wider">{item.status}</span>
              </div>
              <h2 className="text-base font-bold text-slate-800">{item.title || 'Khiếu nại không có tiêu đề'}</h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.content}</p>
              
              <div className="mt-5 pt-5 border-t border-slate-50 flex items-center gap-6 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Người gửi: </span>
                  <span className="font-semibold text-slate-800">{item.full_name || item.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Email: </span>
                  <span className="font-semibold text-slate-800">{item.email}</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-80 flex flex-col gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-50 pt-5 md:pt-0 md:pl-6">
              <select 
                value={item.status} 
                onChange={(e) => updateStatus(item.complaint_id, e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 text-xs font-semibold bg-[#f5f7fa] text-slate-600 outline-none focus:bg-white focus:border-[#1a3a5c] transition-colors"
              >
                {statuses.filter(Boolean).map((st) => <option key={st} value={st}>Trạng thái: {st}</option>)}
              </select>
              
              <textarea
                value={reply[item.complaint_id] || ''}
                onChange={(e) => setReply((prev) => ({ ...prev, [item.complaint_id]: e.target.value }))}
                rows="3"
                placeholder="Nhập nội dung phản hồi..."
                className="w-full rounded-xl border border-slate-100 p-4 text-sm outline-none bg-[#f5f7fa] focus:bg-white focus:border-[#1a3a5c] transition-all resize-none placeholder:text-slate-400"
              />
              <button 
                onClick={() => sendReply(item.complaint_id)} 
                className="w-full px-4 py-2.5 rounded-xl bg-[#1a3a5c] hover:bg-[#132a44] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Send size={14} className="text-[#6ec6a0]" /> Gửi phản hồi
              </button>
            </div>
          </div>
        ))}
        {!loading && complaints.length === 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm">
            <MessageSquareWarning size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-sm">Hệ thống hiện không có khiếu nại nào phù hợp.</p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-medium text-sm shadow-xl bg-[#1a3a5c]"
          >
            <CheckCircle size={16} className="text-[#6ec6a0]" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ComplaintManagement;


import React, { useEffect, useState } from 'react';
import { MessageSquareWarning, RefreshCw, Send } from 'lucide-react';

const API = 'http://localhost:5000/api/admin';
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
      const res = await fetch(`${API}/complaints?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setComplaints(data.complaints || []);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, nextStatus) => {
    const res = await fetch(`${API}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await res.json();
    setMessage(res.ok ? data.message : data.error || 'Update failed');
    if (res.ok) fetchComplaints();
  };

  const sendReply = async (id) => {
    const content = reply[id];
    if (!content?.trim()) return;
    const res = await fetch(`${API}/complaints/${id}/responses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setMessage(res.ok ? data.message : data.error || 'Send failed');
    if (res.ok) {
      setReply((prev) => ({ ...prev, [id]: '' }));
      fetchComplaints();
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [status]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquareWarning size={28} /> Xu ly khieu nai
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Theo doi, phan hoi va cap nhat trang thai khieu nai cua khach hang.</p>
        </div>
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white">
            {statuses.map((item) => <option key={item} value={item}>{item || 'Tat ca'}</option>)}
          </select>
          <button onClick={fetchComplaints} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Tai lai
          </button>
        </div>
      </div>

      {message && <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-3 rounded-xl text-sm font-bold">{message}</div>}

      <div className="grid gap-4">
        {complaints.map((item) => (
          <div key={item.complaint_id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">#{item.complaint_id}</span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700">{item.priority}</span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700">{item.status}</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-2">{item.title || 'Khieu nai khong tieu de'}</h2>
                <p className="text-sm text-slate-600 mt-1">{item.content}</p>
                <p className="text-xs text-slate-400 mt-2">{item.full_name || item.username} - {item.email}</p>
              </div>
              <select value={item.status} onChange={(e) => updateStatus(item.complaint_id, e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white">
                {statuses.filter(Boolean).map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <textarea
                value={reply[item.complaint_id] || ''}
                onChange={(e) => setReply((prev) => ({ ...prev, [item.complaint_id]: e.target.value }))}
                rows="2"
                placeholder="Nhap phan hoi cho khach hang"
                className="flex-1 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={() => sendReply(item.complaint_id)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-black flex items-center justify-center gap-2">
                <Send size={16} /> Gui
              </button>
            </div>
          </div>
        ))}
        {!loading && complaints.length === 0 && <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-bold">Khong co khieu nai phu hop.</div>}
      </div>
    </div>
  );
};

export default ComplaintManagement;

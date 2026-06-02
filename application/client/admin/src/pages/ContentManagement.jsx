import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, RefreshCw, Save, CheckCircle } from 'lucide-react';

const API = 'http://localhost:5000/api/admin';
const getToken = () => localStorage.getItem('adminToken');

const emptyForm = {
  contentKey: '',
  title: '',
  type: 'policy',
  body: '',
  isActive: true,
};

const ContentManagement = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/content`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const save = async (event) => {
    event.preventDefault();
    const res = await fetch(`${API}/content`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    showMessage(res.ok ? data.message : data.error || 'Save failed');
    if (res.ok) {
      setForm(emptyForm);
      fetchItems();
    }
  };

  const edit = (item) => {
    setForm({
      contentKey: item.content_key,
      title: item.title,
      type: item.type,
      body: item.body || '',
      isActive: item.is_active,
    });
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
            Quản trị thông tin hệ thống
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Quản lý Nội dung
          </h1>
        </div>
        <button 
          onClick={fetchItems} 
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#6ec6a0]' : ''} /> 
          Tải lại dữ liệu
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        {/* Biểu mẫu chỉnh sửa */}
        <form onSubmit={save} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-slate-800 uppercase text-sm tracking-wide border-b border-slate-50 pb-3">Biên tập Nội dung</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Mã khóa (Content Key)</label>
              <input value={form.contentKey} onChange={(e) => setForm({ ...form, contentKey: e.target.value })} placeholder="VD: home_banner" className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-[#f5f7fa] focus:bg-white text-sm outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-slate-400" />
            </div>
            
            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Tiêu đề</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nhập tiêu đề hiển thị" className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-[#f5f7fa] focus:bg-white text-sm outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-slate-400" />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Loại nội dung</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-[#f5f7fa] focus:bg-white text-sm font-semibold text-slate-700 outline-none focus:border-[#1a3a5c] transition-colors">
                <option value="banner">Banner quảng cáo</option>
                <option value="article">Bài viết tin tức</option>
                <option value="popup">Popup thông báo</option>
                <option value="policy">Chính sách & Điều khoản</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Nội dung (Body)</label>
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows="8" placeholder="Soạn thảo nội dung..." className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-[#f5f7fa] focus:bg-white text-sm outline-none focus:border-[#1a3a5c] transition-colors resize-none placeholder:text-slate-400" />
            </div>

            <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer py-1 select-none">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-[#6ec6a0] focus:ring-[#6ec6a0]" />
              Kích hoạt hiển thị nội dung này
            </label>
          </div>

          <button className="w-full py-3 rounded-xl bg-[#1a3a5c] hover:bg-[#132a44] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-sm mt-2 text-sm">
            <Save size={16} className="text-[#6ec6a0]" /> Lưu thông tin
          </button>
        </form>

        {/* Bảng dữ liệu */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Khóa & Tiêu đề</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.content_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 leading-tight">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1 font-medium">{item.content_key}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-semibold px-2.5 py-1 bg-slate-50 rounded-md uppercase text-slate-600">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider
                        ${item.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {item.is_active ? 'Hiển thị' : 'Đang Ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => edit(item)} 
                        className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-600 hover:bg-[#1a3a5c] hover:text-white hover:border-[#1a3a5c] text-xs font-semibold transition-all shadow-sm"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-16 text-center">
                      <FileText size={32} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium text-sm">Chưa có nội dung nào được tạo.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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

export default ContentManagement;
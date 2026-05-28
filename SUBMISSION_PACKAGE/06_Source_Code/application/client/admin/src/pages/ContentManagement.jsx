import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw, Save } from 'lucide-react';

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
    setMessage(res.ok ? data.message : data.error || 'Save failed');
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
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <FileText size={28} /> Quan ly noi dung
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Quan ly banner, bai viet, popup va noi dung chinh sach o muc demo.</p>
        </div>
        <button onClick={fetchItems} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Tai lai
        </button>
      </div>

      {message && <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-3 rounded-xl text-sm font-bold">{message}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <form onSubmit={save} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="font-black text-slate-900">Noi dung</h2>
          <input value={form.contentKey} onChange={(e) => setForm({ ...form, contentKey: e.target.value })} placeholder="content_key vi du: home_banner" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tieu de" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white">
            <option value="banner">Banner</option>
            <option value="article">Bai viet</option>
            <option value="popup">Popup</option>
            <option value="policy">Chinh sach</option>
          </select>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows="8" placeholder="Noi dung hien thi" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Dang kich hoat
          </label>
          <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center gap-2">
            <Save size={16} /> Luu noi dung
          </button>
        </form>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Key</th>
                <th className="p-4">Loai</th>
                <th className="p-4">Trang thai</th>
                <th className="p-4 text-right">Sua</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.content_id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-black text-slate-900">{item.title}</div>
                    <div className="font-mono text-xs text-slate-400">{item.content_key}</div>
                  </td>
                  <td className="p-4 text-slate-600">{item.type}</td>
                  <td className="p-4">
                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => edit(item)} className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">Sua</button>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-bold">Chua co noi dung nao.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;

import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, ShoppingBag, Eye, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

const API = 'http://localhost:5000/api/admin';
const getToken = () => localStorage.getItem('adminToken');
const statuses = ['', 'Pending', 'Paid', 'Cancelled', 'Failed', 'Expired', 'Refunded'];

const money = (value) => Number(value || 0).toLocaleString('vi-VN');

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '20', search });
      if (status) params.set('status', status);
      const res = await fetch(`${API}/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    const res = await fetch(`${API}/orders/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) setSelected(await res.json());
  };

  const updateStatus = async (orderId, nextStatus) => {
    const note = window.prompt(`Note for ${nextStatus}`, `ADMIN_${nextStatus}_${Date.now()}`);
    if (note === null) return;

    const res = await fetch(`${API}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: nextStatus, note }),
    });
    const data = await res.json();
    setMessage(res.ok ? data.message : data.error || 'Update failed');
    if (res.ok) {
      await fetchOrders();
      await fetchDetail(orderId);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag size={28} /> Quan ly don hang
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Tra cuu, doi trang thai, hoan tien mo phong va xem e-voucher da phat hanh.</p>
        </div>
        <button onClick={fetchOrders} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Tai lai
        </button>
      </div>

      {message && <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-3 rounded-xl text-sm font-bold">{message}</div>}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex-1">
          <Search size={18} className="text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tim theo ma don, khach hang, email, sdt" className="bg-transparent outline-none text-sm w-full" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white">
          {statuses.map((item) => <option key={item} value={item}>{item || 'Tat ca trang thai'}</option>)}
        </select>
        <button onClick={fetchOrders} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold">Loc</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Don</th>
                <th className="p-4">Khach hang</th>
                <th className="p-4">Thanh toan</th>
                <th className="p-4">Tong tien</th>
                <th className="p-4 text-center">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-black text-slate-900">#{order.order_id}</div>
                    <div className="text-xs text-slate-400">{new Date(order.order_date).toLocaleString('vi-VN')}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{order.customer_name || order.shipping_name || order.customer_username}</div>
                    <div className="text-xs text-slate-400">{order.shipping_phone || order.customer_email}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-black px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700">{order.status}</span>
                    <div className="text-xs text-slate-400 mt-1">{order.payment_method || 'N/A'} | {order.voucher_quantity || 0} ma</div>
                  </td>
                  <td className="p-4 font-black text-slate-900">{money(order.total_amount)}d</td>
                  <td className="p-4 text-center">
                    <button onClick={() => fetchDetail(order.order_id)} className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1">
                      <Eye size={14} /> Xem
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-bold">Khong co don hang phu hop.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 min-h-96">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold">Chon mot don hang de xem chi tiet.</div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Don #{selected.order_id}</h2>
                  <p className="text-xs text-slate-500">{selected.shipping_name || selected.customer_name} - {selected.shipping_phone || selected.customer_email}</p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">{selected.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => updateStatus(selected.order_id, 'Paid')} className="py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-1">
                  <CheckCircle2 size={14} /> Da thanh toan
                </button>
                <button onClick={() => updateStatus(selected.order_id, 'Cancelled')} className="py-2 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center justify-center gap-1">
                  <XCircle size={14} /> Huy don
                </button>
                <button onClick={() => updateStatus(selected.order_id, 'Refunded')} className="py-2 rounded-xl bg-amber-500 text-white text-xs font-black flex items-center justify-center gap-1 col-span-2">
                  <RotateCcw size={14} /> Hoan tien mo phong
                </button>
              </div>

              <div>
                <h3 className="font-black text-sm text-slate-700 mb-2">Voucher trong don</h3>
                <div className="space-y-2">
                  {(selected.items || []).map((item) => (
                    <div key={item.order_item_id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="font-bold text-sm">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.company_name} | SL {item.quantity} | {money(item.price_at_purchase)}d</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-black text-sm text-slate-700 mb-2">E-voucher</h3>
                <div className="space-y-2 max-h-56 overflow-auto">
                  {(selected.evouchers || []).map((ev) => (
                    <div key={ev.evoucher_id} className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                      <div className="font-mono font-black text-indigo-700">{ev.unique_code}</div>
                      <div className="text-xs text-indigo-500">{ev.status} | HSD {ev.expiry_date ? new Date(ev.expiry_date).toLocaleDateString('vi-VN') : 'N/A'}</div>
                    </div>
                  ))}
                  {(selected.evouchers || []).length === 0 && <div className="text-xs text-slate-400 font-bold">Chua phat hanh e-voucher.</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;

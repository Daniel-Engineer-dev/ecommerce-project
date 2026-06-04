import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Search, ShoppingBag, Eye, CheckCircle2, XCircle, RotateCcw, Calendar, User, Phone, Mail, CreditCard, Ticket } from 'lucide-react';

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

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const updateStatus = async (orderId, nextStatus) => {
    const note = window.prompt(`Ghi chú thay đổi trạng thái sang ${nextStatus}`, `ADMIN_${nextStatus}_${Date.now()}`);
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
    showMessage(res.ok ? data.message : data.error || 'Cập nhật thất bại');
    if (res.ok) {
      await fetchOrders();
      await fetchDetail(orderId);
    }
  };

  useEffect(() => {
    fetchOrders();
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
            Hệ thống quản lý giao dịch doanh thu
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Quản lý Đơn hàng
          </h1>
        </div>
        <button 
          onClick={fetchOrders} 
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#6ec6a0]' : ''} /> 
          Tải lại dữ liệu
        </button>
      </div>

      {/* Tool bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row gap-3 shadow-sm">
        <div className="flex items-center gap-3 bg-[#f5f7fa] border border-slate-100 px-4 py-2.5 rounded-xl flex-1 focus-within:bg-white focus-within:border-[#1a3a5c] transition-all">
          <Search size={16} className="text-slate-400" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Tìm theo mã đơn, khách hàng, email, SĐT..." 
            className="bg-transparent outline-none text-sm w-full font-normal text-slate-800 placeholder:text-slate-400" 
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="px-4 py-2.5 rounded-xl border border-slate-100 text-xs font-semibold bg-[#f5f7fa] text-slate-600 outline-none focus:bg-white focus:border-[#1a3a5c] transition-colors"
          >
            {statuses.map((item) => <option key={item} value={item}>{item || 'Tất cả trạng thái'}</option>)}
          </select>
          <button 
            onClick={fetchOrders} 
            className="px-6 py-2.5 rounded-xl bg-[#1a3a5c] hover:bg-[#132a44] text-white text-xs font-semibold shadow-sm transition-all"
          >
            Lọc kết quả
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-6 items-start">
        {/* Table danh sách đơn hàng */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Mã đơn & Ngày</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Tổng tiền</th>
                  <th className="px-6 py-4 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {orders.map((order) => (
                  <tr 
                    key={order.order_id} 
                    className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selected?.order_id === order.order_id ? 'bg-[#f5f7fa]' : ''}`} 
                    onClick={() => fetchDetail(order.order_id)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">#{order.order_id}</div>
                      <div className="text-[11px] text-slate-400 mt-1 font-medium">{new Date(order.order_date).toLocaleString('vi-VN')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{order.customer_name || order.shipping_name || order.customer_username}</div>
                      <div className="text-[11px] text-slate-400 mt-1 font-medium">{order.shipping_phone || order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 uppercase tracking-wider">{order.status}</span>
                      <div className="text-[11px] text-slate-400 mt-1.5 font-medium">{order.payment_method || 'N/A'} | {order.voucher_quantity || 0} mã</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{money(order.total_amount)}đ</td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-[#1a3a5c] hover:text-white hover:border-[#1a3a5c] text-slate-500 transition-all shadow-sm">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && orders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-16 text-center">
                      <ShoppingBag size={32} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium text-sm">Không tìm thấy đơn hàng nào phù hợp.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cột Chi tiết đơn hàng */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[500px] sticky top-6">
          {!selected ? (
            <div className="h-[460px] flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-[#f5f7fa]/30">
              <Eye size={32} className="mb-3 text-slate-300" />
              <p className="font-semibold text-xs uppercase tracking-wider text-slate-400">Chọn một đơn hàng để xem chi tiết</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header chi tiết */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-50 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">Đơn hàng #{selected.order_id}</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    <span className="font-semibold text-slate-700">{selected.shipping_name || selected.customer_name}</span> &bull; {selected.shipping_phone || selected.customer_email}
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">{selected.status}</span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => updateStatus(selected.order_id, 'Paid')} className="py-2.5 rounded-xl bg-[#6ec6a0] hover:bg-[#5bb890] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors">
                  <CheckCircle2 size={14} /> Xác nhận Thanh toán
                </button>
                <button onClick={() => updateStatus(selected.order_id, 'Cancelled')} className="py-2.5 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                  <XCircle size={14} /> Hủy đơn hàng
                </button>
                <button onClick={() => updateStatus(selected.order_id, 'Refunded')} className="py-2.5 rounded-xl bg-[#f5f7fa] border border-slate-100 hover:bg-[#eaf0f6] text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors col-span-2">
                  <RotateCcw size={14} /> Hoàn tiền (Refund) hệ thống
                </button>
              </div>

              {/* Danh sách sản phẩm */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Voucher trong đơn</h3>
                <div className="space-y-3">
                  {(selected.items || []).map((item) => (
                    <div key={item.order_item_id} className="p-4 rounded-xl bg-[#f5f7fa] border border-slate-50 flex justify-between items-center shadow-sm">
                      <div>
                        <div className="font-semibold text-sm text-slate-800">{item.title}</div>
                        <div className="text-xs text-slate-400 mt-1 font-medium">{item.company_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800">{money(item.price_at_purchase)}đ</div>
                        <div className="text-[10px] text-[#1a3a5c] bg-white border border-slate-100 px-2 py-0.5 rounded-md font-semibold mt-1 inline-block">SL: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* E-vouchers code */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 flex justify-between items-end">
                  Mã E-voucher đã phát
                  <span className="text-[10px] font-semibold text-[#1a3a5c] bg-blue-50 px-2.5 py-0.5 rounded-md">{(selected.evouchers || []).length} mã</span>
                </h3>
                <div className="space-y-2.5 max-h-56 overflow-auto pr-1">
                  {(selected.evouchers || []).map((ev) => (
                    <div key={ev.evoucher_id} className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm flex justify-between items-center">
                      <div className="font-mono font-bold text-slate-700 tracking-wider text-xs bg-[#f5f7fa] px-2.5 py-1 rounded-lg border border-slate-50">{ev.unique_code}</div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 uppercase tracking-wider">{ev.status}</span>
                        <div className="text-[10px] text-slate-400 font-medium mt-1">HSD: {ev.expiry_date ? new Date(ev.expiry_date).toLocaleDateString('vi-VN') : 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                  {(selected.evouchers || []).length === 0 && (
                    <div className="text-xs text-slate-400 font-medium italic border border-dashed border-slate-200 p-5 rounded-xl text-center bg-[#f5f7fa]/20">
                      Hệ thống chưa phát hành mã E-voucher cho đơn này.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
            <CheckCircle2 size={16} className="text-[#6ec6a0]" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderManagement;
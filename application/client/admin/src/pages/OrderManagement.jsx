import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Search, ShoppingBag, Eye, CheckCircle2, 
  XCircle, RotateCcw, Calendar, User, Phone, 
  Mail, CreditCard, MapPin, Hash, AlertCircle 
} from 'lucide-react';
import { API_ADMIN_URL } from '../config';
import { apiFetch } from '../apiClient';

const API = API_ADMIN_URL;
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

  // STATE QUẢN LÝ MODAL XÁC NHẬN
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    orderId: null,
    nextStatus: '',
    note: ''
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '20', search });
      if (status) params.set('status', status);
      const res = await apiFetch(`${API}/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      const res = await apiFetch(`${API}/orders/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setSelected(data);
        } else {
          setSelected({ order: data, items: data.items || [] });
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // HÀM MỞ MODAL THAY VÌ DÙNG WINDOW.PROMPT
  const openConfirmModal = (orderId, nextStatus) => {
    setConfirmModal({
      isOpen: true,
      orderId,
      nextStatus,
      note: `ADMIN_${nextStatus}_${Date.now()}` // Gợi ý lý do mặc định
    });
  };

  // HÀM ĐÓNG MODAL
  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, orderId: null, nextStatus: '', note: '' });
  };

  // HÀM THỰC THI GỌI API SAU KHI ẤN XÁC NHẬN TRONG MODAL
  const executeStatusUpdate = async () => {
    const { orderId, nextStatus, note } = confirmModal;
    
    let endpoint = '';
    let method = '';
    let bodyData = null;

    if (nextStatus === 'Paid') {
      endpoint = `${API}/orders/${orderId}/confirm-payment`;
      method = 'PATCH';
    } else if (nextStatus === 'Cancelled' || nextStatus === 'Refunded') {
      endpoint = `${API}/orders/${orderId}/refund`;
      method = 'POST';
      bodyData = { reason: note };
    }

    try {
      const fetchOptions = {
        method: method,
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      };

      if (bodyData) fetchOptions.body = JSON.stringify(bodyData);

      const res = await apiFetch(endpoint, fetchOptions);
      const data = await res.json();
      
      showMessage(res.ok ? data.message || 'Cập nhật thành công' : data.error || 'Cập nhật thất bại');
      
      if (res.ok) {
        await fetchOrders();
        await fetchDetail(orderId);
      }
    } catch (error) {
      showMessage('Có lỗi xảy ra khi gọi API');
    } finally {
      closeConfirmModal(); // Gọi xong API thì đóng Modal lại
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-8 space-y-6 bg-[#f5f7fa] min-h-screen relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-1">Hệ thống quản lý giao dịch doanh thu</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Quản lý Đơn hàng</h1>
        </div>
        <button onClick={fetchOrders} className="px-4 py-2.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all self-start md:self-auto">
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#6ec6a0]' : ''} /> Tải lại dữ liệu
        </button>
      </div>

      {/* Tool bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row gap-3 shadow-sm">
        <div className="flex items-center gap-3 bg-[#f5f7fa] border border-slate-100 px-4 py-2.5 rounded-xl flex-1 focus-within:bg-white focus-within:border-[#1a3a5c] transition-all">
          <Search size={16} className="text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo mã đơn, khách hàng, email, SĐT..." className="bg-transparent outline-none text-sm w-full font-normal text-slate-800 placeholder:text-slate-400" />
        </div>
        <div className="flex gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-100 text-xs font-semibold bg-[#f5f7fa] text-slate-600 outline-none focus:bg-white focus:border-[#1a3a5c] transition-colors">
            {statuses.map((item) => <option key={item} value={item}>{item || 'Tất cả trạng thái'}</option>)}
          </select>
          <button onClick={fetchOrders} className="px-6 py-2.5 rounded-xl bg-[#1a3a5c] hover:bg-[#132a44] text-white text-xs font-semibold shadow-sm transition-all">Lọc kết quả</button>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {orders.map((order) => (
                  <tr key={order.order_id} className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selected?.order?.order_id === order.order_id ? 'bg-[#f5f7fa]' : ''}`} onClick={() => fetchDetail(order.order_id)}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">#{order.order_id}</div>
                      <div className="text-[11px] text-slate-400 mt-1 font-medium">{new Date(order.order_date).toLocaleString('vi-VN')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{order.customer_name || order.shipping_name || order.username}</div>
                      <div className="text-[11px] text-slate-400 mt-1 font-medium">{order.shipping_phone || order.phone || order.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider
                        ${order.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : order.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{money(order.total_amount)}đ</td>
                  </tr>
                ))}
                {!loading && orders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-16 text-center">
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
            <div className="h-[460px] flex flex-col items-center justify-center text-slate-400 bg-[#f5f7fa]/30 border border-dashed rounded-2xl">
              <Eye size={32} className="mb-3 text-slate-300" />
              <p className="font-semibold text-xs uppercase tracking-wider">Chọn đơn hàng để xem chi tiết</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a3a5c]">Đơn hàng #{selected.order.order_id}</h2>
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5 font-medium">
                    <Calendar size={13} className="text-slate-400"/> {new Date(selected.order.order_date).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide
                  ${selected.order.status === 'Paid' ? 'bg-[#6ec6a0]/10 text-[#5bb890]' : selected.order.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                  {selected.order.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#f5f7fa] p-4 rounded-xl border border-slate-100">
                <div className="space-y-2.5 border-r border-slate-200 pr-4">
                  <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">Thông tin khách hàng</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <User size={14} className="text-slate-400 shrink-0" />
                    <span className="font-semibold">{selected.order.shipping_name || selected.order.full_name || selected.order.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{selected.order.shipping_phone || selected.order.phone || 'Chưa cập nhật SĐT'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate" title={selected.order.shipping_email || selected.order.email}>
                      {selected.order.shipping_email || selected.order.email || 'Chưa cập nhật Email'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pl-2">
                  <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">Chi tiết giao dịch</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CreditCard size={14} className="text-slate-400 shrink-0" />
                    <span>PTTT: <span className="font-semibold text-[#1a3a5c]">{selected.order.payment_method || 'N/A'}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Hash size={14} className="text-slate-400 shrink-0" />
                    <span>Mã GD: <span className="font-mono text-xs">{selected.order.transaction_reference || 'N/A'}</span></span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-700">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-xs leading-relaxed" title={selected.order.shipping_address || selected.order.address}>
                      {selected.order.shipping_address || selected.order.address || 'Khách không cung cấp địa chỉ'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {selected.order.status === 'Pending' && (
                  <>
                    <button onClick={() => openConfirmModal(selected.order.order_id, 'Paid')} className="py-2.5 rounded-xl bg-[#1a3a5c] hover:bg-[#132a44] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all">
                      Xác nhận Thanh toán
                    </button>
                    <button onClick={() => openConfirmModal(selected.order.order_id, 'Cancelled')} className="py-2.5 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
                      <XCircle size={14} /> Hủy đơn hàng
                    </button>
                  </>
                )}
                {selected.order.status === 'Paid' && (
                  <button onClick={() => openConfirmModal(selected.order.order_id, 'Refunded')} className="col-span-2 py-2.5 rounded-xl bg-[#f5f7fa] border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm">
                    <RotateCcw size={14} /> Hoàn tiền hệ thống
                  </button>
                )}
                {['Cancelled', 'Refunded', 'Failed', 'Expired'].includes(selected.order.status) && (
                  <div className="col-span-2 text-center py-2.5 text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded-xl">
                    Đơn hàng đã đóng
                  </div>
                )}
              </div>

              <div className="pt-2">
                <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-3">Sản phẩm trong đơn ({selected.items?.length || 0})</h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {(selected.items || []).map((item) => (
                    <div key={item.order_item_id} className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6ec6a0]"></div>
                      <div className="flex justify-between items-start pl-2">
                        <div>
                          <div className="font-semibold text-sm text-slate-800 leading-tight">{item.title}</div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">{item.company_name}</div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="font-bold text-[#1a3a5c]">{money(item.price_at_purchase)}đ</div>
                          <div className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold mt-1 inline-block">SL: {item.quantity}</div>
                        </div>
                      </div>
                      
                      {item.evouchers && item.evouchers.length > 0 && (
                        <div className="mt-4 pl-3 space-y-2 border-t border-dashed border-slate-100 pt-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Mã E-Voucher đã phát</p>
                          {item.evouchers.map(ev => (
                            <div key={ev.evoucher_id} className="flex justify-between items-center bg-[#f5f7fa] px-3 py-2 rounded-lg border border-slate-50">
                              <span className="font-mono font-bold text-slate-700 text-xs tracking-wider">{ev.unique_code}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${ev.status === 'Unused' ? 'bg-blue-50 text-blue-600' : ev.status === 'Used' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                {ev.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMPONENT MODAL CUSTOM Ở GIỮA MÀN HÌNH */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            {/* Lớp nền đen mờ */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeConfirmModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            {/* Nội dung Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl z-10"
            >
              <div className="flex items-center gap-3 mb-4 text-[#1a3a5c]">
                <div className="p-2 bg-blue-50 rounded-full"><AlertCircle size={24} className="text-blue-600" /></div>
                <h3 className="text-lg font-bold">Xác nhận thay đổi trạng thái</h3>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                Bạn đang chuẩn bị chuyển trạng thái của đơn hàng <b>#{confirmModal.orderId}</b> sang <span className="font-bold text-blue-600">{confirmModal.nextStatus}</span>. Vui lòng nhập ghi chú (lý do) cho hành động này:
              </p>

              <textarea 
                rows="3"
                value={confirmModal.note}
                onChange={(e) => setConfirmModal({...confirmModal, note: e.target.value})}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#1a3a5c] focus:ring-1 focus:ring-[#1a3a5c] outline-none transition-all resize-none mb-6"
                placeholder="Nhập lý do hoặc ghi chú nội bộ..."
              />

              <div className="flex justify-end gap-3">
                <button onClick={closeConfirmModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  Hủy bỏ
                </button>
                <button onClick={executeStatusUpdate} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1a3a5c] hover:bg-[#132a44] transition-colors shadow-sm">
                  Xác nhận thực thi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-medium text-sm shadow-xl bg-[#1a3a5c]">
            <CheckCircle2 size={16} className="text-[#6ec6a0]" /> {message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderManagement;
// src/pages/OrderManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, Search, Eye, CheckCircle2, XCircle, AlertCircle,
    ChevronLeft, ChevronRight, X, Calendar, User, Mail, DollarSign,
    FileText, Tag, ShieldCheck, HelpCircle
} from 'lucide-react';

const API = 'http://localhost:5000/api/admin/orders';
const getToken = () => localStorage.getItem('adminToken');

// ─── TOAST NOTIFICATION COMPONENT ───────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm
                ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
        >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
        </motion.div>
    );
};

// ─── MAIN COMPONENTS ────────────────────────────────────────────────────────
const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}?status=${status}&search=${search}&page=${page}&limit=8`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (res.ok) {
                setOrders(data.orders || []);
                setTotalPages(data.pagination?.totalPages || 1);
            } else {
                showToast(data.message || 'Lỗi tải danh sách đơn hàng', 'error');
            }
        } catch (err) {
            showToast('Không thể kết nối đến máy chủ API', 'error');
        } finally {
            setLoading(false);
        }
    }, [status, search, page]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleStatusFilter = (type) => {
        setStatus(type);
        setPage(1);
    };

    // Hàm định dạng số tiền VND nhanh
    const formatPrice = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

    const getStatusStyle = (orderStatus) => {
        switch (orderStatus) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100/80';
            case 'Pending Payment': return 'bg-amber-50 text-amber-700 border-amber-100/80';
            case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-100/80';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusLabel = (orderStatus) => {
        switch (orderStatus) {
            case 'Paid': return 'Đã thanh toán';
            case 'Pending Payment': return 'Chờ thanh toán';
            case 'Cancelled': return 'Đã hủy đơn';
            default: return orderStatus;
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
            {/* Header phân hệ */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Quản Lý Giao Dịch & Đơn Hàng</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Tra cứu đơn hàng, duyệt thanh toán treo và xử lý hoàn tiền mô phỏng hệ thống</p>
                    </div>
                </div>
            </div>

            {/* Bộ lọc tinh gọn */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã đơn hàng, username khách hàng..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {['', 'Pending Payment', 'Paid', 'Cancelled'].map((t) => (
                        <button
                            key={t}
                            onClick={() => handleStatusFilter(t)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border whitespace-nowrap transition-all
                                ${status === t 
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {t === '' ? 'Tất cả đơn' : getStatusLabel(t)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bảng chứa dữ liệu danh sách */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-600 font-semibold text-sm">
                                <th className="py-4 px-6">Mã Đơn Hàng</th>
                                <th className="py-4 px-6">Khách Hàng</th>
                                <th className="py-4 px-6">Ngày Đặt Hàng</th>
                                <th className="py-4 px-6">Tổng Giá Trị</th>
                                <th className="py-4 px-6">Trạng Thái</th>
                                <th className="py-4 px-6 text-center">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">Đang tải dữ liệu hóa đơn...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">Không tìm thấy đơn hàng nào phù hợp bộ lọc hiện tại.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.order_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6 font-mono font-bold text-slate-600">#{order.order_id}</td>
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-slate-800">{order.full_name || order.username}</div>
                                            <div className="text-xs text-slate-400">{order.email}</div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-500">
                                            {new Date(order.create_at).toLocaleDateString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                        </td>
                                        <td className="py-4 px-6 font-bold text-slate-900">{formatPrice(order.total_amount)}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => setSelectedOrderId(order.order_id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-xl transition-colors"
                                            >
                                                <Eye size={14} /> Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Điều hướng phân trang */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between p-5 border-t border-slate-50 bg-slate-50/30">
                        <span className="text-sm text-slate-500">Trang {page} / {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL CHI TIẾT ĐƠN HÀNG & THAO TÁC XỬ LÝ */}
            <AnimatePresence>
                {selectedOrderId && (
                    <OrderDetailModal
                        orderId={selectedOrderId}
                        onClose={() => setSelectedOrderId(null)}
                        onRefresh={fetchOrders}
                        showToast={showToast}
                        formatPrice={formatPrice}
                        getStatusStyle={getStatusStyle}
                        getStatusLabel={getStatusLabel}
                    />
                )}
            </AnimatePresence>

            {/* THÔNG BÁO TOAST ANIME */}
            <AnimatePresence>
                {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
};

// ─── COMPONENT CON: MODAL XEM CHI TIẾT & HOÀN TIỀN ──────────────────────────
const OrderDetailModal = ({ orderId, onClose, onRefresh, showToast, formatPrice, getStatusStyle, getStatusLabel }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchDetails = useCallback(async () => {
        try {
            const res = await fetch(`${API}/${orderId}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const d = await res.json();
            if (res.ok) setData(d);
            else showToast(d.error || 'Không tìm thấy thông tin đơn hàng', 'error');
        } catch (err) {
            showToast('Lỗi tải dữ liệu chi tiết', 'error');
        } finally {
            setLoading(false);
        }
    }, [orderId, showToast]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    // Xử lý duyệt cổng thanh toán thủ công cho đơn lỗi treo mạng
    const handleConfirmPayment = async () => {
        if (!window.confirm("Xác nhận đơn hàng này đã nhận được tiền thật qua tài khoản ngân hàng thành công?")) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/${orderId}/confirm-payment`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const resData = await res.json();
            if (res.ok) {
                showToast('Đã kích hoạt phê duyệt thanh toán thành công');
                onRefresh();
                onClose();
            } else {
                showToast(resData.error || 'Có lỗi xảy ra', 'error');
            }
        } catch (err) {
            showToast('Lỗi mạng không phản hồi', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Xử lý hủy đơn và cộng trả tiền lại vào ví mô phỏng khách hàng
    const handleRefundAndCancel = async (e) => {
        e.preventDefault();
        if (!reason.trim()) return showToast('Vui lòng nhập lý do hoàn tiền hủy đơn', 'error');
        
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/${orderId}/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ reason })
            });
            const resData = await res.json();
            if (res.ok) {
                showToast('Hủy đơn và hoàn trả tiền ví mô phỏng thành công!');
                onRefresh();
                onClose();
            } else {
                showToast(resData.error || 'Thao tác thất bại', 'error');
            }
        } catch (err) {
            showToast('Lỗi xử lý kết nối máy chủ', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="bg-white w-full max-w-4xl rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header Modal */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                        <FileText className="text-slate-500" size={18} />
                        <h3 className="font-bold text-slate-800 text-base">Hóa đơn chi tiết đơn hàng #{orderId}</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400 flex-1">Đang truy xuất thông tin chi tiết hóa đơn...</div>
                ) : !data ? (
                    <div className="p-12 text-center text-rose-500 flex-1">Không thể lấy dữ liệu đơn hàng.</div>
                ) : (
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        {/* Khung thông tin khách đặt hàng */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">Thông Tin Khách Hàng</div>
                                <div className="flex items-center gap-2 text-slate-700 text-sm">
                                    <User size={15} className="text-slate-400" />
                                    <span className="font-semibold">{data.order.full_name || data.order.username}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <Mail size={15} className="text-slate-400" />
                                    <span>{data.order.email}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">Trạng Thái Đơn Hàng</div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(data.order.status)}`}>
                                        {getStatusLabel(data.order.status)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Calendar size={14} />
                                    <span>Ngày tạo: {new Date(data.order.create_at).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Danh sách các sản phẩm voucher nằm trong đơn */}
                        <div className="space-y-3">
                            <div className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                                <Tag size={14} /> Danh sách Voucher đã mua
                            </div>
                            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                                {data.items.map((item) => (
                                    <div key={item.order_item_id} className="p-4 flex items-center justify-between gap-4 bg-white">
                                        <div className="flex items-center gap-3">
                                            {item.image_url && (
                                                <img src={item.image_url} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-slate-100" />
                                            )}
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                                                <p className="text-xs text-slate-400 mt-0.5">Mã Voucher ID: #{item.voucher_id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-800 text-sm">{formatPrice(item.price_at_purchase || item.price)}</div>
                                            <div className="text-xs text-slate-400">Số lượng: x{item.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-4 bg-slate-50/50 flex justify-between items-center font-bold text-slate-900 border-t border-slate-100">
                                    <span className="text-sm">Tổng cộng tiền thanh toán:</span>
                                    <span className="text-base text-indigo-600">{formatPrice(data.order.total_amount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* HIỂN THỊ THÔNG TIN LƯU VẾT NẾU ĐÃ BỊ HỦY ĐƠN TRƯỚC ĐÓ */}
                        {data.order.status === 'Cancelled' && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
                                <div className="text-xs font-bold text-rose-800 uppercase flex items-center gap-1">
                                    <ShieldCheck size={14} /> Nhật ký lưu vết hủy đơn hệ thống
                                </div>
                                <p className="text-sm text-rose-700"><b>Lý do hoàn trả:</b> {data.order.refund_reason || 'Không cung cấp lý do chi tiết'}</p>
                                <p className="text-xs text-rose-500">Mã quản trị viên xử lý: #{data.order.processed_by} • Xử lý ngày: {new Date(data.order.processed_at).toLocaleString('vi-VN')}</p>
                            </div>
                        )}

                        {/* KHUNG THAO TÁC NGHIỆP VỤ (CHỈ HIỂN THỊ KHI ĐƠN CHƯA BỊ HỦY) */}
                        {data.order.status !== 'Cancelled' && (
                            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Khung 1: Phê duyệt thanh toán treo */}
                                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-3 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <h5 className="font-bold text-amber-800 text-sm flex items-center gap-1">
                                            <DollarSign size={15} /> Khắc phục cổng thanh toán
                                        </h5>
                                        <p className="text-xs text-amber-600 leading-relaxed">
                                            Sử dụng trong trường hợp webhook cổng thanh toán PayOS/Momo bị lỗi treo, nhưng tiền thật của khách đã trừ. Bấm nút để chuyển trạng thái sang <b>Đã thanh toán</b> khẩn cấp.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={submitting || data.order.status === 'Paid'}
                                        onClick={handleConfirmPayment}
                                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors disabled:opacity-40"
                                    >
                                        {data.order.status === 'Paid' ? 'Đơn này đã thanh toán rồi' : 'Duyệt Thanh Toán Thủ Công'}
                                    </button>
                                </div>

                                {/* Khung 2: Hủy đơn & Ghi nhận hoàn tiền mô phỏng */}
                                <form onSubmit={handleRefundAndCancel} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                                    <h5 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                                        <HelpCircle size={15} /> Hủy Đơn & Hoàn Ví Mô Phỏng
                                    </h5>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Lý do hoàn trả tiền hủy đơn</label>
                                        <input
                                            type="text"
                                            placeholder="Ví dụ: Khách hàng yêu cầu đổi trả, Voucher hết hạn..."
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-all"
                                            disabled={submitting}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors disabled:opacity-50"
                                    >
                                        {submitting ? 'Đang xử lý...' : 'Xác Nhận Hủy Đơn & Hoàn Tiền'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default OrderManagement;
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users, Search, Shield, Building2, User,
    Lock, Unlock, ChevronLeft, ChevronRight,
    X, Phone, Mail, MapPin, Calendar, RefreshCw,
    AlertTriangle, CheckCircle, Ticket, ArrowRight, Filter
} from 'lucide-react';
import { API_ADMIN_URL } from '../config';

const API = API_ADMIN_URL;
const getToken = () => localStorage.getItem('adminToken');

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 text-white font-medium text-sm rounded-2xl shadow-xl backdrop-blur-md
                ${toast.type === 'success' ? 'bg-[#1a3a5c] shadow-[#1a3a5c]/20' : 'bg-rose-500 shadow-rose-500/20'}`}
        >
            {toast.type === 'success' ? (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <CheckCircle size={14} />
                </div>
            ) : (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <AlertTriangle size={14} />
                </div>
            )}
            <span className="text-slate-100">{toast.message}</span>
        </motion.div>
    );
};

// ─── MODAL CHI TIẾT DÙNG PORTAL ────────────────────────────────────────────────
const UserDetailModal = ({ userId, onClose, onLockToggle }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    const fetchDetail = useCallback(async () => {
        try {
            // 1. Lấy thông tin chi tiết User
            const res = await fetch(`${API}/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                // 2. Nếu là Đối tác, tiến hành gọi thêm API đếm số lượng voucher
                if (data.role === 'Partner') {
                    const countRes = await fetch(`${API}/vouchers/count/${userId}`, {
                        headers: { 'Authorization': `Bearer ${getToken()}` }
                    });
                    if (countRes.ok) {
                        const countData = await countRes.json();
                        data.total_vouchers = countData.count; // Gán trực tiếp vào object data
                    }
                }
                setUser(data);
            }
        } catch (err) {
            console.error("Lỗi lấy chi tiết người dùng:", err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const handleLockToggle = async () => {
        if (!user) return;
        setActionLoading(true);
        try {
            const currentLockState = !user.is_active;
            const res = await fetch(`${API}/users/${userId}/toggle-lock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ lock: currentLockState })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(prev => ({ ...prev, is_active: !prev.is_active }));
                onLockToggle(userId, !user.is_active);
            } else {
                alert(data.error || "Thao tác thất bại");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleNavigateToVouchers = () => {
        if (!user) return;
        navigate('/vouchers', { state: { searchPartner: user.email } });
    };

    if (loading) {
        return createPortal(
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[9999] flex items-center justify-center">
                <div className="bg-white px-6 py-5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
                    <RefreshCw className="animate-spin text-[#6ec6a0]" size={20} />
                    <span className="font-semibold text-slate-700 text-sm">Đang tải thông tin...</span>
                </div>
            </div>,
            document.body
        );
    }

    if (!user) return null;
    const isPartner = user.role === 'Partner';

    const modalContent = (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100"
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-[#1a3a5c] text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-white">
                            {isPartner ? <Building2 size={18} /> : <User size={18} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-base tracking-tight">Chi tiết tài khoản</h3>
                            <p className="text-xs text-slate-300 mt-0.5 font-medium">ID: {user.username}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                    <div className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2
                        ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.is_active ? 'Tài khoản đang hoạt động' : 'Tài khoản đang bị khóa'}
                    </div>

                    <div className="px-6 py-5 space-y-4 bg-slate-50/50">
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField label="Vai trò hệ thống" value={user.role === 'Partner' ? 'Đối tác (Partner)' : 'Khách hàng (Customer)'} highlight />
                            <InfoField label="Họ và tên" value={user.full_name || '---'} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <Mail size={16} className="text-slate-400 shrink-0" />
                                <span className="truncate font-medium">{user.email || '---'}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <Phone size={16} className="text-slate-400 shrink-0" />
                                <span className="font-medium">{user.phone || '---'}</span>
                            </div>
                        </div>
                    </div>

                    {isPartner && (
                        <div className="px-6 py-5 space-y-4">
                            <h4 className="text-[11px] font-semibold text-[#1a3a5c] uppercase tracking-wider">Thông tin doanh nghiệp</h4>
                            <div className="bg-white rounded-2xl p-4 space-y-3.5 border border-slate-100 shadow-sm">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tên công ty / Thương hiệu</p>
                                    <p className="text-sm font-bold text-slate-800 mt-0.5">{user.company_name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-1">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mã số thuế</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{user.tax_id || '---'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Người đại diện</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{user.representative_name || '---'}</p>
                                    </div>
                                </div>
                                <div className="pt-3 mt-1 flex items-start gap-2 text-sm text-slate-600 border-t border-slate-100">
                                    <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                    <span className="font-medium text-xs leading-relaxed">{user.headquarters || 'Chưa cập nhật địa chỉ trụ sở'}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleNavigateToVouchers}
                                className="w-full flex items-center justify-between px-5 py-4 bg-[#f5f7fa] hover:bg-[#eaf0f6] border border-slate-100 transition-all rounded-2xl group text-slate-800"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] text-white flex items-center justify-center">
                                        <Ticket size={16} />
                                    </div>
                                    <span className="text-sm font-bold">Kho Voucher đã phát hành</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold">{user.total_vouchers || 0}</span>
                                    <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-[#1a3a5c] transition-all" />
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end">
                    <button
                        disabled={actionLoading}
                        onClick={handleLockToggle}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50
                            ${!user.is_active
                                ? 'bg-[#6ec6a0] text-white hover:bg-[#5bb890]'
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100'}`}
                    >
                        {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : !user.is_active ? <Unlock size={16} /> : <Lock size={16} />}
                        {actionLoading ? 'Đang xử lý dữ liệu...' : !user.is_active ? 'Kích hoạt / Mở khóa tài khoản' : 'Khóa tài khoản này'}
                    </button>
                </div>
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

const InfoField = ({ label, value, highlight }) => (
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-sm font-bold ${highlight ? 'text-[#1a3a5c]' : 'text-slate-800'}`}>{value}</p>
    </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total_users: 0, total_customers: 0, total_partners: 0 });
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [toast, setToast] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ page, limit: 6, role: roleFilter, status: statusFilter, search: searchTerm }).toString();
            const res = await fetch(`${API}/users?${query}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
            const data = await res.json();
            if (res.ok) { setUsers(data.users); setTotalPages(data.totalPages); }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [page, roleFilter, statusFilter, searchTerm]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API}/users/stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
            const data = await res.json();
            if (res.ok) setStats(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { fetchStats(); }, []);

    const handleLockToggleOnUI = (id, newActiveState) => {
        setUsers(prev => prev.map(u => u.user_id === id ? { ...u, is_active: newActiveState } : u));
        setToast({ type: 'success', message: newActiveState ? 'Đã mở khóa tài khoản thành công!' : 'Đã khóa tài khoản thành công!' });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 md:p-8 space-y-6 bg-[#f5f7fa] min-h-screen"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
                <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1">
                        Phân hệ quản trị tài khoản & đối tác
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Quản lý Thành viên</h1>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { label: 'Tổng thành viên', value: stats.total_users, icon: Users, accent: { bg: 'bg-blue-50', icon: 'text-blue-400' } },
                    { label: 'Khách hàng', value: stats.total_customers, icon: User, accent: { bg: 'bg-emerald-50', icon: 'text-emerald-400' } },
                    { label: 'Đối tác doanh nghiệp', value: stats.total_partners, icon: Building2, accent: { bg: 'bg-violet-50', icon: 'text-violet-400' } },
                ].map((s, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between"
                    >
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{s.value.toLocaleString()}</h2>
                        </div>
                        <div className={`p-2.5 rounded-xl ${s.accent.bg}`}>
                            <s.icon size={18} strokeWidth={2} className={s.accent.icon} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 bg-[#f5f7fa] border border-slate-100 rounded-xl px-4 py-2.5 w-full lg:w-96 focus-within:bg-white focus-within:border-[#1a3a5c] transition-all">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài khoản, tên, email..."
                        className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                        <Filter size={14} /> Bộ lọc
                    </div>
                    <select
                        className="bg-[#f5f7fa] border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 outline-none hover:border-slate-200 transition-colors"
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="Customer">Khách hàng</option>
                        <option value="Partner">Đối tác</option>
                    </select>
                    <select
                        className="bg-[#f5f7fa] border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 outline-none hover:border-slate-200 transition-colors"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="locked">Đang bị khóa</option>
                    </select>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4">Thành viên</th>
                                <th className="px-6 py-4">Thông tin liên hệ</th>
                                <th className="px-6 py-4">Vai trò</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400">
                                        <RefreshCw className="animate-spin text-[#6ec6a0] mx-auto mb-3" size={24} />
                                        <p className="text-xs font-medium">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400 font-medium text-sm">
                                        Không tìm thấy thành viên phù hợp
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.user_id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${u.role === 'Partner' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                                                {u.role === 'Partner' ? <Building2 size={16} /> : <User size={16} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{u.username}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{u.full_name || 'Chưa cập nhật tên'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-700 text-xs">{u.email || '---'}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{u.phone || '---'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider
                                            ${u.role === 'Partner' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider
                                            ${u.is_active ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            {u.is_active ? 'Hoạt động' : 'Đang khóa'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedId(u.user_id)}
                                            className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2 hover:bg-[#1a3a5c] hover:text-white hover:border-[#1a3a5c] transition-all shadow-sm"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Trang {page} / {totalPages}
                        </span>
                        <div className="flex gap-1.5">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-2 rounded-xl border border-slate-100 bg-white disabled:opacity-40 text-slate-600 hover:bg-slate-50 transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-2 rounded-xl border border-slate-100 bg-white disabled:opacity-40 text-slate-600 hover:bg-slate-50 transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Detail rendering */}
            <AnimatePresence>
                {selectedId && (
                    <UserDetailModal userId={selectedId} onClose={() => setSelectedId(null)} onLockToggle={handleLockToggleOnUI} />
                )}
            </AnimatePresence>

            {/* Notification Toast */}
            <AnimatePresence>
                {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </motion.div>
    );
};

export default UserManagement;

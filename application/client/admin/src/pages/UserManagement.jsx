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

const API = 'http://localhost:5000/api/admin';
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
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border border-slate-750 text-white font-semibold text-sm bg-slate-900"
        >
            {toast.type === 'success' ? <CheckCircle size={18} className="text-white" /> : <AlertTriangle size={18} className="text-white" />}
            {toast.message}
        </motion.div>
    );
};

// ─── MINI DASHBOARD STAT CARD ────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, active, onClick }) => (
    <motion.div
        whileHover={{ y: -2 }}
        onClick={onClick}
        className={`p-6 rounded-xl border transition-all cursor-pointer select-none ${
            active 
                ? 'bg-slate-950 border-slate-950 text-white shadow-sm' 
                : 'bg-white border-slate-200/60 hover:shadow-sm text-slate-900'
        }`}
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${active ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-800'}`}>
                <Icon size={22} />
            </div>
            {active && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white/20 text-white rounded-md">Đang lọc</span>}
        </div>
        <p className={`text-xs font-semibold ${active ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className="text-2xl font-black mt-1 tracking-tight">{value}</p>
    </motion.div>
);

// ─── DETAIL MODAL ────────────────────────────────────────────────────────────
const UserDetailModal = ({ userId, onClose, onLockToggle }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    const fetchDetail = useCallback(async () => {
        try {
            const res = await fetch(`${API}/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (res.ok) setUser(data);
        } catch (err) {
            console.error("Lỗi lấy chi tiết người dùng:", err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    if (loading) return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl flex items-center gap-3 font-semibold text-slate-600 shadow-sm border border-slate-100">
                <RefreshCw className="animate-spin text-slate-900" /> Đang tải thông tin...
            </div>
        </div>
    );

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
        navigate('/vouchers', { state: { searchPartner: user.user_id } });
    };

    // Render loading state ra thẳng body thông qua Portal
    if (loading) {
        return createPortal(
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[9999] flex items-center justify-center">
                <div className="bg-white px-6 py-5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
                    <RefreshCw className="animate-spin text-indigo-600" size={20} />
                    <span className="font-semibold text-slate-700 text-sm">Đang tải thông tin...</span>
                </div>
            </div>,
            document.body
        );
    }

    if (!user) return null;
    const isPartner = user.role === 'Partner';

    // Nội dung Modal chi tiết
    const modalContent = (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white w-full max-w-lg rounded-xl shadow-lg border border-slate-200 overflow-hidden"
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 text-slate-900 rounded-lg">
                            {user.role === 'Partner' ? <Building2 size={20} /> : <User size={20} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-base tracking-tight">Chi tiết tài khoản</h3>
                            <p className="text-xs text-slate-300 mt-0.5 font-medium">ID: {user.username}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
                    {/* Cơ bản */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Username</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{user.username}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vai trò</p>
                            <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 bg-slate-100 text-slate-800 border border-slate-200">{user.role}</span>
                        </div>
                    </div>

                    {/* Partner Info */}
                    {isPartner && (
                        <div className="px-6 py-5 space-y-4">
                            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Thông tin doanh nghiệp</h4>
                            <div className="bg-slate-50 rounded-2xl p-4 space-y-3.5 border border-slate-100">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Tên công ty / Thương hiệu</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{user.company_name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-1">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Mã số thuế</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{user.tax_id || '---'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Người đại diện</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{user.representative_name || '---'}</p>
                                    </div>
                                </div>
                                <div className="pt-2 flex items-start gap-2 text-sm text-slate-600 border-t border-slate-200/60">
                                    <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                    <span className="font-medium text-xs leading-relaxed">{user.headquarters || 'Chưa cập nhật địa chỉ trụ sở'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Nghiệp vụ riêng biệt */}
                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1.5">Dữ liệu phân hệ</h4>
                        {user.role === 'Partner' ? (
                            <div className="space-y-2 text-sm">
                                <p><strong className="text-slate-700">Doanh nghiệp:</strong> {user.details?.company_name}</p>
                                <p><strong className="text-slate-700">Đại diện:</strong> {user.details?.representative_name}</p>
                                <p><strong className="text-slate-700">Mã số thuế:</strong> {user.details?.tax_id}</p>
                                <p className="flex items-start gap-1"><MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" /> <span>{user.details?.headquarters}</span></p>
                            </div>
                        ) : (
                            <div className="space-y-2 text-sm">
                                <p><strong className="text-slate-700">Họ và tên:</strong> {user.details?.full_name || 'N/A'}</p>
                                <p className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400" /> <span>{user.details?.dob ? new Date(user.details.dob).toLocaleDateString('vi-VN') : 'N/A'}</span></p>
                                <p className="flex items-start gap-1"><MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" /> <span>{user.details?.address || 'N/A'}</span></p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors text-sm">
                        Đóng lại
                    </button>
                    <button
                        disabled={btnLoading}
                        onClick={handleLockClick}
                        className={`flex-1 py-3 font-bold rounded-lg text-white text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                            isActive 
                                ? 'bg-slate-900 hover:bg-slate-850' 
                                : 'bg-slate-700 hover:bg-slate-800'
                        }`}
                    >
                        {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : !user.is_active ? <Unlock size={16} /> : <Lock size={16} />}
                        {actionLoading ? 'Đang xử lý dữ liệu...' : !user.is_active ? 'Kích hoạt / Mở khóa tài khoản' : 'Khóa tài khoản này'}
                    </button>
                </div>
            </motion.div>
        </div>
    );

    // Gắn thẳng ra ngoài Body thông qua Portal
    return createPortal(modalContent, document.body);
};

const InfoField = ({ label, value, highlight }) => (
    <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-sm font-bold ${highlight ? 'text-indigo-600' : 'text-slate-800'}`}>{value}</p>
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
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md">
                        Hệ thống điều hành
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight mt-2">
                        Quản lý Thành viên
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Phân hệ quản trị tài khoản khách hàng cá nhân và đối tác thương hiệu thương mại.
                    </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-950/10 self-start sm:self-center shrink-0">
                    <Users size={20} />
                </div>
            </div>

            {/* Dashboard Mini tương tác */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={Users} 
                    label="Tổng người dùng hệ thống" 
                    value={stats.total_users} 
                    active={dashboardActive === 'all'}
                    onClick={() => handleDashboardClick('all')}
                />
                <StatCard 
                    icon={User} 
                    label="Khách hàng cá nhân" 
                    value={stats.total_customers} 
                    active={dashboardActive === 'customer'}
                    onClick={() => handleDashboardClick('customer')}
                />
                <StatCard 
                    icon={Building2} 
                    label="Doanh nghiệp đối tác" 
                    value={stats.total_partners} 
                    active={dashboardActive === 'partner'}
                    onClick={() => handleDashboardClick('partner')}
                />
                <StatCard 
                    icon={Lock} 
                    label="Tài khoản đang bị khóa" 
                    value={stats.locked}
                    active={dashboardActive === 'locked'}
                    onClick={() => handleDashboardClick('locked')}
                />
            </div>

            {/* Bộ lọc & Tìm kiếm */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100 w-full md:w-96 group focus-within:border-slate-400 focus-within:bg-white transition-all">
                    <Search size={18} className="text-slate-400 group-focus-within:text-slate-900" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài khoản, tên, email..."
                        className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder:text-slate-400 font-medium"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    {['', 'Customer', 'Partner'].map((r) => (
                        <button
                            key={r}
                            onClick={() => {
                                setPage(1);
                                setRoleFilter(r);
                                setDashboardActive(r === '' ? 'all' : r.toLowerCase());
                            }}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                roleFilter === r && statusFilter === ''
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-150'
                            }`}
                        >
                            {r === '' ? 'Tất cả vai trò' : r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 border-b border-slate-200/60 text-[11px] font-bold uppercase tracking-wider">
                                <th className="px-6 py-4.5">Thành viên</th>
                                <th className="px-6 py-4.5">Thông tin liên hệ</th>
                                <th className="px-6 py-4.5">Vai trò</th>
                                <th className="px-6 py-4.5">Trạng thái</th>
                                <th className="px-6 py-4.5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400">
                                        <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-3" size={24} />
                                        <p className="text-xs font-medium text-slate-500">Đang truy xuất đồng bộ dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400 font-medium text-sm">
                                        Không tìm thấy thành viên phù hợp với tiêu chí lọc
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    // Xác định Active động
                                    const isUserActive = u.is_active === true || u.is_active === null || u.is_active === undefined;
                                    return (
                                        <tr key={u.user_id} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="p-4 pl-6 text-slate-400 font-mono text-xs">{u.user_id}</td>
                                            <td className="p-4 text-slate-900 font-bold">{u.username}</td>
                                            <td className="p-4">
                                                <div className="text-xs text-slate-500 font-semibold">{u.email}</div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">{u.phone || 'Chưa cập nhật'}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                                    u.role === 'Partner' ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-slate-50 text-slate-700'
                                                }`}>{u.role}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                                                    isUserActive ? 'text-slate-850' : 'text-slate-400'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isUserActive ? 'bg-slate-900' : 'bg-slate-300'}`} />
                                                    {isUserActive ? 'Đang hoạt động' : 'Đang bị khóa'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => setSelectedId(u.user_id)}
                                                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 text-xs font-bold text-slate-650 transition-colors"
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Trang {page} / {totalPages}
                        </span>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                            >
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
        </div>
    );
};

export default UserManagement;
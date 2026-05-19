import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Shield, Building2, User,
    Lock, Unlock, ChevronLeft, ChevronRight,
    X, Phone, Mail, MapPin, Calendar, RefreshCw,
    AlertTriangle, CheckCircle
} from 'lucide-react';

const API = 'http://localhost:5000/api/admin';
const getToken = () => localStorage.getItem('adminToken');

// ─── TOAST NOTIFICATION ───────────────────────────────────────────────────────
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
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {toast.message}
        </motion.div>
    );
};

// ─── MINI DASHBOARD STAT CARD ────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg, active, onClick }) => (
    <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={onClick}
        className={`p-6 rounded-2xl border transition-all cursor-pointer select-none ${
            active 
                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-950/20' 
                : 'bg-white border-slate-100 hover:shadow-lg shadow-sm text-slate-900'
        }`}
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${active ? 'bg-white/10 text-white' : `${bg} ${color}`}`}>
                <Icon size={22} />
            </div>
            {active && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-emerald-500 text-white rounded-md">Đang lọc</span>}
        </div>
        <p className={`text-xs font-semibold ${active ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className="text-2xl font-black mt-1 tracking-tight">{value}</p>
    </motion.div>
);

// ─── DETAIL MODAL ────────────────────────────────────────────────────────────
const UserDetailModal = ({ userId, onClose, onLockToggle }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`${API}/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                if (res.ok) setUser(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [userId]);

    if (loading) return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl flex items-center gap-3 font-semibold text-slate-600 shadow-xl">
                <RefreshCw className="animate-spin text-indigo-600" /> Đang tải thông tin...
            </div>
        </div>
    );

    if (!user) return null;

    // Lấy trạng thái is_active an toàn cho cả Customer và Partner
    const isActive = user.details?.is_active !== false; 

    const handleLockClick = async () => {
        setBtnLoading(true);
        // lock = true tức là Account đang Active và Admin muốn KHÓA nó lại
        await onLockToggle(user.user_id, isActive ? true : false);
        setBtnLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            {user.role === 'Partner' ? <Building2 size={20} /> : <User size={20} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Chi tiết tài khoản</h3>
                            <p className="text-xs text-slate-500 font-medium">ID: #{user.user_id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
                    {/* Cơ bản */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Username</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{user.username}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vai trò</p>
                            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${
                                user.role === 'Partner' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>{user.role}</span>
                        </div>
                    </div>

                    {/* Liên hệ */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1.5">Thông tin liên hệ</h4>
                        <div className="flex items-center gap-3 text-sm text-slate-600"><Mail size={16} /> {user.email || 'N/A'}</div>
                        <div className="flex items-center gap-3 text-sm text-slate-600"><Phone size={16} /> {user.phone || 'N/A'}</div>
                    </div>

                    {/* Nghiệp vụ riêng biệt */}
                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80">
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
                    <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm">
                        Đóng lại
                    </button>
                    <button
                        disabled={btnLoading}
                        onClick={handleLockClick}
                        className={`flex-1 py-3 font-bold rounded-xl text-white text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                            isActive 
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-100' 
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                        }`}
                    >
                        {isActive ? <Lock size={16} /> : <Unlock size={16} />}
                        {btnLoading ? 'Đang xử lý...' : (isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const UserManagement = () => {
    const [stats, setStats] = useState({ total_users: 0, total_customers: 0, total_partners: 0, pending_partners: 0, locked_partners: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(''); // Lưu trữ loại role lọc từ nút bấm cũ hoặc dashboard
    const [statusFilter, setStatusFilter] = useState(''); // Lọc tài khoản bị khóa ('locked')
    const [dashboardActive, setDashboardActive] = useState('all'); // Quản lý thẻ nào trên dashboard đang active

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedId, setSelectedId] = useState(null);
    const [toast, setToast] = useState(null);

    // Fetch thống kê tổng hợp
    const fetchStats = async () => {
        try {
            const res = await fetch(`${API}/users/stats`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) setStats(await res.json());
        } catch (err) { console.error(err); }
    };

    // Fetch danh sách người dùng phân trang & lọc nâng cao
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            // Định hình URL query
            let url = `${API}/users?page=${page}&limit=8&search=${search}`;
            if (roleFilter) url += `&role=${roleFilter}`;
            if (statusFilter) url += `&status=${statusFilter}`; // Gửi params khóa lên back-end xử lý lọc

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setTotalPages(data.totalPages);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, search, roleFilter, statusFilter]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Xử lý Debounce tìm kiếm
    useEffect(() => {
        const handler = setTimeout(() => {
            setPage(1);
            fetchUsers();
        }, 400);
        return () => clearTimeout(handler);
    }, [search]);

    // Xử lý sự kiện bấm thẻ Dashboard Mini
    const handleDashboardClick = (type) => {
        setPage(1);
        setDashboardActive(type);
        if (type === 'all') {
            setRoleFilter('');
            setStatusFilter('');
        } else if (type === 'customer') {
            setRoleFilter('Customer');
            setStatusFilter('');
        } else if (type === 'partner') {
            setRoleFilter('Partner');
            setStatusFilter('');
        } else if (type === 'locked') {
            setRoleFilter('');
            setStatusFilter('locked'); // Kích hoạt trạng thái lọc locked
        }
    };

// Xử lý Toggle Khóa tài khoản
    const handleLockToggle = async (id, currentLockState) => {
        try {
            const res = await fetch(`${API}/users/${id}/toggle-lock`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lock: currentLockState })
            });
            const data = await res.json();
            if (res.ok) {
                setToast({ type: 'success', message: data.message });
                
                // CẬP NHẬT TRỰC TIẾP TRẠNG THÁI TRÊN UI ĐỂ TRÁNH LỖI CẤU TRÚC
                setUsers(prevUsers => prevUsers.map(u => {
                    if (u.user_id === id) {
                        return { ...u, is_active: data.is_active };
                    }
                    return u;
                }));
                
                fetchStats(); // Cập nhật lại số liệu dashboard mini
            } else {
                setToast({ type: 'error', message: data.error || 'Thao tác thất bại' });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'Lỗi kết nối máy chủ' });
        }
    };

    return (
        <div className="p-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Shield className="text-indigo-600" size={24} /> Quản Lý Người Dùng
                    </h1>
                </div>
            </div>

            {/* Dashboard Mini tương tác */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={Users} 
                    label="Tổng người dùng hệ thống" 
                    value={stats.total_users} 
                    color="text-blue-600" bg="bg-blue-50"
                    active={dashboardActive === 'all'}
                    onClick={() => handleDashboardClick('all')}
                />
                <StatCard 
                    icon={User} 
                    label="Khách hàng cá nhân" 
                    value={stats.total_customers} 
                    color="text-emerald-600" bg="bg-emerald-50"
                    active={dashboardActive === 'customer'}
                    onClick={() => handleDashboardClick('customer')}
                />
                <StatCard 
                    icon={Building2} 
                    label="Doanh nghiệp đối tác" 
                    value={stats.total_partners} 
                    color="text-indigo-600" bg="bg-indigo-50"
                    active={dashboardActive === 'partner'}
                    onClick={() => handleDashboardClick('partner')}
                />
                <StatCard 
                    icon={Lock} 
                    label="Tài khoản đang bị khóa" 
                    value={stats.locked}
                    color="text-rose-600" bg="bg-rose-50"
                    active={dashboardActive === 'locked'}
                    onClick={() => handleDashboardClick('locked')}
                />
            </div>

            {/* Bộ lọc & Tìm kiếm */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 w-full md:w-96 group focus-within:border-indigo-500 focus-within:bg-white transition-all">
                    <Search size={18} className="text-slate-400 group-focus-within:text-indigo-600" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email, sđt..."
                        className="bg-transparent border-none outline-none text-sm w-full font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                roleFilter === r && statusFilter === ''
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                            }`}
                        >
                            {r === '' ? 'Tất cả vai trò' : r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="p-4 pl-6">ID Người dùng</th>
                                <th className="p-4">Tài khoản</th>
                                <th className="p-4">Email / SĐT</th>
                                <th className="p-4">Vai trò</th>
                                <th className="p-4">Trạng thái</th>
                                <th className="p-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">
                                        <RefreshCw className="animate-spin inline-block mr-2" size={18} /> Đang đồng bộ danh sách...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">Không tìm thấy người dùng phù hợp.</td>
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
                                                    u.role === 'Partner' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>{u.role}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                                                    isUserActive ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isUserActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    {isUserActive ? 'Đang hoạt động' : 'Đang bị khóa'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => setSelectedId(u.user_id)}
                                                    className="px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors"
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

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="p-4 bg-slate-50/40 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-semibold">Trang {page} / {totalPages}</p>
                        <div className="flex gap-1.5">
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

            {/* ── DETAIL MODAL ── */}
            <AnimatePresence>
                {selectedId && (
                    <UserDetailModal
                        userId={selectedId}
                        onClose={() => setSelectedId(null)}
                        onLockToggle={handleLockToggle}
                    />
                )}
            </AnimatePresence>

            {/* ── TOAST ── */}
            <AnimatePresence>
                {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
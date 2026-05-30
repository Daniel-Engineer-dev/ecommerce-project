// pages/PartnerApproval.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Check, X, Building2, User, Mail, ShieldCheck,
    Phone, MapPin, RefreshCw, Hash, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('adminToken');

const apiFetch = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
            ...options.headers,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => (
    <AnimatePresence>
        {toast && (
            <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5
                    rounded-xl shadow-lg text-sm font-semibold border
                    ${toast.type === 'success'
                        ? 'bg-white border-emerald-200 text-emerald-800'
                        : 'bg-white border-rose-200 text-rose-800'
                    }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                <span className={`w-2 h-2 rounded-full shrink-0
                    ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}
                />
                {toast.message}
            </motion.div>
        )}
    </AnimatePresence>
);

// ─── INFO ROW ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-2.5 min-w-0">
        <span className="text-zinc-400 mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none mb-0.5"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {label}
            </p>
            <p className="text-sm font-medium text-zinc-800 truncate" title={value}>
                {value || <span className="text-zinc-300 italic">Chưa cập nhật</span>}
            </p>
        </div>
    </div>
);

// ─── PARTNER CARD ─────────────────────────────────────────────────────────────
const PartnerCard = ({ partner, onApprove, onReject, isLoading }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22 }}
        className="bg-white rounded-2xl border border-zinc-200 overflow-hidden flex flex-col"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100
                    flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-zinc-900 text-[15px] leading-snug truncate">
                        {partner.company_name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-medium"
                        style={{ fontFamily: "'DM Mono', monospace" }}>
                        ID #{partner.user_id} · @{partner.username}
                    </p>
                </div>
            </div>
            <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold
                uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200
                px-2.5 py-1 rounded-full"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Chờ duyệt
            </span>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-zinc-100" />

        {/* Info grid */}
        <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-4">
            <InfoRow
                icon={<User size={13} />}
                label="Người đại diện"
                value={partner.representative_name}
            />
            <InfoRow
                icon={<Phone size={13} />}
                label="Số điện thoại"
                value={partner.phone}
            />
            <InfoRow
                icon={<Hash size={13} />}
                label="Mã số thuế"
                value={partner.tax_id}
            />
            <InfoRow
                icon={<Mail size={13} />}
                label="Email"
                value={partner.email}
            />
            <div className="col-span-2">
                <InfoRow
                    icon={<MapPin size={13} />}
                    label="Trụ sở chính"
                    value={partner.headquarters}
                />
            </div>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-zinc-100" />

        {/* Actions */}
        <div className="px-5 py-4 flex gap-2.5">
            <button
                disabled={isLoading}
                onClick={() => onApprove(partner.user_id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                    bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white
                    text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                ) : (
                    <Check size={15} strokeWidth={2.5} />
                )}
                Phê duyệt
            </button>
            <button
                disabled={isLoading}
                onClick={() => onReject(partner.user_id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                    bg-zinc-100 hover:bg-zinc-200 active:scale-[0.98] text-zinc-600
                    text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <X size={15} strokeWidth={2.5} />
                Từ chối
            </button>
        </div>
    </motion.div>
);

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
const EmptyState = ({ onRefresh }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
    >
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
            <ShieldCheck size={24} className="text-zinc-400" />
        </div>
        <h3 className="font-bold text-zinc-800 text-base mb-1">Không có hồ sơ chờ duyệt</h3>
        <p className="text-sm text-zinc-400 mb-5 max-w-xs">
            Tất cả hồ sơ đối tác đã được xử lý. Làm mới để kiểm tra thêm.
        </p>
        <button
            onClick={onRefresh}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-600
                bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-xl transition-colors"
        >
            <RefreshCw size={14} />
            Làm mới
        </button>
    </motion.div>
);

// ─── ERROR STATE ──────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
    >
        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
            <AlertCircle size={24} className="text-rose-400" />
        </div>
        <h3 className="font-bold text-zinc-800 text-base mb-1">Không thể tải dữ liệu</h3>
        <p className="text-sm text-zinc-400 mb-5 max-w-xs">{message}</p>
        <button
            onClick={onRetry}
            className="flex items-center gap-2 text-sm font-semibold text-rose-600
                bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors"
        >
            <RefreshCw size={14} />
            Thử lại
        </button>
    </motion.div>
);

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-100 rounded w-2/3" />
                <div className="h-3 bg-zinc-100 rounded w-1/3" />
            </div>
        </div>
        <div className="border-t border-zinc-100" />
        <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                    <div className="h-2.5 bg-zinc-100 rounded w-1/2" />
                    <div className="h-3.5 bg-zinc-100 rounded w-3/4" />
                </div>
            ))}
            <div className="col-span-2 space-y-1.5">
                <div className="h-2.5 bg-zinc-100 rounded w-1/3" />
                <div className="h-3.5 bg-zinc-100 rounded w-full" />
            </div>
        </div>
        <div className="border-t border-zinc-100" />
        <div className="flex gap-2.5">
            <div className="flex-1 h-10 bg-zinc-100 rounded-xl" />
            <div className="flex-1 h-10 bg-zinc-100 rounded-xl" />
        </div>
    </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const PartnerApproval = () => {
    const [partners, setPartners]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // user_id đang xử lý
    const [toast, setToast]               = useState(null);

    // ── Fetch danh sách pending từ GET /api/admin/partners/pending ──
    const fetchPartners = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch('/api/admin/partners/pending');
            // API trả về array trực tiếp (theo AdminService.getPendingPartners)
            setPartners(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Không thể kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPartners(); }, [fetchPartners]);

    // ── Toast helper ──
    const showToast = (type, message) => {
        setToast({ type, message, id: Date.now() });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Approve: POST /api/admin/partners/approve/:id ──
    const handleApprove = async (userId) => {
        setActionLoading(userId);
        try {
            await apiFetch(`/api/admin/partners/approve/${userId}`, { method: 'POST' });
            showToast('success', 'Phê duyệt đối tác thành công! Email thông báo đã được gửi.');
            setPartners(prev => prev.filter(p => p.user_id !== userId));
        } catch (err) {
            showToast('error', err.message || 'Phê duyệt thất bại.');
        } finally {
            setActionLoading(null);
        }
    };

    // ── Reject: POST /api/admin/partners/reject/:id ──
    const handleReject = async (userId) => {
        setActionLoading(userId);
        try {
            await apiFetch(`/api/admin/partners/reject/${userId}`, { method: 'POST' });
            showToast('success', 'Đã từ chối và gửi email thông báo đến đối tác.');
            setPartners(prev => prev.filter(p => p.user_id !== userId));
        } catch (err) {
            showToast('error', err.message || 'Từ chối thất bại.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>

            <Toast toast={toast} />

            {/* ── Header ── */}
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-zinc-950 tracking-tight">
                        Xét duyệt đối tác
                    </h1>

                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    {/* Counter badge */}
                    {!loading && !error && partners.length > 0 && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200
                            rounded-full px-3.5 py-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-xs font-bold text-amber-700"
                                style={{ fontFamily: "'DM Mono', monospace" }}>
                                {partners.length} hồ sơ
                            </span>
                        </div>
                    )}

                    {/* Refresh button */}
                    <button
                        onClick={fetchPartners}
                        disabled={loading}
                        className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 active:scale-95
                            flex items-center justify-center transition-all disabled:opacity-50"
                        title="Làm mới"
                    >
                        <RefreshCw size={15} className={`text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

<<<<<<< HEAD
            {/* ── Body ── */}
            {loading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
=======
            {partners.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">Hiện không có yêu cầu nào đang chờ xử lý.</p>
>>>>>>> customer
                </div>
            ) : error ? (
                <ErrorState message={error} onRetry={fetchPartners} />
            ) : partners.length === 0 ? (
                <EmptyState onRefresh={fetchPartners} />
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {partners.map(partner => (
                            <PartnerCard
                                key={partner.user_id}
<<<<<<< HEAD
                                partner={partner}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                isLoading={actionLoading === partner.user_id}
                            />
=======
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                            >
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-lg border border-slate-200/50 flex items-center justify-center">
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{partner.company_name}</h3>
                                            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">MST: {partner.tax_id}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-slate-400" />
                                            <span>Đại diện: <b>{partner.representative_name}</b></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-slate-400" />
                                            <span>Email: {partner.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 md:col-span-2">
                                            <ShieldAlert size={16} className="text-slate-400" />
                                            <span>Trụ sở: {partner.headquarters}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                                    <button 
                                        disabled={actionLoading === partner.user_id}
                                        onClick={() => handleApprove(partner.user_id)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-sm"
                                    >
                                        <Check size={20} />
                                        {actionLoading === partner.user_id ? "Đang xử lý..." : "Phê duyệt"}
                                    </button>
                                    <button 
                                        disabled={actionLoading === partner.user_id}
                                        onClick={() => handleReject(partner.user_id)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-lg font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                                    >
                                        <X size={20} />
                                        Từ chối
                                    </button>
                                </div>
                            </motion.div>
>>>>>>> customer
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default PartnerApproval;
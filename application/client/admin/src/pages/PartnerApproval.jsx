import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Building2, User, Mail, ShieldCheck, Phone, MapPin, RefreshCw, Hash, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5
                    rounded-2xl shadow-xl text-sm font-semibold border
                    ${toast.type === 'success' ? 'bg-[#1a3a5c] border-[#1e4168] text-white' : 'bg-rose-500 border-rose-600 text-white'}`}
            >
                <span className={`w-2 h-2 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-[#6ec6a0]' : 'bg-white'}`} />
                {toast.message}
            </motion.div>
        )}
    </AnimatePresence>
);

// ─── INFO FIELD ───────────────────────────────────────────────────────────────
const InfoField = ({ icon, label, value }) => (
    <div className="bg-[#f5f7fa] p-3 rounded-xl border border-slate-50 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            {React.cloneElement(icon, { size: 12, className: 'text-slate-400 shrink-0' })}
            <span className="text-[10px] font-semibold uppercase tracking-wider leading-none">{label}</span>
        </div>
        <p className="text-sm font-bold text-slate-800 truncate" title={value}>
            {value || <span className="text-slate-300 font-normal italic">Chưa cập nhật</span>}
        </p>
    </div>
);

// ─── PARTNER CARD ─────────────────────────────────────────────────────────────
const PartnerCard = ({ partner, onApprove, onReject, isLoading }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden"
    >
        {/* Card Header */}
        <div className="p-5 flex items-start justify-between gap-3 bg-white">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-amber-500" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-base tracking-tight truncate">
                        {partner.company_name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        ID #{partner.user_id} &bull; @{partner.username}
                    </p>
                </div>
            </div>
            <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Chờ duyệt
            </span>
        </div>

        {/* Info Grid */}
        <div className="px-5 pb-5 grid grid-cols-2 gap-3 bg-white">
            <InfoField icon={<User />} label="Người đại diện" value={partner.representative_name} />
            <InfoField icon={<Phone />} label="Số điện thoại" value={partner.phone} />
            <InfoField icon={<Hash />} label="Mã số thuế" value={partner.tax_id} />
            <InfoField icon={<Mail />} label="Email liên hệ" value={partner.email} />
            <div className="col-span-2 flex items-start gap-2 text-xs text-slate-500 bg-[#f5f7fa] p-3 rounded-xl border border-slate-50">
                <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Trụ sở chính</span>
                    <span className="font-semibold text-slate-700 block truncate" title={partner.headquarters}>{partner.headquarters || 'Chưa cập nhật'}</span>
                </div>
            </div>
        </div>

        {/* Card Footer Actions */}
        <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-50 flex gap-3">
            <button
                disabled={isLoading}
                onClick={() => onApprove(partner.user_id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6ec6a0] hover:bg-[#5bb890] text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
                {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} strokeWidth={2.5} />}
                Phê duyệt
            </button>
            <button
                disabled={isLoading}
                onClick={() => onReject(partner.user_id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-semibold transition-all disabled:opacity-50"
            >
                <X size={14} strokeWidth={2.5} />
                Từ chối
            </button>
        </div>
    </motion.div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const PartnerApproval = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);

    const fetchPartners = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch('/api/admin/partners/pending');
            setPartners(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Không thể kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPartners(); }, [fetchPartners]);

    const showToast = (type, message) => {
        setToast({ type, message, id: Date.now() });
        setTimeout(() => setToast(null), 3500);
    };

    const handleApprove = async (userId) => {
        setActionLoading(userId);
        try {
            await apiFetch(`/api/admin/partners/approve/${userId}`, { method: 'POST' });
            showToast('success', 'Phê duyệt đối tác thành công! Hệ thống đã gửi email thông báo.');
            setPartners(prev => prev.filter(p => p.user_id !== userId));
        } catch (err) {
            showToast('error', err.message || 'Phê duyệt thất bại.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId) => {
        setActionLoading(userId);
        try {
            await apiFetch(`/api/admin/partners/reject/${userId}`, { method: 'POST' });
            showToast('success', 'Đã từ chối cấp quyền và phản hồi mail tới đối tác.');
            setPartners(prev => prev.filter(p => p.user_id !== userId));
        } catch (err) {
            showToast('error', err.message || 'Từ chối thất bại.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 md:p-8 space-y-6 bg-[#f5f7fa] min-h-screen relative"
        >
            <Toast toast={toast} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
                <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1">
                        Thẩm định và xác thực tài khoản doanh nghiệp phát hành
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                        Xét duyệt Đối tác
                    </h1>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                    {!loading && !error && partners.length > 0 && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-xs font-semibold text-amber-700">
                                {partners.length} hồ sơ chờ xử lý
                            </span>
                        </div>
                    )}

                    <button
                        onClick={fetchPartners}
                        disabled={loading}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm"
                        title="Làm mới"
                    >
                        <RefreshCw size={14} className={`text-slate-500 ${loading ? 'animate-spin text-[#6ec6a0]' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content States Container */}
            {loading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 animate-pulse shadow-sm h-64" />
                    ))}
                </div>
            ) : error ? (
                <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 shadow-sm max-w-xl mx-auto">
                    <AlertCircle size={32} className="mx-auto text-rose-400 mb-3" />
                    <h3 className="font-bold text-slate-800 text-base mb-1">Không thể tải dữ liệu</h3>
                    <p className="text-sm text-slate-400 mb-5">{error}</p>
                    <button onClick={fetchPartners} className="px-4 py-2 text-xs font-semibold text-white bg-[#1a3a5c] hover:bg-[#132a44] rounded-xl shadow-sm transition-all flex items-center gap-2 mx-auto">
                        <RefreshCw size={12} /> Thử lại
                    </button>
                </div>
            ) : partners.length === 0 ? (
                <div className="bg-white p-16 rounded-2xl text-center border border-slate-100 shadow-sm max-w-xl mx-auto">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base mb-1">Hồ sơ trống</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Tất cả yêu cầu phê duyệt thương hiệu đối tác đã được xử lý hoàn tất.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {partners.map(partner => (
                            <PartnerCard
                                key={partner.user_id}
                                partner={partner}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                isLoading={actionLoading === partner.user_id}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default PartnerApproval;
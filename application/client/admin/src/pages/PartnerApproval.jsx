import React, { useState, useEffect } from 'react';
import { Check, X, Building2, User, Mail, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PartnerApproval = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/partners/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setPartners(data);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách đối tác:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/partners/approve/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setPartners(partners.filter(p => p.user_id !== id));
                alert("Đã phê duyệt và gửi email thông báo cho đối tác!");
            }
        } catch (error) {
            alert("Lỗi khi phê duyệt");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn từ chối đối tác này?")) return;
        setActionLoading(id);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/partners/reject/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setPartners(partners.filter(p => p.user_id !== id));
            }
        } catch (error) {
            alert("Lỗi khi từ chối");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Phê duyệt Đối tác</h1>
                <p className="text-slate-500">Xem xét và kích hoạt tài khoản cho các doanh nghiệp mới đăng ký.</p>
            </div>

            {partners.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">Hiện không có yêu cầu nào đang chờ xử lý.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {partners.map((partner) => (
                            <motion.div 
                                key={partner.user_id}
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
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default PartnerApproval;

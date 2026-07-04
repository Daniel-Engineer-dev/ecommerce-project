import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { getAdminScope, SCOPE_LABELS } from '../scopes';

// Màn hình hiển thị khi admin truy cập phân hệ ngoài phạm vi quản trị của mình
const NoAccess = () => {
    const navigate = useNavigate();
    const scope = getAdminScope();

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[24px] border border-slate-100 shadow-sm p-10 text-center"
            >
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-5">
                    <ShieldOff size={28} strokeWidth={2.2} />
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Không đủ quyền truy cập</h1>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Tài khoản của bạn không có quyền vào phân hệ này. Vui lòng liên hệ
                    <span className="font-semibold text-slate-700"> Super Admin </span>
                    nếu bạn cần được cấp thêm quyền.
                </p>

                <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-3.5 py-1.5">
                    Phạm vi của bạn: <span className="text-[#1a3a5c]">{SCOPE_LABELS[scope] || scope}</span>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="mt-8 w-full flex items-center justify-center gap-2 bg-[#1a3a5c] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#132a44] transition-colors"
                >
                    <ArrowLeft size={16} className="text-[#6ec6a0]" />
                    Về Dashboard tổng quan
                </button>
            </motion.div>
        </div>
    );
};

export default NoAccess;

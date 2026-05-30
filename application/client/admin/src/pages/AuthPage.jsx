import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock, User, KeyRound, ArrowRight } from 'lucide-react';

const AuthPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok && data.user.role === 'Admin') {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                window.location.href = '/';
            } else {
                alert(data.message || "Truy cập bị từ chối. Chỉ dành cho Quản trị viên.");
            }
        } catch (error) {
            alert("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30 flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
            {/* Background Orbs tinh tế, mượt mà hơn */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/40 to-purple-200/40 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-pink-200/30 to-blue-200/40 rounded-full blur-[140px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/80 p-10 md:p-12 relative z-10 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.06)]"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-600/20 ring-4 ring-indigo-50">
                        <KeyRound size={30} strokeWidth={2.2} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Admin Console
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1.5">
                        Hệ thống quản trị <span className="text-indigo-600 font-semibold">Dealzy</span>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                            Tài khoản
                        </label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input 
                                required
                                type="text"
                                className="w-full bg-slate-50/50 border border-slate-200/80 p-4 pl-12 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-[4px] focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                                placeholder="Nhập mã Admin ID"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                            Mật mã bảo mật
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input 
                                required
                                type="password"
                                className="w-full bg-slate-50/50 border border-slate-200/80 p-4 pl-12 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-[4px] focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Button Đăng nhập */}
                    <button 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-xl font-bold text-sm hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-600/15 dynamic-button flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Đang xác thực...
                            </span>
                        ) : (
                            <>
                                Đăng nhập Hệ thống
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Security Note */}
                <div className="mt-8 flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <ShieldAlert size={12} className="text-emerald-500" />
                    Secure Cloud Environment
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
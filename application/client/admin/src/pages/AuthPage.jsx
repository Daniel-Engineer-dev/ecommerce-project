import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Lock, ShieldAlert, User, ArrowRight } from 'lucide-react';

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
        alert(data.message || 'Truy cập bị từ chối. Chỉ dành cho quản trị viên.');
      }
    } catch {
      alert('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ornaments đồng bộ Brand Color */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#1a3a5c]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#6ec6a0]/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-[24px] border border-slate-100 p-10 shadow-sm relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#1a3a5c] text-[#6ec6a0] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-[#1e4168]">
            <KeyRound size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Console</h1>
          <p className="text-slate-400 font-medium text-sm mt-1.5">Hệ thống quản trị Dealzy</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tài khoản</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a3a5c] transition-colors" size={18} />
              <input
                required
                type="text"
                className="w-full bg-[#f5f7fa] border border-slate-100 p-3.5 pl-11 rounded-xl text-slate-800 focus:bg-white focus:border-[#1a3a5c] outline-none transition-all text-sm font-semibold placeholder:text-slate-400 placeholder:font-medium"
                placeholder="Nhập ID Quản trị"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mật mã bảo mật</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a3a5c] transition-colors" size={18} />
              <input
                required
                type="password"
                className="w-full bg-[#f5f7fa] border border-slate-100 p-3.5 pl-11 rounded-xl text-slate-800 focus:bg-white focus:border-[#1a3a5c] outline-none transition-all text-sm font-bold placeholder:text-slate-400 placeholder:font-medium"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#1a3a5c] text-white p-3.5 rounded-xl font-bold text-sm hover:bg-[#132a44] transition-all shadow-sm flex items-center justify-center gap-2 mt-4 group disabled:opacity-70"
          >
            {loading ? 'Đang xác thực...' : (
              <>
                Đăng nhập hệ thống
                <ArrowRight size={16} className="text-[#6ec6a0] group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
          <ShieldAlert size={14} className="text-[#6ec6a0]" />
          Secure Corporate Environment
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
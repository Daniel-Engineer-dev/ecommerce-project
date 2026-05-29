import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Lock, ShieldAlert, User } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
            <KeyRound size={40} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Console</h1>
          <p className="text-slate-400 mt-2">Hệ thống quản trị Dealzy</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 ml-1">Tài khoản</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                required
                type="text"
                className="w-full bg-slate-800/50 border border-slate-700 p-4 pl-12 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="Admin ID"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 ml-1">Mật mã bảo mật</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                required
                type="password"
                className="w-full bg-slate-800/50 border border-slate-700 p-4 pl-12 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <ShieldAlert size={14} />
          Secure Environment
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;

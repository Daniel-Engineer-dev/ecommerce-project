import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, User } from 'lucide-react';

const localPortalUrl = (port, path = '/') => {
  if (typeof window === 'undefined') return path;
  return `${window.location.protocol}//${window.location.hostname}:${port}${path}`;
};

const AuthPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const customerUrl = useMemo(() => localPortalUrl(5173, '/'), []);
  const accessUrl = useMemo(() => localPortalUrl(5173, '/access'), []);
  const registerUrl = useMemo(() => localPortalUrl(5173, '/register-partner'), []);

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
      if (response.ok && data.user.role === 'Partner') {
        localStorage.setItem('partnerToken', data.token);
        localStorage.setItem('partnerUser', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        alert(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại quyền truy cập.');
      }
    } catch {
      alert('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6 flex gap-3">
        <a href={customerUrl} className="text-slate-500 hover:text-slate-900 font-bold text-sm inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Về website khách hàng
        </a>
        <a href={accessUrl} className="text-purple-600 hover:text-purple-700 font-bold text-sm">
          Cổng truy cập
        </a>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-purple-100 p-10 border border-slate-100"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-200 rotate-12">
            <ShieldCheck size={40} className="text-white -rotate-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Partner Portal</h1>
          <p className="text-slate-500 mt-2">Chào mừng đối tác trở lại hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Tên đăng nhập</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                required
                type="text"
                className="w-full bg-slate-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                required
                type="password"
                className="w-full bg-slate-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-purple-600 text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 group"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Bạn chưa có tài khoản đối tác? <br />
          <a href={registerUrl} className="text-purple-600 font-bold hover:underline">Đăng ký tại đây</a>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;

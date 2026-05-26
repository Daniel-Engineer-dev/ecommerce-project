import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft, ChevronRight, Users, Building, Phone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import authVideo from '../assets/my-auth-video.mp4';
import logo from '../assets/logo.png';
import { API_BASE_URL } from '../config';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [regMethod, setRegMethod] = useState('email'); // 'email' hoặc 'phone'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = { username: formData.username, password: formData.password };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (isForgotLoading) return;
    setError('');

    if (regMethod === 'email' && !formData.email) {
      setError('Vui lòng nhập email của bạn');
      return;
    }
    if (regMethod === 'phone' && !formData.phone) {
      setError('Vui lòng nhập số điện thoại của bạn');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regMethod === 'email' ? formData.email : null,
          phone: regMethod === 'phone' ? formData.phone : null
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setIsForgotPassword(false);
        setIsLogin(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'white', overflow: 'hidden', position: 'relative' }}>
      {/* Left Section */}
      <motion.div initial={{ width: '55%' }} animate={{ width: '55%' }} style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5rem', color: 'white', overflow: 'hidden', height: '100%' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src={authVideo} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.4) 100%)', zIndex: 1 }} />
        <Link to="/" style={{ position: 'absolute', top: '40px', left: '40px', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 600, zIndex: 10, opacity: 0.8 }}>
          <ArrowLeft size={20} /> Quay về trang chủ
        </Link>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '650px', marginTop: '60px' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ background: 'white', padding: '8px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                <img src={logo} alt="Logo" style={{ height: '36px' }} />
              </div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Dealzy</h1>
            </div>
            <h2 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Bắt đầu hành trình <br /><span style={{ color: '#60a5fa' }}>tiết kiệm thông minh.</span></h2>
            <p style={{ fontSize: '1.25rem', opacity: 0.8, marginBottom: '2.5rem', lineHeight: 1.6 }}>Gia nhập cộng đồng săn voucher lớn nhất Việt Nam. <br /> Nhận ngay đặc quyền từ hơn 1000+ đối tác uy tín.</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section */}
      <motion.div layout style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 5rem', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Chào mừng trở lại</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Đăng nhập để săn ưu đãi cùng Dealzy</p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group"><User size={18} className="input-icon" /><input type="text" placeholder="Tên đăng nhập" className="auth-input" required onChange={(e) => setFormData({ ...formData, username: e.target.value })} /></div>
                  <div className="input-group"><Lock size={18} className="input-icon" /><input type="password" placeholder="Mật khẩu" className="auth-input" required onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
                  <div style={{ textAlign: 'right' }}>
                    <button type="button" onClick={() => { setIsForgotPassword(true); setIsLogin(false); }} style={{ color: '#2563eb', border: 'none', background: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Quên mật khẩu?</button>
                  </div>
                  {error && <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>{error}</p>}
                  <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', height: '52px' }}>Đăng nhập ngay <ChevronRight size={18} /></button>
                </form>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có tài khoản? <button onClick={() => setIsLogin(false)} style={{ color: '#2563eb', border: 'none', background: 'none', fontWeight: 700, cursor: 'pointer' }}>Đăng ký ngay</button></p>
              </motion.div>
            ) : isForgotPassword ? (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Quên mật khẩu?</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Chọn phương thức để nhận liên kết khôi phục</p>

                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '12px', display: 'flex', marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      disabled={isForgotLoading}
                      onClick={() => { setRegMethod('email'); setFormData({ ...formData, phone: '' }); }}
                      style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', background: regMethod === 'email' ? 'white' : 'transparent', color: regMethod === 'email' ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: '0.75rem', cursor: isForgotLoading ? 'wait' : 'pointer', transition: '0.3s', boxShadow: regMethod === 'email' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', opacity: isForgotLoading ? 0.65 : 1 }}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      disabled={isForgotLoading}
                      onClick={() => { setRegMethod('phone'); setFormData({ ...formData, email: '' }); }}
                      style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', background: regMethod === 'phone' ? 'white' : 'transparent', color: regMethod === 'phone' ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: '0.75rem', cursor: isForgotLoading ? 'wait' : 'pointer', transition: '0.3s', boxShadow: regMethod === 'phone' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', opacity: isForgotLoading ? 0.65 : 1 }}
                    >
                      Số điện thoại
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {regMethod === 'email' ? (
                      <motion.div key="forgot-email" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                        <div className="input-group"><Mail size={18} className="input-icon" /><input type="email" placeholder="Email của bạn" className="auth-input" value={formData.email} disabled={isForgotLoading} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                      </motion.div>
                    ) : (
                      <motion.div key="forgot-phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                        <div className="input-group"><Phone size={18} className="input-icon" /><input type="text" placeholder="Số điện thoại của bạn" className="auth-input" value={formData.phone} disabled={isForgotLoading} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>{error}</p>}
                  <button type="submit" className="btn-primary" disabled={isForgotLoading} style={{ height: '52px', marginTop: '0.5rem', opacity: isForgotLoading ? 0.75 : 1, cursor: isForgotLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                    {isForgotLoading && (
                      <motion.span
                        style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.55)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      />
                    )}
                    {isForgotLoading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu khôi phục'}
                  </button>
                  <button type="button" disabled={isForgotLoading} onClick={() => { setIsForgotPassword(false); setIsLogin(true); }} style={{ color: 'var(--text-muted)', border: 'none', background: 'none', fontWeight: 600, cursor: isForgotLoading ? 'wait' : 'pointer', opacity: isForgotLoading ? 0.65 : 1 }}>Quay lại đăng nhập</button>
                </form>
              </motion.div>

            ) : (
              <motion.div key="selection" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
                <h3 style={{ fontSize: '2.25rem', marginBottom: '0.75rem', fontWeight: 800 }}>Bắt đầu trải nghiệm</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Chọn loại tài khoản để Dealzy đồng hành cùng bạn</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div
                    onClick={() => navigate('/register-customer')}
                    style={{ aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '28px', border: '2px solid transparent', cursor: 'pointer', transition: '0.3s', boxShadow: '0 15px 30px -10px rgba(0,0,0,0.05)', padding: '1.5rem' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-8px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: '70px', height: '70px', background: 'rgba(37, 99, 235, 0.08)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}><Users size={36} color="#2563eb" /></div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Khách hàng</h4>
                  </div>
                  <div
                    onClick={() => navigate('/register-partner')}
                    style={{ aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '28px', border: '2px solid transparent', cursor: 'pointer', transition: '0.3s', boxShadow: '0 15px 30px -10px rgba(0,0,0,0.05)', padding: '1.5rem' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-8px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: '70px', height: '70px', background: 'rgba(124, 58, 237, 0.08)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}><Building size={36} color="#7c3aed" /></div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Đối tác</h4>
                  </div>

                </div>
                <p style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Đã có tài khoản? <button onClick={() => setIsLogin(true)} style={{ color: '#2563eb', border: 'none', background: 'none', fontWeight: 700, cursor: 'pointer', marginLeft: '6px' }}>Đăng nhập</button></p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, LogIn } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('Customer'); // 'Customer' or 'Partner'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    company_name: '',
    email: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = { ...formData, role: isLogin ? undefined : role };
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onAuthSuccess(data.user);
        } else {
          setIsLogin(true);
          alert('Đăng ký thành công! Hãy đăng nhập.');
        }
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: 'white', padding: '2.5rem', borderRadius: '32px',
          width: '100%', maxWidth: '480px', position: 'relative'
        }}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)'
        }}><X /></button>

        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
        </h2>
        
        {!isLogin && (
          <div style={{ 
            display: 'flex', 
            background: '#f1f5f9', 
            padding: '4px', 
            borderRadius: '14px', 
            marginBottom: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <button 
              onClick={() => setRole('Customer')}
              style={{
                flex: 1, padding: '8px', borderRadius: '10px', border: 'none',
                background: role === 'Customer' ? 'white' : 'transparent',
                fontWeight: 600, cursor: 'pointer', boxShadow: role === 'Customer' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
              }}
            >Khách hàng</button>
            <button 
              onClick={() => setRole('Partner')}
              style={{
                flex: 1, padding: '8px', borderRadius: '10px', border: 'none',
                background: role === 'Partner' ? 'white' : 'transparent',
                fontWeight: 600, cursor: 'pointer', boxShadow: role === 'Partner' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
              }}
            >Đối tác</button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            role === 'Customer' ? (
              <div className="input-group">
                <User size={20} className="input-icon" />
                <input type="text" placeholder="Họ và tên" className="auth-input" required
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
              </div>
            ) : (
              <div className="input-group">
                <User size={20} className="input-icon" />
                <input type="text" placeholder="Tên công ty / Thương hiệu" className="auth-input" required
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
              </div>
            )
          )}
          
          <div className="input-group">
            <Mail size={20} className="input-icon" />
            <input type="text" placeholder="Tên đăng nhập" className="auth-input" required
              onChange={(e) => setFormData({...formData, username: e.target.value})} />
          </div>

          {!isLogin && (
            <div className="input-group">
              <Mail size={20} className="input-icon" />
              <input type="email" placeholder="Email" className="auth-input" required
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          )}

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input type="password" placeholder="Mật khẩu" className="auth-input" required
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%', height: '52px' }}>
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
          <button onClick={() => setIsLogin(!isLogin)}
            style={{ color: 'var(--primary)', border: 'none', background: 'none', fontWeight: 600, cursor: 'pointer', marginLeft: '5px' }}>
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthModal;

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Building, ChevronRight, Lock, Mail, Phone, User, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { API_BASE_URL } from '../config';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [regMethod, setRegMethod] = useState('email');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const showLogin = () => {
    setError('');
    setIsForgotPassword(false);
    setIsLogin(true);
  };

  const showRegister = () => {
    setError('');
    setIsForgotPassword(false);
    setIsLogin(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch {
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
        showLogin();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Không thể kết nối đến server');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Link to="/" className="auth-back-link">
        <ArrowLeft size={18} /> Quay về trang chủ
      </Link>

      <section className={`auth-card ${isForgotPassword ? 'is-forgot' : isLogin ? 'is-login' : 'is-register'}`}>
        {!isForgotPassword && (
          <motion.div
            className="auth-panel"
            animate={{
              x: isLogin ? 0 : '100%',
              borderRadius: isLogin ? '24px 130px 130px 24px' : '130px 24px 24px 130px'
            }}
            transition={{ duration: 0.6, ease: [0.45, 0, 0.2, 1] }}
          >
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="register-cta"
                  className="auth-panel__content"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                >
                  <div className="auth-panel__logo">
                    <img src={logo} alt="Dealzy" />
                  </div>
                  <h2>Xin chào</h2>
                  <p>Chưa có tài khoản?</p>
                  <button type="button" onClick={showRegister}>
                    Đăng ký
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="login-cta"
                  className="auth-panel__content"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                >
                  <div className="auth-panel__logo">
                    <img src={logo} alt="Dealzy" />
                  </div>
                  <h2>Chào mừng trở lại</h2>
                  <p>Đã có tài khoản?</p>
                  <button type="button" onClick={showLogin}>
                    Đăng nhập
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="auth-form-slot auth-form-slot--login">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                className="auth-form-box"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
              >
                <h3>Đăng nhập</h3>
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="input-group">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Tên đăng nhập"
                      className="auth-input"
                      required
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      placeholder="Mật khẩu"
                      className="auth-input"
                      required
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setIsForgotPassword(true);
                      setIsLogin(false);
                    }}
                    className="auth-text-button auth-text-button--right"
                  >
                    Quên mật khẩu?
                  </button>
                  {error && <p className="auth-error">{error}</p>}
                  <button type="submit" className="btn-primary auth-submit">
                    Đăng nhập <ChevronRight size={18} />
                  </button>
                </form>
                <p className="auth-switch-text">
                  Chưa có tài khoản? <button onClick={showRegister}>Đăng ký ngay</button>
                </p>
              </motion.div>
            ) : isForgotPassword ? (
              <motion.div
                key="forgot"
                className="auth-form-box"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
              >
                <h3>Quên mật khẩu?</h3>
                <p className="auth-form-note">Chọn phương thức để nhận liên kết khôi phục</p>

                <form onSubmit={handleForgotPassword} className="auth-form">
                  <div className="auth-method-tabs">
                    <button
                      type="button"
                      disabled={isForgotLoading}
                      onClick={() => {
                        setRegMethod('email');
                        setFormData({ ...formData, phone: '' });
                      }}
                      className={regMethod === 'email' ? 'active' : ''}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      disabled={isForgotLoading}
                      onClick={() => {
                        setRegMethod('phone');
                        setFormData({ ...formData, email: '' });
                      }}
                      className={regMethod === 'phone' ? 'active' : ''}
                    >
                      Số điện thoại
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {regMethod === 'email' ? (
                      <motion.div key="forgot-email" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                        <div className="input-group">
                          <Mail size={18} className="input-icon" />
                          <input
                            type="email"
                            placeholder="Email của bạn"
                            className="auth-input"
                            value={formData.email}
                            disabled={isForgotLoading}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="forgot-phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                        <div className="input-group">
                          <Phone size={18} className="input-icon" />
                          <input
                            type="text"
                            placeholder="Số điện thoại của bạn"
                            className="auth-input"
                            value={formData.phone}
                            disabled={isForgotLoading}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && <p className="auth-error">{error}</p>}
                  <button
                    type="submit"
                    className="btn-primary auth-submit"
                    disabled={isForgotLoading}
                    style={{ opacity: isForgotLoading ? 0.75 : 1, cursor: isForgotLoading ? 'wait' : 'pointer' }}
                  >
                    {isForgotLoading && (
                      <motion.span
                        className="auth-spinner"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      />
                    )}
                    {isForgotLoading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu khôi phục'}
                  </button>
                  <button
                    type="button"
                    disabled={isForgotLoading}
                    onClick={showLogin}
                    className="auth-text-button"
                    style={{ cursor: isForgotLoading ? 'wait' : 'pointer', opacity: isForgotLoading ? 0.65 : 1 }}
                  >
                    Quay lại đăng nhập
                  </button>
                </form>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {!isForgotPassword && (
          <div className="auth-form-slot auth-form-slot--register">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="selection"
                  className="auth-form-box"
                  initial={{ opacity: 0, x: -22 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 22 }}
                >
                  <h3>Đăng ký</h3>
                  <p className="auth-form-note">Chọn loại tài khoản để Dealzy đồng hành cùng bạn</p>
                  <div className="auth-choice-grid">
                    <button type="button" onClick={() => navigate('/register-customer')} className="auth-choice-card">
                      <span>
                        <Users size={30} />
                      </span>
                      <strong>Khách hàng</strong>
                    </button>
                    <button type="button" onClick={() => navigate('/register-partner')} className="auth-choice-card auth-choice-card--partner">
                      <span>
                        <Building size={30} />
                      </span>
                      <strong>Đối tác</strong>
                    </button>
                  </div>
                  <p className="auth-switch-text">
                    Đã có tài khoản? <button onClick={showLogin}>Đăng nhập</button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

export default AuthPage;

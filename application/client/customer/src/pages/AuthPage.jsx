import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Building, ChevronRight, Lock, Mail, Phone, User, Users, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import { API_BASE_URL } from '../config';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
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
  const [successMsg, setSuccessMsg] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // States for unified forgot password flow
  const [forgotStep, setForgotStep] = useState('request'); // 'request', 'otp', 'reset'
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    otp: "",
  });

  const showLogin = () => {
    setError('');
    setSuccessMsg('');
    setIsForgotPassword(false);
    setIsLogin(true);
    setForgotStep('request');
    setForgotIdentifier('');
    setOtpCode('');
    setTempToken('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const showRegister = () => {
    setError('');
    setSuccessMsg('');
    setIsForgotPassword(false);
    setIsLogin(false);
    setForgotStep('request');
    setForgotIdentifier('');
    setOtpCode('');
    setTempToken('');
    setNewPassword('');
    setConfirmNewPassword('');
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
        localStorage.setItem('token', data.accessToken || data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate(redirectUrl);
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

    if (forgotStep === 'request') {
      if (regMethod === 'email' && !formData.email) {
        setError('Vui lòng nhập email của bạn');
        return;
      }
      if (regMethod === 'phone' && !formData.phone) {
        setError('Vui lòng nhập số điện thoại của bạn');
        return;
      }

      setIsForgotLoading(true);
      const identifier = regMethod === 'email' ? formData.email : formData.phone;
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
          setForgotIdentifier(identifier);
          if (data.otp) {
            setReceivedOtp(data.otp);
          }
          setForgotStep('otp');
          setModalConfig({
            title: "Gửi mã OTP thành công",
            message: typeof data.message === "object" ? data.message.message : (data.message || "Mã OTP khôi phục mật khẩu đã được gửi!"),
            otp: data.otp || "",
          });
          setModalOpen(true);
        } else {
          setError(data.message);
        }
      } catch {
        setError('Không thể kết nối đến server');
      } finally {
        setIsForgotLoading(false);
      }
    } else if (forgotStep === 'otp') {
      if (!otpCode || otpCode.length !== 6) {
        setError('Vui lòng nhập mã OTP gồm 6 chữ số');
        return;
      }

      setIsForgotLoading(true);
      try {
        const isEmail = forgotIdentifier.includes('@');
        const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: isEmail ? forgotIdentifier : null,
            phone: !isEmail ? forgotIdentifier : null,
            otp: otpCode
          })
        });

        const data = await res.json();

        if (res.ok) {
          setTempToken(data.tempToken);
          setForgotStep('reset');
        } else {
          setError(data.message || 'Mã OTP không chính xác hoặc đã hết hạn');
        }
      } catch {
        setError('Không thể kết nối đến server');
      } finally {
        setIsForgotLoading(false);
      }
    } else if (forgotStep === 'reset') {
      if (newPassword.length < 6) {
        setError('Mật khẩu mới phải ít nhất 6 ký tự');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('Mật khẩu xác nhận không trùng khớp');
        return;
      }

      setIsForgotLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/${tempToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword })
        });

        const data = await res.json();

        if (res.ok) {
          setSuccessMsg('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
          showLogin();
        } else {
          setError(data.message || 'Yêu cầu hết hạn hoặc không hợp lệ. Vui lòng thử lại.');
        }
      } catch {
        setError('Không thể kết nối đến server');
      } finally {
        setIsForgotLoading(false);
      }
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
                {successMsg && (
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: '12px',
                      background: '#dcfce7',
                      border: '1px solid #bbf7d0',
                      color: '#15803d',
                      fontSize: '0.85rem',
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}
                  >
                    {successMsg}
                  </div>
                )}
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
                {forgotStep === 'request' && (
                  <>
                    <h3>Quên mật khẩu?</h3>
                    <p className="auth-form-note">Chọn phương thức để nhận mã xác thực OTP</p>
                  </>
                )}
                {forgotStep === 'otp' && (
                  <>
                    <h3>Xác thực OTP</h3>
                    <p className="auth-form-note">Mã OTP đã được gửi đến {forgotIdentifier}</p>
                  </>
                )}
                {forgotStep === 'reset' && (
                  <>
                    <h3>Đặt mật khẩu mới</h3>
                    <p className="auth-form-note">Vui lòng thiết lập mật khẩu mới</p>
                  </>
                )}

                <form onSubmit={handleForgotPassword} className="auth-form">
                  {forgotStep === 'request' && (
                    <>
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
                    </>
                  )}

                  {forgotStep === 'otp' && (
                    <motion.div key="forgot-otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                      {receivedOtp && (
                        <div
                          style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1e3a8a',
                            fontSize: '0.85rem',
                            lineHeight: '1.5',
                            textAlign: 'left'
                          }}
                        >
                          Vì quy định của các nhà mạng Việt Nam yêu cầu đăng ký Brandname nghiêm ngặt để gửi tin nhắn SMS, chúng tôi hiển thị mã OTP mô phỏng để bạn kiểm thử luồng này. Mã OTP của bạn là:{" "}
                          <strong style={{ fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '2px' }}>{receivedOtp}</strong>
                        </div>
                      )}
                      <div className="input-group" style={{ margin: 0 }}>
                        <Lock size={18} className="input-icon" />
                        <input
                          type="text"
                          placeholder="Mã OTP gồm 6 chữ số"
                          className="auth-input"
                          maxLength={6}
                          value={otpCode}
                          disabled={isForgotLoading}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {forgotStep === 'reset' && (
                    <motion.div key="forgot-reset" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: '15px', width: '100%' }}>
                      <div className="input-group" style={{ margin: 0 }}>
                        <Lock size={18} className="input-icon" />
                        <input
                          type="password"
                          placeholder="Mật khẩu mới"
                          className="auth-input"
                          value={newPassword}
                          disabled={isForgotLoading}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="input-group" style={{ margin: 0 }}>
                        <Lock size={18} className="input-icon" />
                        <input
                          type="password"
                          placeholder="Xác nhận mật khẩu"
                          className="auth-input"
                          value={confirmNewPassword}
                          disabled={isForgotLoading}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          required
                        />
                      </div>
                    </motion.div>
                  )}

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
                    {isForgotLoading
                      ? 'Đang xử lý...'
                      : forgotStep === 'request'
                      ? 'Gửi mã xác thực OTP'
                      : forgotStep === 'otp'
                      ? 'Xác thực mã OTP'
                      : 'Đặt lại mật khẩu'}
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
      <NotificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        otp={modalConfig.otp}
      />
    </div>
  );
};

const NotificationModal = ({ isOpen, onClose, title, message, otp }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          style={{
            background: "white",
            width: "100%",
            maxWidth: "420px",
            borderRadius: "24px",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #f1f5f9",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "#dcfce7",
              color: "#16a34a",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem",
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <h3
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "#1e293b",
              marginBottom: "0.75rem",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.9rem",
              lineHeight: "1.6",
              marginBottom: "1.5rem",
            }}
          >
            {message}
          </p>

          {otp && (
            <div
              style={{
                width: "100%",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "16px",
                padding: "1.25rem 1rem",
                marginBottom: "1.75rem",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#1e3a8a",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.5rem",
                }}
              >
                Mã xác thực OTP của bạn:
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    color: "#1d4ed8",
                    letterSpacing: "0.1em",
                  }}
                >
                  {otp}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(otp);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#3b82f6",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textDecoration: "underline",
                    marginLeft: "0.5rem",
                  }}
                >
                  Sao chép
                </button>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  marginTop: "0.75rem",
                  lineHeight: "1.4",
                }}
              >
                (Hiển thị để phục vụ mục đích kiểm thử do hạn chế Brandname)
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "999px",
              fontWeight: 700,
            }}
          >
            Xác nhận
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthPage;

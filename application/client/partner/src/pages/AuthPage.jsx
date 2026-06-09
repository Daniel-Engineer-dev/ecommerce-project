import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

const formVariants = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.985 },
};

const inputClass =
  'w-full bg-white border border-slate-200 p-4 pl-12 rounded-2xl text-slate-900 font-semibold placeholder:text-slate-400 hover:border-sky-300 hover:bg-sky-50/30 focus:bg-white focus:border-sky-700 focus:ring-4 focus:ring-sky-700/10 outline-none transition-all duration-200';

const iconClass =
  'absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-hover:text-sky-700 group-focus-within:text-sky-700';

const primaryButtonClass =
  'w-full bg-slate-900 text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5 hover:bg-sky-900 hover:shadow-xl active:translate-y-0 active:scale-[0.985] transition-all duration-200 disabled:opacity-70 disabled:translate-y-0 disabled:shadow-none group';

const textButtonClass =
  'rounded-full px-2 py-1 text-sm font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-800 active:scale-95 transition-all duration-200 disabled:opacity-60';

const AuthPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotMethod, setForgotMethod] = useState('email');
  const [forgotStep, setForgotStep] = useState('request');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (response.ok && data.user.role === 'Partner') {
        localStorage.setItem('partnerToken', data.accessToken || data.token);
        if (data.refreshToken) localStorage.setItem('partnerRefreshToken', data.refreshToken);
        localStorage.setItem('partnerUser', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        localStorage.removeItem('partnerToken');
        localStorage.removeItem('partnerRefreshToken');
        localStorage.removeItem('partnerUser');
        setError(
          response.ok
            ? 'Tài khoản này không thể đăng nhập ở trang đối tác.'
            : data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.'
        );
      }
    } catch {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const showLogin = () => {
    setError('');
    setIsForgotPassword(false);
    setForgotStep('request');
    setForgotIdentifier('');
    setOtpCode('');
    setReceivedOtp('');
    setTempToken('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccessMsg('');

    if (forgotStep === 'request') {
      const identifier = forgotMethod === 'email' ? formData.email.trim() : formData.phone.trim();
      if (!identifier) {
        setError(forgotMethod === 'email' ? 'Vui lòng nhập email của bạn' : 'Vui lòng nhập số điện thoại của bạn');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: forgotMethod === 'email' ? identifier : null,
            phone: forgotMethod === 'phone' ? identifier : null,
            role: 'Partner',
          }),
        });
        const data = await response.json();

        if (response.ok) {
          setForgotIdentifier(identifier);
          setReceivedOtp(data.otp || '');
          setForgotStep('otp');
          setSuccessMsg(typeof data.message === 'object' ? data.message.message : data.message || 'Mã OTP khôi phục mật khẩu đã được gửi.');
        } else {
          setError(data.message || 'Không thể gửi mã OTP.');
        }
      } catch {
        setError('Không thể kết nối đến server');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (forgotStep === 'otp') {
      if (!otpCode || otpCode.length !== 6) {
        setError('Vui lòng nhập mã OTP gồm 6 chữ số');
        return;
      }

      setLoading(true);
      try {
        const isEmail = forgotIdentifier.includes('@');
        const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: isEmail ? forgotIdentifier : null,
            phone: !isEmail ? forgotIdentifier : null,
            otp: otpCode,
            role: 'Partner',
          }),
        });
        const data = await response.json();

        if (response.ok) {
          setTempToken(data.tempToken);
          setForgotStep('reset');
          setSuccessMsg('');
        } else {
          setError(data.message || 'Mã OTP không chính xác hoặc đã hết hạn');
        }
      } catch {
        setError('Không thể kết nối đến server');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password/${tempToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        showLogin();
        setSuccessMsg('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
      } else {
        localStorage.removeItem('partnerToken');
        localStorage.removeItem('partnerRefreshToken');
        localStorage.removeItem('partnerUser');
        setError(data.message || 'Yêu cầu hết hạn hoặc không hợp lệ. Vui lòng thử lại.');
      }
    } catch {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const forgotTitle = {
    request: 'Quên mật khẩu?',
    otp: 'Xác thực OTP',
    reset: 'Đặt mật khẩu mới',
  }[forgotStep];

  const forgotSubtitle = {
    request: 'Chọn phương thức để nhận mã xác thực OTP',
    otp: `Mã OTP đã được gửi đến ${forgotIdentifier}`,
    reset: 'Thiết lập mật khẩu mới cho tài khoản đối tác',
  }[forgotStep];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_16%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_82%_10%,rgba(15,23,42,0.08),transparent_28%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full bg-white rounded-[28px] shadow-xl shadow-slate-200/70 p-10 border border-slate-200 relative z-10"
      >
        <div className="text-center mb-9">
          <motion.div
            whileHover={{ rotate: 6, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-6 transition-colors"
          >
            <ShieldCheck size={40} className="text-white -rotate-6" />
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Partner Portal</h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={isForgotPassword ? `${forgotStep}-${forgotIdentifier}` : 'login-subtitle'}
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="text-slate-500 mt-2"
            >
              {isForgotPassword ? forgotSubtitle : 'Chào mừng đối tác trở lại hệ thống'}
            </motion.p>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {successMsg && (
            <motion.div
              key="success"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-3 text-center text-sm font-semibold text-green-700"
            >
              <CheckCircle2 className="mr-2 inline-block" size={17} />
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-center text-sm font-semibold text-red-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isForgotPassword ? (
            <motion.div key="login" variants={formVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.24 }}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Tên đăng nhập</label>
                  <div className="relative group">
                    <User className={iconClass} size={20} />
                    <input
                      required
                      type="text"
                      className={inputClass}
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-slate-700">Mật khẩu</label>
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMsg('');
                        setIsForgotPassword(true);
                      }}
                      className={textButtonClass}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className={iconClass} size={20} />
                    <input
                      required
                      type="password"
                      className={inputClass}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <button disabled={loading} className={primaryButtonClass}>
                  {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </form>

              <p className="mt-8 text-center text-slate-400 text-sm">
                Chưa có tài khoản đối tác? <br />
                <Link to="/register-partner" className="inline-block rounded-full px-2 py-1 text-slate-900 font-bold hover:bg-sky-50 hover:text-sky-800 active:scale-95 transition-all duration-200">
                  Đăng ký hồ sơ đối tác
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.form key={`forgot-${forgotStep}`} onSubmit={handleForgotPassword} variants={formVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.24 }} className="space-y-5">
              <h2 className="text-center text-xl font-black text-slate-900">{forgotTitle}</h2>

              {forgotStep === 'request' && (
                <>
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                    {[
                      ['email', 'Email'],
                      ['phone', 'Số điện thoại'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setForgotMethod(value);
                          setFormData({ ...formData, [value === 'email' ? 'phone' : 'email']: '' });
                        }}
                        className={`rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 hover:bg-white/80 active:scale-95 disabled:opacity-60 ${
                          forgotMethod === value ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="relative group">
                    {forgotMethod === 'email' ? <Mail className={iconClass} size={20} /> : <Phone className={iconClass} size={20} />}
                    <input
                      type={forgotMethod === 'email' ? 'email' : 'text'}
                      className={inputClass}
                      placeholder={forgotMethod === 'email' ? 'Email của bạn' : 'Số điện thoại của bạn'}
                      value={forgotMethod === 'email' ? formData.email : formData.phone}
                      disabled={loading}
                      onChange={(e) => setFormData({ ...formData, [forgotMethod]: e.target.value })}
                    />
                  </div>
                </>
              )}

              {forgotStep === 'otp' && (
                <>
                  {receivedOtp && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                      Mã OTP mô phỏng để kiểm thử luồng khôi phục là{' '}
                      <strong className="font-mono text-base tracking-widest">{receivedOtp}</strong>
                    </div>
                  )}
                  <div className="relative group">
                    <Lock className={iconClass} size={20} />
                    <input
                      required
                      type="text"
                      maxLength={6}
                      className={inputClass}
                      placeholder="Mã OTP gồm 6 chữ số"
                      value={otpCode}
                      disabled={loading}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </>
              )}

              {forgotStep === 'reset' && (
                <>
                  <div className="relative group">
                    <Lock className={iconClass} size={20} />
                    <input
                      required
                      type="password"
                      className={inputClass}
                      placeholder="Mật khẩu mới"
                      value={newPassword}
                      disabled={loading}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className={iconClass} size={20} />
                    <input
                      required
                      type="password"
                      className={inputClass}
                      placeholder="Xác nhận mật khẩu"
                      value={confirmNewPassword}
                      disabled={loading}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button disabled={loading} className={primaryButtonClass}>
                {loading
                  ? 'Đang xử lý...'
                  : forgotStep === 'request'
                    ? 'Gửi mã xác thực OTP'
                    : forgotStep === 'otp'
                      ? 'Xác thực mã OTP'
                      : 'Đặt lại mật khẩu'}
              </button>

              <button type="button" disabled={loading} onClick={showLogin} className={`mx-auto flex items-center justify-center gap-2 ${textButtonClass}`}>
                <ArrowLeft size={16} /> Quay lại đăng nhập
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;

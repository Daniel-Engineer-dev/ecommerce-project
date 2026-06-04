import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';

const API_URL = 'http://localhost:5000';

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
        localStorage.setItem('partnerToken', data.token);
        localStorage.setItem('partnerUser', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        setError(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại quyền truy cập.');
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
          }),
        });
        const data = await response.json();

        if (response.ok) {
          setForgotIdentifier(identifier);
          setReceivedOtp(data.otp || '');
          setForgotStep('otp');
          setSuccessMsg(typeof data.message === 'object' ? data.message.message : (data.message || 'Mã OTP khôi phục mật khẩu đã được gửi.'));
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
        setSuccessMsg('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      } else {
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
    reset: 'Vui lòng thiết lập mật khẩu mới cho tài khoản đối tác',
  }[forgotStep];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-xl shadow-md p-10 border border-slate-100"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-12">
            <ShieldCheck size={40} className="text-white -rotate-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Partner Portal</h1>
          <p className="text-slate-500 mt-2">
            {isForgotPassword ? forgotSubtitle : 'Chào mừng đối tác trở lại hệ thống'}
          </p>
        </div>

        {successMsg && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm font-semibold text-green-700">
            <CheckCircle2 className="mr-2 inline-block" size={17} />
            {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {!isForgotPassword ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Tên đăng nhập</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200/60 p-4 pl-12 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
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
                    className="w-full bg-slate-50 border border-slate-200/60 p-4 pl-12 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-primary text-white p-5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-sm group"
              >
                {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-8 text-center text-slate-400 text-sm">
              Bạn quên mật khẩu? <br />
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMsg('');
                  setIsForgotPassword(true);
                }}
                className="text-primary font-bold hover:underline"
              >
                Khôi phục tại đây
              </button>
            </p>
          </>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <h2 className="text-center text-xl font-black text-slate-900">{forgotTitle}</h2>

            {forgotStep === 'request' && (
              <>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setForgotMethod('email');
                      setFormData({ ...formData, phone: '' });
                    }}
                    className={`rounded-md px-3 py-2 text-sm font-bold transition-all ${forgotMethod === 'email' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setForgotMethod('phone');
                      setFormData({ ...formData, email: '' });
                    }}
                    className={`rounded-md px-3 py-2 text-sm font-bold transition-all ${forgotMethod === 'phone' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                  >
                    Số điện thoại
                  </button>
                </div>

                <div className="relative">
                  {forgotMethod === 'email' ? (
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  ) : (
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  )}
                  <input
                    type={forgotMethod === 'email' ? 'email' : 'text'}
                    className="w-full bg-slate-50 border border-slate-200/60 p-4 pl-12 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
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
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                    Mã OTP mô phỏng để kiểm thử luồng khôi phục là{' '}
                    <strong className="font-mono text-base tracking-widest">{receivedOtp}</strong>
                  </div>
                )}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    required
                    type="text"
                    maxLength={6}
                    className="w-full bg-slate-50 border border-slate-200/60 p-4 pl-12 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
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
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    required
                    type="password"
                    className="w-full bg-slate-50 border border-slate-200/60 p-4 pl-12 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    disabled={loading}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    required
                    type="password"
                    className="w-full bg-slate-50 border border-slate-200/60 p-4 pl-12 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmNewPassword}
                    disabled={loading}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              disabled={loading}
              className="w-full bg-primary text-white p-5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-sm"
            >
              {loading
                ? 'Đang xử lý...'
                : forgotStep === 'request'
                  ? 'Gửi mã xác thực OTP'
                  : forgotStep === 'otp'
                    ? 'Xác thực mã OTP'
                    : 'Đặt lại mật khẩu'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={showLogin}
              className="mx-auto flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-primary"
            >
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;

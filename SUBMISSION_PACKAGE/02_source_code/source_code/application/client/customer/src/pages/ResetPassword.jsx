import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Mật khẩu phải ít nhất 6 ký tự');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Token không hợp lệ hoặc đã hết hạn');
            }
        } catch (err) {
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-reset-shell">
                <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="auth-reset-card auth-reset-card--center">
                    <div className="auth-reset-icon">
                        <CheckCircle size={38} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px', color: '#0f172a' }}>Cập nhật thành công</h2>
                    <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: 1.6 }}>Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.</p>
                    <button onClick={() => navigate('/auth')} className="btn-primary" style={{ width: '100%', height: '52px' }}>Đăng nhập ngay <ChevronRight size={18} /></button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="auth-reset-shell">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="auth-reset-card">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 950, color: '#0f172a' }}>Đặt lại mật khẩu</h1>
                    <p style={{ color: '#64748b', marginTop: '8px', lineHeight: 1.55 }}>Nhập mật khẩu mới để tiếp tục sử dụng tài khoản Dealzy.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '14px' }}>Mật khẩu mới</label>
                        <div className="input-group">
                            <Lock size={18} className="input-icon" />
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                className="auth-input" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-password-toggle" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '14px' }}>Xác nhận mật khẩu</label>
                        <div className="input-group">
                            <Lock size={18} className="input-icon" />
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                className="auth-input" 
                                placeholder="••••••••" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    {error && <p className="auth-error" style={{ textAlign: 'center' }}>{error}</p>}

                    <button type="submit" disabled={loading} className="btn-primary" style={{ height: '52px', marginTop: '10px' }}>
                        {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                    </button>
                    
                    <button type="button" onClick={() => navigate('/auth')} className="auth-secondary-button" style={{ marginTop: '4px' }}>Quay lại đăng nhập</button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;

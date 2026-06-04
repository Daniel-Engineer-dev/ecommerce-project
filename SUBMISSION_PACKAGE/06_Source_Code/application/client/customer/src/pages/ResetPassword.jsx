import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, ChevronRight } from 'lucide-react';

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
            const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
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
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <CheckCircle size={40} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>Thành công!</h2>
                    <p style={{ color: '#64748b', marginBottom: '30px' }}>Mật khẩu của bạn đã được cập nhật. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.</p>
                    <button onClick={() => navigate('/auth')} className="btn-primary" style={{ width: '100%', height: '52px' }}>Đăng nhập ngay <ChevronRight size={18} /></button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', maxWidth: '450px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>Đặt lại mật khẩu</h1>
                    <p style={{ color: '#64748b', marginTop: '8px' }}>Vui lòng nhập mật khẩu mới cho tài khoản của bạn</p>
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
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
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

                    {error && <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" disabled={loading} className="btn-primary" style={{ height: '52px', marginTop: '10px' }}>
                        {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                    </button>
                    
                    <button type="button" onClick={() => navigate('/auth')} style={{ color: '#64748b', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: '10px' }}>Quay lại</button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;

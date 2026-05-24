import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, MapPin, Calendar, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { API_BASE_URL } from '../config';

const CustomerRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [regMethod, setRegMethod] = useState('email'); // 'email' hoặc 'phone'
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        email: '',
        phone: '',
        dob: '',
        address: '',
        role: 'Customer'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = (e) => {
        if (e) e.preventDefault();
        setError('');
        if (step === 1) {
            if (!formData.full_name || !formData.username || !formData.password) {
                setError('Vui lòng điền đầy đủ thông tin bắt buộc (*)');
                return;
            }
            if (regMethod === 'email' && !formData.email) {
                setError('Vui lòng nhập Email');
                return;
            }
            if (regMethod === 'phone' && !formData.phone) {
                setError('Vui lòng nhập Số điện thoại');
                return;
            }
        }
        setStep(step + 1);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            ...formData,
            email: regMethod === 'email' ? formData.email : '',
            phone: regMethod === 'phone' ? formData.phone : ''
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', padding: '4rem', borderRadius: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                    <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '1rem' }}>Chào mừng bạn!</h1>
                    <p style={{ color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.6 }}>Tài khoản của bạn đã được khởi tạo thành công. Hãy bắt đầu trải nghiệm Dealzy ngay bây giờ.</p>
                    <button onClick={() => navigate('/auth')} className="btn-primary" style={{ width: '100%', height: '56px' }}>Đăng nhập ngay</button>
                </motion.div>
            </div>
        );
    }

    const steps = [
        { id: 1, label: 'Cơ bản', icon: <User size={18} /> },
        { id: 2, label: 'Cá nhân', icon: <MapPin size={18} /> }
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '550px', width: '100%' }}>
                <div style={{ background: 'white', padding: '3rem 2.5rem', borderRadius: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', border: '1px solid #f1f5f9', position: 'relative' }}>
                    <Link to="/auth" style={{ position: 'absolute', left: '2rem', top: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                        <ArrowLeft size={16} /> Quay lại
                    </Link>

                    {/* Progress Bar */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        {steps.map((s) => (
                            <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                <div style={{
                                    width: '100%',
                                    height: '6px',
                                    background: step >= s.id ? 'var(--primary)' : '#e2e8f0',
                                    borderRadius: '10px',
                                    transition: '0.4s'
                                }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: step >= s.id ? 'var(--primary)' : '#94a3b8', fontWeight: 700, fontSize: '0.8rem' }}>
                                    {s.icon} {s.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <img src={logo} alt="Logo" style={{ height: '36px' }} />
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Tạo tài khoản</h1>
                        </div>
                    </div>

                    <form onSubmit={step === 2 ? handleSubmit : handleNext}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div className="input-group"><User size={18} className="input-icon" /><input name="full_name" placeholder="Họ và tên *" required value={formData.full_name} onChange={handleChange} className="auth-input" /></div>
                                    <div className="input-group"><User size={18} className="input-icon" /><input name="username" placeholder="Tên đăng nhập *" required value={formData.username} onChange={handleChange} className="auth-input" /></div>

                                    <div style={{ background: '#f1f5f9', padding: '5px', borderRadius: '14px', display: 'flex' }}>
                                        <button type="button" onClick={() => setRegMethod('email')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: regMethod === 'email' ? 'white' : 'transparent', color: regMethod === 'email' ? 'var(--primary)' : '#64748b', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}>Email</button>
                                        <button type="button" onClick={() => setRegMethod('phone')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: regMethod === 'phone' ? 'white' : 'transparent', color: regMethod === 'phone' ? 'var(--primary)' : '#64748b', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}>SĐT</button>
                                    </div>

                                    {regMethod === 'email' ? (
                                        <div className="input-group"><Mail size={18} className="input-icon" /><input name="email" type="email" placeholder="Email của bạn *" required value={formData.email} onChange={handleChange} className="auth-input" /></div>
                                    ) : (
                                        <div className="input-group"><Phone size={18} className="input-icon" /><input name="phone" placeholder="Số điện thoại *" required value={formData.phone} onChange={handleChange} className="auth-input" /></div>
                                    )}

                                    <div className="input-group"><Lock size={18} className="input-icon" /><input name="password" type="password" placeholder="Mật khẩu *" required value={formData.password} onChange={handleChange} className="auth-input" /></div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div className="input-group"><Calendar size={18} className="input-icon" /><input name="dob" type="date" value={formData.dob} onChange={handleChange} className="auth-input" style={{ paddingLeft: '44px' }} /></div>
                                    <div className="input-group"><MapPin size={18} className="input-icon" /><input name="address" placeholder="Địa chỉ / Thành phố" value={formData.address} onChange={handleChange} className="auth-input" /></div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginTop: '1.5rem' }}>{error}</p>}

                        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(step - 1)} style={{ flex: 1, height: '56px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}>
                                    Quay lại
                                </button>
                            )}
                            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, height: '56px' }}>
                                {loading ? 'Đang xử lý...' : step === 2 ? 'Hoàn tất đăng ký' : 'Tiếp theo'} <ChevronRight size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomerRegistration;

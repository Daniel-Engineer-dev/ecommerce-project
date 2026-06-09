import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, Mail, Lock, Phone, MapPin, CheckCircle2, Plus, Trash2, ArrowLeft, Briefcase, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { API_BASE_URL } from '../config';

const PartnerRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phone: '',
        company_name: '',
        representative_name: '',
        tax_id: '',
        headquarters: '',
        role: 'Partner',
        branches: [{ branch_name: '', address: '', phone: '' }]
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [emailAvailability, setEmailAvailability] = useState({
        status: 'idle',
        message: '',
    });

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const email = formData.email.trim();
        if (!email) {
            setEmailAvailability({ status: 'idle', message: '' });
            return undefined;
        }

        if (!isValidEmail(email)) {
            setEmailAvailability({
                status: 'invalid',
                message: 'Email chưa đúng định dạng.',
            });
            return undefined;
        }

        setEmailAvailability({ status: 'checking', message: 'Đang kiểm tra email...' });
        const timeoutId = window.setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/check-availability`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                const data = await response.json();
                if (response.ok && data.email) {
                    setEmailAvailability({ status: 'available', message: '' });
                } else {
                    setEmailAvailability({
                        status: 'unavailable',
                        message: 'Email này đã được sử dụng.',
                    });
                }
            } catch {
                setEmailAvailability({
                    status: 'error',
                    message: 'Không thể kiểm tra email. Vui lòng thử lại.',
                });
            }
        }, 450);

        return () => window.clearTimeout(timeoutId);
    }, [formData.email]);

    const handleBranchChange = (index, e) => {
        const newBranches = [...formData.branches];
        newBranches[index][e.target.name] = e.target.value;
        setFormData({ ...formData, branches: newBranches });
    };

    const addBranch = () => {
        setFormData({
            ...formData,
            branches: [...formData.branches, { branch_name: '', address: '', phone: '' }]
        });
    };

    const removeBranch = (index) => {
        const newBranches = formData.branches.filter((_, i) => i !== index);
        setFormData({ ...formData, branches: newBranches });
    };

    const handleNext = async (e) => {
        if (e) e.preventDefault();
        setError('');
        if (step === 1) {
            if (!formData.username || !formData.password || !formData.email || !formData.phone) {
                setError('Vui lòng điền đầy đủ thông tin tài khoản');
                return;
            }
            if (emailAvailability.status === 'checking') {
                setError('Vui lòng chờ kiểm tra email hoàn tất.');
                return;
            }
            if (['invalid', 'unavailable', 'error'].includes(emailAvailability.status)) {
                setError(emailAvailability.message);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/check-availability`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        phone: formData.phone
                    }),
                });
                const data = await response.json();
                if (!response.ok || !data.available) {
                    const conflictMap = {
                        username: 'Tên đăng nhập',
                        email: 'Email',
                        phone: 'Số điện thoại'
                    };
                    const conflictNames = (data.conflicts || []).map(c => conflictMap[c] || c);
                    setError(`Thông tin đã tồn tại: ${conflictNames.join(', ')}`);
                    return;
                }
            } catch (err) {
                setError('Không thể kiểm tra tài khoản. Vui lòng thử lại.');
                return;
            } finally {
                setLoading(false);
            }
        } else if (step === 2) {
            if (!formData.company_name || !formData.tax_id || !formData.headquarters) {
                setError('Vui lòng điền các thông tin bắt buộc (*)');
                return;
            }
        }
        setStep(step + 1);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || "Đăng ký thất bại");
            }
        } catch (error) {
            setError("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', padding: '4rem', borderRadius: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', textAlign: 'center', maxWidth: '550px', width: '100%' }}>
                    <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Đăng ký thành công!</h1>
                    <p style={{ color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.6 }}>Hồ sơ đối tác của bạn đã được gửi thành công. Dealzy sẽ kiểm tra và phản hồi bạn qua email sớm nhất.</p>
                    <button onClick={() => navigate('/auth')} className="btn-primary" style={{ width: '100%', height: '56px' }}>Quay lại Đăng nhập</button>
                </motion.div>
            </div>
        );
    }

    const steps = [
        { id: 1, label: 'Tài khoản', icon: <User size={18} /> },
        { id: 2, label: 'Doanh nghiệp', icon: <Building2 size={18} /> },
        { id: 3, label: 'Chi nhánh', icon: <MapPin size={18} /> }
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '600px', width: '100%' }}>
                <div style={{ background: 'white', padding: '3rem 2.5rem', borderRadius: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', border: '1px solid #f1f5f9', position: 'relative' }}>
                    <Link to="/auth" style={{ position: 'absolute', left: '2rem', top: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                        <ArrowLeft size={16} /> Quay lại
                    </Link>

                    {/* Progress Bar */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
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
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Đăng ký Đối tác</h1>
                        </div>
                    </div>

                    <form onSubmit={step === 3 ? handleSubmit : handleNext}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div className="input-group"><User size={18} className="input-icon" /><input name="username" placeholder="Tên đăng nhập *" required value={formData.username} onChange={handleChange} className="auth-input" /></div>
                                        <div className="input-group"><Lock size={18} className="input-icon" /><input name="password" type="password" placeholder="Mật khẩu *" required value={formData.password} onChange={handleChange} className="auth-input" /></div>
                                        <div className="input-group">
                                            <Mail size={18} className="input-icon" />
                                            <input name="email" type="email" placeholder="Email liên hệ *" required value={formData.email} onChange={handleChange} className="auth-input" />
                                            {emailAvailability.message && (
                                                <p
                                                    className="auth-field-message"
                                                    style={{ color: emailAvailability.status === 'checking' ? '#64748b' : '#ef4444' }}
                                                >
                                                    {emailAvailability.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="input-group"><Phone size={18} className="input-icon" /><input name="phone" placeholder="Số điện thoại *" required value={formData.phone} onChange={handleChange} className="auth-input" /></div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="input-group"><Building2 size={18} className="input-icon" /><input name="company_name" placeholder="Tên công ty / Thương hiệu *" required value={formData.company_name} onChange={handleChange} className="auth-input" /></div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div className="input-group"><User size={18} className="input-icon" /><input name="representative_name" placeholder="Người đại diện" value={formData.representative_name} onChange={handleChange} className="auth-input" /></div>
                                        <div className="input-group"><Briefcase size={18} className="input-icon" /><input name="tax_id" placeholder="Mã số thuế *" required value={formData.tax_id} onChange={handleChange} className="auth-input" /></div>
                                    </div>
                                    <div className="input-group"><MapPin size={18} className="input-icon" /><input name="headquarters" placeholder="Trụ sở chính *" required value={formData.headquarters} onChange={handleChange} className="auth-input" /></div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>Chi tiết các chi nhánh</h3>
                                        <button type="button" onClick={addBranch} style={{ border: 'none', background: 'var(--accent-glow)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Plus size={14} /> Thêm
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                                        {formData.branches.map((branch, index) => (
                                            <div key={index} style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                                {formData.branches.length > 1 && (
                                                    <button type="button" onClick={() => removeBranch(index)} style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                )}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    <input name="branch_name" value={branch.branch_name} onChange={(e) => handleBranchChange(index, e)} placeholder="Tên chi nhánh" className="auth-input" style={{ background: 'white', paddingLeft: '15px', height: '42px' }} />
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        <input name="address" value={branch.address} onChange={(e) => handleBranchChange(index, e)} placeholder="Địa chỉ" className="auth-input" style={{ background: 'white', paddingLeft: '15px', height: '42px' }} />
                                                        <input name="phone" value={branch.phone} onChange={(e) => handleBranchChange(index, e)} placeholder="SĐT" className="auth-input" style={{ background: 'white', paddingLeft: '15px', height: '42px' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginTop: '1.5rem' }}>{error}</p>}

                        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(step - 1)} style={{ flex: 1, height: '56px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}>
                                    Quay lại
                                </button>
                            )}
                            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, height: '56px' }}>
                                {loading ? 'Đang xử lý...' : step === 3 ? 'Gửi hồ sơ đăng ký' : 'Tiếp theo'} <ChevronRight size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PartnerRegistration;

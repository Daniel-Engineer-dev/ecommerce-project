import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, MapPin, Calendar, Building, Briefcase, Phone, Lock, Save, ShieldCheck, ArrowLeft, Plus, X } from 'lucide-react';

import { useNavigate, Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { apiFetch } from '../apiClient';

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'security'

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await apiFetch(`${API_BASE_URL}/api/auth/profile`);
            const data = await res.json();
            if (res.ok) {
                setProfile(data);
                // Cập nhật email trong localStorage nếu có thay đổi
                const user = JSON.parse(localStorage.getItem('partnerUser'));
                if (user) {
                    user.email = data.email;
                    localStorage.setItem('partnerUser', JSON.stringify(user));
                }
            } else {
                setError(data.message || 'Không thể tải thông tin hồ sơ');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBranch = () => {
        setProfile({
            ...profile,
            branches: [...(profile.branches || []), { branch_name: '', address: '', phone: '' }]
        });
    };

    const handleRemoveBranch = (index) => {
        const newBranches = profile.branches.filter((_, i) => i !== index);
        setProfile({ ...profile, branches: newBranches });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await apiFetch(`${API_BASE_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile)
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Cập nhật hồ sơ thành công!');
            } else {
                setError(data.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Mật khẩu mới không khớp');
            return;
        }

        try {
            const res = await apiFetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Đổi mật khẩu thành công!');
                setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setError(data.message || 'Đổi mật khẩu thất bại');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
        }
    };

    if (loading) return (
        <div className="loading-screen" style={{ minHeight: '100vh' }}>
            <div className="loader"></div>
            <p>Đang tải...</p>
        </div>
    );

    if (!profile) {
        return (
            <div style={{ paddingTop: '150px', paddingBottom: '100px', textAlign: 'center', minHeight: '100vh', background: '#f8fafc' }}>
                <div className="container" style={{ maxWidth: '500px' }}>
                    <div style={{ background: 'white', padding: '3rem', borderRadius: 'var(--radius-lg, 12px)', boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))', border: '1px solid var(--border-color, #e4e4e7)' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(24, 24, 27, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Lock size={32} color="var(--primary, #18181b)" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Yêu cầu đăng nhập</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || 'Vui lòng đăng nhập để xem và quản lý thông tin hồ sơ của bạn.'}</p>
                        <Link to="/auth" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.8rem 2rem' }}>
                            Đăng nhập ngay <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '22px 30px', minHeight: 'calc(100vh - 72px)', background: 'transparent' }}>
            <div style={{ position: 'relative', maxWidth: '1480px', margin: '0 auto', display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
                {/* Sidebar Tabs */}
                <div style={{
                    width: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    position: 'sticky',
                    top: '88px'
                }}>
                    <div style={{ padding: '0 0.75rem 0.65rem' }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 850 }}>Cài đặt</h2>
                    </div>
                    <button
                        onClick={() => setActiveTab('info')}
                        style={{
                            padding: '0.62rem 0.9rem',
                            borderRadius: '14px',
                            border: activeTab === 'info' ? '1px solid var(--border-color, #e4e4e7)' : '1px solid transparent',
                            background: activeTab === 'info' ? 'white' : 'transparent',
                            color: activeTab === 'info' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            boxShadow: activeTab === 'info' ? 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))' : 'none',
                            transition: '0.3s',
                            lineHeight: 1
                        }}
                    >
                        <User size={18} /> Thông tin cá nhân
                    </button>

                    {profile?.role === 'Partner' && (
                        <button
                            onClick={() => setActiveTab('branches')}
                            style={{
                                padding: '0.62rem 0.9rem',
                                borderRadius: '14px',
                                border: activeTab === 'branches' ? '1px solid var(--border-color, #e4e4e7)' : '1px solid transparent',
                                background: activeTab === 'branches' ? 'white' : 'transparent',
                                color: activeTab === 'branches' ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.65rem',
                                boxShadow: activeTab === 'branches' ? 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))' : 'none',
                                transition: '0.3s',
                                lineHeight: 1
                            }}
                        >
                            <MapPin size={18} /> Danh sách chi nhánh
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('security')}
                        style={{
                            padding: '0.62rem 0.9rem',
                            borderRadius: '14px',
                            border: activeTab === 'security' ? '1px solid var(--border-color, #e4e4e7)' : '1px solid transparent',
                            background: activeTab === 'security' ? 'white' : 'transparent',
                            color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            boxShadow: activeTab === 'security' ? 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))' : 'none',
                            transition: '0.3s',
                            lineHeight: 1
                        }}
                    >
                        <Lock size={18} /> Bảo mật
                    </button>

                </div>

                {/* Main Content Area */}
                <div style={{
                    maxWidth: '1040px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                }}>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'left' }}
                    >
                        <h1 style={{ fontSize: '1.6rem', lineHeight: 1.16, fontWeight: 850, marginBottom: '0.2rem', letterSpacing: 0 }}>Hồ sơ của bạn</h1>
                        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.92rem' }}>Quản lý thông tin cá nhân và cài đặt bảo mật</p>
                    </motion.div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.96)', padding: '18px', borderRadius: '18px', boxShadow: '0 14px 34px rgba(15, 23, 42, 0.055)', border: '1px solid #dce7f3' }}>
                        <AnimatePresence mode="wait">
                            {activeTab === 'info' && (
                                <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 850, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <User color="var(--primary)" /> Thông tin tài khoản
                                    </h3>
                                    <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem 1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Email</label>
                                            <div className="input-group"><Mail size={18} className="input-icon" /><input type="email" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="auth-input" placeholder="Chưa cập nhật" /></div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Số điện thoại</label>
                                            <div className="input-group"><Phone size={18} className="input-icon" /><input type="text" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="auth-input" placeholder="Chưa cập nhật" /></div>
                                        </div>


                                        {profile.role === 'Partner' ? (
                                            <>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Tên doanh nghiệp</label>
                                                    <div className="input-group"><Building size={18} className="input-icon" /><input type="text" value={profile.company_name} onChange={(e) => setProfile({ ...profile, company_name: e.target.value })} className="auth-input" /></div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Người đại diện</label>
                                                    <div className="input-group"><User size={18} className="input-icon" /><input type="text" value={profile.representative_name} onChange={(e) => setProfile({ ...profile, representative_name: e.target.value })} className="auth-input" /></div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Mã số thuế</label>
                                                    <div className="input-group"><Briefcase size={18} className="input-icon" /><input type="text" value={profile.tax_id} onChange={(e) => setProfile({ ...profile, tax_id: e.target.value })} className="auth-input" /></div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Trụ sở chính</label>
                                                    <div className="input-group"><MapPin size={18} className="input-icon" /><input type="text" value={profile.headquarters} onChange={(e) => setProfile({ ...profile, headquarters: e.target.value })} className="auth-input" /></div>
                                                </div>
                                            </>
                                        ) : (

                                            <>
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Họ và tên</label>
                                                    <div className="input-group"><User size={18} className="input-icon" /><input type="text" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="auth-input" /></div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Ngày sinh</label>
                                                    <div className="input-group"><Calendar size={18} className="input-icon" /><input type="date" value={profile.dob ? profile.dob.split('T')[0] : ''} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} className="auth-input" /></div>
                                                </div>
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Địa chỉ</label>
                                                    <div className="input-group"><MapPin size={18} className="input-icon" /><input type="text" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="auth-input" /></div>
                                                </div>
                                            </>
                                        )}

                                        <div style={{ gridColumn: 'span 2', marginTop: '0.25rem' }}>
                                            {success && activeTab === 'info' && <p style={{ color: '#10b981', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</p>}
                                            {error && activeTab === 'info' && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
                                            <button type="submit" className="btn-primary" style={{ height: '42px', padding: '0 1.5rem', gap: '0.5rem' }}>
                                                <Save size={18} /> Lưu thay đổi
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 850, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <ShieldCheck color="var(--primary)" /> Bảo mật tài khoản
                                    </h3>
                                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Mật khẩu hiện tại</label>
                                            <div className="input-group"><Lock size={18} className="input-icon" /><input type="password" value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} className="auth-input" placeholder="••••••••" required /></div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Mật khẩu mới</label>
                                            <div className="input-group"><Lock size={18} className="input-icon" /><input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="auth-input" placeholder="••••••••" required /></div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Xác nhận mật khẩu mới</label>
                                            <div className="input-group"><Lock size={18} className="input-icon" /><input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="auth-input" placeholder="••••••••" required /></div>
                                        </div>

                                        <div style={{ marginTop: '0.25rem' }}>
                                            {error && activeTab === 'security' && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
                                            {success && activeTab === 'security' && <p style={{ color: '#10b981', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</p>}
                                            <button type="submit" className="btn-primary" style={{ height: '42px', padding: '0 1.5rem', gap: '0.5rem' }}>
                                                <Save size={18} /> Đổi mật khẩu
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'branches' && profile?.role === 'Partner' && (
                                <motion.div key="branches" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Danh sách chi nhánh</h3>
                                            <p style={{ color: '#64748b' }}>Quản lý các địa điểm kinh doanh của bạn trên hệ thống</p>
                                        </div>
                                        <button type="button" onClick={handleAddBranch} className="btn-primary" style={{ padding: '0 1.5rem', height: '45px', gap: '0.5rem' }}>
                                            <Plus size={18} /> Thêm mới
                                        </button>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))', gap: '1.5rem' }}>
                                            {profile.branches && profile.branches.map((branch, index) => (
                                                <div key={index} style={{ padding: '1.5rem', background: 'white', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--border-color, #e4e4e7)', boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))', position: 'relative', transition: '0.3s' }}>
                                                    <button type="button" onClick={() => handleRemoveBranch(index)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'var(--error-light, #fef2f2)', color: 'var(--error-dark, #991b1b)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }}><X size={18} /></button>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                        <div style={{ gridColumn: 'span 2' }}>
                                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#64748b' }}>Tên chi nhánh</label>
                                                            <div className="input-group"><Building size={18} className="input-icon" /><input type="text" value={branch.branch_name} onChange={(e) => {
                                                                const newBranches = [...profile.branches];
                                                                newBranches[index].branch_name = e.target.value;
                                                                setProfile({ ...profile, branches: newBranches });
                                                            }} className="auth-input" placeholder="Tên chi nhánh..." required /></div>
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#64748b' }}>Địa chỉ</label>
                                                            <div className="input-group"><MapPin size={18} className="input-icon" /><input type="text" value={branch.address} onChange={(e) => {
                                                                const newBranches = [...profile.branches];
                                                                newBranches[index].address = e.target.value;
                                                                setProfile({ ...profile, branches: newBranches });
                                                            }} className="auth-input" placeholder="Địa chỉ..." required /></div>
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#64748b' }}>Số điện thoại</label>
                                                            <div className="input-group"><Phone size={18} className="input-icon" /><input type="text" value={branch.phone} onChange={(e) => {
                                                                const newBranches = [...profile.branches];
                                                                newBranches[index].phone = e.target.value;
                                                                setProfile({ ...profile, branches: newBranches });
                                                            }} className="auth-input" placeholder="SĐT chi nhánh..." required /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {profile.branches?.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: 'var(--radius-lg, 12px)', border: '2px dashed var(--border-color, #e4e4e7)' }}>
                                                <MapPin size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                                                <p style={{ color: '#64748b', fontWeight: 600 }}>Chưa có chi nhánh nào được đăng ký</p>
                                                <button type="button" onClick={handleAddBranch} style={{ marginTop: '1rem', color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>+ Thêm chi nhánh đầu tiên</button>
                                            </div>
                                        )}

                                        <div style={{ marginTop: '1rem' }}>
                                            {success && activeTab === 'branches' && <p style={{ color: '#10b981', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</p>}
                                            {error && activeTab === 'branches' && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
                                            <button type="submit" className="btn-primary" style={{ height: '50px', padding: '0 2.5rem', gap: '0.5rem' }}>
                                                <Save size={18} /> Lưu danh sách chi nhánh
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default Profile;


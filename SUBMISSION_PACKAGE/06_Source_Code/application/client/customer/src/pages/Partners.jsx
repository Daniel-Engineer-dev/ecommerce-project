import React from 'react';
import { motion } from 'framer-motion';

const logoModules = import.meta.glob('../assets/logos/*.{png,jpg,jpeg,svg}', { eager: true });
const partnerLogos = Object.values(logoModules).map(m => m.default);

const Partners = () => {
    return (
        <div style={{ paddingTop: '180px', paddingBottom: '80px' }}>
            <div className="container">

                {/* HERO */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
                >
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                        Hơn <span className="gradient-text">1200+ đối tác</span> đang tăng trưởng cùng Dealzy
                    </h1>

                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '1.2rem',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Từ nhà hàng, spa đến khách sạn — tất cả đều đang tận dụng Dealzy để tăng doanh thu mỗi ngày.
                    </p>
                </motion.div>

                {/* LOGO STRIP - SLIDING */}
                <div style={{ 
                    overflow: 'hidden', 
                    padding: '2rem 0', 
                    marginBottom: '5rem',
                    position: 'relative'
                }}>
                    {/* Gradient masks for smooth edges */}
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '150px', background: 'linear-gradient(to right, var(--bg-dark), transparent)', zIndex: 2 }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '150px', background: 'linear-gradient(to left, var(--bg-dark), transparent)', zIndex: 2 }} />

                    <div className="logo-slider">
                        {[...partnerLogos, ...partnerLogos, ...partnerLogos].map((logo, i) => (
                            <div 
                                key={i} 
                                style={{
                                    background: 'white',
                                    padding: '1rem 2.5rem',
                                    borderRadius: '16px',
                                    boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    height: '80px',
                                    minWidth: '180px'
                                }}
                            >
                                <img
                                    src={logo}
                                    alt="partner"
                                    style={{
                                        height: '40px',
                                        width: 'auto',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* BENEFITS */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '2rem',
                        marginBottom: '5rem'
                    }}
                >
                    {[
                        {
                            title: 'Tiếp cận khách hàng lớn',
                            desc: '500.000+ người dùng hoạt động mỗi tháng.'
                        },
                        {
                            title: 'Tăng doanh thu nhanh',
                            desc: 'Nhiều đối tác tăng 30-70% doanh thu trong 3 tháng.'
                        },
                        {
                            title: 'Marketing miễn phí',
                            desc: 'Xuất hiện trên app, web và chiến dịch quảng bá.'
                        }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -8 }}
                            style={{
                                padding: '2rem',
                                borderRadius: '16px',
                                background: 'white',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                textAlign: 'center'
                            }}
                        >
                            <h3 style={{ marginBottom: '1rem' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* CASE STUDY */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '3rem',
                        textAlign: 'center',
                        marginBottom: '4rem'
                    }}
                >
                    <h2 style={{ marginBottom: '1rem' }}>
                        “Doanh thu tăng 65% chỉ sau 2 tháng”
                    </h2>
                    <p style={{ opacity: 0.9 }}>
                        Một chuỗi nhà hàng đã mở rộng tệp khách hàng nhờ Dealzy.
                    </p>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{ textAlign: 'center' }}
                >
                    <button
                        className="btn-primary"
                        style={{
                            padding: '1.2rem 3rem',
                            fontSize: '1.2rem'
                        }}
                    >
                        Trở thành đối tác ngay 🚀
                    </button>
                </motion.div>

            </div>
        </div>
    );
};

export default Partners;
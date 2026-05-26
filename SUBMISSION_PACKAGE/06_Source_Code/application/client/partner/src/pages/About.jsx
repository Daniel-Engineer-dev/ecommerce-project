import React from 'react';
import { motion } from 'framer-motion';
import aboutImg from '../assets/e-commerce.jpg';

const sectionStyle = {
    scrollSnapAlign: 'start',
    minHeight: '100vh'
};

const About = () => {
    return (
        <div
            style={{
                scrollSnapType: 'y proximity',
                scrollBehavior: 'smooth',
                scrollPaddingTop: '120px'
            }}
        >

            {/* HERO */}
            <section style={{
                ...sectionStyle,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',

                textAlign: 'center',
                padding: '40px 20px',
                background: 'linear-gradient(135deg, #eef2ff, #ffffff)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-150px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(37,99,235,0.15), transparent)',
                    filter: 'blur(60px)', // 👈 giảm lag
                    opacity: 0.6
                }} />

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        marginBottom: '1.5rem',
                        maxWidth: '900px',
                        position: 'relative'
                    }}
                >
                    Không chỉ là voucher. <br />
                    <span className="gradient-text">Đó là trải nghiệm.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    style={{
                        fontSize: '1.3rem',
                        color: 'var(--text-muted)',
                        maxWidth: '700px'
                    }}
                >
                    Dealzy giúp bạn tận hưởng cuộc sống nhiều hơn với chi phí ít hơn.
                </motion.p>
            </section>

            {/* STORY */}
            <section
                className="container"
                style={{
                    ...sectionStyle,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4rem',
                    alignItems: 'center'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, margin: '-100px' }} // 👈 giảm trigger
                >
                    <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>
                        Câu chuyện của chúng tôi
                    </h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        Dealzy ra đời khi chúng tôi nhận ra rằng rất nhiều người
                        muốn trải nghiệm cuộc sống tốt hơn, nhưng bị giới hạn bởi chi phí.
                        <br /><br />
                        Chúng tôi tạo ra một nền tảng nơi mọi người có thể
                        tiếp cận những dịch vụ cao cấp với mức giá hợp lý,
                        đồng thời giúp doanh nghiệp tiếp cận khách hàng hiệu quả hơn.
                    </p>
                </motion.div>

                <motion.img
                    src={aboutImg}
                    alt="About Dealzy"
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, margin: '-100px' }}
                    whileHover={{ scale: 1.03 }}
                    style={{
                        width: '100%',
                        height: '320px',
                        objectFit: 'cover',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                    }}
                />
            </section>

            {/* STATS */}
            <section style={{
                ...sectionStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0f172a',
                color: 'white'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    width: '100%'
                }}>
                    {[
                        { value: '500K+', label: 'Người dùng' },
                        { value: '1200+', label: 'Đối tác' },
                        { value: '4.9★', label: 'Đánh giá' }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                                {item.value}
                            </div>
                            <div style={{ opacity: 0.7 }}>{item.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* MISSION */}
            <section
                className="container"
                style={{
                    ...sectionStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    style={{
                        textAlign: 'center',
                        maxWidth: '700px'
                    }}
                >
                    <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>
                        Sứ mệnh của chúng tôi
                    </h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        Giúp mọi người tận hưởng cuộc sống trọn vẹn hơn bằng cách
                        mang đến những ưu đãi thực sự có giá trị,
                        đồng thời giúp doanh nghiệp phát triển bền vững.
                    </p>
                </motion.div>
            </section>

            {/* CTA */}
            <section style={{
                ...sectionStyle,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',

                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white'
            }}>
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    style={{ fontSize: '2rem', marginBottom: '1rem' }}
                >
                    Bắt đầu hành trình cùng Dealzy
                </motion.h2>

                <button
                    className="btn-primary"
                    style={{
                        background: 'white',
                        color: '#2563eb',
                        padding: '1rem 2.5rem',
                        fontWeight: 600,
                        borderRadius: '999px',
                        cursor: 'pointer'
                    }}
                >
                    Khám phá ngay 🚀
                </button>
            </section>

        </div>
    );
};

export default About;
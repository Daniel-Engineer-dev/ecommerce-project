import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Megaphone } from "lucide-react";

const logoModules = import.meta.glob("../assets/logos/*.{png,jpg,jpeg,svg}", {
  eager: true,
});
const partnerLogos = Object.values(logoModules).map((m) => m.default);

const useCountUp = (end, duration = 1500) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.round(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return value;
};

const HeroStat = ({ end, suffix = "", label }) => {
  const value = useCountUp(end, 1400);
  const display = end >= 1000 ? value.toLocaleString("vi-VN") : value;
  return (
    <div className="hero-stat">
      <h4>
        {display}
        {suffix}
      </h4>
      <p>{label}</p>
    </div>
  );
};

const Partners = () => {
  const sliderRef = useRef(null);
  useEffect(() => {
    // add auto-scroll class after mount so CSS animation applies
    const el = sliderRef.current;
    if (el) {
      // small timeout to ensure layout computed
      setTimeout(() => el.classList.add("auto-scroll"), 50);
    }
    return () => {
      if (el) el.classList.remove("auto-scroll");
    };
  }, []);

  return (
    <div style={{ paddingTop: "180px", paddingBottom: "80px" }}>
      <div className="container">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          <div className="partners-hero">
            <h1>
              Hơn <span className="gradient-text">1200+ đối tác</span> đang tăng
              trưởng cùng Dealzy
            </h1>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "1.2rem",
                maxWidth: "720px",
                margin: "0 auto",
              }}
            >
              Từ nhà hàng, spa đến khách sạn — tất cả đều đang tận dụng Dealzy
              để tăng doanh thu mỗi ngày.
            </p>

            <div className="hero-stats">
              <HeroStat end={500000} suffix="+" label="Người dùng/ tháng" />
              <HeroStat end={65} suffix="%" label="Tăng doanh thu (case)" />
              <HeroStat end={1200} suffix="+" label="Đối tác" />
            </div>
          </div>
        </motion.div>

        {/* LOGO STRIP - SLIDING */}
        <div
          style={{
            overflow: "hidden",
            padding: "2rem 0",
            marginBottom: "5rem",
            position: "relative",
          }}
          onMouseEnter={() => {
            if (sliderRef.current)
              sliderRef.current.classList.remove("auto-scroll");
          }}
          onMouseLeave={() => {
            if (sliderRef.current)
              sliderRef.current.classList.add("auto-scroll");
          }}
        >
          {/* Gradient masks for smooth edges */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "150px",
              background:
                "linear-gradient(to right, var(--bg-dark), transparent)",
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "150px",
              background:
                "linear-gradient(to left, var(--bg-dark), transparent)",
              zIndex: 2,
            }}
          />

          <div
            ref={sliderRef}
            className="logo-slider"
            aria-label="Logo partners carousel"
          >
            {[...partnerLogos, ...partnerLogos].map((logo, i) => (
              <div
                key={i}
                className="logo-item"
                style={{
                  background: "white",
                  padding: "1rem 2.5rem",
                  borderRadius: "16px",
                  boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  height: "80px",
                  minWidth: "180px",
                }}
              >
                <img
                  src={logo}
                  alt="partner"
                  style={{
                    height: "40px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
            ))}
          </div>
          <button
            className="slider-control left"
            aria-label="Previous logos"
            onClick={() => {
              const el = sliderRef.current;
              if (!el) return;
              const step = Math.floor(el.clientWidth / 2);
              el.scrollBy({ left: -step, behavior: "smooth" });
              el.classList.remove("auto-scroll");
              setTimeout(() => el.classList.add("auto-scroll"), 4000);
            }}
          >
            {"‹"}
          </button>
          <button
            className="slider-control right"
            aria-label="Next logos"
            onClick={() => {
              const el = sliderRef.current;
              if (!el) return;
              const step = Math.floor(el.clientWidth / 2);
              el.scrollBy({ left: step, behavior: "smooth" });
              el.classList.remove("auto-scroll");
              setTimeout(() => el.classList.add("auto-scroll"), 4000);
            }}
          >
            {"›"}
          </button>
        </div>

        {/* BENEFITS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
            marginBottom: "5rem",
          }}
        >
          {[
            {
              title: "Tiếp cận khách hàng lớn",
              desc: "500.000+ người dùng hoạt động mỗi tháng.",
              Icon: Users,
            },
            {
              title: "Tăng doanh thu nhanh",
              desc: "Nhiều đối tác tăng 30-70% doanh thu trong 3 tháng.",
              Icon: TrendingUp,
            },
            {
              title: "Marketing miễn phí",
              desc: "Xuất hiện trên app, web và chiến dịch quảng bá.",
              Icon: Megaphone,
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              className="feature-card"
            >
              <div className="feature-icon">
                <item.Icon size={28} />
              </div>
              <h3 style={{ marginBottom: "1rem" }}>{item.title}</h3>
              <p style={{ color: "var(--text-muted)" }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CASE STUDY */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="case-study"
          style={{ marginBottom: "4rem" }}
        >
          <div
            className="inner"
            style={{
              padding: "3rem",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "white",
              textAlign: "center",
            }}
          >
            <h2>“Doanh thu tăng 65% chỉ sau 2 tháng”</h2>
            <p>Một chuỗi nhà hàng đã mở rộng tệp khách hàng nhờ Dealzy.</p>
          </div>
        </motion.div>

        {/* TESTIMONIALS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="testimonial-section"
          style={{ marginBottom: "5rem" }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p className="eyebrow">Phản hồi đối tác</p>
            <h2>
              Các đối tác lớn đánh giá Dealzy là công cụ thay đổi cuộc chơi
            </h2>
          </div>

          <div className="testimonial-grid">
            {[
              {
                quote:
                  "Dealzy giúp chúng tôi lấp đầy bàn trống ngay trong tuần đầu tiên. Khách hàng đến đông và đã có doanh số bật tăng.",
                name: "Huỳnh Thu Hà",
                role: "Giám đốc điều hành LuxStay",
                initials: "HH",
              },
              {
                quote:
                  "Chúng tôi tiết kiệm hơn 30% chi phí marketing, nhưng lượng đặt chỗ lại tăng rõ rệt. Giao diện đơn giản, đối tác hỗ trợ nhanh.",
                name: "Trần Việt Dũng",
                role: "Founder Saigon Eats",
                initials: "TD",
              },
              {
                quote:
                  "Mỗi chương trình khuyến mãi đều được quảng bá đến đúng khách hàng, và tỷ lệ quay lại tăng đáng kể sau tháng đầu tiên.",
                name: "Nguyễn Lan Anh",
                role: "Quản lý thương hiệu BeautyBloom",
                initials: "LA",
              },
            ].map((item, index) => (
              <motion.article
                key={index}
                whileHover={{ y: -10 }}
                className="testimonial-card"
              >
                <div className="testimonial-avatar" aria-hidden="true">
                  {item.initials}
                </div>
                <p className="testimonial-quote">“{item.quote}”</p>
                <div className="testimonial-meta">
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ textAlign: "center" }}
        >
          <div className="partners-cta">
            <button className="btn-primary">Trở thành đối tác ngay 🚀</button>
            <div className="subtext">
              Không phí setup • Hỗ trợ 24/7 • Bắt đầu trong 24h
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Partners;

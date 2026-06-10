import React, { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Megaphone,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const logoModules = import.meta.glob("../assets/logos/*.{png,jpg,jpeg,svg}", {
  eager: true,
});
const partnerLogos = Object.values(logoModules).map((module) => module.default);

const useCountUp = (end, duration = 1500) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = null;
    let frame;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.round(progress * end));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
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

const benefits = [
  {
    title: "Tiếp cận đúng khách hàng",
    desc: "Đưa ưu đãi đến hơn 500.000 người dùng đang chủ động tìm kiếm trải nghiệm mới.",
    Icon: Users,
    number: "01",
  },
  {
    title: "Tăng doanh thu rõ rệt",
    desc: "Nhiều đối tác ghi nhận mức tăng trưởng 30-70% chỉ sau ba tháng đầu.",
    Icon: TrendingUp,
    number: "02",
  },
  {
    title: "Marketing không tốn phí",
    desc: "Xuất hiện trên app, website và các chiến dịch quảng bá được Dealzy tuyển chọn.",
    Icon: Megaphone,
    number: "03",
  },
];

const testimonials = [
  {
    quote:
      "Dealzy giúp chúng tôi lấp đầy bàn trống ngay trong tuần đầu tiên. Khách hàng đến đông và doanh số bật tăng.",
    name: "Huỳnh Thu Hà",
    role: "Giám đốc điều hành LuxStay",
    initials: "HH",
  },
  {
    quote:
      "Chúng tôi tiết kiệm hơn 30% chi phí marketing, nhưng lượng đặt chỗ lại tăng rõ rệt. Đội ngũ hỗ trợ rất nhanh.",
    name: "Trần Việt Dũng",
    role: "Founder Saigon Eats",
    initials: "TD",
  },
  {
    quote:
      "Mỗi chương trình khuyến mãi đều được quảng bá đến đúng khách hàng, tỷ lệ quay lại tăng đáng kể sau tháng đầu tiên.",
    name: "Nguyễn Lan Anh",
    role: "Quản lý thương hiệu BeautyBloom",
    initials: "LA",
  },
];

const sectionReveal = {
  initial: { opacity: 0, y: 42 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
};

const Partners = () => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    const timer = setTimeout(() => slider?.classList.add("auto-scroll"), 50);
    return () => {
      clearTimeout(timer);
      slider?.classList.remove("auto-scroll");
    };
  }, []);

  const pauseThenResumeSlider = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.classList.remove("auto-scroll");
    setTimeout(() => slider.classList.add("auto-scroll"), 4000);
  };

  const moveSlider = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.scrollBy({
      left: direction * Math.floor(slider.clientWidth / 2),
      behavior: "smooth",
    });
    pauseThenResumeSlider();
  };

  return (
    <main className="partners-page">
      <section className="partners-hero">
        <div className="partners-orb partners-orb--mint" />
        <div className="partners-orb partners-orb--sun" />
        <div className="container partners-hero__inner">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="partners-hero__copy"
          >
            <span className="partners-kicker">
              <BadgeCheck size={17} />
              Nền tảng tăng trưởng cho doanh nghiệp địa phương
            </span>
            <h1>
              Biến mỗi ưu đãi thành một{" "}
              <span>lý do để khách hàng quay lại.</span>
            </h1>
            <p>
              Hơn 1.200 nhà hàng, spa, khách sạn và thương hiệu đang dùng
              Dealzy để tiếp cận khách mới và tăng doanh thu mỗi ngày.
            </p>
            <div className="partners-hero__actions">
              <Link to="/register-partner" className="partners-primary-link">
                Trở thành đối tác <ArrowUpRight size={18} />
              </Link>
              <a href="#partner-stories" className="partners-text-link">
                Xem câu chuyện tăng trưởng
              </a>
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="partners-hero__proof"
          >
            <div className="partners-proof__top">
              <span>Hiệu quả được ghi nhận</span>
              <BadgeCheck size={22} />
            </div>
            <strong>+65%</strong>
            <p>doanh thu trung bình trong case study nổi bật</p>
            <div className="partners-proof__bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="partners-proof__note">
              <span>Chỉ sau</span>
              <b>02 tháng</b>
            </div>
          </Motion.div>
        </div>

        <div className="container hero-stats">
          <HeroStat end={500000} suffix="+" label="Người dùng mỗi tháng" />
          <HeroStat end={65} suffix="%" label="Tăng doanh thu nổi bật" />
          <HeroStat end={1200} suffix="+" label="Đối tác tin tưởng" />
        </div>
      </section>

      <Motion.section className="partners-logo-section" aria-label="Đối tác tiêu biểu" {...sectionReveal}>
        <div className="container">
          <div className="partners-section-intro partners-section-intro--inline">
            <span>Được tin chọn bởi</span>
            <p>Từ thương hiệu địa phương đến chuỗi doanh nghiệp toàn quốc.</p>
          </div>
          <div
            className="partners-logo-window"
            onMouseEnter={() => sliderRef.current?.classList.remove("auto-scroll")}
            onMouseLeave={() => sliderRef.current?.classList.add("auto-scroll")}
          >
            <div ref={sliderRef} className="logo-slider">
              {[...partnerLogos, ...partnerLogos].map((logo, index) => (
                <div key={`${logo}-${index}`} className="logo-item">
                  <img src={logo} alt="Logo đối tác Dealzy" />
                </div>
              ))}
            </div>
            <button
              className="slider-control left"
              aria-label="Logo trước"
              onClick={() => moveSlider(-1)}
            >
              ‹
            </button>
            <button
              className="slider-control right"
              aria-label="Logo tiếp theo"
              onClick={() => moveSlider(1)}
            >
              ›
            </button>
          </div>
        </div>
      </Motion.section>

      <Motion.section className="partners-benefits" {...sectionReveal}>
        <div className="container">
          <div className="partners-section-intro">
            <span>Lợi ích thiết thực</span>
            <h2>Một kênh bán hàng mới, không thêm gánh nặng vận hành.</h2>
          </div>
          <div className="partners-benefit-grid">
            {benefits.map((item, index) => (
              <Motion.article
                key={item.title}
                whileHover={{ y: -8 }}
                className={`feature-card feature-card--${index + 1}`}
              >
                <div className="feature-card__head">
                  <div className="feature-icon">
                    <item.Icon size={26} />
                  </div>
                  <span>{item.number}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Motion.article>
            ))}
          </div>
        </div>
      </Motion.section>

      <Motion.section className="container case-study" {...sectionReveal}>
        <div className="case-study__metric">
          <span>Case study</span>
          <strong>65%</strong>
          <p>Tăng trưởng doanh thu</p>
        </div>
        <div className="case-study__copy">
          <span>Chuỗi nhà hàng tại TP.HCM</span>
          <h2>“Dealzy giúp giờ thấp điểm trở thành khung giờ có doanh thu.”</h2>
          <p>
            Một chiến dịch voucher đúng thời điểm đã mở rộng tệp khách hàng và
            tạo thói quen quay lại chỉ sau hai tháng.
          </p>
        </div>
      </Motion.section>

      <Motion.section id="partner-stories" className="testimonial-section" {...sectionReveal}>
        <div className="container">
          <div className="partners-section-intro">
            <span>Đối tác nói gì</span>
            <h2>Những kết quả thật từ các thương hiệu đang vận hành mỗi ngày.</h2>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <Motion.article
                key={item.name}
                whileHover={{ y: -6 }}
                className="testimonial-card"
              >
                <span className="testimonial-card__quote-mark">“</span>
                <p className="testimonial-quote">{item.quote}</p>
                <div className="testimonial-meta">
                  <div className="testimonial-avatar" aria-hidden="true">
                    {item.initials}
                  </div>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.role}</small>
                  </span>
                </div>
              </Motion.article>
            ))}
          </div>
        </div>
      </Motion.section>

      <Motion.section className="container partners-cta" {...sectionReveal}>
        <div>
          <span>Bắt đầu trong 24 giờ</span>
          <h2>Sẵn sàng biến ưu đãi thành tăng trưởng?</h2>
          <p>Không phí thiết lập. Đội ngũ Dealzy đồng hành từ bước đầu tiên.</p>
        </div>
        <Link to="/register-partner" className="partners-primary-link">
          Đăng ký hợp tác <ArrowUpRight size={18} />
        </Link>
      </Motion.section>
    </main>
  );
};

export default Partners;

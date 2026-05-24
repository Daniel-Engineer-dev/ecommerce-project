import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Apple,
  BellOff,
  Building,
  Camera,
  CircleHelp,
  Copyright,
  CreditCard,
  FileText,
  Gamepad2,
  Heart,
  HeartPulse,
  Hotel,
  Laptop,
  Lock,
  MessageCircle,
  Phone,
  Play,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Store,
  Tag,
  X,
} from "lucide-react";
import logo from "../assets/logo.png";

const categoryLinks = [
  {
    to: "/search?category=1",
    label: "Nhà hàng & Ẩm thực",
    icon: Store,
    badge: "HOT",
    badgeClass: "badge-hot",
  },
  {
    to: "/search?category=2",
    label: "Thời trang & Mua sắm",
    icon: ShoppingBag,
  },
  { to: "/search?category=5", label: "Du lịch & Khách sạn", icon: Hotel },
  {
    to: "/search?category=3",
    label: "Giải trí & Vui chơi",
    icon: Gamepad2,
    badge: "MỚI",
    badgeClass: "badge-new",
  },
  { to: "/search?category=4", label: "Sức khoẻ & Làm đẹp", icon: HeartPulse },
  { to: "/search?q=cong-nghe", label: "Công nghệ", icon: Laptop },
];

const supportLinks = [
  { to: "/support", label: "Trung tâm hỗ trợ", icon: CircleHelp },
  { to: "/guide", label: "Hướng dẫn sử dụng", icon: FileText },
  { to: "/refund-policy", label: "Chính sách hoàn tiền", icon: CreditCard },
  { to: "/register-partner", label: "Hợp tác doanh nghiệp", icon: Building },
];

const bottomLinks = [
  { to: "/terms", label: "Điều khoản dịch vụ" },
  { to: "/privacy", label: "Chính sách bảo mật" },
  { to: "/privacy", label: "Cookie" },
  { to: "/search", label: "Sơ đồ trang" },
];

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: MessageCircle },
  { href: "https://instagram.com", label: "Instagram", icon: Camera },
  { href: "https://tiktok.com", label: "TikTok", icon: MessageCircle },
  { href: "https://youtube.com", label: "YouTube", icon: Play },
  { href: "https://zalo.me", label: "Zalo", icon: MessageCircle },
];

const paymentMethods = ["VISA", "Mastercard", "MoMo", "ZaloPay", "VNPay"];

const FooterLinkList = ({ title, links }) => (
  <div className="footer-section">
    <h3 className="footer-section__title">{title}</h3>
    <ul className="footer-links">
      {links.map(({ to, label, icon: Icon, badge, badgeClass }) => (
        <li key={`${to}-${label}`}>
          <Link to={to}>
            <Icon size={15} />
            <span>{label}</span>
            {badge && <span className={badgeClass}>{badge}</span>}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const [newsletterPopup, setNewsletterPopup] = useState(null);
  const [newsletterExpanded, setNewsletterExpanded] = useState(false);

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const email = form.elements.newsletterEmail.value.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      setNewsletterPopup({
        type: "error",
        title: "Email chưa hợp lệ",
        message:
          "Vui lòng nhập email hợp lệ để đăng ký nhận thông báo voucher.",
      });
      return;
    }

    setNewsletterPopup({
      type: "success",
      title: "Đăng ký thành công",
      message: "Dealzy sẽ gửi ưu đãi mới đến email của bạn.",
    });
    form.reset();
  };

  return (
    <footer className="site-footer">
      <section
        className={`site-footer__newsletter ${newsletterExpanded ? "expanded" : "collapsed"}`}
        aria-expanded={newsletterExpanded}
      >
        <div
          className="newsletter-label"
          role="button"
          tabIndex={0}
          onClick={() => setNewsletterExpanded((s) => !s)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setNewsletterExpanded((s) => !s);
            }
          }}
        >
          <Tag size={14} />
          Ưu đãi độc quyền
        </div>

        <div className="newsletter-body">
          <h2>Nhận voucher miễn phí mỗi tuần</h2>
          <p>
            Đăng ký ngay để không bỏ lỡ hàng ngàn mã giảm giá hấp dẫn từ các
            thương hiệu lớn.
          </p>
          <form
            className="newsletter-form"
            onSubmit={handleNewsletterSubmit}
            noValidate
          >
            <input
              name="newsletterEmail"
              type="email"
              placeholder="Nhập email của bạn..."
              aria-label="Nhập email của bạn"
            />
            <button type="submit">Đăng ký ngay</button>
          </form>
          <div className="footer-cert-row">
            <span>
              <ShieldCheck size={14} /> Bảo mật SSL
            </span>
            <span>
              <Lock size={14} /> Không spam
            </span>
            <span>
              <BellOff size={14} /> Huỷ bất kỳ lúc nào
            </span>
          </div>
        </div>
      </section>

      <div className="container site-footer__main">
        <div className="site-footer__brand">
          <Link
            to="/"
            className="site-footer__brand-logo"
            aria-label="Dealzy home"
          >
            <span className="site-footer__brand-icon">
              <img src={logo} alt="" />
            </span>
            <span>
              <strong>
                Deal<span>zy</span>
              </strong>
              <small>DEALS & DISCOUNTS</small>
            </span>
          </Link>
          <p>
            Nền tảng voucher uy tín hàng đầu Việt Nam, hàng nghìn ưu đãi từ các
            thương hiệu lớn được cập nhật mỗi ngày.
          </p>
          <div className="site-footer__socials" aria-label="Mạng xã hội">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                target="_blank"
                rel="noreferrer"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <FooterLinkList title="Danh mục" links={categoryLinks} />

        <div className="footer-section">
          <h3 className="footer-section__title">Hỗ trợ</h3>
          <ul className="footer-links">
            {supportLinks.map(({ to, label, icon: Icon }) => (
              <li key={`${to}-${label}`}>
                <Link to={to}>
                  <Icon size={15} />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
            <li>
              <a href="tel:19006789">
                <Phone size={15} />
                <span>Liên hệ: 1900 6789</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-section__title">Tải ứng dụng</h3>
          <div className="footer-app-row">
            <a className="footer-app-btn" href="#app-store">
              <Apple size={24} />
              <span>
                <small>Tải về trên</small>
                <strong>App Store</strong>
              </span>
            </a>
            <a className="footer-app-btn" href="#google-play">
              <Smartphone size={24} />
              <span>
                <small>Tải về trên</small>
                <strong>Google Play</strong>
              </span>
            </a>
          </div>

          <div className="footer-payment">
            <h3 className="footer-section__title">Thanh toán</h3>
            <div>
              {paymentMethods.map((method) => (
                <span key={method}>{method}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container site-footer__divider" />

      <div className="container site-footer__bottom">
        <div className="site-footer__copyright">
          <Copyright size={14} />
          {new Date().getFullYear()} Dealzy. Làm với{" "}
          <Heart size={13} fill="currentColor" /> tại Việt Nam.
        </div>
        <nav
          className="site-footer__bottom-links"
          aria-label="Liên kết pháp lý"
        >
          {bottomLinks.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <span>·</span>}
              <Link to={item.to}>{item.label}</Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {newsletterPopup && (
        <div
          className="newsletter-popup"
          role="presentation"
          onClick={() => setNewsletterPopup(null)}
        >
          <div
            className={`newsletter-popup__dialog newsletter-popup__dialog--${newsletterPopup.type}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="newsletter-popup__close"
              aria-label="Đóng thông báo"
              onClick={() => setNewsletterPopup(null)}
            >
              <X size={18} />
            </button>
            <div className="newsletter-popup__icon">
              {newsletterPopup.type === "success" ? (
                <ShieldCheck size={26} />
              ) : (
                <CircleHelp size={26} />
              )}
            </div>
            <h2 id="newsletter-popup-title">{newsletterPopup.title}</h2>
            <p>{newsletterPopup.message}</p>
            <button
              type="button"
              className="newsletter-popup__action"
              onClick={() => setNewsletterPopup(null)}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;

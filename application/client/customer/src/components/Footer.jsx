import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  CircleHelp,
  CreditCard,
  FileText,
  Heart,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  X,
} from "lucide-react";
import logo from "../assets/logo.png";

const Footer = () => {
  const [popup, setPopup] = useState(null);

  const submitNewsletter = (event) => {
    event.preventDefault();
    const email = event.currentTarget.elements.newsletterEmail.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid) {
      setPopup({ type: "error", title: "Email chưa hợp lệ", message: "Nhập email hợp lệ để nhận ưu đãi mới từ Dealzy." });
      return;
    }

    event.currentTarget.reset();
    setPopup({ type: "success", title: "Đã đăng ký", message: "Dealzy sẽ gửi những voucher đáng giá nhất đến hộp thư của bạn." });
  };

  return (
    <footer className="lux-footer">
      <section className="lux-footer__newsletter">
        <div className="container">
          <span className="lux-eyebrow"><Sparkles size={14} /> Members first</span>
          <h2>Nhận ưu đãi chọn lọc trước khi mở bán công khai.</h2>
          <form onSubmit={submitNewsletter} noValidate>
            <input name="newsletterEmail" type="email" placeholder="Email của bạn" aria-label="Email của bạn" />
            <button type="submit">Đăng ký</button>
          </form>
          <div className="lux-footer__badges">
            <span><ShieldCheck size={15} /> Bảo mật</span>
            <span><BadgeCheck size={15} /> Đối tác xác thực</span>
            <span><TicketPercent size={15} /> Deal độc quyền</span>
          </div>
        </div>
      </section>

      <div className="container lux-footer__main">
        <div className="lux-footer__brand">
          <Link to="/" className="lux-footer__logo">
            <img src={logo} alt="" />
            <span>
              <strong>Dealzy</strong>
              <small>Premium voucher marketplace</small>
            </span>
          </Link>
          <p>
            Nền tảng voucher cho các trải nghiệm ăn uống, du lịch, làm đẹp và giải trí được chọn lọc. Tập trung vào sự rõ ràng, tin cậy và cảm giác mua hàng cao cấp.
          </p>
        </div>

        <nav className="lux-footer__column">
          <h3>Sản phẩm</h3>
          <Link to="/search">Tất cả voucher</Link>
          <Link to="/search?sort=new">Deal mới</Link>
          <Link to="/search?sort=best-selling">Bán chạy</Link>
          <Link to="/partners">Đối tác</Link>
          <Link to="/register-partner">Hợp tác doanh nghiệp</Link>
        </nav>

        <nav className="lux-footer__column">
          <h3>Hỗ trợ</h3>
          <Link to="/support"><CircleHelp size={15} /> Trung tâm hỗ trợ</Link>
          <Link to="/guide"><FileText size={15} /> Hướng dẫn sử dụng</Link>
          <Link to="/refund-policy"><CreditCard size={15} /> Hoàn tiền</Link>
          <Link to="/terms">Điều khoản</Link>
        </nav>

        <div className="lux-footer__column">
          <h3>Liên hệ</h3>
          <a href="tel:19006760"><Phone size={15} /> 1900 6760</a>
          <a href="mailto:cs@dealzy.vn"><Mail size={15} /> cs@dealzy.vn</a>
          <span><Building2 size={15} /> Ho Chi Minh City</span>
        </div>
      </div>

      <div className="container lux-footer__bottom">
        <span>© {new Date().getFullYear()} Dealzy. Built for commerce teams.</span>
        <span>Made with <Heart size={13} fill="currentColor" /> in Vietnam</span>
      </div>

      {popup && (
        <div className="lux-newsletter-modal" onClick={() => setPopup(null)}>
          <div className="lux-newsletter-modal__dialog" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setPopup(null)} aria-label="Đóng"><X size={18} /></button>
            <div className={popup.type}>{popup.type === "success" ? <ShieldCheck size={28} /> : <CircleHelp size={28} />}</div>
            <h2>{popup.title}</h2>
            <p>{popup.message}</p>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;

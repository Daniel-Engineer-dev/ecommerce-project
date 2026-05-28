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
      setPopup({ type: "error", title: "Email chua hop le", message: "Nhap email hop le de nhan uu dai moi tu Dealzy." });
      return;
    }

    event.currentTarget.reset();
    setPopup({ type: "success", title: "Da dang ky", message: "Dealzy se gui nhung voucher dang gia nhat den hop thu cua ban." });
  };

  return (
    <footer className="lux-footer">
      <section className="lux-footer__newsletter">
        <div className="container">
          <span className="lux-eyebrow"><Sparkles size={14} /> Members first</span>
          <h2>Nhan uu dai chon loc truoc khi mo ban cong khai.</h2>
          <form onSubmit={submitNewsletter} noValidate>
            <input name="newsletterEmail" type="email" placeholder="Email cua ban" aria-label="Email cua ban" />
            <button type="submit">Dang ky</button>
          </form>
          <div className="lux-footer__badges">
            <span><ShieldCheck size={15} /> Bao mat</span>
            <span><BadgeCheck size={15} /> Doi tac xac thuc</span>
            <span><TicketPercent size={15} /> Deal doc quyen</span>
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
            Nen tang voucher cho cac trai nghiem an uong, du lich, lam dep va giai tri duoc chon loc. Tap trung vao su ro rang, tin cay va cam giac mua hang cao cap.
          </p>
        </div>

        <nav className="lux-footer__column">
          <h3>San pham</h3>
          <Link to="/search">Tat ca voucher</Link>
          <Link to="/search?sort=new">Deal moi</Link>
          <Link to="/partners">Doi tac</Link>
          <Link to="/register-partner">Hop tac doanh nghiep</Link>
        </nav>

        <nav className="lux-footer__column">
          <h3>Ho tro</h3>
          <Link to="/support"><CircleHelp size={15} /> Trung tam ho tro</Link>
          <Link to="/guide"><FileText size={15} /> Huong dan su dung</Link>
          <Link to="/refund-policy"><CreditCard size={15} /> Hoan tien</Link>
          <Link to="/terms">Dieu khoan</Link>
        </nav>

        <div className="lux-footer__column">
          <h3>Lien he</h3>
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
            <button type="button" onClick={() => setPopup(null)} aria-label="Dong"><X size={18} /></button>
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

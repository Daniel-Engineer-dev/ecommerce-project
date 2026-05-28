import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";

const portalUrl = (port, path = "/") => {
  if (typeof window === "undefined") return path;
  return `${window.location.protocol}//${window.location.hostname}:${port}${path}`;
};

const accessCards = [
  {
    title: "Khách hàng",
    subtitle: "Mua voucher, quản lý đơn hàng và nhận mã điện tử.",
    icon: ShoppingBag,
    tone: "#047857",
    action: "Vào website mua hàng",
    to: "/",
    meta: "dealzy.vn",
  },
  {
    title: "Đối tác",
    subtitle: "Tạo voucher, quản lý chi nhánh và xác thực mã sử dụng.",
    icon: Store,
    tone: "#7c3aed",
    action: "Mở Partner Portal",
    href: portalUrl(5174, "/"),
    meta: "partner.dealzy.vn",
  },
  {
    title: "Quản trị nội bộ",
    subtitle: "Duyệt đối tác, kiểm soát đơn hàng, nội dung và nhật ký hệ thống.",
    icon: LockKeyhole,
    tone: "#1d4ed8",
    action: "Mở Admin Console",
    href: portalUrl(5175, "/login"),
    meta: "admin.dealzy.vn",
  },
];

const AccessPortal = () => {
  return (
    <main style={{ minHeight: "100vh", paddingTop: "170px", background: "#f6f7f5" }}>
      <section className="container" style={{ paddingBottom: "4rem" }}>
        <div className="access-portal__grid">
          <div>
            <span className="lux-eyebrow">
              <KeyRound size={14} /> Dealzy Access
            </span>
            <h1
              style={{
                fontSize: "clamp(2.5rem, 7vw, 5.4rem)",
                lineHeight: 0.95,
                color: "var(--lux-navy)",
                margin: "0.65rem 0 1rem",
                letterSpacing: 0,
              }}
            >
              Một hệ thống, ba cổng truy cập rõ ràng.
            </h1>
            <p style={{ color: "#5f6f82", fontWeight: 650, fontSize: "1.02rem", lineHeight: 1.8, maxWidth: "620px" }}>
              Khách hàng, đối tác và quản trị viên có nghiệp vụ khác nhau nên được tách thành các portal riêng. Cổng này giúp demo và vận hành dễ định hướng hơn.
            </p>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", marginTop: "1.4rem" }}>
              <span style={pillStyle}><BadgeCheck size={15} /> Phân vai rõ</span>
              <span style={pillStyle}><ShieldCheck size={15} /> Admin nội bộ</span>
              <span style={pillStyle}><Building2 size={15} /> Đối tác tách riêng</span>
            </div>
          </div>

          <div style={{ display: "grid", gap: "0.9rem" }}>
            {accessCards.map((card) => {
              const Icon = card.icon;
              const content = (
                <>
                  <span
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      display: "grid",
                      placeItems: "center",
                      color: "#ffffff",
                      background: card.tone,
                      boxShadow: `0 14px 28px ${card.tone}33`,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={24} />
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <small style={{ display: "block", color: "#7a8797", fontWeight: 900, marginBottom: 3 }}>{card.meta}</small>
                    <strong style={{ display: "block", color: "var(--lux-navy)", fontSize: "1.15rem", marginBottom: 4 }}>{card.title}</strong>
                    <span style={{ display: "block", color: "#667085", fontWeight: 600, lineHeight: 1.5 }}>{card.subtitle}</span>
                  </span>
                  <span style={{ color: card.tone, fontWeight: 950, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                    {card.action} <ArrowRight size={17} />
                  </span>
                </>
              );

              const commonStyle = {
                minHeight: 118,
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                borderRadius: 8,
                border: "1px solid #e4ded4",
                background: "#ffffff",
                textDecoration: "none",
                boxShadow: "0 18px 42px rgba(15, 23, 42, 0.06)",
              };

              return card.to ? (
                <Link key={card.title} to={card.to} style={commonStyle}>
                  {content}
                </Link>
              ) : (
                <a key={card.title} href={card.href} style={commonStyle}>
                  {content}
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};

const pillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  minHeight: 36,
  padding: "0 0.85rem",
  borderRadius: 999,
  background: "#ffffff",
  border: "1px solid #e4ded4",
  color: "#0f2742",
  fontWeight: 900,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
};

export default AccessPortal;

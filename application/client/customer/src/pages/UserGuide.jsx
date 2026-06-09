import React from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  CircleHelp,
  CreditCard,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingCart,
  TicketCheck,
  UserRound,
} from "lucide-react";
import { usePublicContent } from "../hooks/usePublicContent";
import HiddenContentNotice from "../components/HiddenContentNotice";

const iconMap = {
  BadgeCheck,
  CircleHelp,
  CreditCard,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingCart,
  TicketCheck,
  UserRound,
};

const slugify = (value) =>
  String(value || "").toLowerCase().replace(/\s+/g, "-");

const UserGuide = () => {
  const { data, hidden } = usePublicContent("user-guide");
  const hero = data.hero || {};
  const roadmap = data.roadmap || [];
  const quickTips = data.quickTips || [];
  const cta = data.cta || {};

  if (hidden) return <HiddenContentNotice />;

  return (
    <main className="static-page">
      <section className="static-hero">
        <div className="static-hero__badge">
          <TicketCheck size={16} />
          {hero.badge}
        </div>
        <h1>{hero.title}</h1>
        <p>{hero.description}</p>
      </section>

      <section className="container static-section">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          <aside
            style={{
              position: "sticky",
              top: "190px",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "1.25rem",
              boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
            }}
          >
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                marginBottom: "1rem",
                color: "#0f172a",
              }}
            >
              Tổng quan lộ trình
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {roadmap.map((item) => {
                const Icon = iconMap[item.icon] || BadgeCheck;
                return (
                  <a
                    key={item.phase}
                    href={`#${slugify(item.phase)}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.65rem",
                      padding: "0.65rem",
                      borderRadius: "6px",
                      color: "#334155",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: "0.86rem",
                      background: "#f8fafc",
                    }}
                  >
                    <Icon size={16} color="var(--primary)" />
                    {item.phase}
                  </a>
                );
              })}
            </div>
          </aside>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "27px",
                top: "24px",
                bottom: "24px",
                width: "2px",
                background: "var(--border-color)",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {roadmap.map((item) => {
                const Icon = iconMap[item.icon] || BadgeCheck;
                return (
                  <article
                    id={slugify(item.phase)}
                    key={item.phase}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "56px 1fr",
                      gap: "1.25rem",
                      scrollMarginTop: "190px",
                    }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "var(--primary)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "var(--shadow-sm)",
                        zIndex: 1,
                      }}
                    >
                      <Icon size={24} />
                    </div>

                    <div
                      style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "1.5rem",
                        boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
                      }}
                    >
                      <span style={{ color: "var(--primary)", fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase" }}>
                        {item.phase}
                      </span>
                      <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0.35rem 0 0.75rem", color: "#0f172a" }}>
                        {item.title}
                      </h2>
                      <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: "1rem" }}>{item.text}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
                        {(item.checklist || []).map((entry) => (
                          <div
                            key={entry}
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              alignItems: "flex-start",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              padding: "0.75rem",
                              color: "#334155",
                              fontSize: "0.88rem",
                              lineHeight: 1.45,
                            }}
                          >
                            <BadgeCheck size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
                            {entry}
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="container static-section">
        <div className="static-card-grid">
          {quickTips.map(({ icon, title, text }) => {
            const Icon = iconMap[icon] || CircleHelp;
            return (
              <article className="static-card" key={title}>
                <Icon size={24} />
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container static-section static-panel">
        <div>
          <h2>{cta.title}</h2>
          <p>{cta.description}</p>
        </div>
        <Link className="static-action" to={cta.buttonUrl || "/support"}>
          {cta.buttonText}
        </Link>
      </section>
    </main>
  );
};

export default UserGuide;

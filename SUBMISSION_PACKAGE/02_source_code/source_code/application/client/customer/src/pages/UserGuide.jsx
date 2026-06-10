import React, { useEffect, useMemo, useState } from "react";
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
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const UserGuide = () => {
  const { data, hidden } = usePublicContent("user-guide");
  const hero = data.hero || {};
  const roadmap = data.roadmap || [];
  const quickTips = data.quickTips || [];
  const cta = data.cta || {};
  const roadmapIds = useMemo(() => roadmap.map((item) => slugify(item.phase)), [roadmap]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const readHash = () => {
      const nextHash = decodeURIComponent(window.location.hash.replace("#", ""));
      setActiveId(nextHash || roadmapIds[0] || "");
    };

    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [roadmapIds]);

  useEffect(() => {
    if (!roadmapIds.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      {
        rootMargin: "-34% 0px -48% 0px",
        threshold: [0.2, 0.45, 0.7],
      },
    );

    roadmapIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [roadmapIds]);

  if (hidden) return <HiddenContentNotice />;

  return (
    <main className="static-page guide-page">
      <section className="static-hero guide-hero">
        <div className="static-hero__badge">
          <TicketCheck size={16} />
          {hero.badge}
        </div>
        <h1>{hero.title}</h1>
        <p>{hero.description}</p>
      </section>

      <section className="container static-section">
        <div className="guide-layout">
          <aside className="guide-overview" aria-label="Tổng quan lộ trình">
            <div className="guide-overview__eyebrow">Lộ trình sử dụng</div>
            <h2>Tổng quan lộ trình</h2>
            <div className="guide-overview__list">
              {roadmap.map((item) => {
                const Icon = iconMap[item.icon] || BadgeCheck;
                const itemId = slugify(item.phase);
                const isActive = activeId === itemId;

                return (
                  <a
                    key={item.phase}
                    href={`#${itemId}`}
                    className={`guide-overview__link${isActive ? " is-active" : ""}`}
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => setActiveId(itemId)}
                  >
                    <span className="guide-overview__icon">
                      <Icon size={17} />
                    </span>
                    <span className="guide-overview__copy">
                      <span className="guide-overview__phase">{item.phase}</span>
                      <span className="guide-overview__title">{item.title}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </aside>

          <div className="guide-roadmap">
            <div className="guide-roadmap__line" />
            <div className="guide-roadmap__stack">
              {roadmap.map((item) => {
                const Icon = iconMap[item.icon] || BadgeCheck;
                const itemId = slugify(item.phase);
                const isActive = activeId === itemId;

                return (
                  <article
                    id={itemId}
                    key={item.phase}
                    className={`guide-step${isActive ? " is-active" : ""}`}
                  >
                    <div className="guide-step__marker">
                      <Icon size={24} />
                    </div>

                    <div className="guide-step__card">
                      <span className="guide-step__phase">{item.phase}</span>
                      <h2>{item.title}</h2>
                      <p>{item.text}</p>
                      <div className="guide-checklist">
                        {(item.checklist || []).map((entry) => (
                          <div className="guide-checklist__item" key={entry}>
                            <BadgeCheck size={16} />
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
        <div className="static-card-grid guide-tip-grid">
          {quickTips.map(({ icon, title, text }) => {
            const Icon = iconMap[icon] || CircleHelp;
            return (
              <article className="static-card guide-tip-card" key={title}>
                <Icon size={24} />
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container static-section static-panel guide-cta-panel">
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

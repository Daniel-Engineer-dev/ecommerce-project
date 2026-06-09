import React from "react";
import { Link } from "react-router-dom";
import {
  CircleHelp,
  Mail,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
} from "lucide-react";
import { usePublicContent } from "../hooks/usePublicContent";
import HiddenContentNotice from "../components/HiddenContentNotice";

const iconMap = { Search, ShieldCheck, MessageCircle, CircleHelp };

const Support = () => {
  const { data, hidden } = usePublicContent("support-center");
  const hero = data.hero || {};
  const contact = data.contact || {};

  if (hidden) return <HiddenContentNotice />;

  return (
    <main className="static-page">
      <section className="static-hero">
        <div className="static-hero__badge">
          <CircleHelp size={16} />
          {hero.badge}
        </div>
        <h1>{hero.title}</h1>
        <p>{hero.description}</p>
      </section>

      <section className="container static-section">
        <div className="static-card-grid">
          {(data.cards || []).map(({ icon, title, text }) => {
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
          <h2>{contact.title}</h2>
          <p>{contact.description}</p>
        </div>
        <div className="static-contact-list">
          <a href={`tel:${String(contact.phone || "").replace(/\s/g, "")}`}>
            <Phone size={18} />
            {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`}>
            <Mail size={18} />
            {contact.email}
          </a>
          <Link to="/guide">
            <CircleHelp size={18} />
            {contact.guideLinkText}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Support;

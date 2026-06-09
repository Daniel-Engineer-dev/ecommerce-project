import React from "react";
import { usePublicContent } from "../hooks/usePublicContent";
import HiddenContentNotice from "../components/HiddenContentNotice";

const TermsOfService = () => {
  const { data, hidden } = usePublicContent("terms-of-service");
  const hero = data.hero || {};

  if (hidden) return <HiddenContentNotice />;

  return (
    <main className="static-page">
      <section className="static-hero">
        <div className="static-hero__badge">{hero.badge}</div>
        <h1>{hero.title}</h1>
        <p>{hero.description}</p>
      </section>

      <section className="container static-section static-content">
        {(data.sections || []).map((section) => (
          <React.Fragment key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </React.Fragment>
        ))}
      </section>
    </main>
  );
};

export default TermsOfService;

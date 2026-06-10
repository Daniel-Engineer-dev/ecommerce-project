import React from "react";
import { Lock } from "lucide-react";

const HiddenContentNotice = () => (
  <main className="static-page">
    <section className="container static-section">
      <div
        style={{
          minHeight: "360px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "24px",
            padding: "3rem",
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
            maxWidth: "560px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#f1f5f9",
              color: "#1a3a5c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <Lock size={26} />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "#0f172a",
              marginBottom: "0.75rem",
            }}
          >
            Nội dung đã bị quản trị viên tạm ẩn
          </h1>
        </div>
      </div>
    </section>
  </main>
);

export default HiddenContentNotice;

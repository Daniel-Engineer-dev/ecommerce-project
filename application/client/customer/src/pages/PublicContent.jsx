import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../config";

const typeLabels = {
  banner: "Banner",
  blog: "Tin tức",
  faq: "FAQ",
  policy: "Chính sách",
  promotion: "Ưu đãi",
  guide: "Hướng dẫn",
  announcement: "Thông báo",
  page: "Trang",
};

const PublicContent = () => {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const type = searchParams.get("type") || "";

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (type) params.set("type", type);
        const suffix = params.toString() ? `?${params.toString()}` : "";
        const res = await fetch(`${API_BASE_URL}/api/content/public${suffix}`);
        const data = await res.json();
        if (res.ok) {
          setItems(data.items || []);
        } else {
          setError(data.error || "Không thể tải nội dung.");
        }
      } catch (err) {
        setError("Không thể kết nối tới server.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [type]);

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "120px 0 80px" }}>
      <div className="container" style={{ maxWidth: "1100px" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase", fontSize: "0.78rem" }}>
            Dealzy
          </p>
          <h1 style={{ color: "#0f172a", fontSize: "2.25rem", fontWeight: 900, margin: "0.25rem 0" }}>
            Nội dung & thông báo
          </h1>
        </div>

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#64748b" }}>
            <RefreshCw size={18} className="animate-spin" />
            Đang tải nội dung...
          </div>
        )}

        {!loading && error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "1rem", borderRadius: "12px" }}>
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "3rem", textAlign: "center" }}>
            <FileText size={32} color="#94a3b8" style={{ marginBottom: "1rem" }} />
            <p style={{ color: "#64748b", fontWeight: 700 }}>Chưa có nội dung phù hợp.</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          {items.map((item) => (
            <Link
              key={item.content_id}
              to={`/content/${item.slug || item.content_key}`}
              style={{
                display: "block",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "1.25rem",
                textDecoration: "none",
                color: "inherit",
                minHeight: "170px",
              }}
            >
              <span style={{ color: "#0f4c81", fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase" }}>
                {typeLabels[item.type] || item.type}
              </span>
              <h2 style={{ color: "#0f172a", fontSize: "1.15rem", fontWeight: 900, margin: "0.65rem 0" }}>
                {item.title}
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                {item.summary || (item.body || "").replace(/<[^>]+>/g, "").slice(0, 140)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default PublicContent;

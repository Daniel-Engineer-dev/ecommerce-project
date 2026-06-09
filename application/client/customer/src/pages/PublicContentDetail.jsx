import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../config";

const PublicContentDetail = () => {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/content/public/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (res.ok) {
          setItem(data.item);
        } else {
          setError(data.error || "Không tìm thấy nội dung.");
        }
      } catch (err) {
        setError("Không thể kết nối tới server.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug]);

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "120px 0 80px" }}>
      <article className="container" style={{ maxWidth: "860px" }}>
        <Link
          to="/content"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#0f4c81",
            fontWeight: 800,
            textDecoration: "none",
            marginBottom: "1.5rem",
          }}
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

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

        {!loading && item && (
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "2rem" }}>
            <p style={{ color: "#0f4c81", fontWeight: 900, textTransform: "uppercase", fontSize: "0.78rem" }}>
              {item.type}
            </p>
            <h1 style={{ color: "#0f172a", fontSize: "2rem", fontWeight: 900, margin: "0.5rem 0 1rem" }}>
              {item.title}
            </h1>
            {item.summary && (
              <p style={{ color: "#475569", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                {item.summary}
              </p>
            )}
            <div
              style={{ color: "#334155", lineHeight: 1.8, fontSize: "1rem", whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: item.body || "" }}
            />
          </div>
        )}
      </article>
    </main>
  );
};

export default PublicContentDetail;

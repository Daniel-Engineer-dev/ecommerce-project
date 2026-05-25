import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Info,
  ShieldCheck,
  ShoppingCart,
  CreditCard,
  Tag,
  Building2,
  ChevronLeft,
  Share2,
  Heart,
  Clock,
  Store,
  Star,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Minus,
  Plus,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { API_BASE_URL, translateCategory } from "../config";

const VoucherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_BASE_URL}/api/vouchers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải thông tin voucher");
        return res.json();
      })
      .then((data) => {
        setVoucher(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div
        style={{ paddingTop: "180px", textAlign: "center", height: "100vh" }}
      >
        <div className="loader" style={{ margin: "0 auto 1rem" }}></div>
        <p style={{ color: "#64748b" }}>Đang tải thông tin chi tiết...</p>
      </div>
    );

  if (error || !voucher)
    return (
      <div
        style={{ paddingTop: "180px", textAlign: "center", height: "100vh" }}
      >
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Oops! 😅</h2>
        <p style={{ color: "#64748b" }}>
          {error || "Không tìm thấy voucher này"}
        </p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary"
          style={{ marginTop: "2rem" }}
        >
          Quay lại trang chủ
        </button>
      </div>
    );

  const discountPercent = Math.round(
    ((voucher.original_price - voucher.sale_price) / voucher.original_price) *
      100,
  );

  // Mock image gallery - sử dụng cùng 1 ảnh nhưng hiển thị như gallery
  const images = [voucher.image_url, voucher.image_url, voucher.image_url];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(voucher);
    }
    setQuantity(1);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  const handleImageNext = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleImagePrev = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      style={{
        paddingTop: "180px",
        paddingBottom: "100px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div className="container">
        {/* Breadcrumb & Quick Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "none",
              border: "none",
              color: "#64748b",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} /> Quay lại
          </button>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="glass-effect"
              style={{
                padding: "0.6rem",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
              }}
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="glass-effect"
              style={{
                padding: "0.6rem",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
              }}
            >
              <Heart
                size={20}
                fill={isLiked ? "#ef4444" : "none"}
                color={isLiked ? "#ef4444" : "#64748b"}
              />
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            alignItems: "start",
          }}
        >
          {/* LEFT: IMAGE GALLERY */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Main Image with Controls */}
            <div
              style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                background: "white",
              }}
            >
              <img
                src={images[activeImageIndex]}
                alt={voucher.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80";
                }}
                style={{ width: "100%", height: "500px", objectFit: "cover" }}
              />

              {/* Discount Badge */}
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  background: "#ef4444",
                  color: "white",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                }}
              >
                -{discountPercent}% OFF
              </div>

              {/* Image Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handleImagePrev}
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ChevronLeftIcon size={20} />
                  </button>
                  <button
                    onClick={handleImageNext}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ChevronRightIcon size={20} />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div
                style={{
                  position: "absolute",
                  bottom: "15px",
                  right: "15px",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.75rem",
                }}
              >
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      aspect: "1/1",
                      borderRadius: "12px",
                      border:
                        idx === activeImageIndex
                          ? "3px solid var(--primary)"
                          : "1px solid #e2e8f0",
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "white",
                      padding: 0,
                    }}
                  >
                    <img
                      src={img}
                      alt={`thumbnail ${idx}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRICING & ACTION */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Main Info Card */}
            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              {/* Category */}
              <span
                style={{
                  background: "rgba(37,99,235,0.1)",
                  color: "var(--primary)",
                  padding: "0.3rem 0.7rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "inline-block",
                  marginBottom: "0.8rem",
                }}
              >
                {translateCategory(voucher.category_name)}
              </span>

              {/* Title */}
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  marginBottom: "1rem",
                  lineHeight: 1.3,
                }}
              >
                {voucher.title}
              </h1>

              {/* Rating & Shop Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2rem",
                  marginBottom: "1.5rem",
                  paddingBottom: "1.5rem",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex" }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="#facc15" color="#facc15" />
                    ))}
                  </div>
                  <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                    {voucher.average_rating} ({voucher.reviews?.length || 0}{" "}
                    đánh giá)
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#64748b",
                    fontSize: "0.9rem",
                  }}
                >
                  <Store size={16} /> {voucher.company_name}
                </div>
              </div>

              {/* Price Section - Shopee Style */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "2rem",
                      fontWeight: 900,
                      color: "#ef4444",
                    }}
                  >
                    {Number(voucher.sale_price).toLocaleString()}đ
                  </span>
                  <span
                    style={{
                      fontSize: "1rem",
                      color: "#94a3b8",
                      textDecoration: "line-through",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {Number(voucher.original_price).toLocaleString()}đ
                  </span>
                  <span
                    style={{
                      background: "#ffebee",
                      color: "#d32f2f",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      marginBottom: "0.3rem",
                    }}
                  >
                    -{discountPercent}%
                  </span>
                </div>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Tiết kiệm{" "}
                  {Number(
                    voucher.original_price - voucher.sale_price,
                  ).toLocaleString()}
                  đ
                </p>
              </div>

              {/* Info Details */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  marginBottom: "2rem",
                  padding: "1.5rem",
                  background: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#64748b", fontSize: "0.95rem" }}>
                    Hạn sử dụng:
                  </span>
                  <b style={{ color: "#1e293b", fontWeight: 600 }}>
                    {new Date(voucher.expiry_date).toLocaleDateString("vi-VN")}
                  </b>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#64748b", fontSize: "0.95rem" }}>
                    Kho hàng:
                  </span>
                  <b style={{ color: "#1e293b", fontWeight: 600 }}>
                    {voucher.quantity_stock} sản phẩm
                  </b>
                </div>
              </div>

              {/* Quantity Selector */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                <span
                  style={{
                    color: "#64748b",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                >
                  Số lượng:
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    width: "fit-content",
                  }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0.5rem",
                      cursor: "pointer",
                      color: "#64748b",
                    }}
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={voucher.quantity_stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          1,
                          Math.min(
                            voucher.quantity_stock,
                            parseInt(e.target.value) || 1,
                          ),
                        ),
                      )
                    }
                    style={{
                      width: "50px",
                      textAlign: "center",
                      border: "none",
                      padding: "0.5rem",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  />
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(voucher.quantity_stock, quantity + 1),
                      )
                    }
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0.5rem",
                      cursor: "pointer",
                      color: "#64748b",
                    }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    height: "50px",
                    borderRadius: "8px",
                    border: "2px solid var(--primary)",
                    background: "white",
                    color: "var(--primary)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(37,99,235,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <ShoppingCart size={20} /> Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  style={{
                    flex: 1,
                    height: "50px",
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--primary)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(37,99,235,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(37,99,235,0.3)";
                  }}
                >
                  Mua ngay
                </button>
              </div>
            </div>

            {/* Location Card */}
            {voucher.branches && voucher.branches.length > 0 && (
              <div
                style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <MapPin size={18} color="#ef4444" /> Địa điểm áp dụng
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {voucher.branches.slice(0, 3).map((branch) => (
                    <div key={branch.branch_id} style={{ fontSize: "0.9rem" }}>
                      <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                        {branch.branch_name}
                      </p>
                      <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                        {branch.address}
                      </p>
                    </div>
                  ))}
                  {voucher.branches.length > 3 && (
                    <p
                      style={{
                        color: "#2563eb",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      +{voucher.branches.length - 3} địa điểm khác
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT TABS */}
        <div style={{ marginTop: "3rem" }}>
          <div
            style={{
              display: "flex",
              gap: "2rem",
              borderBottom: "2px solid #e2e8f0",
              marginBottom: "2rem",
            }}
          >
            {[
              { id: "description", label: "Mô tả chi tiết" },
              { id: "terms", label: "Điều kiện áp dụng" },
              { id: "reviews", label: "Đánh giá" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "0.75rem 0",
                  border: "none",
                  background: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: activeTab === tab.id ? "var(--primary)" : "#64748b",
                  cursor: "pointer",
                  borderBottom:
                    activeTab === tab.id ? "3px solid var(--primary)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "description" && (
              <div
                style={{
                  background: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    color: "#475569",
                    lineHeight: 1.8,
                    fontSize: "1rem",
                    whiteSpace: "pre-line",
                  }}
                >
                  {voucher.description || "Đang cập nhật nội dung chi tiết..."}
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div
                style={{
                  background: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    color: "#475569",
                    lineHeight: 1.8,
                    fontSize: "1rem",
                    whiteSpace: "pre-line",
                  }}
                >
                  {voucher.terms_and_conditions || (
                    <>
                      <h3 style={{ marginBottom: "1rem", fontWeight: 700 }}>
                        Điều kiện áp dụng:
                      </h3>
                      <ul style={{ paddingLeft: "1.5rem" }}>
                        <li>Mỗi khách hàng được mua tối đa 5 voucher.</li>
                        <li>Vui lòng đặt chỗ trước ít nhất 24h.</li>
                        <li>
                          Không áp dụng cùng các chương trình khuyến mãi khác.
                        </li>
                      </ul>
                      <h3
                        style={{
                          marginTop: "1.5rem",
                          marginBottom: "1rem",
                          fontWeight: 700,
                        }}
                      >
                        Chính sách hoàn hủy:
                      </h3>
                      <p>
                        {voucher.cancellation_policy ||
                          "Voucher không được hoàn trả sau khi đã mua. Trường hợp cửa hàng ngừng phục vụ, khách hàng sẽ được hoàn tiền vào ví Dealzy trong vòng 48h."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div
                style={{
                  background: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                {voucher.reviews && voucher.reviews.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    {voucher.reviews.map((rev) => (
                      <div
                        key={rev.review_id}
                        style={{
                          paddingBottom: "1.5rem",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <div>
                            <b style={{ fontSize: "1rem" }}>{rev.full_name}</b>
                            <div
                              style={{
                                display: "flex",
                                gap: "2px",
                                marginTop: "0.3rem",
                              }}
                            >
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={i < rev.rating ? "#facc15" : "none"}
                                  color={i < rev.rating ? "#facc15" : "#cbd5e1"}
                                />
                              ))}
                            </div>
                          </div>
                          <small
                            style={{ color: "#94a3b8", fontSize: "0.85rem" }}
                          >
                            {new Date(rev.created_at).toLocaleDateString(
                              "vi-VN",
                            )}
                          </small>
                        </div>
                        <p
                          style={{
                            color: "#475569",
                            fontSize: "0.95rem",
                            lineHeight: 1.5,
                          }}
                        >
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      color: "#94a3b8",
                      textAlign: "center",
                      fontSize: "1rem",
                    }}
                  >
                    Chưa có đánh giá nào
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherDetail;

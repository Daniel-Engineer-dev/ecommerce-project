import { useState } from "react";
import { Eye, ShoppingCart, User, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const fallbackImage =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80";

const VoucherCard = ({ voucher }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);
  const [flyItem, setFlyItem] = useState(null);

  const animateToCart = (startRect) => {
    const cartTarget = document.getElementById("cart-target");
    const targetRect = cartTarget?.getBoundingClientRect();
    const width = 72;
    const height = 72;

    const fromX = startRect.left + startRect.width / 2 - width / 2;
    const fromY = startRect.top + startRect.height / 2 - height / 2;
    const toX =
      (targetRect?.left ?? window.innerWidth - 80) +
      (targetRect?.width ?? 0) / 2 -
      width / 2;
    const toY =
      (targetRect?.top ?? 24) + (targetRect?.height ?? 0) / 2 - height / 2;

    setFlyItem({
      id: `${voucher.voucher_id}-${Date.now()}`,
      image: voucher.image_url,
      fromX,
      fromY,
      toX,
      toY,
      width,
      height,
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const buttonRect = e.currentTarget.getBoundingClientRect();
    animateToCart(buttonRect);
    addToCart(voucher);
  };

  const handleCardClick = () => {
    navigate(`/voucher/${voucher.voucher_id}`);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleDetailClick = (e) => {
    e.stopPropagation();
    navigate(`/voucher/${voucher.voucher_id}`);
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = fallbackImage;
  };

  return (
    <>
      <motion.div
        onClick={handleCardClick}
        className="product-card voucher-card"
        style={{ cursor: "pointer", position: "relative" }}
      >
        <div
          style={{ position: "relative", height: "200px", overflow: "hidden" }}
        >
          <img
            src={voucher.image_url}
            alt={voucher.title}
            onError={handleImageError}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div className="hot-badge">HOT</div>
          <div className="voucher-card__overlay">
            <button type="button" onClick={handleQuickView}>
              <Eye size={17} />
              Xem nhanh
            </button>
            <button type="button" onClick={handleDetailClick}>
              Xem chi tiết
            </button>
          </div>
          <div className="voucher-card__type">E-Voucher</div>
        </div>

        <div
          style={{
            padding: "1rem",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3 className="voucher-card__title">{voucher.title}</h3>

          <div style={{ marginTop: "auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <span className="price-red">
                {Number(voucher.sale_price).toLocaleString("vi-VN")}đ
              </span>
              <span className="discount-tag">-{voucher.discount_percent}%</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span className="price-old">
                {Number(voucher.original_price).toLocaleString("vi-VN")}đ
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "var(--text-muted)",
                  fontSize: "0.75rem",
                }}
              >
                <User size={12} /> <span>7,347</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="voucher-card__cart"
          onClick={handleAddToCart}
          aria-label="Thêm vào giỏ hàng"
        >
          <ShoppingCart size={18} />
        </button>
      </motion.div>

      {flyItem && (
        <motion.div
          key={flyItem.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            left: flyItem.fromX,
            top: flyItem.fromY,
            width: flyItem.width,
            height: flyItem.height,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <motion.img
            src={
              flyItem.image ||
              "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80"
            }
            alt="fly-to-cart"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "18px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
            }}
            animate={{
              x: flyItem.toX - flyItem.fromX,
              y: flyItem.toY - flyItem.fromY,
              scale: 0.35,
              opacity: 0.35,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onAnimationComplete={() => setFlyItem(null)}
          />
        </motion.div>
      )}
      <AnimatePresence>
        {showQuickView && (
          <motion.div
            className="quick-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              className="quick-view__dialog"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="quick-view__close"
                onClick={() => setShowQuickView(false)}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
              <img
                src={voucher.image_url}
                alt={voucher.title}
                onError={handleImageError}
              />
              <div className="quick-view__content">
                <span className="quick-view__merchant">
                  {voucher.company_name || "Dealzy Partner"}
                </span>
                <h2>{voucher.title}</h2>
                <p>
                  {voucher.description ||
                    "Voucher ưu đãi đang được phát hành trên Dealzy."}
                </p>
                <div className="quick-view__meta">
                  <span>{voucher.category_name || "Voucher"}</span>
                  <span>Giảm {voucher.discount_percent}%</span>
                </div>
                <div className="quick-view__price">
                  <strong>
                    {Number(voucher.sale_price).toLocaleString("vi-VN")}đ
                  </strong>
                  <span>
                    {Number(voucher.original_price).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="quick-view__actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart size={18} />
                    Thêm vào giỏ hàng
                  </button>
                  <button type="button" onClick={handleDetailClick}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoucherCard;

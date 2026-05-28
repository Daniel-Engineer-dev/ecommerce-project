import { useState } from "react";
import { ArrowRight, Eye, MapPin, ShoppingCart, TicketPercent, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const fallbackImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=82";

const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const VoucherCard = ({ voucher }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);
  const [flyItem, setFlyItem] = useState(null);

  const animateToCart = (startRect) => {
    const cartTarget = document.getElementById("cart-target");
    const targetRect = cartTarget?.getBoundingClientRect();
    const size = 70;

    setFlyItem({
      id: `${voucher.voucher_id}-${Date.now()}`,
      image: voucher.image_url || fallbackImage,
      fromX: startRect.left + startRect.width / 2 - size / 2,
      fromY: startRect.top + startRect.height / 2 - size / 2,
      toX: (targetRect?.left ?? window.innerWidth - 80) + (targetRect?.width ?? 0) / 2 - size / 2,
      toY: (targetRect?.top ?? 24) + (targetRect?.height ?? 0) / 2 - size / 2,
      size,
    });
  };

  const addVoucher = (event) => {
    event.stopPropagation();
    animateToCart(event.currentTarget.getBoundingClientRect());
    addToCart(voucher);
  };

  const goToDetail = () => navigate(`/voucher/${voucher.voucher_id}`);

  const imageError = (event) => {
    event.target.onerror = null;
    event.target.src = fallbackImage;
  };

  return (
    <>
      <motion.article className="lux-voucher-card" onClick={goToDetail} whileHover={{ y: -4 }}>
        <div className="lux-voucher-card__media">
          <img src={voucher.image_url || fallbackImage} alt={voucher.title} onError={imageError} />
          <span className="lux-voucher-card__badge"><TicketPercent size={13} /> -{voucher.discount_percent || 0}%</span>
          <button type="button" className="lux-voucher-card__quick" onClick={(event) => { event.stopPropagation(); setShowQuickView(true); }} aria-label="Xem nhanh">
            <Eye size={16} />
          </button>
        </div>

        <div className="lux-voucher-card__body">
          <div className="lux-voucher-card__merchant">
            <MapPin size={13} />
            {voucher.company_name || "Dealzy Partner"}
          </div>
          <h3>{voucher.title}</h3>
          <div className="lux-voucher-card__price">
            <strong>{formatMoney(voucher.sale_price)}</strong>
            <span>{formatMoney(voucher.original_price)}</span>
          </div>
          <div className="lux-voucher-card__footer">
            <small>{voucher.category_name || "E-voucher"}</small>
            <button type="button" onClick={addVoucher} aria-label="Thêm vào giỏ hàng">
              <ShoppingCart size={17} />
            </button>
          </div>
        </div>
      </motion.article>

      {flyItem && (
        <motion.img
          src={flyItem.image}
          alt=""
          className="lux-fly-item"
          style={{ left: flyItem.fromX, top: flyItem.fromY, width: flyItem.size, height: flyItem.size }}
          initial={{ opacity: 0.95, scale: 0.9 }}
          animate={{ x: flyItem.toX - flyItem.fromX, y: flyItem.toY - flyItem.fromY, scale: 0.25, opacity: 0 }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
          onAnimationComplete={() => setFlyItem(null)}
        />
      )}

      <AnimatePresence>
        {showQuickView && (
          <motion.div className="lux-quick-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQuickView(false)}>
            <motion.div className="lux-quick-view__dialog" initial={{ opacity: 0, y: 22, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 22, scale: 0.97 }} onClick={(event) => event.stopPropagation()}>
              <button type="button" className="lux-quick-view__close" onClick={() => setShowQuickView(false)} aria-label="Đóng">
                <X size={19} />
              </button>
              <img src={voucher.image_url || fallbackImage} alt={voucher.title} onError={imageError} />
              <div className="lux-quick-view__content">
                <span>{voucher.company_name || "Dealzy Partner"}</span>
                <h2>{voucher.title}</h2>
                <p>{voucher.description || "Voucher ưu đãi được Dealzy kiểm duyệt, sẵn sàng phát hành mã điện tử sau khi thanh toán thành công."}</p>
                <div className="lux-quick-view__price">
                  <strong>{formatMoney(voucher.sale_price)}</strong>
                  <small>{formatMoney(voucher.original_price)}</small>
                </div>
                <div className="lux-quick-view__actions">
                  <button type="button" className="lux-button lux-button--primary" onClick={addVoucher}>
                    <ShoppingCart size={18} /> Thêm vào giỏ
                  </button>
                  <button type="button" className="lux-button lux-button--ghost" onClick={goToDetail}>
                    Chi tiết <ArrowRight size={17} />
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

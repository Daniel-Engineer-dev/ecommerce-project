import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div style={{ paddingTop: '180px', paddingBottom: '80px', minHeight: '100vh', background: '#f8fafc' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Giỏ hàng của bạn <span style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 600 }}>({totalItems})</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Xem lại các voucher bạn đã chọn trước khi thanh toán.</p>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ width: '80px', height: '80px', background: 'var(--accent-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <ShoppingBag size={40} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Giỏ hàng đang trống</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Có vẻ như bạn chưa thêm voucher nào vào giỏ hàng.</p>
            <Link to="/">
              <button className="btn-primary" style={{ padding: '1rem 2rem' }}>
                Khám phá voucher ngay
              </button>
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
            {/* List Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.voucher_id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                    }}
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{item.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Hạn dùng: {new Date(item.expiry_date).toLocaleDateString('vi-VN')}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem' }}>{formatPrice(item.sale_price)}</span>
                        {item.original_price > item.sale_price && (
                          <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '0.9rem' }}>{formatPrice(item.original_price)}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
                        <button
                          onClick={() => updateQuantity(item.voucher_id, item.quantity - 1)}
                          style={{ border: 'none', background: 'none', padding: '4px', cursor: 'pointer', display: 'flex' }}
                        >
                          <Minus size={16} />
                        </button>
                        <span style={{ width: '30px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.voucher_id, item.quantity + 1)}
                          style={{ border: 'none', background: 'none', padding: '4px', cursor: 'pointer', display: 'flex' }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.voucher_id)}
                        style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div style={{ position: 'sticky', top: '180px', height: 'fit-content' }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Tổng đơn hàng</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Tạm tính ({totalItems} món)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Phí dịch vụ</span>
                    <span>Miễn phí</span>
                  </div>
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem' }}>
                    <span>Tổng cộng</span>
                    <span style={{ color: 'var(--primary)' }}>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%', height: '56px', fontSize: '1.1rem', gap: '0.5rem' }}
                >
                  Thanh toán ngay <ArrowRight size={20} />
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                  Bằng việc bấm thanh toán, bạn đồng ý với Điều khoản dịch vụ của Dealzy.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

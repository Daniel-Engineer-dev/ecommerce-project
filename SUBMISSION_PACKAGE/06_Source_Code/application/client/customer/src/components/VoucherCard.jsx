import { ShoppingCart, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const VoucherCard = ({ voucher }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(voucher);
  };

  const handleCardClick = () => {
    navigate(`/voucher/${voucher.voucher_id}`);
  };

  return (
    <motion.div 
      onClick={handleCardClick}
      className="product-card"
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img 
          src={voucher.image_url} 
          alt={voucher.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="hot-badge">HOT</div>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          E-Voucher
        </div>
      </div>

      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ 
          fontSize: '0.95rem', 
          marginBottom: '0.75rem', 
          fontWeight: 600, 
          lineHeight: '1.4', 
          height: '2.8rem', 
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {voucher.title}
        </h3>
        
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="price-red">{Number(voucher.sale_price).toLocaleString('vi-VN')}đ</span>
            <span className="discount-tag">-{voucher.discount_percent}%</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="price-old">{Number(voucher.original_price).toLocaleString('vi-VN')}đ</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <User size={12} /> <span>7,347</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VoucherCard;

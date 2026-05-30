import { Tag, Calendar, ShoppingCart, Plus } from 'lucide-react';
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
      whileHover={{ y: -8 }}
      onClick={handleCardClick}
      className="glass-effect"
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img 
          src={voucher.image_url} 
          alt={voucher.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'var(--secondary)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: 'full',
          fontSize: '0.8rem',
          fontWeight: 700,
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(219, 70, 239, 0.4)'
        }}>
          -{voucher.discount_percent}%
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Tag size={14} color="var(--primary)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
            {voucher.category_name}
          </span>
        </div>
        
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>{voucher.title}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', height: '40px', overflow: 'hidden' }}>
          {voucher.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span style={{ 
              display: 'block', 
              fontSize: '0.8rem', 
              color: 'var(--text-muted)', 
              textDecoration: 'line-through' 
            }}>
              {Number(voucher.original_price).toLocaleString('vi-VN')}đ
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {Number(voucher.sale_price).toLocaleString('vi-VN')}đ
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              border: 'none',
              borderRadius: '12px',
              padding: '0 1rem',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            <ShoppingCart size={18} />
            Thêm
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VoucherCard;

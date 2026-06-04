import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Info, ShieldCheck, ShoppingCart, 
  CreditCard, Tag, Building2, ChevronLeft, Share2, Heart, Clock, Store, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';

const VoucherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_BASE_URL}/api/vouchers/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Không thể tải thông tin voucher");
        return res.json();
      })
      .then(data => {
        setVoucher(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div style={{ paddingTop: '150px', textAlign: 'center', height: '100vh' }}>
      <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
      <p style={{ color: '#64748b' }}>Đang tải thông tin chi tiết...</p>
    </div>
  );

  if (error || !voucher) return (
    <div style={{ paddingTop: '150px', textAlign: 'center', height: '100vh' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! 😅</h2>
      <p style={{ color: '#64748b' }}>{error || "Không tìm thấy voucher này"}</p>
      <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '2rem' }}>Quay lại trang chủ</button>
    </div>
  );

  const discountPercent = Math.round(((voucher.original_price - voucher.sale_price) / voucher.original_price) * 100);

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', background: '#f8fafc', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Breadcrumb & Quick Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
          >
            <ChevronLeft size={20} /> Quay lại
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="glass-effect" style={{ padding: '0.6rem', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}><Share2 size={20} /></button>
            <button className="glass-effect" style={{ padding: '0.6rem', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}><Heart size={20} /></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'start' }}>
          
          {/* LEFT: IMAGE & DESCRIPTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Main Image Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
            >
              <img 
                src={voucher.image_url || 'https://via.placeholder.com/800x500'} 
                alt={voucher.title} 
                style={{ width: '100%', height: '500px', objectFit: 'cover' }}
              />
              <div style={{ 
                position: 'absolute', 
                top: '20px', 
                left: '20px', 
                background: '#ef4444', 
                color: 'white', 
                padding: '0.6rem 1.2rem', 
                borderRadius: '16px', 
                fontWeight: 800,
                fontSize: '1.1rem',
                boxShadow: '0 10px 20px rgba(239,68,68,0.3)'
              }}>
                -{discountPercent}% OFF
              </div>
            </motion.div>

            {/* Content Tabs / Sections */}
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Info size={24} color="var(--primary)" /> Mô tả chi tiết
              </h2>
              <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                {voucher.description || "Đang cập nhật nội dung chi tiết..."}
              </div>

              <div style={{ height: '1px', background: '#f1f5f9', margin: '2.5rem 0' }} />

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={24} color="#10b981" /> Điều kiện áp dụng
              </h2>
              <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                {voucher.terms_and_conditions || (
                  <ul style={{ paddingLeft: '1.5rem' }}>
                    <li>Mỗi khách hàng được mua tối đa 5 voucher.</li>
                    <li>Vui lòng đặt chỗ trước ít nhất 24h.</li>
                    <li>Không áp dụng cùng các chương trình khuyến mãi khác.</li>
                  </ul>
                )}
              </div>

              <div style={{ height: '1px', background: '#f1f5f9', margin: '2.5rem 0' }} />

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={24} color="#f59e0b" /> Chính sách hoàn hủy
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                {voucher.cancellation_policy || "Voucher không được hoàn trả sau khi đã mua. Trường hợp cửa hàng ngừng phục vụ, khách hàng sẽ được hoàn tiền vào ví Dealzy trong vòng 48h."}
              </p>

              <div style={{ height: '1px', background: '#f1f5f9', margin: '2.5rem 0' }} />

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Star size={24} color="#facc15" fill="#facc15" /> Đánh giá từ khách hàng ({voucher.reviews?.length || 0})
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {voucher.reviews && voucher.reviews.length > 0 ? (
                  voucher.reviews.map((rev) => (
                    <div key={rev.review_id} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <b style={{ fontSize: '1.1rem' }}>{rev.full_name}</b>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < rev.rating ? "#facc15" : "none"} color={i < rev.rating ? "#facc15" : "#cbd5e1"} />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.5 }}>{rev.comment}</p>
                      <small style={{ color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>
                        {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                      </small>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có đánh giá nào cho voucher này.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: PRICING & BUY ACTIONS */}
          <aside style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ 
                  background: 'rgba(37,99,235,0.1)', 
                  color: 'var(--primary)', 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: '10px', 
                  fontSize: '0.85rem', 
                  fontWeight: 700 
                }}>
                  {voucher.category_name}
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1rem', marginBottom: '0.5rem' }}>{voucher.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 500 }}>
                    <Store size={18} /> {voucher.company_name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b', fontWeight: 700 }}>
                    <Star size={18} fill="#facc15" color="#facc15" /> {voucher.average_rating}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)' }}>{Number(voucher.sale_price).toLocaleString()}đ</span>
                  <span style={{ fontSize: '1.2rem', color: '#94a3b8', textDecoration: 'line-through' }}>{Number(voucher.original_price).toLocaleString()}đ</span>
                </div>
                <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>Tiết kiệm {(voucher.original_price - voucher.sale_price).toLocaleString()}đ</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Hạn sử dụng:</span>
                  <b style={{ color: '#1e293b' }}>{new Date(voucher.expiry_date).toLocaleDateString('vi-VN')}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Số lượng còn lại:</span>
                  <b style={{ color: '#1e293b' }}>{voucher.quantity_stock}</b>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                  onClick={() => addToCart(voucher)}
                  style={{ 
                    width: '100%', 
                    height: '60px', 
                    borderRadius: '18px', 
                    border: '1px solid var(--primary)', 
                    background: 'white', 
                    color: 'var(--primary)', 
                    fontWeight: 800, 
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <ShoppingCart size={22} /> Thêm vào giỏ
                </button>
                <button 
                  style={{ 
                    width: '100%', 
                    height: '60px', 
                    borderRadius: '18px', 
                    border: 'none', 
                    background: 'var(--primary)', 
                    color: 'white', 
                    fontWeight: 800, 
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(37,99,235,0.25)'
                  }}
                >
                  Mua ngay
                </button>
              </div>
            </div>

            {/* Applicable Branches Card */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} color="#ef4444" /> Địa điểm áp dụng ({voucher.branches?.length || 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {voucher.branches && voucher.branches.length > 0 ? (
                  voucher.branches.map((branch, idx) => (
                    <div key={branch.branch_id} style={{ display: 'flex', gap: '0.75rem', paddingBottom: idx === voucher.branches.length - 1 ? 0 : '1rem', borderBottom: idx === voucher.branches.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                      <Building2 size={16} color="#64748b" style={{ marginTop: '4px', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>{branch.branch_name}</p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>{branch.address}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Đang cập nhật địa chỉ...</p>
                )}
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

export default VoucherDetail;

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import { apiFetch } from '../apiClient';
import { useCart } from '../context/CartContext';
import { CheckCircle, XCircle, Tag, Calendar, QrCode, Barcode, ShoppingCart, Home } from 'lucide-react';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const status = searchParams.get('status'); // 'success' hoặc 'fail'
  const orderId = searchParams.get('orderId');
  const paymentMethod = searchParams.get('payment'); // 'vnpay', 'momo', 'vietqr', 'paypal'

  const [evouchers, setEvouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    if (status === 'fail' && orderId) {
      apiFetch(`${API_BASE_URL}/api/orders/${orderId}/fail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactionRef: paymentMethod || 'PAYMENT_FAIL' })
      }).catch(err => console.error(err));
    }

    if (status === 'success' && orderId) {
      // Xóa giỏ hàng chỉ khi thanh toán thật sự thành công
      clearCart();
      setLoading(true);
      apiFetch(`${API_BASE_URL}/api/orders/evouchers/${orderId}`)
        .then(res => {
          if (!res.ok) throw new Error('Không thể tải mã E-Voucher.');
          return res.json();
        })
        .then(data => {
          if (data.success) {
            setEvouchers(data.evouchers);
          }
        })
        .catch(err => {
          console.error(err);
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [status, orderId, paymentMethod, navigate]);

  const qrCodeUrl = (code) => `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(code)}`;

  return (
    <div style={{ paddingTop: '180px', paddingBottom: '80px', minHeight: '100vh', background: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
              
              {/* Vòng tròn thành công */}
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'rgba(5, 150, 105, 0.1)', 
                color: '#059669', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <CheckCircle size={48} />
              </div>

              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1e293b' }}>
                Thanh toán thành công!
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '600px' }}>
                Đơn hàng #{orderId} đã được xử lý hoàn tất qua {paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'vietqr' ? 'VietQR' : paymentMethod === 'vnpay' ? 'VNPay' : paymentMethod === 'momo' ? 'MoMo' : paymentMethod?.toUpperCase()}. Mã E-Voucher của bạn đã được kích hoạt dưới đây.
              </p>

              {loading && (
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Đang khởi tạo mã E-Voucher của bạn...</p>
              )}

              {/* LIST E-VOUCHERS DẠNG TÉP VÉ CỰC KỲ SANG TRỌNG */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2rem', 
                width: '100%', 
                maxWidth: '600px', 
                marginBottom: '3rem' 
              }}>
                {evouchers.map((ev, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 }}
                    style={{
                      background: 'white',
                      borderRadius: '24px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      position: 'relative'
                    }}
                  >
                    
                    {/* KHU VỰC VÉ TRÊN (THÔNG TIN) */}
                    <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', alignItems: 'center', textAlign: 'left' }}>
                      <img 
                        src={ev.image_url} 
                        alt={ev.title} 
                        style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                          <Tag size={12} /> {ev.company_name}
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px', color: '#1e293b' }}>{ev.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Calendar size={14} /> Hạn sử dụng: {new Date(ev.expiry_date).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>

                    {/* ĐƯỜNG XÉ VÉ RĂNG CƯA BẰNG CSS SANG TRỌNG */}
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '20px', background: '#fff' }}>
                      <div style={{ position: 'absolute', left: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: '#f8fafc', borderRight: '1px solid #e2e8f0' }} />
                      <div style={{ flex: 1, borderTop: '2px dashed #e2e8f0', margin: '0 15px' }} />
                      <div style={{ position: 'absolute', right: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: '#f8fafc', borderLeft: '1px solid #e2e8f0' }} />
                    </div>

                    {/* KHU VỰC VÉ DƯỚI (MÃ QUÉT) */}
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(to bottom, #ffffff, #fafafa)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '12px' 
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                        MÃ VÀO CỬA (E-VOUCHER CODE)
                      </div>
                      <div style={{ 
                        fontSize: '1.8rem', 
                        fontWeight: 900, 
                        letterSpacing: '2px', 
                        color: '#0f172a',
                        fontFamily: 'monospace',
                        background: '#f1f5f9',
                        padding: '4px 20px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}>
                        {ev.unique_code}
                      </div>

                      {/* Barcode/QR Code Giả lập cho xịn */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '4px' }}>
                        <img src={qrCodeUrl(ev.unique_code)} alt={`QR ${ev.unique_code}`} style={{ width: '120px', height: '120px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Barcode size={24} /> Barcode Active
                        </div>
                        <div style={{ width: '1px', height: '16px', background: '#cbd5e1' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <QrCode size={18} /> QR scans real code
                        </div>
                        <button type="button" onClick={() => navigator.clipboard?.writeText(ev.unique_code)} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '8px', padding: '0.35rem 0.6rem', fontWeight: 700, cursor: 'pointer' }}>
                          Copy code
                        </button>
                      </div>
                    </div>

                  </motion.div>
                ))}
              </div>

              {/* Nút hành động */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/">
                  <button className="btn-primary" style={{ padding: '1rem 2rem', gap: '8px', display: 'flex', alignItems: 'center' }}>
                    <Home size={18} /> Khám phá thêm Deal
                  </button>
                </Link>
                <Link to="/profile">
                  <button className="btn-secondary" style={{ padding: '1rem 2rem', gap: '8px', display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #cbd5e1', color: '#475569' }}>
                    Xem ví Voucher của tôi
                  </button>
                </Link>
              </div>

            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
            >
              
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <XCircle size={48} />
              </div>

              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1e293b' }}>
                Thanh toán thất bại
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px' }}>
                Đã có lỗi xảy ra trong quá trình kết nối với cổng thanh toán hoặc giao dịch của bạn đã bị hủy bỏ từ phía ngân hàng.
              </p>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/cart">
                  <button className="btn-primary" style={{ padding: '1rem 2rem', gap: '8px', display: 'flex', alignItems: 'center' }}>
                    <ShoppingCart size={18} /> Quay lại Giỏ hàng
                  </button>
                </Link>
                <Link to="/">
                  <button className="btn-secondary" style={{ padding: '1rem 2rem', gap: '8px', display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #cbd5e1', color: '#475569' }}>
                    Quay về Trang chủ
                  </button>
                </Link>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default PaymentStatus;

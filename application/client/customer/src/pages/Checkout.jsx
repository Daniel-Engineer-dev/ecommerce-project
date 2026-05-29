import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { apiFetch } from '../apiClient';
import { ArrowLeft, CreditCard, Wallet, QrCode, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
  const { cartItems, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('VNPay'); // Default to VNPay
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Trạng thái VietQR Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [countdown, setCountdown] = useState(600); // 10 phút đếm ngược
  const [confirmingQr, setConfirmingQr] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth?redirect=checkout');
      return;
    }
    
    // Nạp sẵn thông tin khách hàng từ API thay vì hardcode
    const fetchProfile = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/auth/profile`);
        const data = await res.json();
        if (res.ok) {
          setShippingInfo({
            name: data.full_name || '',
            phone: data.phone || '',
            email: data.email || '',
            address: data.address || ''
          });
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin hồ sơ:', err);
      }
    };

    fetchProfile();
    
    if (cartItems.length === 0 && !showQrModal && !activeOrderId) {
      navigate('/cart');
    }
  }, [navigate, cartItems, showQrModal, activeOrderId]);

  // Bộ đếm ngược cho VietQR
  useEffect(() => {
    let timer;
    if (showQrModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleCancelOrder('expired');
      setError('Đã hết hạn thời gian thanh toán VietQR. Vui lòng thử lại!');
    }
    return () => clearInterval(timer);
  }, [showQrModal, countdown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const payload = {
      shippingInfo,
      items: cartItems.map(item => ({
        voucher_id: item.voucher_id,
        quantity: item.quantity
      })),
      paymentMethod
    };
    
    try {
      const validateRes = await apiFetch(`${API_BASE_URL}/api/orders/validate-cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: payload.items })
      });
      const validateData = await validateRes.json();
      if (!validateRes.ok || !validateData.valid) {
        throw new Error(validateData.errors?.[0]?.message || validateData.message || 'Cart contains unavailable vouchers.');
      }

      const res = await apiFetch(`${API_BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Thanh toán đơn hàng thất bại.');
      }
      
      if (paymentMethod === 'VNPay' || paymentMethod === 'MoMo' || paymentMethod === 'PayPal') {
        // External gateways leave the checkout page immediately, so clear the local cart now.
        clearCart();
        // Redirect trực tiếp sang trang cổng thanh toán
        window.location.href = data.paymentUrl;
      } 
      else if (paymentMethod === 'VietQR') {
        // Mở popup quét mã QR ngân hàng
        setActiveOrderId(data.orderId);
        setQrData(data);
        setCountdown(600);
        setShowQrModal(true);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Giả lập khách hàng bấm xác nhận chuyển khoản cho VietQR
  const handleConfirmVietQR = async () => {
    setConfirmingQr(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/orders/confirm-vietqr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId: qrData.orderId })
      });
      
      if (res.ok) {
        clearCart();
        setShowQrModal(false);
        navigate(`/payment/status?status=success&orderId=${qrData.orderId}&payment=vietqr`);
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Xác nhận chuyển khoản thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối server xác nhận thanh toán.');
    } finally {
      setConfirmingQr(false);
    }
  };

  const handleCancelOrder = async (reason = 'cancelled') => {
    const orderId = activeOrderId || qrData?.orderId;
    if (orderId) {
      try {
        await apiFetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        });
      } catch (err) {
        console.error(err);
      }
    }
    setShowQrModal(false);
    setError(reason === 'expired' ? 'VietQR payment time expired. Please try again.' : 'Order cancelled.');
  };

  return (
    <div style={{ paddingTop: '180px', paddingBottom: '80px', minHeight: '100vh', background: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <button 
          onClick={() => navigate('/cart')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            border: 'none', 
            background: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer', 
            fontWeight: 600, 
            marginBottom: '1.5rem',
            fontSize: '0.95rem'
          }}
        >
          <ArrowLeft size={18} /> Quay lại giỏ hàng
        </button>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Thanh toán đơn hàng</h1>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: '#fef2f2', 
              color: '#ef4444', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '2rem', 
              fontWeight: 600,
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
          
          {/* CỘT TRÁI: THÔNG TIN & PHƯƠNG THỨC */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Form liên hệ */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1e293b' }}>
                Thông tin nhận mã E-Voucher
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>HỌ VÀ TÊN</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={shippingInfo.name} 
                    onChange={handleInputChange} 
                    required 
                    style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem' }}
                    placeholder="Nhập họ và tên người mua"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>ĐỊA CHI NHẬN HÀNG</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={shippingInfo.address} 
                    onChange={handleInputChange} 
                    required 
                    style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem' }}
                    placeholder="Nhập địa chỉ nhận E-Voucher / hóa đơn"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>SỐ ĐIỆN THOẠI</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={shippingInfo.phone} 
                      onChange={handleInputChange} 
                      required 
                      style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem' }}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>EMAIL NHẬN MÃ</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={shippingInfo.email} 
                      onChange={handleInputChange} 
                      required 
                      style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem' }}
                      placeholder="Nhập địa chỉ email"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chọn phương thức thanh toán */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1e293b' }}>
                Phương thức thanh toán
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Option 1: VNPay */}
                <div 
                  onClick={() => setPaymentMethod('VNPay')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.2rem',
                    border: paymentMethod === 'VNPay' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: paymentMethod === 'VNPay' ? 'var(--accent-glow)' : 'white',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      background: 'rgba(15, 23, 42, 0.05)', 
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)'
                    }}>
                      <CreditCard size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>Cổng thanh toán VNPay</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Thanh toán qua mã QR VNPay hoặc thẻ ATM/Quốc tế</p>
                    </div>
                  </div>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    border: paymentMethod === 'VNPay' ? '6px solid var(--primary)' : '2px solid #cbd5e1'
                  }} />
                </div>

                {/* Option 2: MoMo */}
                <div 
                  onClick={() => setPaymentMethod('MoMo')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.2rem',
                    border: paymentMethod === 'MoMo' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: paymentMethod === 'MoMo' ? 'var(--accent-glow)' : 'white',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      background: 'rgba(15, 23, 42, 0.05)', 
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)'
                    }}>
                      <Wallet size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>Ví điện tử MoMo</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ví điện tử siêu tốc độ hàng đầu Việt Nam</p>
                    </div>
                  </div>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    border: paymentMethod === 'MoMo' ? '6px solid var(--primary)' : '2px solid #cbd5e1'
                  }} />
                </div>

                {/* Option 3: VietQR */}
                <div 
                  onClick={() => setPaymentMethod('VietQR')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.2rem',
                    border: paymentMethod === 'VietQR' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: paymentMethod === 'VietQR' ? 'var(--accent-glow)' : 'white',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      background: 'rgba(15, 23, 42, 0.05)', 
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)'
                    }}>
                      <QrCode size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>Chuyển khoản VietQR demo</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quét mã và xác nhận mô phỏng để hoàn tất đơn hàng demo</p>
                    </div>
                  </div>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    border: paymentMethod === 'VietQR' ? '6px solid var(--primary)' : '2px solid #cbd5e1'
                  }} />
                </div>

                {/* Option 4: PayPal */}
                <div 
                  onClick={() => setPaymentMethod('PayPal')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.2rem',
                    border: paymentMethod === 'PayPal' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: paymentMethod === 'PayPal' ? 'var(--accent-glow)' : 'white',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      background: 'rgba(15, 23, 42, 0.05)', 
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)'
                    }}>
                      <Wallet size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>Ví điện tử PayPal</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cổng thanh toán quốc tế an toàn bằng USD (Quy đổi tự động)</p>
                    </div>
                  </div>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    border: paymentMethod === 'PayPal' ? '6px solid var(--primary)' : '2px solid #cbd5e1'
                  }} />
                </div>

              </div>
            </div>

          </form>

          {/* CỘT PHẢI: TÓM TẮT GIỎ HÀNG */}
          <div>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'sticky', top: '180px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1e293b' }}>Tóm tắt đơn hàng</h3>
              
              {/* Danh sách items tóm tắt */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                {cartItems.map((item) => (
                  <div key={item.voucher_id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>SL: {item.quantity} x {Number(item.sale_price).toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', background: '#f1f5f9', margin: '1rem 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>Tạm tính ({totalItems} voucher)</span>
                  <span>{Number(totalPrice).toLocaleString('vi-VN')}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>Phí dịch vụ</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>Miễn phí</span>
                </div>
                <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.3rem' }}>
                  <span>Tổng tiền</span>
                  <span style={{ color: 'var(--primary)' }}>{Number(totalPrice).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  height: '56px', 
                  fontSize: '1.1rem', 
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? 'Đang khởi tạo...' : (
                  <>
                    <ShieldCheck size={20} /> Thanh toán bảo mật
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL QUÉT MÃ VIETQR ĐỘNG */}
      <AnimatePresence>
        {showQrModal && qrData && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
            overflowY: 'auto'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '480px',
                maxHeight: 'calc(100vh - 2rem)',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                <Clock size={16} /> Thời gian thanh toán: {formatTime(countdown)}
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#1e293b' }}>Quét mã chuyển khoản</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1rem' }}>Mở ứng dụng ngân hàng của bạn và quét mã QR bên dưới.</p>

              {/* QR Code Container */}
              <div style={{ 
                padding: '0.75rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '24px', 
                background: '#f8fafc',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={qrData.qrUrl} 
                  alt="VietQR MBBank" 
                  style={{ width: 'min(200px, 48vh)', height: 'min(200px, 48vh)', borderRadius: '12px' }}
                />
              </div>

              {/* Chi tiết chuyển khoản */}
              <div style={{ 
                width: '100%', 
                background: '#f8fafc', 
                borderRadius: '16px', 
                padding: '1rem', 
                textAlign: 'left', 
                fontSize: '0.85rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ngân hàng thụ hưởng:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>MB Bank (Ngân hàng Quân đội)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Số tài khoản:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{qrData.bankInfo.accountNo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tên chủ tài khoản:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{qrData.bankInfo.accountName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Số tiền chuyển:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>{Number(qrData.totalAmount).toLocaleString('vi-VN')}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nội dung ghi chú:</span>
                  <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>{qrData.bankInfo.content}</span>
                </div>
              </div>

              {/* Nút hành động */}
              <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
                <button
                  onClick={() => handleCancelOrder('customer_cancelled')}
                  style={{
                    flex: 1,
                    height: '48px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#64748b',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Hủy đơn
                </button>
                <button
                  onClick={handleConfirmVietQR}
                  disabled={confirmingQr}
                  style={{
                    flex: 2,
                    height: '48px',
                    border: 'none',
                    background: '#059669',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {confirmingQr ? 'Đang xác nhận...' : (
                    <>
                      <CheckCircle2 size={18} /> Xác nhận thanh toán mô phỏng
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default Checkout;

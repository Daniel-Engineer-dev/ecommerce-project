import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoucherCard from '../components/VoucherCard';
import { Sparkles, ArrowRight, Search, SlidersHorizontal, X, Tag, MapPin, CircleDollarSign, Percent, Building2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

const Home = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    area: '',
    minPrice: '',
    maxPrice: '',
    minDiscount: '',
    partner: '',
    status: 'Approved' // Mặc định chỉ lọc voucher hiệu lực
  });

  useEffect(() => {
    // Fetch initial vouchers
    fetch(`${API_BASE_URL}/api/vouchers`)
      .then(res => res.json())
      .then(data => {
        setVouchers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching vouchers:", err);
        setLoading(false);
      });

    // Fetch categories & partners for filter
    fetch(`${API_BASE_URL}/api/vouchers/categories`).then(res => res.json()).then(data => setCategories(data));
    fetch(`${API_BASE_URL}/api/vouchers/partners`).then(res => res.json()).then(data => setPartners(data));
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);

    // Thêm các filters hiện tại nếu có
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'Approved') params.append(key, value);
      else if (key === 'status' && value) params.append(key, value);
    });

    navigate(`/search?${params.toString()}`);
  };

  const updateFilter = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ category: '', area: '', minPrice: '', maxPrice: '', minDiscount: '', partner: '', status: 'Approved' });
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Hero Section */}
      <section
        style={{
          paddingTop: '160px',
          paddingBottom: '100px',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--bg-surface, #ffffff)'
        }}
      >
        {/* Background blur glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(15,23,42,0.03) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0
        }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              background: 'rgba(15, 23, 42, 0.05)',
              color: 'var(--primary)',
              fontWeight: 600,
              marginBottom: '1.5rem'
            }}
          >
            <Sparkles size={16} />
            Deal hot hôm nay 🔥 Giảm đến 70%
          </motion.div>

          {/* HEADLINE MỚI */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '3.5rem',
              lineHeight: 1.2,
              marginBottom: '1.5rem'
            }}
          >
            Săn deal xịn <br />
            <span className="gradient-text">chỉ từ 19K</span>
          </motion.h1>

          {/* SUBTEXT */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              maxWidth: '600px',
              margin: '0 auto 2.5rem'
            }}
          >
            Buffet, du lịch, spa cao cấp với giá không tưởng.
            Hơn <b>500.000+ người dùng</b> đã tiết kiệm mỗi ngày.
          </motion.p>

          {/* SEARCH ENGINE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              position: 'relative',
              zIndex: 10
            }}
          >
            <form
              onSubmit={handleSearchSubmit}
              style={{
                background: 'white',
                padding: '0.75rem',
                borderRadius: 'var(--radius-lg, 12px)',
                boxShadow: 'var(--shadow-md, 0 4px 12px 0 rgba(0, 0, 0, 0.03))',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                border: '1px solid var(--border-color, #e2e8f0)'
              }}
            >
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={22} style={{ position: 'absolute', left: '20px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Bạn muốn săn deal gì hôm nay? (Ví dụ: Buffet, Spa...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1.2rem 1.2rem 1.2rem 55px',
                    border: 'none',
                    borderRadius: 'var(--radius-md, 8px)',
                    fontSize: '1.1rem',
                    background: 'var(--bg-dark, #f8fafc)',
                    outline: 'none',
                    fontWeight: 500
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0 1.5rem',
                  height: '58px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  background: 'white',
                  color: 'var(--text-main, #0f172a)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-dark, #f8fafc)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <SlidersHorizontal size={20} />
                Bộ lọc
              </button>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: '0 2.5rem',
                  height: '58px',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontSize: '1.05rem',
                  fontWeight: 700
                }}
              >
                Tìm kiếm
              </button>
            </form>
          </motion.div>

          {/* FILTER MODAL */}
          <AnimatePresence>
            {isFilterModalOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsFilterModalOpen(false)}
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  style={{
                    position: 'fixed',
                    top: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '95%',
                    maxWidth: '650px',
                    maxHeight: 'calc(100vh - 150px)',
                    overflowY: 'auto',
                    background: 'white',
                    borderRadius: 'var(--radius-lg, 12px)',
                    padding: '2rem',
                    zIndex: 1001,
                    boxShadow: 'var(--shadow-md, 0 4px 12px 0 rgba(0, 0, 0, 0.03))',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--border-color, #e2e8f0) transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'sticky', top: 0, background: 'white', zIndex: 10, paddingBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Bộ lọc nâng cao</h2>
                    <button onClick={() => setIsFilterModalOpen(false)} style={{ background: 'var(--accent-glow, rgba(15, 23, 42, 0.04))', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {/* Danh mục */}
                    <div className="filter-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#64748b', marginBottom: '0.6rem' }}><Tag size={16} /> Danh mục</label>
                      <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-dark, #f8fafc)', fontSize: '0.9rem', outline: 'none' }}>
                        <option value="">Tất cả danh mục</option>
                        {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                      </select>
                    </div>

                    {/* Khu vực */}
                    <div className="filter-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#64748b', marginBottom: '0.6rem' }}><MapPin size={16} /> Khu vực</label>
                      <input type="text" placeholder="Quận, Tỉnh/Thành..." value={filters.area} onChange={(e) => updateFilter('area', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-dark, #f8fafc)', fontSize: '0.9rem', outline: 'none' }} />
                    </div>

                    {/* Giá */}
                    <div className="filter-group" style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#64748b', marginBottom: '0.6rem' }}><CircleDollarSign size={16} /> Khoảng giá (VNĐ)</label>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input type="number" placeholder="Từ" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-dark, #f8fafc)', fontSize: '0.9rem', outline: 'none' }} />
                        <span style={{ color: '#cbd5e1' }}>—</span>
                        <input type="number" placeholder="Đến" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-dark, #f8fafc)', fontSize: '0.9rem', outline: 'none' }} />
                      </div>
                    </div>

                    {/* Mức giảm */}
                    <div className="filter-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#64748b', marginBottom: '0.6rem' }}><Percent size={16} /> Giảm từ (%)</label>
                      <input type="number" placeholder="Ví dụ: 30" value={filters.minDiscount} onChange={(e) => updateFilter('minDiscount', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-dark, #f8fafc)', fontSize: '0.9rem', outline: 'none' }} />
                    </div>

                    {/* Cửa hàng */}
                    <div className="filter-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#64748b', marginBottom: '0.6rem' }}><Building2 size={16} /> Cửa hàng</label>
                      <select value={filters.partner} onChange={(e) => updateFilter('partner', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-dark, #f8fafc)', fontSize: '0.9rem', outline: 'none' }}>
                        <option value="">Tất cả cửa hàng</option>
                        {partners.map(p => <option key={p.user_id} value={p.user_id}>{p.company_name}</option>)}
                      </select>
                    </div>

                    {/* Trạng thái */}
                    <div className="filter-group" style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#64748b', marginBottom: '0.6rem' }}><CheckCircle size={16} /> Trạng thái hiệu lực</label>
                      <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-dark, #f8fafc)', fontSize: '0.9rem', outline: 'none' }}>
                        <option value="Approved">Đang áp dụng</option>
                        <option value="">Tất cả (bao gồm hết hạn/hủy)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', paddingBottom: '1rem' }}>
                    <button onClick={resetFilters} style={{ flex: 1, padding: '0.9rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color, #e2e8f0)', background: 'white', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-dark, #f8fafc)'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>Đặt lại</button>
                    <button
                      onClick={() => { handleSearchSubmit(); setIsFilterModalOpen(false); }}
                      style={{ flex: 2, padding: '0.9rem', borderRadius: 'var(--radius-md, 8px)', border: 'none', background: 'var(--primary, #18181b)', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'opacity 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Áp dụng bộ lọc
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* SOCIAL PROOF */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              marginTop: '4rem',
              flexWrap: 'wrap'
            }}
          >
            <div><b>500K+</b><br />Người dùng</div>
            <div><b>1200+</b><br />Đối tác</div>
            <div><b>4.9★</b><br />Đánh giá</div>
          </motion.div>

        </div>
      </section>

      {/* Voucher List Section */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem' }}>Hot Deals <span style={{ color: 'var(--secondary)' }}>🔥</span></h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['All', 'Dining', 'Travel', 'Beauty'].map(cat => (
              <button key={cat} className="glass-effect" style={{
                padding: '0.4rem 1.2rem',
                borderRadius: 'var(--radius-full, 9999px)',
                color: cat === 'All' ? 'white' : 'var(--text-muted)',
                background: cat === 'All' ? 'var(--primary, #18181b)' : 'transparent',
                border: cat === 'All' ? '1px solid var(--primary, #18181b)' : '1px solid var(--border-color, #e2e8f0)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (cat !== 'All') {
                  e.currentTarget.style.background = 'var(--accent-glow, rgba(15, 23, 42, 0.04))';
                  e.currentTarget.style.color = 'var(--primary, #18181b)';
                }
              }}
              onMouseLeave={(e) => {
                if (cat !== 'All') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
            Đang tải voucher...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {vouchers.map(v => (
              <VoucherCard key={v.voucher_id} voucher={v} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;

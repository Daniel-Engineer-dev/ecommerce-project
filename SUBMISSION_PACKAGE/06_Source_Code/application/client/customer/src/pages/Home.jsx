import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VoucherCard from '../components/VoucherCard';
import { 
  Utensils, Sparkles, Heart, Activity, Scissors, GraduationCap, 
  Stethoscope, Coffee, Plane, Hotel, ChevronRight, Zap, Trophy, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hot');

  useEffect(() => {
    fetch('http://localhost:5000/api/vouchers')
      .then(res => res.json())
      .then(data => {
        setVouchers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching vouchers:", err);
        setLoading(false);
      });

    fetch('http://localhost:5000/api/vouchers/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const categoryIcons = {
    'Dining': <Utensils size={18} />,
    'Beauty': <Heart size={18} />,
    'Entertainment': <Activity size={18} />,
    'Travel': <Plane size={18} />,
    'Education': <GraduationCap size={18} />,
    'Health': <Stethoscope size={18} />,
    'Spa': <Scissors size={18} />,
    'Hotels': <Hotel size={18} />,
  };

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', paddingTop: '180px', paddingBottom: '5rem' }}>
      <div className="container">
        
        {/* TOP LAYOUT: SIDEBAR + BANNER AREA */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* LEFT SIDEBAR */}
          <aside className="category-sidebar">
            <div style={{ background: 'var(--primary)', color: 'white', padding: '12px 16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
               DANH MỤC
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to="/search?category=hot" className="category-item" style={{ color: '#ef4444' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Zap size={18} fill="#ef4444" /> KHUYẾN MÃI HOT
                </div>
                <ChevronRight size={14} />
              </Link>
              {categories.map(cat => (
                <Link key={cat.category_id} to={`/search?category=${cat.category_id}`} className="category-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {categoryIcons[cat.category_name] || <Sparkles size={18} />}
                    {cat.category_name}
                  </div>
                  <ChevronRight size={14} />
                </Link>
              ))}
            </div>
          </aside>

          {/* MAIN HERO AREA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem' }}>
            {/* LARGE CAROUSEL */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
              <img 
                src="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&q=80&w=1200" 
                alt="Banner" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>VUI CẢ NGÀY DÀI</h1>
                <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>GIÁ SIÊU ƯU ĐÃI CHỈ TỪ 255.000Đ</p>
              </div>
            </div>

            {/* SIDE BANNERS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ flex: 1, background: '#fee2e2', borderRadius: '12px', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=400" alt="ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, background: '#dcfce7', borderRadius: '12px', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=400" alt="ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>

        {/* BRAND LOGOS SLIDER (Simplified) */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          {['NIKKO SAIGON', 'GRANDSKINCARE', 'HOTEL MAJESTIC', 'DAM SEN PARK', 'HUNG NGUYEN'].map(brand => (
            <div key={brand} style={{ textAlign: 'center', cursor: 'pointer' }}>
               <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Building2Icon size={24} color="var(--primary)" />
               </div>
               <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{brand}</span>
            </div>
          ))}
        </div>

        {/* DEALS TABS */}
        <div style={{ borderBottom: '2px solid #e2e8f0', marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
          {[
            { id: 'hot', label: 'DEAL NỔI BẬT' },
            { id: 'today', label: 'DEAL HÔM NAY' },
            { id: 'for-you', label: 'DÀNH CHO BẠN' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 0.5rem',
                border: 'none',
                background: 'transparent',
                fontSize: '1rem',
                fontWeight: 800,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                cursor: 'pointer',
                transition: '0.2s',
                marginBottom: '-2px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
            Đang tải dữ liệu...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            {vouchers.map(v => (
              <VoucherCard key={v.voucher_id} voucher={v} />
            ))}
          </div>
        )}

        {/* SEE MORE BUTTON */}
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
           <button style={{ padding: '0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--primary)', background: 'white', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }} onMouseEnter={e => { e.target.style.background = 'var(--primary)'; e.target.style.color = 'white'; }} onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.color = 'var(--primary)'; }}>
              XEM THÊM DEAL MỚI
           </button>
        </div>

      </div>
    </div>
  );
};

// Helper for brand icons
const Building2Icon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

export default Home;

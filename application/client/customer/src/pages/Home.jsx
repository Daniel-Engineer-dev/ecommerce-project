import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import VoucherCard from '../components/VoucherCard';
import {
  Activity,
  ChevronRight,
  Coffee,
  GraduationCap,
  Heart,
  Hotel,
  Plane,
  Scissors,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Utensils,
  Zap,
} from 'lucide-react';
import { API_BASE_URL, translateCategory } from '../config';

const VOUCHERS_PER_SECTION = 8;
const SECTION_LOAD_MORE_STEP = 4;

const isSameDay = (value, date = new Date()) => {
  if (!value) return false;
  const target = new Date(value);
  return (
    target.getFullYear() === date.getFullYear() &&
    target.getMonth() === date.getMonth() &&
    target.getDate() === date.getDate()
  );
};

const Home = () => {
  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hot');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [visibleByCategory, setVisibleByCategory] = useState({});

  const sectionRefs = useRef({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/vouchers`)
      .then((res) => res.json())
      .then((data) => {
        setVouchers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching vouchers:', err);
        setLoading(false);
      });

    fetch(`${API_BASE_URL}/api/vouchers/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  const categoryIcons = {
    Dining: Utensils,
    Shopping: ShoppingBag,
    Entertainment: Activity,
    Beauty: Heart,
    Travel: Plane,
    Health: Stethoscope,
    Education: GraduationCap,
    Spa: Scissors,
    Hotels: Hotel,
    Cafe: Coffee,
  };

  const tabVouchers = useMemo(() => {
    if (activeTab === 'today') {
      return vouchers
        .filter((voucher) => isSameDay(voucher.start_date))
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    }

    if (activeTab === 'for-you') {
      return [...vouchers].sort(
        (a, b) => Number(b.discount_percent || 0) - Number(a.discount_percent || 0),
      );
    }

    return vouchers;
  }, [activeTab, vouchers]);

  const groupedSections = useMemo(() => {
    return categories
      .map((category) => {
        const items = tabVouchers.filter(
          (voucher) => Number(voucher.category_id) === Number(category.category_id),
        );
        return { category, items };
      })
      .filter((section) => section.items.length > 0);
  }, [categories, tabVouchers]);

  useEffect(() => {
    if (groupedSections.length > 0) {
      setActiveCategoryId(groupedSections[0].category.category_id);
    } else {
      setActiveCategoryId(null);
    }
  }, [groupedSections]);

  useEffect(() => {
    const nextVisible = {};
    groupedSections.forEach(({ category }) => {
      nextVisible[category.category_id] = VOUCHERS_PER_SECTION;
    });
    setVisibleByCategory(nextVisible);
  }, [groupedSections, activeTab]);

  useEffect(() => {
    if (groupedSections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          const sectionId = visibleEntries[0].target.getAttribute('data-category-id');
          if (sectionId) {
            setActiveCategoryId(Number(sectionId));
          }
        }
      },
      {
        root: null,
        rootMargin: '-30% 0px -45% 0px',
        threshold: [0.2, 0.4, 0.65],
      },
    );

    groupedSections.forEach(({ category }) => {
      const node = sectionRefs.current[category.category_id];
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [groupedSections]);

  const handleCategoryJump = (categoryId) => {
    const node = sectionRefs.current[categoryId];
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      style={{
        background: '#f1f5f9',
        minHeight: '100vh',
        paddingTop: '180px',
        paddingBottom: '5rem',
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <aside className="category-sidebar">
            <div
              style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '12px 16px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              DANH MỤC
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to="/search?sort=new" className="category-item" style={{ color: '#ef4444' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Zap size={18} fill="#ef4444" />
                  KHUYẾN MÃI HOT
                </div>
                <ChevronRight size={14} />
              </Link>
              {categories.map((category) => {
                const Icon = categoryIcons[category.category_name] || Sparkles;
                return (
                  <Link
                    key={category.category_id}
                    to={`/search?category=${category.category_id}`}
                    className="category-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon size={18} />
                      {translateCategory(category.category_name)}
                    </div>
                    <ChevronRight size={14} />
                  </Link>
                );
              })}
            </div>
          </aside>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem' }}>
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&q=80&w=1200"
              alt="Banner"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '2rem',
                left: '2rem',
                color: 'white',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>VUI CẢ NGÀY DÀI</h1>
              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>GIÁ SIÊU ƯU ĐÃI CHỈ TỪ 255.000Đ</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ flex: 1, background: '#fee2e2', borderRadius: '12px', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=400"
                alt="ad"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1, background: '#dcfce7', borderRadius: '12px', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=400"
                alt="ad"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
          </div>
        </div>

        <div style={{ borderBottom: '2px solid #e2e8f0', marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
          {[
            { id: 'hot', label: 'DEAL NỔI BẬT' },
            { id: 'today', label: 'DEAL HÔM NAY' },
            { id: 'for-you', label: 'DÀNH CHO BẠN' },
          ].map((tab) => (
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
                marginBottom: '-2px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu...</div>
        ) : groupedSections.length > 0 ? (
          <div className="home-layout">
            <aside className="home-category-rail" aria-label="Danh mục">
              {groupedSections.map(({ category }) => {
                const Icon = categoryIcons[category.category_name] || Sparkles;
                const isActive = Number(activeCategoryId) === Number(category.category_id);
                return (
                  <button
                    key={category.category_id}
                    className={`home-category-rail__item${isActive ? ' active' : ''}`}
                    title={translateCategory(category.category_name)}
                    onClick={() => handleCategoryJump(category.category_id)}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </aside>

            <div className="home-sections">
              {groupedSections.map(({ category, items }) => (
                <section
                  key={category.category_id}
                  data-category-id={category.category_id}
                  ref={(node) => {
                    if (node) sectionRefs.current[category.category_id] = node;
                  }}
                  className="home-section"
                >
                  <div className="home-section__head">
                    <h2>{translateCategory(category.category_name)}</h2>
                    <Link to={`/search?category=${category.category_id}`}>
                      Xem tất cả
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="home-section__grid">
                    {items
                      .slice(0, visibleByCategory[category.category_id] || VOUCHERS_PER_SECTION)
                      .map((voucher) => (
                        <VoucherCard key={voucher.voucher_id} voucher={voucher} />
                      ))}
                  </div>
                  {(visibleByCategory[category.category_id] || VOUCHERS_PER_SECTION) < items.length && (
                    <div className="home-section__more">
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleByCategory((prev) => ({
                            ...prev,
                            [category.category_id]:
                              (prev[category.category_id] || VOUCHERS_PER_SECTION) + SECTION_LOAD_MORE_STEP,
                          }))
                        }
                      >
                        Xem thêm
                      </button>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        ) : (
          <div className="home-empty-state">
            <Sparkles size={36} />
            <h3>Không có deal mới</h3>
            <p>Hiện chưa có voucher nào bắt đầu trong hôm nay. Vui lòng quay lại sau.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

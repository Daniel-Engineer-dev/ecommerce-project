import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, LogOut, ShieldCheck, Search, MapPin, Phone, Mail, ChevronDown, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'white', boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none', transition: '0.3s' }}>
      {/* 1. TOP BAR */}
      <div className="top-bar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <MapPin size={14} /> <span>Hồ Chí Minh</span> <ChevronDown size={12} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={14} /> <span>Hotline: 1900 6760</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} /> <span>cs@dealzy.vn</span>
            </div>
            {!user && (
              <Link to="/auth" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>Đăng ký / Đăng nhập</Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '3rem' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src={logo} alt="Logo" style={{ height: '45px', width: '45px', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>DEALZY</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-bar-container">
            <div style={{ padding: '0 1rem', borderRight: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.9rem', fontWeight: 500 }}>
              Tất cả danh mục <ChevronDown size={14} />
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm / khuyến mãi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '0.75rem 1rem', outline: 'none', fontSize: '0.95rem' }} 
            />
            <button type="submit" style={{ background: 'var(--primary)', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={20} strokeWidth={2.5} />
            </button>
          </form>

          {/* Cart & User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 700 }}>
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={28} />
                {totalItems > 0 && (
                  <span style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: 'white', width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, border: '2px solid white' }}>
                    {totalItems}
                  </span>
                )}
              </div>
              GIỎ HÀNG
            </Link>

            {user && (
              <div 
                style={{ position: 'relative', cursor: 'pointer' }}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 600 }}>
                  <User size={20} />
                  <span>{user.username}</span>
                </div>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{ position: 'absolute', top: '100%', right: 0, width: '200px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '0.5rem', border: '1px solid #f1f5f9', marginTop: '0.5rem' }}
                    >
                      <Link to="/profile" style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'var(--text-main)', borderRadius: '8px', fontSize: '0.9rem' }} onMouseEnter={e => e.target.style.background = '#f8fafc'} onMouseLeave={e => e.target.style.background = 'transparent'}>Tài khoản</Link>
                      <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }} onMouseEnter={e => e.target.style.background = '#fef2f2'} onMouseLeave={e => e.target.style.background = 'transparent'}>Đăng xuất</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SUB HEADER / NAVIGATION */}
      <div style={{ background: 'var(--primary)', color: 'white', height: '42px', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.15)', height: '42px', padding: '0 1.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
            <List size={20} /> DANH MỤC <ChevronDown size={16} />
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Deal Mới</Link>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Deal Bán Chạy</Link>
            <Link to="/partners" style={{ color: 'white', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Đối Tác</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
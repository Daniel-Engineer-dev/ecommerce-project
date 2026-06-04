import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, LogOut, ShieldCheck } from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const savedUser = localStorage.getItem('partnerUser');
    if (savedUser) setUser(JSON.parse(savedUser));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: isScrolled ? '1rem 0' : '1.5rem 0',
        background: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        borderBottom: isScrolled ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
      }}
    >
      {/* GRID LAYOUT */}
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* LEFT: LOGO */}
        <div style={{ justifySelf: 'start' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              src={logo}
              alt="Dealzy Logo"
              style={{
                width: '50px',
                height: '50px',
                marginRight: '8px',
                mixBlendMode: 'multiply',
                borderRadius: '8px'
              }}
            />
            <span
              className="gradient-text"
              style={{ fontSize: '1.75rem', fontWeight: 800 }}
            >
              Dealzy
            </span>
          </Link>
        </div>

        {/* CENTER: MENU */}
        <div
          style={{
            justifySelf: 'center',
            display: 'flex',
            gap: '2rem',
          }}
        >
          <Link
            to="/"
            style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem', transition: '0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-main)')}
          >
            Vouchers
          </Link>
          <Link
            to="/partners"
            style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem', transition: '0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-main)')}
          >
            Partners
          </Link>
          <Link
            to="/about"
            style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem', transition: '0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-main)')}
          >
            About
          </Link>
        </div>

        {/* RIGHT: ACTIONS */}
        <div
          style={{
            justifySelf: 'end',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          {/* Cart */}
          <Link to="/cart" style={{ position: 'relative', color: 'inherit', textDecoration: 'none' }}>
            <ShoppingCart size={22} style={{ cursor: 'pointer' }} />
            {totalItems > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  background: 'var(--primary)',
                  color: 'white',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* User */}
          {user ? (
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--accent-glow)',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: '0.3s',
                  boxShadow: isDropdownOpen ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <User size={18} color="var(--primary)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {user.username}
                </span>
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute',
                      top: '110%',
                      right: 0,
                      width: '200px',
                      background: 'white',
                      background: 'white',
                      borderRadius: 'var(--radius-lg, 12px)',
                      boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
                      padding: '0.5rem',
                      zIndex: 1000,
                      border: '1px solid var(--border-color, #e4e4e7)'
                    }}
                  >
                    <Link
                      to="/profile"
                      state={{ tab: 'info' }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        borderRadius: '10px',
                        transition: '0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <User size={16} color="var(--text-muted)" /> Thông tin chung
                    </Link>
                    <Link
                      to="/profile"
                      state={{ tab: 'security' }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        borderRadius: '10px',
                        transition: '0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <ShieldCheck size={16} color="var(--text-muted)" /> Bảo mật
                    </Link>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '0.4rem 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-md, 8px)',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--error-light, #fef2f2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth" style={{ textDecoration: 'none' }}>
              <button
                className="btn-primary"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
              >
                Đăng nhập
              </button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

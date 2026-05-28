import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import AccessPortal from './pages/AccessPortal';

import AuthPage from './pages/AuthPage';
import Partners from './pages/Partners';
import Support from './pages/Support';
import UserGuide from './pages/UserGuide';
import RefundPolicy from './pages/RefundPolicy';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import SearchVouchers from './pages/SearchVouchers';
import VoucherDetail from './pages/VoucherDetail';
import PartnerRegistration from './pages/PartnerRegistration';
import CustomerRegistration from './pages/CustomerRegistration';
import Checkout from './pages/Checkout';
import PaymentStatus from './pages/PaymentStatus';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('React render error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: '#1e293b', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
          <h1 style={{ marginBottom: '1rem' }}>Ứng dụng gặp lỗi khi hiển thị</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fee2e2', padding: '1rem', borderRadius: '8px' }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/auth?redirect=${redirect}`} replace />;
  }
  return children;
};

function AnimatedRoutes() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/reset-password/') || location.pathname === '/register-customer' || location.pathname === '/register-partner';

  return (
    <div className="flex flex-col min-h-screen">
      <AnimatePresence>
        {!isAuthPage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}
          >
            <Navbar />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-grow ${!isAuthPage ? 'pt-16' : ''}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
            <Route path="/reset-password/:token" element={<PageWrapper><ResetPassword /></PageWrapper>} />
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/access" element={<PageWrapper><AccessPortal /></PageWrapper>} />

            <Route path="/partners" element={<PageWrapper><Partners /></PageWrapper>} />
            <Route path="/register-partner" element={<PageWrapper><PartnerRegistration /></PageWrapper>} />
            <Route path="/register-customer" element={<PageWrapper><CustomerRegistration /></PageWrapper>} />
            <Route path="/support" element={<PageWrapper><Support /></PageWrapper>} />
            <Route path="/guide" element={<PageWrapper><UserGuide /></PageWrapper>} />
            <Route path="/refund-policy" element={<PageWrapper><RefundPolicy /></PageWrapper>} />
            <Route path="/terms" element={<PageWrapper><TermsOfService /></PageWrapper>} />
            <Route path="/privacy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
            <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><ProtectedRoute><Profile /></ProtectedRoute></PageWrapper>} />
            <Route path="/search" element={<PageWrapper><SearchVouchers /></PageWrapper>} />
            <Route path="/voucher/:id" element={<PageWrapper><VoucherDetail /></PageWrapper>} />
            <Route path="/checkout" element={<PageWrapper><ProtectedRoute><Checkout /></ProtectedRoute></PageWrapper>} />
            <Route path="/payment/status" element={<PageWrapper><ProtectedRoute><PaymentStatus /></ProtectedRoute></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>

      {!isAuthPage && <Footer />}
    </div>
  );
}


function App() {
  return (
    <AppErrorBoundary>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <AnimatedRoutes />
        </Router>
      </CartProvider>
    </AppErrorBoundary>
  );
}

export default App;

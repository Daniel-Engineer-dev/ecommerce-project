import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';

import AuthPage from './pages/AuthPage';
import Partners from './pages/Partners';
import About from './pages/About';

import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import SearchVouchers from './pages/SearchVouchers';
import VoucherDetail from './pages/VoucherDetail';
import PartnerRegistration from './pages/PartnerRegistration';
import CustomerRegistration from './pages/CustomerRegistration';

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

function AnimatedRoutes() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/reset-password/') || location.pathname === '/register-customer' || location.pathname === '/register-partner';

  return (
    <>
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
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
          <Route path="/reset-password/:token" element={<PageWrapper><ResetPassword /></PageWrapper>} />
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />

          <Route path="/partners" element={<PageWrapper><Partners /></PageWrapper>} />
          <Route path="/register-partner" element={<PageWrapper><PartnerRegistration /></PageWrapper>} />
          <Route path="/register-customer" element={<PageWrapper><CustomerRegistration /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
          <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="/search" element={<PageWrapper><SearchVouchers /></PageWrapper>} />
          <Route path="/voucher/:id" element={<PageWrapper><VoucherDetail /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}


function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <AnimatedRoutes />
      </Router>
    </CartProvider>
  );
}


export default App;


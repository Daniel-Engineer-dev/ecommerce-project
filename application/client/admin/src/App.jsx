import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Search, Globe, Bell } from 'lucide-react';

import Sidebar from './components/SideBar';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import PartnerApproval from './pages/PartnerApproval';
import UserManagement from './pages/UserManagement';
import VoucherManagement from './pages/VoucherManagement';
import OrderManagement from './pages/OrderManagement';
import ComplaintManagement from './pages/ComplaintManagement';
import ContentManagement from './pages/ContentManagement';
import SystemLogs from './pages/SystemLogs';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-100 w-full overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 p-4 sticky top-0 z-10 flex justify-between items-center px-8 h-20 shrink-0">
          <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-2.5 rounded-2xl w-96 border border-slate-200/20 focus-within:bg-white focus-within:border-indigo-500/30 transition-all">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Tim nhanh du lieu quan tri..."
              className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full" />
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100/60 text-emerald-700 rounded-xl text-xs font-bold tracking-wide">
              <Globe size={14} className="animate-spin-slow" />
              <span>HE THONG ONLINE</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/partners" element={<PartnerApproval />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/vouchers" element={<VoucherManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/complaints" element={<ComplaintManagement />} />
              <Route path="/content" element={<ContentManagement />} />
              <Route path="/logs" element={<SystemLogs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

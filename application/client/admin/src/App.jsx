import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Store, 
  Ticket, 
  MessageSquareWarning, 
  History, 
  Search,
  Globe,
  Bell
} from 'lucide-react';

// Import các Trang nghiệp vụ của bạn
import AdminDashboard from './pages/AdminDashboard';
import PartnerApproval from './pages/PartnerApproval';
import UserManagement from './pages/UserManagement';

// ─── SIDEBAR COMPONENT (THÀNH PHẦN ĐIỀU HƯỚNG BÊN TRÁI) ───────────────────────
const Sidebar = () => {
  const location = useLocation();
  
  // Danh sách các chức năng phân hệ Admin theo đúng yêu cầu Đặc tả Đồ án
  const menuItems = [
    { path: '/', label: 'Tổng Quan & KPI-04', icon: BarChart3 },
    { path: '/partners', label: 'Phê Duyệt Đối Tác', icon: Store },
    { path: '/users', label: 'Quản Lý Người Dùng', icon: Users },
    { path: '/vouchers', label: 'Quản Lý Voucher', icon: Ticket },
    { path: '/complaints', label: 'Xử Lý Khiếu Nại', icon: MessageSquareWarning },
    { path: '/logs', label: 'Lịch Sử Hệ Thống', icon: History },
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col justify-between p-6 shrink-0 z-20">
      <div className="space-y-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <BarChart3 size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg tracking-tight">DEALZY ADM</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hệ Thống Quản Trị</p>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-3">Phân hệ chức năng</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="block group">
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400'
                }`}>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
                  {item.label}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActiveIndicator"
                      className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full" 
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Sidebar */}
      <div className="pt-4 border-t border-slate-800/60 px-2 text-xs text-slate-600 font-medium flex justify-between items-center">
        <span>Phiên bản v1.0 (2026)</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </aside>
  );
};

// ─── MAIN APP ROUTING COMPONENT ──────────────────────────────────────────────
const App = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-100">
        {/* Sidebar cố định bên trái */}
        <Sidebar />
        
        {/* Khung nội dung chính bên phải */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar / Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 p-4 sticky top-0 z-10 flex justify-between items-center px-8 h-20">
            <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-2.5 rounded-2xl w-96 border border-slate-200/20 focus-within:bg-white focus-within:border-indigo-500/30 transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm nhanh dữ liệu quản trị..." 
                className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-slate-400" 
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full" />
              </button>
              <div className="h-5 w-[1px] bg-slate-200" />
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100/60 text-emerald-700 rounded-xl text-xs font-bold tracking-wide">
                <Globe size={14} className="animate-spin-slow" />
                <span>HỆ THỐNG ONLINE</span>
              </div>
            </div>
          </header>
          
          {/* Khung chứa các view nội dung chính */}
          <main className="flex-1 overflow-auto bg-slate-50/50">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/partners" element={<PartnerApproval />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/vouchers" element={<div className="p-8 font-semibold text-slate-500">Phân hệ Quản lý & Cấu hình Voucher hệ thống</div>} />
                <Route path="/complaints" element={<div className="p-8 font-semibold text-slate-500">Hệ thống Tiếp nhận & Giải quyết Khiếu nại người dùng</div>} />
                <Route path="/logs" element={<div className="p-8 font-semibold text-slate-500">Nhật ký hoạt động & Log bảo mật hệ thống</div>} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
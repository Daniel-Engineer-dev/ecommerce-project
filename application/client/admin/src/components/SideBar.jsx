import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Store,
  Ticket,
  ShoppingBag,
  MessageSquareWarning,
  FileText,
  History,
  LogOut,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/', label: 'Tổng quan', icon: BarChart3 },
    { path: '/partners', label: 'Duyệt đối tác', icon: Store },
    { path: '/users', label: 'Người dùng', icon: Users },
    { path: '/vouchers', label: 'Voucher', icon: Ticket },
    { path: '/orders', label: 'Đơn hàng', icon: ShoppingBag },
    { path: '/complaints', label: 'Khiếu nại', icon: MessageSquareWarning },
    { path: '/content', label: 'Nội dung', icon: FileText },
    { path: '/logs', label: 'Nhật ký', icon: History },
  ];

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');
      navigate('/login');
    }
  };

  return (
    <aside className="w-72 h-screen sticky top-0 bg-[#1a3a5c] border-r border-[#1e4168] text-[#a8c0d6] flex flex-col justify-between p-6 shrink-0 z-20 overflow-y-auto">
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-[#1e4168] rounded-lg flex items-center justify-center shadow-sm border border-[#2a5080]">
            <BarChart3 size={20} className="text-[#6ec6a0] stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg tracking-tight">DEALZY ADM</h2>
            <p className="text-[10px] text-[#6a90aa] font-bold uppercase tracking-widest">Hệ thống quản trị</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          <p className="text-[10px] font-bold text-[#4a7090] uppercase tracking-widest px-2 mb-3">Phân hệ chức năng</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="block group">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 relative ${
                  isActive
                    ? 'bg-[#1e4168] text-white'
                    : 'hover:bg-[#1e4168] hover:text-white text-[#a8c0d6]'
                }`}>
                  <Icon
                    size={18}
                    className={isActive ? 'text-[#6ec6a0]' : 'text-[#6a90aa] group-hover:text-[#6ec6a0]'}
                  />
                  {item.label}
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="sidebarActiveIndicator"
                        className="absolute right-3 w-1.5 h-1.5 bg-[#6ec6a0] rounded-full"
                      />
                      <motion.div
                        layoutId="sidebarActiveBorder"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#6ec6a0] rounded-r-full"
                      />
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="space-y-4 pt-4 border-t border-[#1e4168]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 active:scale-[0.98] transition-all duration-150 border border-transparent hover:border-rose-400/20"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>

        <div className="px-2 text-[11px] text-[#4a7090] font-bold uppercase tracking-wider flex justify-between items-center select-none">
          <span>Version v1.1</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#6ec6a0] animate-pulse" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Store, 
  Ticket, 
  MessageSquareWarning, 
  History, 
  LogOut,Search, Globe, Bell,
  ShoppingBag
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/', label: 'Tổng Quan', icon: BarChart3 },
    { path: '/partners', label: 'Quản Lý Đối Tác', icon: Store },
    { path: '/users', label: 'Quản Lý Người Dùng', icon: Users },
    { path: '/vouchers', label: 'Quản Lý Voucher', icon: Ticket },
    { path: '/orders', label: 'Quản Lý Đơn Hàng', icon: ShoppingBag },
    { path: '/complaints', label: 'Xử Lý Khiếu Nại', icon: MessageSquareWarning },
    { path: '/logs', label: 'Lịch Sử Hệ Thống', icon: History },
  ];

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?")) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/login'); 
    }
  };

  return (
    <aside className="w-72 h-screen sticky top-0 bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col justify-between p-6 shrink-0 z-20 overflow-y-auto">
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

      {/* Footer Info & Nút Đăng Xuất */}
      <div className="space-y-4 pt-4 border-t border-slate-800/60">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 active:scale-[0.98] transition-all duration-150 border border-transparent hover:border-rose-500/20"
        >
          <LogOut size={18} />
          <span>Đăng xuất tài khoản</span>
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;
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
    { path: '/', label: 'Tong Quan', icon: BarChart3 },
    { path: '/partners', label: 'Duyet Doi Tac', icon: Store },
    { path: '/users', label: 'Nguoi Dung', icon: Users },
    { path: '/vouchers', label: 'Voucher', icon: Ticket },
    { path: '/orders', label: 'Don Hang', icon: ShoppingBag },
    { path: '/complaints', label: 'Khieu Nai', icon: MessageSquareWarning },
    { path: '/content', label: 'Noi Dung', icon: FileText },
    { path: '/logs', label: 'Nhat Ky', icon: History },
  ];

  const handleLogout = () => {
    if (window.confirm('Ban co chac chan muon dang xuat?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/login');
    }
  };

  return (
    <aside className="w-72 h-screen sticky top-0 bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col justify-between p-6 shrink-0 z-20 overflow-y-auto">
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <BarChart3 size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg tracking-tight">DEALZY ADM</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">He thong quan tri</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-3">Phan he chuc nang</p>
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

      <div className="space-y-4 pt-4 border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 active:scale-[0.98] transition-all duration-150 border border-transparent hover:border-rose-500/20"
        >
          <LogOut size={18} />
          <span>Dang xuat</span>
        </button>

        <div className="px-2 text-[11px] text-slate-600 font-bold uppercase tracking-wider flex justify-between items-center select-none">
          <span>Version v1.1</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

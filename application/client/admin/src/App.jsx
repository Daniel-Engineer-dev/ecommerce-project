import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  Store, 
  MessageSquareWarning, 
  History, 
  BarChart3,
  Search,
  Check,
  X,
  MoreVertical
} from 'lucide-react';
import PartnerApproval from './pages/PartnerApproval';

// Mock Pages
const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-8">Bảng điều khiển quản trị</h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'Tổng người dùng', value: '1,240', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Đối tác đã duyệt', value: '42', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Voucher lưu hành', value: '8,500', color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Khiếu nại mới', value: '5', color: 'text-red-600', bg: 'bg-red-50' },
      ].map((stat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`${stat.bg} p-6 rounded-3xl border border-white shadow-sm`}
        >
          <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
          <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Store size={20} className="text-indigo-600" />
          Đối tác chờ phê duyệt
        </h2>
        <div className="space-y-4">
          {[
            { name: 'Sushi X', rep: 'Lê Văn Tám', date: '10/05/2026' },
            { name: 'Luxury Spa', rep: 'Trần Thị Mỹ', date: '12/05/2026' },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-gray-500">Đại diện: {p.rep} • {p.date}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><Check size={16} /></button>
                <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><X size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <MessageSquareWarning size={20} className="text-red-600" />
          Khiếu nại mới nhất
        </h2>
        <div className="space-y-4">
          {[
            { user: 'Daniel N.', content: 'Mã voucher không sử dụng được tại chi nhánh Q.1', priority: 'High' },
            { user: 'Minh Tuấn', content: 'Cần hỗ trợ hoàn tiền đơn hàng #9982', priority: 'Normal' },
          ].map((c, i) => (
            <div key={i} className="p-4 border border-gray-100 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-sm">{c.user}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {c.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: BarChart3, label: 'Tổng quan' },
    { path: '/partners', icon: Store, label: 'Quản lý đối tác' },
    { path: '/users', icon: Users, label: 'Người dùng' },
    { path: '/complaints', icon: MessageSquareWarning, label: 'Khiếu nại (DR-06)' },
    { path: '/logs', icon: History, label: 'Nhật ký hệ thống' },
  ];

  return (
    <div className="w-72 bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col">
      <div className="p-8">
        <div className="flex items-center gap-3 text-white font-black text-2xl tracking-tighter">
          <ShieldCheck size={32} className="text-indigo-400" />
          ADMIN CP
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
              location.pathname === item.path 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
              : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={22} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-white">AD</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">Administrator</p>
            <p className="text-xs text-slate-500 truncate">admin@evoucher.vn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import AuthPage from './pages/AuthPage';

function App() {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-10 flex justify-between items-center px-8">
            <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Tìm kiếm hệ thống..." className="bg-transparent border-none outline-none text-sm w-full" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full">SYSTEM ONLINE</div>
            </div>
          </header>
          
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/partners" element={<PartnerApproval />} />
              <Route path="/users" element={<div className="p-8">Quản lý người dùng và phân quyền</div>} />
              <Route path="/complaints" element={<div className="p-8">Hệ thống xử lý khiếu nại & DR-06</div>} />
              <Route path="/logs" element={<div className="p-8">Audit Logs & System History</div>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Ticket, 
  CheckCircle, 
  Settings, 
  LogOut, 
  Bell,
  Menu,
  X
} from 'lucide-react';

// Mock Pages
const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">Tổng quan kinh doanh</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[
        { label: 'Doanh thu tháng', value: '45,200,000đ', color: 'bg-blue-500' },
        { label: 'Voucher đã bán', value: '128', color: 'bg-purple-500' },
        { label: 'Voucher đã sử dụng', value: '85', color: 'bg-green-500' },
      ].map((stat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <p className="text-gray-500 text-sm">{stat.label}</p>
          <p className="text-3xl font-bold mt-2">{stat.value}</p>
        </motion.div>
      ))}
    </div>
    
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">Hoạt động gần đây</h2>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="font-medium">Voucher Buffet Sheraton - #SHER123</p>
              <p className="text-sm text-gray-500">Khách hàng: Daniel Nguyen • 2 giờ trước</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">Đã sử dụng</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const VoucherManagement = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Quản lý Voucher</h1>
      <button className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors">
        + Tạo Voucher mới
      </button>
    </div>
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 font-semibold text-sm text-gray-600">Tên Voucher</th>
            <th className="p-4 font-semibold text-sm text-gray-600">Giá bán</th>
            <th className="p-4 font-semibold text-sm text-gray-600">Tồn kho</th>
            <th className="p-4 font-semibold text-sm text-gray-600">Trạng thái</th>
            <th className="p-4 font-semibold text-sm text-gray-600">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {[
            { name: 'Buffet Hải Sản Sheraton', price: '790k', stock: '45/50', status: 'Đang bán' },
            { name: 'Gói Spa Toàn Thân', price: '450k', stock: '92/100', status: 'Đang bán' },
          ].map((v, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-medium">{v.name}</td>
              <td className="p-4">{v.price}</td>
              <td className="p-4">{v.stock}</td>
              <td className="p-4">
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-lg text-xs">{v.status}</span>
              </td>
              <td className="p-4 text-purple-600 cursor-pointer hover:underline">Chỉnh sửa</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RedeemVoucher = () => (
  <div className="p-6 max-w-2xl mx-auto">
    <h1 className="text-2xl font-bold mb-6 text-center">Xác thực Voucher</h1>
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      <p className="text-gray-600 mb-4 text-center">Nhập mã voucher hoặc quét QR để kiểm tra tính hợp lệ.</p>
      <div className="space-y-4">
        <input 
          type="text" 
          placeholder="VD: ABC-123-XYZ"
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-2xl font-mono focus:ring-2 focus:ring-purple-500 outline-none"
        />
        <button className="w-full bg-purple-600 text-white p-4 rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200">
          Kiểm tra mã
        </button>
      </div>
    </div>
  </div>
);

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Bảng điều khiển' },
    { path: '/vouchers', icon: Ticket, label: 'Voucher của tôi' },
    { path: '/redeem', icon: CheckCircle, label: 'Xác thực mã' },
    { path: '/settings', icon: Settings, label: 'Cài đặt' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 text-purple-600 font-bold text-xl">
          <div className="w-8 h-8 bg-purple-600 rounded-lg"></div>
          PartnerHub
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path 
              ? 'bg-purple-50 text-purple-600 font-medium' 
              : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 w-full rounded-xl transition-all">
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

import AuthPage from './pages/AuthPage';

function App() {
  const token = localStorage.getItem('partnerToken');

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
      <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-10 flex justify-between items-center px-8">
            <div className="text-sm text-gray-500">Xin chào, Sheraton Partner 👋</div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                <img src="https://ui-avatars.com/api/?name=Sheraton+Hotel" alt="avatar" />
              </div>
            </div>
          </header>
          
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vouchers" element={<VoucherManagement />} />
              <Route path="/redeem" element={<RedeemVoucher />} />
              <Route path="/settings" element={<div className="p-6">Cài đặt tài khoản</div>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;

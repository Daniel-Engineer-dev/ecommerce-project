import React, { useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Search, Globe, Bell, ArrowRight, ClipboardCheck, FileText, History, LayoutDashboard, MessageSquareWarning, ShoppingBag, Ticket, Users, X } from 'lucide-react';

import Sidebar from './components/SideBar';
import NoAccess from './components/NoAccess';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import PartnerApproval from './pages/PartnerApproval';
import UserManagement from './pages/UserManagement';
import VoucherManagement from './pages/VoucherManagement';
import OrderManagement from './pages/OrderManagement';
import ComplaintManagement from './pages/ComplaintManagement';
import ContentManagement from './pages/ContentManagement';
import SystemLogs from './pages/SystemLogs';
import { canAccessPath } from './scopes';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Chặn admin truy cập phân hệ ngoài phạm vi: hiện màn hình "Không đủ quyền"
const ScopedRoute = ({ path, children }) => (canAccessPath(path) ? children : <NoAccess />);

const quickActions = [
  { label: 'Dashboard tổng quan', description: 'Thống kê hệ thống và biểu đồ vận hành', path: '/', icon: LayoutDashboard, keywords: 'dashboard tong quan thong ke' },
  { label: 'Duyệt đối tác', description: 'Xem và duyệt hồ sơ doanh nghiệp', path: '/partners', icon: ClipboardCheck, keywords: 'doi tac partner duyet doanh nghiep' },
  { label: 'Quản lý người dùng', description: 'Tài khoản khách hàng, đối tác và admin', path: '/users', icon: Users, keywords: 'user nguoi dung tai khoan khach hang doi tac' },
  { label: 'Duyệt voucher', description: 'Voucher chờ duyệt, đã duyệt và tạm ẩn', path: '/vouchers', icon: Ticket, keywords: 'voucher ma uu dai duyet an' },
  { label: 'Đơn hàng', description: 'Tra cứu đơn thanh toán và trạng thái mua hàng', path: '/orders', icon: ShoppingBag, keywords: 'don hang order thanh toan' },
  { label: 'Khiếu nại', description: 'Theo dõi phản hồi và xử lý yêu cầu hỗ trợ', path: '/complaints', icon: MessageSquareWarning, keywords: 'khieu nai complaint ho tro' },
  { label: 'Nội dung', description: 'Cấu hình nội dung, chính sách và trang tĩnh', path: '/content', icon: FileText, keywords: 'noi dung content chinh sach' },
  { label: 'Log hệ thống', description: 'Lịch sử thao tác và sự kiện quản trị', path: '/logs', icon: History, keywords: 'log he thong lich su su kien' },
];

const notifications = [
  { title: 'Có voucher chờ duyệt', description: 'Kiểm tra danh sách voucher pending từ đối tác.', path: '/vouchers' },
  { title: 'Theo dõi khiếu nại mới', description: 'Mở trang khiếu nại để xử lý các phản hồi gần đây.', path: '/complaints' },
  { title: 'Kiểm tra nhật ký hệ thống', description: 'Xem log để rà soát hoạt động quản trị.', path: '/logs' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Chỉ hiện các khu vực nằm trong phạm vi quản trị của admin đang đăng nhập
  const allowedActions = useMemo(() => quickActions.filter((item) => canAccessPath(item.path)), []);
  const allowedNotifications = useMemo(() => notifications.filter((item) => canAccessPath(item.path)), []);

  const filteredActions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return allowedActions.slice(0, 5);
    return allowedActions.filter((item) => {
      const haystack = `${item.label} ${item.description} ${item.keywords}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query, allowedActions]);

  const goTo = (path) => {
    navigate(path);
    setQuery('');
    setIsSearchOpen(false);
    setIsNotificationsOpen(false);
    setIsStatusOpen(false);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    if (filteredActions[0]) goTo(filteredActions[0].path);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-100 w-full overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 p-4 sticky top-0 z-10 flex justify-between items-center px-8 h-20 shrink-0">
          <form ref={searchRef} onSubmit={submitSearch} className="relative w-96">
            <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-2.5 rounded-2xl border border-slate-200/20 focus-within:bg-white focus-within:border-indigo-500/30 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Tìm nhanh dữ liệu quản trị..."
                className="bg-transparent border-none outline-none text-sm w-full font-medium text-slate-700 placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+10px)] bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden z-30">
                <div className="px-4 py-3 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Điều hướng nhanh
                </div>
                <div className="p-2">
                  {filteredActions.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-slate-500">Không tìm thấy khu vực phù hợp.</div>
                  ) : (
                    filteredActions.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => goTo(item.path)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group"
                        >
                          <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">
                            <Icon size={17} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-slate-800">{item.label}</span>
                            <span className="block text-xs text-slate-500 truncate">{item.description}</span>
                          </span>
                          <ArrowRight size={15} className="text-slate-300 group-hover:text-indigo-500" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </form>

          <div className="flex items-center gap-4">
            <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen((value) => !value);
                setIsStatusOpen(false);
              }}
              className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors relative"
              aria-label="Mở thông báo"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full" />
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-80 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden z-30">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-black text-slate-900">Thông báo quản trị</div>
                  <div className="text-xs text-slate-500 mt-0.5">Các khu vực nên kiểm tra nhanh</div>
                </div>
                <div className="p-2">
                  {allowedNotifications.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => goTo(item.path)}
                      className="w-full text-left px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-sm font-bold text-slate-800">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            </div>
            <div className="h-5 w-px bg-slate-200" />
            <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStatusOpen((value) => !value);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100/60 text-emerald-700 rounded-xl text-xs font-bold tracking-wide hover:bg-emerald-100/70 transition-colors"
              aria-label="Xem trạng thái hệ thống"
            >
              <Globe size={14} className="animate-spin-slow" />
              <span>HỆ THỐNG ONLINE</span>
            </button>
            {isStatusOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-72 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-4 z-30">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                  Hệ thống đang hoạt động
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-500">
                  <div className="flex justify-between"><span>API quản trị</span><b className="text-slate-700">Sẵn sàng</b></div>
                  <div className="flex justify-between"><span>Realtime</span><b className="text-slate-700">Đang lắng nghe</b></div>
                  <div className="flex justify-between"><span>Phiên đăng nhập</span><b className="text-slate-700">Hợp lệ</b></div>
                </div>
                <button
                  type="button"
                  onClick={() => goTo('/logs')}
                  className="mt-4 w-full h-9 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Xem log hệ thống
                </button>
              </div>
            )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/partners" element={<ScopedRoute path="/partners"><PartnerApproval /></ScopedRoute>} />
              <Route path="/users" element={<ScopedRoute path="/users"><UserManagement /></ScopedRoute>} />
              <Route path="/vouchers" element={<ScopedRoute path="/vouchers"><VoucherManagement /></ScopedRoute>} />
              <Route path="/orders" element={<ScopedRoute path="/orders"><OrderManagement /></ScopedRoute>} />
              <Route path="/complaints" element={<ScopedRoute path="/complaints"><ComplaintManagement /></ScopedRoute>} />
              <Route path="/content" element={<ScopedRoute path="/content"><ContentManagement /></ScopedRoute>} />
              <Route path="/logs" element={<ScopedRoute path="/logs"><SystemLogs /></ScopedRoute>} />
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

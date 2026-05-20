import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Store, Ticket, MessageSquareWarning, 
  TrendingUp, ArrowUpRight, ArrowDownRight, CalendarDays
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';

const API_BASE = 'http://localhost:5000/api/admin';

// ─── MOCK DATA PHÂN TÍCH THEO CÁC MỐC THỜI GIAN (THÁNG / QUÝ / NĂM) ───────────
const timeDataMock = {
  month: [
    { name: 'T1', doanhThu: 45, voucher: 320, customer: 210, partner: 15 },
    { name: 'T2', doanhThu: 52, voucher: 410, customer: 280, partner: 18 },
    { name: 'T3', doanhThu: 49, voucher: 380, customer: 240, partner: 14 },
    { name: 'T4', doanhThu: 72, voucher: 650, customer: 460, partner: 25 },
    { name: 'T5', doanhThu: 85, voucher: 890, customer: 590, partner: 32 },
    { name: 'T6', doanhThu: 98, voucher: 1050, customer: 680, partner: 40 },
  ],
  quarter: [
    { name: 'Quý 1', doanhThu: 146, voucher: 1110, customer: 730, partner: 47 },
    { name: 'Quý 2', doanhThu: 255, voucher: 2590, customer: 1730, partner: 97 },
    { name: 'Quý 3', doanhThu: 310, voucher: 3400, customer: 2100, partner: 120 },
    { name: 'Quý 4', doanhThu: 420, voucher: 4800, customer: 3200, partner: 165 },
  ],
  year: [
    { name: '2024', doanhThu: 850, voucher: 7800, customer: 4500, partner: 210 },
    { name: '2025', doanhThu: 1240, voucher: 12400, customer: 8200, partner: 340 },
    { name: '2026', doanhThu: 1890, voucher: 19500, customer: 11400, partner: 490 },
  ]
};

// Thành phần Thẻ Thống Kê Tổng Quan (Mini Stat Card)
const StatCard = ({ title, value, icon: Icon, change, isPositive, colorClass, bgClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between"
  >
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
      <div className={`p-3 rounded-2xl ${bgClass} ${colorClass}`}>
        <Icon size={20} className="stroke-[2.2]" />
      </div>
    </div>
    <div className="flex items-center gap-1.5 mt-4 text-xs font-bold">
      <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg ${
        isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
      }`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </span>
      <span className="text-slate-400 font-medium">So với kỳ trước</span>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [timeUnit, setTimeUnit] = useState('month'); // Trạng thái chọn bộ lọc 'month' | 'quarter' | 'year'
  const [stats, setStats] = useState({
    totalUsers: 1240,
    approvedPartners: 42,
    activeVouchers: 8500,
    newComplaints: 5
  });

  // Gọi API để lấy số liệu thực tế từ hệ thống (nếu có)
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE}/users/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Đồng bộ hóa dữ liệu thực từ câu lệnh COUNT(*) hệ thống của bạn
          setStats(prev => ({
            ...prev,
            totalUsers: data.total_users || prev.totalUsers,
            approvedPartners: data.total_partners || prev.approvedPartners
          }));
        }
      } catch (err) {
        console.error("Lỗi đồng bộ dữ liệu API Dashboard:", err);
      }
    };
    fetchDashboardStats();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8 space-y-8"
    >
      {/* Upper Headline Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Tổng Quan
          </h1>
        </div>

        {/* Bộ lọc Mốc thời gian linh hoạt (Tháng / Quý / Năm) */}
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200/30 self-start md:self-auto shadow-inner">
          <CalendarDays size={16} className="text-slate-500 ml-2 mr-1" />
          {[
            { id: 'month', label: 'Theo Tháng' },
            { id: 'quarter', label: 'Theo Quý' },
            { id: 'year', label: 'Theo Năm' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeUnit(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                timeUnit === item.id 
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-300/40' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid 4 Thẻ Tổng Quan Chỉ Số */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng người dùng" 
          value={stats.totalUsers.toLocaleString()} 
          icon={Users} 
          change="+12.4%" isPositive={true}
          colorClass="text-blue-600" bgClass="bg-blue-50"
        />
        <StatCard 
          title="Đối tác đã duyệt" 
          value={stats.approvedPartners.toLocaleString()} 
          icon={Store} 
          change="+8.2%" isPositive={true}
          colorClass="text-indigo-600" bgClass="bg-indigo-50"
        />
        <StatCard 
          title="Voucher hiện có" 
          value={stats.activeVouchers.toLocaleString()} 
          icon={Ticket} 
          change="+24.5%" isPositive={true}
          colorClass="text-purple-600" bgClass="bg-purple-50"
        />
        <StatCard 
          title="Khiếu nại cần xử lý" 
          value={stats.newComplaints.toLocaleString()} 
          icon={MessageSquareWarning} 
          change="-4.1%" isPositive={true}
          colorClass="text-rose-600" bgClass="bg-rose-50"
        />
      </div>

      {/* Khu vực Đồ thị / Biểu đồ Phân tích chuyên sâu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Biểu đồ Doanh thu (Chiếm 7 cột) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Biểu đồ tăng trưởng doanh thu</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Đơn vị tính: Triệu VND (VNĐ)</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl text-xs font-bold">
              <TrendingUp size={14} /> +18.6% xu hướng
            </div>
          </div>
          
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeDataMock[timeUnit]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="doanhThu" name="Doanh Thu" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorDoanhThu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Phân bổ Cơ cấu Người dùng mới (Chiếm 5 cột) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Cơ cấu đăng ký tài khoản mới</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Phát triển quy mô Khách hàng & Đối tác</p>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeDataMock[timeUnit]} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', pt: 10 }} />
                <Bar dataKey="customer" name="Khách Hàng" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="partner" name="Đối Tác" stackId="a" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default AdminDashboard;
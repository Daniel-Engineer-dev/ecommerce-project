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
import { API_ADMIN_URL } from '../config';
import { apiFetch } from '../apiClient';
import { createRealtimeSource } from '../realtime';

const API_BASE = API_ADMIN_URL;

// ── Stat Card component ────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, change, isPositive, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
  >
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
      </div>
      <div className={`p-2.5 rounded-xl ${accent.bg}`}>
        <Icon size={18} strokeWidth={2} className={accent.icon} />
      </div>
    </div>
    <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold">
      <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
        isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-500 bg-rose-50'
      }`}>
        {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        {change}
      </span>
      <span className="text-slate-400 font-normal">So với kỳ trước</span>
    </div>
  </motion.div>
);

// ── Skeleton placeholder khi đang tải biểu đồ ─────────────────────────────────
const ChartSkeleton = () => (
  <div className="h-64 w-full flex items-center justify-center">
    <div className="w-full h-full animate-pulse bg-slate-50 rounded-xl" />
  </div>
);

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [timeUnit, setTimeUnit] = useState('month');
  const [stats, setStats] = useState({
    totalUsers:       0,
    approvedPartners: 0,
    activeVouchers:   0,
    newComplaints:    0,
  });
  const [chartData, setChartData]     = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchStatCards = async () => {
    try {
      const token   = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, extraRes] = await Promise.all([
        apiFetch(`${API_BASE}/users/stats`,     { headers }),
        apiFetch(`${API_BASE}/dashboard/stats`, { headers }),
      ]);

      if (userRes.ok) {
        const data = await userRes.json();
        setStats(prev => ({
          ...prev,
          totalUsers:       data.total_users    ?? prev.totalUsers,
          approvedPartners: data.total_partners ?? prev.approvedPartners,
        }));
      }

      if (extraRes.ok) {
        const data = await extraRes.json();
        setStats(prev => ({
          ...prev,
          activeVouchers: data.active_vouchers    ?? prev.activeVouchers,
          newComplaints:  data.pending_complaints ?? prev.newComplaints,
        }));
      }
    } catch (err) {
      console.error('Lỗi tải stat cards:', err);
    }
  };

  // ── Stat cards: /users/stats  +  /dashboard/stats ──────────────────────────
  useEffect(() => {
    fetchStatCards();
  }, []);

  useEffect(() => {
    const source = createRealtimeSource();
    if (!source) return undefined;
    source.addEventListener('voucher.status_changed', fetchStatCards);
    source.addEventListener('voucher.updated', fetchStatCards);
    return () => source.close();
  }, []);

  // ── Chart data: /dashboard/chart?unit=... (gọi lại khi timeUnit đổi) ────────
  useEffect(() => {
    const fetchChart = async () => {
      setChartLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const res   = await apiFetch(`${API_BASE}/dashboard/chart?unit=${timeUnit}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setChartData(data.chartData ?? []);
        }
      } catch (err) {
        console.error('Lỗi tải chart data:', err);
      } finally {
        setChartLoading(false);
      }
    };
    fetchChart();
  }, [timeUnit]);

  const cardAccents = [
    { bg: 'bg-blue-50',    icon: 'text-blue-400'    },
    { bg: 'bg-violet-50',  icon: 'text-violet-400'  },
    { bg: 'bg-emerald-50', icon: 'text-emerald-400' },
    { bg: 'bg-amber-50',   icon: 'text-amber-400'   },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 space-y-6 bg-[#f5f7fa] min-h-screen"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5">
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-1">
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Tổng quan</h1>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm self-start md:self-auto">
          <CalendarDays size={14} className="text-slate-400 ml-2 mr-1" />
          {[
            { id: 'month',   label: 'Tháng' },
            { id: 'quarter', label: 'Quý'   },
            { id: 'year',    label: 'Năm'   },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeUnit(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeUnit === item.id
                  ? 'bg-[#1a3a5c] text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tổng người dùng"     value={stats.totalUsers.toLocaleString()}       icon={Users}                change="+12.4%" isPositive={true}  accent={cardAccents[0]} />
        <StatCard title="Đối tác đã duyệt"    value={stats.approvedPartners.toLocaleString()} icon={Store}                change="+8.2%"  isPositive={true}  accent={cardAccents[1]} />
        <StatCard title="Voucher hiện có"      value={stats.activeVouchers.toLocaleString()}   icon={Ticket}               change="+24.5%" isPositive={true}  accent={cardAccents[2]} />
        <StatCard title="Khiếu nại cần xử lý" value={stats.newComplaints.toLocaleString()}    icon={MessageSquareWarning} change="-4.1%"  isPositive={false} accent={cardAccents[3]} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Area Chart – Doanh thu */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-7">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-700 text-sm">Tăng trưởng doanh thu</h3>
              <p className="text-xs text-slate-400 mt-0.5">Đơn vị tính: Triệu VNĐ</p>
            </div>
          </div>

          {chartLoading ? <ChartSkeleton /> : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6ec6a0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6ec6a0" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: '600' }} />
                  <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: '600' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', color: '#334155', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value) => [`${value} Tr.đ`, 'Doanh thu']}
                  />
                  <Area type="monotone" dataKey="doanhThu" stroke="#6ec6a0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDoanhThu)" dot={false} activeDot={{ r: 5, fill: '#6ec6a0', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart – Cơ cấu tài khoản */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-700 text-sm">Cơ cấu tài khoản mới</h3>
              <p className="text-xs text-slate-400 mt-0.5">Khách hàng & Đối tác</p>
            </div>
          </div>

          {chartLoading ? <ChartSkeleton /> : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: '600' }} />
                  <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: '600' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', color: '#334155', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '12px', color: '#64748b' }} />
                  <Bar dataKey="customer" name="Khách Hàng" stackId="a" fill="#a5d8c8" radius={[0, 0, 0, 0]} barSize={22} />
                  <Bar dataKey="partner"  name="Đối Tác"    stackId="a" fill="#1a3a5c" radius={[6, 6, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default AdminDashboard;






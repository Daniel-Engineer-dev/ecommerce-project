import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareWarning, RefreshCw, Send, CheckCircle, Lock,
  ChevronDown, ChevronUp, AlertTriangle, XCircle, User, Mail,
  ShoppingBag, Tag, Clock, FileText, Loader2
} from 'lucide-react';
import { API_ADMIN_URL } from '../config';
import { apiFetch } from '../apiClient';
import CustomSelect from '../components/CustomSelect';

const API = API_ADMIN_URL;
const getToken = () => localStorage.getItem('adminToken');

// Trạng thái lọc danh sách
const filterStatuses = ['', 'Pending', 'Processing', 'Resolved', 'Rejected'];

// Hướng giải quyết khi Chấp nhận (Luồng A)
const actionOptions = [
  { value: 'Refund', label: 'Hoàn tiền mô phỏng' },
  { value: 'NewCode', label: 'Cấp lại mã voucher mới' },
  { value: 'Other', label: 'Hỗ trợ khác (Ghi chú thủ công)' },
];

// ─── Sub-component: tư vấn cấp lại voucher ────────────────────────────────
const VoucherReissueAdvisor = ({ voucher, order }) => {
  if (!voucher) return null;

  const stock       = voucher.quantity_stock ?? null;
  const evStatus    = voucher.evoucher_status; // 'Unused' | 'Used' | 'Expired' | 'Locked' | null
  const voucherExp  = voucher.voucher_expiry ? new Date(voucher.voucher_expiry) : null;
  const orderStatus = order?.payment_status;
  const salePrice   = voucher.sale_price;

  const isExpired      = voucherExp && voucherExp < new Date();
  const isOutOfStock   = stock !== null && stock === 0;
  const isEvUsed       = evStatus === 'Used';
  const isEvLocked     = evStatus === 'Locked';
  const isOrderCancelled = orderStatus === 'Cancelled';

  // Tính toán khuyến nghị
  let recommendation = null; // 'reissue' | 'refund' | 'warn'
  const reasons = [];

  if (isEvUsed) {
    recommendation = 'refund';
    reasons.push({ icon: '⚠️', text: 'Mã e-voucher đã được sử dụng — không thể cấp lại mã đã dùng.' });
  }
  if (isOrderCancelled) {
    recommendation = 'refund';
    reasons.push({ icon: '🚫', text: 'Đơn hàng đã bị hủy — cấp lại voucher không khả thi.' });
  }
  if (isOutOfStock) {
    recommendation = recommendation === 'refund' ? 'refund' : 'refund';
    reasons.push({ icon: '📦', text: `Voucher này đã hết hàng (tồn kho: 0) — không thể phát sinh mã mới.` });
  }
  if (isExpired) {
    recommendation = recommendation || 'warn';
    reasons.push({ icon: '⏰', text: `Voucher gốc đã hết hạn (${voucherExp.toLocaleDateString('vi-VN')}) — mã cấp lại sẽ được gia hạn thêm 30 ngày.` });
  }
  if (isEvLocked) {
    recommendation = recommendation || 'warn';
    reasons.push({ icon: '🔒', text: 'Mã e-voucher hiện đang bị khóa (Locked).' });
  }

  if (!recommendation) {
    recommendation = 'reissue';
    reasons.push({ icon: '✅', text: `Còn ${stock} mã trong kho — đủ điều kiện cấp lại.` });
    if (evStatus === 'Unused') {
      reasons.push({ icon: '🎫', text: 'Mã e-voucher gốc chưa sử dụng — sẽ bị khóa và thay bằng mã mới.' });
    }
  }

  const styles = {
    reissue: {
      wrap:   'bg-emerald-50 border-emerald-200',
      header: 'text-emerald-700',
      badge:  'bg-emerald-100 text-emerald-700',
      label:  '✅ Nên cấp lại voucher',
    },
    refund: {
      wrap:   'bg-red-50 border-red-200',
      header: 'text-red-700',
      badge:  'bg-red-100 text-red-600',
      label:  '💸 Nên hoàn tiền cho khách',
    },
    warn: {
      wrap:   'bg-amber-50 border-amber-200',
      header: 'text-amber-700',
      badge:  'bg-amber-100 text-amber-700',
      label:  '⚠️ Cần xem xét thêm',
    },
  };

  const s = styles[recommendation];

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${s.wrap}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${s.header}`}>Đánh giá khả năng cấp lại</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${s.badge}`}>{s.label}</span>
      </div>

      {/* Thông tin tồn kho + giá */}
      <div className="flex gap-3 text-[11px]">
        <div className="flex-1 bg-white/70 rounded-lg px-2.5 py-1.5 border border-white">
          <p className="text-slate-400 font-semibold mb-0.5">Tồn kho</p>
          <p className={`font-bold text-sm ${stock === 0 ? 'text-red-600' : 'text-slate-700'}`}>
            {stock !== null ? `${stock} mã` : '—'}
          </p>
        </div>
        <div className="flex-1 bg-white/70 rounded-lg px-2.5 py-1.5 border border-white">
          <p className="text-slate-400 font-semibold mb-0.5">Giá bán</p>
          <p className="font-bold text-sm text-slate-700">
            {salePrice ? Number(salePrice).toLocaleString('vi-VN') + '₫' : '—'}
          </p>
        </div>
      </div>

      {/* Danh sách lý do */}
      <ul className="space-y-1">
        {reasons.map((r, i) => (
          <li key={i} className={`text-[11px] leading-snug ${s.header}`}>
            {r.icon} {r.text}
          </li>
        ))}
      </ul>

      {/* Hạn voucher gốc */}
      {voucherExp && (
        <p className="text-[10px] text-slate-400">
          Hạn voucher gốc: {voucherExp.toLocaleDateString('vi-VN')}
          {isExpired ? ' (đã hết hạn)' : ''}
        </p>
      )}
    </div>
  );
};

// Màu badge theo trạng thái
const statusBadge = {
  Pending:    'bg-amber-50 text-amber-600 border border-amber-200',
  Processing: 'bg-blue-50 text-blue-600 border border-blue-200',
  Resolved:   'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Rejected:   'bg-red-50 text-red-500 border border-red-200',
};
const statusLabel = {
  Pending: 'Chờ xử lý',
  Processing: 'Đang xử lý',
  Resolved: 'Đã xử lý',
  Rejected: 'Từ chối',
};

// ─── Sub-component: hiển thị chi tiết voucher + đơn hàng ───────────────────
const DetailPanel = ({ item }) => (
  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
    {/* Thông tin khách hàng */}
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Khách hàng</p>
      <div className="flex items-center gap-2 text-slate-600">
        <User size={12} className="text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-800">{item.full_name || item.username}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-600">
        <Mail size={12} className="text-slate-400 shrink-0" />
        <span>{item.email}</span>
      </div>
    </div>

    {/* Thông tin voucher */}
    {item.voucher && (
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Voucher liên quan</p>
        <div className="flex items-center gap-2 text-slate-600">
          <Tag size={12} className="text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800">{item.voucher.name}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[10px]">{item.voucher.code}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{item.voucher.usage_status}</span>
        </div>
        {item.voucher.expiry_date && (
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={11} className="shrink-0" />
            <span>HSD: {new Date(item.voucher.expiry_date).toLocaleDateString('vi-VN')}</span>
          </div>
        )}
      </div>
    )}

    {/* Thông tin đơn hàng */}
    {item.order && (
      <div className="space-y-1.5 sm:col-span-2 sm:border-t sm:border-slate-100 sm:pt-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Đơn hàng liên quan</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <ShoppingBag size={12} className="text-slate-400 shrink-0" />
            <span className="font-mono font-semibold">#{item.order.order_id}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>{new Date(item.order.purchase_date).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <span>{Number(item.order.amount).toLocaleString('vi-VN')}₫</span>
          </div>
          {/* E3: cảnh báo đơn đã hủy — hiển thị inline trong detail */}
          {item.order.payment_status === 'Cancelled' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-500 text-[10px] font-semibold border border-red-200">
              <AlertTriangle size={10} /> Đơn đã hủy
            </span>
          )}
          {item.order.payment_status !== 'Cancelled' && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
              {item.order.payment_status}
            </span>
          )}
        </div>
      </div>
    )}

    {/* E2: dữ liệu không nhất quán */}
    {(!item.voucher || !item.order) && (
      <div className="sm:col-span-2 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium">
        <AlertTriangle size={13} className="shrink-0 mt-0.5" />
        <span>
          Cảnh báo: {!item.voucher && !item.order ? 'Không tìm thấy đơn hàng và voucher' : !item.voucher ? 'Không tìm thấy voucher' : 'Không tìm thấy đơn hàng'} liên kết với khiếu nại này. 
        </span>
      </div>
    )}
  </div>
);

// ─── Sub-component: panel xử lý (Luồng A / B) ─────────────────────────────
const ActionPanel = ({ item, form, onChange, onMarkProcessing, onSubmit, submitting }) => {
  const isLocked = item.status === 'Resolved' || item.status === 'Rejected';
  // E3: đơn đã hủy và admin đang chọn Refund
  const refundBlocked = form.decision === 'Resolved' && form.actionType === 'Refund' && item.order?.payment_status === 'Cancelled';

  if (isLocked) {
    // E1: Đã đóng — hiển thị kết quả
    return (
      <div className="w-full md:w-80 shrink-0 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6">
        <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <Lock size={18} className="text-slate-400" />
          <p className="text-xs font-semibold text-slate-500">Phiên xử lý đã đóng</p>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${statusBadge[item.status]}`}>
            {statusLabel[item.status]}
          </span>
        </div>
        {item.response_content && (
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phản hồi đã gửi</p>
            <p className="text-xs text-slate-600 leading-relaxed">{item.response_content}</p>
          </div>
        )}
        {item.action_type && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Hành động</p>
            <p className="text-xs text-emerald-700 font-semibold">
              {actionOptions.find(o => o.value === item.action_type)?.label || item.action_type}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full md:w-80 shrink-0 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6">

      {/* Bước 1 (Luồng chính bước 5): Chuyển sang Đang xử lý nếu đang Pending */}
      {item.status === 'Pending' && (
        <button
          onClick={() => onMarkProcessing(item.complaint_id)}
          disabled={submitting}
          className="w-full px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          {submitting ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Nhận xử lý (→ Đang xử lý)
        </button>
      )}

      {/* Chỉ cho phép quyết định khi đã sang Processing */}
      {item.status === 'Processing' && (
        <>
          {/* Bước 7: Chọn hành động Chấp nhận / Từ chối */}
          <div className="flex gap-2">
            <button
              onClick={() => onChange('decision', 'Resolved')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                form.decision === 'Resolved'
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600'
              }`}
            >
              <CheckCircle size={13} /> Chấp nhận
            </button>
            <button
              onClick={() => onChange('decision', 'Rejected')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                form.decision === 'Rejected'
                  ? 'bg-red-500 border-red-500 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-500'
              }`}
            >
              <XCircle size={13} /> Từ chối
            </button>
          </div>

          {/* Luồng A: Chấp nhận — chọn hướng giải quyết */}
          {form.decision === 'Resolved' && (
            <>
              <CustomSelect
                className="w-full"
                buttonClassName="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-amber-200 text-xs font-semibold bg-amber-50 text-amber-700 outline-none focus:border-amber-400 active:scale-[0.98] transition-all"
                value={form.actionType || ''}
                onChange={(val) => onChange('actionType', val)}
                options={[{ value: '', label: '-- Chọn hướng giải quyết (A1) --' }, ...actionOptions]}
              />

              {/* Advisor: hiện khi chọn cấp lại voucher */}
              {form.actionType === 'NewCode' && (
                <VoucherReissueAdvisor voucher={item.voucher} order={item.order} />
              )}

              {/* E3: Cảnh báo hoàn tiền khi đơn đã hủy */}
              {refundBlocked && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-medium">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>Đơn hàng đã bị hủy — không thể hoàn tiền (BR-ADM-04). Vui lòng chọn phương án giải quyết khác.</span>
                </div>
              )}
            </>
          )}

          {/* Luồng B: Từ chối — bắt buộc nhập lý do */}
          <textarea
            value={form.responseContent || ''}
            onChange={(e) => onChange('responseContent', e.target.value)}
            rows={3}
            placeholder={
              form.decision === 'Rejected'
                ? 'Nhập lý do từ chối (bắt buộc — B1)...'
                : form.decision === 'Resolved'
                ? 'Nhập nội dung phản hồi cho khách hàng (A1)...'
                : 'Chọn Chấp nhận hoặc Từ chối trước...'
            }
            disabled={!form.decision}
            className={`w-full rounded-xl border p-3.5 text-sm outline-none resize-none placeholder:text-slate-400 transition-all leading-relaxed
              ${form.decision === 'Rejected' && !form.responseContent
                ? 'border-red-300 bg-red-50 focus:border-red-400'
                : 'border-slate-200 bg-[#f5f7fa] focus:bg-white focus:border-[#1a3a5c]'}
              ${!form.decision ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />

          {/* Nút Xác nhận */}
          <button
            onClick={() => onSubmit(item.complaint_id)}
            disabled={submitting || refundBlocked || !form.decision}
            className="w-full px-4 py-2.5 rounded-xl bg-[#1a3a5c] hover:bg-[#132a44] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {submitting
              ? <Loader2 size={14} className="animate-spin" />
              : <Send size={14} className="text-[#6ec6a0]" />
            }
            Xác nhận xử lý
          </button>
        </>
      )}

      {/* Pending nhưng chưa nhận — chỉ nói rõ cần nhận trước */}
      {item.status === 'Pending' && (
        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          Nhấn <strong className="text-slate-600">Nhận xử lý</strong> để chuyển sang <em>Đang xử lý</em> trước khi ra quyết định.
        </p>
      )}
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────
const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  // forms: { [complaint_id]: { decision: '', actionType: '', responseContent: '' } }
  const [forms, setForms] = useState({});
  const [expanded, setExpanded] = useState({}); // xem chi tiết voucher/đơn hàng
  const [toast, setToast] = useState(null); // { msg, type: 'success'|'error'|'warn' }
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState({}); // { [id]: bool }

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filterStatus) params.set('status', filterStatus);
      const res = await apiFetch(`${API}/complaints?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      const list = data.complaints || [];
      setComplaints(list);

      setForms(prev => {
        const next = { ...prev };
        list.forEach(c => {
          if (!next[c.complaint_id]) {
            next[c.complaint_id] = { decision: '', actionType: '', responseContent: '' };
          }
        });
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFormChange = (id, field, value) => {
    setForms(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // Luồng chính bước 5: chuyển Pending → Processing
  const markProcessing = async (id) => {
    setSubmitting(prev => ({ ...prev, [id]: true }));
    try {
      const res = await apiFetch(`${API}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Processing' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Đã chuyển sang Đang xử lý', 'success');
        fetchComplaints();
      } else {
        showToast(data.error || 'Cập nhật thất bại', 'error');
      }
    } finally {
      setSubmitting(prev => ({ ...prev, [id]: false }));
    }
  };

  // Luồng A / B: xác nhận xử lý
  const submitAction = async (id) => {
    const formData = forms[id] || {};
    const complaint = complaints.find(c => c.complaint_id === id);

    // E1: đã đóng
    if (complaint?.status === 'Resolved' || complaint?.status === 'Rejected') {
      showToast('Khiếu nại này đã được xử lý, không thể thay đổi trạng thái.', 'error');
      return;
    }

    // Validate Luồng A
    if (formData.decision === 'Resolved') {
      if (!formData.actionType) {
        showToast('Vui lòng chọn hướng giải quyết (A1)!', 'warn');
        return;
      }
      if (!formData.responseContent) {
        showToast('Vui lòng nhập nội dung phản hồi cho khách hàng!', 'warn');
        return;
      }
      // E3
      if (formData.actionType === 'Refund' && complaint?.order?.payment_status === 'Cancelled') {
        showToast('Đơn hàng đã hủy — không thể hoàn tiền. Chọn phương án khác (E3).', 'error');
        return;
      }
    }

    // Validate Luồng B
    if (formData.decision === 'Rejected' && !formData.responseContent) {
      showToast('Bắt buộc nhập lý do từ chối (B1)!', 'warn');
      return;
    }

    if (!formData.decision) {
      showToast('Vui lòng chọn Chấp nhận hoặc Từ chối!', 'warn');
      return;
    }

    setSubmitting(prev => ({ ...prev, [id]: true }));
    try {
      const payload = {
        status: formData.decision,           // 'Resolved' | 'Rejected'
        actionType: formData.actionType || null,
        responseContent: formData.responseContent,
      };

      const res = await apiFetch(`${API}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message || 'Xử lý thành công', 'success');
        fetchComplaints();
      } else {
        showToast(data.error || 'Cập nhật thất bại', 'error');
      }
    } finally {
      setSubmitting(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => { fetchComplaints(); }, [filterStatus]);

  const toastStyles = {
    success: 'bg-[#1a3a5c]',
    error:   'bg-red-600',
    warn:    'bg-amber-500',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-8 space-y-6 bg-[#f5f7fa] min-h-screen relative">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-1">Hỗ trợ & CSKH</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Xử lý Khiếu nại</h1>
        </div>
        <div className="flex gap-3 self-start md:self-auto">
          <CustomSelect
            className="w-48"
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            options={filterStatuses.map((s) => ({ value: s, label: s ? statusLabel[s] || s : 'Tất cả trạng thái' }))}
          />
          <button
            onClick={fetchComplaints}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#6ec6a0]' : ''} /> Đồng bộ
          </button>
        </div>
      </div>

      {/* Danh sách (Luồng chính bước 2) */}
      <div className="grid gap-4">
        {complaints.map((item) => {
          const form = forms[item.complaint_id] || {};
          const isExpanded = !!expanded[item.complaint_id];
          const hasDetail = item.voucher || item.order || item.email;

          return (
            <div key={item.complaint_id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">

              {/* Cột trái: thông tin khiếu nại */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">#{item.complaint_id}</span>
                  {item.priority && (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wider">
                      {item.priority}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${statusBadge[item.status] || 'bg-slate-100 text-slate-500'}`}>
                    {statusLabel[item.status] || item.status}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {item.created_at && new Date(item.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-800">{item.title || 'Khiếu nại không có tiêu đề'}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.content}</p>

                {/* Nút xem chi tiết (Luồng chính bước 3–4) */}
                {hasDetail && (
                  <button
                    onClick={() => toggleExpand(item.complaint_id)}
                    className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#1a3a5c] hover:text-[#132a44] transition-colors"
                  >
                    <FileText size={12} />
                    {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết (voucher, đơn hàng, KH)'}
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}

                {/* Chi tiết mở rộng */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <DetailPanel item={item} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cột phải: panel xử lý */}
              <ActionPanel
                item={item}
                form={form}
                onChange={(field, value) => handleFormChange(item.complaint_id, field, value)}
                onMarkProcessing={markProcessing}
                onSubmit={submitAction}
                submitting={!!submitting[item.complaint_id]}
              />
            </div>
          );
        })}

        {!loading && complaints.length === 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm">
            <MessageSquareWarning size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-sm">Hệ thống hiện không có khiếu nại nào phù hợp.</p>
          </div>
        )}
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-medium text-sm shadow-xl ${toastStyles[toast.type]}`}
          >
            {toast.type === 'success' && <CheckCircle size={16} className="text-[#6ec6a0]" />}
            {toast.type === 'error' && <XCircle size={16} />}
            {toast.type === 'warn' && <AlertTriangle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ComplaintManagement;
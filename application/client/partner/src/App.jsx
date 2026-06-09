import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import jsQR from 'jsqr';
import {
  BarChart3,
  Building2,
  CheckCircle,
  Check,
  ChevronDown,
  ClipboardCheck,
  Edit3,
  Eye,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Settings,
  Ticket,
  UploadCloud,
  User,
  XCircle,
} from 'lucide-react';
import AuthPage from './pages/AuthPage';
import PartnerRegistration from './pages/PartnerRegistration';
import Profile from './pages/Profile';
import ChatbotWidget from './components/ChatbotWidget';
import { API_BASE_URL } from './config';
import { apiJson, clearSession } from './apiClient';
import { createRealtimeSource } from './realtime';

const API_URL = API_BASE_URL;

const money = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0));

const dateOnly = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const dateTime = (value) => {
  if (!value) return 'Chưa ghi nhận';
  return new Date(value).toLocaleString('vi-VN');
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const QR_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/gif']);
const QR_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif'];
const QR_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const VOUCHER_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const VOUCHER_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const CATEGORY_LABELS_VI = {
  Beauty: 'Làm đẹp',
  Cafe: 'Cà phê',
  Dining: 'Ẩm thực',
  Education: 'Giáo dục',
  Entertainment: 'Giải trí',
  Health: 'Sức khỏe',
  Hotels: 'Khách sạn',
  Shopping: 'Mua sắm',
  Spa: 'Spa & thư giãn',
  Travel: 'Du lịch',
};

const ORDER_STATUS_LABELS_VI = {
  Pending: 'Chờ thanh toán',
  Paid: 'Đã thanh toán',
  Completed: 'Đã hoàn tất',
  Cancelled: 'Đã hủy',
  Failed: 'Thanh toán thất bại',
  Expired: 'Đã hết hạn',
  Refunded: 'Đã hoàn tiền',
};

const categoryLabelVi = (label) => CATEGORY_LABELS_VI[label] || label;
const orderStatusLabelVi = (status) => ORDER_STATUS_LABELS_VI[status] || status;

const decodeQrWithCanvas = async (file) => {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Không thể xử lý ảnh QR trên trình duyệt này.');

    context.drawImage(bitmap, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(imageData.data, imageData.width, imageData.height);
    return result?.data || '';
  } finally {
    bitmap.close?.();
  }
};

const decodeQrFromImageFile = async (file) => {
  if ('BarcodeDetector' in window) {
    const bitmap = await createImageBitmap(file);
    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const results = await detector.detect(bitmap);
      if (results[0]?.rawValue) return results[0].rawValue;
    } finally {
      bitmap.close?.();
    }
  }

  return decodeQrWithCanvas(file);
};

const apiFetch = async (path, options = {}) => {
  return apiJson(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
};

const shell = {
  page: { padding: '30px', display: 'flex', flexDirection: 'column', gap: '22px' },
  card: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
  },
  input: {
    width: '100%',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 12px',
    font: 'inherit',
    background: '#fff',
  },
  label: { fontSize: '0.78rem', fontWeight: 800, color: '#475467', marginBottom: '6px', display: 'block' },
  button: {
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
};

function StatusPill({ status }) {
  const map = {
    Approved: ['#dcfce7', '#166534', 'Đã duyệt'],
    Pending: ['#fef3c7', '#92400e', 'Chờ duyệt'],
    Rejected: ['#fee2e2', '#991b1b', 'Từ chối'],
    Suspended: ['#fee2e2', '#991b1b', 'Tạm ngưng'],
    Disabled: ['#fee2e2', '#991b1b', 'Tạm ngưng'],
    Used: ['#e0e7ff', '#3730a3', 'Đã dùng'],
    Unused: ['#dcfce7', '#166534', 'Chưa dùng'],
    Expired: ['#fee2e2', '#991b1b', 'Hết hạn'],
    Locked: ['#f1f5f9', '#475569', 'Đã khóa'],
  };
  const [bg, color, label] = map[status] || ['#f1f5f9', '#475569', status || 'Không rõ'];
  return (
    <span
      style={{
        background: bg,
        color,
        minWidth: '86px',
        minHeight: '30px',
        padding: '6px 12px',
        borderRadius: '999px',
        fontSize: '0.74rem',
        fontWeight: 900,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  );
}

function LoadingBlock({ text = 'Đang tải dữ liệu...' }) {
  return (
    <div style={{ ...shell.card, padding: '36px', textAlign: 'center', color: '#64748b' }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
      <div>{text}</div>
    </div>
  );
}

function ErrorBox({ message }) {
  if (!message) return null;
  return <div style={{ padding: '12px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: '12px', fontWeight: 700 }}>{message}</div>;
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setData(await apiFetch('/api/partner/dashboard'));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const source = createRealtimeSource();
    if (!source) return undefined;
    const refresh = () => load();
    source.addEventListener('voucher.status_changed', refresh);
    source.addEventListener('voucher.updated', refresh);
    source.addEventListener('voucher_code.redeemed', refresh);
    return () => source.close();
  }, []);

  if (!data && !error) return <LoadingBlock />;

  const allActivities = data?.recent_activity || [];
  const usedQuantity = Number(data?.used_quantity || 0);
  const soldQuantity = Number(data?.sold_quantity || 0);
  const revenue = Number(data?.revenue || 0);
  const approvedVouchers = Number(data?.approved_vouchers || 0);
  const pendingVouchers = Number(data?.pending_vouchers || 0);
  const disabledVouchers = Number(data?.disabled_vouchers || 0);
  const usageRate = Math.round((usedQuantity / Math.max(soldQuantity, 1)) * 100);
  const stats = [
    { label: 'Doanh thu', value: money(revenue), icon: BarChart3, color: '#0f766e', tone: '#ecfdf5' },
    { label: 'Mã đã bán', value: soldQuantity, icon: Ticket, color: '#0369a1', tone: '#eff6ff' },
    { label: 'Tỷ lệ sử dụng', value: `${usageRate}%`, icon: CheckCircle, color: '#7c3aed', tone: '#f5f3ff' },
    { label: 'Đang bán', value: approvedVouchers, icon: Ticket, color: '#16a34a', tone: '#f0fdf4' },
    { label: 'Chờ duyệt', value: pendingVouchers, icon: ClipboardCheck, color: '#d97706', tone: '#fffbeb' },
    { label: 'Đã sử dụng', value: usedQuantity, icon: CheckCircle, color: '#0f172a', tone: '#f8fafc' },
  ];
  const voucherStatusChart = [
    { key: 'approved', label: 'Đang bán', value: approvedVouchers, color: '#16a34a', tone: '#f0fdf4' },
    { key: 'pending', label: 'Chờ duyệt', value: pendingVouchers, color: '#d97706', tone: '#fffbeb' },
    { key: 'suspended', label: 'Tạm ngưng', value: disabledVouchers, color: '#dc2626', tone: '#fef2f2' },
  ];
  const revenueTrend = allActivities
    .filter((item) => item.status === 'Used')
    .slice()
    .reverse()
    .map((item, index) => ({
      label: item.unique_code || `Mã ${index + 1}`,
      title: item.title || 'Voucher',
      date: item.used_date || item.issued_at || item.order_date,
      amount: Number(item.price_at_purchase || item.sale_price || 0),
    }));
  const fallbackTrend = revenueTrend.length > 0 ? revenueTrend : [
    { label: 'Hiện tại', title: 'Doanh thu đã ghi nhận', date: null, amount: revenue },
  ];

  return (
    <div style={shell.page}>
      <PageTitle title="Tổng quan kinh doanh" subtitle="Theo dõi doanh thu, trạng thái voucher và hoạt động xác thực của đối tác." onRefresh={load} />
      <ErrorBox message={error} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '12px' }}>
        {stats.map((item) => <DashboardStatCard key={item.label} item={item} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
        <motion.div whileHover={{ y: -3, boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)' }} transition={{ type: 'spring', stiffness: 320, damping: 24 }} style={{ ...shell.card, padding: '22px', borderRadius: '22px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Xu hướng doanh thu</h2>
          <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.82rem', marginBottom: '18px' }}>Tích lũy theo các mã đã sử dụng gần đây</p>
          <RevenueTrendChart points={fallbackTrend} />
        </motion.div>

        <motion.div whileHover={{ y: -3, boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)' }} transition={{ type: 'spring', stiffness: 320, damping: 24 }} style={{ ...shell.card, padding: '22px', borderRadius: '22px' }}>
          <VoucherStatusDonut items={voucherStatusChart} />
        </motion.div>
      </div>
    </div>
  );
}

function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emptyForm = useMemo(() => ({
    category_id: '',
    title: '',
    description: '',
    image_url: '',
    original_price: '',
    sale_price: '',
    total_quantity: '',
    start_date: dateOnly(new Date()),
    expiry_date: '',
    terms_and_conditions: '',
    cancellation_policy: '',
    branch_ids: [],
  }), []);

  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [voucherData, categoryData, branchData] = await Promise.all([
        apiFetch('/api/partner/vouchers'),
        fetch(`${API_URL}/api/vouchers/categories`).then((res) => res.json()),
        apiFetch('/api/partner/branches'),
      ]);
      setVouchers(voucherData);
      setCategories(categoryData);
      setBranches(branchData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const source = createRealtimeSource();
    if (!source) return undefined;
    const refresh = () => load();
    source.addEventListener('voucher.status_changed', refresh);
    source.addEventListener('voucher.updated', refresh);
    source.addEventListener('voucher_code.redeemed', refresh);
    return () => source.close();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ ...emptyForm, branch_ids: branches.map((b) => b.branch_id) });
    setFormOpen(true);
  };

  const editVoucher = (voucher) => {
    setEditing(voucher);
    setForm({
      category_id: voucher.category_id || '',
      title: voucher.title || '',
      description: voucher.description || '',
      image_url: voucher.image_url || '',
      original_price: voucher.original_price || '',
      sale_price: voucher.sale_price || '',
      total_quantity: voucher.total_quantity || '',
      start_date: dateOnly(voucher.start_date),
      expiry_date: dateOnly(voucher.expiry_date),
      terms_and_conditions: voucher.terms_and_conditions || '',
      cancellation_policy: voucher.cancellation_policy || '',
      branch_ids: voucher.branch_ids || [],
    });
    setFormOpen(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (!isVoucherFormComplete) {
      setError('Vui lòng điền đầy đủ tất cả thông tin voucher trước khi gửi duyệt.');
      return;
    }
    try {
      setError('');
      setSuccess('');
      const path = editing ? `/api/partner/vouchers/${editing.voucher_id}` : '/api/partner/vouchers';
      const method = editing ? 'PUT' : 'POST';
      const result = await apiFetch(path, { method, body: JSON.stringify(form) });
      setSuccess(result.message);
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const action = async (voucherId, type) => {
    try {
      setError('');
      setSuccess('');
      const result = await apiFetch(`/api/partner/vouchers/${voucherId}/${type}`, { method: 'POST' });
      setSuccess(result.message);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateBranch = (branchId, checked) => {
    setForm((prev) => ({
      ...prev,
      branch_ids: checked ? [...prev.branch_ids, branchId] : prev.branch_ids.filter((id) => Number(id) !== Number(branchId)),
    }));
  };

  const handleVoucherImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!VOUCHER_IMAGE_TYPES.has(file.type)) {
      setError('Chỉ hỗ trợ ảnh PNG, JPG/JPEG hoặc WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > VOUCHER_IMAGE_MAX_SIZE) {
      setError('Ảnh voucher tối đa 5MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError('');
      setForm((prev) => ({ ...prev, image_url: reader.result }));
    };
    reader.onerror = () => setError('Không thể đọc file ảnh. Vui lòng thử ảnh khác.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const removeVoucherImage = () => {
    setForm((prev) => ({ ...prev, image_url: '' }));
  };

  const voucherStats = useMemo(() => {
    const approved = vouchers.filter((voucher) => voucher.status === 'Approved').length;
    const pending = vouchers.filter((voucher) => voucher.status === 'Pending').length;
    const sold = vouchers.reduce((sum, voucher) => sum + Number(voucher.sold_quantity || 0), 0);
    const used = vouchers.reduce((sum, voucher) => sum + Number(voucher.used_quantity || 0), 0);
    return [
      { label: 'Tổng voucher', value: vouchers.length, icon: Ticket },
      { label: 'Đã duyệt', value: approved, icon: CheckCircle },
      { label: 'Chờ duyệt', value: pending, icon: ClipboardCheck },
      { label: 'Đã dùng', value: `${used}/${Math.max(sold, 1)}`, icon: BarChart3 },
    ];
  }, [vouchers]);

  const isVoucherFormComplete = useMemo(() => {
    const hasText = (value) => String(value ?? '').trim().length > 0;
    const positiveNumber = (value) => Number(value) > 0;

    return (
      hasText(form.title) &&
      hasText(form.category_id) &&
      positiveNumber(form.original_price) &&
      positiveNumber(form.sale_price) &&
      positiveNumber(form.total_quantity) &&
      hasText(form.image_url) &&
      hasText(form.start_date) &&
      hasText(form.expiry_date) &&
      hasText(form.description) &&
      hasText(form.terms_and_conditions) &&
      hasText(form.cancellation_policy) &&
      Array.isArray(form.branch_ids) &&
      form.branch_ids.length > 0
    );
  }, [form]);

  return (
    <div style={shell.page}>
      <PageTitle title="Quản lý voucher" subtitle="Tạo chương trình mới, gửi duyệt và theo dõi hiệu quả từng voucher." onRefresh={load}>
        <button onClick={resetForm} style={{ ...shell.button, background: 'var(--primary)', color: 'white' }}><Plus size={18} /> Tạo voucher</button>
      </PageTitle>
      <ErrorBox message={error} />
      {success && <div style={{ padding: '12px 14px', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontWeight: 800 }}>{success}</div>}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {voucherStats.map((item) => (
            <div key={item.label} style={{ ...shell.card, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: '#eef6ff', color: '#0369a1', display: 'grid', placeItems: 'center' }}>
                <item.icon size={19} />
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 800 }}>{item.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.2 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <form onSubmit={submitForm} style={{ ...shell.card, overflow: 'hidden' }}>
          <div style={{ padding: '22px 26px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)' }}>
            <div>
              <h2 style={{ fontSize: '1.28rem', marginBottom: '6px' }}>{editing ? 'Cập nhật thông tin voucher' : 'Tạo voucher mới'}</h2>
              <p style={{ color: '#64748b', fontWeight: 700, maxWidth: '620px' }}>
                Điền đầy đủ thông tin, chọn ảnh đại diện và chi nhánh áp dụng trước khi gửi admin duyệt.
              </p>
            </div>
            <span style={{ padding: '8px 12px', borderRadius: '999px', background: isVoucherFormComplete ? '#dcfce7' : '#fff7ed', color: isVoucherFormComplete ? '#166534' : '#9a3412', fontWeight: 850, whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
              {isVoucherFormComplete ? 'Đã đủ thông tin' : 'Còn thiếu thông tin'}
            </span>
          </div>

          <div style={{ padding: '24px 26px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(320px, 1fr))', gap: '22px', alignItems: 'stretch' }}>
            <FormSection title="Thông tin cơ bản" description="Tên, danh mục, giá bán và số lượng phát hành.">
              <Field label="Tên voucher" value={form.title} onChange={(title) => setForm({ ...form, title })} placeholder="VD: Buffet hải sản cuối tuần tại Quận 1" required />
              <Select label="Danh mục" value={form.category_id} onChange={(category_id) => setForm({ ...form, category_id })} options={categories.map((c) => [c.category_id, c.category_name])} placeholder="Chọn danh mục voucher" required />
              <Field label="Giá gốc" type="number" value={form.original_price} onChange={(original_price) => setForm({ ...form, original_price })} placeholder="VD: 800000" required />
              <Field label="Giá bán" type="number" value={form.sale_price} onChange={(sale_price) => setForm({ ...form, sale_price })} placeholder="VD: 560000" required />
              <Field label="Số lượng phát hành" type="number" value={form.total_quantity} onChange={(total_quantity) => setForm({ ...form, total_quantity })} placeholder="VD: 100" required />
            </FormSection>

            <FormSection title="Ảnh và thời gian" description="Ảnh rõ nét giúp voucher được duyệt nhanh hơn." contentStyle={{ gridTemplateColumns: 'minmax(220px, 1fr) minmax(220px, 1fr)', alignItems: 'start' }}>
              <div>
                <VoucherImageUpload value={form.image_url} onUpload={handleVoucherImageUpload} onRemove={removeVoucherImage} />
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                <Field label="Ngày bắt đầu bán" type="date" value={form.start_date} onChange={(start_date) => setForm({ ...form, start_date })} required />
                <Field label="Ngày hết hạn/sử dụng" type="date" value={form.expiry_date} onChange={(expiry_date) => setForm({ ...form, expiry_date })} required />
              </div>
            </FormSection>

            <FormSection title="Nội dung hiển thị" description="Mô tả ngắn gọn, rõ quyền lợi và điều kiện sử dụng voucher.">
              <TextArea label="Mô tả" value={form.description} onChange={(description) => setForm({ ...form, description })} placeholder="Mô tả trải nghiệm, dịch vụ bao gồm và điểm nổi bật của voucher..." required />
              <TextArea label="Điều kiện áp dụng" value={form.terms_and_conditions} onChange={(terms_and_conditions) => setForm({ ...form, terms_and_conditions })} placeholder="VD: Áp dụng từ thứ 2 đến thứ 6, vui lòng đặt chỗ trước..." required />
              <TextArea label="Chính sách hoàn/hủy" value={form.cancellation_policy} onChange={(cancellation_policy) => setForm({ ...form, cancellation_policy })} placeholder="VD: Không hoàn/hủy sau khi mã đã phát hành hoặc đã sử dụng..." required />
            </FormSection>

            <FormSection title="Chi nhánh áp dụng" description="Chọn ít nhất một chi nhánh có thể sử dụng voucher.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', maxHeight: '210px', overflow: 'auto' }}>
                {branches.map((branch) => (
                  <label key={branch.branch_id} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 750, color: '#334155', padding: '8px 10px', borderRadius: '10px', background: form.branch_ids.map(Number).includes(branch.branch_id) ? '#e0f2fe' : '#ffffff', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.branch_ids.map(Number).includes(branch.branch_id)} onChange={(e) => updateBranch(branch.branch_id, e.target.checked)} />
                    {branch.branch_name}
                  </label>
                ))}
              </div>
            </FormSection>
          </div>

          <div style={{ padding: '18px 26px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <p style={{ margin: 0, color: '#64748b', fontWeight: 700 }}>
              {isVoucherFormComplete ? 'Thông tin đã sẵn sàng để gửi duyệt.' : 'Nút gửi duyệt sẽ được mở khi tất cả trường đã được điền.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setFormOpen(false)} style={{ ...shell.button, background: '#ffffff', color: '#475569', border: '1px solid #e2e8f0' }}><XCircle size={18} /> Hủy</button>
              <button
                type="submit"
                disabled={!isVoucherFormComplete}
                style={{
                  ...shell.button,
                  background: isVoucherFormComplete ? '#16a34a' : '#cbd5e1',
                  color: isVoucherFormComplete ? 'white' : '#64748b',
                  cursor: isVoucherFormComplete ? 'pointer' : 'not-allowed',
                  opacity: isVoucherFormComplete ? 1 : 0.82,
                }}
              >
                <Save size={18} /> {editing ? 'Lưu thay đổi' : 'Tạo và gửi duyệt'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? <LoadingBlock /> : (
        <div style={{ ...shell.card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '31%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '27%' }} />
            </colgroup>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                {['Voucher', 'Giá bán', 'Tồn kho', 'Đã bán', 'Đã dùng', 'Trạng thái', 'Thao tác'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px 16px', color: '#475569', fontSize: '0.78rem', verticalAlign: 'middle' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => (
                <tr key={voucher.voucher_id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 900 }}>{voucher.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{categoryLabelVi(voucher.category_name)} · {voucher.branch_names || 'Tất cả chi nhánh'}</div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 800, whiteSpace: 'nowrap' }}>{money(voucher.sale_price)}</td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>{voucher.quantity_stock}/{voucher.total_quantity}</td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>{voucher.sold_quantity}</td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>{voucher.used_quantity}</td>
                  <td style={{ padding: '16px', verticalAlign: 'middle' }}><StatusPill status={voucher.status} /></td>
                  <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                    <div className="voucher-action-group">
                      {voucher.status !== 'Approved' && (
                        <>
                          <button className="btn-table-edit" onClick={() => editVoucher(voucher)} title="Sửa thông tin voucher" style={{ ...shell.button, minHeight: '32px', padding: '6px 8px', whiteSpace: 'nowrap', fontSize: '0.78rem', gap: '4px', flex: '0 0 auto' }}><Edit3 size={13} /> Sửa</button>
                          <button className="btn-table-submit" onClick={() => action(voucher.voucher_id, 'submit')} title="Gửi duyệt voucher" style={{ ...shell.button, minHeight: '32px', padding: '6px 8px', whiteSpace: 'nowrap', fontSize: '0.78rem', gap: '4px', flex: '0 0 auto' }}><ClipboardCheck size={13} /> Gửi duyệt</button>
                        </>
                      )}
                      <button className="btn-table-disable" onClick={() => action(voucher.voucher_id, 'disable')} title="Ngưng voucher" style={{ ...shell.button, minHeight: '32px', padding: '6px 8px', whiteSpace: 'nowrap', fontSize: '0.78rem', gap: '4px', flex: '0 0 auto' }}><XCircle size={13} /> Ngưng</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vouchers.length === 0 && <Empty text="Chưa có voucher nào. Hãy tạo chương trình đầu tiên." />}
        </div>
      )}
    </div>
  );
}

function RedeemVoucher() {
  const [code, setCode] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [voucher, setVoucher] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scanningImage, setScanningImage] = useState(false);

  useEffect(() => {
    apiFetch('/api/partner/branches').then(setBranches).catch((err) => setError(err.message));
  }, []);

  const check = async (event) => {
    if (event) event.preventDefault();
    if (!code.trim()) {
      setError('Vui lòng nhập hoặc quét mã voucher');
      return;
    }
    try {
      setError('');
      setSuccess('');
      const data = await apiFetch(`/api/partner/voucher-codes/${encodeURIComponent(code)}`);
      setVoucher(data);
      if (!branchId && data.branches?.length) setBranchId(String(data.branches[0].branch_id));
    } catch (err) {
      setVoucher(null);
      setError(err.message);
    }
  };

  const extractVoucherCode = (rawValue) => {
    const value = String(rawValue || '').trim();
    if (!value) return '';

    try {
      const url = new URL(value);
      const codeFromQuery = url.searchParams.get('code') || url.searchParams.get('voucher') || url.searchParams.get('voucherCode');
      if (codeFromQuery) return codeFromQuery.trim().toUpperCase();
      const lastPath = url.pathname.split('/').filter(Boolean).pop();
      return (lastPath || value).trim().toUpperCase();
    } catch {
      return value.trim().toUpperCase();
    }
  };

  const scanQrImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      setError('');
      setSuccess('');
      setScanningImage(true);

      const fileName = file.name.toLowerCase();
      const hasValidExtension = QR_IMAGE_EXTENSIONS.some((extension) => fileName.endsWith(extension));
      if (!QR_IMAGE_TYPES.has(file.type) || !hasValidExtension) {
        throw new Error('Chỉ hỗ trợ file ảnh PNG, JPG, JPEG, WEBP, BMP hoặc GIF.');
      }
      if (file.size > QR_IMAGE_MAX_SIZE) {
        throw new Error('Ảnh QR tối đa 5MB. Vui lòng chọn ảnh nhỏ hơn.');
      }

      const scannedCode = extractVoucherCode(await decodeQrFromImageFile(file));
      if (!scannedCode) {
        throw new Error('Không tìm thấy mã QR hợp lệ trong ảnh.');
      }

      setCode(scannedCode);
      const data = await apiFetch(`/api/partner/voucher-codes/${encodeURIComponent(scannedCode)}`);
      setVoucher(data);
      if (!branchId && data.branches?.length) setBranchId(String(data.branches[0].branch_id));
      setSuccess('Đã quét QR và kiểm tra mã thành công.');
    } catch (err) {
      setVoucher(null);
      setError(err.message);
    } finally {
      setScanningImage(false);
    }
  };

  const redeem = async () => {
    try {
      setError('');
      setSuccess('');
      const data = await apiFetch('/api/partner/voucher-codes/redeem', {
        method: 'POST',
        body: JSON.stringify({ code, branchId: Number(branchId) }),
      });
      setVoucher(data.voucher);
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={shell.page}>
      <PageTitle title="Xác thực voucher code" subtitle="Nhập mã khách đưa để kiểm tra trạng thái và xác nhận sử dụng tại chi nhánh." />
      <form onSubmit={check} style={{ ...shell.card, padding: '22px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
        <Field label="Mã voucher" value={code} onChange={(value) => setCode(value.toUpperCase())} placeholder="VD: DLZ-SHER-0001" required />
        <div style={{ display: 'flex', gap: '10px' }}>
          <label className="partner-action-button partner-action-button--blue" style={{ ...shell.button, height: '42px' }}>
            <QrCode size={18} /> {scanningImage ? 'Đang quét...' : 'Quét QR'}
            <input type="file" accept=".png,.jpg,.jpeg,.webp,.bmp,.gif,image/png,image/jpeg,image/webp,image/bmp,image/gif" onChange={scanQrImage} disabled={scanningImage} style={{ display: 'none' }} />
          </label>
          <button className="partner-action-button partner-action-button--dark" type="submit" style={{ ...shell.button, height: '42px' }}><Search size={18} /> Kiểm tra</button>
        </div>
      </form>
      <ErrorBox message={error} />
      {success && <div style={{ padding: '12px 14px', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontWeight: 800 }}>{success}</div>}

      {voucher && (
        <div style={{ ...shell.card, padding: '22px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '18px' }}>
          <div>
            <StatusPill status={voucher.status} />
            <h2 style={{ margin: '12px 0 6px', fontSize: '1.4rem' }}>{voucher.title}</h2>
            <div style={{ color: '#64748b', marginBottom: '12px' }}>Mã: <b>{voucher.unique_code}</b> · Đơn #{voucher.order_id}</div>
            <InfoLine label="Khách hàng" value={voucher.customer_name || 'Chưa có thông tin'} />
            <InfoLine label="Ngày phát hành" value={new Date(voucher.issued_at).toLocaleString('vi-VN')} />
            <InfoLine label="Hạn dùng" value={voucher.expiry_date ? new Date(voucher.expiry_date).toLocaleDateString('vi-VN') : 'Không giới hạn'} />
            {voucher.used_date && <InfoLine label="Đã dùng lúc" value={`${new Date(voucher.used_date).toLocaleString('vi-VN')} tại ${voucher.used_branch_name || 'chi nhánh'}`} />}
          </div>
          <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px' }}>
            <Select
              label="Chi nhánh xác nhận"
              value={branchId}
              onChange={setBranchId}
              options={(voucher.branches?.length ? voucher.branches : branches).map((b) => [b.branch_id, b.branch_name])}
              required
            />
            <button disabled={!voucher.can_redeem} onClick={redeem} style={{ ...shell.button, width: '100%', marginTop: '14px', background: voucher.can_redeem ? '#16a34a' : '#cbd5e1', color: 'white' }}>
              <CheckCircle size={18} /> Xác nhận đã sử dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const load = async () => {
    try {
      setError('');
      setData(await apiFetch('/api/partner/reports'));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const source = createRealtimeSource();
    if (!source) return undefined;
    const refresh = () => load();
    source.addEventListener('voucher.status_changed', refresh);
    source.addEventListener('voucher.updated', refresh);
    source.addEventListener('voucher_code.redeemed', refresh);
    return () => source.close();
  }, []);

  if (!data && !error) return <div style={shell.page}><LoadingBlock /></div>;

  const filteredActivity = (data?.recent_activity || []).filter((item) => {
    const keyword = activitySearch.trim().toLowerCase();
    if (!keyword) return true;
    return [
      item.title,
      item.unique_code,
      item.customer_name,
      item.customer_email,
      item.customer_phone,
      item.status,
      item.order_id,
      item.used_branch_name,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword));
  });

  const printReport = () => {
    const rows = filteredActivity.map((item) => `
      <tr>
        <td>${escapeHtml(item.unique_code || '')}</td>
        <td>${escapeHtml(item.title || '')}</td>
        <td>${escapeHtml(item.customer_name || 'Khách hàng')}</td>
        <td>${escapeHtml(item.status || '')}</td>
        <td>${escapeHtml(dateTime(item.issued_at))}</td>
        <td>${escapeHtml(dateTime(item.used_date))}</td>
        <td>${escapeHtml(item.used_branch_name || '')}</td>
      </tr>
    `).join('');

    const reportWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!reportWindow) {
      setError('Không thể mở cửa sổ in. Vui lòng cho phép popup trên trình duyệt.');
      return;
    }

    reportWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Báo cáo hoạt động mã voucher</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; padding: 28px; }
            h1 { font-size: 24px; margin: 0 0 8px; }
            p { color: #64748b; margin: 0 0 20px; }
            .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 22px; }
            .metric { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
            .metric b { display: block; font-size: 18px; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 9px; text-align: left; vertical-align: top; }
            th { background: #f8fafc; color: #475569; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>
          <h1>Báo cáo hoạt động mã voucher</h1>
          <p>Ngày in: ${dateTime(new Date())}</p>
          <div class="metrics">
            <div class="metric">Doanh thu<b>${money(data?.dashboard?.revenue)}</b></div>
            <div class="metric">Đã bán<b>${data?.dashboard?.sold_quantity || 0}</b></div>
            <div class="metric">Đã sử dụng<b>${data?.dashboard?.used_quantity || 0}</b></div>
            <div class="metric">Tỷ lệ sử dụng<b>${Math.round(((data?.dashboard?.used_quantity || 0) / Math.max(data?.dashboard?.sold_quantity || 0, 1)) * 100)}%</b></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Voucher</th>
                <th>Khách hàng</th>
                <th>Trạng thái</th>
                <th>Phát hành</th>
                <th>Sử dụng</th>
                <th>Chi nhánh</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="7">Không có dữ liệu</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };

  return (
    <div style={shell.page}>
      <PageTitle title="Báo cáo đối tác" subtitle="Hiệu quả phát hành, bán và sử dụng theo từng chương trình voucher." onRefresh={load}>
        <button className="partner-action-button partner-action-button--blue" onClick={printReport} style={shell.button}><Printer size={18} /> In PDF</button>
      </PageTitle>
      <ErrorBox message={error} />
      <div style={{ ...shell.card, padding: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '22px' }}>
          <ReportMetric label="Doanh thu" value={money(data?.dashboard?.revenue)} />
          <ReportMetric label="Đã bán" value={data?.dashboard?.sold_quantity || 0} />
          <ReportMetric label="Đã sử dụng" value={data?.dashboard?.used_quantity || 0} />
          <ReportMetric label="Tỷ lệ sử dụng" value={`${Math.round(((data?.dashboard?.used_quantity || 0) / Math.max(data?.dashboard?.sold_quantity || 0, 1)) * 100)}%`} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              {['Voucher', 'Phát hành', 'Tồn', 'Đã bán', 'Đã dùng', 'Doanh thu ước tính'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '12px', fontSize: '0.78rem', color: '#475569' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data?.vouchers || []).map((voucher) => (
              <tr key={voucher.voucher_id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 800 }}>{voucher.title}</td>
                <td style={{ padding: '12px' }}>{voucher.total_quantity}</td>
                <td style={{ padding: '12px' }}>{voucher.quantity_stock}</td>
                <td style={{ padding: '12px' }}>{voucher.sold_quantity}</td>
                <td style={{ padding: '12px' }}>{voucher.used_quantity}</td>
                <td style={{ padding: '12px', fontWeight: 800 }}>{money(Number(voucher.sold_quantity || 0) * Number(voucher.sale_price || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...shell.card, padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Hoạt động mã voucher gần đây</h2>
          <div style={{ position: 'relative', width: 'min(100%, 380px)' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={activitySearch}
              onChange={(event) => setActivitySearch(event.target.value)}
              placeholder="Tìm mã, voucher, khách hàng..."
              style={{ ...shell.input, height: '40px', paddingLeft: '38px', fontSize: '0.86rem', background: '#f8fafc' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(data?.recent_activity || []).length === 0 ? (
            <Empty text="Chưa có mã voucher nào được phát hành cho đối tác này." />
          ) : filteredActivity.length === 0 ? (
            <Empty text="Không tìm thấy hoạt động mã voucher phù hợp." />
          ) : (
            filteredActivity.map((item) => (
              <motion.button
                key={`${item.evoucher_id}-${item.unique_code}`}
                type="button"
                onClick={() => setSelectedActivity(item)}
                className="activity-item"
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900 }}>{item.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{item.unique_code} · {item.customer_name || 'Khách hàng'} · Đơn #{item.order_id}</div>
                </div>
                <StatusPill status={item.status} />
              </motion.button>
            ))
          )}
        </div>
      </div>

      {selectedActivity && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.28)', display: 'grid', placeItems: 'center', padding: '24px', zIndex: 50 }}>
          <div style={{ ...shell.card, width: 'min(720px, 100%)', padding: '24px', boxShadow: '0 24px 70px rgba(15,23,42,0.22)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>{selectedActivity.title}</h2>
                <div style={{ color: '#64748b', fontWeight: 800 }}>{selectedActivity.unique_code}</div>
              </div>
              <button onClick={() => setSelectedActivity(null)} style={{ ...shell.button, padding: '8px', background: '#f1f5f9', color: '#475569' }}><XCircle size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
              <DetailBox label="Trạng thái" value={<StatusPill status={selectedActivity.status} />} />
              <DetailBox label="Danh mục" value={categoryLabelVi(selectedActivity.category_name) || 'Không rõ'} />
              <DetailBox label="Khách hàng" value={selectedActivity.customer_name || 'Chưa có thông tin'} />
              <DetailBox label="Email khách hàng" value={selectedActivity.customer_email || 'Chưa có thông tin'} />
              <DetailBox label="SĐT khách hàng" value={selectedActivity.customer_phone || 'Chưa có thông tin'} />
              <DetailBox label="Mã đơn hàng" value={`#${selectedActivity.order_id}`} />
              <DetailBox label="Trạng thái đơn" value={orderStatusLabelVi(selectedActivity.order_status) || 'Không rõ'} />
              <DetailBox label="Giá mua" value={money(selectedActivity.price_at_purchase || selectedActivity.sale_price)} />
              <DetailBox label="Ngày phát hành" value={dateTime(selectedActivity.issued_at)} />
              <DetailBox label="Hạn dùng" value={dateTime(selectedActivity.expiry_date)} />
              <DetailBox label="Ngày sử dụng" value={dateTime(selectedActivity.used_date)} />
              <DetailBox label="Chi nhánh sử dụng" value={selectedActivity.used_branch_name || 'Chưa sử dụng'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      setError('');
      setProfile(await apiFetch('/api/auth/profile'));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateBranch = (index, key, value) => {
    const branches = [...(profile.branches || [])];
    branches[index] = { ...branches[index], [key]: value };
    setProfile({ ...profile, branches });
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      setError('');
      setSuccess('');
      const result = await apiFetch('/api/auth/profile', { method: 'PUT', body: JSON.stringify(profile) });
      setSuccess(result.message || 'Cập nhật hồ sơ thành công');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!profile && !error) return <div style={shell.page}><LoadingBlock /></div>;

  return (
    <div style={shell.page}>
      <PageTitle title="Hồ sơ đối tác" subtitle="Cập nhật thông tin doanh nghiệp, người đại diện và danh sách chi nhánh." />
      <ErrorBox message={error} />
      {success && <div style={{ padding: '12px 14px', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontWeight: 800 }}>{success}</div>}
      {profile && (
        <form onSubmit={save} style={{ ...shell.card, padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
          <Field label="Email" value={profile.email || ''} onChange={(email) => setProfile({ ...profile, email })} />
          <Field label="Số điện thoại" value={profile.phone || ''} onChange={(phone) => setProfile({ ...profile, phone })} />
          <Field label="Tên doanh nghiệp" value={profile.company_name || ''} onChange={(company_name) => setProfile({ ...profile, company_name })} required />
          <Field label="Người đại diện" value={profile.representative_name || ''} onChange={(representative_name) => setProfile({ ...profile, representative_name })} />
          <Field label="Mã số thuế" value={profile.tax_id || ''} onChange={(tax_id) => setProfile({ ...profile, tax_id })} />
          <Field label="Trụ sở chính" value={profile.headquarters || ''} onChange={(headquarters) => setProfile({ ...profile, headquarters })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={shell.label}>Danh sách chi nhánh</label>
              <button type="button" onClick={() => setProfile({ ...profile, branches: [...(profile.branches || []), { branch_name: '', address: '', phone: '' }] })} style={{ ...shell.button, background: 'var(--bg-dark)', color: 'var(--primary)' }}><Plus size={16} /> Thêm chi nhánh</button>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {(profile.branches || []).map((branch, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr auto', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                  <input style={shell.input} value={branch.branch_name || ''} onChange={(e) => updateBranch(index, 'branch_name', e.target.value)} placeholder="Tên chi nhánh" />
                  <input style={shell.input} value={branch.address || ''} onChange={(e) => updateBranch(index, 'address', e.target.value)} placeholder="Địa chỉ" />
                  <input style={shell.input} value={branch.phone || ''} onChange={(e) => updateBranch(index, 'phone', e.target.value)} placeholder="SĐT" />
                  <button type="button" onClick={() => setProfile({ ...profile, branches: profile.branches.filter((_, i) => i !== index) })} style={{ ...shell.button, background: '#fee2e2', color: '#991b1b' }}><XCircle size={16} /></button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ ...shell.button, background: '#16a34a', color: 'white' }}><Save size={18} /> Lưu hồ sơ</button>
          </div>
        </form>
      )}
    </div>
  );
}

function PageTitle({ title, subtitle, children, onRefresh }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{title}</h1>
        <p style={{ color: '#64748b' }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {onRefresh && <button className="partner-action-button partner-action-button--neutral" onClick={onRefresh} style={shell.button}><RefreshCw size={18} /> Làm mới</button>}
        {children}
      </div>
    </div>
  );
}

function DashboardStatCard({ item }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      style={{
        ...shell.card,
        padding: '16px',
        minHeight: '142px',
        cursor: 'default',
        borderRadius: '20px',
        background: `linear-gradient(180deg, #ffffff 0%, ${item.tone || '#f8fafc'} 100%)`,
      }}
    >
      <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: item.tone || '#f8fafc', color: item.color, display: 'grid', placeItems: 'center' }}>
        <item.icon size={21} />
      </div>
      <div style={{ color: '#64748b', fontWeight: 800, marginTop: '12px', fontSize: '0.78rem', lineHeight: 1.25 }}>{item.label}</div>
      <div style={{ fontSize: 'clamp(1.25rem, 1.55vw, 1.7rem)', fontWeight: 950, marginTop: '6px', lineHeight: 1.15, wordBreak: 'break-word' }}>{item.value}</div>
    </motion.div>
  );
}

function VoucherStatusDonut({ items }) {
  const [activeKey, setActiveKey] = useState('all');
  const [tooltip, setTooltip] = useState(null);
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const selectedItem = activeKey === 'all' ? null : items.find((item) => item.key === activeKey);
  const centerValue = selectedItem ? selectedItem.value : total;
  const centerLabel = selectedItem ? selectedItem.label : 'Tổng voucher';
  let cumulativePercent = 0;

  const showTooltip = (event, item, percent) => {
    const bounds = event.currentTarget.ownerSVGElement.getBoundingClientRect();
    setTooltip({
      item,
      percent,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Cơ cấu trạng thái voucher</h2>
          <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.82rem' }}>Di chuột lên biểu đồ để xem chi tiết</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {[{ key: 'all', label: 'Tất cả' }, ...items].map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveKey(item.key)}
              style={{
                border: `1px solid ${isActive ? '#0f172a' : '#e2e8f0'}`,
                borderRadius: '10px',
                padding: '7px 10px',
                background: isActive ? '#0f172a' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: 850,
                fontSize: '0.76rem',
                cursor: 'pointer',
                transition: 'transform 0.18s ease, background-color 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(event) => {
                if (!isActive) event.currentTarget.style.background = '#f8fafc';
              }}
              onMouseLeave={(event) => {
                if (!isActive) event.currentTarget.style.background = '#ffffff';
              }}
              onMouseDown={(event) => {
                event.currentTarget.style.transform = 'scale(0.97)';
              }}
              onMouseUp={(event) => {
                event.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 0.9fr) minmax(160px, 1.1fr)', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '250px', margin: '0 auto' }}>
          <svg viewBox="0 0 240 240" width="100%" role="img" aria-label="Biểu đồ cơ cấu trạng thái voucher" onMouseLeave={() => setTooltip(null)}>
            <circle cx="120" cy="120" r="78" fill="none" stroke="#f1f5f9" strokeWidth="30" />
            {items.map((item) => {
              const percent = total > 0 ? (Number(item.value || 0) / total) * 100 : 0;
              const offset = -cumulativePercent;
              cumulativePercent += percent;
              const isHighlighted = activeKey === 'all' || activeKey === item.key;
              return (
                <circle
                  key={item.key}
                  cx="120"
                  cy="120"
                  r="78"
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isHighlighted ? 32 : 24}
                  strokeLinecap="butt"
                  pathLength="100"
                  strokeDasharray={`${percent} ${100 - percent}`}
                  strokeDashoffset={offset}
                  transform="rotate(-90 120 120)"
                  opacity={isHighlighted ? 1 : 0.18}
                  style={{ cursor: 'pointer', transition: 'opacity 0.22s ease, stroke-width 0.22s ease, filter 0.22s ease' }}
                  onMouseEnter={(event) => showTooltip(event, item, Math.round(percent))}
                  onMouseMove={(event) => showTooltip(event, item, Math.round(percent))}
                  onClick={() => setActiveKey(item.key)}
                />
              );
            })}
            <text x="120" y="112" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="800">{centerLabel}</text>
            <text x="120" y="139" textAnchor="middle" fill="#0f172a" fontSize="28" fontWeight="950">{centerValue}</text>
          </svg>

          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                style={{
                  position: 'absolute',
                  left: Math.min(tooltip.x + 10, 150),
                  top: Math.max(tooltip.y - 42, 8),
                  zIndex: 3,
                  minWidth: '118px',
                  padding: '9px 10px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  color: '#ffffff',
                  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.24)',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ fontWeight: 900, fontSize: '0.8rem' }}>{tooltip.item.label}</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.74rem', marginTop: '2px' }}>{tooltip.item.value} voucher · {tooltip.percent}%</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ display: 'grid', gap: '9px' }}>
          {items.map((item) => {
            const percent = total > 0 ? Math.round((Number(item.value || 0) / total) * 100) : 0;
            const isActive = activeKey === 'all' || activeKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveKey(item.key)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '10px minmax(0, 1fr) auto',
                  alignItems: 'center',
                  gap: '9px',
                  border: `1px solid ${activeKey === item.key ? item.color : '#e2e8f0'}`,
                  borderRadius: '12px',
                  padding: '10px',
                  background: isActive ? item.tone : '#ffffff',
                  opacity: isActive ? 1 : 0.58,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform 0.18s ease, opacity 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color }} />
                <span style={{ fontWeight: 850, color: '#334155', fontSize: '0.82rem' }}>{item.label}</span>
                <span style={{ fontWeight: 950, color: '#0f172a', fontSize: '0.82rem' }}>{item.value} · {percent}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, description, children, contentStyle = {} }) {
  return (
    <section style={{ border: '1px solid #e2e8f0', borderRadius: '18px', background: '#ffffff', padding: '18px', boxShadow: '0 10px 26px rgba(15, 23, 42, 0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: 900 }}>{title}</h3>
        {description && <p style={{ margin: '4px 0 0', color: '#64748b', fontWeight: 650, fontSize: '0.86rem' }}>{description}</p>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', flex: 1, ...contentStyle }}>
        {children}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div>
      <label style={shell.label}>{label}</label>
      <input required={required} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={shell.input} />
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder = 'Chọn...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find(([optionValue]) => String(optionValue) === String(value));

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="partner-custom-select">
      <label style={shell.label}>{label}</label>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`partner-custom-select__trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={selectedOption ? '' : 'is-placeholder'}>
          {selectedOption ? categoryLabelVi(selectedOption[1]) : placeholder}
        </span>
        <ChevronDown size={18} className="partner-custom-select__chevron" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="partner-custom-select__menu"
          >
            {options.map(([optionValue, labelText]) => {
              const isSelected = String(optionValue) === String(value);
              return (
                <button
                  key={optionValue}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`partner-custom-select__option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChange(optionValue);
                    setIsOpen(false);
                  }}
                >
                  <span>{categoryLabelVi(labelText)}</span>
                  {isSelected && <Check size={16} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder = '', required = false }) {
  return (
    <div style={{ gridColumn: 'span 1' }}>
      <label style={shell.label}>{label}</label>
      <textarea required={required} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} rows={4} style={{ ...shell.input, resize: 'vertical' }} />
    </div>
  );
}

function VoucherImageUpload({ value, onUpload, onRemove }) {
  return (
    <div>
      <label style={shell.label}>Ảnh voucher</label>
      <label
        style={{
          minHeight: '156px',
          border: '1.5px dashed #bfd7ef',
          borderRadius: '18px',
          background: value ? '#0f172a' : 'linear-gradient(135deg, #f8fbff 0%, #eef8ff 100%)',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        {value ? (
          <>
            <img src={value} alt="Ảnh voucher" style={{ width: '100%', height: '156px', objectFit: 'cover', display: 'block' }} />
            <span
              className="voucher-image-upload-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(15, 23, 42, 0.35)',
                color: '#fff',
                fontWeight: 900,
                opacity: 0,
                transition: 'opacity 0.18s ease',
              }}
            >
              <UploadCloud size={20} /> Đổi ảnh
            </span>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#475569', padding: '18px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#dff3ff', color: '#0369a1', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
              <ImagePlus size={22} />
            </div>
            <div style={{ color: '#0f172a', fontWeight: 900 }}>Upload ảnh voucher</div>
            <div style={{ marginTop: '4px', fontSize: '0.82rem', fontWeight: 700 }}>PNG, JPG hoặc WEBP tối đa 5MB</div>
          </div>
        )}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onUpload} style={{ display: 'none' }} />
      </label>
      {value && (
        <button type="button" onClick={onRemove} style={{ marginTop: '8px', border: 0, background: 'transparent', color: '#dc2626', fontWeight: 850, cursor: 'pointer' }}>
          Xóa ảnh đã chọn
        </button>
      )}
    </div>
  );
}

function InfoLine({ label, value }) {
  return <div style={{ marginTop: '8px', color: '#475569' }}><b>{label}:</b> {value}</div>;
}

function DetailBox({ label, value }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '12px' }}>
      <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 900, marginBottom: '6px', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontWeight: 800, color: '#0f172a', wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}

function RevenueTrendChart({ points }) {
  const [limit, setLimit] = useState('all');
  const [mode, setMode] = useState('cumulative');
  const [tooltip, setTooltip] = useState(null);
  const width = 520;
  const height = 220;
  const padding = 24;
  const visibleRawPoints = limit === 'all' ? points : points.slice(-Number(limit));
  const visiblePoints = visibleRawPoints.map((point, index) => ({
    ...point,
    value: mode === 'cumulative'
      ? visibleRawPoints.slice(0, index + 1).reduce((sum, item) => sum + Number(item.amount || 0), 0)
      : Number(point.amount || 0),
  }));
  const maxValue = Math.max(...visiblePoints.map((point) => Number(point.value || 0)), 1);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const coordinates = visiblePoints.map((point, index) => {
    const x = padding + (visiblePoints.length === 1 ? chartWidth / 2 : (index / (visiblePoints.length - 1)) * chartWidth);
    const y = padding + chartHeight - (Number(point.value || 0) / maxValue) * chartHeight;
    return { ...point, x, y };
  });
  const linePath = coordinates.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = coordinates.length > 0
    ? `${linePath} L ${coordinates[coordinates.length - 1].x} ${height - padding} L ${coordinates[0].x} ${height - padding} Z`
    : '';
  const latest = coordinates[coordinates.length - 1]?.value || 0;
  const totalAmount = visibleRawPoints.reduce((sum, point) => sum + Number(point.amount || 0), 0);

  const chartButton = (active) => ({
    border: `1px solid ${active ? '#0f766e' : '#e2e8f0'}`,
    borderRadius: '9px',
    padding: '6px 9px',
    background: active ? '#0f766e' : '#ffffff',
    color: active ? '#ffffff' : '#64748b',
    fontWeight: 850,
    fontSize: '0.73rem',
    cursor: 'pointer',
    transition: 'transform 0.18s ease, background-color 0.2s ease, border-color 0.2s ease',
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {[['5', '5 mã'], ['10', '10 mã'], ['all', 'Tất cả']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setLimit(value)} style={chartButton(limit === value)}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {[['cumulative', 'Tích lũy'], ['transaction', 'Theo từng mã']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setMode(value)} style={chartButton(mode === value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220" role="img" aria-label="Xu hướng doanh thu" onMouseLeave={() => setTooltip(null)}>
          <defs>
            <linearGradient id="partnerRevenueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f766e" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((line) => {
            const y = padding + (line / 3) * chartHeight;
            return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 6" />;
          })}
          <path d={areaPath} fill="url(#partnerRevenueArea)" />
          <path d={linePath} fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {coordinates.map((point, index) => (
            <g
              key={`${point.label}-${point.x}`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setTooltip({ ...point, index })}
              onMouseMove={() => setTooltip({ ...point, index })}
            >
              <circle cx={point.x} cy={point.y} r="14" fill="transparent" />
              <circle
                cx={point.x}
                cy={point.y}
                r={tooltip?.index === index ? 7 : 5}
                fill="#ffffff"
                stroke="#0f766e"
                strokeWidth="3"
                style={{ transition: 'r 0.18s ease, filter 0.18s ease', filter: tooltip?.index === index ? 'drop-shadow(0 4px 7px rgba(15, 118, 110, 0.3))' : 'none' }}
              />
            </g>
          ))}
        </svg>

        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{
                position: 'absolute',
                left: `${Math.min(Math.max((tooltip.x / width) * 100, 8), 72)}%`,
                top: `${Math.max((tooltip.y / height) * 100 - 28, 2)}%`,
                zIndex: 3,
                width: 'min(210px, 48%)',
                padding: '10px 11px',
                borderRadius: '11px',
                background: '#0f172a',
                color: '#ffffff',
                boxShadow: '0 14px 30px rgba(15, 23, 42, 0.25)',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontWeight: 950, fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tooltip.label}</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.72rem', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tooltip.title}</div>
              <div style={{ marginTop: '7px', fontWeight: 900, fontSize: '0.82rem' }}>
                Giá trị mã: {money(tooltip.amount)}
              </div>
              {mode === 'cumulative' && <div style={{ color: '#99f6e4', fontSize: '0.72rem', marginTop: '2px' }}>Tích lũy: {money(tooltip.value)}</div>}
              {tooltip.date && <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '5px' }}>{new Date(tooltip.date).toLocaleString('vi-VN')}</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
        <div>
          <div style={{ color: '#64748b', fontWeight: 800, fontSize: '0.78rem' }}>{mode === 'cumulative' ? 'Doanh thu tích lũy' : 'Tổng doanh thu trong bộ lọc'}</div>
          <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>{money(mode === 'cumulative' ? latest : totalAmount)}</div>
        </div>
        <div style={{ color: '#0f766e', background: '#ccfbf1', padding: '8px 10px', borderRadius: '999px', fontWeight: 900, fontSize: '0.8rem' }}>
          {visibleRawPoints.length} mã
        </div>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ padding: '28px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>{text}</div>;
}

function ReportMetric({ label, value }) {
  return (
    <motion.div
      whileHover={{ y: -3, backgroundColor: '#eef6ff', boxShadow: '0 10px 22px rgba(15, 23, 42, 0.07)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', cursor: 'default' }}
    >
      <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: '1.35rem', fontWeight: 900, marginTop: '4px' }}>{value}</div>
    </motion.div>
  );
}

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tổng quan' },
    { path: '/vouchers', icon: Ticket, label: 'Voucher của tôi' },
    { path: '/redeem', icon: CheckCircle, label: 'Xác thực mã' },
    { path: '/reports', icon: BarChart3, label: 'Báo cáo' },
    { path: '/settings', icon: Settings, label: 'Hồ sơ đối tác' },
  ];

  const logout = () => {
    clearSession();
    navigate('/');
    window.location.reload();
  };

  return (
    <aside style={{ width: '270px', height: '100dvh', maxHeight: '100dvh', background: '#ffffff', color: '#475569', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border-color)', boxShadow: '8px 0 24px rgba(15, 23, 42, 0.03)' }}>
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, color: '#0f172a', fontWeight: 900, fontSize: '1.2rem' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: '#eef6ff', color: '#0369a1', display: 'grid', placeItems: 'center' }}><Building2 size={22} /></div>
        PartnerHub
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 14px 14px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div className="sidebar-group-title">Phân hệ chức năng</div>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`sidebar-item ${active ? 'active' : ''}`}>
              <item.icon size={20} /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: '16px', flexShrink: 0, borderTop: '1px solid var(--border-color)', background: '#ffffff' }}>
        <button onClick={logout} style={{ ...shell.button, width: '100%', background: '#fff1f2', color: '#be123c' }}><LogOut size={18} /> Đăng xuất</button>
      </div>
    </aside>
  );
}

function PartnerShell() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <header style={{ height: '68px', background: 'rgba(255,255,255,0.92)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 28px', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(14px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: 900 }}><Eye size={18} /> Cổng đối tác Dealzy</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#667085', fontWeight: 800 }}><User size={18} /> {JSON.parse(localStorage.getItem('partnerUser') || '{}').username || 'Partner'}</div>
        </header>
        <PartnerRoutes />
      </main>
    </div>
  );
}

function RouteTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.995 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function PartnerRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RouteTransition><Dashboard /></RouteTransition>} />
        <Route path="/vouchers" element={<RouteTransition><VoucherManagement /></RouteTransition>} />
        <Route path="/redeem" element={<RouteTransition><RedeemVoucher /></RouteTransition>} />
        <Route path="/reports" element={<RouteTransition><Reports /></RouteTransition>} />
        <Route path="/settings" element={<RouteTransition><Profile /></RouteTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function PublicRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/register-partner" element={<RouteTransition><PartnerRegistration /></RouteTransition>} />
        <Route path="*" element={<RouteTransition><AuthPage /></RouteTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const token = localStorage.getItem('partnerToken');

  if (!token) {
    return (
      <Router>
        <PublicRoutes />
      </Router>
    );
  }

  return (
    <Router>
      <PartnerShell />
      <ChatbotWidget />
    </Router>
  );
}

export default App;


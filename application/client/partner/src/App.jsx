import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  CheckCircle,
  ClipboardCheck,
  Edit3,
  Eye,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Ticket,
  User,
  XCircle,
} from 'lucide-react';
import AuthPage from './pages/AuthPage';

const API_URL = 'http://localhost:5000';

const money = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0));

const dateOnly = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('partnerToken');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || 'Không thể xử lý yêu cầu');
  return data;
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
  return <span style={{ background: bg, color, padding: '4px 9px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 900 }}>{label}</span>;
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

  if (!data && !error) return <LoadingBlock />;

  const stats = [
    { label: 'Doanh thu đã ghi nhận', value: money(data?.revenue), icon: BarChart3, color: 'var(--primary)' },
    { label: 'Voucher đang bán', value: data?.approved_vouchers || 0, icon: Ticket, color: 'var(--primary)' },
    { label: 'Voucher chờ duyệt', value: data?.pending_vouchers || 0, icon: ClipboardCheck, color: 'var(--primary)' },
    { label: 'Mã đã sử dụng', value: data?.used_quantity || 0, icon: CheckCircle, color: 'var(--primary)' },
  ];

  return (
    <div style={shell.page}>
      <PageTitle title="Tổng quan kinh doanh" subtitle="Theo dõi nhanh doanh thu, voucher và hoạt động xác thực của đối tác." onRefresh={load} />
      <ErrorBox message={error} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {stats.map((item) => (
          <div key={item.label} style={{ ...shell.card, padding: '20px' }}>
            <item.icon size={24} color={item.color} />
            <div style={{ color: '#64748b', fontWeight: 700, marginTop: '12px', fontSize: '0.86rem' }}>{item.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '4px' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ ...shell.card, padding: '22px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Hoạt động mã voucher gần đây</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(data?.recent_activity || []).length === 0 ? (
            <Empty text="Chưa có mã voucher nào được phát hành cho đối tác này." />
          ) : (
            data.recent_activity.map((item) => (
              <div key={item.unique_code} style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{item.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{item.unique_code} · {item.customer_name || 'Khách hàng'}</div>
                </div>
                <StatusPill status={item.status} />
              </div>
            ))
          )}
        </div>
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

  return (
    <div style={shell.page}>
      <PageTitle title="Quản lý voucher" subtitle="Tạo chương trình mới, gửi duyệt và theo dõi hiệu quả từng voucher." onRefresh={load}>
        <button onClick={resetForm} style={{ ...shell.button, background: 'var(--primary)', color: 'white' }}><Plus size={18} /> Tạo voucher</button>
      </PageTitle>
      <ErrorBox message={error} />
      {success && <div style={{ padding: '12px 14px', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontWeight: 800 }}>{success}</div>}

      {formOpen && (
        <form onSubmit={submitForm} style={{ ...shell.card, padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
          <h2 style={{ gridColumn: '1 / -1', fontSize: '1.2rem' }}>{editing ? 'Cập nhật voucher chờ duyệt' : 'Tạo voucher mới'}</h2>
          <Field label="Tên voucher" value={form.title} onChange={(title) => setForm({ ...form, title })} required />
          <Select label="Danh mục" value={form.category_id} onChange={(category_id) => setForm({ ...form, category_id })} options={categories.map((c) => [c.category_id, c.category_name])} required />
          <Field label="Giá gốc" type="number" value={form.original_price} onChange={(original_price) => setForm({ ...form, original_price })} required />
          <Field label="Giá bán" type="number" value={form.sale_price} onChange={(sale_price) => setForm({ ...form, sale_price })} required />
          <Field label="Số lượng phát hành" type="number" value={form.total_quantity} onChange={(total_quantity) => setForm({ ...form, total_quantity })} required />
          <Field label="Ảnh voucher URL" value={form.image_url} onChange={(image_url) => setForm({ ...form, image_url })} />
          <Field label="Ngày bắt đầu bán" type="date" value={form.start_date} onChange={(start_date) => setForm({ ...form, start_date })} />
          <Field label="Ngày hết hạn/sử dụng" type="date" value={form.expiry_date} onChange={(expiry_date) => setForm({ ...form, expiry_date })} required />
          <TextArea label="Mô tả" value={form.description} onChange={(description) => setForm({ ...form, description })} />
          <TextArea label="Điều kiện áp dụng" value={form.terms_and_conditions} onChange={(terms_and_conditions) => setForm({ ...form, terms_and_conditions })} />
          <TextArea label="Chính sách hoàn/hủy" value={form.cancellation_policy} onChange={(cancellation_policy) => setForm({ ...form, cancellation_policy })} />
          <div>
            <label style={shell.label}>Chi nhánh áp dụng</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
              {branches.map((branch) => (
                <label key={branch.branch_id} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 700, color: '#334155' }}>
                  <input type="checkbox" checked={form.branch_ids.map(Number).includes(branch.branch_id)} onChange={(e) => updateBranch(branch.branch_id, e.target.checked)} />
                  {branch.branch_name}
                </label>
              ))}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setFormOpen(false)} style={{ ...shell.button, background: '#f1f5f9', color: '#475569' }}><XCircle size={18} /> Hủy</button>
            <button type="submit" style={{ ...shell.button, background: '#16a34a', color: 'white' }}><Save size={18} /> Lưu và gửi duyệt</button>
          </div>
        </form>
      )}

      {loading ? <LoadingBlock /> : (
        <div style={{ ...shell.card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                {['Voucher', 'Giá bán', 'Tồn kho', 'Đã bán', 'Đã dùng', 'Trạng thái', 'Thao tác'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px', color: '#475569', fontSize: '0.78rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => (
                <tr key={voucher.voucher_id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 900 }}>{voucher.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{voucher.category_name} · {voucher.branch_names || 'Tất cả chi nhánh'}</div>
                  </td>
                  <td style={{ padding: '14px', fontWeight: 800 }}>{money(voucher.sale_price)}</td>
                  <td style={{ padding: '14px' }}>{voucher.quantity_stock}/{voucher.total_quantity}</td>
                  <td style={{ padding: '14px' }}>{voucher.sold_quantity}</td>
                  <td style={{ padding: '14px' }}>{voucher.used_quantity}</td>
                  <td style={{ padding: '14px' }}><StatusPill status={voucher.status} /></td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => editVoucher(voucher)} disabled={voucher.status === 'Approved'} style={{ ...shell.button, padding: '8px 10px', background: 'var(--bg-dark)', color: 'var(--primary)', opacity: voucher.status === 'Approved' ? 0.45 : 1 }}><Edit3 size={15} /> Sửa</button>
                      <button onClick={() => action(voucher.voucher_id, 'submit')} style={{ ...shell.button, padding: '8px 10px', background: '#fef3c7', color: '#92400e' }}><ClipboardCheck size={15} /> Gửi duyệt</button>
                      <button onClick={() => action(voucher.voucher_id, 'disable')} style={{ ...shell.button, padding: '8px 10px', background: '#fee2e2', color: '#991b1b' }}><XCircle size={15} /> Ngưng</button>
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

  useEffect(() => {
    apiFetch('/api/partner/branches').then(setBranches).catch((err) => setError(err.message));
  }, []);

  const check = async (event) => {
    if (event) event.preventDefault();
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
        <button type="submit" style={{ ...shell.button, background: 'var(--primary)', color: 'white', height: '42px' }}><Search size={18} /> Kiểm tra</button>
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

  if (!data && !error) return <div style={shell.page}><LoadingBlock /></div>;

  return (
    <div style={shell.page}>
      <PageTitle title="Báo cáo đối tác" subtitle="Hiệu quả phát hành, bán và sử dụng theo từng chương trình voucher." onRefresh={load} />
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
        {onRefresh && <button onClick={onRefresh} style={{ ...shell.button, background: '#f1f5f9', color: '#475569' }}><RefreshCw size={18} /> Làm mới</button>}
        {children}
      </div>
    </div>
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

function Select({ label, value, onChange, options, required = false }) {
  return (
    <div>
      <label style={shell.label}>{label}</label>
      <select required={required} value={value} onChange={(e) => onChange(e.target.value)} style={shell.input}>
        <option value="">Chọn...</option>
        {options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div style={{ gridColumn: 'span 1' }}>
      <label style={shell.label}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} style={{ ...shell.input, resize: 'vertical' }} />
    </div>
  );
}

function InfoLine({ label, value }) {
  return <div style={{ marginTop: '8px', color: '#475569' }}><b>{label}:</b> {value}</div>;
}

function Empty({ text }) {
  return <div style={{ padding: '28px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>{text}</div>;
}

function ReportMetric({ label, value }) {
  return (
    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
      <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: '1.35rem', fontWeight: 900, marginTop: '4px' }}>{value}</div>
    </div>
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
    localStorage.removeItem('partnerToken');
    localStorage.removeItem('partnerUser');
    navigate('/');
    window.location.reload();
  };

  return (
    <aside style={{ width: '270px', background: '#0f172a', color: '#cbd5e1', minHeight: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: '#1e293b', display: 'grid', placeItems: 'center' }}><Building2 size={22} /></div>
        PartnerHub
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 14px', flex: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: 'var(--radius-md)', color: active ? 'white' : '#cbd5e1', background: active ? '#1e293b' : 'transparent', textDecoration: 'none', fontWeight: 600 }}>
              <item.icon size={20} /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: '16px' }}>
        <button onClick={logout} style={{ ...shell.button, width: '100%', background: 'rgba(255,255,255,0.08)', color: '#fecaca' }}><LogOut size={18} /> Đăng xuất</button>
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
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vouchers" element={<VoucherManagement />} />
          <Route path="/redeem" element={<RedeemVoucher />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

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
      <PartnerShell />
    </Router>
  );
}

export default App;

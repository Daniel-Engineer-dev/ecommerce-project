import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Ticket, Search, Check, X, Eye, ShieldAlert, AlertCircle,
  Clock, CheckCircle2, Ban, EyeOff, Calendar, Tag, Building2,
  Package, Info, HelpCircle, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { API_ADMIN_URL } from '../config';
import { apiFetch } from '../apiClient';
import { createRealtimeSource } from '../realtime';

const API = API_ADMIN_URL;
const getToken = () => localStorage.getItem('adminToken');

const VoucherManagement = () => {
  const location = useLocation();
  const initialPartnerId = location.state?.searchPartner || '';

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchInput, setSearchInput] = useState(initialPartnerId ? initialPartnerId : '');
  const [search, setSearch] = useState('');       
  
  const [activeTab, setActiveTab] = useState('Approved');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1); 
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    fetchVouchers();
  }, [activeTab, search, currentPage]);

  useEffect(() => {
    const source = createRealtimeSource();
    if (!source) return undefined;
    const refresh = () => fetchVouchers();
    source.addEventListener('voucher.status_changed', refresh);
    source.addEventListener('voucher.updated', refresh);
    return () => source.close();
  }, [activeTab, search, currentPage]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const queryPage = Number(currentPage) || 1;
      const res = await apiFetch(`${API}/vouchers?status=${activeTab}&search=${search}&page=${queryPage}&limit=10`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setVouchers(data.vouchers || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
      }
    } catch (err) {
      showToast('error', 'Lỗi tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const readErrorMessage = async (res, fallback) => {
    const data = await res.json().catch(() => ({}));
    return data.message || data.error || fallback;
  };

  const handleApprove = async (id) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`${API}/vouchers/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        showToast('success', 'Đã phê duyệt voucher thành công!');
        setSelectedVoucher(null);
        fetchVouchers();
      } else {
        showToast('error', await readErrorMessage(res, 'Thao tác phê duyệt thất bại'));
      }
    } catch (err) {
      showToast('error', err.message || 'Thao tác phê duyệt thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      showToast('error', 'Vui lòng điền lý do từ chối cụ thể!');
      return;
    }
    try {
      setSubmitting(true);
      const res = await apiFetch(`${API}/vouchers/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        showToast('success', 'Đã từ chối cấp phép phát hành voucher');
        setSelectedVoucher(null);
        setRejectReason('');
        setShowRejectInput(false);
        fetchVouchers();
      } else {
        showToast('error', await readErrorMessage(res, 'Thao tác từ chối thất bại'));
      }
    } catch (err) {
      showToast('error', err.message || 'Thao tác từ chối thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisibility = async (id, currentStatus) => {
    try {
      const res = await apiFetch(`${API}/vouchers/${id}/toggle-visibility`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStatus })
      });
      if (res.ok) {
        showToast('success', 'Đã cập nhật trạng thái hiển thị voucher');
        setSelectedVoucher(null);
        fetchVouchers();
      } else {
        showToast('error', await readErrorMessage(res, 'Lỗi chuyển đổi trạng thái hiển thị'));
      }
    } catch (err) {
      showToast('error', err.message || 'Lỗi chuyển đổi trạng thái hiển thị');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 space-y-6 bg-[#f5f7fa] min-h-screen"
    >
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-1">
            Quản lý chiến dịch & sản phẩm
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Quản lý Voucher
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2.5 rounded-xl md:max-w-xs focus-within:border-[#1a3a5c] transition-all shadow-sm">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm tên đối tác, voucher..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder:text-slate-400" 
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        {[
          { id: 'Pending', label: 'Chờ duyệt', icon: Clock },
          { id: 'Approved', label: 'Đang lưu hành', icon: CheckCircle2 },
          { id: 'Rejected', label: 'Bị từ chối', icon: Ban },
          { id: 'Suspended', label: 'Đang tạm ẩn', icon: EyeOff }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowRejectInput(false); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-[#1a3a5c] text-[#1a3a5c]' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-sm font-medium text-slate-400">Đang đồng bộ dữ liệu voucher...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-16 text-center text-sm font-medium text-slate-400">
            <Ticket size={32} className="mx-auto text-slate-300 mb-3" />
            Không có voucher nào trong danh mục này.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Voucher</th>
                    <th className="px-6 py-4">Đối tác phát hành</th>
                    <th className="px-6 py-4">Giá bán / Giá gốc</th>
                    <th className="px-6 py-4">Kho hàng</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
                  {vouchers.map((v) => (
                    <tr key={v.voucher_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {v.image_url ? (
                            <img src={v.image_url} alt={v.title} className="w-10 h-10 object-cover rounded-xl border border-slate-100 shrink-0" onError={(e) => { e.target.src = "https://placehold.co/100x100?text=Voucher"; }} />
                          ) : (
                            <div className="w-10 h-10 bg-slate-50 text-slate-400 flex items-center justify-center rounded-xl border border-slate-100 shrink-0"><Tag size={16} /></div>
                          )}
                          <div className="min-w-0">
                            <div className="text-slate-800 font-semibold max-w-xs truncate">{v.title}</div>
                            {v.discount_percent && (
                              <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                                Giảm {v.discount_percent}%
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                          <Building2 size={14} className="text-slate-400"/> {v.company_name || 'Hệ thống'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-800 font-bold">{Number(v.sale_price).toLocaleString()}đ</span>
                        <span className="text-xs text-slate-400 line-through block mt-0.5">{Number(v.original_price).toLocaleString()}đ</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-semibold text-sm">{v.quantity_stock ?? v.total_quantity ?? 0} <span className="text-[10px] text-slate-400 font-normal">mã</span></div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Tổng: {v.total_quantity ?? 0}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedVoucher(v)}
                          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-[#1a3a5c] hover:text-white hover:border-[#1a3a5c] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 transition-all shadow-sm"
                        >
                          <Eye size={14} /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Trang <span className="text-slate-700">{currentPage}</span> / <span className="text-slate-700">{totalPages}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-100 bg-white disabled:opacity-40 text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-100 bg-white disabled:opacity-40 text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Detail */}
      <AnimatePresence>
        {selectedVoucher && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-white">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Chi Tiết Yêu Cầu Voucher</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">Hồ sơ ID: #{selectedVoucher.voucher_id}</p>
                </div>
                <button onClick={() => { setSelectedVoucher(null); setShowRejectInput(false); }} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"><X size={16}/></button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50/50">
                {selectedVoucher.image_url && (
                  <div className="w-full h-48 rounded-2xl overflow-hidden shadow-sm relative">
                    <img src={selectedVoucher.image_url} alt={selectedVoucher.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-white/90 text-[#1a3a5c] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-sm">
                      Giảm {selectedVoucher.discount_percent}%
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-100 text-sm">
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">Chương trình</span> 
                    <span className="text-base text-slate-800 font-bold">{selectedVoucher.title}</span>
                  </div>
                  <div className="col-span-2 h-px bg-slate-50 my-1" />
                  
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">Giá bán</span> 
                    <span className="text-sm text-slate-800 font-bold">{Number(selectedVoucher.sale_price).toLocaleString()}đ</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">Giá trị gốc</span> 
                    <span className="text-sm text-slate-400 line-through">{Number(selectedVoucher.original_price).toLocaleString()}đ</span>
                  </div>
                  <div className="col-span-2 h-px bg-slate-50 my-1" />

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">Tổng phát hành</span> 
                    <span className="text-sm text-slate-700 font-medium flex items-center gap-1.5"><Package size={14} className="text-slate-400"/> {selectedVoucher.total_quantity} mã</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">Tồn kho hiện tại</span> 
                    <span className="text-sm text-slate-700 font-medium flex items-center gap-1.5"><Package size={14} className="text-slate-400"/> {selectedVoucher.quantity_stock} mã</span>
                  </div>
                </div>

                {showRejectInput && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <label className="text-[11px] font-semibold text-rose-500 flex items-center gap-1.5 uppercase tracking-wider"><AlertCircle size={14}/> Lý do từ chối:</label>
                    <textarea 
                      className="w-full border border-rose-200 p-4 rounded-xl text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-white shadow-sm resize-none" 
                      rows="3" placeholder="Ghi chú chi tiết lý do từ chối..."
                      value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </motion.div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="p-5 bg-white border-t border-slate-100 flex gap-3">
                {activeTab === 'Pending' && (
                  <>
                    {!showRejectInput ? (
                      <>
                        <button
                          onClick={() => handleApprove(selectedVoucher.voucher_id)}
                          disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#6ec6a0] text-white py-3 rounded-xl font-semibold hover:bg-[#5bb890] text-sm shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> Đang xử lý...
                            </>
                          ) : (
                            <>
                              <Check size={16}/> Phê duyệt phát hành
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowRejectInput(true)}
                          disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 bg-white text-rose-600 border border-rose-100 py-3 rounded-xl font-semibold hover:bg-rose-50 text-sm shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Từ chối duyệt
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleReject(selectedVoucher.voucher_id)}
                          disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 bg-rose-500 text-white py-3 rounded-xl font-semibold hover:bg-rose-600 text-sm shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> Đang xử lý...
                            </>
                          ) : (
                            "Xác nhận Từ chối"
                          )}
                        </button>
                        <button
                          onClick={() => setShowRejectInput(false)}
                          disabled={submitting}
                          className="px-6 bg-slate-50 border border-slate-100 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-100 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Quay lại
                        </button>
                      </>
                    )}
                  </>
                )}

                {activeTab === 'Approved' && (
                  <button onClick={() => handleToggleVisibility(selectedVoucher.voucher_id, 'Approved')} className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm"><EyeOff size={16}/> Đình chỉ hiển thị khẩn cấp</button>
                )}

                {activeTab === 'Suspended' && (
                  <button onClick={() => handleToggleVisibility(selectedVoucher.voucher_id, 'Suspended')} className="w-full flex items-center justify-center gap-2 bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#132a44] text-sm transition-all shadow-sm"><Eye size={16}/> Cho phép hiển thị lại</button>
                )}
                
                {activeTab === 'Rejected' && (
                  <div className="w-full p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700">
                    <span className="font-semibold uppercase tracking-wider block mb-1 text-[10px]">Lý do từ chối:</span> 
                    {selectedVoucher.rejected_reason || 'Không có lý do chi tiết.'}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} 
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-medium text-sm shadow-xl ${toast.type === 'success' ? 'bg-[#1a3a5c]' : 'bg-rose-500'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} className="text-[#6ec6a0]"/> : <ShieldAlert size={16} className="text-white"/>} 
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VoucherManagement;


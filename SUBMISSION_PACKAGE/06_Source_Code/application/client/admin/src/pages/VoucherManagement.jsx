import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, Search, Check, X, Eye, ShieldAlert, AlertCircle,
  Clock, CheckCircle2, Ban, EyeOff, Calendar, Tag, Building2,
  Package, Info, HelpCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

const API = 'http://localhost:5000/api/admin';
const getToken = () => localStorage.getItem('adminToken');

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchInput, setSearchInput] = useState(''); 
  const [search, setSearch] = useState('');       
  
  const [activeTab, setActiveTab] = useState('Approved');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [toast, setToast] = useState(null);

  // --- STATE PHÂN TRANG MỚI THÊM ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Xử lý Debounce cho ô tìm kiếm
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1); // Reset về trang 1 khi gõ tìm kiếm mới
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  // Gọi API khi Tab thay đổi, khi Search thay đổi, hoặc khi chuyển Trang
  useEffect(() => {
    fetchVouchers();
  }, [activeTab, search, currentPage]);

  const fetchVouchers = async () => {
  setLoading(true);
  try {
    const queryPage = Number(currentPage) || 1;
    
    const res = await fetch(`${API}/vouchers?status=${activeTab}&search=${search}&page=${queryPage}&limit=10`, {
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

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API}/vouchers/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        showToast('success', 'Đã phê duyệt voucher thành công!');
        setSelectedVoucher(null);
        fetchVouchers();
      }
    } catch (err) {
      showToast('error', 'Thao tác phê duyệt thất bại');
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      showToast('error', 'Vui lòng điền lý do từ chối cụ thể!');
      return;
    }
    try {
      const res = await fetch(`${API}/vouchers/${id}/reject`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        showToast('success', 'Đã từ chối cấp phép phát hành voucher');
        setSelectedVoucher(null);
        setRejectReason('');
        setShowRejectInput(false);
        fetchVouchers();
      }
    } catch (err) {
      showToast('error', 'Thao tác từ chối thất bại');
    }
  };

  const handleToggleVisibility = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API}/vouchers/${id}/toggle-visibility`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentStatus })
      });
      if (res.ok) {
        showToast('success', 'Đã cập nhật trạng thái hiển thị voucher');
        setSelectedVoucher(null);
        fetchVouchers();
      }
    } catch (err) {
      showToast('error', 'Lỗi chuyển đổi trạng thái hiển thị');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Tiêu đề & Thanh tìm kiếm */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Quản lý Voucher
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm w-80">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm tên đối tác, voucher..." 
            value={searchInput} // Đồng bộ lại từ ô input của bạn (tránh lag khi gõ text với debounce)
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full font-medium" 
          />
        </div>
      </div>

      {/* Bộ lọc Tabs trạng thái vòng đời */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
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
              onClick={() => { 
                setActiveTab(tab.id); 
                setShowRejectInput(false); 
                setCurrentPage(1); // Chuyển tab thì reset về trang 1
              }}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all duration-150 ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Danh sách bảng dữ liệu hiển thị */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm font-bold text-slate-400">Đang đồng bộ dữ liệu voucher...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 text-center text-sm font-bold text-slate-400">Không có voucher nào trong danh mục này.</div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Voucher</th>
                  <th className="p-4">Đối tác phát hành</th>
                  <th className="p-4">Giá bán / Giá gốc</th>
                  <th className="p-4">Kho hàng</th>
                  <th className="p-4 text-center pr-6">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {vouchers.map((v) => (
                  <tr key={v.voucher_id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        {v.image_url ? (
                          <img 
                            src={v.image_url} 
                            alt={v.title} 
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200/80 shadow-sm"
                            onError={(e) => { e.target.src = "https://placehold.co/100x100?text=Voucher"; }}
                          />
                        ) : (
                          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Tag size={18} /></div>
                        )}
                        <div>
                          <div className="text-slate-900 font-bold max-w-xs truncate">{v.title}</div>
                          {v.discount_percent && (
                            <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block mt-0.5">
                              Giảm {v.discount_percent}%
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Building2 size={16} className="text-slate-400"/> {v.company_name || 'Hệ thống'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-indigo-600 font-black text-sm">{Number(v.sale_price).toLocaleString()}đ</span>
                      <span className="text-xs text-slate-400 line-through block font-medium mt-0.5">{Number(v.original_price).toLocaleString()}đ</span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-900 font-bold">{v.quantity_stock ?? v.total_quantity ?? 0} <span className="text-xs text-slate-400 font-medium">mã</span></div>
                      <div className="text-[10px] text-slate-400 font-medium">Tổng: {v.total_quantity ?? 0}</div>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <button 
                        onClick={() => setSelectedVoucher(v)}
                        className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/80 hover:bg-indigo-600 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 transition-all shadow-sm"
                      >
                        <Eye size={14} /> Xem chi tiết & Duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- COMPONENT THANH ĐIỀU HƯỚNG PHÂN TRANG (MỚI THÊM) --- */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500">
              <div>
                Hiển thị trang <span className="text-slate-800">{currentPage}</span> / <span className="text-slate-800">{totalPages}</span> (Tổng số <span className="text-indigo-600">{totalItems}</span> voucher)
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  // Thuật toán hiển thị giới hạn nút trang nếu số lượng trang quá lớn
                  if (totalPages > 5 && Math.abs(currentPage - pageNum) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedVoucher && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
            >
              {/* Header Modal */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Chi Tiết Hồ Sơ Yêu Cầu Voucher</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Mã số hồ sơ hệ thống: #{selectedVoucher.voucher_id}</p>
                </div>
                <button onClick={() => { setSelectedVoucher(null); setShowRejectInput(false); }} className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-400 transition-colors"><X size={18}/></button>
              </div>

              {/* Body Modal */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {selectedVoucher.image_url && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
                    <img 
                      src={selectedVoucher.image_url} 
                      alt={selectedVoucher.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/70 text-white font-black text-xs px-3 py-1.5 rounded-xl backdrop-blur-sm">
                      Mức Giảm {selectedVoucher.discount_percent}%
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-600">
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-1">Tên chương trình voucher:</span> 
                    <span className="text-base text-slate-900 font-black">{selectedVoucher.title}</span>
                  </div>
                  <div className="col-span-2 h-px bg-slate-200/60 my-1" />
                  
                  <div>
                    <span className="text-slate-400 block mb-1">Giá bán trên sàn:</span> 
                    <span className="text-base text-emerald-600 font-black">{Number(selectedVoucher.sale_price).toLocaleString()} VNĐ</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Giá trị gốc sản phẩm:</span> 
                    <span className="text-base text-slate-400 line-through font-bold">{Number(selectedVoucher.original_price).toLocaleString()} VNĐ</span>
                  </div>
                  <div className="col-span-2 h-px bg-slate-200/60 my-1" />

                  <div>
                    <span className="text-slate-400 block mb-1">Tổng phát hành:</span> 
                    <span className="text-sm text-slate-800 font-bold flex items-center gap-1"><Package size={14}/> {selectedVoucher.total_quantity} mã</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Tồn kho hiện tại:</span> 
                    <span className="text-sm text-slate-800 font-bold flex items-center gap-1"><Package size={14}/> {selectedVoucher.quantity_stock} mã</span>
                  </div>
                  <div className="col-span-2 h-px bg-slate-200/60 my-1" />

                  <div>
                    <span className="text-slate-400 block mb-1">Ngày bắt đầu chạy:</span> 
                    <span className="text-xs text-slate-800 font-bold flex items-center gap-1">
                      <Calendar size={14} className="text-slate-400"/> {new Date(selectedVoucher.start_date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Ngày hết hạn sử dụng:</span> 
                    <span className="text-xs text-slate-800 font-bold flex items-center gap-1">
                      <Calendar size={14} className="text-slate-400"/> {new Date(selectedVoucher.expiry_date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Info size={14}/> Mô tả chi tiết chương trình:</h4>
                    <p className="text-slate-700 text-xs font-medium leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/60">{selectedVoucher.description || 'Không có mô tả chi tiết kèm theo.'}</p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><HelpCircle size={14}/> Điều kiện áp dụng (Terms):</h4>
                    <p className="text-slate-700 text-xs font-medium leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/60">{selectedVoucher.terms_and_conditions || 'Áp dụng theo quy định chung của sàn.'}</p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><AlertCircle size={14}/> Chính sách hoàn hủy vé (Cancellation Policy):</h4>
                    <p className="text-slate-700 text-xs font-medium leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/60">{selectedVoucher.cancellation_policy || 'Voucher đã mua không hỗ trợ hoàn hủy tiền mặt.'}</p>
                  </div>
                </div>

                {showRejectInput && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-rose-600 flex items-center gap-1"><AlertCircle size={14}/> Nhập lý do từ chối phê duyệt hồ sơ:</label>
                    <textarea 
                      className="w-full border border-rose-200 p-3 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 font-medium shadow-inner" 
                      rows="3" placeholder="Lý do từ chối gửi về đối tác doanh nghiệp..."
                      value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </motion.div>
                )}
              </div>

              {/* Footer Modal Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                {activeTab === 'Pending' && (
                  <>
                    {!showRejectInput ? (
                      <>
                        <button onClick={() => handleApprove(selectedVoucher.voucher_id)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 text-sm shadow-md shadow-emerald-100 transition-all"><Check size={16}/> Phê duyệt phát hành</button>
                        <button onClick={() => setShowRejectInput(true)} className="flex-1 flex items-center justify-center gap-2 bg-white text-rose-600 py-3 rounded-xl font-bold hover:bg-rose-50 text-sm border border-rose-200 transition-all">Từ chối</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleReject(selectedVoucher.voucher_id)} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 text-sm shadow-md transition-all">Xác nhận Từ Chối</button>
                        <button onClick={() => setShowRejectInput(false)} className="px-5 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl font-bold hover:bg-slate-100 text-sm transition-all">Quay lại</button>
                      </>
                    )}
                  </>
                )}

                {activeTab === 'Approved' && (
                  <button onClick={() => handleToggleVisibility(selectedVoucher.voucher_id, 'Approved')} className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-200/80 py-3 rounded-xl font-bold hover:bg-rose-100 text-sm transition-all"><EyeOff size={16}/> Đình chỉ hiển thị (Tạm dừng lưu hành khẩn cấp)</button>
                )}

                {activeTab === 'Suspended' && (
                  <button onClick={() => handleToggleVisibility(selectedVoucher.voucher_id, 'Suspended')} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 text-sm transition-all"><Eye size={16}/> Tái kích hoạt hiển thị (Cho phép lưu hành lại)</button>
                )}
                
                {activeTab === 'Rejected' && (
                  <div className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 font-medium">
                    <span className="font-bold text-rose-600 block mb-1">Lý do hệ thống từ chối cấp phép:</span> {selectedVoucher.rejected_reason || 'Không có lý do chi tiết.'}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST THÔNG BÁO */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16}/> : <ShieldAlert size={16}/>} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoucherManagement;
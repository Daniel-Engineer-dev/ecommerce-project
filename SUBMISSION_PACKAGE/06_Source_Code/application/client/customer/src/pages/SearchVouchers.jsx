import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import VoucherCard from '../components/VoucherCard';
import { Search, Filter, X, ChevronDown, MapPin, Tag, CircleDollarSign, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchVouchers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho bộ lọc
  const [filters, setFilters] = useState({
    q: queryParams.get('q') || '',
    category: queryParams.get('category') || '',
    minPrice: queryParams.get('minPrice') || '',
    maxPrice: queryParams.get('maxPrice') || '',
    minDiscount: queryParams.get('minDiscount') || '',
    area: queryParams.get('area') || ''
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Lấy danh sách danh mục
    fetch('http://localhost:5000/api/vouchers/categories') // Giả định có API này, nếu chưa có sẽ tạo sau
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
      
    fetchVouchers();
  }, [location.search]);

  const fetchVouchers = () => {
    setLoading(true);
    const searchUrl = `http://localhost:5000/api/vouchers/search${location.search}`;
    fetch(searchUrl)
      .then(res => res.json())
      .then(data => {
        setVouchers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error searching vouchers:", err);
        setLoading(false);
      });
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    navigate(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ q: '', category: '', minPrice: '', maxPrice: '', minDiscount: '', area: '' });
    navigate('/search');
  };

  return (
    <div style={{ paddingTop: '180px', minHeight: '100vh', background: '#f8fafc' }}>
      <div className="container" style={{ display: 'flex', gap: '2rem', paddingBottom: '4rem' }}>
        
        {/* SIDEBAR FILTER */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{
                width: '300px',
                flexShrink: 0,
                background: 'white',
                borderRadius: '24px',
                padding: '1.5rem',
                height: 'fit-content',
                position: 'sticky',
                top: '180px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                border: '1px solid #f1f5f9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={20} color="var(--primary)" /> Bộ lọc
                </h3>
                <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Xóa tất cả</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Search Keyword */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Từ khóa</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="Tìm tên voucher..." 
                      value={filters.q}
                      onChange={(e) => handleFilterChange('q', e.target.value)}
                      style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Danh mục</label>
                  <div style={{ position: 'relative' }}>
                    <Tag size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <select 
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', appearance: 'none', background: 'white' }}
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Area */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Khu vực</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="Quận, Tỉnh/Thành..." 
                      value={filters.area}
                      onChange={(e) => handleFilterChange('area', e.target.value)}
                      style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Khoảng giá (VNĐ)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      placeholder="Từ" 
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                    />
                    <span style={{ color: '#94a3b8' }}>-</span>
                    <input 
                      type="number" 
                      placeholder="Đến" 
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Discount Level */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Mức giảm từ (%)</label>
                  <div style={{ position: 'relative' }}>
                    <Percent size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="number" 
                      placeholder="Ví dụ: 30" 
                      value={filters.minDiscount}
                      onChange={(e) => handleFilterChange('minDiscount', e.target.value)}
                      style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <button 
                  onClick={applyFilters}
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '1rem', height: '48px', borderRadius: '14px' }}
                >
                  Áp dụng
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {vouchers.length} kết quả tìm kiếm
              </h2>
              {filters.q && <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Cho từ khóa: "<b>{filters.q}</b>"</p>}
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              {isSidebarOpen ? <X size={18} /> : <Filter size={18} />} 
              {isSidebarOpen ? 'Đóng bộ lọc' : 'Hiện bộ lọc'}
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
              <div className="loader" style={{ marginBottom: '1rem' }}></div>
              Đang tìm kiếm voucher tốt nhất cho bạn...
            </div>
          ) : vouchers.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {vouchers.map(v => (
                <VoucherCard key={v.voucher_id} voucher={v} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Không tìm thấy voucher nào</h3>
              <p style={{ color: '#64748b' }}>Thử thay đổi từ khóa hoặc bộ lọc để có kết quả tốt hơn nhé.</p>
              <button onClick={clearFilters} className="btn-outline" style={{ marginTop: '1.5rem' }}>Xóa tất cả bộ lọc</button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default SearchVouchers;

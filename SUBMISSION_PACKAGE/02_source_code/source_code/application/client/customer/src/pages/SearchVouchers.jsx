import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownWideNarrow,
  BadgePercent,
  Building,
  ChevronDown,
  CircleDollarSign,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";
import VoucherCard from "../components/VoucherCard";
import { API_BASE_URL, translateCategory } from "../config";
import CustomSelect from "../components/CustomSelect";

const SEARCH_RESULT_LIMIT = 12;

const readFilters = (search) => {
  const params = new URLSearchParams(search);
  const sort = params.get("sort") === "best" ? "best-selling" : params.get("sort") || "";

  return {
    q: params.get("q") || "",
    category: params.get("category") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    minDiscount: params.get("minDiscount") || "",
    area: params.get("area") || "",
    partner: params.get("partner") || "",
    sort,
  };
};

const pageCopy = {
  new: {
    title: "Deal mới nhất",
    eyebrow: "Vừa lên kệ",
    description: "Các voucher được duyệt gần đây, ưu tiên theo ngày bắt đầu mới nhất.",
  },
  "best-selling": {
    title: "Bán chạy nhất",
    eyebrow: "Được chọn nhiều",
    description: "Ưu tiên voucher có đơn đã thanh toán, lượng phát hành cao và mức giảm hấp dẫn.",
  },
  default: {
    title: "Tất cả voucher",
    eyebrow: "Marketplace",
    description: "Tìm ưu đãi phù hợp theo danh mục, đối tác, khu vực và ngân sách.",
  },
};

const SearchVouchers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [partners, setPartners] = useState([]);
  const [filters, setFilters] = useState(() => readFilters(location.search));
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeCopy = pageCopy[filters.sort] || pageCopy.default;

  const requestSearch = (offset = 0, search = location.search) => {
    if (offset === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const params = new URLSearchParams(search);
    if (params.get("sort") === "best") params.set("sort", "best-selling");
    params.set("limit", SEARCH_RESULT_LIMIT);
    params.set("offset", offset);

    fetch(`${API_BASE_URL}/api/vouchers/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        setVouchers((prev) => (offset === 0 ? rows : [...prev, ...rows]));
        setHasMore(rows.length === SEARCH_RESULT_LIMIT);
      })
      .catch((err) => {
        console.error("Error searching vouchers:", err);
        if (offset === 0) setVouchers([]);
        setHasMore(false);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/vouchers/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching categories:", err));

    fetch(`${API_BASE_URL}/api/vouchers/partners`)
      .then((res) => res.json())
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching partners:", err));
  }, []);

  useEffect(() => {
    const nextFilters = readFilters(location.search);
    setFilters(nextFilters);
    requestSearch(0, location.search);
  }, [location.search]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => key !== "sort" && value).length;
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      q: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      minDiscount: "",
      area: "",
      partner: "",
      sort: "",
    });
    navigate("/search");
  };

  const changeSort = (sort) => {
    const params = new URLSearchParams(location.search);
    if (sort) {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }
    navigate(`/search?${params.toString()}`);
  };

  const loadMore = () => {
    requestSearch(vouchers.length, location.search);
  };

  return (
    <div style={{ paddingTop: "150px", minHeight: "100vh", background: "#f6f7f5" }}>
      <div className="container" style={{ paddingBottom: "4rem" }}>
        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "1.5rem",
            marginBottom: "1.4rem",
          }}
        >
          <div>
            <span className="lux-eyebrow"><Sparkles size={14} /> {activeCopy.eyebrow}</span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1, margin: "0.45rem 0", color: "var(--lux-navy)" }}>
              {activeCopy.title}
            </h1>
            <p style={{ maxWidth: "620px", color: "#64748b", fontWeight: 600, margin: 0 }}>
              {activeCopy.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              minHeight: "42px",
              padding: "0 1rem",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontWeight: 900,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {isSidebarOpen ? <X size={18} /> : <Filter size={18} />}
            {isSidebarOpen ? "Đóng bộ lọc" : "Hiện bộ lọc"}
          </button>
        </section>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            marginBottom: "1.4rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "", label: "Tất cả", icon: ArrowDownWideNarrow },
            { value: "new", label: "Deal mới", icon: Sparkles },
            { value: "best-selling", label: "Bán chạy", icon: TrendingUp },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => changeSort(value)}
              style={{
                minHeight: "40px",
                padding: "0 0.9rem",
                borderRadius: "999px",
                border: filters.sort === value ? "1px solid var(--lux-emerald)" : "1px solid #e2e8f0",
                background: filters.sort === value ? "#ecfdf5" : "#ffffff",
                color: filters.sort === value ? "#047857" : "var(--lux-ink)",
                fontWeight: 900,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                cursor: "pointer",
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  width: "300px",
                  flexShrink: 0,
                  background: "#ffffff",
                  borderRadius: "8px",
                  padding: "1rem",
                  maxHeight: "calc(100vh - 170px)",
                  display: "flex",
                  flexDirection: "column",
                  position: "sticky",
                  top: "150px",
                  boxShadow: "0 14px 36px rgba(15,23,42,0.06)",
                  border: "1px solid #e8e2d8",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
                  <h2 style={{ fontSize: "1rem", fontWeight: 950, display: "flex", alignItems: "center", gap: "0.45rem", margin: 0 }}>
                    <Filter size={18} color="var(--lux-emerald)" /> Bộ lọc
                  </h2>
                  <button
                    type="button"
                    onClick={clearFilters}
                    style={{ background: "transparent", border: "none", color: "#047857", fontWeight: 900, fontSize: "0.82rem", cursor: "pointer" }}
                  >
                    Xóa tất cả
                  </button>
                </div>

                <div style={{ display: "grid", gap: "1rem", overflowY: "auto", paddingRight: "0.2rem" }}>
                  <Field label="Từ khóa" icon={Search}>
                    <input
                      type="text"
                      placeholder="Tìm tên voucher..."
                      value={filters.q}
                      onChange={(e) => handleFilterChange("q", e.target.value)}
                      style={fieldStyle}
                    />
                  </Field>

                  <Field label="Danh mục" icon={Tag}>
                    <CustomSelect
                      value={filters.category.includes(",") ? "" : filters.category}
                      onChange={(val) => handleFilterChange("category", val)}
                      placeholder="Tất cả danh mục"
                      options={[
                        { value: "", label: "Tất cả danh mục" },
                        ...categories.map((cat) => ({
                          value: String(cat.category_id),
                          label: translateCategory(cat.category_name),
                        })),
                      ]}
                      buttonStyle={{
                        paddingLeft: "2.3rem",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        height: "42px",
                        fontSize: "0.9rem",
                        fontWeight: 650,
                      }}
                    />
                  </Field>

                  <Field label="Đối tác" icon={Building}>
                    <CustomSelect
                      value={filters.partner}
                      onChange={(val) => handleFilterChange("partner", val)}
                      placeholder="Tất cả đối tác"
                      options={[
                        { value: "", label: "Tất cả đối tác" },
                        ...partners.map((partner) => ({
                          value: String(partner.user_id),
                          label: partner.company_name,
                        })),
                      ]}
                      buttonStyle={{
                        paddingLeft: "2.3rem",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        height: "42px",
                        fontSize: "0.9rem",
                        fontWeight: 650,
                      }}
                    />
                  </Field>

                  <Field label="Khu vực" icon={MapPin}>
                    <input
                      type="text"
                      placeholder="Quận, tỉnh/thành..."
                      value={filters.area}
                      onChange={(e) => handleFilterChange("area", e.target.value)}
                      style={fieldStyle}
                    />
                  </Field>

                  <div>
                    <label style={labelStyle}>Khoảng giá</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      <div style={{ position: "relative" }}>
                        <CircleDollarSign size={16} style={iconStyle} />
                        <input
                          type="number"
                          placeholder="Từ"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                      <div style={{ position: "relative" }}>
                        <CircleDollarSign size={16} style={iconStyle} />
                        <input
                          type="number"
                          placeholder="Đến"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                    </div>
                  </div>

                  <Field label="Mức giảm từ" icon={BadgePercent}>
                    <input
                      type="number"
                      placeholder="Ví dụ: 30"
                      value={filters.minDiscount}
                      onChange={(e) => handleFilterChange("minDiscount", e.target.value)}
                      style={fieldStyle}
                    />
                  </Field>
                </div>

                <button
                  type="button"
                  onClick={applyFilters}
                  className="lux-button lux-button--primary"
                  style={{ marginTop: "1rem", minHeight: "44px", justifyContent: "center" }}
                >
                  Áp dụng {activeFilterCount ? `(${activeFilterCount})` : ""}
                </button>
              </motion.aside>
            )}
          </AnimatePresence>

          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
              <p style={{ color: "#64748b", fontWeight: 800, margin: 0 }}>
                {loading ? "Đang tải danh sách..." : `${vouchers.length} voucher đang hiển thị`}
                {filters.q && <> cho từ khóa "<b>{filters.q}</b>"</>}
              </p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#047857", fontWeight: 900, fontSize: "0.85rem" }}>
                <ChevronDown size={15} /> Sắp xếp: {activeCopy.title}
              </span>
            </div>

            {loading ? (
              <div style={stateBoxStyle}>
                <div className="loader" style={{ marginBottom: "1rem" }} />
                Đang tìm kiếm voucher tốt nhất cho bạn...
              </div>
            ) : vouchers.length > 0 ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.2rem" }}>
                  {vouchers.map((voucher) => (
                    <VoucherCard key={voucher.voucher_id} voucher={voucher} />
                  ))}
                </div>
                {hasMore && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="lux-button lux-button--primary"
                      style={{ minWidth: "160px", justifyContent: "center", opacity: loadingMore ? 0.7 : 1 }}
                    >
                      {loadingMore ? "Đang tải..." : "Xem thêm"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={stateBoxStyle}>
                <Search size={42} color="#94a3b8" />
                <h3 style={{ fontSize: "1.4rem", fontWeight: 950, margin: "1rem 0 0.35rem" }}>
                  Không tìm thấy voucher nào
                </h3>
                <p style={{ color: "#64748b", margin: 0 }}>
                  Thử thay đổi từ khóa hoặc bộ lọc để có kết quả tốt hơn.
                </p>
                <button type="button" onClick={clearFilters} className="lux-button lux-button--ghost" style={{ marginTop: "1.2rem" }}>
                  <X size={16} /> Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 900,
  color: "#64748b",
  marginBottom: "0.45rem",
};

const iconStyle = {
  position: "absolute",
  left: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#94a3b8",
  pointerEvents: "none",
  zIndex: 10,
};

const fieldStyle = {
  width: "100%",
  height: "42px",
  padding: "0 0.75rem 0 2.2rem",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  fontSize: "0.9rem",
  fontWeight: 650,
  outline: "none",
  background: "#ffffff",
};

const stateBoxStyle = {
  textAlign: "center",
  padding: "80px 24px",
  background: "#ffffff",
  borderRadius: "8px",
  border: "1px dashed #d8d2c8",
  color: "#64748b",
  fontWeight: 800,
};

const Field = ({ label, icon: Icon, children, isSelect = false }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div style={{ position: "relative" }}>
      <Icon size={16} style={iconStyle} />
      {children}
      {isSelect && (
        <ChevronDown
          size={15}
          style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
        />
      )}
    </div>
  </div>
);

export default SearchVouchers;

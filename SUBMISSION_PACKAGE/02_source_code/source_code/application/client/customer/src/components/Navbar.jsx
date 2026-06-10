import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  Coffee,
  GraduationCap,
  Heart,
  Hotel,
  List,
  LogOut,
  Menu,
  Plane,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Stethoscope,
  User,
  Utensils,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { API_BASE_URL, translateCategory } from "../config";
import { useCart } from "../context/CartContext";

const categoryIcons = {
  Dining: Utensils,
  Shopping: ShoppingBag,
  Entertainment: Activity,
  Beauty: Heart,
  Travel: Plane,
  Health: Stethoscope,
  Education: GraduationCap,
  Hotels: Hotel,
  Cafe: Coffee,
};

const navLinks = [
  { to: "/search?sort=new", label: "Deal mới" },
  { to: "/search?sort=best-selling", label: "Bán chạy" },
  { to: "/partners", label: "Đối tác" },
  { to: "/support", label: "Hỗ trợ" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const searchRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    fetch(`${API_BASE_URL}/api/vouchers/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      setLoadingSuggestions(true);
      fetch(
        `${API_BASE_URL}/api/vouchers/search?q=${encodeURIComponent(query.trim())}`,
      )
        .then((res) => res.json())
        .then((data) =>
          setSuggestions(Array.isArray(data) ? data.slice(0, 6) : []),
        )
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggestions(false));
    }, 260);

    return () => clearTimeout(timer);
  }, [query]);

  const submitSearch = (event) => {
    event?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedCategories.length)
      params.set("category", selectedCategories.join(","));
    navigate(params.toString() ? `/search?${params.toString()}` : "/search");
    setShowSuggestions(false);
    setIsCategoryOpen(false);
    setIsMobileOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsUserOpen(false);
    navigate("/");
  };

  const pickSuggestion = (voucher) => {
    setQuery("");
    setShowSuggestions(false);
    navigate(`/voucher/${voucher.voucher_id}`);
  };

  return (
    <header className={`lux-nav ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="lux-nav__trust">
        <div className="container lux-nav__trust-inner">
          <span>
            <ShieldCheck size={14} /> Voucher verified by Dealzy
          </span>
          <span>Ho Chi Minh City</span>
          <span>Hotline 1900 6760</span>
        </div>
      </div>

      <div className="container lux-nav__main">
        <Link to="/" className="lux-brand" aria-label="Dealzy home">
          <span className="lux-brand__mark">
            <img src={logo} alt="" />
          </span>
          <span>
            <strong>Dealzy</strong>
            <small>Săn voucher xịn, tận hưởng nhiều hơn</small>
          </span>
        </Link>

        <form ref={searchRef} className="lux-search" onSubmit={submitSearch}>
          <button
            type="button"
            className="lux-search__category"
            onClick={() => setIsCategoryOpen((value) => !value)}
          >
            {selectedCategories.length
              ? `${selectedCategories.length} danh mục`
              : "Tất cả"}
            <ChevronDown size={15} />
          </button>

          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Tìm nhà hàng, spa, du lịch, giải trí..."
          />
          <button
            type="submit"
            className="lux-search__submit"
            aria-label="Tìm kiếm"
          >
            <Search size={19} />
          </button>

          <AnimatePresence>
            {isCategoryOpen && (
              <motion.div
                className="lux-category-popover"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <div className="lux-category-popover__actions">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCategories(
                        categories.map((item) => item.category_id),
                      )
                    }
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                  >
                    Bỏ chọn
                  </button>
                </div>
                <div className="lux-category-popover__list">
                  {categories.map((category) => {
                    const Icon =
                      categoryIcons[category.category_name] || Sparkles;
                    const checked = selectedCategories.includes(
                      category.category_id,
                    );
                    return (
                      <label
                        key={category.category_id}
                        className={checked ? "is-selected" : ""}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setSelectedCategories((current) =>
                              event.target.checked
                                ? [...current, category.category_id]
                                : current.filter(
                                    (id) => id !== category.category_id,
                                  ),
                            );
                          }}
                        />
                        <span
                          className="lux-category-popover__check"
                          aria-hidden="true"
                        >
                          {checked && <Check size={13} />}
                        </span>
                        <Icon size={16} />
                        <span>{translateCategory(category.category_name)}</span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSuggestions && query.trim() && (
              <motion.div
                className="lux-suggestions"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                {loadingSuggestions ? (
                  <div className="lux-suggestions__empty">
                    Đang tìm deal phù hợp...
                  </div>
                ) : suggestions.length ? (
                  <>
                    {suggestions.map((voucher) => (
                      <button
                        key={voucher.voucher_id}
                        type="button"
                        onClick={() => pickSuggestion(voucher)}
                      >
                        <img src={voucher.image_url} alt="" />
                        <span>
                          <strong>{voucher.title}</strong>
                          <small>
                            {voucher.company_name || "Dealzy Partner"}
                          </small>
                        </span>
                        <b>
                          {Number(voucher.sale_price).toLocaleString("vi-VN")}đ
                        </b>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="lux-suggestions__all"
                      onClick={submitSearch}
                    >
                      Xem tất cả kết quả <ChevronRight size={15} />
                    </button>
                  </>
                ) : (
                  <div className="lux-suggestions__empty">
                    Chưa có voucher phù hợp.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <nav className="lux-nav__links">
          {navLinks.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="lux-nav__actions">
          <Link
            id="cart-target"
            to="/cart"
            className="lux-icon-button"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && <span>{totalItems}</span>}
          </Link>

          {user ? (
            <div
              className="lux-user"
              onMouseEnter={() => setIsUserOpen(true)}
              onMouseLeave={() => setIsUserOpen(false)}
            >
              <button type="button" className="lux-user__trigger">
                <User size={17} />
                <span>{user.username}</span>
              </button>
              <AnimatePresence>
                {isUserOpen && (
                  <motion.div
                    className="lux-user__menu"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                  >
                    <Link to="/profile">Tài khoản</Link>
                    <button type="button" onClick={logout}>
                      <LogOut size={15} /> Đăng xuất
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              className="lux-login"
              to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
            >
              Đăng nhập
            </Link>
          )}

          <button
            type="button"
            className="lux-mobile-toggle"
            onClick={() => setIsMobileOpen((value) => !value)}
            aria-label="Menu"
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="lux-mobile-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="container">
              <Link to="/search" onClick={() => setIsMobileOpen(false)}>
                <List size={16} /> Danh mục
              </Link>
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/register-partner"
                onClick={() => setIsMobileOpen(false)}
              >
                <BriefcaseBusiness size={16} /> Hợp tác doanh nghiệp
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

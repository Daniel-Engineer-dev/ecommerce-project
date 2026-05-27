import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  User,
  LogOut,
  ShieldCheck,
  Search,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  List,
  Utensils,
  ShoppingBag,
  Activity,
  Heart,
  Plane,
  GraduationCap,
  Stethoscope,
  Scissors,
  Hotel,
  Coffee,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { API_BASE_URL, translateCategory } from "../config";

import { useCart } from "../context/CartContext";

const SubLink = ({ to, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        color: "white",
        textDecoration: "none",
        fontSize: "0.85rem",
        fontWeight: 700,
        textTransform: "uppercase",
        position: "relative",
        padding: "6px 0",
        display: "inline-block",
      }}
    >
      <span
        style={{ opacity: isHovered ? 1 : 0.9, transition: "opacity 0.2s" }}
      >
        {children}
      </span>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "white",
          transformOrigin: "center",
          borderRadius: "2px",
        }}
      />
    </Link>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { totalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchBarRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const [categories, setCategories] = useState([]);
  const [isSearchCategoryDropdownOpen, setIsSearchCategoryDropdownOpen] =
    useState(false);
  const [isSubCategoryDropdownOpen, setIsSubCategoryDropdownOpen] =
    useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categoryIcons = {
    Dining: <Utensils size={18} />,
    Shopping: <ShoppingBag size={18} />,
    Entertainment: <Activity size={18} />,
    Beauty: <Heart size={18} />,
    Travel: <Plane size={18} />,
    Health: <Stethoscope size={18} />,
    Education: <GraduationCap size={18} />,
    Spa: <Scissors size={18} />,
    Hotels: <Hotel size={18} />,
    Cafe: <Coffee size={18} />,
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

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
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lấy gợi ý tìm kiếm động (Debounce 300ms)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsLoadingSuggestions(true);
      fetch(
        `${API_BASE_URL}/api/vouchers/search?q=${encodeURIComponent(searchQuery)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          // Lấy tối đa 8 kết quả khớp nhất
          setSuggestions(data.slice(0, 8));
          setIsLoadingSuggestions(false);
        })
        .catch((err) => {
          console.error("Error fetching search suggestions:", err);
          setIsLoadingSuggestions(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Tự động đóng dropdown khi click chuột ra ngoài vùng tìm kiếm
  useEffect(() => {
    const handlePointerDownOutside = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setIsSearchCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDownOutside, true);
    return () =>
      document.removeEventListener(
        "pointerdown",
        handlePointerDownOutside,
        true,
      );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedCategories.length > 0) {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append("q", searchQuery.trim());
      }
      if (selectedCategories.length > 0) {
        params.append("category", selectedCategories.join(","));
      }
      navigate(`/search?${params.toString()}`);
      setShowSuggestions(false);
      setIsSearchCategoryDropdownOpen(false);
    }
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "white",
        boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
        transition: "0.3s",
      }}
    >
      {/* 1. TOP BAR */}
      <div className="top-bar">
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                cursor: "pointer",
              }}
            >
              <MapPin size={14} /> <span>Hồ Chí Minh</span>{" "}
              <ChevronDown size={12} />
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Phone size={14} /> <span>Hotline: 1900 6760</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Mail size={14} /> <span>cs@dealzy.vn</span>
            </div>
            {!user && (
              <Link
                to="/auth"
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Đăng ký / Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div
        style={{
          padding: "0.75rem 0",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: "3rem",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{ height: "45px", width: "45px", objectFit: "contain" }}
            />
            <span
              style={{
                fontSize: "1.8rem",
                fontWeight: 900,
                color: "var(--primary)",
                letterSpacing: "-1px",
              }}
            >
              DEALZY
            </span>
          </Link>

          {/* Search Bar */}
          <form
            ref={searchBarRef}
            onSubmit={handleSearch}
            className="search-bar-container"
            style={{ position: "relative" }}
          >
            <div
              onClick={() =>
                setIsSearchCategoryDropdownOpen(!isSearchCategoryDropdownOpen)
              }
              style={{
                padding: "0 1rem",
                borderRight: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {selectedCategories.length > 0 ? (
                <>
                  <span>{selectedCategories.length} danh mục</span>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: isSearchCategoryDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </>
              ) : (
                <>
                  Tất cả danh mục{" "}
                  <ChevronDown
                    size={14}
                    style={{
                      transform: isSearchCategoryDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </>
              )}
            </div>

            {/* Category Dropdown */}
            <AnimatePresence>
              {isSearchCategoryDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "300px",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                    border: "1px solid #f1f5f9",
                    marginTop: "8px",
                    overflow: "hidden",
                    zIndex: 999,
                    maxHeight: "350px",
                    overflowY: "auto",
                  }}
                >
                  {/* Header với nút "Chọn tất cả" và "Bỏ chọn" */}
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      gap: "0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCategories(
                          categories.map((c) => c.category_id),
                        )
                      }
                      style={{
                        flex: 1,
                        padding: "0.4rem",
                        background: "var(--primary)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Chọn tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([])}
                      style={{
                        flex: 1,
                        padding: "0.4rem",
                        background: "#f1f5f9",
                        color: "#1e293b",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Bỏ chọn
                    </button>
                  </div>

                  {/* Category List */}
                  {categories.length > 0 ? (
                    <div>
                      {categories.map((category) => (
                        <label
                          key={category.category_id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.75rem 1rem",
                            cursor: "pointer",
                            borderBottom: "1px solid #f8fafc",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(
                              category.category_id,
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([
                                  ...selectedCategories,
                                  category.category_id,
                                ]);
                              } else {
                                setSelectedCategories(
                                  selectedCategories.filter(
                                    (id) => id !== category.category_id,
                                  ),
                                );
                              }
                            }}
                            style={{
                              cursor: "pointer",
                              width: "18px",
                              height: "18px",
                              accentColor: "var(--primary)",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "0.9rem",
                              color: "#1e293b",
                              fontWeight: 500,
                            }}
                          >
                            {category.category_name}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "2rem 1rem",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "0.9rem",
                      }}
                    >
                      Đang tải danh mục...
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm / khuyến mãi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                padding: "0.75rem 1rem",
                outline: "none",
                fontSize: "0.95rem",
              }}
            />
            <button
              type="submit"
              style={{
                background: "var(--primary)",
                border: "none",
                padding: "0.75rem 1.25rem",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search size={20} strokeWidth={2.5} />
            </button>

            {/* Dropdown gợi ý tìm kiếm như Google */}
            <AnimatePresence>
              {showSuggestions && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    borderRadius: "16px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                    border: "1px solid #f1f5f9",
                    marginTop: "8px",
                    overflow: "hidden",
                    zIndex: 999,
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  {isLoadingSuggestions ? (
                    <div
                      style={{
                        padding: "1.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.75rem",
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      <motion.div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid var(--border-color)",
                          borderTopColor: "var(--primary)",
                          borderRadius: "50%",
                        }}
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          ease: "linear",
                          duration: 1,
                        }}
                      />
                      <span>Đang tìm kiếm...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div>
                      <div
                        style={{
                          padding: "0.75rem 1.25rem",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          borderBottom: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>Sản phẩm gợi ý</span>
                        <Sparkles
                          size={12}
                          style={{ color: "var(--primary)" }}
                        />
                      </div>
                      {suggestions.map((voucher) => (
                        <div
                          key={voucher.voucher_id}
                          onClick={() => {
                            navigate(`/voucher/${voucher.voucher_id}`);
                            setShowSuggestions(false);
                            setIsSearchCategoryDropdownOpen(false);
                            setSearchQuery("");
                          }}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "48px 1fr auto",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "0.75rem 1.25rem",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            borderBottom: "1px solid #f8fafc",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <img
                            src={voucher.image_url}
                            alt={voucher.title}
                            style={{
                              width: "48px",
                              height: "48px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                color: "var(--text-main)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {voucher.title}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginTop: "2px",
                              }}
                            >
                              <span
                                style={{
                                  background: "#f1f5f9",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontWeight: 600,
                                  color: "var(--text-main)",
                                }}
                              >
                                {voucher.company_name}
                              </span>
                              <span>•</span>
                              <span>{voucher.category_name}</span>
                            </div>
                          </div>
                          <div
                            style={{
                              textAlign: "right",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: "2px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                              }}
                            >
                              {voucher.discount_percent > 0 && (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "#ef4444",
                                    backgroundColor: "#fef2f2",
                                    padding: "1px 5px",
                                    borderRadius: "4px",
                                    fontWeight: 700,
                                  }}
                                >
                                  -{voucher.discount_percent}%
                                </span>
                              )}
                              <span
                                style={{
                                  fontWeight: 800,
                                  fontSize: "0.9rem",
                                  color: "#ef4444",
                                }}
                              >
                                {Number(voucher.sale_price).toLocaleString(
                                  "vi-VN",
                                )}
                                đ
                              </span>
                            </div>
                            {voucher.discount_percent > 0 && (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  textDecoration: "line-through",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {Number(voucher.original_price).toLocaleString(
                                  "vi-VN",
                                )}
                                đ
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Nút xem tất cả kết quả */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          const params = new URLSearchParams();
                          if (searchQuery.trim()) {
                            params.append("q", searchQuery.trim());
                          }
                          if (selectedCategories.length > 0) {
                            params.append(
                              "category",
                              selectedCategories.join(","),
                            );
                          }
                          navigate(`/search?${params.toString()}`);
                          setShowSuggestions(false);
                          setIsSearchCategoryDropdownOpen(false);
                        }}
                        style={{
                          padding: "0.75rem 1.25rem",
                          textAlign: "center",
                          background: "#f8fafc",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "var(--primary)",
                          cursor: "pointer",
                          borderTop: "1px solid #f1f5f9",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.4rem",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#f8fafc";
                        }}
                      >
                        Xem tất cả kết quả tìm kiếm cho "{searchQuery}"{" "}
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "2rem 1.25rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Search
                        size={24}
                        style={{
                          margin: "0 auto 0.5rem",
                          opacity: 0.5,
                          display: "block",
                        }}
                      />
                      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        Không tìm thấy voucher phù hợp
                      </div>
                      <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                        Hãy thử nhập từ khóa khác xem sao nhé!
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Cart & User */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link
              id="cart-target"
              to="/cart"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                textDecoration: "none",
                color: "var(--text-main)",
                fontWeight: 700,
              }}
            >
              <div style={{ position: "relative" }}>
                <ShoppingCart size={28} />
                {totalItems > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      background: "#ef4444",
                      color: "white",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      border: "2px solid white",
                    }}
                  >
                    {totalItems}
                  </span>
                )}
              </div>
              GIỎ HÀNG
            </Link>

            {user && (
              <div
                style={{ position: "relative", cursor: "pointer" }}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "#f1f5f9",
                    padding: "0.5rem 1rem",
                    borderRadius: "12px",
                    fontWeight: 600,
                  }}
                >
                  <User size={20} />
                  <span>{user.username}</span>
                </div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        width: "200px",
                        background: "white",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        padding: "0.5rem",
                        border: "1px solid #f1f5f9",
                        marginTop: "0.5rem",
                      }}
                    >
                      <Link
                        to="/profile"
                        style={{
                          display: "block",
                          padding: "0.75rem 1rem",
                          textDecoration: "none",
                          color: "var(--text-main)",
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "#f8fafc")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "transparent")
                        }
                      >
                        Tài khoản
                      </Link>
                      <button
                        onClick={handleLogout}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "0.75rem 1rem",
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontWeight: 600,
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "#fef2f2")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "transparent")
                        }
                      >
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SUB HEADER / NAVIGATION */}
      <div
        style={{
          background: "var(--primary)",
          color: "white",
          height: "42px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            height: "100%",
          }}
        >
          {/* CATEGORIES BUTTON WITH INTERACTIVE DROPDOWN */}
          {!isHomePage && (
            <div
              style={{
                position: "relative",
                height: "100%",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={() => setIsSubCategoryDropdownOpen(true)}
              onMouseLeave={() => setIsSubCategoryDropdownOpen(false)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  background: isSubCategoryDropdownOpen
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.15)",
                  height: "100%",
                  padding: "0 1.5rem",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  transition: "0.2s",
                }}
              >
                <List size={20} /> DANH MỤC{" "}
                <ChevronDown
                  size={16}
                  style={{
                    transform: isSubCategoryDropdownOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "0.3s",
                  }}
                />
              </div>

              <AnimatePresence>
                {isSubCategoryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "300px",
                      background: "rgba(255, 255, 255, 0.98)",
                      backdropFilter: "blur(20px)",
                      borderRadius: "0 0 16px 16px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      borderTop: "none",
                      padding: "0.75rem 0",
                      zIndex: 1001,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {categories.map((cat) => (
                        <Link
                          key={cat.category_id}
                          to={`/search?category=${cat.category_id}`}
                          onClick={() => setIsSubCategoryDropdownOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.6rem 1.5rem",
                            color: "var(--text-main)",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            transition: "0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f1f5f9";
                            e.currentTarget.style.color = "var(--primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--text-main)";
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <span
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              {categoryIcons[cat.category_name] || (
                                <Sparkles size={18} />
                              )}
                            </span>
                            {translateCategory(cat.category_name)}
                          </div>
                          <ChevronRight size={14} style={{ opacity: 0.5 }} />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* OTHER SUB LINKS */}
          <div style={{ display: "flex", gap: "2rem" }}>
            <SubLink to="/search?sort=new">Deal Mới</SubLink>
            <SubLink to="/search?sort=best-selling">Deal Bán Chạy</SubLink>
            <SubLink to="/partners">Đối Tác</SubLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

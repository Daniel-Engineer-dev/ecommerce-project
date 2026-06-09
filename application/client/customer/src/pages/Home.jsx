import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Coffee,
  Crown,
  GraduationCap,
  Heart,
  Hotel,
  Plane,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  TicketPercent,
  Utensils,
  Zap,
} from "lucide-react";
import VoucherCard from "../components/VoucherCard";
import { API_BASE_URL, translateCategory } from "../config";
import { usePublicContent } from "../hooks/usePublicContent";
import HiddenContentNotice from "../components/HiddenContentNotice";

const VOUCHERS_PER_SECTION = 8;
const SECTION_LOAD_MORE_STEP = 4;

const categoryIcons = {
  Dining: Utensils,
  Shopping: ShoppingBag,
  Entertainment: Activity,
  Beauty: Heart,
  Travel: Plane,
  Health: Stethoscope,
  Education: GraduationCap,
  Spa: Scissors,
  Hotels: Hotel,
  Cafe: Coffee,
};

const heroTiles = [
  {
    title: "Fine dining",
    copy: "Set menu, buffet và nhà hàng được chọn lọc.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=82&w=900",
  },
  {
    title: "Wellness",
    copy: "Spa, làm đẹp và chăm sóc sức khỏe cuối tuần.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=82&w=900",
  },
];

const isSameDay = (value, date = new Date()) => {
  if (!value) return false;
  const target = new Date(value);
  return (
    target.getFullYear() === date.getFullYear() &&
    target.getMonth() === date.getMonth() &&
    target.getDate() === date.getDate()
  );
};

const Home = () => {
  const { data: homeContent, hidden: homeBannerHidden } = usePublicContent("home-banner");
  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hot");
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [visibleByCategory, setVisibleByCategory] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/vouchers`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/vouchers/categories`).then((res) => res.json()),
    ])
      .then(([voucherData, categoryData]) => {
        setVouchers(Array.isArray(voucherData) ? voucherData : []);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      })
      .catch((error) => console.error("Error loading home data:", error))
      .finally(() => setLoading(false));
  }, []);

  const tabVouchers = useMemo(() => {
    if (activeTab === "today") {
      return vouchers
        .filter((voucher) => isSameDay(voucher.start_date))
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    }

    if (activeTab === "for-you") {
      return [...vouchers].sort((a, b) => Number(b.discount_percent || 0) - Number(a.discount_percent || 0));
    }

    return vouchers;
  }, [activeTab, vouchers]);

  const groupedSections = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        items: tabVouchers.filter((voucher) => Number(voucher.category_id) === Number(category.category_id)),
      }))
      .filter((section) => section.items.length > 0);
  }, [categories, tabVouchers]);

  const premiumDeal = useMemo(() => {
    return [...vouchers].sort((a, b) => Number(b.discount_percent || 0) - Number(a.discount_percent || 0))[0];
  }, [vouchers]);

  useEffect(() => {
    setActiveCategoryId(groupedSections[0]?.category.category_id || null);
    const nextVisible = {};
    groupedSections.forEach(({ category }) => {
      nextVisible[category.category_id] = VOUCHERS_PER_SECTION;
    });
    setVisibleByCategory(nextVisible);
  }, [groupedSections, activeTab]);

  useEffect(() => {
    if (!groupedSections.length) return undefined;

    let frameId = null;
    const sectionIds = groupedSections.map(({ category }) => category.category_id);

    const updateActiveSection = () => {
      frameId = null;
      const markerY = Math.min(window.innerHeight * 0.42, 360);
      let nextActiveId = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      sectionIds.forEach((categoryId) => {
        const node = sectionRefs.current[categoryId];
        if (!node) return;

        const rect = node.getBoundingClientRect();
        const isAtMarker = rect.top <= markerY && rect.bottom >= markerY;
        const distance = isAtMarker ? 0 : Math.abs(rect.top - markerY);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nextActiveId = categoryId;
        }
      });

      if (nextActiveId) {
        setActiveCategoryId(Number(nextActiveId));
      }
    };

    const scheduleUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateActiveSection);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [groupedSections]);

  const jumpToCategory = (categoryId) => {
    setActiveCategoryId(Number(categoryId));
    sectionRefs.current[categoryId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const dynamicHero = homeContent.hero || {};
  const dynamicProofs = homeContent.proofs || [];
  const dynamicFeatures = homeContent.features || [];
  const dynamicTiles = homeContent.tiles || heroTiles;
  const featureIconMap = { Sparkles, Zap, ShieldCheck };

  return (
    <main className="lux-home">
      {homeBannerHidden ? (
        <HiddenContentNotice />
      ) : (
      <section className="lux-hero">
        <div className="container lux-hero__grid">
          <div className="lux-hero__content">
            <span className="lux-eyebrow"><Crown size={15} /> {dynamicHero.badge || "Curated offers"}</span>
            <h1 className="lux-hero-title">
              <span>{dynamicHero.titleLine1 || "Đặt trải nghiệm"}</span>
              <span>{dynamicHero.titleLine2 || "thông minh hơn"}</span>
            </h1>
            <p>
              {dynamicHero.description || "Dealzy chọn lọc voucher nhà hàng, spa, du lịch và giải trí với thông tin rõ ràng, thanh toán gọn và mã điện tử sẵn sàng sử dụng."}
            </p>
            <div className="lux-hero__actions">
              <Link to={dynamicHero.primaryCtaUrl || "/search"} className="lux-button lux-button--primary">
                {dynamicHero.primaryCtaText || "Khám phá deal"} <ArrowRight size={18} />
              </Link>
              <Link to={dynamicHero.secondaryCtaUrl || "/partners"} className="lux-button lux-button--ghost">
                {dynamicHero.secondaryCtaText || "Xem đối tác"}
              </Link>
            </div>
            <div className="lux-hero__proof">
              {(dynamicProofs.length ? dynamicProofs : ["Voucher đã kiểm duyệt", "Thanh toán demo an toàn", "Mã điện tử tức thì"]).map((proof, index) => {
                const icons = [BadgeCheck, ShieldCheck, TicketPercent];
                const Icon = icons[index] || BadgeCheck;
                return <span key={proof}><Icon size={16} /> {proof}</span>;
              })}
            </div>
          </div>

          <div className="lux-hero__media">
            <img
              src={dynamicHero.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=82&w=1300"}
              alt="Premium restaurant experience"
            />
            <div className="lux-hero__deal">
              <span>Best saving</span>
              <strong>{premiumDeal ? `-${premiumDeal.discount_percent || 0}%` : "-50%"}</strong>
              <small>{premiumDeal?.company_name || "Selected partners"}</small>
            </div>
          </div>
        </div>
      </section>
      )}

      <section className="container lux-feature-strip">
        {(dynamicFeatures.length ? dynamicFeatures : [
          { icon: "Sparkles", title: "Lựa chọn có gu", copy: "Chỉ hiển thị voucher đã duyệt và còn hiệu lực." },
          { icon: "Zap", title: "Nhận mã nhanh", copy: "E-voucher được phát hành sau thanh toán thành công." },
          { icon: "ShieldCheck", title: "Kiểm soát rõ", copy: "Trạng thái đơn, mã và sử dụng được ghi nhận." },
        ]).map(({ icon, title, copy }) => {
          const Icon = featureIconMap[icon] || Sparkles;
          return (
            <div key={title} className="lux-feature">
              <Icon size={20} />
              <span>
                <strong>{title}</strong>
                <small>{copy}</small>
              </span>
            </div>
          );
        })}
      </section>

      <section className="container lux-editorial-grid">
        {dynamicTiles.map((tile) => (
          <Link key={tile.title} to="/search" className="lux-editorial-card">
            <img src={tile.image} alt={tile.title} />
            <span>
              <strong>{tile.title}</strong>
              <small>{tile.copy}</small>
            </span>
          </Link>
        ))}
      </section>

      <section className="container lux-market">
        <div className="lux-market__header">
          <div>
            <span className="lux-eyebrow">Marketplace</span>
            <h2>Ưu đãi đáng chú ý</h2>
          </div>
          <div className="lux-tabs" role="tablist" aria-label="Voucher tabs">
            {[
              { id: "hot", label: "Nổi bật" },
              { id: "today", label: "Hôm nay" },
              { id: "for-you", label: "Giảm sâu" },
            ].map((tab) => (
              <button key={tab.id} type="button" className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="lux-loading">Đang chọn những voucher tốt nhất...</div>
        ) : groupedSections.length ? (
          <div className="lux-home-layout">
            <aside className="lux-category-rail" aria-label="Danh mục">
              {groupedSections.map(({ category }) => {
                const Icon = categoryIcons[category.category_name] || Sparkles;
                const isActive = Number(activeCategoryId) === Number(category.category_id);
                return (
                  <button
                    key={category.category_id}
                    type="button"
                    className={isActive ? "active" : ""}
                    title={translateCategory(category.category_name)}
                    onClick={() => jumpToCategory(category.category_id)}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </aside>

            <div className="lux-sections">
              {groupedSections.map(({ category, items }) => (
                <section
                  key={category.category_id}
                  data-category-id={category.category_id}
                  ref={(node) => {
                    if (node) {
                      sectionRefs.current[category.category_id] = node;
                    } else {
                      delete sectionRefs.current[category.category_id];
                    }
                  }}
                  className="lux-section"
                >
                  <div className="lux-section__head">
                    <div>
                      <span>{items.length} voucher</span>
                      <h3>{translateCategory(category.category_name)}</h3>
                    </div>
                    <Link to={`/search?category=${category.category_id}`}>Xem tất cả <ChevronRight size={16} /></Link>
                  </div>
                  <div className="lux-voucher-grid">
                    {items.slice(0, visibleByCategory[category.category_id] || VOUCHERS_PER_SECTION).map((voucher) => (
                      <VoucherCard key={voucher.voucher_id} voucher={voucher} />
                    ))}
                  </div>
                  {(visibleByCategory[category.category_id] || VOUCHERS_PER_SECTION) < items.length && (
                    <div className="lux-section__more">
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleByCategory((current) => ({
                            ...current,
                            [category.category_id]: (current[category.category_id] || VOUCHERS_PER_SECTION) + SECTION_LOAD_MORE_STEP,
                          }))
                        }
                      >
                        Tải thêm voucher
                      </button>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        ) : (
          <div className="lux-empty">
            <Sparkles size={34} />
            <h3>Chưa có deal phù hợp</h3>
            <p>Thử đổi bộ lọc hoặc quay lại sau khi đối tác phát hành voucher mới.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;

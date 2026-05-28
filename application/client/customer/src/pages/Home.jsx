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
    copy: "Set menu, buffet va nha hang duoc chon loc.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=82&w=900",
  },
  {
    title: "Wellness",
    copy: "Spa, lam dep va cham soc suc khoe cuoi tuan.",
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

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const sectionId = visible[0]?.target.getAttribute("data-category-id");
        if (sectionId) setActiveCategoryId(Number(sectionId));
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0.2, 0.45, 0.7] },
    );

    groupedSections.forEach(({ category }) => {
      const node = sectionRefs.current[category.category_id];
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [groupedSections]);

  const jumpToCategory = (categoryId) => {
    sectionRefs.current[categoryId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="lux-home">
      <section className="lux-hero">
        <div className="container lux-hero__grid">
          <div className="lux-hero__content">
            <span className="lux-eyebrow"><Crown size={15} /> Curated offers</span>
            <h1>Voucher dep, trai nghiem that, gia tri ro rang.</h1>
            <p>
              Dealzy gom nhung uu dai dang tin cay tu nha hang, spa, du lich va giai tri trong mot trai nghiem mua voucher gon gang nhu mot san pham cao cap.
            </p>
            <div className="lux-hero__actions">
              <Link to="/search" className="lux-button lux-button--primary">
                Kham pha deal <ArrowRight size={18} />
              </Link>
              <Link to="/partners" className="lux-button lux-button--ghost">
                Xem doi tac
              </Link>
            </div>
            <div className="lux-hero__proof">
              <span><BadgeCheck size={16} /> Voucher da kiem duyet</span>
              <span><ShieldCheck size={16} /> Thanh toan demo an toan</span>
              <span><TicketPercent size={16} /> Ma dien tu tuc thi</span>
            </div>
          </div>

          <div className="lux-hero__media">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=82&w=1300"
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

      <section className="container lux-feature-strip">
        {[
          { icon: Sparkles, title: "Lua chon co gu", copy: "Chi hien thi voucher da duyet va con hieu luc." },
          { icon: Zap, title: "Nhan ma nhanh", copy: "E-voucher duoc phat hanh sau thanh toan thanh cong." },
          { icon: ShieldCheck, title: "Kiem soat ro", copy: "Trang thai don, ma va su dung duoc ghi nhan." },
        ].map(({ icon: Icon, title, copy }) => (
          <div key={title} className="lux-feature">
            <Icon size={20} />
            <span>
              <strong>{title}</strong>
              <small>{copy}</small>
            </span>
          </div>
        ))}
      </section>

      <section className="container lux-editorial-grid">
        {heroTiles.map((tile) => (
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
            <h2>Uu dai dang chu y</h2>
          </div>
          <div className="lux-tabs" role="tablist" aria-label="Voucher tabs">
            {[
              { id: "hot", label: "Noi bat" },
              { id: "today", label: "Hom nay" },
              { id: "for-you", label: "Giam sau" },
            ].map((tab) => (
              <button key={tab.id} type="button" className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="lux-loading">Dang chon nhung voucher tot nhat...</div>
        ) : groupedSections.length ? (
          <div className="lux-home-layout">
            <aside className="lux-category-rail" aria-label="Danh muc">
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
                    if (node) sectionRefs.current[category.category_id] = node;
                  }}
                  className="lux-section"
                >
                  <div className="lux-section__head">
                    <div>
                      <span>{items.length} voucher</span>
                      <h3>{translateCategory(category.category_name)}</h3>
                    </div>
                    <Link to={`/search?category=${category.category_id}`}>Xem tat ca <ChevronRight size={16} /></Link>
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
                        Tai them voucher
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
            <h3>Chua co deal phu hop</h3>
            <p>Thu doi bo loc hoac quay lai sau khi doi tac phat hanh voucher moi.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;

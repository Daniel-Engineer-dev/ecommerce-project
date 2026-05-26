import React from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  CircleHelp,
  CreditCard,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingCart,
  TicketCheck,
  UserRound,
} from 'lucide-react';

const roadmap = [
  {
    phase: 'Bước 01',
    icon: UserRound,
    title: 'Đăng nhập hoặc tạo tài khoản',
    text: 'Tạo tài khoản khách hàng để Dealzy lưu giỏ hàng, lịch sử đơn hàng và mã E-Voucher sau khi thanh toán.',
    checklist: ['Điền đúng email hoặc số điện thoại', 'Cập nhật thông tin cá nhân', 'Đăng nhập trước khi thanh toán'],
  },
  {
    phase: 'Bước 02',
    icon: Search,
    title: 'Tìm ưu đãi phù hợp',
    text: 'Dùng thanh tìm kiếm, danh mục, khu vực, giá và đối tác để thu hẹp danh sách voucher.',
    checklist: ['Nhập từ khóa sản phẩm hoặc thương hiệu', 'Chọn danh mục quan tâm', 'Dùng bộ lọc khi có quá nhiều kết quả'],
  },
  {
    phase: 'Bước 03',
    icon: TicketCheck,
    title: 'Kiểm tra chi tiết voucher',
    text: 'Mở trang voucher để xem giá bán, hạn sử dụng, điều kiện áp dụng, địa điểm sử dụng và đánh giá.',
    checklist: ['Đọc kỹ điều kiện sử dụng', 'Kiểm tra địa điểm áp dụng', 'Xem thời hạn và chính sách hoàn hủy'],
  },
  {
    phase: 'Bước 04',
    icon: ShoppingCart,
    title: 'Thêm vào giỏ hàng',
    text: 'Chọn số lượng cần mua, thêm vào giỏ hàng và rà soát lại danh sách voucher trước khi thanh toán.',
    checklist: ['Kiểm tra số lượng', 'Xóa voucher không cần mua', 'Đảm bảo voucher còn hiệu lực'],
  },
  {
    phase: 'Bước 05',
    icon: CreditCard,
    title: 'Thanh toán đơn hàng',
    text: 'Chọn phương thức thanh toán phù hợp như VNPay, MoMo, VietQR hoặc PayPal, sau đó hoàn tất giao dịch.',
    checklist: ['Không đóng trình duyệt khi đang thanh toán', 'Chờ quay lại trang kết quả', 'Kiểm tra trạng thái đơn hàng'],
  },
  {
    phase: 'Bước 06',
    icon: BadgeCheck,
    title: 'Nhận và sử dụng E-Voucher',
    text: 'Sau khi thanh toán thành công, mã E-Voucher được kích hoạt trong trang kết quả và tài khoản cá nhân.',
    checklist: ['Lưu mã QR hoặc mã voucher', 'Xuất trình mã tại điểm sử dụng', 'Đánh giá sau khi trải nghiệm'],
  },
];

const quickTips = [
  {
    icon: ShieldCheck,
    title: 'Trước khi mua',
    text: 'Luôn đọc điều kiện áp dụng, thời gian phục vụ và địa chỉ chi nhánh để tránh mua nhầm voucher.',
  },
  {
    icon: MapPin,
    title: 'Khi sử dụng',
    text: 'Liên hệ điểm sử dụng để đặt chỗ nếu voucher yêu cầu đặt trước hoặc áp dụng theo khung giờ.',
  },
  {
    icon: CircleHelp,
    title: 'Khi gặp lỗi',
    text: 'Nếu thanh toán thành công nhưng chưa thấy mã, vào hồ sơ cá nhân hoặc liên hệ hỗ trợ để đối soát.',
  },
];

const UserGuide = () => {
  return (
    <main className="static-page">
      <section className="static-hero">
        <div className="static-hero__badge">
          <TicketCheck size={16} />
          Roadmap sử dụng
        </div>
        <h1>Lộ trình mua và sử dụng voucher trên Dealzy</h1>
        <p>
          Đi theo từng bước dưới đây để tìm đúng ưu đãi, thanh toán an toàn và sử dụng E-Voucher thuận lợi tại điểm áp dụng.
        </p>
      </section>

      <section className="container static-section">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          <aside
            style={{
              position: 'sticky',
              top: '190px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.25rem',
              boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>
              Tổng quan lộ trình
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {roadmap.map((item) => (
                <a
                  key={item.phase}
                  href={`#${item.phase.toLowerCase().replace(' ', '-')}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    color: '#334155',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    background: '#f8fafc',
                  }}
                >
                  <item.icon size={16} color="#2563eb" />
                  {item.phase}
                </a>
              ))}
            </div>
          </aside>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '27px',
                top: '24px',
                bottom: '24px',
                width: '2px',
                background: '#dbeafe',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {roadmap.map(({ phase, icon: Icon, title, text, checklist }) => (
                <article
                  id={phase.toLowerCase().replace(' ', '-')}
                  key={phase}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr',
                    gap: '1.25rem',
                    scrollMarginTop: '190px',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 24px rgba(37,99,235,0.25)',
                      zIndex: 1,
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  <div
                    style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
                    }}
                  >
                    <span style={{ color: '#2563eb', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      {phase}
                    </span>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.35rem 0 0.75rem', color: '#0f172a' }}>
                      {title}
                    </h2>
                    <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>{text}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
                      {checklist.map((entry) => (
                        <div
                          key={entry}
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'flex-start',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '0.75rem',
                            color: '#334155',
                            fontSize: '0.88rem',
                            lineHeight: 1.45,
                          }}
                        >
                          <BadgeCheck size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                          {entry}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container static-section">
        <div className="static-card-grid">
          {quickTips.map(({ icon: Icon, title, text }) => (
            <article className="static-card" key={title}>
              <Icon size={24} />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container static-section static-panel">
        <div>
          <h2>Cần hỗ trợ trong quá trình mua voucher?</h2>
          <p>Trung tâm hỗ trợ có thể giúp bạn kiểm tra thanh toán, trạng thái đơn hàng và mã E-Voucher.</p>
        </div>
        <Link className="static-action" to="/support">Đến trung tâm hỗ trợ</Link>
      </section>
    </main>
  );
};

export default UserGuide;

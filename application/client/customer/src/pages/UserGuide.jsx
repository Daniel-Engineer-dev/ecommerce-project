import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Search, ShoppingCart, TicketCheck } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: '1. Tìm và lọc voucher',
    text: 'Nhập từ khóa, chọn danh mục hoặc dùng các bộ lọc trên trang tìm kiếm để tìm ưu đãi phù hợp.',
  },
  {
    icon: TicketCheck,
    title: '2. Xem điều kiện áp dụng',
    text: 'Mở trang chi tiết voucher để xem giá, mức giảm, thời hạn, địa điểm và ghi chú sử dụng.',
  },
  {
    icon: ShoppingCart,
    title: '3. Thêm vào giỏ hàng',
    text: 'Bấm thêm vào giỏ hàng, kiểm tra số lượng và thông tin voucher trước khi thanh toán.',
  },
  {
    icon: CreditCard,
    title: '4. Thanh toán và nhận mã',
    text: 'Hoàn tất thanh toán, sau đó theo dõi trạng thái và mã voucher trong tài khoản hoặc trang kết quả.',
  },
];

const UserGuide = () => {
  return (
    <main className="static-page">
      <section className="static-hero">
        <div className="static-hero__badge">Hướng dẫn</div>
        <h1>Hướng dẫn sử dụng Dealzy</h1>
        <p>Quy trình mua và sử dụng voucher trên website Dealzy.</p>
      </section>

      <section className="container static-section">
        <div className="static-card-grid">
          {steps.map(({ icon: Icon, title, text }) => (
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
          <h2>Cần thêm hỗ trợ?</h2>
          <p>Nếu gặp lỗi trong quá trình mua voucher, hãy liên hệ trung tâm hỗ trợ.</p>
        </div>
        <Link className="static-action" to="/support">Đến trung tâm hỗ trợ</Link>
      </section>
    </main>
  );
};

export default UserGuide;

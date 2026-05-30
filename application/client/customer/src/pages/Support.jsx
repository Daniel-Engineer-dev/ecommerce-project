import React from 'react';
import { Link } from 'react-router-dom';
import { CircleHelp, Mail, MessageCircle, Phone, Search, ShieldCheck } from 'lucide-react';

const supportCards = [
  {
    icon: Search,
    title: 'Tìm voucher phù hợp',
    text: 'Dùng thanh tìm kiếm, bộ lọc danh mục và trang chi tiết để xem điều kiện áp dụng trước khi mua.',
  },
  {
    icon: ShieldCheck,
    title: 'Hỗ trợ đơn hàng',
    text: 'Kiểm tra trạng thái thanh toán, mã voucher và lịch sử giao dịch trong tài khoản của bạn.',
  },
  {
    icon: MessageCircle,
    title: 'Cần tư vấn nhanh',
    text: 'Liên hệ kênh hỗ trợ khi voucher không hiển thị, thanh toán bị lỗi hoặc cần đối soát thông tin.',
  },
];

const Support = () => {
  return (
    <main className="static-page">
      <section className="static-hero">
        <div className="static-hero__badge">
          <CircleHelp size={16} />
          Hỗ trợ khách hàng
        </div>
        <h1>Trung tâm hỗ trợ Dealzy</h1>
        <p>
          Tìm câu trả lời nhanh cho các vấn đề về tài khoản, voucher, thanh toán và quy trình sử dụng website.
        </p>
      </section>

      <section className="container static-section">
        <div className="static-card-grid">
          {supportCards.map(({ icon: Icon, title, text }) => (
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
          <h2>Kênh liên hệ</h2>
          <p>Nếu cần hỗ trợ trực tiếp, hãy liên hệ Dealzy qua các kênh bên dưới.</p>
        </div>
        <div className="static-contact-list">
          <a href="tel:19006789">
            <Phone size={18} />
            1900 6789
          </a>
          <a href="mailto:support@dealzy.vn">
            <Mail size={18} />
            support@dealzy.vn
          </a>
          <Link to="/guide">
            <CircleHelp size={18} />
            Xem hướng dẫn sử dụng
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Support;

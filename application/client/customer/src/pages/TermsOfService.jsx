import React from 'react';

const TermsOfService = () => {
  return (
    <main className="static-page">
      <section className="static-hero">
        <div className="static-hero__badge">Pháp lý</div>
        <h1>Điều khoản dịch vụ</h1>
        <p>Các điều khoản áp dụng khi người dùng truy cập và sử dụng website Dealzy.</p>
      </section>

      <section className="container static-section static-content">
        <h2>Chấp nhận điều khoản</h2>
        <p>
          Khi sử dụng Dealzy, bạn đồng ý tuân thủ các điều khoản về tài khoản, mua voucher, thanh toán và sử dụng ưu
          đãi theo quy định của website.
        </p>

        <h2>Trách nhiệm người dùng</h2>
        <p>
          Người dùng cần cung cấp thông tin chính xác, bảo mật tài khoản và tuân thủ điều kiện sử dụng của từng
          voucher trước khi giao dịch.
        </p>

        <h2>Thay đổi dịch vụ</h2>
        <p>
          Dealzy có thể cập nhật nội dung, tính năng, giá voucher hoặc điều kiện áp dụng để phù hợp với chính sách
          của đối tác và quy định vận hành.
        </p>
      </section>
    </main>
  );
};

export default TermsOfService;

import React from 'react';

const PrivacyPolicy = () => {
  return (
    <main className="static-page">
      <section className="static-hero">
        <div className="static-hero__badge">Bảo mật</div>
        <h1>Chính sách bảo mật</h1>
        <p>Cách Dealzy thu thập, sử dụng và bảo vệ thông tin của người dùng.</p>
      </section>

      <section className="container static-section static-content">
        <h2>Thông tin được thu thập</h2>
        <p>
          Dealzy có thể thu thập thông tin tài khoản, email, số điện thoại, lịch sử giao dịch và dữ liệu cần thiết để
          xử lý đơn hàng hoặc hỗ trợ khách hàng.
        </p>

        <h2>Mục đích sử dụng</h2>
        <p>
          Thông tin được sử dụng để xác thực tài khoản, xử lý thanh toán, gửi thông báo voucher và cải thiện trải
          nghiệm dịch vụ.
        </p>

        <h2>Bảo vệ dữ liệu</h2>
        <p>
          Dealzy áp dụng các biện pháp bảo mật phù hợp để hạn chế truy cập trái phép và không bán thông tin cá nhân
          của người dùng cho bên thứ ba.
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;

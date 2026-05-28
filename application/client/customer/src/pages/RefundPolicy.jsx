import React from 'react';

const RefundPolicy = () => {
  return (
    <main className="static-page">
      <section className="static-hero">
        <div className="static-hero__badge">Chính sách</div>
        <h1>Chính sách hoàn tiền</h1>
        <p>Thông tin về các trường hợp Dealzy tiếp nhận yêu cầu hoàn tiền voucher.</p>
      </section>

      <section className="container static-section static-content">
        <h2>Điều kiện xem xét hoàn tiền</h2>
        <p>
          Dealzy xem xét hoàn tiền khi voucher chưa được sử dụng, còn trong thời hạn xử lý và giao dịch đáp ứng
          điều kiện của đối tác phát hành.
        </p>

        <h2>Các trường hợp không hoàn tiền</h2>
        <p>
          Voucher đã sử dụng, đã hết hạn, bị từ chối do người dùng cung cấp sai thông tin hoặc vi phạm điều kiện áp
          dụng sẽ không được hoàn tiền.
        </p>

        <h2>Thời gian xử lý</h2>
        <p>
          Yêu cầu hợp lệ sẽ được đối soát và phản hồi trong vòng 3-7 ngày làm việc, tuỳ theo phương thức thanh toán
          và quy trình xác nhận của đối tác.
        </p>
      </section>
    </main>
  );
};

export default RefundPolicy;

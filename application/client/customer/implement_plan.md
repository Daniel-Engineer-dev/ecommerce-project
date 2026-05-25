# Kế hoạch triển khai hoàn thiện phân hệ khách hàng

Ngày lập kế hoạch: 2026-05-26

Mục tiêu: đưa phân hệ khách hàng từ mức hoàn thiện hiện tại khoảng 72% lên 100% theo các yêu cầu BR-CUS-01 đến BR-CUS-08, đồng thời xử lý các quy tắc liên quan trong BRD về tồn kho, phát hành voucher code, trạng thái đơn hàng, đánh giá, khiếu nại và bảo mật truy cập.

Phạm vi chính:
- Frontend customer: `application/client/customer`.
- Backend liên quan customer: `application/server/modules/customer`.
- Auth/shared API liên quan: `application/server/modules/auth`, `application/server/modules/shared`.
- Nếu cần thay đổi database runtime/schema: tạo script migration riêng, không sửa trực tiếp dump gốc trừ khi được yêu cầu.

## Nguyên tắc thực hiện

1. Ưu tiên an toàn nghiệp vụ trước UI: sửa quyền sở hữu order/e-voucher, vòng đời order và tồn kho trước khi thêm tính năng mới.
2. Không phá vỡ luồng hiện có: giữ các endpoint đang dùng nếu có thể, chỉ mở rộng response/params và cập nhật frontend tương ứng.
3. Mỗi phase phải có tiêu chí nghiệm thu rõ ràng và build/test được.
4. Tách các thay đổi lớn thành PR/commit nhỏ để dễ review.
5. Nếu thay đổi database, cần có migration có thể chạy lại và mô tả rollback.

## Definition of Done tổng thể

Phân hệ customer được xem là 100% khi đạt các điều kiện sau:
- BR-CUS-01: đăng ký bằng email/phone có check trùng lặp thật và có bước xác thực mô phỏng rõ ràng.
- BR-CUS-02: đăng nhập, đăng xuất, quên mật khẩu, đổi mật khẩu, cập nhật profile hoạt động ổn định; route cần login được bảo vệ.
- BR-CUS-03: tìm kiếm/lọc voucher đầy đủ theo keyword, danh mục, khu vực, giá, mức giảm, đối tác, trạng thái hiệu lực.
- BR-CUS-04: detail chỉ hiện voucher hợp lệ cho customer và đầy đủ thông tin yêu cầu.
- BR-CUS-05: giỏ hàng không cho vượt tồn kho, không checkout voucher hết hạn/hết hàng/không được bán.
- BR-CUS-06: tạo đơn, thanh toán mô phỏng, hủy/fail/expire order xử lý đúng vòng đời và tồn kho.
- BR-CUS-07: sau thanh toán xem được code, QR thật/mô phỏng bằng mã QR, trạng thái sử dụng, lịch sử đơn hàng.
- BR-CUS-08: đánh giá và khiếu nại/phản hồi có UI + API, gắn được với voucher/order liên quan.
- Build frontend customer thành công; backend không lỗi route runtime cơ bản.

## Phase 0 - Baseline và chuẩn hóa trước khi sửa

Mục tiêu: nắm chắc trạng thái hiện tại, tránh ghi đè thay đổi ngoài phạm vi.

Công việc:
- Chạy `git status --short` và ghi nhận file đang dirty.
- Chạy build frontend customer bằng `npm.cmd run build`.
- Chạy server smoke test nếu môi trường DB trong `.env` sẵn sàng.
- Lập danh sách endpoint hiện có và endpoint sẽ thêm.

File dự kiến đọc/chạm:
- `application/client/customer/review_result.md`
- `application/server/index.js`
- `application/server/modules/customer/orderRoutes.js`
- `application/server/modules/customer/orderController.js`
- `application/server/modules/customer/orderService.js`

Tiêu chí nghiệm thu:
- Có baseline build/test ban đầu.
- Không có thay đổi source ngoài file plan trong phase này nếu chưa được phê duyệt.

## Phase 1 - Sửa bảo mật và quyền sở hữu dữ liệu

Mục tiêu: chặn rò rỉ e-voucher/order và voucher chưa duyệt.

Công việc backend:
- Sửa `OrderController.getOrderEVouchers` truyền `req.user.id` vào service.
- Sửa `OrderService.getOrderEVouchers(orderId, customerId)` để query có điều kiện `o.customer_id = $2` và `o.status = 'Paid'`.
- Sửa `OrderController.confirmVietQR` để chỉ complete order của customer đang login.
- Thêm helper trong `OrderService` như `assertCustomerOwnsOrder(orderId, customerId)`.
- Sửa `VoucherService.getVoucherById(id)` cho customer endpoint chỉ trả voucher `Approved`, còn thời hạn hiệu lực và tồn kho phải rõ ràng.

Công việc frontend:
- Xử lý thông báo lỗi 403/404 trên `PaymentStatus.jsx` và `VoucherDetail.jsx` thân thiện hơn.

Tiêu chí nghiệm thu:
- User A không xem được e-voucher của order User B.
- User A không confirm VietQR cho order User B.
- Customer không xem được voucher Pending/Disabled bằng URL trực tiếp.
- Build frontend thành công.

Ưu tiên: bắt buộc làm đầu tiên.

## Phase 2 - Hoàn thiện vòng đời order và tồn kho

Mục tiêu: đảm bảo không kẹt tồn kho khi thanh toán thất bại/hủy, và không bán vượt số lượng.

Phương án khuyến nghị:
- Giữ trigger DB hiện tại nếu chưa muốn sửa schema lớn, nhưng thêm cơ chế hủy/expire order Pending để trả stock.
- Nếu được phê duyệt sửa DB nghiệp vụ sau, có thể chuyển sang mô hình reserve stock rõ ràng hơn.

Công việc backend:
- Thêm các trạng thái order được code hỗ trợ: `Pending`, `Paid`, `Cancelled`, `Failed`, `Expired`, `Refunded` nếu cần demo hoàn tiền.
- Thêm `cancelOrder(orderId, customerId, reason)`:
  - Chỉ cho hủy order `Pending`.
  - Cộng lại `quantity_stock` theo `Order_Items`.
  - Cập nhật `Orders.status = 'Cancelled'`.
- Thêm `markOrderFailed(orderId, transactionRef)` cho return/IPN fail nếu cần.
- Thêm `expirePendingOrders()` hoặc endpoint/admin utility để expire order quá thời gian thanh toán demo.
- Sửa `completeOrder`:
  - Chỉ complete order thuộc status `Pending`.
  - Idempotent với `Paid`.
  - Không phát hành duplicate e-voucher nếu đã có e-voucher.
- Thêm endpoint:
  - `POST /api/orders/:orderId/cancel`
  - Có thể thêm `POST /api/orders/expire-pending` nội bộ nếu cần demo.

Công việc frontend:
- `Checkout.jsx`: nút hủy VietQR gọi cancel order thay vì chỉ đóng modal.
- `PaymentStatus.jsx`: nếu status fail và có orderId, gọi/hướng đến cancel/fail order theo thiết kế.
- `CartContext.jsx` và `Cart.jsx`: giới hạn quantity theo `quantity_stock` đã có trong item.
- Trước checkout, gọi API validate cart hoặc refresh voucher để bắt voucher hết hàng/hết hạn.

Endpoint đề xuất:
- `POST /api/orders/validate-cart`: nhận danh sách voucher_id/quantity, trả về giá hiện tại, tồn kho, trạng thái hợp lệ, tổng tiền.

Tiêu chí nghiệm thu:
- Tạo order Pending làm giảm stock; hủy order Pending trả lại đúng stock.
- Thanh toán success tạo e-voucher đúng quantity.
- Gọi completeOrder lại lần 2 không tạo duplicate e-voucher.
- Giỏ hàng không cho tăng vượt stock và checkout báo lỗi rõ khi voucher không hợp lệ.

Ưu tiên: cao.

## Phase 3 - Lịch sử đơn hàng đầy đủ

Mục tiêu: đạt BR-CUS-07 về lịch sử đơn hàng, không chỉ hiện ví e-voucher.

Công việc backend:
- Thêm service/controller route:
  - `GET /api/orders/my-orders`: danh sách order của customer đang login.
  - `GET /api/orders/:orderId`: chi tiết order, items, payment info, e-vouchers nếu đã Paid.
- Query chỉ trả order thuộc `req.user.id`.
- Response gồm: order_id, order_date, total_amount, status, payment_method, transaction_reference, shipping info, items, evoucher count.

Công việc frontend:
- Thêm tab `Đơn hàng` trong `Profile.jsx` hoặc tách component `OrderHistory`.
- Hiện danh sách order theo status, ngày mua, tổng tiền, phương thức thanh toán.
- Có view chi tiết order: items, e-voucher nếu paid, trạng thái payment.
- Thêm filter nhỏ theo status nếu cần.

Tiêu chí nghiệm thu:
- Customer xem được lịch sử Pending/Paid/Cancelled/Failed của mình.
- Customer không xem được order của người khác.
- Từ order Paid có link sang e-voucher/wallet.

Ưu tiên: trung bình cao.

## Phase 4 - Khiếu nại và phản hồi customer

Mục tiêu: hoàn thành phần còn thiếu lớn của BR-CUS-08.

Công việc backend:
- Thêm module mới trong `application/server/modules/customer`:
  - `complaintRoutes.js`
  - `complaintController.js`
  - `complaintService.js`
- Đăng ký route trong `server/index.js`, ví dụ `app.use('/api/complaints', complaintRoutes)`.
- Endpoint cần thêm:
  - `POST /api/complaints`: tạo khiếu nại, có title/content/priority/orderId/voucherIds tùy chọn.
  - `GET /api/complaints/my`: danh sách khiếu nại của customer.
  - `GET /api/complaints/:id`: chi tiết khiếu nại và responses, chỉ customer sở hữu được xem.
- Nếu gắn voucher, insert vào `complaint_vouchers`.
- Nếu gắn order, cần xác thực order thuộc customer. Database hiện chưa có `order_id` trong `complaints`; nếu cần gắn order chuẩn hơn, đề xuất migration thêm `order_id nullable`.

Công việc frontend:
- Mở rộng `Support.jsx` thành form gửi khiếu nại/hỗ trợ.
- Thêm tab `Khiếu nại` trong `Profile.jsx` để xem trạng thái và phản hồi.
- Từ e-voucher/order detail có nút "Gửi khiếu nại" kèm voucher/order context.

Tiêu chí nghiệm thu:
- Customer tạo được khiếu nại có nội dung, priority và voucher liên quan.
- Customer xem được trạng thái Pending/Processing/Resolved/Rejected.
- Customer xem được response từ admin/partner nếu có trong DB.
- Không xem/sửa được khiếu nại của user khác.

Ưu tiên: trung bình cao.

## Phase 5 - QR e-voucher thật và cải thiện wallet

Mục tiêu: e-voucher có QR code đúng với `unique_code`, trạng thái rõ và dễ demo.

Công việc frontend:
- Thêm thư viện QR phù hợp, ví dụ `qrcode.react` hoặc sinh QR bằng API nội bộ nếu không muốn thêm dependency frontend.
- Cập nhật `PaymentStatus.jsx` và wallet trong `Profile.jsx`:
  - Hiện QR code từ `unique_code`.
  - Nút copy code.
  - Hiện status Unused/Used/Expired/Locked.
  - Hiện branch đã sử dụng và used_date nếu có.
- Tách component `EVoucherCard.jsx` để dùng lại ở PaymentStatus và Profile.

Công việc backend:
- Mở rộng query e-voucher lấy `used_at_branch_id`, branch_name, used_date.

Tiêu chí nghiệm thu:
- Mỗi e-voucher hiện QR scan được nội dung code.
- Code copy được.
- Status, expiry, used branch/date hiện đúng.

Ưu tiên: trung bình.

## Phase 6 - Hoàn thiện đăng ký, availability và route guard

Mục tiêu: đạt BR-CUS-01/02 chặt hơn và giảm lỗi trải nghiệm.

Công việc backend:
- Cài đặt `checkAvailability` thật:
  - Check username trong `Users`.
  - Check email nếu có.
  - Check phone nếu có.
- Thêm luồng verify đăng ký mô phỏng:
  - Phương án nhẹ: frontend hiện mã demo và submit verify local trước khi gọi register.
  - Phương án backend: endpoint gửi OTP mock và verify OTP tạm thời. Cần thêm bảng/cache nếu muốn nghiêm túc.

Công việc frontend:
- `CustomerRegistration.jsx`:
  - Check availability khi blur/next.
  - Bước verify email/phone mô phỏng.
  - Thông báo rõ nếu username/email/phone đã tồn tại.
- Thêm `ProtectedRoute` cho `/profile`, `/checkout`, các trang order/complaint cần login.
- Login redirect về trang ban đầu nếu có `redirect`.

Tiêu chí nghiệm thu:
- Đăng ký bị chặn ngay khi username/email/phone đã tồn tại.
- Customer phải qua bước verify mô phỏng trước khi tạo tài khoản.
- Vào `/checkout` khi chưa login sẽ login xong quay lại checkout.

Ưu tiên: trung bình.

## Phase 7 - Hoàn thiện tìm kiếm/lọc và detail voucher

Mục tiêu: đạt BR-CUS-03/04 đầy đủ và nhất quán.

Công việc backend:
- `searchVouchers` lọc rõ:
  - `status = 'Approved'`
  - `start_date <= NOW()`
  - `expiry_date > NOW()`
  - `quantity_stock > 0` nếu chỉ hiện voucher mua được.
- Thêm filter partner vào UI đã có API.
- Thêm filter trạng thái hiệu lực nếu requirement cần hiện cả sắp bán/hết hàng trong demo.
- `getVoucherById` trả 404 nếu voucher không hợp lệ cho customer.

Công việc frontend:
- `SearchVouchers.jsx`: thêm dropdown đối tác, gọi `/api/vouchers/partners`.
- Hiện badge "Hết hàng", "Sắp hết hạn", "Đang bán" nếu cần.
- `VoucherDetail.jsx`: disable mua/thêm giỏ nếu hết hàng/hết hạn/chưa đến ngày bán.
- Thay gallery mock lặp ảnh bằng chỉ một ảnh hoặc danh sách ảnh thật nếu schema có.

Tiêu chí nghiệm thu:
- Search đúng tất cả filter trong BR-CUS-03.
- Voucher không mua được không thể thêm giỏ/checkout.
- Detail không lộ voucher Pending/Disabled.

Ưu tiên: trung bình.

## Phase 8 - Refactor frontend và tối ưu chất lượng

Mục tiêu: giảm rủi ro bảo trì sau khi tính năng đã đủ.

Công việc:
- Tách component:
  - `components/EVoucherCard.jsx`
  - `components/ReviewModal.jsx`
  - `components/ProfileForm.jsx`
  - `components/SecurityForm.jsx`
  - `components/OrderHistory.jsx`
  - `components/ComplaintList.jsx`
  - `components/CheckoutPaymentMethods.jsx`
- Tách hook/API helper:
  - `src/api/client.js`
  - `src/api/orders.js`
  - `src/api/complaints.js`
  - `src/api/vouchers.js`
- Route-level lazy loading trong `App.jsx` để giảm bundle.
- Kiểm tra encoding UTF-8 cho nội dung tiếng Việt trong các file bị lỗi hiển thị.
- Giảm inline style nơi nào lặp lại nhiều, chuyển sang CSS class có sẵn.

Tiêu chí nghiệm thu:
- `npm.cmd run build` thành công.
- Chunk warning được giảm hoặc có giải thích chấp nhận nếu còn.
- UI customer vẫn đi được các luồng chính.

Ưu tiên: trung bình thấp, nên làm sau khi nghiệp vụ đã đúng.

## Thứ tự triển khai đề xuất

1. Phase 0: Baseline.
2. Phase 1: Bảo mật/quyền sở hữu.
3. Phase 2: Order lifecycle/tồn kho.
4. Phase 3: Lịch sử đơn hàng.
5. Phase 4: Khiếu nại/phản hồi.
6. Phase 5: QR e-voucher/wallet.
7. Phase 6: Đăng ký/availability/route guard.
8. Phase 7: Search/detail hoàn chỉnh.
9. Phase 8: Refactor/tối ưu.

Nếu cần rút gọn cho demo nhanh, tối thiểu nên làm theo thứ tự:
1. Phase 1
2. Phase 2
3. Phase 4
4. Phase 3
5. Phase 5
6. Phase 6 + Phase 7 các mục con còn thiếu

## Rủi ro và quyết định cần phê duyệt

1. Có cho phép thêm migration database không?
   - Cần nếu muốn thêm `orders.status` check constraint, `complaints.order_id`, timestamps cho order lifecycle.
   - Nếu không, có thể xử lý bằng code với schema hiện tại, nhưng tính chất dữ liệu kém chặt hơn.

2. Có giữ trigger trừ stock hiện tại không?
   - Giữ trigger: nhanh hơn, chỉ cần thêm cancel/expire để trả stock.
   - Sửa sang reserve/finalize: đúng nghiệp vụ hơn, nhưng tác động database lớn hơn.

3. QR e-voucher sinh ở frontend hay backend?
   - Frontend: nhanh, thêm dependency nhỏ.
   - Backend: tập trung logic, nhưng cần endpoint/asset response phức tạp hơn.

4. Xác thực đăng ký mô phỏng ở frontend hay backend?
   - Frontend-only: đủ để demo, ít thay đổi server.
   - Backend OTP mock: đúng kiến trúc hơn, nhưng cần thêm lưu tạm token/OTP.

5. Phạm vi refactor UI đến đâu?
   - Chỉ tách component cần thiết để tránh rủi ro.
   - Refactor sau khi tính năng đạt đủ, không trộn với sửa nghiệp vụ.

## Checklist nghiệm thu cuối

- [ ] Customer đăng ký email/phone, check trùng lặp, verify mô phỏng.
- [ ] Customer login/logout, forgot/reset password, change password, update profile.
- [ ] Route customer cần login được guard và redirect đúng.
- [ ] Search có keyword, category, area, price, discount, partner, status/effective filter.
- [ ] Detail chỉ hiện voucher Approved/hợp lệ, đầy đủ info và disable mua khi không hợp lệ.
- [ ] Cart giới hạn quantity theo tồn kho và validate lại trước checkout.
- [ ] Checkout tạo order đúng tổng tiền DB, payment mock hoạt động.
- [ ] Cancel/fail/expire order Pending trả stock đúng.
- [ ] Complete payment phát hành e-voucher đúng quantity, không duplicate.
- [ ] Customer xem lịch sử đơn hàng và chi tiết order của mình.
- [ ] Customer xem e-voucher code, QR, status, expiry, used info.
- [ ] Customer đánh giá voucher đã mua và không review trùng.
- [ ] Customer tạo/xem khiếu nại và phản hồi xử lý.
- [ ] Customer không truy cập được order/e-voucher/complaint của người khác.
- [ ] Build frontend customer thành công.
- [ ] Smoke test backend routes customer thành công với DB demo.

## Ước lượng công việc

Ước lượng theo phase, chưa tính thời gian review:
- Phase 0: 0.5 ngày.
- Phase 1: 0.5-1 ngày.
- Phase 2: 1-2 ngày, tùy có sửa database hay không.
- Phase 3: 1 ngày.
- Phase 4: 1-1.5 ngày.
- Phase 5: 0.5-1 ngày.
- Phase 6: 1 ngày.
- Phase 7: 0.5-1 ngày.
- Phase 8: 1-2 ngày.

Tổng ước lượng: 7-11 ngày làm việc tùy mức refactor và database migration được phê duyệt.

# Kế hoạch triển khai xử lý khiếu nại và content

## 1. Mục tiêu

Hoàn thiện các luồng nghiệp vụ đang thiếu:

- Khách hàng gửi khiếu nại đơn hàng.
- Admin xử lý khiếu nại, chấp nhận hoặc từ chối.
- Khi chấp nhận, admin có thể cấp voucher bồi thường hoặc ghi nhận hoàn tiền thủ công.
- Giới hạn việc một đơn hàng gửi khiếu nại quá nhiều lần.
- Mở chức năng content đang có ở admin sang phía customer để người dùng có thể xem nội dung đã publish.

## 2. Phạm vi không làm trong đợt này

- Chưa tích hợp hoàn tiền tự động qua VNPay, MoMo, PayPal.
- Chưa thay đổi toàn bộ thiết kế UI hiện có nếu không cần thiết.
- Chưa làm hệ thống notification realtime.
- Chưa làm phân tích/báo cáo nâng cao cho khiếu nại và content.

## 3. Luồng khiếu nại đơn hàng

### 3.1. Trạng thái khiếu nại đề xuất

Bổ sung hoặc chuẩn hóa trạng thái khiếu nại:

```txt
pending        Khách vừa gửi khiếu nại
reviewing      Admin đang xem xét
accepted       Admin chấp nhận khiếu nại
rejected       Admin từ chối khiếu nại
voucher_issued Đã cấp voucher bồi thường
refund_pending Đã duyệt hoàn tiền, chờ xử lý thủ công
refunded       Đã ghi nhận hoàn tiền
resolved       Đã hoàn tất xử lý
```

### 3.2. Rule giới hạn khiếu nại theo đơn hàng

Khi customer gửi khiếu nại:

- Đơn hàng phải thuộc về customer đang đăng nhập.
- Đơn hàng phải ở trạng thái được phép khiếu nại, ví dụ: đã giao, đã hoàn thành, đã thanh toán tùy theo logic hiện có.
- Nếu đơn hàng đã có khiếu nại đang `pending` hoặc `reviewing`, không cho tạo khiếu nại mới.
- Tổng số khiếu nại của một đơn hàng không vượt quá giới hạn cấu hình, đề xuất mặc định là `2`.
- Nếu vượt giới hạn, trả về thông báo rõ ràng cho customer.

Thông báo đề xuất:

```txt
Đơn hàng này đã vượt quá số lần khiếu nại cho phép.
```

### 3.3. Thay đổi database đề xuất

Nếu bảng khiếu nại đã tồn tại, bổ sung các cột cần thiết:

```txt
status
admin_note
resolution_type
resolution_note
refund_status
refund_amount
voucher_id
attempt_no
resolved_at
reviewed_by
reviewed_at
```

Giá trị đề xuất cho `resolution_type`:

```txt
none
refund_manual
voucher
reject
other
```

Giá trị đề xuất cho `refund_status`:

```txt
none
pending_manual
completed_manual
failed
```

Nếu chưa có bảng khiếu nại, tạo bảng mới:

```txt
complaints
- id
- order_id
- customer_id
- reason
- description
- evidence_urls
- status
- admin_note
- resolution_type
- resolution_note
- refund_status
- refund_amount
- voucher_id
- attempt_no
- reviewed_by
- reviewed_at
- resolved_at
- created_at
- updated_at
```

### 3.4. Backend API đề xuất

Customer:

```txt
POST /api/customer/complaints
GET  /api/customer/complaints
GET  /api/customer/complaints/:id
GET  /api/customer/orders/:orderId/complaints
```

Admin:

```txt
GET   /api/admin/complaints
GET   /api/admin/complaints/:id
PATCH /api/admin/complaints/:id/status
POST  /api/admin/complaints/:id/issue-voucher
POST  /api/admin/complaints/:id/mark-refund-pending
POST  /api/admin/complaints/:id/mark-refunded
POST  /api/admin/complaints/:id/reject
POST  /api/admin/complaints/:id/resolve
```

### 3.5. Admin UI đề xuất

Thêm hoặc hoàn thiện màn hình quản lý khiếu nại:

- Danh sách khiếu nại.
- Lọc theo trạng thái.
- Lọc theo ngày tạo.
- Lọc theo mã đơn hàng hoặc customer.
- Xem chi tiết khiếu nại.
- Xem thông tin đơn hàng liên quan.
- Nút chuyển trạng thái `reviewing`.
- Nút từ chối khiếu nại.
- Nút chấp nhận và chọn cách xử lý.
- Nút cấp voucher.
- Nút ghi nhận hoàn tiền thủ công.
- Vùng ghi chú nội bộ của admin.

### 3.6. Customer UI đề xuất

Tại màn hình chi tiết đơn hàng:

- Hiện nút "Gửi khiếu nại" nếu đơn hàng đủ điều kiện.
- Ẩn nút nếu đang có khiếu nại đang xử lý.
- Hiện thông báo nếu đơn hàng đã vượt số lần khiếu nại.
- Hiện trạng thái khiếu nại gần nhất.

Thêm màn hình hoặc modal gửi khiếu nại:

- Lý do khiếu nại.
- Nội dung mô tả.
- Ảnh bằng chứng nếu hệ thống đã hỗ trợ upload.
- Nút gửi.

## 4. Cấp voucher bồi thường

### 4.1. Nghiệp vụ

Khi admin chấp nhận khiếu nại, admin có thể cấp voucher riêng cho customer.

Voucher bồi thường nên:

- Chỉ gắn cho customer đó.
- Chỉ dùng được 1 lần.
- Có hạn sử dụng.
- Có lý do tạo là `complaint_compensation`.
- Có liên kết đến `complaint_id`.

### 4.2. Database đề xuất

Nếu hệ thống voucher đã có, bổ sung các cột nếu thiếu:

```txt
customer_id
complaint_id
usage_limit
used_count
reason
expired_at
```

Giá trị `reason` đề xuất:

```txt
manual
promotion
complaint_compensation
system
```

### 4.3. Backend

API admin cấp voucher từ khiếu nại:

```txt
POST /api/admin/complaints/:id/issue-voucher
```

Payload đề xuất:

```json
{
  "discount_type": "fixed",
  "discount_value": 50000,
  "min_order_value": 0,
  "expired_at": "2026-12-31T23:59:59.000Z",
  "note": "Voucher bồi thường cho khiếu nại đơn hàng"
}
```

Sau khi tạo voucher:

- Gắn `voucher_id` vào khiếu nại.
- Cập nhật trạng thái khiếu nại thành `voucher_issued` hoặc `resolved` tùy quyết định nghiệp vụ.
- Voucher hiển thị trong tài khoản customer.

## 5. Hoàn tiền thủ công

### 5.1. Nghiệp vụ đợt này

Việc hoàn tiền thực tế sẽ xử lý ngoài hệ thống. Hệ thống chỉ ghi nhận trạng thái.

Luồng đề xuất:

```txt
Admin chấp nhận khiếu nại
-> Chọn "Hoàn tiền thủ công"
-> Nhập số tiền và ghi chú
-> Hệ thống cập nhật refund_status = pending_manual
-> Sau khi admin đã hoàn tiền bên ngoài, bấm "Đã hoàn tiền"
-> Hệ thống cập nhật refund_status = completed_manual, status = refunded hoặc resolved
```

### 5.2. Backend API

```txt
POST /api/admin/complaints/:id/mark-refund-pending
POST /api/admin/complaints/:id/mark-refunded
```

Payload `mark-refund-pending`:

```json
{
  "refund_amount": 120000,
  "note": "Hoàn tiền qua chuyển khoản thủ công"
}
```

## 6. Content cho customer

### 6.1. Mục tiêu

Chức năng content hiện chỉ có phía admin. Cần mở API public và UI customer để hiển thị nội dung đã publish.

### 6.2. Loại content đề xuất

```txt
banner
blog
faq
policy
promotion
guide
announcement
```

### 6.3. Database đề xuất

Nếu bảng content đã có, kiểm tra và bổ sung cột nếu thiếu:

```txt
title
slug
summary
content
thumbnail_url
type
status
published_at
created_by
updated_by
created_at
updated_at
```

Giá trị `status`:

```txt
draft
published
archived
```

### 6.4. Backend API public

Customer/public:

```txt
GET /api/content/public
GET /api/content/public/:slug
GET /api/content/public?type=faq
GET /api/content/public?type=promotion
GET /api/content/public?type=banner
```

Rule:

- Chỉ trả về content có `status = published`.
- Nếu có `published_at`, chỉ trả về content đã đến thời điểm publish.
- Không trả về content draft hoặc archived.

### 6.5. Customer UI đề xuất

Thêm các vị trí hiển thị content:

- Trang chủ: hiển thị banner và promotion published.
- Trang tin tức/ưu đãi: hiển thị blog, promotion, announcement.
- Trang chi tiết content theo slug.
- Trang FAQ nếu có content type `faq`.
- Trang chính sách nếu có content type `policy`.

## 7. Thứ tự triển khai đề xuất

### Phase 1: Khảo sát code hiện có

- Kiểm tra module order, complaint, voucher, content hiện có.
- Kiểm tra schema database hiện tại.
- Kiểm tra route backend admin/customer.
- Kiểm tra frontend admin/customer đang gọi API theo pattern nào.

Kết quả mong đợi:

- Xác định cần sửa file nào.
- Xác định bảng/cột nào đã có, cột nào cần thêm.

### Phase 2: Logic khiếu nại

- Thêm rule giới hạn khiếu nại theo `order_id`.
- Không cho tạo khiếu nại mới nếu khiếu nại cũ đang chưa xử lý.
- Thêm/cập nhật status khiếu nại.
- Thêm API admin cập nhật trạng thái.
- Thêm test thủ công bằng Postman hoặc frontend.

### Phase 3: Voucher bồi thường

- Thêm logic tạo voucher gắn với `customer_id` và `complaint_id`.
- Thêm API admin cấp voucher từ khiếu nại.
- Cập nhật khiếu nại sau khi cấp voucher.
- Đảm bảo customer thấy voucher trong danh sách voucher của mình.

### Phase 4: Hoàn tiền thủ công

- Thêm API mark refund pending.
- Thêm API mark refunded.
- Hiển thị trạng thái hoàn tiền ở admin.
- Hiển thị kết quả xử lý khiếu nại cho customer nếu đã có màn hình tương ứng.

### Phase 5: Content public cho customer

- Mở API public lấy content đã publish.
- Thêm trang/hiển thị content ở customer.
- Đảm bảo admin vẫn quản lý content như cũ.

### Phase 6: Kiểm thử

Kiểm thử các case:

- Customer gửi khiếu nại lần 1 thành công.
- Customer không thể gửi khiếu nại mới khi khiếu nại cũ đang pending/reviewing.
- Customer không thể gửi quá số lần cho phép.
- Admin từ chối khiếu nại.
- Admin cấp voucher bồi thường.
- Voucher hiển thị đúng cho customer.
- Admin đánh dấu hoàn tiền thủ công.
- Customer truy cập được content published.
- Customer không truy cập được content draft/archived.

## 8. Rủi ro và lưu ý

- Cần xem schema database hiện tại trước khi tạo migration để tránh trùng cột/bảng.
- Nếu đang deploy trên Supabase, mọi thay đổi schema cần đồng bộ với database Supabase.
- Hoàn tiền tự động qua cổng thanh toán có rủi ro cao hơn, nên để phase riêng sau.
- Cần thống nhất port/frontend URL nếu customer, admin, partner đang chạy ở các port khác nhau.
- Cần cân nhắc bảo mật khi public content API: public chỉ được đọc content published.

## 9. Tiêu chí hoàn thành

- Khách hàng không thể spam khiếu nại trên cùng một đơn hàng.
- Admin có thể chấp nhận/từ chối/xử lý khiếu nại.
- Admin có thể cấp voucher bồi thường từ khiếu nại.
- Admin có thể ghi nhận hoàn tiền thủ công.
- Customer xem được voucher bồi thường nếu được cấp.
- Customer xem được content đã publish từ admin.
- Các luồng cũ đặt hàng, thanh toán, đăng nhập không bị ảnh hưởng.

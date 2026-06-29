# BẢN TỔNG HỢP ÁP DỤNG YÊU CẦU NGHIỆP VỤ HỆ THỐNG DEALZY

Tài liệu này tổng hợp chi tiết cách nhóm phát triển đã thiết kế và hiện thực hóa hệ thống **Dealzy** (Mô hình Thương mại Điện tử phân phối E-Voucher trực tuyến) để đáp ứng trọn vẹn tất cả các yêu cầu chức năng, phi chức năng, quy tắc nghiệp vụ, ràng buộc dữ liệu và kiểm soát rủi ro từ đề bài yêu cầu.

---

## I. TỔNG QUAN KIẾN TRÚC & PHÂN VAI TRÒ HỆ THỐNG

Dự án được xây dựng theo mô hình **Decoupled Monorepo** nhằm phân tách độc lập các giao diện sử dụng nhưng dùng chung cơ sở dữ liệu quan hệ PostgreSQL để đồng bộ nghiệp vụ:

1. **Frontend (ứng dụng React + Vite):**
   * **Khách hàng (`/customer`):** Giao diện Hotdeal cho người dùng tìm kiếm, xem chi tiết, giỏ hàng, checkout và quản lý ví E-Voucher cá nhân.
   * **Đối tác (`/partner`):** Cổng thông tin cho doanh nghiệp khai báo chi nhánh, đăng bán voucher, theo dõi doanh thu và quét xác thực mã voucher sử dụng.
   * **Quản trị viên (`/admin`):** Bảng điều khiển quản trị hệ thống, phê duyệt tài khoản đối tác, kiểm duyệt voucher, xử lý khiếu nại, điều phối nội dung và giám sát nhật ký.
2. **Backend (Node.js + Express):**
   * Tổ chức theo kiến trúc **Modular 3 lớp** tuân thủ nghiêm ngặt quy tắc phân tách nhiệm vụ: `Routes` (định nghĩa endpoint & gán middleware) $\rightarrow$ `Controllers` (nhận tham số, điều hướng & trả response) $\rightarrow$ `Services` (thực hiện nghiệp vụ & truy vấn Database).
3. **Database (PostgreSQL):**
   * Sử dụng các cơ chế toàn vẹn dữ liệu mạnh mẽ bao gồm: khóa ngoại (FK), ràng buộc duy nhất (UNIQUE), ràng buộc CHECK và các `Trigger` kiểm tra nghiệp vụ động tại tầng dữ liệu nhằm phòng chống gian lận.

---

## II. BẢN ĐỒ ÁP DỤNG CHI TIẾT THEO YÊU CẦU (REQUIREMENTS MAPPING)

Dưới đây là bảng đối chiếu chi tiết từ các chương yêu cầu của đề bài và cách áp dụng cụ thể vào mã nguồn:

### Chương 1 & Chương 2: Thông tin đề tài & Phạm vi Dự án
* **Yêu cầu:** Xây dựng hệ thống TMĐT bán voucher trực tuyến với ít nhất 3 vai trò: Khách hàng (Customer), Đối tác (Partner), Quản trị viên (Admin) sử dụng CSDL quan hệ.
* **Cách nhóm đã áp dụng:**
  * **Cơ sở dữ liệu:** Thiết lập PostgreSQL thông qua file [scriptDatabase.sql](file:///d:/TMDT%20Software%20plan/SUBMISSION_PACKAGE/02_source_code/database_script_and_seed/scriptDatabase.sql) bao gồm 18 bảng nghiệp vụ.
  * **Phân quyền vai trò:** Cột `role` trong bảng `Users` nhận các giá trị `Customer`, `Partner`, `Admin` để định tuyến và phân quyền.
  * **Xác thực phiên làm việc:** Sử dụng JWT token và middleware xác thực vai trò đặt tại [middleware/](file:///d:/TMDT%20Software%20plan/application/server/middleware/).

### Chương 3 & Chương 4: Luồng Nghiệp vụ & Yêu cầu Nghiệp vụ Tổng thể
* **Luồng đi tổng quát:** Đối tác đăng ký $\rightarrow$ Admin duyệt đối tác $\rightarrow$ Đối tác tạo voucher $\rightarrow$ Admin duyệt voucher $\rightarrow$ Khách hàng tìm mua $\rightarrow$ Thanh toán mô phỏng $\rightarrow$ Sinh E-Voucher $\rightarrow$ Đối tác quét xác thực.
* **Cách nhóm đã áp dụng:**
  * Toàn bộ quy trình từ đầu đến cuối được hiện thực khép kín, cho phép chạy thử nghiệm mượt mà từ việc đăng ký thông tin doanh nghiệp đến khâu redeem voucher tại chi nhánh.

---

### Chương 5: Yêu cầu chi tiết cho Khách hàng (Customer)

| Mã yêu cầu | Mô tả chi tiết yêu cầu | File giao diện (Frontend) | API & Service xử lý (Backend) | Cơ sở dữ liệu (PostgreSQL) |
| :--- | :--- | :--- | :--- | :--- |
| **BR-CUS-01** | Đăng ký tài khoản bằng Email/SĐT, kiểm tra trùng lặp, OTP mô phỏng. | [CustomerRegistration.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/CustomerRegistration.jsx) | [authRoutes.js](file:///d:/TMDT%20Software%20plan/application/server/modules/auth/authRoutes.js)<br>[authController.js](file:///d:/TMDT%20Software%20plan/application/server/modules/auth/authController.js)<br>[authService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/auth/authService.js) | Bảng `Users` và `Customers`. Ràng buộc duy nhất qua chỉ mục partial `idx_users_email_unique_not_null` và `idx_users_phone_unique_not_null`. |
| **BR-CUS-02** | Đăng nhập, đăng xuất, quên mật khẩu, cập nhật hồ sơ cá nhân. | [AuthPage.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/AuthPage.jsx)<br>[Profile.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/Profile.jsx)<br>[ResetPassword.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/ResetPassword.jsx) | [authService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/auth/authService.js) (các hàm `login`, `updateProfile`, `forgotPassword`, `resetPassword`). | Hàm băm `bcryptjs` mã hóa mật khẩu trước khi lưu. Cập nhật trực tiếp vào bảng `Customers` và `Users`. |
| **BR-CUS-03** | Tìm kiếm voucher theo từ khóa & Lọc theo danh mục, khu vực, giá, đối tác. | [SearchVouchers.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/SearchVouchers.jsx)<br>[Home.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/Home.jsx) | [voucherRoutes.js](file:///d:/TMDT%20Software%20plan/application/server/modules/shared/voucherRoutes.js)<br>[voucherService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/shared/voucherService.js) (`getVouchers`). | Truy vấn bảng `Vouchers` kết hợp `Categories` và `Partners`. Chỉ trả về voucher có `status = 'Approved'`, còn hạn bán và còn tồn kho. |
| **BR-CUS-04** | Xem thông tin chi tiết voucher (giá, điều kiện, chi nhánh, đánh giá). | [VoucherDetail.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/VoucherDetail.jsx) | [voucherService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/shared/voucherService.js) (`getVoucherById`). | Kết hợp bảng `Vouchers`, `Voucher_Branches`, `Branches`, `Reviews` để lấy toàn bộ dữ liệu liên quan. |
| **BR-CUS-05** | Quản lý giỏ hàng ở phía client (thêm, cập nhật số lượng, xóa). | [Cart.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/Cart.jsx) | Sử dụng `localStorage` lưu trữ giỏ hàng phía Client nhằm giảm tải cho server và nâng cao trải nghiệm người dùng. | Không ghi vào DB cho đến khi checkout để tối ưu bộ nhớ. |
| **BR-CUS-06** | Tạo đơn hàng, khai báo thông tin người nhận quà tặng, chọn cổng thanh toán mô phỏng. | [Checkout.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/Checkout.jsx) | [orderRoutes.js](file:///d:/TMDT%20Software%20plan/application/server/modules/customer/orderRoutes.js)<br>[orderService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/customer/orderService.js) (`createOrder`). | Ghi dữ liệu vào bảng `Orders` (lưu `gift_recipient_name`, `gift_recipient_email` nếu là quà tặng) và bảng `Order_Items`. |
| **BR-CUS-07** | Nhận và quản lý ví E-Voucher (mã voucher dạng text, QR mô phỏng, trạng thái sử dụng). | [Profile.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/Profile.jsx) (Tab E-Vouchers) | [orderService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/customer/orderService.js) (`getCustomerEVouchers`). | Đọc dữ liệu từ bảng `E_Vouchers`. Hiển thị mã QR mô phỏng bằng thư viện sinh mã QR phía Client. |
| **BR-CUS-08** | Đánh giá voucher sau khi mua và gửi phản hồi/khiếu nại về đơn hàng. | [VoucherDetail.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/VoucherDetail.jsx) (phần Review)<br>[Profile.jsx](file:///d:/TMDT%20Software%20plan/application/client/customer/src/pages/Profile.jsx) (Tab Đơn hàng / Gửi khiếu nại) | [complaintRoutes.js](file:///d:/TMDT%20Software%20plan/application/server/modules/customer/complaintRoutes.js)<br>[complaintService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/customer/complaintService.js) (`createComplaint`). | **Đánh giá:** Ghi bảng `Reviews` (Ràng buộc bằng Trigger `trg_validate_review` chỉ cho phép review nếu đã mua).<br>**Khiếu nại:** Ghi bảng `Complaints`. |

---

### Chương 6: Yêu cầu chi tiết cho Đối tác (Partner)

| Mã yêu cầu | Mô tả chi tiết yêu cầu | File giao diện (Frontend) | API & Service xử lý (Backend) | Cơ sở dữ liệu (PostgreSQL) |
| :--- | :--- | :--- | :--- | :--- |
| **BR-PAR-01** | Đăng ký và quản lý thông tin doanh nghiệp, đại diện pháp lý và các chi nhánh. | [PartnerRegistration.jsx](file:///d:/TMDT%20Software%20plan/application/client/partner/src/pages/PartnerRegistration.jsx)<br>[App.jsx](file:///d:/TMDT%20Software%20plan/application/client/partner/src/App.jsx) (Tab Hồ sơ) | [authService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/auth/authService.js) (`registerPartner`) | Ghi thông tin doanh nghiệp vào bảng `Partners` (mặc định trạng thái `Pending` chờ Admin duyệt) và danh sách chi nhánh vào bảng `Branches`. |
| **BR-PAR-02** | Tạo mới chương trình voucher (giá, số lượng phát hành, hạn dùng, chi nhánh áp dụng). | [App.jsx](file:///d:/TMDT%20Software%20plan/application/client/partner/src/App.jsx) (Tab Tạo voucher) | [partnerRoutes.js](file:///d:/TMDT%20Software%20plan/application/server/modules/partner/partnerRoutes.js)<br>[partnerService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/partner/partnerService.js) (`createVoucher`) | Lưu thông tin voucher vào bảng `Vouchers`. Lưu liên kết chi nhánh áp dụng vào bảng nối `Voucher_Branches`. |
| **BR-PAR-03** | Gửi voucher sang trạng thái chờ duyệt và theo dõi kết quả phê duyệt từ Admin. | [App.jsx](file:///d:/TMDT%20Software%20plan/application/client/partner/src/App.jsx) (Tab Quản lý voucher) | [partnerService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/partner/partnerService.js) (`submitVoucherForApproval`) | Cập nhật cột `status` trong bảng `Vouchers` thành `Pending`. |
| **BR-PAR-04** | Cập nhật thông tin voucher trong phạm vi cho phép, theo dõi lượng tồn và đã bán. | [App.jsx](file:///d:/TMDT%20Software%20plan/application/client/partner/src/App.jsx) (Tab Chi tiết voucher) | [partnerService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/partner/partnerService.js) (`updateVoucher`) | Thực hiện cập nhật bảng `Vouchers`. Ràng buộc trigger kiểm tra tồn kho không được vượt quá số lượng phát hành. |
| **BR-PAR-05** | Tra cứu thông tin mã voucher code bằng nhập tay hoặc scan mã QR mô phỏng. | [App.jsx](file:///d:/TMDT%20Software%20plan/application/client/partner/src/App.jsx) (Tab Xác thực E-Voucher) | [partnerService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/partner/partnerService.js) (`verifyEVoucher`) | Đọc thông tin E-Voucher từ bảng `E_Vouchers`, liên kết bảng `Order_Items` và `Vouchers` để kiểm tra thông tin voucher gốc. |
| **BR-PAR-06** | Xác nhận voucher đã sử dụng (`Redeem`) tại chi nhánh cụ thể, cập nhật trạng thái. | [App.jsx](file:///d:/TMDT%20Software%20plan/application/client/partner/src/App.jsx) (Nút Xác nhận sử dụng) | [partnerService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/partner/partnerService.js) (`redeemEVoucher`) | Cập nhật trạng thái trong bảng `E_Vouchers` thành `Used`, ghi nhận `used_at` và `used_branch_id`. Tích hợp Trigger `trg_validate_voucher_usage` kiểm tra chi nhánh. |
| **BR-PAR-07** | Xem báo cáo dashboard đối tác: doanh thu, số phát hành, số đã bán, tỷ lệ sử dụng. | [App.jsx](file:///d:/TMDT%20Software%20plan/application/client/partner/src/App.jsx) (Tab Dashboard) | [partnerService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/partner/partnerService.js) (`getDashboardStats`) | Thực hiện gom nhóm dữ liệu (Aggregation queries) từ các bảng `Vouchers`, `Order_Items` và `E_Vouchers` của đối tác. |

---

### Chương 7: Yêu cầu chi tiết cho Quản trị viên (Admin)

| Mã yêu cầu | Mô tả chi tiết yêu cầu | File giao diện (Frontend) | API & Service xử lý (Backend) | Cơ sở dữ liệu (PostgreSQL) |
| :--- | :--- | :--- | :--- | :--- |
| **BR-ADM-01** | Quản lý người dùng: Xem, tìm kiếm, khóa/mở khóa tài khoản, thay đổi quyền hạn. | [UserManagement.jsx](file:///d:/TMDT%20Software%20plan/application/client/admin/src/pages/UserManagement.jsx) | [adminRoutes.js](file:///d:/TMDT%20Software%20plan/application/server/modules/admin/adminRoutes.js)<br>[adminService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/admin/adminService.js) (`getUsers`, `toggleUserStatus`, `updateUserRole`). | Cập nhật trạng thái `is_active` hoặc cột `role` trong bảng `Users`. |
| **BR-ADM-02** | Quản lý đối tác: Duyệt hồ sơ đối tác đang pending, đổi trạng thái hoạt động doanh nghiệp. | [PartnerApproval.jsx](file:///d:/TMDT%20Software%20plan/application/client/admin/src/pages/PartnerApproval.jsx) | [adminService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/admin/adminService.js) (`getPendingPartners`, `updatePartnerStatus`). | Cập nhật cột `status` trong bảng `Partners` thành `Approved` hoặc `Rejected`. Ghi chú lý do từ chối nếu có. |
| **BR-ADM-03** | Duyệt voucher: Xem danh sách chờ duyệt, duyệt hoặc từ chối kèm lý do, hoặc tạm ẩn voucher. | [VoucherManagement.jsx](file:///d:/TMDT%20Software%20plan/application/client/admin/src/pages/VoucherManagement.jsx) | [adminVoucherRoute.js](file:///d:/TMDT%20Software%20plan/application/server/modules/admin/Voucher/adminVoucherRoute.js)<br>[adminVoucherService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/admin/Voucher/adminVoucherService.js) (`reviewVoucher`). | Cập nhật cột `status` trong bảng `Vouchers` (`Approved`, `Rejected`, `Suspended`). |
| **BR-ADM-04** | Quản lý đơn hàng: Tra cứu đơn hàng, xác nhận thanh toán thủ công, xử lý hoàn tiền. | [OrderManagement.jsx](file:///d:/TMDT%20Software%20plan/application/client/admin/src/pages/OrderManagement.jsx) | [adminOrderRoute.js](file:///d:/TMDT%20Software%20plan/application/server/modules/admin/Order/adminOrderRoute.js)<br>[adminOrderService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/admin/Order/adminOrderService.js) (`confirmPaymentManual`). | Ghi nhận trạng thái `Paid` hoặc `Refunded` trong bảng `Orders`. Tự động gọi hàm hoàn tồn kho và khóa E-Voucher khi hoàn tiền toàn bộ. |
| **BR-ADM-05** | Quản lý nội dung: Chỉnh sửa trang tĩnh có cấu trúc, preview trước khi lưu, lưu vết lịch sử. | [ContentManagement.jsx](file:///d:/TMDT%20Software%20plan/application/client/admin/src/pages/ContentManagement.jsx) | [contentRoutes.js](file:///d:/TMDT%20Software%20plan/application/server/modules/shared/contentRoutes.js)<br>[adminService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/admin/adminService.js) (`updateContentItem`). | Ghi dữ liệu JSON có cấu trúc vào bảng `Content_Items` (cột `data`). Ghi vết thay đổi (before/after) vào bảng `Content_Item_Revisions`. |
| **BR-ADM-06** | Dashboard quản trị: Tổng quan số liệu doanh thu toàn hệ thống, đối tác, đơn hàng. | [AdminDashboard.jsx](file:///d:/TMDT%20Software%20plan/application/client/admin/src/pages/AdminDashboard.jsx) | [adminService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/admin/adminService.js) (`getDashboardStats`). | Gom nhóm dữ liệu thống kê từ toàn bộ CSDL (`Orders`, `Users`, `Partners`, `Vouchers`). |
| **BR-ADM-07** | Nhật ký hệ thống: Tra cứu và kiểm tra lại thao tác của các tài khoản Admin/Partner. | [SystemLogs.jsx](file:///d:/TMDT%20Software%20plan/application/client/admin/src/pages/SystemLogs.jsx) | [adminService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/admin/adminService.js) (`getSystemLogs`). | Đọc và lọc dữ liệu từ bảng `System_Logs` (được ghi nhận tự động thông qua hàm trợ giúp `logAction`). |

---

### Chương 8: Quy tắc nghiệp vụ (Business Rules - RB)
Hệ thống Dealzy áp dụng trực tiếp các quy tắc nghiệp vụ này tại cả hai tầng Backend API và CSDL PostgreSQL để đảm bảo tính chặt chẽ:

1. **RB-01 (Duyệt mới được bán):** 
   * Áp dụng tại API tìm kiếm công khai: [voucherService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/shared/voucherService.js) chỉ lấy `status = 'Approved'`.
2. **RB-02 (Giá bán < Giá gốc):** 
   * Kiểm soát ở Backend khi tạo/sửa voucher và được ép buộc bởi ràng buộc CHECK `chk_price` trong bảng `Vouchers` ở database.
3. **RB-03 (Thời gian bán rõ ràng):**
   * Ràng buộc CHECK `chk_dates` trong DB đảm bảo ngày hết hạn phải lớn hơn ngày bắt đầu. Luồng mua hàng kiểm tra thời gian thực tế so với thời gian bán của voucher.
4. **RB-04 / RB-11 (Không bán vượt tồn kho / quá hạn):**
   * Trong giao dịch thanh toán, hàm `validateCartWithClient` kiểm tra tồn kho trực tiếp và sử dụng khóa dòng `FOR UPDATE` ngăn chặn tình trạng bán vượt số lượng.
5. **RB-05 (Chỉ phát hành E-Voucher khi đã thanh toán thành công - Paid):**
   * E-Voucher chỉ được tạo khi trạng thái đơn hàng chuyển sang `Paid` trong transaction tại hàm `completePayment` của [orderService.js](file:///d:/TMDT%20Software%20plan/application/server/modules/customer/orderService.js).
6. **RB-06 (Mã voucher duy nhất và khó đoán):**
   * Mã voucher được sinh ngẫu nhiên có độ dài 12 ký tự với định dạng `DLZ + 9 ký tự alphanumeric` bằng hàm `generateUniqueCode()`. Cột `unique_code` trong bảng `E_Vouchers` có ràng buộc `UNIQUE`. Hàm lưu trữ có cơ chế retry đến 5 lần nếu trùng mã ngẫu nhiên.
7. **RB-07 / RB-08 (Voucher đã sử dụng hoặc hết hạn không được dùng lại):**
   * Khi đối tác xác thực sử dụng voucher code, hệ thống kiểm tra trạng thái E-Voucher phải là `Unused` và ngày hiện tại chưa vượt quá `expiry_date`. Khi redeem thành công, trạng thái lập tức đổi sang `Used`.
8. **RB-09 (Xác thực đúng phạm vi chi nhánh):**
   * Trigger `trg_validate_voucher_usage` kiểm tra chi nhánh đối tác tiến hành redeem có đúng là chi nhánh được cấu hình áp dụng cho voucher đó hay không.
9. **RB-10 (Chỉ đánh giá sau khi mua):**
   * Trigger `trg_validate_review` chặn không cho người dùng đánh giá nếu chưa có bản ghi mua thành công voucher đó.
10. **RB-12 (Ghi vết hoạt động admin):**
    * Mọi hành động cập nhật cấu hình nội dung, duyệt đối tác, duyệt voucher, khóa tài khoản đều gọi hàm `logAction` ghi nhận vào bảng `System_Logs`.

---

## III. CÁC ĐIỂM SÁNG TRONG CÀI ĐẶT THỰC TẾ CỦA NHÓM

Nhóm đã tối ưu hóa và giải quyết các bài toán biên nghiệp vụ phức tạp của một hệ thống TMĐT thực tế:

### 1. Cơ chế phòng chống Race Condition khi Checkout (Đồng thời mua hàng)
* Khi nhiều khách hàng cùng thanh toán một voucher có số lượng tồn kho giới hạn, hệ thống mở một transaction PostgreSQL, thực hiện lệnh:
  ```sql
  SELECT voucher_id, quantity_stock, status FROM Vouchers WHERE voucher_id = $1 FOR UPDATE
  ```
* Lệnh `FOR UPDATE` khóa dòng voucher đang xét, bắt buộc các request đồng thời khác phải xếp hàng chờ cho đến khi transaction hiện tại hoàn tất (Commit hoặc Rollback), ngăn ngừa tuyệt đối tình trạng bán vượt số lượng tồn kho (Over-selling).

### 2. Xử lý khiếu nại thông minh (Complaints & Resolutions)
* **Giới hạn số lần khiếu nại (Anti-spam):** Hệ thống quy định mỗi đơn hàng chỉ được khiếu nại tối đa **2 lần** (đọc cấu hình từ biến môi trường `MAX_COMPLAINTS_PER_ORDER`). Đồng thời, nếu đơn hàng đang có khiếu nại ở trạng thái `Pending` hoặc `Processing` thì không cho phép tạo thêm khiếu nại mới.
* **Xử lý hoàn tiền thủ công tích hợp khôi phục kho:** Khi Admin duyệt hoàn tiền toàn bộ đơn hàng (refund amount bằng tổng tiền đơn hàng), hệ thống tự động:
  1. Kiểm tra xem các E-Voucher trong đơn hàng đã bị sử dụng chưa (nếu đã sử dụng ít nhất 1 mã thì chặn không cho hoàn tiền toàn bộ đơn hàng).
  2. Chuyển toàn bộ E-Voucher chưa dùng trong đơn hàng sang trạng thái `Locked`.
  3. Hoàn trả lại số lượng tồn kho (`quantity_stock`) tương ứng cho voucher gốc trong database.
  4. Chuyển trạng thái đơn hàng sang `Refunded` và khiếu nại sang `Resolved`.
* **Cấp voucher bồi thường:** Admin có thể chọn đổi mã mới cho các E-Voucher chưa dùng thuộc đơn hàng bị khiếu nại (bảo vệ quyền lợi khách hàng mà không làm phát sinh thêm đơn hàng mới).

### 3. Giao diện Quản trị Nội dung (CMS) an toàn có Fallback
* Nhóm không sử dụng kiểu lưu trữ HTML tự do (dễ gây vỡ layout và bảo mật XSS). Thay vào đó, CMS quản lý nội dung động thông qua **JSON template có cấu trúc** cho 5 trang chính:
  * `support-center` (Trung tâm hỗ trợ)
  * `user-guide` (Hướng dẫn sử dụng)
  * `refund-policy` (Chính sách hoàn tiền)
  * `terms-of-service` (Điều khoản sử dụng)
  * `home-banner` (Banner trang chủ)
* **Preview trực tiếp:** Admin có bảng preview trực quan ở panel giữa khớp với giao diện của khách hàng trước khi bấm lưu.
* **Bản nháp & Phiên bản:** Hỗ trợ lưu trữ trạng thái nháp (`draft`) và xuất bản (`published`). Mọi thay đổi đều được ghi chi tiết dữ liệu trước/sau (before/after data) vào bảng `Content_Item_Revisions`.
* **Fallback dữ liệu:** Nếu API lấy nội dung tĩnh bị lỗi hoặc database chưa được khởi tạo nội dung, phía frontend tự động sử dụng file default content cứng có sẵn để hiển thị trang bình thường, tránh lỗi trang trắng cho khách hàng.

---

## IV. KẾT LUẬN

Hệ thống Dealzy được nhóm hoàn thiện đầy đủ từ khía cạnh giao diện (UI) đến logic backend và ràng buộc cơ sở dữ liệu. Tất cả các yêu cầu về nghiệp vụ mua bán voucher, kiểm duyệt vòng đời, xác thực tại quầy, quản trị nội dung tĩnh và xử lý khiếu nại đều có sự liên kết chặt chẽ và nhất quán trong toàn bộ mã nguồn. Gói sản phẩm bàn giao đã sẵn sàng để đóng gói độc lập phục vụ việc demo và nghiệm thu đồ án.

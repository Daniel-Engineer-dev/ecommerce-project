# Kế hoạch Kiểm thử (Test Plan) - Dự án Dealzy

Kế hoạch kiểm thử này giúp kiểm tra toàn bộ các yêu cầu nghiệp vụ của giảng viên và các trường hợp ngoại lệ thực tế.

---

## BƯỚC 1: PHÂN TÍCH & MAPPING YÊU CẦU

*   **Yêu cầu 1: Phân quyền & Quản lý Tài khoản (Khách hàng, Đối tác, Admin)**
    *   *Mô tả:* Đăng ký, Đăng nhập, Quên mật khẩu, Xác thực OTP mô phỏng, Đổi mật khẩu, Cập nhật thông tin chi tiết (Customer có dob, address; Partner có mã số thuế, trụ sở, chi nhánh).
    *   *Đối chiếu Source Code:* Đã triển khai đầy đủ tại `authController.js` và `authService.js`. CSDL quản lý phân tách qua 3 bảng `Users`, `Customers` và `Partners`.
*   **Yêu cầu 2: Vòng đời sản phẩm Voucher (Tạo mới, Phê duyệt, Đóng băng, Hết hạn)**
    *   *Mô tả:* Đối tác tạo voucher -> Trạng thái chờ duyệt (Pending) -> Admin duyệt (Approved) hoặc từ chối có lý do (Rejected) -> Voucher hiển thị bán -> Có thể tạm ẩn (Suspended).
    *   *Đối chiếu Source Code:* Đã có bảng `Vouchers` với trigger `trg_validate_order_item` kiểm tra trạng thái chỉ cho phép mua voucher `Approved`. Admin duyệt tại `adminService.js` (`approveVoucher`, `rejectVoucher`, `toggleVisibility`).
*   **Yêu cầu 3: Giao dịch & Thanh toán mô phỏng (Giỏ hàng, Checkout, Phát hành mã E-Voucher)**
    *   *Mô tả:* Khách hàng tìm kiếm/lọc voucher -> Thêm vào giỏ hàng -> Đặt mua -> Thanh toán mô phỏng -> Phát hành mã E-Voucher duy nhất (Unique Code) -> Đối tác quét/nhập mã để xác thực sử dụng (chỉ được dùng tại chi nhánh của đối tác đó).
    *   *Đối chiếu Source Code:* Logic đặt hàng và trừ tồn kho có an toàn giao dịch ở `orderService.js`. Trigger `trg_validate_voucher_usage` trong CSDL kiểm tra chi nhánh và ngăn chặn tái sử dụng voucher đã dùng.
*   **Yêu cầu 4: Đánh giá, Khiếu nại & Kiểm toán hệ thống (System Audit Logs)**
    *   *Mô tả:* Chỉ cho đánh giá khi đã mua voucher. Lưu vết các hành động nhạy cảm của Admin/Partner vào CSDL.
    *   *Đối chiếu Source Code:* Đã cài đặt bảng `System_Logs`, trigger `trg_log_action`, bảng `Reviews` (với trigger `trg_validate_review` chặn đánh giá ảo) và module khiếu nại `Complaints`.

---

## BƯỚC 2: DANH SÁCH TEST CASES CHI TIẾT (CHECK-LIST)

### 📌 Nhóm Tính Năng 1: Đăng ký & Quản lý Tài khoản (BR-01, BR-CUS-01, BR-PAR-01)

#### A. Kiểm thử chức năng (Functional Testing)
*   **[ ] TC-01: Đăng ký Khách hàng (Customer) mới thành công**
    *   **Mục đích/Yêu cầu GV:** Đáp ứng yêu cầu đăng ký tài khoản Khách hàng (BR-CUS-01) và lưu thông tin chi tiết vào bảng `Customers`.
    *   **Hướng dẫn Test (Steps):**
        1. Truy cập trang đăng ký chọn vai trò "Khách hàng".
        2. Nhập đầy đủ thông tin: Tên tài khoản (`tester_cus`), Mật khẩu (`Pass@123`), Email (`tester_cus@gmail.com`), SĐT (`0912345678`), Họ tên (`QA Customer`), Ngày sinh (`1999-01-01`), Địa chỉ (`123 Nguyễn Huệ`).
        3. Nhấn "Đăng ký".
    *   **Kết quả mong đợi (Expected):** Đăng ký thành công, tạo mới 1 dòng trong bảng `Users` (role = 'Customer') và 1 dòng trong bảng `Customers` (is_active = TRUE). Tự động điều hướng về màn hình Đăng nhập.
    *   **Gợi ý Test thêm:** SQL Injection cơ bản trong trường Username (ví dụ: `' OR 1=1--`), hệ thống phải báo lỗi hoặc xử lý an toàn (sử dụng Parameterized Query).
    *   **Ghi chú (Notes):** ________________________________________________

*   **[ ] TC-02: Đăng ký Đối tác (Partner) kèm danh sách chi nhánh ban đầu**
    *   **Mục đích/Yêu cầu GV:** Kịch bản đăng ký Đối tác doanh nghiệp kèm thông tin pháp lý (Mã số thuế) và chi nhánh (BR-PAR-01).
    *   **Hướng dẫn Test (Steps):**
        1. Truy cập trang đăng ký doanh nghiệp.
        2. Điền thông tin User: username (`glow_beauty`), password, email, phone.
        3. Điền thông tin Doanh nghiệp: Tên công ty (`Glow Beauty Spa`), Người đại diện, Mã số thuế (`0102030405`), Trụ sở.
        4. Thêm 2 chi nhánh:
           - Chi nhánh 1: `Glow Quận 1` (Địa chỉ A).
           - Chi nhánh 2: `Glow Quận 3` (Địa chỉ B).
        5. Nhấn "Đăng ký".
    *   **Kết quả mong đợi (Expected):** Tạo thành công bản ghi trong bảng `Users`, `Partners` (status = 'Pending') và 2 bản ghi trong bảng `Branches` tham chiếu đến `partner_id` của đối tác mới.
    *   **Gợi ý Test thêm:** Điền mã số thuế chứa ký tự đặc biệt hoặc số điện thoại chi nhánh trống. Hệ thống cần validate tính hợp lệ của SĐT và MST.
    *   **Ghi chú (Notes):** ________________________________________________

*   **[ ] TC-03: Đăng nhập tài khoản Đối tác đang ở trạng thái Chờ duyệt (Pending)**
    *   **Mục đích/Yêu cầu GV:** Đảm bảo quy tắc nghiệp vụ: Đối tác chưa được Admin duyệt thì không thể truy cập hệ thống Partner (BR-ADM-02).
    *   **Hướng dẫn Test (Steps):**
        1. Sử dụng tài khoản đối tác vừa đăng ký ở TC-02 (`glow_beauty`).
        2. Nhập đúng mật khẩu và nhấn "Đăng nhập".
    *   **Kết quả mong đợi (Expected):** Hệ thống từ chối đăng nhập và hiển thị thông báo lỗi rõ ràng: *"Tai khoan dang cho xet duyet"* (mã lỗi HTTP 400).
    *   **Gợi ý Test thêm:** Nhập sai mật khẩu để đảm bảo hệ thống check sai mật khẩu trước khi check trạng thái duyệt.
    *   **Ghi chú (Notes):** ________________________________________________

#### B. Kiểm thử giao diện/trải nghiệm (UI/UX Testing)
*   **[ ] TC-04: Kiểm tra tính khả dụng trùng lặp (Debounce check availability)**
    *   **Mục đích/Yêu cầu GV:** Trải nghiệm người dùng thông minh, báo trùng lặp Email/Username ngay khi đang gõ (BR-CUS-01).
    *   **Hướng dẫn Test (Steps):**
        1. Mở trang Đăng ký.
        2. Nhập một email đã tồn tại trong hệ thống (ví dụ: `admin@dealzy.vn`).
        3. Chờ 0.5 giây không thao tác.
    *   **Kết quả mong đợi (Expected):** Input Email đổi sang viền đỏ và hiển thị dòng chữ cảnh báo: *"Email này đã được sử dụng"*. Nút "Đăng ký" bị vô hiệu hóa (disabled).
    *   **Gợi ý Test thêm:** Gõ nhanh rồi xóa, kiểm tra xem API `/auth/check-availability` có bị spam request không (kiểm tra tính năng Debounce).
    *   **Ghi chú (Notes):** ________________________________________________

#### C. Kiểm thử luồng ngoại lệ (Edge/Negative Testing)
*   **[ ] TC-05: Đăng ký trùng Username hoặc Email đã tồn tại**
    *   **Mục đích/Yêu cầu GV:** Ràng buộc duy nhất (Unique Constraint) trong cơ sở dữ liệu (DR-01).
    *   **Hướng dẫn Test (Steps):**
        1. Nhập username là `admin` hoặc email là `admin@dealzy.vn`.
        2. Điền các trường khác hợp lệ và nhấn submit đăng ký.
    *   **Kết quả mong đợi (Expected):** Hệ thống chặn gửi và hiển thị thông báo lỗi từ backend: *"Ten dang nhap 'admin' da ton tai."* hoặc *"Email nay da duoc su dung"*.
    *   **Gợi ý Test thêm:** Gõ chữ hoa chữ thường trùng lặp (ví dụ: `aDmIn` hoặc `ADMIN@dealzy.vn`), CSDL PostgreSQL phải chặn thành công do so sánh `lower(email)`.
    *   **Ghi chú (Notes):** ________________________________________________

---

### 📌 Nhóm Tính Năng 2: Phê duyệt & Quản trị Đối tác (BR-ADM-02)

#### A. Kiểm thử chức năng (Functional Testing)
*   **[ ] TC-06: Admin phê duyệt đối tác doanh nghiệp thành công**
    *   **Mục đích/Yêu cầu GV:** Kích hoạt tài khoản đối tác và gửi email thông báo tự động (BR-ADM-02).
    *   **Hướng dẫn Test (Steps):**
        1. Đăng nhập tài khoản Admin (`admin` / `Pass@123`).
        2. Truy cập phân hệ "Duyệt đối tác".
        3. Tìm doanh nghiệp `glow_beauty` đang chờ duyệt (Pending) và nhấn "Phê duyệt".
    *   **Kết quả mong đợi (Expected):** Trạng thái của đối tác trong bảng `Partners` chuyển sang `Approved`. Hệ thống ghi nhận 1 dòng log trong bảng `System_Logs` (action = 'APPROVE_PARTNER'). Gửi email thông báo kích hoạt thành công cho đối tác.
    *   **Gợi ý Test thêm:** Kiểm tra xem đối tác `glow_beauty` lúc này đã đăng nhập vào trang Partner Portal thành công hay chưa.
    *   **Ghi chú (Notes):** ________________________________________________

*   **[ ] TC-07: Admin Khóa/Mở khóa tài khoản người dùng**
    *   **Mục đích/Yêu cầu GV:** Quản lý quyền truy cập và trạng thái hoạt động của tài khoản (BR-ADM-01).
    *   **Hướng dẫn Test (Steps):**
        1. Đăng nhập Admin, vào mục "Người dùng".
        2. Chọn tài khoản khách hàng `customer_minh` và nhấn "Khóa tài khoản".
        3. Đăng xuất Admin, dùng tài khoản `customer_minh` để đăng nhập.
    *   **Kết quả mong đợi (Expected):** Bảng `Customers` cập nhật `is_active = FALSE`. Khi `customer_minh` đăng nhập, hệ thống chặn lại và báo lỗi tài khoản bị khóa. Khi Admin nhấn "Mở khóa", `is_active` trở lại `TRUE` và đăng nhập bình thường.
    *   **Gợi ý Test thêm:** Khóa tài khoản của một Partner và kiểm tra xem toàn bộ các voucher của đối tác đó có tự động ẩn khỏi trang chủ hay không.
    *   **Ghi chú (Notes):** ________________________________________________

---

### 📌 Nhóm Tính Năng 3: Quản lý Vòng đời Voucher (BR-PAR-02, BR-ADM-03, RB-02)

#### A. Kiểm thử chức năng (Functional Testing)
*   **[ ] TC-08: Đối tác tạo Voucher mới thành công (Chờ duyệt)**
    *   **Mục đích/Yêu cầu GV:** Đáp ứng luồng tạo voucher mới ở trạng thái Pending (BR-PAR-02).
    *   **Hướng dẫn Test (Steps):**
        1. Đăng nhập tài khoản Partner (`sheraton_partner`).
        2. Nhập thông tin Voucher: Tiêu đề (`Voucher Thử Nghiệm`), Giá gốc (`100000`), Giá bán (`80000`), Số lượng (`50`), Hạn sử dụng (`2026-12-31`).
        3. Chọn chi nhánh áp dụng và nhấn "Tạo & Gửi duyệt".
    *   **Kết quả mong đợi (Expected):** Voucher được lưu vào bảng `Vouchers` với trạng thái `status = 'Pending'`. Voucher này **chưa** được hiển thị ngoài trang chủ của Khách hàng (Thỏa mãn RB-01).
    *   **Gợi ý Test thêm:** Upload ảnh dung lượng lớn hoặc định dạng lạ (ví dụ: file `.txt` đổi đuôi thành `.png`), kiểm tra xem backend có validate file ảnh hợp lệ không.
    *   **Ghi chú (Notes):** ________________________________________________

*   **[ ] TC-09: Admin phê duyệt / từ chối phê duyệt Voucher**
    *   **Mục đích/Yêu cầu GV:** Kiểm duyệt nội dung và chất lượng voucher trước khi bán (BR-ADM-03).
    *   **Hướng dẫn Test (Steps):**
        1. Đăng nhập Admin, truy cập mục "Quản lý Voucher" -> Tab "Chờ duyệt".
        2. Click xem chi tiết `Voucher Thử Nghiệm`.
        3. Thử nghiệm 1: Nhấn "Từ chối" và nhập lý do *"Hình ảnh chưa rõ ràng"*.
        4. Thử nghiệm 2: Sửa xong, nhấn "Phê duyệt".
    *   **Kết quả mong đợi (Expected):**
        - Khi từ chối: Trạng thái chuyển thành `Rejected`, ghi nhận lý do vào cột `rejected_reason`.
        - Khi phê duyệt: Trạng thái chuyển thành `Approved`, cập nhật thời gian vào cột `approved_at`. Voucher chính thức xuất hiện trên trang chủ Khách hàng.
    *   **Ghi chú (Notes):** ________________________________________________

#### B. Kiểm thử luồng ngoại lệ (Edge/Negative Testing)
*   **[ ] TC-10: Ràng buộc Giá bán phải nhỏ hơn Giá gốc (chk_price)**
    *   **Mục đích/Yêu cầu GV:** Ràng buộc nghiệp vụ bắt buộc của đồ án (RB-02).
    *   **Hướng dẫn Test (Steps):**
        1. Tạo voucher mới với Giá gốc = `100.000đ`, Giá bán = `120.000đ` (hoặc bằng nhau = `100.000đ`).
        2. Nhấn lưu voucher.
    *   **Kết quả mong đợi (Expected):** Hệ thống chặn ngay từ Frontend và Backend. CSDL PostgreSQL trả về lỗi vi phạm ràng buộc kiểm tra: `new row for relation "vouchers" violates check constraint "chk_price"`.
    *   **Ghi chú (Notes):** ________________________________________________

*   **[ ] TC-11: Ràng buộc Hạn sử dụng phải sau Ngày bắt đầu bán (chk_dates)**
    *   **Mục đích/Yêu cầu GV:** Ràng buộc logic thời hạn voucher (RB-03).
    *   **Hướng dẫn Test (Steps):**
        1. Tạo voucher với Ngày kết thúc là ngày trong quá khứ hoặc trước ngày bắt đầu bán.
        2. Nhấn lưu.
    *   **Kết quả mong đợi (Expected):** Backend chặn giao dịch và trả về lỗi vi phạm ràng buộc: `violates check constraint "chk_dates"`.
    *   **Gợi ý Test thêm:** Đặt số lượng tồn kho âm (`quantity_stock = -1`) hoặc lớn hơn tổng số lượng phát hành (`quantity_stock > total_quantity`) để kiểm tra constraint `chk_stock`.
    *   **Ghi chú (Notes):** ________________________________________________

---

### 📌 Nhóm Tính Năng 4: Giỏ hàng, Đặt hàng & Thanh toán (BR-CUS-05, BR-CUS-06, RB-15)

#### A. Kiểm thử chức năng (Functional Testing)
*   **[ ] TC-12: Khách mua hàng thành công và thanh toán giả lập**
    *   **Mục đích/Yêu cầu GV:** Hoàn tất luồng mua hàng và tự động phát hành mã E-Voucher duy nhất (BR-CUS-06, BR-CUS-07).
    *   **Hướng dẫn Test (Steps):**
        1. Đăng nhập tài khoản Khách hàng (`customer_daniel`).
        2. Chọn voucher `Buffet Hải Sản 5 Sao - Sheraton`, thêm vào giỏ hàng và tiến hành checkout.
        3. Điền thông tin người nhận, chọn phương thức "Thanh toán mô phỏng" và nhấn xác nhận thanh toán.
    *   **Kết quả mong đợi (Expected):** Đơn hàng được tạo ở trạng thái `Paid` (Đã thanh toán). Số lượng tồn kho (`quantity_stock`) của voucher giảm đi đúng bằng số lượng đã mua (Thỏa mãn RB-15). Hệ thống tự động sinh mã điện tử ngẫu nhiên duy nhất cho từng voucher đã mua trong bảng `E_Vouchers`.
    *   **Gợi ý Test thêm:** Kiểm tra tính duy nhất của mã E-Voucher trong CSDL. Mã E-Voucher code phải ngẫu nhiên, độ dài tối thiểu 8 ký tự và có tính bảo mật cao (Thỏa mãn RB-06).
    *   **Ghi chú (Notes):** ________________________________________________

#### B. Kiểm thử luồng ngoại lệ (Edge/Negative Testing)
*   **[ ] TC-13: Mua hàng vượt quá số lượng tồn kho (Race Condition / Over-purchasing)**
    *   **Mục đích/Yêu cầu GV:** Kiểm soát tồn kho, tránh bán khống sản phẩm (RB-04, RB-15, RISK-03).
    *   **Hướng dẫn Test (Steps):**
        1. Giả sử voucher `Combo Du Lịch SaPa` chỉ còn lại **3** sản phẩm trong kho.
        2. Khách hàng thêm **4** sản phẩm vào giỏ hàng và tiến hành đặt mua.
    *   **Kết quả mong đợi (Expected):** Trigger `trg_validate_order_item` trong database chặn giao dịch insert vào `Order_Items`. Hệ thống trả về thông báo lỗi: *"Số lượng tồn kho không đủ (Còn lại: 3)"*. Đồng thời rollback toàn bộ transaction tạo đơn hàng.
    *   **Ghi chú (Notes):** ________________________________________________

*   **[ ] TC-14: Thử nghiệm mua Voucher chưa được duyệt (status = 'Pending' / 'Rejected')**
    *   **Mục đích/Yêu cầu GV:** Bảo vệ tính đúng đắn của dữ liệu bán hàng (RB-01).
    *   **Hướng dẫn Test (Steps):**
        1. Lấy ID của một voucher đang chờ duyệt (`Pending`).
        2. Sử dụng công cụ Postman gửi request POST trực tiếp vào API tạo đơn hàng `/api/orders` với ID voucher trên.
    *   **Kết quả mong đợi (Expected):** Database kích hoạt trigger chặn đứng hành động này, trả về lỗi: *"Voucher chưa được duyệt hoặc đã bị vô hiệu hóa."*.
    *   **Ghi chú (Notes):** ________________________________________________

---

### 📌 Nhóm Tính Năng 5: Xác thực sử dụng E-Voucher (BR-PAR-05, BR-PAR-06, RB-09)

#### A. Kiểm thử chức năng (Functional Testing)
*   **[ ] TC-15: Đối tác xác thực mã E-Voucher thành công tại đúng Chi nhánh**
    *   **Mục đích/Yêu cầu GV:** Hoàn tất điểm chạm cuối cùng của vòng đời Voucher (BR-PAR-06, RB-09).
    *   **Hướng dẫn Test (Steps):**
        1. Sử dụng mã E-Voucher vừa nhận được ở TC-12 (ví dụ: `DLZ-SHER-0001` phát hành bởi Sheraton).
        2. Đăng nhập tài khoản đối tác phát hành (`sheraton_partner`).
        3. Vào mục "Xác thực mã", chọn chi nhánh sử dụng là `Sheraton Saigon`, nhập mã và ấn "Xác thực".
    *   **Kết quả mong đợi (Expected):** Hệ thống thông báo xác thực thành công. Trạng thái E-Voucher chuyển thành `Used`, ghi nhận thời gian `used_date` và ID chi nhánh đã sử dụng.
    *   **Ghi chú (Notes):** ________________________________________________

#### B. Kiểm thử luồng ngoại lệ (Edge/Negative Testing)
*   **[ ] TC-16: Xác thực lại mã E-Voucher đã sử dụng trước đó (Double Spending)**
    *   **Mục đích/Yêu cầu GV:** Ngăn chặn gian lận và sử dụng voucher quá hạn/nhiều lần (RB-07, RB-08).
    *   **Hướng dẫn Test (Steps):**
        1. Nhập lại mã `DLZ-SHER-0001` đã được dùng thành công ở TC-15.
        2. Nhấn "Xác thực".
    *   **Kết quả mong đợi (Expected):** Hệ thống báo lỗi: *"Voucher đã được sử dụng trước đó"* hoặc *"Mã không hợp lệ"*.
    *   **Ghi chú (Notes):** ________________________________________________

*   **[ ] TC-17: Xác thực mã E-Voucher của đối tác khác (Cross-partner Validation)**
    *   **Mục đích/Yêu cầu GV:** Đảm bảo tính bảo mật và phân quyền đối tác (RB-09).
    *   **Hướng dẫn Test (Steps):**
        1. Đăng nhập tài khoản đối tác `Glow Skin & Spa` (`glow_spa`).
        2. Nhập mã E-Voucher `DLZ-SHER-0001` (thuộc Sheraton).
        3. Nhấn "Xác thực".
    *   **Kết quả mong đợi (Expected):** Trigger `trg_validate_voucher_usage` chặn giao dịch và báo lỗi: *"Chi nhánh không thuộc quyền quản lý của đối tác phát hành voucher này."*.
    *   **Ghi chú (Notes):** ________________________________________________

---

### 📌 Nhóm Tính Năng 6: Đánh giá & Khiếu nại (BR-CUS-08, RB-10)

#### A. Kiểm thử chức năng (Functional Testing)
*   **[ ] TC-18: Đăng đánh giá (Review) cho Voucher đã mua**
    *   **Mục đích/Yêu cầu GV:** Đảm bảo quyền lợi khách hàng và tính xác thực của đánh giá (BR-CUS-08, RB-10).
    *   **Hướng dẫn Test (Steps):**
        1. Đăng nhập khách hàng `customer_daniel`.
        2. Mở voucher `Buffet Hải Sản 5 Sao - Sheraton` (đã mua thành công ở TC-12).
        3. Nhập đánh giá: `5 sao`, bình luận *"Trải nghiệm tuyệt vời"*. Nhấn gửi.
    *   **Kết quả mong đợi (Expected):** Đánh giá được lưu thành công vào bảng `Reviews`. Điểm trung bình của voucher cập nhật tương ứng.
    *   **Ghi chú (Notes):** ________________________________________________

#### B. Kiểm thử luồng ngoại lệ (Edge/Negative Testing)
*   **[ ] TC-19: Đánh giá ảo cho Voucher chưa từng mua**
    *   **Mục đích/Yêu cầu GV:** Chặn đánh giá ảo phá hoại uy tín đối tác (RB-10).
    *   **Hướng dẫn Test (Steps):**
        1. Dùng tài khoản `customer_minh` (chưa từng mua voucher của Sheraton).
        2. Cố tình gửi request POST trực tiếp vào endpoint `/api/reviews` với ID voucher Sheraton.
    *   **Kết quả mong đợi (Expected):** Trigger `trg_validate_review` chặn insert, ném ra lỗi CSDL: *"Bạn chỉ có thể đánh giá những voucher mà bạn đã mua."*.
    *   **Ghi chú (Notes):** ________________________________________________

---

### 📌 Nhóm Tính Năng 7: Nhật ký Hệ thống & Kiểm toán (BR-ADM-07, RB-12)

#### A. Kiểm thử chức năng (Functional Testing)
*   **[ ] TC-20: Tự động ghi System Logs khi Admin/Partner thao tác**
    *   **Mục đích/Yêu cầu GV:** Lưu vết hoạt động và nhật ký giao dịch phục vụ kiểm tra và truy vết (BR-ADM-07, RB-12).
    *   **Hướng dẫn Test (Steps):**
        1. Tiến hành một loạt hành động như: Khóa người dùng (TC-07), Phê duyệt Voucher (TC-09).
        2. Đăng nhập Admin, vào phân hệ "Nhật ký hệ thống" (System Logs).
    *   **Kết quả mong đợi (Expected):** Mỗi hành động nhạy cảm đều xuất hiện trong bảng `System_Logs` với đầy đủ thông tin: ID tài khoản thực hiện, nội dung hành động, tên bảng bị tác động (`Partners`, `Vouchers`, `Users`), ID bản ghi tương ứng và mốc thời gian chính xác (`created_at`).
    *   **Gợi ý Test thêm:** Kiểm tra tìm kiếm logs theo tên bảng hoặc theo hành động (ví dụ lọc `table_name = 'Vouchers'`) xem có hoạt động chính xác không.
    *   **Ghi chú (Notes):** ________________________________________________

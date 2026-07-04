# 🎬 KẾ HOẠCH DEMO ĐỒ ÁN DEALZY (PRODUCTION)

> Sàn TMĐT phân phối E-Voucher — demo trên môi trường đã deploy, không dùng localhost.
> **Thứ tự kịch bản: Khách hàng → Đối tác → Quản trị viên.**
> Phần kịch bản (mục 3) viết sẵn **lời thoại** — chỉ việc đọc; dòng *(Thao tác)* là nhắc thao tác trên màn hình.

---

## 0. Hạ tầng production

| Thành phần | URL | Nền tảng |
| :--- | :--- | :--- |
| **Customer** (khách hàng) | https://dealzy-pi.vercel.app/ | Vercel |
| **Partner** (đối tác) | https://partner-three-rho.vercel.app/ | Vercel |
| **Admin** (quản trị) | https://admin-ten-tawny-37.vercel.app/ | Vercel |
| **Backend API** | https://dealzy-server.onrender.com | Render |
| **Database** | Supabase PostgreSQL (ap-southeast-1) | Supabase |

Kiểm tra sống trước khi demo:
- `https://dealzy-server.onrender.com/health` → `{"status":"ok"}`
- `https://dealzy-server.onrender.com/health/db` → `"database":"ok"`

---

## 1. ⚠️ Chuẩn bị trước buổi demo (BẮT BUỘC ~10 phút trước)

- [ ] **Đánh thức backend Render (chống cold-start).** Gói free của Render cho backend "ngủ" sau ~15 phút không có request; lần gọi đầu có thể mất **30–60s**. Mở `…/health` vài lần cho tới khi phản hồi nhanh **ngay trước khi lên demo**; giữ thao tác đều để không ngủ lại.
- [ ] Mở sẵn **3 tab**: Customer / Partner / Admin. Đăng nhập trước Customer & Admin; để trống ô đăng nhập Partner nếu muốn demo đăng ký sống.
- [ ] Xác nhận **đăng nhập được TẤT CẢ vai trò** (đề phòng quên mật khẩu).
- [ ] Kiểm tra mạng phòng học (rủi ro lớn nhất khi demo production).
- [ ] Tắt extension trình duyệt gây log rác (Google Dịch / Ask Gemini).
- [ ] **Phương án dự phòng offline:** video demo (`SUBMISSION_PACKAGE/03_video/`) hoặc bản localhost, phòng khi mạng/Render trục trặc.

---

## 2. Tài khoản demo

| Vai trò | Tài khoản | Mật khẩu |
| :--- | :--- | :--- |
| **Khách hàng** | `customer_daniel` (Daniel Nguyen), `customer_minh`, `customer_lan`… | *(người trình bày giữ)* |
| **Đối tác đã duyệt** | `glow_spa` (Glow Skin & Spa), `sheraton_partner`, `hokkaido_sushi`… | *(người trình bày giữ)* |
| **Admin – SuperAdmin** | `admin` | *(người trình bày giữ)* |
| **Admin – phân quyền (RBAC)** | `partner_mod`, `voucher_mod`, `order_mgr`, `content_editor`, `support_agent` | `Dealzy@123` |

> 💡 **Sợi chỉ xuyên suốt:** ở Màn 1 hãy mua voucher của **Glow Skin & Spa** và **ghi lại mã E-Voucher** — sang Màn 2 dùng chính tài khoản `glow_spa` để **redeem** đúng mã đó.

---

## 3. Kịch bản demo (lời thoại đọc trực tiếp)

### 🎙️ Mở đầu *(~2 phút)*
> 🗣️ "Xin chào thầy/cô và các bạn. Nhóm em xin trình bày đồ án **Dealzy** — một sàn thương mại điện tử phân phối voucher giảm giá trực tuyến. Hệ thống gồm ba giao diện độc lập: trang **Khách hàng**, cổng **Đối tác** và trang **Quản trị**, tất cả dùng chung một cơ sở dữ liệu PostgreSQL, backend Node.js/Express theo kiến trúc module ba lớp. Toàn bộ đang chạy **thật trên production** — frontend trên Vercel, backend trên Render. Em sẽ demo lần lượt theo ba vai trò: đầu tiên là Khách hàng, sau đó Đối tác, và cuối cùng là Quản trị viên."

---

### 🟦 MÀN 1 — KHÁCH HÀNG *(~6 phút · app Customer)*

**1.1 · Đăng ký tài khoản** — *(BR-CUS-01)*
*(Thao tác: mở form đăng ký, nhập email/SĐT)*
> 🗣️ "Trước tiên là vai trò khách hàng. Người dùng mới đăng ký bằng email hoặc số điện thoại. Hệ thống kiểm tra trùng lặp ngay khi nhập và gửi một **mã OTP xác thực** — ở đây là OTP mô phỏng theo đúng yêu cầu đề bài."

**1.2 · Đăng nhập & hồ sơ** — *(BR-CUS-02)*
*(Thao tác: đăng nhập, mở trang Hồ sơ)*
> 🗣️ "Sau khi đăng nhập, khách hàng quản lý được hồ sơ cá nhân. Nếu quên mật khẩu, hệ thống hỗ trợ khôi phục qua OTP gửi về email hoặc số điện thoại."

**1.3 · Tìm kiếm & lọc** — *(BR-CUS-03)*
*(Thao tác: gõ từ khóa, mở bộ lọc danh mục Sức khỏe & Làm đẹp)*
> 🗣️ "Đây là trang chủ. Khách có thể tìm theo từ khóa, hoặc lọc theo **danh mục, khu vực, khoảng giá và đối tác**. Em thử lọc nhóm Sức khỏe & Làm đẹp."

**1.4 · Chi tiết voucher** — *(BR-CUS-04)*
*(Thao tác: mở một voucher của Glow Skin & Spa)*
> 🗣️ "Vào chi tiết một voucher, ta thấy đầy đủ **giá gốc, giá bán, điều kiện áp dụng, danh sách chi nhánh**, và phần **đánh giá** từ những khách đã mua trước đó."

**1.5 · Giỏ hàng** — *(BR-CUS-05)*
*(Thao tác: Thêm vào giỏ, mở giỏ hàng)*
> 🗣️ "Em thêm voucher vào giỏ. Trong giỏ có thể tăng giảm số lượng, xóa, và xem tổng tiền tạm tính."

**1.6 · Checkout** — *(BR-CUS-06)*
*(Thao tác: điền thông tin / bật Tặng quà, chọn cổng thanh toán)*
> 🗣️ "Tiến hành thanh toán. Khách điền thông tin người nhận — hoặc chọn **tặng quà** cho người khác. Hệ thống hỗ trợ nhiều cổng thanh toán mô phỏng: **VietQR, MoMo, VNPay và PayPal**."

**1.7 · Nhận E-Voucher** — *(BR-CUS-07 · RB-05)*
*(Thao tác: bấm thanh toán thành công → mở "Voucher của tôi" → GHI LẠI MÃ)*
> 🗣️ "Em bấm thanh toán thành công. Ngay khi đơn chuyển sang **Đã thanh toán**, hệ thống mới sinh ra **mã E-Voucher kèm QR**. Đây là một quy tắc nghiệp vụ quan trọng: **mã chỉ phát hành sau khi thanh toán thành công**. Em lưu lại mã này — lát nữa bên đối tác sẽ quét để xác thực."

**1.8 · Đánh giá & khiếu nại** — *(BR-CUS-08 · RB-10)*
*(Thao tác: chấm sao + bình luận; gửi một khiếu nại)*
> 🗣️ "Sau khi mua, khách có thể **đánh giá** voucher và **gửi khiếu nại** nếu gặp vấn đề. Lưu ý: hệ thống **chỉ cho đánh giá nếu khách đã thực sự mua** — ràng buộc này được đảm bảo ngay ở tầng cơ sở dữ liệu bằng trigger."

---

### 🟩 MÀN 2 — ĐỐI TÁC *(~5 phút · app Partner)*

**2.1 · Đăng ký đối tác** — *(BR-PAR-01)*
*(Thao tác: điền form đăng ký doanh nghiệp + chi nhánh, gửi)*
> 🗣️ "Bây giờ em chuyển sang vai trò **Đối tác**. Một doanh nghiệp muốn bán voucher sẽ đăng ký tại đây: thông tin công ty, người đại diện pháp lý, mã số thuế và **ít nhất một chi nhánh**. Sau khi gửi, hồ sơ ở trạng thái **Chờ duyệt** — chưa đăng nhập được cho tới khi admin phê duyệt. Lát nữa em sẽ duyệt chính hồ sơ này bên trang Admin."

**2.2 · Đăng nhập đối tác đã duyệt** — *(BR-PAR-01)*
*(Thao tác: đăng nhập `glow_spa`, mở Hồ sơ)*
> 🗣️ "Để demo tiếp các chức năng, em đăng nhập bằng một đối tác **đã được duyệt** — Glow Skin & Spa. Đây là hồ sơ doanh nghiệp và danh sách chi nhánh của họ."

**2.3 · Tạo voucher** — *(BR-PAR-02/03 · RB-02)*
*(Thao tác: điền form tạo voucher, gửi duyệt)*
> 🗣️ "Đối tác tạo một chương trình voucher mới: tiêu đề, giá gốc, giá bán, số lượng phát hành, thời gian bán và sử dụng, chọn chi nhánh áp dụng. Lưu ý hệ thống **bắt buộc giá bán nhỏ hơn giá gốc** — nếu vi phạm sẽ bị chặn ngay. Sau khi lưu, voucher ở trạng thái **Chờ duyệt**."

**2.4 · Quản lý voucher** — *(BR-PAR-04)*
*(Thao tác: mở tab quản lý voucher)*
> 🗣️ "Trong tab quản lý, đối tác theo dõi được **tồn kho, số đã bán và số đã sử dụng** của từng chương trình."

**2.5 · Xác thực E-Voucher** — *(BR-PAR-05)*
*(Thao tác: nhập/quét đúng mã đã mua ở bước 1.7)*
> 🗣️ "Đây là chức năng xác thực. Em nhập — hoặc quét QR — chính **mã E-Voucher mà khách vừa mua ở phần trước**. Hệ thống kiểm tra mã còn hạn, đúng chi nhánh áp dụng và thuộc đơn đã thanh toán."

**2.6 · Redeem** — *(BR-PAR-06 · RB-07/08/09)*
*(Thao tác: bấm Xác nhận đã sử dụng)*
> 🗣️ "Mã hợp lệ, em bấm **Xác nhận đã sử dụng**. Trạng thái chuyển sang **Đã dùng** và không thể dùng lại. Đối tác chỉ xác thực được voucher **đúng chi nhánh của mình** — ràng buộc này cũng nằm ở tầng database."

**2.7 · Dashboard đối tác** — *(BR-PAR-07)*
*(Thao tác: mở Dashboard)*
> 🗣️ "Cuối cùng là dashboard đối tác: **doanh thu, số phát hành, số đã bán và tỷ lệ sử dụng**, trực quan bằng biểu đồ."

---

### 🟥 MÀN 3 — QUẢN TRỊ VIÊN *(~4 phút · app Admin)*

*(Thao tác: đăng nhập SuperAdmin `admin`)*
> 🗣️ "Phần cuối là vai trò **Quản trị viên**. Em đăng nhập bằng tài khoản Super Admin."

**3.1 · Duyệt đối tác** — *(BR-ADM-02)*
*(Thao tác: Duyệt đối tác → Approve hồ sơ tạo ở 2.1)*
> 🗣️ "Đầu tiên, **duyệt đối tác**. Đây chính là hồ sơ doanh nghiệp em vừa đăng ký ở phần trước, đang chờ duyệt. Em phê duyệt — hệ thống gửi email thông báo, và từ giờ đối tác này đăng nhập được."

**3.2 · Duyệt voucher** — *(BR-ADM-03)*
*(Thao tác: Voucher → Approve voucher tạo ở 2.3)*
> 🗣️ "Tiếp theo, **duyệt voucher**. Voucher Glow Spa vừa tạo đang chờ. Admin có thể duyệt, từ chối kèm lý do, hoặc tạm ẩn. Em duyệt — voucher chính thức lên sàn cho khách mua."

**3.3 · Quản lý người dùng** — *(BR-ADM-01)*
*(Thao tác: tìm kiếm, khóa/mở một tài khoản)*
> 🗣️ "Trang **quản lý người dùng**: admin tìm kiếm, lọc và **khóa/mở khóa** tài khoản khách hàng hoặc đối tác khi cần."

**3.4 · Quản lý đơn hàng** — *(BR-ADM-04)*
*(Thao tác: mở một đơn, xem tùy chọn hoàn tiền)*
> 🗣️ "**Quản lý đơn hàng**: tra cứu mọi đơn, xác nhận thanh toán thủ công với đơn VietQR, và xử lý hoàn tiền. Khi hoàn tiền toàn bộ, hệ thống **tự động hoàn lại tồn kho và khóa các E-Voucher** liên quan."

**3.5 · Xử lý khiếu nại** — *(BR-ADM-04)*
*(Thao tác: mở khiếu nại gửi ở 1.8)*
> 🗣️ "Đây là **khiếu nại** mà khách gửi ở phần đầu. Admin có thể phản hồi, hoàn tiền, hoặc **cấp một mã voucher mới để bồi thường** cho khách."

**3.6 · Quản lý nội dung (CMS)** — *(BR-ADM-05)*
*(Thao tác: sửa một trang, xem preview)*
> 🗣️ "**Quản lý nội dung**: các trang tĩnh như chính sách, hướng dẫn được biên tập theo mẫu có cấu trúc, **xem trước trực tiếp** trước khi xuất bản, và mọi thay đổi đều được lưu vết."

**3.7 · Dashboard quản trị** — *(BR-ADM-06)*
*(Thao tác: mở Tổng quan)*
> 🗣️ "**Dashboard tổng quan**: doanh thu và lượng tài khoản mới theo tháng, quý, năm."

**3.8 · Nhật ký hệ thống** — *(BR-ADM-07 · RB-12)*
*(Thao tác: mở Nhật ký)*
> 🗣️ "Và **nhật ký hệ thống** — mọi thao tác quan trọng của admin đều được **ghi vết tự động**, phục vụ truy vết và kiểm toán."

**3.★ · Phân quyền Admin (RBAC)** — *(BR-ADM-08)* 🆕
*(Thao tác: panel Phân quyền → sau đó đăng nhập `voucher_mod`)*
> 🗣️ "Điểm nhấn cuối cùng là cơ chế **phân quyền quản trị**. Không phải admin nào cũng có toàn quyền. Tại đây, Super Admin có thể **tạo admin mới, gán phạm vi quản trị** cho từng người, và **khóa/mở** họ."
>
> 🗣️ *(sau khi đăng nhập `voucher_mod`)* "Em đăng nhập bằng một admin **chỉ phụ trách voucher**. Các bạn thấy: menu bên trái giờ **chỉ còn Tổng quan và Voucher** — những phần ngoài quyền đã bị ẩn hoàn toàn."
>
> 🗣️ *(gõ thẳng URL /orders)* "Nếu em cố tình gõ thẳng đường dẫn tới trang Đơn hàng, hệ thống chặn lại bằng màn hình **Không đủ quyền**. Và kể cả gọi thẳng API, backend cũng trả về lỗi **403**. Tức là quyền được kiểm soát ở **cả ba lớp**: ẩn menu, chặn đường dẫn, và chốt chặn ở server."

---

### 🎙️ Kết thúc
> 🗣️ "Đó là toàn bộ demo của nhóm em — trọn vẹn vòng đời voucher từ **Khách hàng**, **Đối tác** đến **Quản trị viên**, chạy thật trên môi trường production. Em xin cảm ơn và sẵn sàng trả lời câu hỏi của thầy/cô."

---

## 4. Câu trả lời kỹ thuật khi bị hỏi

- **Chống bán vượt tồn (race condition):** transaction + `SELECT … FOR UPDATE` khóa dòng voucher khi thanh toán.
- **Ràng buộc tại tầng DB:** trigger `trg_validate_review` (chỉ review sau khi mua), `trg_validate_voucher_usage` (đúng chi nhánh + đơn Paid), CHECK giá/tồn/ngày.
- **Mã E-Voucher:** sinh ngẫu nhiên `DLZ`+9 ký tự, ràng buộc UNIQUE + retry.
- **RBAC:** tách *authentication* / *authorization*, cột `admin_scope` + middleware `requireScope`, JWT mang scope.
- **CMS an toàn:** nội dung JSON có cấu trúc + bản nháp/publish + lưu vết before/after (`Content_Item_Revisions`).
- **Bảo mật:** JWT access/refresh riêng, bcrypt, helmet, rate-limit, CORS allowlist, kiểm tra `is_active` mỗi request.

---

## 5. Timing gợi ý (~18 phút)

| Phần | Thời lượng |
| :--- | :--- |
| Mở đầu — giới thiệu kiến trúc | 2' |
| **Màn 1 — Khách hàng** | 6' |
| **Màn 2 — Đối tác** (gồm đăng ký) | 5' |
| **Màn 3 — Admin** (gồm RBAC) | 4' |
| Q&A | 1' |

---

## 6. Rủi ro production & cách xử lý

| Rủi ro | Phòng ngừa |
| :--- | :--- |
| **Backend Render ngủ** → thao tác đầu chậm 30–60s | Đánh thức `/health` trước; giữ thao tác đều |
| **Mạng phòng học chập chờn** | Chuẩn bị video demo / bản localhost dự phòng |
| **Đăng ký đối tác sống bị lỗi (2.1)** | Chuyển thẳng sang đối tác đã duyệt; hoặc seed sẵn 1 đối tác Pending dự phòng |
| **Quên mật khẩu tài khoản** | Xác nhận đăng nhập được tất cả vai trò từ trước |
| **Tự khóa nhầm admin** | Không thao tác khóa trên chính tài khoản đang đăng nhập |

---

*Ghi chú: Production dùng chung một Supabase DB; mọi dữ liệu seed (đánh giá, đơn hàng demo, tài khoản admin mẫu) đều đang sống trên môi trường này.*

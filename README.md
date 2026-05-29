# Dealzy - Hệ thống Quản lý và Phân phối Voucher 🚀

Chào mừng bạn đến với dự án **Dealzy**, một nền tảng thương mại điện tử chuyên về voucher giảm giá. Đây là tài liệu hướng dẫn tổng quan về kiến trúc và cách thức tổ chức dự án cho các thành viên trong nhóm.

## 🏗 Kiến trúc Hệ thống (Architecture)

Dự án được xây dựng theo kiến trúc **Decoupled Monorepo**, phân tách rõ ràng giữa các thành viên để tối ưu hóa việc làm việc nhóm:

### 1. Frontend (application/client)

Được chia thành 3 ứng dụng React độc lập chạy trên các cổng khác nhau:

- **Customer (`/customer`)**: Giao diện cho người mua voucher (Hotdeal style).
- **Partner (`/partner`)**: Cổng thông tin dành cho đối tác đăng bán và quản lý voucher.
- **Admin (`/admin`)**: Hệ thống quản trị nội bộ để phê duyệt đối tác và điều phối hệ thống.

### 2. Backend (application/server)

Sử dụng **Node.js/Express** với cấu trúc **Modular (Module-based)**:

- Mỗi tính năng (Admin, Customer, Partner, Auth) có một thư mục riêng chứa đầy đủ Route, Controller và Service.
- Giúp các thành viên có thể code độc lập mà không gây xung đột (conflict) mã nguồn.

### 3. Cấu trúc thư mục chi tiết (`application/`)

```text
application/
├── client/                 # Chứa mã nguồn phía người dùng (Frontend)
│   ├── admin/              # Dashboard dành cho quản trị viên (Quản lý đối tác, Voucher)
│   ├── customer/           # Giao diện dành cho khách hàng (Xem, mua và sử dụng voucher)
│   └── partner/            # Giao diện dành cho đối tác (Đăng voucher, quản lý cửa hàng)
└── server/                 # Chứa mã nguồn phía máy chủ (Backend)
    ├── config/             # Cấu hình kết nối Database, Cloudinary, v.v.
    ├── middleware/         # Các bộ lọc xác thực (JWT), phân quyền (Admin/Partner)
    ├── modules/            # Các tính năng chính được Module hóa (Tránh xung đột code)
    │   ├── admin/          # Xử lý các yêu cầu từ phía Quản trị viên
    │   ├── auth/           # Quản lý Đăng ký, Đăng nhập, Profile, Đổi mật khẩu
    │   ├── customer/       # Xử lý các logic riêng cho khách hàng
    │   ├── partner/        # Xử lý các logic riêng cho đối tác
    │   └── shared/         # Các API dùng chung (Tìm kiếm voucher, xem danh mục)
    ├── utils/              # Các hàm hỗ trợ (Gửi Email khôi phục, SMS OTP)
    └── index.js            # File khởi chạy chính của Server
```

> [!IMPORTANT]
> **Quy tắc 3 lớp (3-Tier Architecture) trong Modules**: Để đảm bảo tính bảo trì và mở rộng, tất cả các module trong `server/modules/` **bắt buộc** phải tuân thủ quy tắc 3 lớp:
>
> 1. **Routes**: Chỉ định nghĩa các endpoint và gắn middleware. Không viết logic xử lý tại đây.
> 2. **Controllers**: Nhận dữ liệu từ request, điều phối gọi đến Service và trả về response cho Client (JSON, Status code).
> 3. **Services**: Nơi chứa toàn bộ logic xử lý nghiệp vụ, truy vấn database và xử lý dữ liệu. Tuyệt đối không gọi trực tiếp Database từ Controller.

### 4. Database

Sử dụng **PostgreSQL** làm cơ sở dữ liệu chính, được chia sẻ chung cho toàn bộ hệ thống.

---

## 📂 Giải thích cấu trúc thư mục

| Thư mục/File               | Tác dụng                                                                                                                                                                                       |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`application/`**         | Chứa toàn bộ mã nguồn của hệ thống (Client & Server).                                                                                                                                          |
| **`documents/`**           | Chứa các tài liệu chuyên môn (Phân tích, Thiết kế, Proposal, Kiểm thử) viết bằng LaTeX.                                                                                                        |
| **`Requirement/`**         | Chứa hình ảnh chi tiết của từng chương trong đề bài. **Tác dụng:** Dùng để các AI Agent quét và kiểm tra lại yêu cầu của đề bài, đảm bảo code đúng chức năng.                                  |
| **`scriptDatabase&ERD/`**  | Chứa file script SQL tạo bảng và các sơ đồ thực thể mối quan hệ (ERD).                                                                                                                         |
| **`FIT_HCMUS_EC_...docx`** | File đề bài chính thức của giảng viên. **Tác dụng:** Ở giai đoạn hoàn thiện, các thành viên sẽ sử dụng file này để đối chiếu, đánh dấu những phần đã hoàn thành và chưa hoàn thành để báo cáo. |

---

## 🛠 Hướng dẫn cho thành viên mới

1.  **Clone dự án**: `git clone <repository_url>`
2.  **Cài đặt**: Vào từng thư mục (`server`, `customer`, `partner`, `admin`) và chạy lệnh `npm install`.
3.  **Biến môi trường**: Tạo file `.env` dựa trên file `.env-sample` trong thư mục server.
4.  **Chạy dự án**: Sử dụng lệnh `npm run dev` trong từng thư mục tương ứng.

---

_Chúc nhóm chúng ta hoàn thành xuất sắc đồ án!_ 🎯

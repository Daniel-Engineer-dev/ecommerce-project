# Kế hoạch nâng cấp chức năng quản lý nội dung admin

## 1. Mục tiêu

Chuyển các nội dung đang hard-code ở customer sang nội dung quản trị được từ admin:

- Trung tâm hỗ trợ: `/support`
- Hướng dẫn sử dụng: `/guide`
- Hoàn tiền: `/refund-policy`
- Điều khoản: `/terms`
- Banner/trang chủ: `/`

Admin có thể:

- Chọn mục nội dung cần chỉnh.
- Xem preview giao diện tương ứng với customer.
- Chỉnh nội dung theo từng field có cấu trúc.
- Lưu thay đổi.
- Customer nhìn thấy nội dung mới ở đúng trang tương ứng.
- Mọi thao tác admin được ghi vết.

## 2. Đánh giá khả thi

Khả thi, nhưng không nên làm theo cách chỉ lưu một textarea `body` duy nhất.

Lý do:

- Các trang customer hiện không chỉ là text dài, mà có nhiều block UI khác nhau: hero, card, roadmap, checklist, contact list, CTA, banner.
- Nếu chỉ lưu HTML trong `body`, admin khó chỉnh từng phần, preview khó khớp UI, và dễ tạo HTML hỏng.
- Cách tốt hơn là lưu nội dung dạng JSON có cấu trúc theo từng template trang.

Đề xuất:

- Giữ bảng `Content_Items` hiện tại để tương thích.
- Bổ sung field JSON cho nội dung có cấu trúc.
- Customer page đọc content từ API; nếu chưa có content thì dùng fallback hard-code hiện tại.
- Admin page dùng cùng schema JSON để render preview giống customer.

## 3. Nội dung hiện đang hard-code

### 3.1. Trung tâm hỗ trợ

File hiện tại:

```txt
application/client/customer/src/pages/Support.jsx
```

Nội dung cần quản lý:

- Hero badge
- Hero title
- Hero description
- Các support cards
- Kênh liên hệ: hotline, email, link hướng dẫn

Content key đề xuất:

```txt
support-center
```

### 3.2. Hướng dẫn sử dụng

File hiện tại:

```txt
application/client/customer/src/pages/UserGuide.jsx
```

Nội dung cần quản lý:

- Hero badge
- Hero title
- Hero description
- Roadmap nhiều bước
- Mỗi bước gồm phase, title, text, checklist
- Quick tips
- CTA cuối trang

Content key đề xuất:

```txt
user-guide
```

### 3.3. Chính sách hoàn tiền

File hiện tại:

```txt
application/client/customer/src/pages/RefundPolicy.jsx
```

Nội dung cần quản lý:

- Hero badge
- Hero title
- Hero description
- Các section chính sách: title + paragraph

Content key đề xuất:

```txt
refund-policy
```

### 3.4. Điều khoản dịch vụ

File hiện tại:

```txt
application/client/customer/src/pages/TermsOfService.jsx
```

Nội dung cần quản lý:

- Hero badge
- Hero title
- Hero description
- Các section điều khoản: title + paragraph

Content key đề xuất:

```txt
terms-of-service
```

### 3.5. Banner/trang chủ

File hiện tại:

```txt
application/client/customer/src/pages/Home.jsx
```

Nội dung cần quản lý:

- Hero eyebrow/badge
- Hero title
- Hero description
- CTA chính/phụ
- Proof stats
- Hero tiles
- Banner/deal highlight nếu cần

Content key đề xuất:

```txt
home-banner
```

## 4. Thay đổi database đề xuất

Hiện tại `Content_Items` đã có:

```txt
content_key
title
type
body
is_active
slug
summary
thumbnail_url
status
published_at
created_by
updated_by
created_at
updated_at
```

Đề xuất bổ sung:

```sql
ALTER TABLE content_items
  ADD COLUMN IF NOT EXISTS template VARCHAR(50),
  ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
```

Tạo bảng revision để ghi vết nội dung trước/sau:

```sql
CREATE TABLE IF NOT EXISTS content_item_revisions (
  revision_id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES content_items(content_id) ON DELETE CASCADE,
  content_key VARCHAR(80) NOT NULL,
  action VARCHAR(50) NOT NULL,
  before_data JSONB,
  after_data JSONB,
  before_status VARCHAR(30),
  after_status VARCHAR(30),
  changed_by INTEGER REFERENCES users(user_id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Vẫn tiếp tục ghi vào `System_Logs` để màn hình nhật ký hiện tại thấy được hành động.

## 5. Content schema đề xuất

### 5.1. Static policy schema

Dùng cho:

- `refund-policy`
- `terms-of-service`

```json
{
  "hero": {
    "badge": "Pháp lý",
    "title": "Điều khoản dịch vụ",
    "description": "Các điều khoản áp dụng..."
  },
  "sections": [
    {
      "title": "Chấp nhận điều khoản",
      "body": "Khi sử dụng Dealzy..."
    }
  ]
}
```

### 5.2. Support schema

```json
{
  "hero": {
    "badge": "Hỗ trợ khách hàng",
    "title": "Trung tâm hỗ trợ Dealzy",
    "description": "Tìm câu trả lời nhanh..."
  },
  "cards": [
    {
      "icon": "Search",
      "title": "Tìm voucher phù hợp",
      "text": "Dùng thanh tìm kiếm..."
    }
  ],
  "contact": {
    "title": "Kênh liên hệ",
    "description": "Nếu cần hỗ trợ trực tiếp...",
    "phone": "1900 6789",
    "email": "support@dealzy.vn",
    "guideLinkText": "Xem hướng dẫn sử dụng"
  }
}
```

### 5.3. User guide schema

```json
{
  "hero": {
    "badge": "Roadmap sử dụng",
    "title": "Lộ trình mua và sử dụng voucher trên Dealzy",
    "description": "Đi theo từng bước..."
  },
  "roadmap": [
    {
      "phase": "Bước 01",
      "icon": "UserRound",
      "title": "Đăng nhập hoặc tạo tài khoản",
      "text": "Tạo tài khoản khách hàng...",
      "checklist": [
        "Điền đúng email hoặc số điện thoại",
        "Cập nhật thông tin cá nhân"
      ]
    }
  ],
  "quickTips": [
    {
      "icon": "ShieldCheck",
      "title": "Trước khi mua",
      "text": "Luôn đọc điều kiện áp dụng..."
    }
  ],
  "cta": {
    "title": "Cần hỗ trợ trong quá trình mua voucher?",
    "description": "Trung tâm hỗ trợ có thể giúp...",
    "buttonText": "Đến trung tâm hỗ trợ",
    "buttonUrl": "/support"
  }
}
```

### 5.4. Home banner schema

```json
{
  "hero": {
    "badge": "Voucher verified by Dealzy",
    "title": "Săn voucher xịn, tận hưởng nhiều hơn",
    "description": "Dealzy chọn lọc voucher...",
    "primaryCtaText": "Khám phá deal",
    "primaryCtaUrl": "/search"
  },
  "proofs": [
    {
      "value": "100%",
      "label": "Voucher đã duyệt"
    }
  ],
  "tiles": [
    {
      "title": "Lựa chọn có gu",
      "copy": "Chỉ hiển thị voucher đã duyệt..."
    }
  ]
}
```

## 6. Luồng admin đề xuất

### 6.1. Layout mới

Trang admin `/content` nên đổi từ form + table sang layout 3 vùng:

```txt
[Danh mục nội dung]  [Preview customer page]  [Editor]
```

Nếu cần giữ đúng ý "panel bên trái":

- Panel trái trên cùng: danh sách mục nội dung.
- Sau khi click một mục, phần lớn bên trái/giữa hiển thị preview trang customer.
- Panel phải là form chỉnh sửa.

Các mục cố định:

```txt
Trung tâm hỗ trợ
Hướng dẫn sử dụng
Hoàn tiền
Điều khoản
Banner trang chủ
```

### 6.2. Khi admin click một mục

Frontend:

```txt
GET /api/admin/content/:contentKey
```

Nếu chưa có record trong DB:

- Backend trả về default content theo template.
- Admin có thể lưu để tạo record lần đầu.

Admin UI:

- Load đúng template editor.
- Render preview bằng data hiện tại.
- Preview dùng style gần giống customer.
- Có trạng thái: `Đã publish`, `Bản nháp`, `Đang ẩn`.

### 6.3. Khi admin chỉnh nội dung

Editor không nên là một textarea duy nhất.

Nên dùng form theo cấu trúc:

- Hero fields: badge/title/description.
- Danh sách sections/cards/steps.
- Nút thêm/xóa/sắp xếp item.
- Toggle hiển thị.
- Nút lưu.

### 6.4. Khi admin nhấn lưu

Frontend gọi:

```txt
PUT /api/admin/content/:contentKey
```

Payload:

```json
{
  "title": "Trung tâm hỗ trợ Dealzy",
  "template": "support",
  "status": "published",
  "isActive": true,
  "data": {}
}
```

Backend:

- Validate admin role.
- Lấy bản cũ.
- Upsert bản mới.
- Tăng `version`.
- Ghi `content_item_revisions`.
- Ghi `System_Logs`.
- Trả về content mới.

## 7. Luồng customer đề xuất

Mỗi page customer chuyển từ hard-code sang:

```txt
Fetch content by key
Nếu có content published -> render content từ DB
Nếu lỗi hoặc chưa có content -> render fallback hard-code hiện tại
```

API customer/public:

```txt
GET /api/content/public/:key
```

Mapping:

```txt
/support        -> support-center
/guide          -> user-guide
/refund-policy  -> refund-policy
/terms          -> terms-of-service
/               -> home-banner
```

Lưu ý:

- Không nên làm page trắng nếu API lỗi.
- Fallback hard-code giúp rollout an toàn.
- Sau khi ổn định có thể bỏ fallback ở phase sau.

## 8. Ghi vết hành động admin

Hiện tại đã có:

```txt
System_Logs
logAction()
```

Nhưng để đáp ứng yêu cầu "mọi hành động đều phải được ghi vết", cần bổ sung:

- Khi admin mở/chọn mục nội dung: có thể không bắt buộc log vì chỉ là read.
- Khi admin tạo mới content: log `CREATE_CONTENT_ITEM`.
- Khi admin cập nhật content: log `UPDATE_CONTENT_ITEM`.
- Khi admin publish: log `PUBLISH_CONTENT_ITEM`.
- Khi admin ẩn content: log `ARCHIVE_CONTENT_ITEM`.
- Khi admin reset về mặc định: log `RESET_CONTENT_ITEM`.

Nên lưu revision chi tiết vào `content_item_revisions`, vì `System_Logs` hiện chỉ ghi action/table/record, không ghi trước/sau.

## 9. API backend cần thêm/sửa

Admin:

```txt
GET  /api/admin/content/templates
GET  /api/admin/content/:contentKey
PUT  /api/admin/content/:contentKey
POST /api/admin/content/:contentKey/publish
POST /api/admin/content/:contentKey/archive
GET  /api/admin/content/:contentKey/revisions
```

Public/customer:

```txt
GET /api/content/public/:key
```

Có thể giữ API cũ:

```txt
GET  /api/admin/content
POST /api/admin/content
```

để không phá trang cũ trong quá trình chuyển đổi.

## 10. Frontend admin cần làm

File chính:

```txt
application/client/admin/src/pages/ContentManagement.jsx
```

Tách component:

```txt
ContentSidebar.jsx
ContentPreview.jsx
ContentEditor.jsx
editors/SupportEditor.jsx
editors/UserGuideEditor.jsx
editors/PolicyEditor.jsx
editors/HomeBannerEditor.jsx
previews/SupportPreview.jsx
previews/UserGuidePreview.jsx
previews/PolicyPreview.jsx
previews/HomeBannerPreview.jsx
```

Nếu muốn nhanh hơn, có thể đặt tạm trong cùng `ContentManagement.jsx`, nhưng nên tách nếu implement chính thức.

## 11. Frontend customer cần làm

Các file cần chuyển sang dynamic content:

```txt
application/client/customer/src/pages/Support.jsx
application/client/customer/src/pages/UserGuide.jsx
application/client/customer/src/pages/RefundPolicy.jsx
application/client/customer/src/pages/TermsOfService.jsx
application/client/customer/src/pages/Home.jsx
```

Tạo helper:

```txt
application/client/customer/src/hooks/usePublicContent.js
application/client/customer/src/content/defaultContent.js
```

Mục tiêu:

- Fetch content từ API.
- Nếu lỗi thì dùng default content.
- Render cùng layout hiện tại.

## 12. Thứ tự implement đề xuất

### Phase 1: Nền tảng backend

- Thêm cột `template`, `data`, `version`.
- Thêm bảng `content_item_revisions`.
- Thêm service validate/upsert content theo key.
- Thêm API admin get/update content by key.
- Thêm ghi revision + system log.

### Phase 2: Default content seed

- Tạo default JSON cho 5 mục:
  - `support-center`
  - `user-guide`
  - `refund-policy`
  - `terms-of-service`
  - `home-banner`
- Có thể seed vào DB hoặc trả fallback từ backend nếu DB chưa có.

### Phase 3: Customer dynamic rendering

- Chuyển `Support.jsx` sang dùng API + fallback.
- Chuyển `RefundPolicy.jsx`.
- Chuyển `TermsOfService.jsx`.
- Chuyển `UserGuide.jsx`.
- Chuyển phần banner `Home.jsx`.

Ưu tiên làm các trang policy đơn giản trước, sau đó mới tới guide/home vì phức tạp hơn.

### Phase 4: Admin content UI mới

- Thay table bằng danh mục cố định.
- Click danh mục load content.
- Render preview theo template.
- Render editor theo template.
- Lưu thay đổi.
- Hiển thị trạng thái và version.

### Phase 5: Ghi vết và kiểm thử

- Kiểm tra `System_Logs`.
- Kiểm tra `content_item_revisions`.
- Test admin sửa từng mục.
- Test customer thấy nội dung mới.
- Test fallback khi API lỗi.

## 13. Rủi ro và cách giảm rủi ro

### Rủi ro 1: Preview admin không giống 100% customer

Cách giảm:

- Dùng cùng data schema.
- Tái sử dụng class CSS gần giống customer.
- Nếu cần giống tuyệt đối, phase sau có thể preview bằng iframe trỏ sang customer route kèm preview token/draft id.

### Rủi ro 2: Nội dung JSON sai cấu trúc

Cách giảm:

- Không cho admin nhập JSON thô.
- Editor theo field.
- Backend validate schema cơ bản trước khi lưu.

### Rủi ro 3: Customer trắng trang khi content lỗi

Cách giảm:

- Luôn có fallback hard-code/default content.
- Public API chỉ là nguồn override.

### Rủi ro 4: Ghi vết chưa đủ chi tiết

Cách giảm:

- `System_Logs` ghi action tổng quát.
- `content_item_revisions` ghi before/after data.

## 14. Tiêu chí hoàn thành

- Admin nhìn thấy 5 mục nội dung cố định.
- Admin click từng mục và thấy preview tương ứng.
- Admin chỉnh field nội dung và lưu được.
- Customer thấy nội dung đã cập nhật ở đúng page.
- Nội dung không bị mất layout customer hiện tại.
- Mọi thao tác lưu/publish/ẩn/reset có log.
- Có revision lưu before/after để đối soát.
- Nếu API content lỗi, customer vẫn thấy fallback thay vì trang trắng.

## 15. Kết luận

Nên implement theo hướng content có cấu trúc bằng JSON template, không nên dùng một textarea HTML duy nhất. Cách này mất công hơn ở bước đầu nhưng phù hợp với yêu cầu preview đúng giao diện customer, chỉnh từng phần rõ ràng, và an toàn hơn cho admin không chuyên kỹ thuật.

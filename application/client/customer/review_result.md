# Review phan he khach hang

Ngay review: 2026-05-25

Pham vi doi chieu:
- Requirement: BR-CUS-01 den BR-CUS-08, cac rule RB lien quan den mua hang, phat hanh e-voucher, ton kho, danh gia va su dung voucher.
- Database: `scriptDatabase&ERD/dealzy_database.sql`.
- Source customer: `application/client/customer`.
- API lien quan: `application/server/modules/auth`, `application/server/modules/shared`, `application/server/modules/customer`.

## Ket luan tong quan

Phan he khach hang hien da hoan thien khoang **72%** so voi requirement.

Ly do chinh:
- Da co day du luong co ban: dang ky/dang nhap, cap nhat ho so, quen/doi mat khau, tim kiem voucher, xem chi tiet, gio hang, checkout, thanh toan mo phong, phat hanh va xem e-voucher, danh gia voucher da mua.
- Database da co cau truc tuong doi day du cho customer: `users`, `customers`, `vouchers`, `orders`, `order_items`, `e_vouchers`, `reviews`, `complaints`, `complaint_responses`.
- Tuy nhien phan hoan thien nghiep vu chua that chat: chua co khieu nai/phan hoi tren UI/API customer, chua co lich su don hang dung nghia, chua co QR that cho e-voucher, chua co xac thuc so huu order khi lay e-voucher/xac nhan VietQR, chua xu ly ton kho khi thanh toan that bai/huy, va dang ky bang email/phone chua co xac thuc mo phong ro rang.

## Bang danh gia theo requirement khach hang

| Ma | Requirement | Tinh trang | Muc do |
| --- | --- | --- | --- |
| BR-CUS-01 | Dang ky tai khoan bang email hoac so dien thoai, kiem tra trung lap, xac thuc mo phong | Co UI dang ky customer va backend insert `Users` + `Customers`, co check trung username/email/phone trong `authService.register`. Chua co buoc xac thuc email/phone/OTP khi dang ky; API `check-availability` dang tra `available: true` nen chua kiem tra realtime. | 75% |
| BR-CUS-02 | Dang nhap, dang xuat, quen mat khau, doi mat khau, cap nhat thong tin ca nhan | Co login/logout qua localStorage, profile, update profile, change password, forgot/reset password qua email/phone OTP. Diem thieu: login chi bang username, OTP/email that phu thuoc cau hinh utils; chua co bao ve route tap trung theo role o frontend. | 85% |
| BR-CUS-03 | Tim kiem voucher theo tu khoa, danh muc, khu vuc, gia, muc giam, doi tac, trang thai hieu luc | API search co keyword, category, min/max price, minDiscount, area, partner, sort; UI co keyword/category/area/price/discount/sort qua query. UI chua co bo loc doi tac; trang thai hieu luc moi loc `Approved` va `expiry_date > NOW()` o API, chua loc ro theo start_date/stock tren moi man hinh. | 80% |
| BR-CUS-04 | Xem chi tiet voucher day du | Co trang detail hien thi ten, anh, gia, giam gia, han dung, ton kho, chi nhanh, dieu kien, chinh sach huy, review. Diem thieu: `getVoucherById` khong gioi han `status = Approved`, nen voucher Pending/Disabled van co the bi xem neu biet id; gallery dang lap lai cung mot anh. | 85% |
| BR-CUS-05 | Quan ly gio hang | Co them/cap nhat/xoa voucher, tinh tong tien va luu localStorage. Diem thieu: client khong gioi han so luong theo `quantity_stock`; gio hang luu gia/stock snapshot cu, chi duoc backend tinh lai khi checkout; chua co validate voucher het han/het hang truoc khi vao checkout. | 70% |
| BR-CUS-06 | Tao don hang va chon thanh toan mo phong | Co checkout, lay thong tin profile, tao order, chon VNPay/MoMo/VietQR/PayPal, backend tinh tong tien tu DB va tao `Orders`/`Order_Items`. Diem thieu nghiem trong: stock bi tru ngay khi tao order Pending qua trigger insert `Order_Items`, neu thanh toan fail/huy thi khong tra stock; nut huy VietQR chi dong modal, khong huy order. | 80% |
| BR-CUS-07 | Nhan voucher da mua, xem voucher code, QR mo phong, trang thai su dung, lich su don hang | Co phat hanh `E_Vouchers` sau `Paid`, trang thanh toan hien code, profile co vi e-voucher va trang thai Unused/Used/Expired theo han. Diem thieu: QR/barcode chi la icon text, khong sinh QR thuc; chua co man hinh lich su don hang day du; API lay e-voucher theo `orderId` khong check order thuoc customer dang login. | 65% |
| BR-CUS-08 | Danh gia va phan hoi/khieu nai | Co danh gia sao + comment cho voucher da mua, backend chan danh gia voucher chua mua va chan danh gia trung. Chua co customer UI/API tao khieu nai, theo doi khieu nai, xem phan hoi xu ly; database co bang `complaints` nhung chua duoc noi vao phan he customer. | 45% |

Trung binh theo 8 yeu cau customer: **73.1%**. Sau khi tru rui ro bao mat/quyen so huu order va xu ly ton kho-thanh toan, muc danh gia tong the nen tinh **khoang 72%**.

## Cac phan da hoan thanh tot

1. Dang ky/dang nhap va ho so nguoi dung
   - Frontend: `CustomerRegistration.jsx`, `AuthPage.jsx`, `Profile.jsx`.
   - Backend: `authRoutes.js`, `authService.js`.
   - Database: `users`, `customers`.
   - Mat khau duoc hash bang bcrypt; JWT co role/id.

2. Tim kiem va xem voucher
   - Frontend: `Home.jsx`, `SearchVouchers.jsx`, `VoucherDetail.jsx`, `VoucherCard.jsx`.
   - Backend: `voucherRoutes.js`, `voucherService.js`.
   - Ho tro danh muc, gia, muc giam, khu vuc, sap xep moi/ban chay.

3. Gio hang va checkout
   - Frontend: `CartContext.jsx`, `Cart.jsx`, `Checkout.jsx`.
   - Backend: `orderRoutes.js`, `orderService.createOrder`.
   - Backend khong tin gia tu client ma lay `sale_price` tu DB.

4. Thanh toan mo phong va phat hanh e-voucher
   - Co VNPay, MoMo, VietQR, PayPal.
   - `completeOrder` tao e-voucher theo quantity sau khi order `Paid`.
   - Database co unique constraint tren `e_vouchers.unique_code`.

5. Danh gia voucher
   - Frontend co modal danh gia trong profile.
   - Backend co `createReview`, check da mua va check da review.
   - Database co trigger `trg_validate_review`.

## Cac phan chua hoan thanh hoac can cai thien

### 1. Bao mat va phan quyen customer

Muc do uu tien: Cao.

Van de:
- `GET /api/orders/evouchers/:orderId` co auth nhung service `getOrderEVouchers(orderId)` khong check `order.customer_id = req.user.id`. Bat ky user dang nhap nao co `orderId` co the xem e-voucher cua don khac.
- `POST /api/orders/confirm-vietqr` nhan `orderId` va complete order ma khong check order thuoc user dang login.
- `GET /api/vouchers/:id` tra voucher theo id ma khong check `status = Approved`, co the lam lo voucher chua duyet/disabled.

De xuat:
- Sua `getOrderEVouchers(orderId, customerId)` va query join `Orders` voi dieu kien `o.customer_id = $2`.
- Sua `confirmVietQR` check order cua `req.user.id` truoc khi complete.
- Sua `getVoucherById` cho customer chi lay voucher `Approved`, con admin/partner dung endpoint rieng.

### 2. Xu ly ton kho va don Pending khi thanh toan that bai

Muc do uu tien: Cao.

Van de:
- Trigger `fn_validate_order_item` tru `quantity_stock` ngay khi insert `Order_Items`, tuc la ngay luc checkout tao order Pending.
- Neu khach hang roi cong thanh toan, thanh toan fail, hoac bam huy VietQR, stock khong duoc tra lai.
- Gio hang frontend khong gioi han quantity theo stock; chi database bat loi khi checkout.

De xuat:
- Tach buoc reserve stock va finalize stock, hoac them co che huy/expire order Pending de tra stock.
- Them endpoint cancel order cho customer khi huy thanh toan.
- Gioi han quantity tren `CartContext.updateQuantity` va UI theo `quantity_stock`; refresh voucher truoc checkout.

### 3. Khieu nai/phan hoi customer chua duoc cai dat

Muc do uu tien: Trung binh den cao.

Van de:
- Requirement BR-CUS-08 yeu cau gui phan hoi/khieu nai.
- Database da co `complaints`, `complaint_vouchers`, `complaint_responses`, nhung frontend customer va API chua co route tao/xem khieu nai.

De xuat:
- Them `customer/complaintRoutes`, `complaintController`, `complaintService`.
- Them UI trong `Support.jsx` hoac `Profile.jsx`: tao khieu nai, gan voucher/order lien quan, xem trang thai va phan hoi.

### 4. Lich su don hang chua day du

Muc do uu tien: Trung binh.

Van de:
- Profile hien thi vi e-voucher, co `order_id` va `purchase_date`, nhung chua co man hinh lich su don hang gom Pending/Paid/Cancelled/Failed, chi tiet order, payment method, total amount.
- `orders.status` hien chi co default Pending va update Paid trong code; chua co Cancelled/Failed/Refunded ro rang.

De xuat:
- Them endpoint `GET /api/orders/my-orders` va `GET /api/orders/:id`.
- Mo rong trang Profile tab "Don hang" de xem lich su va chi tiet.
- Bo sung trang thai `Cancelled`, `Failed`, `Refunded` neu requirement hoan tien/huy can demo.

### 5. QR e-voucher chi la mo phong hinh thuc

Muc do uu tien: Trung binh.

Van de:
- PaymentStatus/Profile hien code va icon QR/barcode, nhung khong sinh QR chua `unique_code`.
- Requirement cho phep QR mo phong, nhung nen co QR anh that de demo thuyet phuc hon.

De xuat:
- Dung thu vien QR o frontend hoac backend de render QR tu `unique_code`.
- Co nut copy code va tai QR trong vi e-voucher.

### 6. Xac thuc dang ky email/phone chua ro

Muc do uu tien: Trung binh.

Van de:
- Dang ky bang email/phone co form va check trung tren backend, nhung khong co buoc verify email/OTP.
- `checkAvailability` dang hardcode `{ available: true }`.

De xuat:
- Cai dat `checkAvailability` query username/email/phone that.
- Neu giu mo phong, them buoc hien OTP/email mock va verify truoc khi tao tai khoan, hoac ghi ro la simulation.

### 7. Chat luong frontend va maintainability

Muc do uu tien: Trung binh.

Van de:
- Nhieu inline style, file page lon, kho bao tri.
- `Profile.jsx` tron logic customer va partner branch trong cung page.
- Co dau hieu loi encoding tieng Viet trong nhieu file hien thi khi doc source.
- Bundle build canh bao chunk JS > 500 kB.

De xuat:
- Tach component: `EvoucherWallet`, `ReviewModal`, `ProfileForm`, `SecurityForm`, `CheckoutPaymentMethods`.
- Tach CSS/module style de giam lap code.
- Kiem tra encoding UTF-8 va chuan hoa noi dung tieng Viet.
- Code-splitting theo route bang lazy import.

## Doi chieu voi database script

Da dap ung tot:
- `users` + `customers` luu tai khoan va ho so customer.
- `orders` + `order_items` luu don hang va chi tiet.
- `e_vouchers` co `unique_code`, `status`, `expiry_date`, `used_at_branch_id`, `used_date`.
- `reviews` co rating/comment va trigger validate mua truoc khi review.
- `complaints` va `complaint_responses` da co san cho khieu nai.
- Trigger `fn_validate_order_item` kiem tra Approved, thoi gian ban, ton kho.
- Trigger `fn_validate_voucher_usage` ngan branch khong thuoc partner khi chuyen voucher sang Used.

Can cai thien:
- `orders.status` khong co check constraint va chua mo hinh hoa day du vong doi Pending/Paid/Cancelled/Failed/Refunded.
- Tru ton kho trong trigger insert `order_items` lam ket don Pending neu thanh toan khong hoan tat.
- `fn_log_action` dang de `user_id` NULL, chua lay duoc actor that.
- Co bang khieu nai nhung chua co API/UI customer de dung.

## Kiem chung da thuc hien

- Da doc requirement tu `FIT_HCMUS_EC_Project_Assigment_2026_v1.0.docx`.
- Da doi chieu voi `scriptDatabase&ERD/dealzy_database.sql`.
- Da doc cac file chinh cua customer frontend va API lien quan.
- Da chay build frontend customer:
  - Lenh `npm run build` bi PowerShell chan do execution policy voi `npm.ps1`.
  - Lenh `npm.cmd run build` thanh cong.
  - Build co canh bao chunk JS lon hon 500 kB, nen can code-splitting neu toi uu hieu nang.

## Uu tien hanh dong tiep theo

1. Sua quyen so huu order/e-voucher va confirm VietQR.
2. Sua vong doi order Pending va tra stock khi thanh toan fail/huy/het han.
3. Them khieu nai/phan hoi customer.
4. Them lich su don hang day du.
5. Sinh QR that cho e-voucher.
6. Hoan thien check availability va verify dang ky mo phong.
7. Refactor cac page lon, tach component va toi uu bundle.

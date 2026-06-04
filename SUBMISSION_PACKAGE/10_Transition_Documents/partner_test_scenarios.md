# Kich ban test chuc nang Partner - Dealzy

## 1. Thong tin chung

Muc tieu: kiem tra cac chuc nang danh cho doi tac trong Partner Portal va cac API `api/partner`.

Moi truong test:

| Thanh phan | Gia tri |
|---|---|
| Partner Portal | `http://127.0.0.1:5174` |
| Backend API | `http://127.0.0.1:5000` |
| Tai khoan partner hop le | `sheraton_partner` / `123456` |
| Tai khoan partner khac | `glow_spa` / `123456` |
| Tai khoan admin | `admin` / `123456` |
| Tai khoan customer | `customer_daniel` / `123456` |

Quy uoc ket qua:

| Ky hieu | Y nghia |
|---|---|
| Pass | Ket qua thuc te dung voi ket qua mong doi |
| Fail | Ket qua thuc te sai voi ket qua mong doi |
| Blocked | Khong test duoc do thieu du lieu, server loi, hoac phu thuoc chua san sang |

## 2. Tien dieu kien

- Backend, database, customer portal, partner portal va admin portal da khoi dong.
- Database co san du lieu mau cho partner, branch, category, voucher, order va e-voucher.
- Co it nhat mot voucher code `Unused` thuoc partner `sheraton_partner`.
- Co it nhat mot voucher code thuoc partner khac de test phan quyen cheo.
- Admin co the duyet partner va duyet voucher.

## 3. Kich ban test chi tiet

### PAR-01 - Dang nhap Partner hop le

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner da duoc duyet co the dang nhap vao portal |
| Buoc test | 1. Mo `http://127.0.0.1:5174`  2. Nhap `sheraton_partner` / `123456`  3. Bam dang nhap |
| Ket qua mong doi | He thong vao man hinh tong quan Partner, luu `partnerToken` va hien dung username |

### PAR-02 - Chan dang nhap sai mat khau

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra he thong khong tao phien khi sai thong tin dang nhap |
| Buoc test | 1. Mo Partner Portal  2. Nhap `sheraton_partner` voi mat khau sai  3. Bam dang nhap |
| Ket qua mong doi | Hien thong bao loi, khong tao `partnerToken`, khong vao dashboard |

### PAR-03 - Chan tai khoan Pending hoac Rejected

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner chua duyet hoac bi tu choi khong duoc vao portal |
| Buoc test | 1. Dang ky mot doi tac moi tu `/register-partner`  2. Chua duyet bang admin  3. Thu dang nhap tai Partner Portal  4. Neu can, admin tu choi doi tac va thu dang nhap lai |
| Ket qua mong doi | Pending hien thong bao dang cho xet duyet; Rejected hien thong bao bi tu choi; khong tao phien dang nhap |

### PAR-04 - Kiem tra phan quyen API Partner

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra chi role Partner moi truy cap duoc API partner |
| Buoc test | 1. Dang nhap bang customer lay token  2. Goi `GET /api/partner/dashboard` bang token customer  3. Dang nhap admin lay token  4. Goi cung API bang token admin  5. Goi API khong co token |
| Ket qua mong doi | Customer/admin/khong token deu bi tu choi voi 401 hoac 403 |

### PAR-05 - Xem dashboard tong quan kinh doanh

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra so lieu tong quan cua partner hien thi dung va khong lo du lieu partner khac |
| Buoc test | 1. Dang nhap `sheraton_partner`  2. Mo trang Tong quan  3. Kiem tra cac chi so doanh thu, voucher dang ban, voucher cho duyet, ma da su dung  4. Kiem tra danh sach hoat dong ma voucher gan day |
| Ket qua mong doi | Dashboard load thanh cong; chi hien voucher/code thuoc `sheraton_partner`; so lieu khong am, khong rong bat thuong neu co du lieu mau |

### PAR-06 - Tai danh sach chi nhanh cua partner

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner xem duoc cac chi nhanh cua minh |
| Buoc test | 1. Dang nhap Partner Portal  2. Mo Ho so doi tac hoac tao voucher  3. Quan sat danh sach chi nhanh |
| Ket qua mong doi | Hien dung branch name, address, phone cua partner dang dang nhap; khong hien chi nhanh cua partner khac |

### PAR-07 - Tao voucher moi thanh cong

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner tao voucher va voucher moi o trang thai cho duyet |
| Buoc test | 1. Mo Voucher cua toi  2. Bam Tao voucher  3. Nhap ten, danh muc, gia goc, gia ban nho hon gia goc, so luong, ngay het han, mo ta, dieu kien, chon chi nhanh  4. Bam Luu va gui duyet |
| Ket qua mong doi | Tao voucher thanh cong; voucher xuat hien trong danh sach cua partner; trang thai la `Pending`; discount percent duoc tinh tu gia goc va gia ban |

### PAR-08 - Chan tao voucher thieu truong bat buoc

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra validate du lieu tao voucher |
| Buoc test | 1. Mo form Tao voucher  2. Bo trong ten voucher hoac danh muc hoac ngay het han  3. Bam Luu |
| Ket qua mong doi | He thong bao loi; khong tao voucher moi |

### PAR-09 - Chan tao voucher co gia ban khong hop le

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra quy tac gia ban phai nho hon gia goc |
| Buoc test | 1. Mo form Tao voucher  2. Nhap gia goc `100000` va gia ban `100000` hoac `120000`  3. Bam Luu |
| Ket qua mong doi | He thong bao loi "Gia ban phai nho hon gia goc"; khong tao voucher |

### PAR-10 - Chan tao voucher so luong khong hop le

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra so luong phat hanh phai la so nguyen duong |
| Buoc test | 1. Mo form Tao voucher  2. Nhap so luong `0`, so am, hoac gia tri khong phai so  3. Bam Luu |
| Ket qua mong doi | He thong bao loi; khong tao voucher |

### PAR-11 - Partner chi gan voucher vao chi nhanh cua minh

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra backend chan branch id khong thuoc partner |
| Buoc test | 1. Dang nhap `sheraton_partner`  2. Goi API tao voucher nhung gui `branch_ids` co mot branch cua `glow_spa`  3. Quan sat phan hoi |
| Ket qua mong doi | API tra loi loi "Co chi nhanh khong thuoc doi tac nay"; khong tao lien ket sai trong `Voucher_Branches` |

### PAR-12 - Sua voucher chua duyet

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner co the sua voucher khi chua Approved |
| Buoc test | 1. Tao mot voucher `Pending`  2. Bam Sua  3. Thay doi ten, gia ban, so luong hoac chi nhanh  4. Luu lai |
| Ket qua mong doi | Cap nhat thanh cong; danh sach voucher hien thong tin moi; voucher van thuoc partner dang dang nhap |

### PAR-13 - Chan sua voucher da duyet

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner khong duoc sua voucher `Approved` truc tiep |
| Buoc test | 1. Chon mot voucher `Approved`  2. Thu bam Sua tren UI hoac goi `PUT /api/partner/vouchers/{id}`  3. Quan sat phan hoi |
| Ket qua mong doi | UI vo hieu hoa nut Sua hoac API tra loi loi; du lieu voucher khong thay doi |

### PAR-14 - Gui lai voucher de duyet

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra thao tac gui duyet chuyen voucher ve `Pending` |
| Buoc test | 1. Chon voucher cua partner  2. Bam Gui duyet  3. Reload danh sach |
| Ket qua mong doi | Voucher co trang thai `Pending`; admin co the thay voucher trong man hinh duyet voucher |

### PAR-15 - Tam ngung voucher

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner co the tam ngung voucher cua minh |
| Buoc test | 1. Chon voucher cua partner  2. Bam Ngung  3. Reload danh sach  4. Mo customer portal tim voucher do |
| Ket qua mong doi | Voucher chuyen `Suspended`; customer khong mua duoc voucher bi tam ngung |

### PAR-16 - Partner khong xem/sua voucher cua partner khac

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra khong lo du lieu cheo giua doi tac |
| Buoc test | 1. Dang nhap `sheraton_partner`  2. Lay mot `voucher_id` thuoc `glow_spa`  3. Goi `GET /api/partner/vouchers/{id}` va `PUT /api/partner/vouchers/{id}` |
| Ket qua mong doi | API tra loi loi voucher khong ton tai hoac khong thuoc doi tac nay; khong cap nhat du lieu |

### PAR-17 - Kiem tra voucher code hop le

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner tra cuu duoc code thuoc voucher cua minh |
| Buoc test | 1. Dang nhap `sheraton_partner`  2. Mo Xac thuc ma  3. Nhap mot code `Unused` thuoc Sheraton  4. Bam Kiem tra |
| Ket qua mong doi | Hien ten voucher, ma code, don hang, khach hang, ngay phat hanh, han dung, danh sach chi nhanh ap dung va trang thai `Unused` |

### PAR-18 - Kiem tra code khong ton tai

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra xu ly ma sai |
| Buoc test | 1. Mo Xac thuc ma  2. Nhap `DLZ-NOT-FOUND-999`  3. Bam Kiem tra |
| Ket qua mong doi | Hien thong bao ma voucher khong ton tai hoac khong thuoc doi tac nay; khong hien thong tin code cu |

### PAR-19 - Chan code thuoc partner khac

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner khong tra cuu/xac nhan code cua doi tac khac |
| Buoc test | 1. Dang nhap `glow_spa`  2. Nhap code thuoc `sheraton_partner`  3. Bam Kiem tra |
| Ket qua mong doi | He thong tu choi; khong hien thong tin khach hang/order cua Sheraton |

### PAR-20 - Xac nhan su dung voucher code thanh cong

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner redeem code hop le tai chi nhanh ap dung |
| Buoc test | 1. Dang nhap partner so huu code  2. Nhap code `Unused`  3. Chon chi nhanh hop le  4. Bam Xac nhan da su dung  5. Kiem tra lai code |
| Ket qua mong doi | Code chuyen sang `Used`; co `used_date` va `used_at_branch_id`; nut xac nhan bi vo hieu hoa sau khi used |

### PAR-21 - Chan dung lai code da Used

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra moi e-voucher chi su dung mot lan |
| Buoc test | 1. Nhap lai code vua redeem o PAR-20  2. Bam Kiem tra va thu Xac nhan lai |
| Ket qua mong doi | He thong hien code da su dung va khong cho redeem lai |

### PAR-22 - Chan redeem code het han

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra voucher code qua han khong duoc su dung |
| Buoc test | 1. Chuan bi code `Unused` co `expiry_date` nho hon ngay hien tai  2. Nhap code tren man hinh Xac thuc ma  3. Thu xac nhan su dung |
| Ket qua mong doi | `can_redeem = false`; nut xac nhan bi vo hieu hoa hoac API tra loi loi khong the su dung |

### PAR-23 - Chan redeem tai chi nhanh khong ap dung

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra branch phai nam trong danh sach chi nhanh ap dung cua voucher |
| Buoc test | 1. Chuan bi voucher chi ap dung tai chi nhanh A  2. Goi API redeem code voi branch B cung partner nhung khong nam trong `Voucher_Branches`  3. Quan sat phan hoi |
| Ket qua mong doi | API tra loi loi "Voucher khong ap dung tai chi nhanh nay"; code van `Unused` |

### PAR-24 - Bao cao doi tac hien dung so lieu

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra man hinh Bao cao tong hop dung doanh thu, da ban, da su dung va ton |
| Buoc test | 1. Dang nhap Partner Portal  2. Mo Bao cao  3. Ghi nhan so lieu  4. Redeem thanh cong mot code  5. Reload Bao cao |
| Ket qua mong doi | So ma da su dung tang phu hop; ty le su dung cap nhat; danh sach voucher chi thuoc partner dang dang nhap |

### PAR-25 - Bao cao khong lo du lieu partner khac

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra bao cao duoc loc theo partner id cua token |
| Buoc test | 1. Dang nhap `sheraton_partner`, mo Bao cao va ghi lai danh sach voucher  2. Dang xuat  3. Dang nhap `glow_spa`, mo Bao cao  4. So sanh danh sach |
| Ket qua mong doi | Moi partner chi thay voucher va code cua minh; khong co voucher cua partner khac |

### PAR-26 - Cap nhat ho so doi tac

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner cap nhat thong tin doanh nghiep |
| Buoc test | 1. Mo Ho so doi tac  2. Sua email, so dien thoai, ten doanh nghiep, nguoi dai dien, ma so thue, tru so  3. Bam Luu ho so  4. Reload trang |
| Ket qua mong doi | Luu thanh cong; sau reload thong tin moi van hien dung |

### PAR-27 - Quan ly chi nhanh trong ho so

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra partner them/sua/xoa chi nhanh |
| Buoc test | 1. Mo Ho so doi tac  2. Them chi nhanh moi voi ten, dia chi, so dien thoai  3. Sua mot chi nhanh co san  4. Xoa mot chi nhanh chua gan du lieu quan trong  5. Luu va reload |
| Ket qua mong doi | Danh sach chi nhanh cap nhat dung; chi nhanh moi co the duoc dung khi tao voucher |

### PAR-28 - Dang xuat Partner

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra xoa phien dang nhap khi partner logout |
| Buoc test | 1. Dang nhap Partner Portal  2. Bam Dang xuat tren sidebar  3. Refresh trang  4. Thu mo `/vouchers` |
| Ket qua mong doi | `partnerToken` va `partnerUser` bi xoa; he thong quay ve man hinh dang nhap |

### PAR-29 - Xu ly khi backend tat hoac loi mang

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra portal khong trang trang khi API loi |
| Buoc test | 1. Dang nhap Partner Portal  2. Tat backend hoac chan request API  3. Mo Dashboard, Voucher, Bao cao hoac Xac thuc ma |
| Ket qua mong doi | UI hien thong bao loi ro rang; khong mat phien bat thuong; khong crash trang |

### PAR-30 - Test end-to-end Partner redeem

| Muc | Noi dung |
|---|---|
| Muc tieu | Kiem tra luong thuc te tu mua voucher den partner xac thuc su dung |
| Buoc test | 1. Customer dang nhap va mua voucher Approved cua `sheraton_partner`  2. Hoan tat thanh toan demo  3. Customer mo e-voucher va lay code  4. Partner `sheraton_partner` dang nhap  5. Nhap code va xac nhan su dung  6. Customer/Admin/Partner kiem tra lai trang thai |
| Ket qua mong doi | Order la `Paid`; e-voucher ban dau `Unused`; sau partner redeem thi code thanh `Used`; bao cao partner cap nhat so da su dung |

## 4. Checklist nghiem thu nhanh

| Nhom chuc nang | Tieu chi dat |
|---|---|
| Dang nhap va phan quyen | Partner Approved dang nhap duoc; Pending/Rejected/sai role bi chan |
| Dashboard | Load du lieu dung, chi thuoc partner hien tai |
| Quan ly voucher | Tao, sua voucher chua duyet, gui duyet, tam ngung va validate du lieu dung |
| Chi nhanh | Chi hien va chi cho dung chi nhanh thuoc partner |
| Xac thuc code | Tra cuu, redeem, chan dung lai, chan code het han, chan code partner khac |
| Bao cao | Doanh thu, da ban, da dung, ton kho cap nhat sau phat sinh giao dich |
| Ho so doi tac | Luu thong tin doanh nghiep va chi nhanh, reload khong mat du lieu |
| Loi va bao mat | API loi co thong bao; token sai role khong truy cap duoc |

## 5. Ket qua test ngay 2026-06-04

Nguoi test: Codex.

Pham vi da chay:

| Ma test | Ket qua | Ghi chu |
|---|---|---|
| PAR-01 | Pass | `sheraton_partner` / `123456` dang nhap thanh cong, nhan duoc JWT token role Partner |
| PAR-02 | Pass | Sai mat khau bi chan voi HTTP 400, khong tao phien |
| PAR-04 | Pass | Khong token bi HTTP 401; customer token bi HTTP 403 |
| PAR-04 | Blocked | Admin credential trong tai lieu `admin` / `123456` khong dang nhap duoc; `test_admin` va `codex_admin` cung khong dung mat khau `123456` |
| PAR-05 | Pass | `GET /api/partner/dashboard` load thanh cong; dashboard cua Sheraton co 56 voucher tai thoi diem test |
| PAR-06 | Pass | `GET /api/partner/branches` chi tra branch Sheraton: `branch_id=17` |
| PAR-07 | Pass | Tao voucher test thanh cong: `voucher_id=1010`, trang thai ban dau Pending |
| PAR-08 | Pass | Tao voucher thieu title bi chan voi HTTP 400 |
| PAR-09 | Pass | Tao voucher co `sale_price >= original_price` bi chan voi HTTP 400 |
| PAR-10 | Pass | Tao voucher co `total_quantity=0` bi chan voi HTTP 400 |
| PAR-11 | Pass | Sheraton gui `branch_ids=[19]` cua Glow Spa bi chan voi HTTP 400 |
| PAR-12 | Pass | Sua voucher Pending `voucher_id=1010` thanh cong |
| PAR-14 | Pass | Gui duyet voucher `voucher_id=1010` thanh cong, trang thai ve Pending |
| PAR-15 | Pass | Tam ngung voucher `voucher_id=1010` thanh cong, trang thai Suspended |
| PAR-16 | Pass | `glow_spa` truy cap voucher `1010` cua Sheraton bi chan voi HTTP 404 |
| PAR-17 | Pass | Partner kiem tra code moi `DLZH52LHGIVJ` thanh cong, trang thai ban dau Unused |
| PAR-18 | Pass | Code gia `DLZ-NOT-FOUND-999` bi chan voi HTTP 404 |
| PAR-19 | Pass | `glow_spa` kiem tra code Sheraton `DLZH52LHGIVJ` bi chan voi HTTP 404 |
| PAR-20 | Pass | Redeem code `DLZH52LHGIVJ` tai branch Sheraton `17` thanh cong, code chuyen Used |
| PAR-21 | Pass | Redeem lai code `DLZH52LHGIVJ` bi chan voi HTTP 400 |
| PAR-24 | Pass | `GET /api/partner/reports` load thanh cong |
| PAR-30 | Pass | End-to-end customer mua voucher Sheraton bang VietQR demo, order `41`, sinh code `DLZH52LHGIVJ`, partner redeem thanh cong |

Du lieu phat sinh trong test:

| Loai du lieu | Gia tri |
|---|---|
| Order demo | `order_id=41`, tong tien `792000` |
| E-voucher demo | `DLZH52LHGIVJ`, da duoc redeem va chuyen sang Used |
| Voucher test | `voucher_id=1010`, ten cuoi: `Codex Partner Test Voucher Edited 1010`, trang thai cuoi: Suspended |

Ghi chu con lai:

- Chua test cac case phu thuoc admin duyet voucher/duyet partner vi credential admin hien tai khong khop mat khau mau.
- Chua test UI bang trinh duyet; dot nay moi chay API/logic backend va luong end-to-end qua API.
- Neu can test lai redeem voi code Unused, can tao order demo moi vi code `DLZH52LHGIVJ` da duoc su dung trong dot test nay.

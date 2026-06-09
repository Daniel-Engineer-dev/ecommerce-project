# Checklist Yeu Cau Do An Dealzy

> Quy uoc: `[x]` da co trong du an hien tai o muc co the doi chieu; `[ ]` chua co hoac moi co mot phan, can tiep tuc hoan thien.
> Cap nhat 2026-05-28 sau khi merge `origin/customer` vao `partner` va bo sung admin order/content/log.
> Tom tat: `partner` hien la nhanh tong hop day du nhat. Da co luong Customer xem/tim/gio hang/checkout/thanh toan mo phong/nhan E-Voucher, Partner tao/quan ly/xac thuc voucher, Admin quan ly user/doi tac/duyet voucher/don hang/khieu nai/noi dung/nhat ky/dashboard. Truoc khi nop can chot ma nguon, copy `application` vao package va chay script bao tri du lieu neu Supabase demo con don Paid cu chua du E-Voucher.

## 1. Thong Tin De Tai

1. [x] Xay dung he thong thuong mai dien tu ban voucher giam gia truc tuyen.
2. [x] He thong co toi thieu 3 vai tro: Khach hang, Doi tac, Quan tri vien.
3. [x] Su dung co so du lieu quan he.
4. [x] Co du quy trinh nghiep vu tu tao voucher den su dung voucher.

## 2. Pham Vi Du An

1. [x] Quan ly nguoi dung.
2. [x] Quan ly doi tac.
3. [x] Quan ly voucher day du vong doi.
4. [x] Gio hang.
5. [x] Don hang.
6. [x] Thanh toan mo phong.
7. [x] Phat hanh ma voucher.
8. [x] Xac thuc su dung voucher.
9. [x] Quan ly noi dung.
10. [x] Bao cao thong ke.

## 3. Luong Nghiep Vu Tong Quat

1. [x] Doi tac dang ky.
2. [x] Quan tri vien duyet doi tac.
3. [x] Doi tac tao voucher.
4. [x] Quan tri vien duyet voucher.
5. [x] Cong bo voucher da duyet de hien thi ban.
6. [x] Khach hang tim/xem/chon voucher.
7. [x] Khach hang tao don mua voucher.
8. [x] Thanh toan mo phong.
9. [x] He thong phat hanh ma voucher duy nhat.
10. [x] Doi tac xac thuc su dung voucher.
11. [x] Ghi nhan bao cao.

## 4. Yeu Cau Nghiep Vu Tong The

1. [x] BR-01 - Quan ly tai khoan nguoi dung: dang ky, dang nhap, quen mat khau, doi mat khau, cap nhat ho so, quan ly phien theo vai tro.
2. [x] BR-02 - Quan ly danh muc va noi dung voucher: tao, phan loai, hien thi, tam ngung, ngung ban voucher.
3. [x] BR-03 - Mua hang truc tuyen: chon voucher, gio hang, tao don, thanh toan mo phong, xac nhan don hang.
4. [x] BR-04 - Phat hanh va quan ly voucher code: sinh ma dien tu duy nhat cho giao dich hop le va theo doi vong doi su dung.
5. [x] BR-05 - Kiem tra va xac thuc voucher: doi tac tra cuu, xac minh, xac nhan su dung voucher tai chi nhanh.
6. [x] BR-06 - Kiem duyet va giam sat he thong: da co duyet doi tac, duyet voucher, quan ly don hang, xu ly khieu nai va nhat ky he thong.
7. [x] BR-07 - Bao cao va phan tich: dashboard doanh thu, don hang, voucher ban ra, voucher da dung, hieu suat doi tac.

## 5. Yeu Cau Cho Khach Hang

1. [x] BR-CUS-01 - Dang ky tai khoan bang email hoac so dien thoai, kiem tra trung lap, xac thuc mo phong.
2. [x] BR-CUS-02 - Dang nhap, dang xuat, quen mat khau, doi mat khau, cap nhat thong tin ca nhan.
3. [x] BR-CUS-03 - Tim kiem voucher theo tu khoa va loc theo danh muc, khu vuc, gia, muc giam, doi tac, trang thai hieu luc.
4. [x] BR-CUS-04 - Xem chi tiet voucher: ten, anh, gia goc, gia ban, dieu kien, thoi han, so luong con lai, chi nhanh, chinh sach hoan/huy.
5. [x] BR-CUS-05 - Quan ly gio hang: them, cap nhat, xoa voucher, xem tong tam tinh.
6. [x] BR-CUS-06 - Tao don hang tu gio hang, khai bao nguoi mua/nguoi nhan qua tang, chon phuong thuc thanh toan mo phong.
7. [x] BR-CUS-07 - Nhan voucher da mua: xem voucher code, QR mo phong, trang thai su dung, lich su don hang.
8. [x] BR-CUS-08 - Danh gia va phan hoi: danh gia voucher da mua/da su dung, cham sao, binh luan, gui phan hoi/khieu nai.

## 6. Yeu Cau Cho Doi Tac

1. [x] BR-PAR-01 - Dang ky va quan ly ho so doi tac: thong tin doanh nghiep, phap ly, nguoi dai dien, danh sach chi nhanh.
2. [x] BR-PAR-02 - Tao moi voucher voi gia, mo ta, thoi gian ban, thoi gian su dung, chi nhanh ap dung, so luong phat hanh.
3. [x] BR-PAR-03 - Gui voucher sang trang thai cho duyet va theo doi ket qua phe duyet.
4. [x] BR-PAR-04 - Quan ly voucher: cap nhat trong pham vi duoc phep, xem so luong ban, da dung, het han.
5. [x] BR-PAR-05 - Kiem tra voucher code bang nhap ma hoac QR mo phong.
6. [x] BR-PAR-06 - Xac nhan voucher da su dung, cap nhat nhat ky su dung, ngan dung lai.
7. [x] BR-PAR-07 - Bao cao doi tac: doanh thu, so luong phat hanh, so luong ban, ty le su dung, hieu qua tung chuong trinh.

## 7. Yeu Cau Cho Quan Tri Vien

1. [x] BR-ADM-01 - Quan ly nguoi dung: xem, tra cuu, khoa/mo khoa tai khoan, phan quyen.
2. [x] BR-ADM-02 - Quan ly doi tac: duyet ho so doi tac, quan ly trang thai doi tac, quan ly chi nhanh.
3. [x] BR-ADM-03 - Duyet voucher: xem, duyet, tu choi, thay doi trang thai hien thi, kiem soat vong doi voucher.
4. [x] BR-ADM-04 - Quan ly don hang: tra cuu don, xu ly trang thai thanh toan, huy don, ghi nhan hoan tien mo phong.
5. [x] BR-ADM-05 - Quan ly noi dung: danh muc, banner, bai viet, popup, noi dung chinh sach.
6. [x] BR-ADM-06 - Dashboard quan tri: tong quan nguoi dung, doi tac, voucher, don hang, doanh thu, chi so hieu qua.
7. [x] BR-ADM-07 - Nhat ky he thong: tra cuu thao tac quan trong de kiem tra va truy vet.

## 8. Quy Tac Nghiep Vu

1. [x] RB-01 - Voucher chi duoc ban khi da duoc quan tri vien duyet.
2. [x] RB-02 - Gia ban voucher phai nho hon gia goc.
3. [x] RB-03 - Voucher phai co thoi gian ban va thoi gian su dung ro rang.
4. [x] RB-04 - Voucher khong duoc ban khi het so luong phat hanh hoac het thoi gian ban.
5. [x] RB-05 - Voucher code chi duoc phat hanh sau khi don hang thanh toan thanh cong.
6. [x] RB-06 - Moi voucher code phat hanh phai la duy nhat va kho doan.
7. [x] RB-07 - Voucher da su dung khong duoc dung lai, tru truong hop thiet ke nhieu luot su dung.
8. [x] RB-08 - Voucher het han, bi huy hoac bi khoa thi khong duoc su dung.
9. [x] RB-09 - Doi tac chi duoc xac thuc voucher thuoc pham vi chi nhanh hoac chuong trinh cua minh.
10. [x] RB-10 - Nguoi dung chi duoc danh gia voucher sau khi da mua hoac da su dung theo quy dinh.
11. [x] RB-11 - So luong ban ra khong duoc vuot qua so luong phat hanh.
12. [x] RB-12 - Thao tac quan tri quan trong phai duoc luu vet trong nhat ky he thong.
13. [x] RB-13 - Don hang da huy khong duoc phat hanh voucher.
14. [x] RB-14 - Chinh sach huy va hoan tien phai bam theo dieu kien voucher hoac chinh sach san.
15. [x] RB-15 - Tai thoi diem dat mua va thanh toan, he thong phai kiem tra ton kho voucher de tranh ban vuot.

## 9. Yeu Cau Du Lieu Nghiep Vu

1. [x] DR-01 - Nguoi dung: dang nhap, ho so ca nhan, vai tro, lich su giao dich, lich su hoat dong.
2. [x] DR-02 - Doi tac: thong tin doanh nghiep, nguoi dai dien, chi nhanh, trang thai phe duyet, trang thai hoat dong.
3. [x] DR-03 - Voucher san pham: ten, danh muc, gia goc, gia ban, dieu kien, thoi han, khu vuc, so luong, trang thai.
4. [x] DR-04 - Don hang: ma don, nguoi mua, chi tiet don, tong tien, phuong thuc thanh toan, trang thai don, trang thai thanh toan.
5. [x] DR-05 - Voucher phat hanh: ma voucher dien tu, don hang lien quan, nguoi so huu, trang thai su dung, ngay phat hanh, ngay het han, nhat ky su dung.
6. [x] DR-06 - Danh gia va phan hoi: diem danh gia, nhan xet, khieu nai, phan hoi xu ly.

## 10. Yeu Cau Phi Chuc Nang

1. [x] NFR-01 - Hieu nang: thao tac chinh phan hoi hop ly trong moi truong demo; tra cuu voucher/don hang khong gay gian doan.
2. [x] NFR-02 - Bao mat: mat khau ma hoa, phan quyen theo vai tro, khong lo voucher code khi chua thanh toan, kiem soat truy cap admin.
3. [x] NFR-03 - Tinh on dinh: xu ly loi hop ly, han che mat du lieu nghiep vu trong pham vi demo.
4. [x] NFR-04 - Kha nang mo rong: mo rong loai voucher, bao cao, marketing, thanh toan that trong tuong lai.
5. [x] NFR-05 - Kha nang su dung: giao dien de hieu, luong mua hang ro rang, responsive tren thiet bi di dong.
6. [x] NFR-06 - Kha nang kiem toan: thao tac quan tri va giao dich quan trong co nhat ky truy vet.

## 11. Gia Dinh Va Rang Buoc

1. [x] ASM-01 - Thanh toan duoc mo phong, khong bat buoc tich hop cong thanh toan that.
2. [x] ASM-02 - OTP, email hoac SMS co the mo phong bang thong bao trong he thong.
3. [x] ASM-03 - Quet QR co the mo phong bang nhap ma hoac hien thi QR anh.
4. [x] ASM-04 - Du lieu dung cho muc dich hoc tap va demo, khong phai moi truong san xuat.
5. [x] CON-01 - Sinh vien tu phan tich va thiet ke, khong sao chep nguyen mau tu he thong thuc te.
6. [x] CON-02 - He thong dung co so du lieu quan he.
7. [x] CON-03 - Co toi thieu 3 vai tro: khach hang, doi tac, quan tri vien.
8. [x] CON-04 - Co du lieu mau de chung minh quy trinh nghiep vu.
9. [x] CON-05 - Do an chung minh hieu biet thuong mai dien tu, khong chi dung o giao dien.

## 12. Rui Ro Can Kiem Soat

1. [x] RISK-01 - Thiet ke du lieu phan anh vong doi voucher, don hang va e-voucher.
2. [x] RISK-02 - Ma voucher co rang buoc UNIQUE va co co che thu lai khi trung.
3. [x] RISK-03 - Checkout kiem tra ton kho va khoa dong voucher trong transaction.
4. [x] RISK-04 - API quan tri co middleware phan quyen Admin.
5. [x] RISK-05 - Da co bo du lieu mau va kich ban demo de phuc vu kiem thu/thuyet trinh.

## 13. Chi So Thanh Cong

1. [x] KPI-01 - Hoan tat quy trinh mua voucher tu tim kiem den phat hanh ma va su dung voucher.
2. [x] KPI-02 - Trang thai voucher, don hang va voucher code duoc quan ly dung quy tac.
3. [x] KPI-03 - Doi tac xac thuc duoc voucher.
4. [x] KPI-04 - Co dashboard hoac bao cao ve doanh thu, don hang, voucher va doi tac.
5. [x] KPI-05 - Co BRD, tai lieu phan tich, thiet ke, cai dat va kiem thu.

## 14. Tieu Chi Nghiem Thu

1. [x] AC-01 - Co day du cac vai tro nguoi dung chinh.
2. [x] AC-02 - Co day du quy trinh: tao voucher, duyet voucher, mua voucher, phat hanh voucher, su dung voucher.
3. [x] AC-03 - Trang thai du lieu duoc quan ly nhat quan theo cac quy tac nghiep vu.
4. [x] AC-04 - Co du lieu mau chung minh quy mo hoat dong.
5. [x] AC-05 - Bai thuyet trinh the hien ro moi lien he giua yeu cau nghiep vu va giai phap he thong.

## 15. San Pham Ban Giao

1. [x] Bao cao do an.
2. [x] Mo hinh nghiep vu.
3. [x] Use case.
4. [x] ERD.
5. [x] Bieu do xu ly.
6. [x] Ma nguon.
7. [x] Script co so du lieu.
8. [x] Bo du lieu mau.
9. [ ] Ma nguon trong package - se copy tu `application` sau khi chot ban on dinh.
10. [x] Slide/video khong nam trong package hien tai theo pham vi nop bai cua nhom.

## 16. Tai Lieu Chuyen Tiep Nen Co

1. [x] BRD/de bai goc.
2. [x] SRS.
3. [x] Dac ta use case chi tiet.
4. [x] BPMN hoac Activity Diagram.
5. [x] Tu dien du lieu.
6. [x] Thiet ke giao dien.
7. [x] Ke hoach kiem thu.

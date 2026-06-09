# Goi nop bai - Dealzy

Thu muc nay gom cac san pham ban giao cua do an cuoi ky mon Thuong mai Dien tu.

## Cau truc hien tai

1. `01_Report_LaTeX/`: ma nguon LaTeX va file PDF bao cao.
2. `03_Diagrams_DrawIO/`: cac so do phan tich va thiet ke dang DrawIO.
3. `07_Database_Script_And_Seed/`: script tao CSDL, rang buoc nghiep vu, du lieu mau va script bao tri du lieu demo.
4. `REQUIREMENTS_CHECKLIST.md`: bang doi chieu yeu cau.
5. `00_Assignment.docx`: de bai goc.

Ma nguon ung dung hien nam tai `../application` va se duoc copy vao package khi ban ma nguon da chot on dinh. Khong dua `node_modules`, `dist`, file `.env` that hoac file build tam vao goi nop.

## Trang thai hien tai

- Nhanh tong hop day du nhat: `partner`.
- Da co: Customer xem/tim/gio hang/checkout/thanh toan mo phong/nhan E-Voucher; Partner tao, quan ly, gui duyet, bao cao va xac thuc voucher; Admin quan ly user, duyet doi tac, duyet voucher, don hang, khieu nai, noi dung, nhat ky va dashboard.
- Can lam truoc khi nop: chot ma nguon roi copy `application` vao package; chay script `07_Database_Script_And_Seed/20260609_fix_order_evoucher_consistency.sql` tren Supabase neu du lieu demo cu co don Paid chua du E-Voucher.

## Cach build bao cao

Vao thu muc `01_Report_LaTeX` va chay:

```bash
latexmk -xelatex -interaction=nonstopmode main.tex
```

File ket qua: `main.pdf`.

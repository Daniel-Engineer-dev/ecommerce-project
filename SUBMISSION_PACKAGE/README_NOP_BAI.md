# Goi nop bai - Dealzy

Thu muc nay gom cac san pham ban giao cua do an cuoi ky mon Thuong mai Dien tu.

## Cau truc

1. `01_Report_LaTeX/`: ma nguon LaTeX va file PDF bao cao.
2. `02_Business_Model/`: mo hinh nghiep vu va pham vi he thong.
3. `03_Use_Case/`: danh sach use case theo vai tro.
4. `04_ERD/`: hinh ERD va link ban ve.
5. `05_Process_Diagrams/`: mo ta cac luong xu ly chinh bang Mermaid.
6. `06_Source_Code/`: ma nguon ung dung, khong kem `node_modules` va `dist`.
7. `07_Database_Script_And_Seed/`: script tao CSDL, rang buoc nghiep vu va du lieu mau.
8. `08_Slides/`: noi dat slide trinh bay.
9. `09_Demo_Video/`: noi dat video demo neu duoc yeu cau.

## Trang thai hien tai

- Nhanh tong hop day du nhat: `partner`.
- Da co: Customer xem/tim/gio hang; Partner tao, quan ly, gui duyet, bao cao va xac thuc voucher; Admin quan ly user, duyet doi tac, duyet voucher va dashboard.
- Chua hoan tat: checkout, thanh toan mo phong, phat hanh voucher code tu don hang tren API/UI, admin quan ly don hang, nhat ky he thong day du.

## Cach build bao cao

Vao thu muc `01_Report_LaTeX` va chay:

```bash
latexmk -xelatex -interaction=nonstopmode main.tex
```

File ket qua: `main.pdf`.

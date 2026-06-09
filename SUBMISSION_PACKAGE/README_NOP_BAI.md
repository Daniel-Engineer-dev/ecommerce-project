# Goi nop bai - Dealzy

Thu muc nay gom cac san pham ban giao cua do an cuoi ky mon Thuong mai Dien tu.

## Cau truc goi nop

1. `01_Report_LaTeX/`: ma nguon LaTeX, hinh anh minh hoa va file PDF bao cao.
2. `02_source_code/`: ma nguon ung dung sau khi clean va script database.
   - `02_source_code/application/`: se copy source code client/server vao day sau khi ban application da chot on dinh.
   - `02_source_code/Database_Script_And_Seed/scriptDatabase.sql`: script tao CSDL, rang buoc nghiep vu, trigger, seed data va cac cau lenh verify du lieu.
3. `03_video/Link_video_demo.txt`: file chua link video demo.
4. `REQUIREMENTS_CHECKLIST.md`: bang doi chieu yeu cau.
5. `00_Assignment.docx`: de bai goc.

## Link hosting

- Admin: https://admin-ten-tawny-37.vercel.app/
- Partner: https://partner-three-rho.vercel.app/
- Customer: https://dealzy-pi.vercel.app/

## Trang thai hien tai

- Bao cao da duoc bien dich bang LaTeX va co file PDF trong `01_Report_LaTeX/`.
- Database script da cap nhat theo schema Supabase hien tai va co seed demo sach.
- Source code ung dung dang nam tai `../application`; truoc khi nop se clean va copy vao `02_source_code/application/`.
- Khong dua `node_modules`, `dist`, file `.env` that, file build tam hoac cache vao goi nop.

## Cach build bao cao

Vao thu muc `01_Report_LaTeX` va chay:

```bash
latexmk -xelatex -interaction=nonstopmode main.tex
```

File ket qua: `main.pdf`.

## Ghi chu khi dong goi source

- Copy cac thu muc client/server can thiet tu `../application`.
- Giu lai `package.json`, `package-lock.json`, source code, public assets va file cau hinh can thiet.
- Loai bo `node_modules`, `dist`, `.env`, log, cache va file build phu.
- Neu can file moi truong mau, chi dua file dang sample/example, khong dua credential that.

# Bieu do xu ly nghiep vu

Cac bieu do duoi day dung Mermaid, co the dan vao Markdown viewer ho tro Mermaid hoac cong cu draw.io.

## 1. Doi tac tao va gui duyet voucher

```mermaid
flowchart TD
    A[Doi tac dang nhap] --> B[Mo man hinh quan ly voucher]
    B --> C[Nhap thong tin voucher]
    C --> D{Du lieu hop le?}
    D -- Khong --> C
    D -- Co --> E[Luu voucher trang thai Pending]
    E --> F[Admin thay voucher trong danh sach cho duyet]
```

## 2. Admin duyet voucher

```mermaid
flowchart TD
    A[Admin dang nhap] --> B[Mo quan ly voucher]
    B --> C[Loc voucher Pending]
    C --> D[Xem chi tiet voucher]
    D --> E{Quyet dinh}
    E -- Duyet --> F[Cap nhat Approved va approved_at]
    E -- Tu choi --> G[Cap nhat Rejected va rejected_reason]
    E -- Tam an --> H[Cap nhat Suspended]
```

## 3. Khach hang tim va them voucher vao gio

```mermaid
flowchart TD
    A[Khach hang vao Dealzy] --> B[Tim kiem/loc voucher]
    B --> C[Xem danh sach Approved]
    C --> D[Xem chi tiet voucher]
    D --> E[Them vao gio hang]
    E --> F[Cap nhat so luong/tong tien trong local cart]
```

## 4. Doi tac xac thuc voucher code

```mermaid
flowchart TD
    A[Doi tac nhap voucher code] --> B[Backend tra cuu E_Vouchers]
    B --> C{Voucher thuoc doi tac?}
    C -- Khong --> D[Tu choi xac thuc]
    C -- Co --> E{Chua dung va con han?}
    E -- Khong --> D
    E -- Co --> F[Chon chi nhanh]
    F --> G{Chi nhanh hop le?}
    G -- Khong --> D
    G -- Co --> H[Cap nhat status Used va used_date]
```

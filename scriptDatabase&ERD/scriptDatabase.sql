-- ==========================================
-- 1. XÓA BẢNG CŨ (NẾU CÓ) ĐỂ TRÁNH XUNG ĐỘT
-- ==========================================
DROP TABLE IF EXISTS Complaint_Responses CASCADE;
DROP TABLE IF EXISTS Complaint_Vouchers CASCADE;
DROP TABLE IF EXISTS Complaints CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS System_Logs CASCADE;
DROP TABLE IF EXISTS E_Vouchers CASCADE;
DROP TABLE IF EXISTS Order_Items CASCADE;
DROP TABLE IF EXISTS Orders CASCADE;
DROP TABLE IF EXISTS Vouchers CASCADE;
DROP TABLE IF EXISTS Categories CASCADE;
DROP TABLE IF EXISTS Branches CASCADE;
DROP TABLE IF EXISTS Partners CASCADE;
DROP TABLE IF EXISTS Customers CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- ==========================================
-- 2. TẠO CẤU TRÚC BẢNG (DÂN DỤNG & PHÂN QUYỀN)
-- ==========================================

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('Customer', 'Partner', 'Admin')),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP
);


CREATE TABLE Customers (
    user_id INT PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    dob DATE,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Partners (
    user_id INT PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(200),
    representative_name VARCHAR(100),
    tax_id VARCHAR(50),
    headquarters TEXT,
    status VARCHAR(20) DEFAULT 'Pending',
    is_active BOOLEAN DEFAULT TRUE
);


CREATE TABLE Branches (
    branch_id SERIAL PRIMARY KEY,
    partner_id INT REFERENCES Partners(user_id),
    branch_name VARCHAR(200),
    address TEXT,
    phone VARCHAR(20)
);

CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Vouchers (
    voucher_id SERIAL PRIMARY KEY,
    partner_id INT REFERENCES Partners(user_id),
    category_id INT REFERENCES Categories(category_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    discount_percent INT DEFAULT 0,
    original_price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2) NOT NULL,
    total_quantity INT NOT NULL DEFAULT 0, -- RB-11: Tổng số lượng phát hành
    quantity_stock INT NOT NULL DEFAULT 0, -- RB-04, RB-15: Số lượng tồn kho
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- RB-03: Thời gian bắt đầu bán
    expiry_date TIMESTAMP NOT NULL, -- RB-03: Thời gian kết thúc/hết hạn
    terms_and_conditions TEXT, -- BR-CUS-04: Điều kiện áp dụng
    cancellation_policy TEXT, -- BR-CUS-04: Chính sách hoàn hủy
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Disabled')), -- RB-01
    
    -- RB-02: Giá bán phải nhỏ hơn giá gốc
    CONSTRAINT chk_price CHECK (sale_price < original_price),
    -- RB-11, RB-15: Tồn kho không âm và không vượt quá tổng phát hành
    CONSTRAINT chk_stock CHECK (quantity_stock >= 0 AND quantity_stock <= total_quantity),
    -- RB-03: Thời gian hết hạn phải sau thời gian bắt đầu
    CONSTRAINT chk_dates CHECK (expiry_date > start_date)
);

CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES Customers(user_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'Pending'
);

CREATE TABLE Order_Items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(order_id),
    voucher_id INT REFERENCES Vouchers(voucher_id),
    quantity INT CHECK (quantity > 0),
    price_at_purchase DECIMAL(12,2)
);

CREATE TABLE E_Vouchers (
    evoucher_id SERIAL PRIMARY KEY,
    order_item_id INT REFERENCES Order_Items(order_item_id),
    unique_code VARCHAR(50) UNIQUE NOT NULL, -- RB-06: Mã duy nhất
    status VARCHAR(20) DEFAULT 'Unused' CHECK (status IN ('Unused', 'Used', 'Expired', 'Locked')), -- RB-08
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- DR-05: Ngày phát hành
    expiry_date TIMESTAMP, -- DR-05: Ngày hết hạn (được chép từ Voucher gốc hoặc tính toán riêng)
    used_at_branch_id INT REFERENCES Branches(branch_id),
    used_date TIMESTAMP
);

-- RB-12: Bảng lưu vết nhật ký hệ thống
CREATE TABLE System_Logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    action TEXT NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    voucher_id INT REFERENCES Vouchers(voucher_id) ON DELETE CASCADE,
    customer_id INT REFERENCES Customers(user_id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DR-06: Bảng lưu khiếu nại của người dùng
CREATE TABLE Complaints (
    complaint_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES Customers(user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Resolved', 'Rejected')),
    priority VARCHAR(10) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trung gian lưu danh sách voucher trong một khiếu nại (N-N)
CREATE TABLE Complaint_Vouchers (
    complaint_id INT REFERENCES Complaints(complaint_id) ON DELETE CASCADE,
    voucher_id INT REFERENCES Vouchers(voucher_id) ON DELETE CASCADE,
    PRIMARY KEY (complaint_id, voucher_id)
);

-- DR-06: Bảng lưu phản hồi của hệ thống/đối tác cho khiếu nại
CREATE TABLE Complaint_Responses (
    response_id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES Complaints(complaint_id) ON DELETE CASCADE,
    responder_id INT REFERENCES Users(user_id), -- Admin hoặc Partner phản hồi
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. RÀNG BUỘC NGHIỆP VỤ (BUSINESS RULES - RB)
-- ==========================================

-- RB-12: Hàm ghi nhật ký hệ thống
CREATE OR REPLACE FUNCTION fn_log_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO System_Logs (user_id, action, table_name, record_id)
    VALUES (
        (CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE NULL END), -- Cần bổ sung logic lấy user_id từ session trong thực tế
        TG_OP || ' on ' || TG_TABLE_NAME,
        TG_TABLE_NAME,
        (CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END)
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- RB-15 & RB-04 & RB-01 & RB-03: Kiểm tra điều kiện khi đặt hàng
CREATE OR REPLACE FUNCTION fn_validate_order_item()
RETURNS TRIGGER AS $$
DECLARE
    v_status VARCHAR(20);
    v_stock INT;
    v_start TIMESTAMP;
    v_expiry TIMESTAMP;
BEGIN
    SELECT status, quantity_stock, start_date, expiry_date 
    INTO v_status, v_stock, v_start, v_expiry
    FROM Vouchers WHERE voucher_id = NEW.voucher_id;

    -- RB-01: Chỉ bán khi đã duyệt
    IF v_status <> 'Approved' THEN
        RAISE EXCEPTION 'Voucher chưa được duyệt hoặc đã bị vô hiệu hóa.';
    END IF;

    -- RB-03: Kiểm tra thời gian bán
    IF CURRENT_TIMESTAMP < v_start OR CURRENT_TIMESTAMP > v_expiry THEN
        RAISE EXCEPTION 'Voucher đã hết hạn sử dụng hoặc chưa đến thời gian bán.';
    END IF;

    -- RB-15 & RB-04: Kiểm tra tồn kho
    IF v_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Số lượng tồn kho không đủ (Còn lại: %)', v_stock;
    END IF;

    -- RB-04: Cập nhật giảm tồn kho
    UPDATE Vouchers 
    SET quantity_stock = quantity_stock - NEW.quantity 
    WHERE voucher_id = NEW.voucher_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_order_item
BEFORE INSERT ON Order_Items
FOR EACH ROW EXECUTE FUNCTION fn_validate_order_item();


-- RB-09: Kiểm tra chi nhánh xác thực voucher
CREATE OR REPLACE FUNCTION fn_validate_voucher_usage()
RETURNS TRIGGER AS $$
DECLARE
    v_voucher_partner_id INT;
    v_branch_partner_id INT;
BEGIN
    -- Chỉ kiểm tra khi trạng thái chuyển sang 'Used'
    IF NEW.status = 'Used' AND OLD.status <> 'Used' THEN
        -- Lấy partner của voucher
        SELECT v.partner_id INTO v_voucher_partner_id
        FROM Order_Items oi
        JOIN Vouchers v ON oi.voucher_id = v.voucher_id
        WHERE oi.order_item_id = NEW.order_item_id;

        -- Lấy partner của chi nhánh
        SELECT partner_id INTO v_branch_partner_id
        FROM Branches WHERE branch_id = NEW.used_at_branch_id;

        IF v_voucher_partner_id <> v_branch_partner_id THEN
            RAISE EXCEPTION 'Chi nhánh không thuộc quyền quản lý của đối tác phát hành voucher này.';
        END IF;

        NEW.used_date := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_voucher_usage
BEFORE UPDATE ON E_Vouchers
FOR EACH ROW EXECUTE FUNCTION fn_validate_voucher_usage();


-- RB-10: Chỉ được đánh giá khi đã mua
CREATE OR REPLACE FUNCTION fn_validate_review()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM Orders o
        JOIN Order_Items oi ON o.order_id = oi.order_id
        WHERE o.customer_id = NEW.customer_id AND oi.voucher_id = NEW.voucher_id
    ) THEN
        RAISE EXCEPTION 'Bạn chỉ có thể đánh giá những voucher mà bạn đã mua.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_review
BEFORE INSERT ON Reviews
FOR EACH ROW EXECUTE FUNCTION fn_validate_review();


-- ==========================================
-- 4. CHÈN DỮ LIỆU MẪU (SEED DATA)
-- ==========================================

-- 3.1. Users & Partners
INSERT INTO Users (username, password, role) VALUES 
('admin', '123456', 'Admin'),
('sheraton_partner', '123456', 'Partner'),
('fantastic_travel', '123456', 'Partner'),
('glow_spa', '123456', 'Partner'),
('nike_vn', '123456', 'Partner'),
('hokkaido_sushi', '123456', 'Partner'),
('cgv_cinemas', '123456', 'Partner'),
('customer_daniel', '123456', 'Customer'),
('customer_minh', '123456', 'Customer'),
('customer_lan', '123456', 'Customer'),
('admin', '$2b$10$a3uchNxGHtnHH6.jn1xfQehXB.2n5JjtC0gsx8wh2tV43rVidZOE6', 'Admin');

INSERT INTO Partners (user_id, company_name, status)
SELECT user_id, 'Sheraton Hotel', 'Approved' FROM Users WHERE username = 'sheraton_partner' UNION ALL
SELECT user_id, 'Fantastic Travel', 'Approved' FROM Users WHERE username = 'fantastic_travel' UNION ALL
SELECT user_id, 'Glow Skin & Spa', 'Approved' FROM Users WHERE username = 'glow_spa' UNION ALL
SELECT user_id, 'Nike Vietnam', 'Approved' FROM Users WHERE username = 'nike_vn' UNION ALL
SELECT user_id, 'Hokkaido Sushi', 'Approved' FROM Users WHERE username = 'hokkaido_sushi' UNION ALL
SELECT user_id, 'CGV Cinemas', 'Approved' FROM Users WHERE username = 'cgv_cinemas';

INSERT INTO Customers (user_id, full_name, dob, address)
SELECT user_id, 'Daniel Nguyen', '1995-05-15'::DATE, '123 Quận 1, TP.HCM' FROM Users WHERE username = 'customer_daniel' UNION ALL
SELECT user_id, 'Nguyễn Văn Minh', '1998-10-20'::DATE, '456 Quận 7, TP.HCM' FROM Users WHERE username = 'customer_minh' UNION ALL
SELECT user_id, 'Lê Thị Lan', '1992-02-12'::DATE, '789 Quận Hoàn Kiếm, Hà Nội' FROM Users WHERE username = 'customer_lan';

-- 3.2. Categories
INSERT INTO Categories (category_name) VALUES 
('Dining'), ('Travel'), ('Beauty'), ('Shopping'), ('Entertainment');

-- 3.3. Vouchers (Bao gồm discount_percent và các ràng buộc mới)
INSERT INTO Vouchers (partner_id, category_id, title, description, image_url, discount_percent, original_price, sale_price, total_quantity, quantity_stock, expiry_date, status)
VALUES 
((SELECT user_id FROM Users WHERE username = 'sheraton_partner'), (SELECT category_id FROM Categories WHERE category_name = 'Dining'), 
 'Buffet Hải Sản 5 Sao - Sheraton', 'Thưởng thức buffet hải sản cao cấp tại không gian sang trọng của khách sạn Sheraton.', 
 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&q=80&w=800', 34, 1200000, 790000, 50, 50, '2026-12-31', 'Approved'),

((SELECT user_id FROM Users WHERE username = 'fantastic_travel'), (SELECT category_id FROM Categories WHERE category_name = 'Travel'), 
 'Combo Du Lịch SaPa 3N2Đ', 'Trải nghiệm kỳ nghỉ tuyệt vời tại SaPa với phòng nghỉ view núi và phương tiện di chuyển.', 
 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800', 33, 4500000, 2990000, 30, 30, '2026-11-15', 'Approved'),

((SELECT user_id FROM Users WHERE username = 'glow_spa'), (SELECT category_id FROM Categories WHERE category_name = 'Beauty'), 
 'Liệu Trình Spa Toàn Thân', 'Thư giãn tối đa với liệu trình massage đá nóng và chăm sóc da mặt chuyên sâu.', 
 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800', 47, 850000, 450000, 100, 100, '2026-10-20', 'Approved'),

((SELECT user_id FROM Users WHERE username = 'nike_vn'), (SELECT category_id FROM Categories WHERE category_name = 'Shopping'), 
 'Voucher Mua Sắm Nike 500k', 'Áp dụng cho tất cả sản phẩm tại hệ thống cửa hàng Nike Vietnam.', 
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', 16, 500000, 420000, 200, 200, '2026-09-30', 'Approved'),

((SELECT user_id FROM Users WHERE username = 'hokkaido_sushi'), (SELECT category_id FROM Categories WHERE category_name = 'Dining'), 
 'Khai Phá Ẩm Thực Nhật Bản', 'Thưởng thức các món sushi và sashimi tươi ngon chuẩn vị Nhật.', 
 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800', 42, 600000, 350000, 150, 150, '2026-12-01', 'Approved'),

((SELECT user_id FROM Users WHERE username = 'cgv_cinemas'), (SELECT category_id FROM Categories WHERE category_name = 'Entertainment'), 
 'Vé Xem Phim IMAX Toàn Quốc', 'Trải nghiệm điện ảnh đỉnh cao tại các cụm rạp IMAX của CGV.', 
 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800', 28, 250000, 180000, 500, 500, '2026-08-31', 'Approved');


-- 3.4. Đơn hàng mẫu (Orders)
INSERT INTO Orders (customer_id, total_amount, status) VALUES 
((SELECT MIN(user_id) FROM Users WHERE role = 'Customer'), 790000, 'Paid'),
((SELECT MIN(user_id) FROM Users WHERE role = 'Customer'), 2990000, 'Paid'),
((SELECT MIN(user_id) FROM Users WHERE role = 'Customer'), 180000, 'Paid');

-- 3.5. Chi tiết đơn hàng mẫu (Order_Items)
INSERT INTO Order_Items (order_id, voucher_id, quantity, price_at_purchase) VALUES 
(1, 1, 1, 790000),
(2, 2, 1, 2990000),
(3, 6, 1, 180000);

-- 3.6. Reviews Mẫu
INSERT INTO Reviews (voucher_id, customer_id, rating, comment) VALUES 
(1, (SELECT MIN(user_id) FROM Users WHERE role = 'Customer'), 5, 'Đồ ăn rất ngon, hải sản tươi sống, phục vụ chu đáo.'),
(1, (SELECT MIN(user_id) FROM Users WHERE role = 'Customer'), 4, 'Không gian đẹp nhưng hơi đông vào cuối tuần.'),
(2, (SELECT MIN(user_id) FROM Users WHERE role = 'Customer'), 5, 'Chuyến đi tuyệt vời, khách sạn view rất đẹp.'),
(6, (SELECT MIN(user_id) FROM Users WHERE role = 'Customer'), 5, 'Trải nghiệm IMAX thật sự khác biệt, rất đáng tiền.');

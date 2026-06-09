-- ============================================================
-- DEALZY DATABASE SCRIPT
-- Updated: 2026-06-09
-- Purpose: recreate the current Supabase schema and a clean demo seed.
--
-- Notes:
-- - This script is intended for a fresh PostgreSQL/Supabase public schema.
-- - It reflects the current application schema: gift order fields,
--   complaint response action_type, partial unique email/phone indexes,
--   order/e-voucher consistency checks, and current business triggers.
-- - Demo data is intentionally curated instead of dumping all live test rows.
-- ============================================================

SET client_encoding = 'UTF8';

BEGIN;

-- ============================================================
-- 1. DROP OLD TABLES
-- ============================================================

DROP TABLE IF EXISTS complaint_responses CASCADE;
DROP TABLE IF EXISTS complaint_vouchers CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS content_items CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS e_vouchers CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS voucher_branches CASCADE;
DROP TABLE IF EXISTS vouchers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS fn_validate_voucher_usage() CASCADE;
DROP FUNCTION IF EXISTS fn_validate_order_item() CASCADE;
DROP FUNCTION IF EXISTS fn_validate_review() CASCADE;
DROP FUNCTION IF EXISTS fn_log_action() CASCADE;

-- ============================================================
-- 2. TABLES
-- ============================================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('Customer', 'Partner', 'Admin')),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email_unique_not_null
    ON users (LOWER(email))
    WHERE email IS NOT NULL;

CREATE UNIQUE INDEX idx_users_phone_unique_not_null
    ON users (phone)
    WHERE phone IS NOT NULL;

CREATE TABLE customers (
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    dob DATE,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE partners (
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(200),
    representative_name VARCHAR(100),
    tax_id VARCHAR(50),
    headquarters TEXT,
    status VARCHAR(20) DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE branches (
    branch_id SERIAL PRIMARY KEY,
    partner_id INT REFERENCES partners(user_id) ON DELETE CASCADE,
    branch_name VARCHAR(200),
    address TEXT,
    phone VARCHAR(20)
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE vouchers (
    voucher_id SERIAL PRIMARY KEY,
    partner_id INT REFERENCES partners(user_id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    discount_percent INT DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    original_price NUMERIC(12,2) NOT NULL,
    sale_price NUMERIC(12,2) NOT NULL,
    total_quantity INT NOT NULL DEFAULT 0,
    quantity_stock INT NOT NULL DEFAULT 0,
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NOT NULL,
    terms_and_conditions TEXT,
    cancellation_policy TEXT,
    status VARCHAR(20) DEFAULT 'Pending'
        CHECK (status IN ('Draft', 'Pending', 'Approved', 'Rejected', 'Suspended', 'Expired')),
    approved_at TIMESTAMP,
    rejected_reason TEXT,
    CONSTRAINT chk_price CHECK (sale_price < original_price),
    CONSTRAINT chk_stock CHECK (quantity_stock >= 0 AND quantity_stock <= total_quantity),
    CONSTRAINT chk_dates CHECK (expiry_date > start_date),
    CONSTRAINT vouchers_price_nonnegative_check CHECK (original_price >= 0 AND sale_price >= 0)
);

CREATE TABLE voucher_branches (
    voucher_id INT REFERENCES vouchers(voucher_id) ON DELETE CASCADE,
    branch_id INT REFERENCES branches(branch_id) ON DELETE CASCADE,
    PRIMARY KEY (voucher_id, branch_id)
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(user_id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(12,2),
    status VARCHAR(20) DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Paid', 'Cancelled', 'Failed', 'Expired', 'Refunded')),
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(100),
    shipping_name VARCHAR(100),
    shipping_phone VARCHAR(20),
    shipping_email VARCHAR(100),
    shipping_address TEXT,
    is_gift BOOLEAN NOT NULL DEFAULT FALSE,
    gift_recipient_name VARCHAR(255),
    gift_recipient_phone VARCHAR(50),
    gift_recipient_email VARCHAR(255),
    gift_message TEXT,
    CONSTRAINT orders_total_amount_nonnegative_check
        CHECK (total_amount IS NULL OR total_amount >= 0)
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    voucher_id INT REFERENCES vouchers(voucher_id) ON DELETE SET NULL,
    quantity INT CHECK (quantity > 0),
    price_at_purchase NUMERIC(12,2),
    CONSTRAINT order_items_price_nonnegative_check
        CHECK (price_at_purchase IS NULL OR price_at_purchase >= 0)
);

CREATE TABLE e_vouchers (
    evoucher_id SERIAL PRIMARY KEY,
    order_item_id INT REFERENCES order_items(order_item_id) ON DELETE CASCADE,
    unique_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Unused'
        CHECK (status IN ('Unused', 'Used', 'Expired', 'Locked')),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    used_at_branch_id INT REFERENCES branches(branch_id) ON DELETE SET NULL,
    used_date TIMESTAMP
);

CREATE TABLE system_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_items (
    content_id SERIAL PRIMARY KEY,
    content_key VARCHAR(80) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'policy',
    body TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    voucher_id INT REFERENCES vouchers(voucher_id) ON DELETE CASCADE,
    customer_id INT REFERENCES customers(user_id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_customer_voucher_unique UNIQUE (customer_id, voucher_id)
);

CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(user_id) ON DELETE CASCADE,
    order_id INT REFERENCES orders(order_id) ON DELETE SET NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Processing', 'Resolved', 'Rejected')),
    priority VARCHAR(10) DEFAULT 'Normal'
        CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE complaint_vouchers (
    complaint_id INT REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    voucher_id INT REFERENCES vouchers(voucher_id) ON DELETE CASCADE,
    PRIMARY KEY (complaint_id, voucher_id)
);

CREATE TABLE complaint_responses (
    response_id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    responder_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_type VARCHAR(50)
);

-- ============================================================
-- 3. BUSINESS RULE FUNCTIONS AND TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION fn_log_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO system_logs (user_id, action, table_name, record_id)
    VALUES (
        NULL,
        TG_OP || ' on ' || TG_TABLE_NAME,
        TG_TABLE_NAME,
        CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

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
    FROM vouchers
    WHERE voucher_id = NEW.voucher_id;

    IF v_status <> 'Approved' THEN
        RAISE EXCEPTION 'Voucher is not approved or is unavailable.';
    END IF;

    IF CURRENT_TIMESTAMP < v_start OR CURRENT_TIMESTAMP > v_expiry THEN
        RAISE EXCEPTION 'Voucher is outside the valid selling period.';
    END IF;

    IF v_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Voucher stock is not enough. Remaining: %', v_stock;
    END IF;

    UPDATE vouchers
    SET quantity_stock = quantity_stock - NEW.quantity
    WHERE voucher_id = NEW.voucher_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_order_item
BEFORE INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION fn_validate_order_item();

CREATE OR REPLACE FUNCTION fn_validate_voucher_usage()
RETURNS TRIGGER AS $$
DECLARE
    v_voucher_partner_id INT;
    v_branch_partner_id INT;
BEGIN
    IF NEW.status = 'Used' AND OLD.status <> 'Used' THEN
        SELECT v.partner_id
        INTO v_voucher_partner_id
        FROM order_items oi
        JOIN vouchers v ON oi.voucher_id = v.voucher_id
        WHERE oi.order_item_id = NEW.order_item_id;

        SELECT partner_id
        INTO v_branch_partner_id
        FROM branches
        WHERE branch_id = NEW.used_at_branch_id;

        IF v_voucher_partner_id <> v_branch_partner_id THEN
            RAISE EXCEPTION 'Branch does not belong to the partner that issued this voucher.';
        END IF;

        NEW.used_date := CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_voucher_usage
BEFORE UPDATE ON e_vouchers
FOR EACH ROW EXECUTE FUNCTION fn_validate_voucher_usage();

CREATE OR REPLACE FUNCTION fn_validate_review()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.customer_id = NEW.customer_id
          AND oi.voucher_id = NEW.voucher_id
    ) THEN
        RAISE EXCEPTION 'Customer can only review purchased vouchers.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_review
BEFORE INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION fn_validate_review();

-- ============================================================
-- 4. DEMO SEED DATA
-- Password hash below is the shared demo password used by the project seed.
-- ============================================================

INSERT INTO users (username, password, email, phone, role) VALUES
('admin', '$2b$10$gRg6lG5n1oITOVT5T1ENh.19KbEH0LxlY9B.SI6vbDeCJJlODACA2', 'admin@dealzy.vn', '0900000000', 'Admin'),
('sheraton_partner', '$2b$10$gRg6lG5n1oITOVT5T1ENh.19KbEH0LxlY9B.SI6vbDeCJJlODACA2', 'sheraton@dealzy.vn', '0900000001', 'Partner'),
('fantastic_travel', '$2b$10$gRg6lG5n1oITOVT5T1ENh.19KbEH0LxlY9B.SI6vbDeCJJlODACA2', 'travel@dealzy.vn', '0900000002', 'Partner'),
('glow_spa', '$2b$10$gRg6lG5n1oITOVT5T1ENh.19KbEH0LxlY9B.SI6vbDeCJJlODACA2', 'glowspa@dealzy.vn', '0900000003', 'Partner'),
('nike_vn', '$2b$10$gRg6lG5n1oITOVT5T1ENh.19KbEH0LxlY9B.SI6vbDeCJJlODACA2', 'nike@dealzy.vn', '0900000004', 'Partner'),
('hokkaido_sushi', '$2b$10$gRg6lG5n1oITOVT5T1ENh.19KbEH0LxlY9B.SI6vbDeCJJlODACA2', 'hokkaido@dealzy.vn', '0900000005', 'Partner'),
('cgv_cinemas', '$2b$10$gRg6lG5n1oITOVT5T1ENh.19KbEH0LxlY9B.SI6vbDeCJJlODACA2', 'cgv@dealzy.vn', '0900000006', 'Partner'),
('customer_daniel', '$2b$10$gRg6lG5n1oITOVT5T1ENh.19KbEH0LxlY9B.SI6vbDeCJJlODACA2', 'daniel@dealzy.vn', '0911000001', 'Customer'),
('customer_minh', '$2b$10$gRg6lG5n1oITOVT5T1ENh.19KbEH0LxlY9B.SI6vbDeCJJlODACA2', 'minh@dealzy.vn', '0911000002', 'Customer'),
('customer_lan', '$2b$10$gRg6lG5n1oITOVT5T1ENh.19KbEH0LxlY9B.SI6vbDeCJJlODACA2', 'lan@dealzy.vn', '0911000003', 'Customer');

INSERT INTO partners (user_id, company_name, representative_name, tax_id, headquarters, status)
SELECT user_id, 'Sheraton Hotel', 'Nguyen Anh', 'TAX-SHE-001', '88 Dong Khoi, District 1, Ho Chi Minh City', 'Approved' FROM users WHERE username = 'sheraton_partner' UNION ALL
SELECT user_id, 'Fantastic Travel', 'Tran Binh', 'TAX-TRA-001', '12 Nguyen Hue, District 1, Ho Chi Minh City', 'Approved' FROM users WHERE username = 'fantastic_travel' UNION ALL
SELECT user_id, 'Glow Skin & Spa', 'Le Chi', 'TAX-SPA-001', '45 Vo Van Tan, District 3, Ho Chi Minh City', 'Approved' FROM users WHERE username = 'glow_spa' UNION ALL
SELECT user_id, 'Nike Vietnam', 'Pham Duy', 'TAX-NIK-001', '72 Le Thanh Ton, District 1, Ho Chi Minh City', 'Approved' FROM users WHERE username = 'nike_vn' UNION ALL
SELECT user_id, 'Hokkaido Sushi', 'Hoang Emi', 'TAX-SUS-001', '720A Dien Bien Phu, Binh Thanh, Ho Chi Minh City', 'Approved' FROM users WHERE username = 'hokkaido_sushi' UNION ALL
SELECT user_id, 'CGV Cinemas', 'Vo Gia', 'TAX-CGV-001', '101 Ton Dat Tien, District 7, Ho Chi Minh City', 'Approved' FROM users WHERE username = 'cgv_cinemas';

INSERT INTO customers (user_id, full_name, dob, address)
SELECT user_id, 'Daniel Nguyen', DATE '1995-05-15', '123 District 1, Ho Chi Minh City' FROM users WHERE username = 'customer_daniel' UNION ALL
SELECT user_id, 'Nguyen Van Minh', DATE '1998-10-20', '456 District 7, Ho Chi Minh City' FROM users WHERE username = 'customer_minh' UNION ALL
SELECT user_id, 'Le Thi Lan', DATE '1992-02-12', '789 Hoan Kiem, Ha Noi' FROM users WHERE username = 'customer_lan';

INSERT INTO branches (partner_id, branch_name, address, phone)
SELECT user_id, 'Sheraton Saigon', '88 Dong Khoi, District 1, Ho Chi Minh City', '02838272828' FROM users WHERE username = 'sheraton_partner' UNION ALL
SELECT user_id, 'Fantastic Travel HCM', '12 Nguyen Hue, District 1, Ho Chi Minh City', '02839390001' FROM users WHERE username = 'fantastic_travel' UNION ALL
SELECT user_id, 'Glow Spa District 3', '45 Vo Van Tan, District 3, Ho Chi Minh City', '02839330002' FROM users WHERE username = 'glow_spa' UNION ALL
SELECT user_id, 'Nike Vincom Dong Khoi', '72 Le Thanh Ton, District 1, Ho Chi Minh City', '02839330003' FROM users WHERE username = 'nike_vn' UNION ALL
SELECT user_id, 'Hokkaido Sushi Landmark', '720A Dien Bien Phu, Binh Thanh, Ho Chi Minh City', '02839330004' FROM users WHERE username = 'hokkaido_sushi' UNION ALL
SELECT user_id, 'CGV Crescent Mall', '101 Ton Dat Tien, District 7, Ho Chi Minh City', '02839330005' FROM users WHERE username = 'cgv_cinemas';

INSERT INTO categories (category_name) VALUES
('Dining'), ('Travel'), ('Beauty'), ('Shopping'), ('Entertainment'),
('Education'), ('Health'), ('Spa'), ('Hotels'), ('Cafe');

INSERT INTO vouchers (
    partner_id, category_id, title, description, image_url, discount_percent,
    original_price, sale_price, total_quantity, quantity_stock, start_date,
    expiry_date, terms_and_conditions, cancellation_policy, status, approved_at
) VALUES
((SELECT user_id FROM users WHERE username = 'sheraton_partner'), (SELECT category_id FROM categories WHERE category_name = 'Dining'),
 'Sheraton 5-Star Seafood Buffet', 'Premium seafood buffet at Sheraton Saigon.',
 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&q=80&w=800',
 34, 1200000, 790000, 50, 50, CURRENT_TIMESTAMP, TIMESTAMP '2026-12-31 23:59:59',
 'Valid for weekday dinner buffet. Reservation is required.', 'No cash refund on holidays.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'fantastic_travel'), (SELECT category_id FROM categories WHERE category_name = 'Travel'),
 'SaPa 3D2N Travel Combo', 'Mountain-view hotel and round-trip transfer package.',
 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800',
 33, 4500000, 2990000, 30, 30, CURRENT_TIMESTAMP, TIMESTAMP '2026-11-15 23:59:59',
 'Includes transfer and 2 hotel nights with breakfast.', 'Free cancellation 7 days before departure.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'glow_spa'), (SELECT category_id FROM categories WHERE category_name = 'Beauty'),
 'Full Body Spa Treatment', 'Hot-stone massage and facial care package.',
 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800',
 47, 850000, 450000, 100, 100, CURRENT_TIMESTAMP, TIMESTAMP '2026-10-20 23:59:59',
 'Appointment required. Maximum 2 vouchers per customer.', 'Reschedule at least 24 hours before service.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'nike_vn'), (SELECT category_id FROM categories WHERE category_name = 'Shopping'),
 'Nike Shopping Voucher 500K', 'Store voucher for selected Nike Vietnam products.',
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
 16, 500000, 420000, 200, 200, CURRENT_TIMESTAMP, TIMESTAMP '2026-09-30 23:59:59',
 'Valid at selected stores. Maximum 2 vouchers per invoice.', 'No cash exchange.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'hokkaido_sushi'), (SELECT category_id FROM categories WHERE category_name = 'Dining'),
 'Japanese Dining Discovery', 'Sushi and sashimi set menu at Hokkaido Sushi.',
 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800',
 42, 600000, 350000, 150, 150, CURRENT_TIMESTAMP, TIMESTAMP '2026-12-01 23:59:59',
 'Valid for dine-in and takeaway. Not combinable with membership offers.', 'Flexible cancellation before redemption.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'cgv_cinemas'), (SELECT category_id FROM categories WHERE category_name = 'Entertainment'),
 'CGV Movie Combo Ticket', 'Movie ticket combo for selected CGV cinemas.',
 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
 28, 250000, 180000, 500, 500, CURRENT_TIMESTAMP, TIMESTAMP '2026-08-31 23:59:59',
 'Redeem at counter or CGV app. Seat surcharges may apply.', 'No refund after code redemption.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'sheraton_partner'), (SELECT category_id FROM categories WHERE category_name = 'Dining'),
 'Sheraton Business Lunch Set', 'Five-star business lunch set menu.',
 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
 20, 600000, 480000, 100, 100, CURRENT_TIMESTAMP, TIMESTAMP '2026-12-31 23:59:59',
 'Valid 11:30-14:00 on weekdays.', 'Cancel 3 hours before reservation.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'fantastic_travel'), (SELECT category_id FROM categories WHERE category_name = 'Travel'),
 'Ha Long Bay 5-Star Cruise', '2D1N cruise package with meals and kayak activity.',
 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800',
 25, 3800000, 2850000, 40, 40, CURRENT_TIMESTAMP, TIMESTAMP '2026-11-30 23:59:59',
 'Price for one adult in twin room.', 'Free date change 10 days before departure.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'glow_spa'), (SELECT category_id FROM categories WHERE category_name = 'Spa'),
 'Herbal Hair Wash and Shoulder Massage', '75-minute relaxation service with herbal ingredients.',
 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800',
 40, 300000, 180000, 200, 200, CURRENT_TIMESTAMP, TIMESTAMP '2026-11-20 23:59:59',
 'Valid every day. Booking recommended.', 'Free cancellation before redemption.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'nike_vn'), (SELECT category_id FROM categories WHERE category_name = 'Shopping'),
 'Nike Air Max Discount Voucher', 'Discount voucher for Nike Air Max products.',
 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800',
 20, 1500000, 1200000, 100, 100, CURRENT_TIMESTAMP, TIMESTAMP '2026-09-15 23:59:59',
 'Valid for regular-price products only.', 'Size exchange within 7 days if eligible.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'hokkaido_sushi'), (SELECT category_id FROM categories WHERE category_name = 'Dining'),
 'Premium Sashimi Boat', 'Large sashimi set for group dining.',
 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=800',
 30, 800000, 560000, 120, 120, CURRENT_TIMESTAMP, TIMESTAMP '2026-12-10 23:59:59',
 'Valid for dine-in. Reservation recommended.', 'Contact restaurant before cancellation.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'cgv_cinemas'), (SELECT category_id FROM categories WHERE category_name = 'Entertainment'),
 'CGV Couple Movie Combo', 'Two 2D tickets, one large popcorn and two drinks.',
 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
 35, 360000, 234000, 300, 300, CURRENT_TIMESTAMP, TIMESTAMP '2026-09-30 23:59:59',
 'Valid for standard 2D showtimes.', 'No refund after purchase.', 'Approved', CURRENT_TIMESTAMP),
((SELECT user_id FROM users WHERE username = 'sheraton_partner'), (SELECT category_id FROM categories WHERE category_name = 'Dining'),
 'Sheraton Draft Voucher Pending Review', 'Voucher used to demonstrate admin approval workflow.',
 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
 10, 1000000, 900000, 30, 30, CURRENT_TIMESTAMP, TIMESTAMP '2026-12-25 23:59:59',
 'Pending approval.', 'Pending approval.', 'Pending', NULL);

INSERT INTO voucher_branches (voucher_id, branch_id)
SELECT v.voucher_id, b.branch_id
FROM vouchers v
JOIN branches b ON b.partner_id = v.partner_id;

-- Paid orders used for e-voucher issuance and reviews.
INSERT INTO orders (
    customer_id, total_amount, status, payment_method, transaction_reference,
    shipping_name, shipping_phone, shipping_email, shipping_address
) VALUES
((SELECT user_id FROM users WHERE username = 'customer_daniel'), 790000, 'Paid', 'sandbox', 'PAY-DEMO-0001', 'Daniel Nguyen', '0911000001', 'daniel@dealzy.vn', '123 District 1, Ho Chi Minh City'),
((SELECT user_id FROM users WHERE username = 'customer_daniel'), 2990000, 'Paid', 'sandbox', 'PAY-DEMO-0002', 'Daniel Nguyen', '0911000001', 'daniel@dealzy.vn', '123 District 1, Ho Chi Minh City'),
((SELECT user_id FROM users WHERE username = 'customer_minh'), 180000, 'Paid', 'sandbox', 'PAY-DEMO-0003', 'Nguyen Van Minh', '0911000002', 'minh@dealzy.vn', '456 District 7, Ho Chi Minh City'),
((SELECT user_id FROM users WHERE username = 'customer_lan'), 450000, 'Pending', 'sandbox', 'PAY-DEMO-PENDING', 'Le Thi Lan', '0911000003', 'lan@dealzy.vn', '789 Hoan Kiem, Ha Noi'),
((SELECT user_id FROM users WHERE username = 'customer_minh'), 420000, 'Cancelled', 'sandbox', 'PAY-DEMO-CANCELLED', 'Nguyen Van Minh', '0911000002', 'minh@dealzy.vn', '456 District 7, Ho Chi Minh City'),
((SELECT user_id FROM users WHERE username = 'customer_lan'), 350000, 'Refunded', 'sandbox', 'PAY-DEMO-REFUNDED', 'Le Thi Lan', '0911000003', 'lan@dealzy.vn', '789 Hoan Kiem, Ha Noi');

INSERT INTO order_items (order_id, voucher_id, quantity, price_at_purchase) VALUES
((SELECT order_id FROM orders WHERE transaction_reference = 'PAY-DEMO-0001'), (SELECT voucher_id FROM vouchers WHERE title = 'Sheraton 5-Star Seafood Buffet'), 1, 790000),
((SELECT order_id FROM orders WHERE transaction_reference = 'PAY-DEMO-0002'), (SELECT voucher_id FROM vouchers WHERE title = 'SaPa 3D2N Travel Combo'), 1, 2990000),
((SELECT order_id FROM orders WHERE transaction_reference = 'PAY-DEMO-0003'), (SELECT voucher_id FROM vouchers WHERE title = 'CGV Movie Combo Ticket'), 1, 180000),
((SELECT order_id FROM orders WHERE transaction_reference = 'PAY-DEMO-PENDING'), (SELECT voucher_id FROM vouchers WHERE title = 'Full Body Spa Treatment'), 1, 450000),
((SELECT order_id FROM orders WHERE transaction_reference = 'PAY-DEMO-CANCELLED'), (SELECT voucher_id FROM vouchers WHERE title = 'Nike Shopping Voucher 500K'), 1, 420000),
((SELECT order_id FROM orders WHERE transaction_reference = 'PAY-DEMO-REFUNDED'), (SELECT voucher_id FROM vouchers WHERE title = 'Japanese Dining Discovery'), 1, 350000);

-- Cancelled pending orders return reserved stock in the current application flow.
UPDATE vouchers
SET quantity_stock = quantity_stock + 1
WHERE title = 'Nike Shopping Voucher 500K'
  AND quantity_stock < total_quantity;

INSERT INTO e_vouchers (order_item_id, unique_code, status, expiry_date, used_at_branch_id, used_date)
VALUES
((SELECT oi.order_item_id FROM order_items oi JOIN orders o ON o.order_id = oi.order_id WHERE o.transaction_reference = 'PAY-DEMO-0001'), 'DLZ-SHER-0001', 'Unused', TIMESTAMP '2026-12-31 23:59:59', NULL, NULL),
((SELECT oi.order_item_id FROM order_items oi JOIN orders o ON o.order_id = oi.order_id WHERE o.transaction_reference = 'PAY-DEMO-0002'), 'DLZ-SAPA-0001', 'Used', TIMESTAMP '2026-11-15 23:59:59', (SELECT branch_id FROM branches WHERE branch_name = 'Fantastic Travel HCM'), CURRENT_TIMESTAMP),
((SELECT oi.order_item_id FROM order_items oi JOIN orders o ON o.order_id = oi.order_id WHERE o.transaction_reference = 'PAY-DEMO-0003'), 'DLZ-CGV-0001', 'Unused', TIMESTAMP '2026-08-31 23:59:59', NULL, NULL),
((SELECT oi.order_item_id FROM order_items oi JOIN orders o ON o.order_id = oi.order_id WHERE o.transaction_reference = 'PAY-DEMO-CANCELLED'), 'DLZ-NIKE-LOCKED-0001', 'Locked', TIMESTAMP '2026-09-30 23:59:59', NULL, NULL),
((SELECT oi.order_item_id FROM order_items oi JOIN orders o ON o.order_id = oi.order_id WHERE o.transaction_reference = 'PAY-DEMO-REFUNDED'), 'DLZ-SUSHI-LOCKED-0001', 'Locked', TIMESTAMP '2026-12-01 23:59:59', NULL, NULL);

INSERT INTO reviews (voucher_id, customer_id, rating, comment) VALUES
((SELECT voucher_id FROM vouchers WHERE title = 'Sheraton 5-Star Seafood Buffet'), (SELECT user_id FROM users WHERE username = 'customer_daniel'), 5, 'Great buffet and smooth voucher redemption.'),
((SELECT voucher_id FROM vouchers WHERE title = 'SaPa 3D2N Travel Combo'), (SELECT user_id FROM users WHERE username = 'customer_daniel'), 5, 'Good travel package for a demo order.'),
((SELECT voucher_id FROM vouchers WHERE title = 'CGV Movie Combo Ticket'), (SELECT user_id FROM users WHERE username = 'customer_minh'), 4, 'Simple checkout flow and clear e-voucher code.');

INSERT INTO complaints (customer_id, order_id, title, content, status, priority) VALUES
((SELECT user_id FROM users WHERE username = 'customer_daniel'), (SELECT order_id FROM orders WHERE transaction_reference = 'PAY-DEMO-0001'), 'Need invoice support', 'Customer requests invoice information for the buffet order.', 'Resolved', 'Normal'),
((SELECT user_id FROM users WHERE username = 'customer_minh'), (SELECT order_id FROM orders WHERE transaction_reference = 'PAY-DEMO-CANCELLED'), 'Cancelled order check', 'Customer asks why the cancelled order no longer has usable codes.', 'Processing', 'High');

INSERT INTO complaint_vouchers (complaint_id, voucher_id)
SELECT c.complaint_id, v.voucher_id
FROM complaints c
JOIN vouchers v ON v.title = 'Sheraton 5-Star Seafood Buffet'
WHERE c.title = 'Need invoice support';

INSERT INTO complaint_responses (complaint_id, responder_id, content, action_type)
VALUES
((SELECT complaint_id FROM complaints WHERE title = 'Need invoice support'), (SELECT user_id FROM users WHERE username = 'admin'), 'Invoice support request was acknowledged.', 'AdminReply'),
((SELECT complaint_id FROM complaints WHERE title = 'Cancelled order check'), (SELECT user_id FROM users WHERE username = 'admin'), 'Cancelled/refunded orders keep e-vouchers locked for consistency.', 'StatusUpdate');

INSERT INTO system_logs (user_id, action, table_name, record_id) VALUES
((SELECT user_id FROM users WHERE username = 'admin'), 'Seed database for submission', 'database', NULL),
((SELECT user_id FROM users WHERE username = 'admin'), 'Approve demo vouchers', 'vouchers', NULL),
((SELECT user_id FROM users WHERE username = 'admin'), 'Verify e-voucher consistency', 'e_vouchers', NULL);

-- ============================================================
-- 5. ORDER / E-VOUCHER CONSISTENCY MAINTENANCE
-- Same intent as 20260609_fix_order_evoucher_consistency.sql.
-- ============================================================

UPDATE e_vouchers ev
SET status = 'Locked'
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
WHERE ev.order_item_id = oi.order_item_id
  AND o.status <> 'Paid'
  AND ev.status <> 'Locked';

WITH paid_item_counts AS (
    SELECT
        oi.order_item_id,
        oi.quantity,
        v.expiry_date,
        COUNT(ev.evoucher_id) AS existing_count
    FROM order_items oi
    JOIN orders o ON o.order_id = oi.order_id
    JOIN vouchers v ON v.voucher_id = oi.voucher_id
    LEFT JOIN e_vouchers ev ON ev.order_item_id = oi.order_item_id
    WHERE o.status = 'Paid'
    GROUP BY oi.order_item_id, oi.quantity, v.expiry_date
),
missing_codes AS (
    SELECT
        order_item_id,
        expiry_date,
        generate_series(1, GREATEST(quantity - existing_count, 0)) AS seq_no
    FROM paid_item_counts
)
INSERT INTO e_vouchers (order_item_id, unique_code, status, expiry_date)
SELECT
    order_item_id,
    'DLZ-' || order_item_id || '-' || LPAD(seq_no::TEXT, 4, '0') || '-' ||
        UPPER(SUBSTRING(MD5(order_item_id::TEXT || '-' || seq_no::TEXT || '-' || clock_timestamp()::TEXT), 1, 6)),
    'Unused',
    expiry_date
FROM missing_codes;

-- Keep sequences aligned after explicit/seed inserts.
SELECT setval('users_user_id_seq', COALESCE((SELECT MAX(user_id) FROM users), 1), EXISTS (SELECT 1 FROM users));
SELECT setval('branches_branch_id_seq', COALESCE((SELECT MAX(branch_id) FROM branches), 1), EXISTS (SELECT 1 FROM branches));
SELECT setval('categories_category_id_seq', COALESCE((SELECT MAX(category_id) FROM categories), 1), EXISTS (SELECT 1 FROM categories));
SELECT setval('vouchers_voucher_id_seq', COALESCE((SELECT MAX(voucher_id) FROM vouchers), 1), EXISTS (SELECT 1 FROM vouchers));
SELECT setval('orders_order_id_seq', COALESCE((SELECT MAX(order_id) FROM orders), 1), EXISTS (SELECT 1 FROM orders));
SELECT setval('order_items_order_item_id_seq', COALESCE((SELECT MAX(order_item_id) FROM order_items), 1), EXISTS (SELECT 1 FROM order_items));
SELECT setval('e_vouchers_evoucher_id_seq', COALESCE((SELECT MAX(evoucher_id) FROM e_vouchers), 1), EXISTS (SELECT 1 FROM e_vouchers));
SELECT setval('system_logs_log_id_seq', COALESCE((SELECT MAX(log_id) FROM system_logs), 1), EXISTS (SELECT 1 FROM system_logs));
SELECT setval('content_items_content_id_seq', COALESCE((SELECT MAX(content_id) FROM content_items), 1), EXISTS (SELECT 1 FROM content_items));
SELECT setval('reviews_review_id_seq', COALESCE((SELECT MAX(review_id) FROM reviews), 1), EXISTS (SELECT 1 FROM reviews));
SELECT setval('complaints_complaint_id_seq', COALESCE((SELECT MAX(complaint_id) FROM complaints), 1), EXISTS (SELECT 1 FROM complaints));
SELECT setval('complaint_responses_response_id_seq', COALESCE((SELECT MAX(response_id) FROM complaint_responses), 1), EXISTS (SELECT 1 FROM complaint_responses));

COMMIT;

-- ============================================================
-- 6. POST-RUN VERIFICATION QUERIES
-- Expected result: all issue_count values are 0.
-- ============================================================

SELECT 'paid_missing_evouchers' AS check_name, COUNT(*)::INT AS issue_count
FROM (
    SELECT oi.order_item_id
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.order_id
    LEFT JOIN e_vouchers ev ON ev.order_item_id = oi.order_item_id
    WHERE o.status = 'Paid'
    GROUP BY oi.order_item_id, oi.quantity
    HAVING COUNT(ev.evoucher_id) <> oi.quantity
) x
UNION ALL
SELECT 'non_paid_unlocked_evouchers', COUNT(*)::INT
FROM e_vouchers ev
JOIN order_items oi ON oi.order_item_id = ev.order_item_id
JOIN orders o ON o.order_id = oi.order_id
WHERE o.status <> 'Paid' AND ev.status <> 'Locked'
UNION ALL
SELECT 'stock_out_of_range', COUNT(*)::INT
FROM vouchers
WHERE quantity_stock < 0 OR quantity_stock > total_quantity
UNION ALL
SELECT 'invalid_prices', COUNT(*)::INT
FROM vouchers
WHERE sale_price >= original_price OR sale_price < 0 OR original_price < 0
UNION ALL
SELECT 'invalid_dates', COUNT(*)::INT
FROM vouchers
WHERE expiry_date <= start_date
UNION ALL
SELECT 'duplicate_evoucher_codes', COUNT(*)::INT
FROM (
    SELECT unique_code
    FROM e_vouchers
    GROUP BY unique_code
    HAVING COUNT(*) > 1
) d;

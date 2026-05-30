-- Customer requirement migration for BR-CUS-01..08 support.
-- Safe to re-run on PostgreSQL.

BEGIN;

DELETE FROM reviews r
USING reviews newer
WHERE r.customer_id = newer.customer_id
  AND r.voucher_id = newer.voucher_id
  AND r.review_id > newer.review_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique_not_null
  ON users (lower(email))
  WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique_not_null
  ON users (phone)
  WHERE phone IS NOT NULL;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('Pending', 'Paid', 'Cancelled', 'Failed', 'Expired', 'Refunded'));

ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS reviews_customer_voucher_unique;

ALTER TABLE reviews
  ADD CONSTRAINT reviews_customer_voucher_unique
  UNIQUE (customer_id, voucher_id);

ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS order_id INTEGER;

ALTER TABLE complaints
  DROP CONSTRAINT IF EXISTS complaints_order_id_fkey;

ALTER TABLE complaints
  ADD CONSTRAINT complaints_order_id_fkey
  FOREIGN KEY (order_id)
  REFERENCES orders(order_id)
  ON DELETE SET NULL;

COMMIT;

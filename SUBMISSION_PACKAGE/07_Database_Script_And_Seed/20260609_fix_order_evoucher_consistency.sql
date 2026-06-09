-- Dealzy data maintenance script
-- Purpose:
-- 1. Lock E-Vouchers attached to orders that are no longer Paid.
-- 2. Backfill missing E-Vouchers for Paid orders so each purchased unit has one code.
--
-- Run this manually in the Supabase SQL editor after reviewing the affected rows.

BEGIN;

-- Preview inconsistent Paid orders before the fix.
WITH expected AS (
    SELECT o.order_id, o.status, COALESCE(SUM(oi.quantity), 0)::int AS expected_codes
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.order_id
    WHERE o.status = 'Paid'
    GROUP BY o.order_id, o.status
),
actual AS (
    SELECT oi.order_id, COUNT(ev.evoucher_id)::int AS actual_codes
    FROM order_items oi
    LEFT JOIN e_vouchers ev ON ev.order_item_id = oi.order_item_id
    GROUP BY oi.order_id
)
SELECT e.order_id, e.status, e.expected_codes, COALESCE(a.actual_codes, 0) AS actual_codes
FROM expected e
LEFT JOIN actual a ON a.order_id = e.order_id
WHERE COALESCE(a.actual_codes, 0) <> e.expected_codes
ORDER BY e.order_id;

-- Codes attached to cancelled, failed, expired, or refunded orders must not be usable.
UPDATE e_vouchers ev
SET status = 'Locked'
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
WHERE ev.order_item_id = oi.order_item_id
  AND o.status <> 'Paid'
  AND ev.status <> 'Locked';

-- Backfill missing codes for Paid order items.
DO $$
DECLARE
    item_row record;
    generated_code text;
    inserted boolean;
BEGIN
    FOR item_row IN
        SELECT
            oi.order_item_id,
            v.expiry_date,
            GREATEST(oi.quantity - COUNT(ev.evoucher_id), 0)::int AS missing_count
        FROM order_items oi
        JOIN orders o ON o.order_id = oi.order_id
        JOIN vouchers v ON v.voucher_id = oi.voucher_id
        LEFT JOIN e_vouchers ev ON ev.order_item_id = oi.order_item_id
        WHERE o.status = 'Paid'
        GROUP BY oi.order_item_id, oi.quantity, v.expiry_date
        HAVING COUNT(ev.evoucher_id) < oi.quantity
    LOOP
        FOR i IN 1..item_row.missing_count LOOP
            inserted := false;
            WHILE NOT inserted LOOP
                generated_code := 'DLZ' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 9));
                BEGIN
                    INSERT INTO e_vouchers (order_item_id, unique_code, status, expiry_date)
                    VALUES (item_row.order_item_id, generated_code, 'Unused', item_row.expiry_date);
                    inserted := true;
                EXCEPTION WHEN unique_violation THEN
                    inserted := false;
                END;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Verify no Paid order is missing codes after the fix.
WITH expected AS (
    SELECT o.order_id, o.status, COALESCE(SUM(oi.quantity), 0)::int AS expected_codes
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.order_id
    WHERE o.status = 'Paid'
    GROUP BY o.order_id, o.status
),
actual AS (
    SELECT oi.order_id, COUNT(ev.evoucher_id)::int AS actual_codes
    FROM order_items oi
    LEFT JOIN e_vouchers ev ON ev.order_item_id = oi.order_item_id
    GROUP BY oi.order_id
)
SELECT e.order_id, e.status, e.expected_codes, COALESCE(a.actual_codes, 0) AS actual_codes
FROM expected e
LEFT JOIN actual a ON a.order_id = e.order_id
WHERE COALESCE(a.actual_codes, 0) <> e.expected_codes
ORDER BY e.order_id;

COMMIT;

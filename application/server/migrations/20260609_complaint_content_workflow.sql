-- Complaint workflow and public content support.
-- Safe to re-run on PostgreSQL.

BEGIN;

ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS admin_note TEXT,
  ADD COLUMN IF NOT EXISTS resolution_type VARCHAR(40) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS resolution_note TEXT,
  ADD COLUMN IF NOT EXISTS refund_status VARCHAR(40) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS voucher_id INTEGER,
  ADD COLUMN IF NOT EXISTS attempt_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reviewed_by INTEGER,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE content_items
  ADD COLUMN IF NOT EXISTS slug VARCHAR(120),
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_by INTEGER,
  ADD COLUMN IF NOT EXISTS updated_by INTEGER,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE content_items
SET slug = COALESCE(slug, content_key),
    status = CASE WHEN is_active THEN COALESCE(status, 'published') ELSE 'archived' END,
    published_at = COALESCE(published_at, updated_at, NOW())
WHERE slug IS NULL OR published_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_items_slug_unique
  ON content_items (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_complaints_order_status
  ON complaints (order_id, status);

CREATE INDEX IF NOT EXISTS idx_content_items_public
  ON content_items (status, type, published_at);

COMMIT;

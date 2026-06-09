-- Keep a separate published snapshot so draft edits do not affect customer pages.
-- Safe to re-run on PostgreSQL.

BEGIN;

ALTER TABLE content_items
  ADD COLUMN IF NOT EXISTS published_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS published_summary TEXT,
  ADD COLUMN IF NOT EXISTS published_body TEXT,
  ADD COLUMN IF NOT EXISTS published_template VARCHAR(50),
  ADD COLUMN IF NOT EXISTS published_data JSONB,
  ADD COLUMN IF NOT EXISTS published_version INTEGER;

UPDATE content_items
SET published_title = COALESCE(published_title, title),
    published_summary = COALESCE(published_summary, summary),
    published_body = COALESCE(published_body, body),
    published_template = COALESCE(published_template, template),
    published_data = COALESCE(published_data, data),
    published_version = COALESCE(published_version, version)
WHERE status = 'published'
  AND is_active = TRUE;

COMMIT;

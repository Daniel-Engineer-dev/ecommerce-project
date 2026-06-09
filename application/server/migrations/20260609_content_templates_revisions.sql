-- Structured content templates and revision history for admin-managed pages.
-- Safe to re-run on PostgreSQL.

BEGIN;

ALTER TABLE content_items
  ADD COLUMN IF NOT EXISTS template VARCHAR(50),
  ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_action VARCHAR(50);

CREATE TABLE IF NOT EXISTS content_item_revisions (
  revision_id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES content_items(content_id) ON DELETE CASCADE,
  content_key VARCHAR(80) NOT NULL,
  action VARCHAR(50) NOT NULL,
  before_data JSONB,
  after_data JSONB,
  before_status VARCHAR(30),
  after_status VARCHAR(30),
  changed_by INTEGER REFERENCES users(user_id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_item_revisions_content_id
  ON content_item_revisions (content_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_items_template
  ON content_items (template);

COMMIT;

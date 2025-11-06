DROP TABLE IF EXISTS file;
DROP TABLE IF EXISTS record;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS folder;
DROP TABLE IF EXISTS "user";

CREATE TABLE IF NOT EXISTS "user" (
  id               UUID PRIMARY KEY,
  activation_token CHAR(32),
  email            VARCHAR(128) UNIQUE NOT NULL,
  hash             CHAR(97)            NOT NULL,
  name             VARCHAR(64)         NOT NULL,
  notifications    BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS folder (
  id               UUID PRIMARY KEY,
  parent_folder_id UUID,
  user_id          UUID,
  name             VARCHAR(64) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES "user" (id),
  FOREIGN KEY (parent_folder_id) REFERENCES folder (id)
);
CREATE INDEX ON folder (user_id);
CREATE INDEX ON folder (parent_folder_id);

CREATE TABLE IF NOT EXISTS category (
  id    UUID PRIMARY KEY,
  color VARCHAR(32)        NOT NULL,
  icon  VARCHAR(128)       NOT NULL,
  name  VARCHAR(32) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS record (
  id               UUID PRIMARY KEY,
  folder_id        UUID,
  category_id      UUID,
  amount           DECIMAL(10, 2),
  company_name     VARCHAR(64) NOT NULL,
  coupon_code      VARCHAR(32),
  description      VARCHAR(512),
  exp_date         TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  name             VARCHAR(32) NOT NULL,
  notify_on        BOOLEAN DEFAULT FALSE,
  product_id       VARCHAR(32),
  purchase_date    TIMESTAMPTZ,
  warranty_exp     TIMESTAMPTZ,
  FOREIGN KEY (folder_id) REFERENCES folder (id),
  FOREIGN KEY (category_id) REFERENCES category (id)
);
CREATE INDEX ON record (folder_id);
CREATE INDEX ON record (category_id);

CREATE TABLE IF NOT EXISTS file (
  id            UUID PRIMARY KEY,
  record_id     UUID,
--description   VARCHAR(256),
  file_date     DATE,
  file_key      VARCHAR(32),
  file_url      VARCHAR(256) NOT NULL,
  is_starred    BOOLEAN DEFAULT FALSE,
  ocr_data      TEXT,
  FOREIGN KEY (record_id) REFERENCES record (id)
);
CREATE INDEX ON file (record_id);
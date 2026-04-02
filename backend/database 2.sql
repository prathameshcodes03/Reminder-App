-- ============================================================
--  RemindMe App — MySQL Database Schema
--  Run this file in MySQL Workbench or terminal:
--  mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS remindme_db;
USE remindme_db;

-- ── Users Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  phone       VARCHAR(20)   DEFAULT '',
  role        VARCHAR(100)  DEFAULT 'Student',
  joined      VARCHAR(50)   DEFAULT '',
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── Reminders Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reminders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  title         VARCHAR(200)  NOT NULL,
  description   TEXT          DEFAULT '',
  iso_date      VARCHAR(50)   NOT NULL,
  display_date  VARCHAR(50)   DEFAULT '',
  display_time  VARCHAR(50)   DEFAULT '',
  is_done       TINYINT(1)    DEFAULT 0,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Indexes for performance ───────────────────────────────────
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_users_email       ON users(email);

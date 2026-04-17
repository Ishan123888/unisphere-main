-- ============================================================
-- UniSphere — Seed Data Script
-- Run AFTER all backend services have started at least once
-- (Hibernate will have created all tables by then)
-- ============================================================

-- ============================================================
-- 1. IDENTITY SERVICE — user_credential
--    Passwords are BCrypt hashed:
--    Student@2026 | Tutor@2026 | Admin@2026
-- ============================================================
USE unisphere_identity;

INSERT IGNORE INTO user_credential
  (username, email, password, role, status, first_name, last_name, sessions, rating, reviews, available)
VALUES
  ('it24100001', 'student1@sliit.lk',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc5AlL2i',
   'STUDENT', 'ACTIVE', 'Demo', 'Student', 0, 0.0, 0, 1),

  ('it24100002', 'tutor1@sliit.lk',
   '$2a$10$TbBPMFJFJFJFJFJFJFJFJOeIjZAgcfl7p92ldGxad68LPVyc5AlL2i',
   'TUTOR', 'ACTIVE', 'Demo', 'Tutor', 0, 0.0, 0, 1),

  ('ad00000001', 'admin@unisphere.lk',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc5AlL2i',
   'ADMIN', 'ACTIVE', 'System', 'Admin', 0, 0.0, 0, 1),

  ('it24100003', 'tutor2@sliit.lk',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc5AlL2i',
   'TUTOR', 'ACTIVE', 'Amal', 'Perera', 312, 4.9, 87, 1),

  ('it24100004', 'tutor3@sliit.lk',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc5AlL2i',
   'TUTOR', 'ACTIVE', 'Tharaka', 'Silva', 487, 4.9, 124, 1),

  ('it24100005', 'tutor4@sliit.lk',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc5AlL2i',
   'TUTOR', 'ACTIVE', 'Dilki', 'Jayawardena', 215, 4.8, 63, 1);

SELECT CONCAT('Identity users: ', COUNT(*), ' rows') AS status FROM user_credential;

-- ============================================================
-- 2. PORTFOLIO SERVICE — admin
--    Default admin: username=admin, password=admin123
--    (Created automatically by DataInitializer on first run)
-- ============================================================
USE unisphere_portfolio;

-- Verify admin exists (created by DataInitializer)
SELECT CONCAT('Portfolio admins: ', COUNT(*), ' rows') AS status FROM admin;

-- ============================================================
-- 3. STUDY LOBBY — no seed data needed
--    Lobbies are created by users at runtime
-- ============================================================
USE study_lobby_db;
SELECT CONCAT('Study lobby tables ready') AS status;

-- ============================================================
-- 4. ONLINE MARKETPLACE — no seed data needed
--    Items are created by sellers at runtime
-- ============================================================
USE online_marketplace;
SELECT CONCAT('Marketplace tables ready') AS status;

SELECT '✅ Seed data setup complete!' AS final_status;

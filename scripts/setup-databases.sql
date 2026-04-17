-- ============================================================
-- UniSphere — Full Database Setup Script
-- Run once before starting any service
-- Usage: paste into MySQL Workbench or run via PowerShell
-- ============================================================

-- 1. Create all databases
CREATE DATABASE IF NOT EXISTS unisphere_identity  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS study_lobby_db      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS online_marketplace  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS unisphere_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- NOTE: All tables are auto-created by Hibernate (ddl-auto=update)
-- The seed data below is inserted AFTER services start.
-- Run setup-seed-data.sql AFTER all services are running.
-- ============================================================

SELECT 'Databases created successfully!' AS status;
SHOW DATABASES;

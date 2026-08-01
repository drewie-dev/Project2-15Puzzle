-- Run with: mysql -u root -p < sql/schema.sql
-- (command-line only, per assignment policy — no GUI DB tools)

CREATE DATABASE IF NOT EXISTS puzzle15
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE puzzle15;

CREATE TABLE IF NOT EXISTS scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_name VARCHAR(20) NOT NULL,
  mode VARCHAR(20) NOT NULL,
  moves INT NOT NULL,
  solve_time INT NOT NULL,          -- seconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mode_moves (mode, moves)
);
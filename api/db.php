<?php
// Database connection settings.
// Update these values for your environment before deploying.
// Do NOT commit real credentials — use environment-specific values.

$DB_HOST = getenv('PUZZLE_DB_HOST') ?: 'localhost';
$DB_NAME = getenv('PUZZLE_DB_NAME') ?: 'puzzle15';
$DB_USER = getenv('PUZZLE_DB_USER') ?: 'root';
$DB_PASS = getenv('PUZZLE_DB_PASS') ?: '';

function get_db_connection() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;

    try {
        $pdo = new PDO(
            "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
            $DB_USER,
            $DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        // Connection failed; calling scripts should catch this
        // and fall back to a safe JSON error response.
        return null;
    }
}
<?php
// Database connection settings.
// Real credentials live in api/config.php, which is gitignored and
// never committed. Copy api/config.example.php to api/config.php and
// fill in your actual username/password there.

require_once __DIR__ . '/config.php';

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
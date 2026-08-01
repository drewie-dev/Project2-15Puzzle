<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$VALID_MODES = ['boardwalk', 'tidepool', 'sunset'];

$mode = isset($_GET['mode']) ? trim($_GET['mode']) : '';

if (!in_array($mode, $VALID_MODES, true)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Invalid mode']);
    exit;
}

$pdo = get_db_connection();

if ($pdo === null) {
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => 'Database unavailable']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT player_name, mode, moves, solve_time
         FROM scores
         WHERE mode = ?
         ORDER BY moves ASC, solve_time ASC
         LIMIT 10'
    );
    $stmt->execute([$mode]);
    $rows = $stmt->fetchAll();
    echo json_encode(['success' => true, 'scores' => $rows]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Could not load leaderboard']);
}
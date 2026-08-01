<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$VALID_MODES = ['boardwalk', 'tidepool', 'sunset'];

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request body']);
    exit;
}

$player = isset($input['player']) ? trim($input['player']) : '';
$mode = isset($input['mode']) ? trim($input['mode']) : '';
$moves = isset($input['moves']) ? (int) $input['moves'] : -1;
$time = isset($input['time']) ? (int) $input['time'] : -1;

// ---------- Validation ----------
if ($player === '' || strlen($player) > 20) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Player name must be 1-20 characters']);
    exit;
}

if (!in_array($mode, $VALID_MODES, true)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Invalid mode']);
    exit;
}

if ($moves < 0 || $moves > 5000) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Invalid move count']);
    exit;
}

if ($time < 0 || $time > 86400) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Invalid solve time']);
    exit;
}

// ---------- Save ----------
$pdo = get_db_connection();

if ($pdo === null) {
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => 'Database unavailable']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'INSERT INTO scores (player_name, mode, moves, solve_time) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$player, $mode, $moves, $time]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Could not save score']);
}
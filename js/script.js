// ---------- Theme tile icons ----------
// Each theme maps tile numbers 1-15 to an icon. These are placeholder
// emoji so the puzzle is themed out of the box; swap for custom image

function themePhotoPath(theme) {
  return `assets/photos/${theme}.jpg`;
}

function tileBackgroundPosition(number) {
  const homeIndex = number - 1; // 0-14, home slot for this tile
  const row = Math.floor(homeIndex / SIZE);
  const col = homeIndex % SIZE;
  const step = 100 / (SIZE - 1); // 33.333% steps across a 4x4 grid
  return `${col * step}% ${row * step}%`;
}

// ---------- Track config (Undergrad vs Graduate) ----------
// Graduate track: stronger randomization, more limited hint support,
// to emphasize strategy over assisted play (per hub track expectations).
const TRACKS = {
  undergrad: { shuffleMoves: 240, maxHints: 3 },
  graduate: { shuffleMoves: 400, maxHints: 1 },
};
let currentTrack = "undergrad";

document.querySelectorAll('input[name="track"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    currentTrack = e.target.value;
  });
});

// ---------- Puzzle state ----------
const SIZE = 4;
const EMPTY = 16; // represents the blank tile

let tiles = []; // array of 16 numbers, 1-15 plus EMPTY, index = board position
let moveCount = 0;
let currentTheme = "boardwalk";

const boardEl = document.getElementById("board");
const moveCountEl = document.getElementById("move-count");

function createSolvedBoard() {
  const arr = [];
  for (let i = 1; i <= 15; i++) arr.push(i);
  arr.push(EMPTY);
  return arr;
}

function renderBoard() {
  boardEl.innerHTML = "";
  tiles.forEach((value, index) => {
    const tileEl = document.createElement("div");
    tileEl.className = "tile" + (value === EMPTY ? " empty" : "");
    tileEl.dataset.index = index;
    if (value !== EMPTY) tileEl.tabIndex = 0;
    if (value !== EMPTY) {
      tileEl.style.backgroundImage = `url(${themePhotoPath(currentTheme)})`;
      tileEl.style.backgroundPosition = tileBackgroundPosition(value);
      tileEl.style.backgroundSize = `${SIZE * 100}% ${SIZE * 100}%`;
      tileEl.innerHTML = `<span class="tile-number">${value}</span>`;
    }
    boardEl.appendChild(tileEl);
  });
}

// ---------- Shuffle ----------
// Shuffles by making random valid slide moves from the solved state.
// This guarantees the result is always solvable, unlike a random
// permutation (half of which are unsolvable for the 15 puzzle).
const SHUFFLE_MOVES = 240; // fallback; overridden by TRACKS[currentTrack].shuffleMoves

function getEmptyIndex() {
  return tiles.indexOf(EMPTY);
}

function getNeighborIndices(index) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const neighbors = [];
  if (row > 0) neighbors.push(index - SIZE);
  if (row < SIZE - 1) neighbors.push(index + SIZE);
  if (col > 0) neighbors.push(index - 1);
  if (col < SIZE - 1) neighbors.push(index + 1);
  return neighbors;
}

function shuffleBoard() {
  tiles = createSolvedBoard();
  let emptyIndex = getEmptyIndex();
  let lastIndex = -1;

  const shuffleMoves = TRACKS[currentTrack].shuffleMoves;
  for (let i = 0; i < shuffleMoves; i++) {
    const neighbors = getNeighborIndices(emptyIndex).filter(n => n !== lastIndex);
    const swapWith = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[emptyIndex], tiles[swapWith]] = [tiles[swapWith], tiles[emptyIndex]];
    lastIndex = emptyIndex;
    emptyIndex = swapWith;
  }

  moveCount = 0;
  moveCountEl.textContent = moveCount;
  lastMoveDestination = null;
  renderBoard();
  winMessageEl.classList.add("hidden");
  startTimer();
  hintsRemaining = TRACKS[currentTrack].maxHints;
  hintCountEl.textContent = hintsRemaining;
  hintBtn.disabled = false;
}

document.getElementById("shuffle-btn").addEventListener("click", shuffleBoard);
document.getElementById("reset-btn").addEventListener("click", shuffleBoard);

// ---------- Timer ----------
const timerEl = document.getElementById("timer");
let elapsedSeconds = 0;
let timerInterval = null;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function startTimer() {
  stopTimer();
  elapsedSeconds = 0;
  timerEl.textContent = formatTime(elapsedSeconds);
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    timerEl.textContent = formatTime(elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ---------- Move handling ----------
let lastMoveDestination = null; // where the last-moved tile ended up

function isAdjacent(indexA, indexB) {
  return getNeighborIndices(indexA).includes(indexB);
}

function tryMoveTile(index) {
  const emptyIndex = getEmptyIndex();
  if (!isAdjacent(index, emptyIndex)) return false;

  [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
  lastMoveDestination = emptyIndex; // the tile that moved now lives here
  moveCount++;
  moveCountEl.textContent = moveCount;
  renderBoard();
  return true;
}

boardEl.addEventListener("click", (e) => {
  const tileEl = e.target.closest(".tile");
  if (!tileEl || tileEl.classList.contains("empty")) return;
  const index = parseInt(tileEl.dataset.index, 10);
  const moved = tryMoveTile(index);
  if (moved && isSolved()) {
    handleSolved();
  }
});

// ---------- Analytics ----------
const STATS_KEY = "puzzle15_stats";
const MODE_LABELS = { boardwalk: "Beach Boardwalk", tidepool: "Tide Pool", sunset: "Sunset Skyline" };

function getStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || [];
  } catch {
    return [];
  }
}

function recordSolve(mode, moves, time) {
  const stats = getStats();
  stats.push({ mode, moves, time });
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function updateAnalytics(mode) {
  const entries = getStats().filter((s) => s.mode === mode);
  document.getElementById("analytics-mode-label").textContent = MODE_LABELS[mode] || mode;
  document.getElementById("stat-games").textContent = entries.length;

  if (entries.length === 0) {
    document.getElementById("stat-best-moves").textContent = "—";
    document.getElementById("stat-best-time").textContent = "—";
    document.getElementById("stat-avg-moves").textContent = "—";
    return;
  }

  const bestMoves = Math.min(...entries.map((e) => e.moves));
  const bestTime = Math.min(...entries.map((e) => e.time));
  const avgMoves = Math.round(entries.reduce((sum, e) => sum + e.moves, 0) / entries.length);

  document.getElementById("stat-best-moves").textContent = bestMoves;
  document.getElementById("stat-best-time").textContent = formatTime(bestTime);
  document.getElementById("stat-avg-moves").textContent = avgMoves;
}

// ---------- Win detection ----------
function isSolved() {
  for (let i = 0; i < 15; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[15] === EMPTY;
}

const winMessageEl = document.getElementById("win-message");
const winSummaryEl = document.getElementById("win-summary");

function handleSolved() {
  stopTimer();
  winSummaryEl.textContent = `${moveCount} moves, ${formatTime(elapsedSeconds)}`;
  winMessageEl.classList.remove("hidden");
  recordSolve(currentTheme, moveCount, elapsedSeconds);
  updateAnalytics(currentTheme);
}

// ---------- Magic hint (Undergrad track) ----------
let hintsRemaining = TRACKS[currentTrack].maxHints;
const hintCountEl = document.getElementById("hint-count");
const hintBtn = document.getElementById("hint-btn");

function homeDistance(index, value) {
  // Manhattan distance between a board index and the tile's solved home
  const home = value - 1;
  const r1 = Math.floor(index / SIZE), c1 = index % SIZE;
  const r2 = Math.floor(home / SIZE), c2 = home % SIZE;
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

function findHintMove() {
  const emptyIndex = getEmptyIndex();
  const neighbors = getNeighborIndices(emptyIndex);
  const candidates = neighbors.filter((n) => tiles[n] !== EMPTY);

  let best = null;
  let bestScore = -Infinity;

  candidates.forEach((n) => {
    const value = tiles[n];
    if (value === n + 1) return; // already home, not a useful hint

    let score = homeDistance(n, value) - homeDistance(emptyIndex, value);
    if (n === lastMoveDestination) score -= 10; // avoid suggesting an undo

    if (score > bestScore) {
      bestScore = score;
      best = n;
    }
  });

  return best !== null ? best : (candidates[0] ?? neighbors[0]);
}

hintBtn.addEventListener("click", () => {
  if (hintsRemaining <= 0) return;
  const index = findHintMove();
  const tileEl = boardEl.querySelector(`[data-index="${index}"]`);
  if (tileEl) {
    tileEl.classList.add("hint-glow");
    setTimeout(() => tileEl.classList.remove("hint-glow"), 1500);
  }
  hintsRemaining--;
  hintCountEl.textContent = hintsRemaining;
  hintBtn.disabled = hintsRemaining <= 0;
});

// ---------- Scores: API with local storage fallback ----------
const LOCAL_KEY = 'puzzle15_scores';

function getLocalScores() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalScore(entry) {
  const scores = getLocalScores();
  scores.push(entry);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(scores));
}

function getLocalLeaderboard(mode) {
  return getLocalScores()
    .filter((s) => s.mode === mode)
    .sort((a, b) => a.moves - b.moves || a.time - b.time)
    .slice(0, 10);
}

async function saveScore(player, mode, moves, time) {
  const payload = { player, mode, moves, time };
  try {
    const res = await fetch('api/save_score.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Save failed');
  } catch (err) {
    // API/database unavailable — fall back to local storage
    saveLocalScore(payload);
  }
}

async function loadLeaderboard(mode) {
  const bodyEl = document.getElementById('leaderboard-body');
  let scores = [];
  try {
    const res = await fetch(`api/get_leaderboard.php?mode=${encodeURIComponent(mode)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Load failed');
    scores = data.scores.map((s) => ({
      player: s.player_name, mode: s.mode, moves: s.moves, time: s.solve_time,
    }));
  } catch (err) {
    scores = getLocalLeaderboard(mode);
  }

  bodyEl.innerHTML = scores.map((s) => `
    <tr>
      <td>${escapeHtml(s.player)}</td>
      <td>${escapeHtml(s.mode)}</td>
      <td>${s.moves}</td>
      <td>${formatTime(s.time)}</td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Theme switching ----------
const modeButtons = document.querySelectorAll(".mode-btn");

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentTheme = btn.dataset.theme;
    document.body.dataset.theme = currentTheme;
    renderBoard();
    loadLeaderboard(currentTheme);
    updateAnalytics(currentTheme);
  });
});

document.getElementById('save-score-btn').addEventListener('click', async () => {
  const nameInput = document.getElementById('player-name');
  const player = nameInput.value.trim() || 'Anonymous';
  await saveScore(player, currentTheme, moveCount, elapsedSeconds);
  winMessageEl.classList.add('hidden');
  nameInput.value = '';
  loadLeaderboard(currentTheme);
});

// ---------- Init ----------
tiles = createSolvedBoard();
renderBoard();
document.body.dataset.theme = currentTheme;
hintCountEl.textContent = hintsRemaining;
loadLeaderboard(currentTheme);
updateAnalytics(currentTheme);
// ---------- Theme tile icons ----------
// Each theme maps tile numbers 1-15 to an icon. These are placeholder
// emoji so the puzzle is themed, will swap for custom image

const THEME_ICONS = {
  boardwalk: ["🍦","🏄","🩴","🕶️","🎡","🍉","🦩","⛱️","🍹","🎠","🩱","🌴","🏖️","🍧","☀️"],
  tidepool:  ["🐚","⭐","🐠","🪸","🦀","🐬","🌊","🐡","🦑","🐢","🦐","🪼","🐙","🫧","🐋"],
  sunset:    ["🌅","🌴","☀️","🌊","🦩","🏝️","🌇","🐚","⛵","🌤️","🦜","🍹","🌺","🪷","🌙"],
};

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
    if (value !== EMPTY) {
      const icon = THEME_ICONS[currentTheme][value - 1];
      tileEl.innerHTML = `<span class="tile-icon">${icon}</span><span class="tile-number">${value}</span>`;
    }
    boardEl.appendChild(tileEl);
  });
}

// ---------- Shuffle ----------
// Shuffles by making random valid slide moves from the solved state.
// This guarantees the result is always solvable, unlike a random
// permutation (half of which are unsolvable for the 15 puzzle).
const SHUFFLE_MOVES = 240;

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

  for (let i = 0; i < SHUFFLE_MOVES; i++) {
    const neighbors = getNeighborIndices(emptyIndex).filter(n => n !== lastIndex);
    const swapWith = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[emptyIndex], tiles[swapWith]] = [tiles[swapWith], tiles[emptyIndex]];
    lastIndex = emptyIndex;
    emptyIndex = swapWith;
  }

  moveCount = 0;
  moveCountEl.textContent = moveCount;
  renderBoard();
  winMessageEl.classList.add("hidden");
  startTimer();
  hintsRemaining = MAX_HINTS;
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
function isAdjacent(indexA, indexB) {
  return getNeighborIndices(indexA).includes(indexB);
}

function tryMoveTile(index) {
  const emptyIndex = getEmptyIndex();
  if (!isAdjacent(index, emptyIndex)) return false;

  [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
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
}

// ---------- Magic hint (Undergrad track) ----------
const MAX_HINTS = 3;
let hintsRemaining = MAX_HINTS;
const hintCountEl = document.getElementById("hint-count");
const hintBtn = document.getElementById("hint-btn");

function findHintMove() {
  // Find a tile that is not in its solved position and is adjacent
  // to the empty slot; sliding it is always a legal, useful move.
  const emptyIndex = getEmptyIndex();
  const neighbors = getNeighborIndices(emptyIndex);
  for (const n of neighbors) {
    if (tiles[n] !== EMPTY && tiles[n] !== n + 1) {
      return n;
    }
  }
  return neighbors[0];
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
loadLeaderboard(currentTheme);
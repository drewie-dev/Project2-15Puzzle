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

// ---------- Init ----------
tiles = createSolvedBoard();
renderBoard();
document.body.dataset.theme = currentTheme;
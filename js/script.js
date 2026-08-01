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
      tileEl.textContent = value;
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
  tryMoveTile(index);
});

tiles = createSolvedBoard();
renderBoard();
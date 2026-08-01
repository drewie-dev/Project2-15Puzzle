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

tiles = createSolvedBoard();
renderBoard();
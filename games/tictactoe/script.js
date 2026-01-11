const board = document.getElementById("board");
const statusText = document.getElementById("status");

let currentPlayer = "X";
let cells = Array(9).fill("");

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function createBoard() {
  board.innerHTML = "";
  cells.forEach((_, i) => {
    const div = document.createElement("div");
    div.className = "cell";
    div.onclick = () => play(i);
    board.appendChild(div);
  });
}

function play(i) {
  if (cells[i]) return;

  cells[i] = currentPlayer;
  board.children[i].textContent = currentPlayer;

  if (checkWin()) {
    statusText.textContent = `${currentPlayer} wins!`;
    board.style.pointerEvents = "none";
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function checkWin() {
  return winPatterns.some(p =>
    p.every(i => cells[i] === currentPlayer)
  );
}

function resetGame() {
  cells = Array(9).fill("");
  currentPlayer = "X";
  board.style.pointerEvents = "auto";
  statusText.textContent = "Player X's turn";
  createBoard();
}

createBoard();
statusText.textContent = "Player X's turn";

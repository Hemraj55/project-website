const secret = Math.floor(Math.random() * 100) + 1;
const result = document.getElementById("result");

function check() {
  const guess = Number(document.getElementById("guess").value);

  if (!guess) return;

  if (guess === secret) {
    result.textContent = "🎉 Correct! You win!";
  } else if (guess > secret) {
    result.textContent = "📉 Too high!";
  } else {
    result.textContent = "📈 Too low!";
  }
}

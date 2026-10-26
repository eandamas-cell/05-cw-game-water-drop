/* DROP ZONE - Water Drop Game */

const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const startButton = document.getElementById("start-btn");
const resetButton = document.getElementById("reset-btn");
const gameMessage = document.getElementById("game-message");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

let score = 0;
let timeLeft = 30;
let gameRunning = false;
let dropMaker = null;
let countdown = null;

const goal = 100;

// Start the game
startButton.addEventListener("click", startGame);

// Reset the game
resetButton.addEventListener("click", resetGame);

function startGame() {
  if (gameRunning) return;

  clearInterval(dropMaker);
  clearInterval(countdown);
  clearDrops();

  score = 0;
  timeLeft = 30;
  gameRunning = true;

  updateDisplay();
  gameMessage.classList.add("hidden");

  // Make a drop immediately
  createDrop();

  // Create more drops every 650 milliseconds
  dropMaker = setInterval(createDrop, 650);

  // Count down every second
  countdown = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

function createDrop() {
  if (!gameRunning) return;

  const drop = document.createElement("div");
  drop.classList.add("water-drop");

  // 25% chance of a polluted drop
  const isBad = Math.random() < 0.25;

  if (isBad) {
    drop.classList.add("bad-drop");
    drop.setAttribute("aria-label", "Polluted water drop");
  } else {
    drop.setAttribute("aria-label", "Clean water drop");
  }

  drop.setAttribute("role", "button");
  drop.setAttribute("tabindex", "0");

  // Random sizes
  const size = Math.random() * 20 + 35;
  drop.style.width = size + "px";
  drop.style.height = size * 1.15 + "px";

  // Random horizontal position
  const gameWidth = gameContainer.clientWidth;
  const x = Math.random() * Math.max(0, gameWidth - size - 10);

  drop.style.left = x + "px";

  // Random falling speed
  const duration = Math.random() * 1.5 + 2.5;
  drop.style.animationDuration = duration + "s";

  // Click or tap to collect
  drop.addEventListener("click", () => {
    collectDrop(drop, isBad);
  });

  // Keyboard accessibility
  drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      collectDrop(drop, isBad);
    }
  });

  // Remove missed drops
  drop.addEventListener("animationend", () => {
    drop.remove();
  });

  gameContainer.appendChild(drop);
}

function collectDrop(drop, isBad) {
  if (!gameRunning || !drop.isConnected) return;

  if (isBad) {
    score = Math.max(0, score - 5);
    showPoints(drop, "-5", "#f5402c");
  } else {
    score += 10;
    showPoints(drop, "+10", "#159a48");
  }

  drop.remove();
  updateDisplay();

  if (score >= goal) {
    endGame(true);
  }
}

// Display points where the drop was collected
function showPoints(drop, text, color) {
  const points = document.createElement("div");

  points.textContent = text;
  points.style.position = "absolute";
  points.style.left = drop.style.left;
  points.style.top = drop.offsetTop + "px";
  points.style.color = color;
  points.style.fontSize = "22px";
  points.style.fontWeight = "bold";
  points.style.zIndex = "5";
  points.style.pointerEvents = "none";

  gameContainer.appendChild(points);

  setTimeout(() => {
    points.remove();
  }, 600);
}

function updateDisplay() {
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;

  const progress = Math.min((score / goal) * 100, 100);
  progressBar.style.width = progress + "%";

  progressText.textContent =
    score >= goal
      ? "Goal reached!"
      : `${score} / ${goal} points collected`;
}

function endGame(won) {
  gameRunning = false;

  clearInterval(dropMaker);
  clearInterval(countdown);
  dropMaker = null;
  countdown = null;

  clearDrops();

  if (won) {
    gameMessage.innerHTML = `
      <div class="message-icon">🏆</div>
      <h2>YOU DID IT!</h2>
      <p>You collected enough clean water to reach your goal. Every drop counts!</p>
      <button id="start-btn">PLAY AGAIN</button>
    `;

    createConfetti();
  } else {
    gameMessage.innerHTML = `
      <div class="message-icon">💧</div>
      <h2>TIME'S UP!</h2>
      <p>You collected ${score} points. Keep going and see if you can reach 100!</p>
      <button id="start-btn">TRY AGAIN</button>
    `;
  }

  gameMessage.classList.remove("hidden");

  // The button was recreated, so attach its click event again
  document.getElementById("start-btn").addEventListener("click", startGame);
}

function resetGame() {
  gameRunning = false;

  clearInterval(dropMaker);
  clearInterval(countdown);
  dropMaker = null;
  countdown = null;

  clearDrops();

  score = 0;
  timeLeft = 30;

  updateDisplay();

  gameMessage.innerHTML = `
    <div class="message-icon">💧</div>
    <h2>Ready to make a splash?</h2>
    <p>Collect blue drops and avoid polluted drops before time runs out.</p>
    <button id="start-btn">START GAME</button>
  `;

  gameMessage.classList.remove("hidden");

  document.getElementById("start-btn").addEventListener("click", startGame);
}

function clearDrops() {
  document.querySelectorAll(".water-drop, .confetti").forEach((element) => {
    element.remove();
  });
}

function createConfetti() {
  const colors = ["#ffc907", "#2e9df7", "#4fcb53", "#ff902a", "#f16061"];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";

    piece.style.left = Math.random() * 100 + "%";
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.8 + "s";

    gameContainer.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, 3500);
  }
}

// Show initial values
updateDisplay();
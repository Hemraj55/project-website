const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const road = document.querySelector(".road");

//crash sound
const crashSound = new Audio("/media/crash.mp3");

// compute lane centers from road element so positions stay aligned
function computeLaneCenters() {
    const roadLeft = road.offsetLeft;
    const rw = road.offsetWidth;
    return [
        roadLeft + rw * (1/6), // lane 1 center
        roadLeft + rw * 0.5,   // lane 2 center
        roadLeft + rw * (5/6)  // lane 3 center
    ];
}
let laneCenters = computeLaneCenters();

let laneIndex = 1;

let enemies = [];
let speed = 4;
let score = 0;
let running = false;

/* helper: position player centered on current lane */
function updatePlayerPos() {
    const w = player.offsetWidth || 100;
    player.style.left = (laneCenters[laneIndex] - w / 2) + "px";
}

/* ensure initial position (script is at end of body so elements exist) */
updatePlayerPos();

/* keep centers in sync if window resized */
window.addEventListener("resize", () => {
    laneCenters = computeLaneCenters();
    updatePlayerPos();
});

// Start game
startBtn.addEventListener("click", () => {
    startScreen.style.display = "none";
    running = true;
    updatePlayerPos();
    createEnemy();
    gameLoop();
});

// Player movement
document.addEventListener("keydown", e => {
    if (!running) return;

    if (e.key === "ArrowLeft" && laneIndex > 0) {
        laneIndex--;
    }
    if (e.key === "ArrowRight" && laneIndex < 2) {
        laneIndex++;
    }
    updatePlayerPos();
});

// Create truck enemy
function createEnemy() {
    const enemy = document.createElement("div");
    enemy.classList.add("car", "enemy");
    enemy.style.top = "-120px";
    const randomLane = Math.floor(Math.random() * 3);
    // truck width = 110 → half = 55
    enemy.style.left = (laneCenters[randomLane] - 55) + "px";
    gameArea.appendChild(enemy);
    enemies.push(enemy);
}

// Collision detection
function isCollide(car, truck) {
    const carRect = car.getBoundingClientRect();
    const truckRect = truck.getBoundingClientRect();

    const carCenterX = carRect.left + carRect.width / 2;
    const carCenterY = carRect.top + carRect.height / 2;

    const truckCenterX = truckRect.left + truckRect.width / 2;
    const truckCenterY = truckRect.top + truckRect.height / 2;

    const dx = Math.abs(carCenterX - truckCenterX);
    const dy = Math.abs(carCenterY - truckCenterY);

    // SAFE collision threshold
    return dx < 35 && dy < 55;
}



// Game loop
function gameLoop() {
    if (!running) return;

    enemies.forEach((enemy, i) => {
        enemy.style.top = enemy.offsetTop + speed + "px";

        if (isCollide(player, enemy)) {
            endGame();
        }

        if (enemy.offsetTop > 600) {
            enemy.remove();
            enemies.splice(i, 1);
            score++;
            speed += 0.25;
            scoreText.innerText = "Score: " + score;
            createEnemy();
        }
    });

    requestAnimationFrame(gameLoop);
}

// End game
function endGame() {
    running = false;
    player.classList.add("crash");
    crashSound.play();
    setTimeout(() => {
    crashSound.pause();
    crashSound.currentTime = 0;
}, 2000);
    setTimeout(() => {
        gameOverScreen.style.display = "flex";
    }, 1500);
}


const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startOverlay = document.getElementById('start-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval;
let gameActive = false;

highScoreElement.textContent = highScore;

document.addEventListener('keydown', changeDirection);

function initGame() {
    snake = [
        { x: 10, y: 10 }
    ];
    // Start moving right
    dx = 1;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    placeFood();
    gameActive = true;
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 100);
}

function gameLoop() {
    if(!gameActive) return;
    
    moveSnake();
    if(checkCollision()) {
        gameOver();
        return;
    }
    
    clearCanvas();
    drawFood();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = '#022c22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#10b981' : '#34d399'; // Head is a bit darker green
        ctx.strokeStyle = '#064e3b';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function drawFood() {
    ctx.fillStyle = '#ef4444'; // Red food
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2, 
        food.y * gridSize + gridSize / 2, 
        gridSize / 2 - 2, 
        0, 
        2 * Math.PI
    );
    ctx.fill();
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); // Add new head

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        placeFood();
    } else {
        snake.pop(); // Remove tail if not eating
    }
}

function changeDirection(e) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = e.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

function placeFood() {
    let newFood;
    while(true) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        // Ensure food doesn't spawn on snake
        let onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        if(!onSnake) break;
    }
    food = newFood;
}

function checkCollision() {
    const head = snake[0];
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function gameOver() {
    gameActive = false;
    clearInterval(gameInterval);
    if(score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    gameOverOverlay.classList.remove('hidden');
}

// Initial draw without moving
clearCanvas();
startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);

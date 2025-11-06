document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('start-snake-btn');
  const scoreDisplay = document.getElementById('snake-score');
  
  const gridSize = 20;
  let snake, food, score, dx, dy, gameLoop, changingDirection;
  
  function initGame() {
    snake = [
      { x: 10 * gridSize, y: 10 * gridSize },
      { x: 9 * gridSize, y: 10 * gridSize },
      { x: 8 * gridSize, y: 10 * gridSize }
    ];
    food = {};
    score = 0;
    dx = gridSize; // Démarre en se déplaçant vers la droite
    dy = 0;
    changingDirection = false;
    scoreDisplay.textContent = 'Score : 0';
    createFood();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(main, 100);
    startBtn.textContent = "Recommencer";
  }
  
  startBtn.addEventListener('click', initGame);
  document.addEventListener('keydown', changeDirection);
  
  function main() {
    if (didGameEnd()) {
      clearInterval(gameLoop);
      startBtn.textContent = "Recommencer";
      return;
    }
    
    changingDirection = false;
    clearCanvas();
    drawFood();
    moveSnake();
    drawSnake();
  }
  
  function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }
  
  function drawSnakePart(part) {
    ctx.fillStyle = '#00cc66';
    ctx.strokeStyle = '#004422';
    ctx.fillRect(part.x, part.y, gridSize, gridSize);
    ctx.strokeRect(part.x, part.y, gridSize, gridSize);
  }
  
  function drawSnake() {
    snake.forEach(drawSnakePart);
  }
  
  function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreDisplay.textContent = 'Score : ' + score;
      createFood();
    } else {
      snake.pop();
    }
  }
  
  function didGameEnd() {
    for (let i = 4; i < snake.length; i++) {
      if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > canvas.width - gridSize;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > canvas.height - gridSize;
    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
  }
  
  function randomPos(min, max) {
    return Math.round((Math.random() * (max - min) + min) / gridSize) * gridSize;
  }
  
  function createFood() {
    food.x = randomPos(0, canvas.width - gridSize);
    food.y = randomPos(0, canvas.height - gridSize);
    snake.forEach(part => {
      if (part.x === food.x && part.y === food.y) {
        createFood();
      }
    });
  }
  
  function drawFood() {
    ctx.fillStyle = '#ff4444';
    ctx.strokeStyle = '#cc0000';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    ctx.strokeRect(food.x, food.y, gridSize, gridSize);
  }
  
  function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;
    
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    
    const keyPressed = event.keyCode;
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;
    
    if (keyPressed === LEFT_KEY && !goingRight) {
      dx = -gridSize;
      dy = 0;
    } else if (keyPressed === UP_KEY && !goingDown) {
      dx = 0;
      dy = -gridSize;
    } else if (keyPressed === RIGHT_KEY && !goingLeft) {
      dx = gridSize;
      dy = 0;
    } else if (keyPressed === DOWN_KEY && !goingUp) {
      dx = 0;
      dy = gridSize;
    }
  }
});
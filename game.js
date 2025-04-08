// Game variables
let bird = document.querySelector('.bird');
let message = document.querySelector('.message');
let scoreValue = document.querySelector('.score-value');
let gameState = 'Start';
let gravity = 0.5;
let birdVelocity = 0;
let birdPosition = 40; // In vh units
let moveSpeed = 3;
let pipes = [];
let score = 0;

// Debug: Ensure elements are found
console.log('Bird element:', bird);
console.log('Message element:', message);
console.log('Score value element:', scoreValue);

// Start the game on spacebar press
document.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.code, e.key); // Debug log
    if (e.code === 'Space' || e.key === ' ') { // Support both e.code and e.key
        if (gameState === 'Start') {
            console.log('Starting game...');
            startGame();
        } else if (gameState === 'Play') {
            console.log('Flapping...');
            flap();
        } else if (gameState === 'End') {
            console.log('Resetting game...');
            resetGame();
        }
    }
});

function startGame() {
    gameState = 'Play';
    message.innerHTML = '';
    scoreValue.innerHTML = '0';
    score = 0;
    birdPosition = 40;
    birdVelocity = 0;
    pipes.forEach(pipe => pipe.remove());
    pipes = [];
    generatePipe();
    gameLoop();
}

function flap() {
    birdVelocity = -8; // Upward velocity when flapping
}

function generatePipe() {
    if (gameState !== 'Play') return;

    let gapHeight = 200; // Pixel gap between pipes
    let minHeight = 50; // Minimum pipe height
    let maxHeight = window.innerHeight - gapHeight - minHeight;
    let pipeHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    let pipeTop = document.createElement('div');
    pipeTop.classList.add('pipe', 'pipe-top');
    pipeTop.style.height = pipeHeight + 'px';
    pipeTop.style.left = '100%';

    let pipeBottom = document.createElement('div');
    pipeBottom.classList.add('pipe', 'pipe-bottom');
    pipeBottom.style.height = (window.innerHeight - pipeHeight - gapHeight) + 'px';
    pipeBottom.style.left = '100%';

    document.querySelector('.game-container').appendChild(pipeTop);
    document.querySelector('.game-container').appendChild(pipeBottom);
    pipes.push({ top: pipeTop, bottom: pipeBottom, scored: false });

    setTimeout(generatePipe, 3000); // Generate a new pipe every 3 seconds
}

function gameLoop() {
    if (gameState !== 'Play') return;

    // Apply gravity
    birdVelocity += gravity;
    birdPosition += birdVelocity * 0.1;
    bird.style.top = birdPosition + 'vh';

    // Move pipes
    pipes.forEach(pipe => {
        let pipeLeft = parseFloat(pipe.top.style.left) - moveSpeed;
        pipe.top.style.left = pipeLeft + '%';
        pipe.bottom.style.left = pipeLeft + '%';

        // Remove pipes that are off-screen
        if (pipeLeft < -10) {
            pipe.top.remove();
            pipe.bottom.remove();
            pipes = pipes.filter(p => p.top !== pipe.top);
        }

        // Collision detection
        let birdRect = bird.getBoundingClientRect();
        let pipeTopRect = pipe.top.getBoundingClientRect();
        let pipeBottomRect = pipe.bottom.getBoundingClientRect();

        if (
            (birdRect.left < pipeTopRect.right &&
             birdRect.right > pipeTopRect.left &&
             (birdRect.top < pipeTopRect.bottom || birdRect.bottom > pipeBottomRect.top)) ||
            birdPosition <= 0 || birdPosition >= 90
        ) {
            endGame();
            return;
        }

        // Score increment
        if (!pipe.scored && pipeLeft < 15) {
            score++;
            scoreValue.innerHTML = score;
            pipe.scored = true;
        }
    });

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState = 'End';
    message.innerHTML = 'Game Over! Press Spacebar to Restart';
}

function resetGame() {
    startGame();
}

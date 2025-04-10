// Wait for the DOM to load before accessing elements
document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    let bird = document.querySelector('.bird');
    let message = document.querySelector('.message');
    let scoreValue = document.querySelector('.score-value');
    let gameState = 'Start';
    let gravity = 0.5;
    let birdVelocity = 0;
    let birdPosition = 40; // In vh units
    let moveSpeed = 3; // Pixels per frame
    let pipes = [];
    let score = 0;

    // Debug: Ensure elements are found
    console.log('Bird element:', bird);
    console.log('Message element:', message);
    console.log('Score value element:', scoreValue);

    // Ensure the game container is focused
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.focus();
    } else {
        console.error('Game container not found');
    }

    // Start the game on spacebar press
    document.addEventListener('keydown', (e) => {
        console.log('Key pressed:', e.code, e.key); // Debug log
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault(); // Prevent spacebar from scrolling the page
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
        // Clear existing pipes
        pipes.forEach(pipe => {
            pipe.top.remove();
            pipe.bottom.remove();
        });
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
        pipeTop.style.left = window.innerWidth + 'px'; // Start off-screen in pixels

        let pipeBottom = document.createElement('div');
        pipeBottom.classList.add('pipe', 'pipe-bottom');
        pipeBottom.style.height = (window.innerHeight - pipeHeight - gapHeight) + 'px';
        pipeBottom.style.left = window.innerWidth + 'px';

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

        // Check if bird hits the top or bottom
        if (birdPosition <= 0 || birdPosition >= 90) {
            endGame();
            return;
        }

        // Move pipes and check collisions
        pipes.forEach((pipe, index) => {
            let pipeLeft = parseFloat(pipe.top.style.left) - moveSpeed;
            pipe.top.style.left = pipeLeft + 'px';
            pipe.bottom.style.left = pipeLeft + 'px';

            // Remove pipes that are off-screen
            if (pipeLeft < -30) { // Adjusted for pipe width (30px)
                pipe.top.remove();
                pipe.bottom.remove();
                pipes.splice(index, 1);
                return;
            }

            // Collision detection (all in pixels)
            let birdRect = bird.getBoundingClientRect();
            let pipeTopRect = pipe.top.getBoundingClientRect();
            let pipeBottomRect = pipe.bottom.getBoundingClientRect();

            if (
                birdRect.left < pipeTopRect.right &&
                birdRect.right > pipeTopRect.left &&
                (birdRect.top < pipeTopRect.bottom || birdRect.bottom > pipeBottomRect.top)
            ) {
                endGame();
                return;
            }

            // Score increment
            let birdCenter = birdRect.left + birdRect.width / 2;
            let pipeCenter = pipeTopRect.left + pipeTopRect.width / 2;
            if (!pipe.scored && birdCenter > pipeCenter) {
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
});

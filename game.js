// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const PIPE_SPEED = 2;
const PIPE_SPAWN_INTERVAL = 1500; // milliseconds
const PIPE_GAP = 150;
const PIPE_WIDTH = 60;
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 40;

// Game variables
let canvas, ctx;
let bird = {
    x: 0,
    y: 0,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
    velocity: 0
};
let pipes = [];
let score = 0;
let gameStarted = false;
let gameOver = false;
let lastPipeSpawn = 0;
let birdImage = new Image();
let frameId;
let isMobile = false;
let lastTime = 0;
let deltaTime = 0;

// DOM elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// Initialize the game
function init() {
    console.log("Game initialization started");
    
    // Wait for DOM to be fully loaded
    canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    
    ctx = canvas.getContext('2d');
    console.log("Canvas context created");
    
    // Check if DOM elements exist
    if (!startScreen) {
        console.error("Start screen element not found!");
        startScreen = document.getElementById('start-screen');
    }
    
    if (!gameOverScreen) {
        console.error("Game over screen element not found!");
        gameOverScreen = document.getElementById('game-over-screen');
    }
    
    if (!scoreDisplay) {
        console.error("Score display element not found!");
        scoreDisplay = document.getElementById('score');
    }
    
    if (!finalScoreDisplay) {
        console.error("Final score display element not found!");
        finalScoreDisplay = document.getElementById('final-score');
    }
    
    if (!restartButton) {
        console.error("Restart button element not found!");
        restartButton = document.getElementById('restart-button');
    }
    
    // Check if device is mobile
    checkDeviceType();
    
    // Set canvas dimensions to match container
    resizeCanvas();
    window.addEventListener('resize', function() {
        resizeCanvas();
        checkDeviceType();
    });
    
    // Load bird image with error handling
    birdImage = new Image();
    birdImage.onload = function() {
        console.log("Bird image loaded successfully");
    };
    birdImage.onerror = function() {
        console.error("Failed to load bird image");
        // Create a fallback blue circle if image fails to load
        createFallbackBird();
    };
    birdImage.src = 'assets/twitter_logo.png';
    
    // Set initial bird position
    resetBird();
    
    // Event listeners with logging
    console.log("Adding event listeners");
    document.addEventListener('click', function(e) {
        console.log("Document clicked");
        handleClick();
    });
    
    canvas.addEventListener('click', function(e) {
        console.log("Canvas clicked");
        handleClick();
    });
    
    canvas.addEventListener('touchstart', function(e) {
        console.log("Canvas touch started");
        handleTouch(e);
    }, { passive: false });
    
    window.addEventListener('keydown', function(e) {
        console.log("Key pressed:", e.code);
        handleKeyDown(e);
    });
    
    if (restartButton) {
        restartButton.addEventListener('click', function() {
            console.log("Restart button clicked");
            restartGame();
        });
    }
    
    // Prevent scrolling when touching the canvas
    document.body.addEventListener('touchmove', function(e) {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Start animation loop
    lastTime = Date.now();
    console.log("Starting animation loop");
    animate();
    
    // Force start game after a short delay for testing
    setTimeout(function() {
        if (!gameStarted) {
            console.log("Auto-starting game after timeout");
            startGame();
        }
    }, 1000);
}

// Create a fallback bird if image fails to load
function createFallbackBird() {
    console.log("Creating fallback bird");
    // Create an in-memory canvas to draw a blue circle
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = BIRD_WIDTH;
    tempCanvas.height = BIRD_HEIGHT;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw a blue circle (Twitter blue)
    tempCtx.fillStyle = '#1DA1F2';
    tempCtx.beginPath();
    tempCtx.arc(BIRD_WIDTH/2, BIRD_HEIGHT/2, BIRD_WIDTH/2, 0, Math.PI * 2);
    tempCtx.fill();
    
    // Convert to image
    const dataURL = tempCanvas.toDataURL();
    birdImage = new Image();
    birdImage.src = dataURL;
}

// Check if device is mobile
function checkDeviceType() {
    isMobile = window.innerWidth <= 768 || 
               ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    
    // Adjust game parameters for mobile if needed
    if (isMobile) {
        // Make bird slightly larger on mobile for easier tapping
        bird.width = BIRD_WIDTH * 1.2;
        bird.height = BIRD_HEIGHT * 1.2;
    } else {
        bird.width = BIRD_WIDTH;
        bird.height = BIRD_HEIGHT;
    }
}

// Resize canvas to match container
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Adjust pipe gap based on canvas height
    const scaleFactor = Math.min(1, canvas.height / 600);
    PIPE_GAP = 150 * scaleFactor;
}

// Handle click event
function handleClick() {
    console.log("handleClick called, gameStarted:", gameStarted, "gameOver:", gameOver);
    if (!gameStarted) {
        console.log("Starting game from click");
        startGame();
    } else if (!gameOver) {
        console.log("Jumping from click");
        jump();
    }
}

// Handle touch event
function handleTouch(e) {
    console.log("handleTouch called");
    e.preventDefault();
    if (!gameStarted) {
        console.log("Starting game from touch");
        startGame();
    } else if (!gameOver) {
        console.log("Jumping from touch");
        jump();
    }
}

// Reset bird position
function resetBird() {
    bird.x = canvas.width / 4;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
}

// Handle click event
function handleClick() {
    if (!gameStarted) {
        startGame();
    } else if (!gameOver) {
        jump();
    }
}

// Handle keydown event
function handleKeyDown(e) {
    if (e.code === 'Space') {
        if (!gameStarted) {
            startGame();
        } else if (!gameOver) {
            jump();
        }
    }
}

// Start the game
function startGame() {
    console.log("startGame called");
    gameStarted = true;
    gameOver = false;
    score = 0;
    pipes = [];
    lastPipeSpawn = 0;
    resetBird();
    updateScore();
    
    if (startScreen) {
        console.log("Hiding start screen");
        startScreen.style.display = 'none';
    } else {
        console.error("Start screen element not available");
    }
}

// Restart the game
function restartGame() {
    console.log("restartGame called");
    if (gameOverScreen) {
        console.log("Hiding game over screen");
        gameOverScreen.style.display = 'none';
    } else {
        console.error("Game over screen element not available");
    }
    startGame();
}

// Make the bird jump
function jump() {
    bird.velocity = JUMP_FORCE;
}

// Update bird position
function updateBird() {
    bird.velocity += GRAVITY * deltaTime;
    bird.y += bird.velocity * deltaTime;
    
    // Check for collision with ground or ceiling
    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        endGame();
    } else if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

// Spawn a new pipe
function spawnPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - PIPE_GAP - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
    pipes.push({
        x: canvas.width,
        y: 0,
        width: PIPE_WIDTH,
        height: height,
        passed: false
    });
    
    pipes.push({
        x: canvas.width,
        y: height + PIPE_GAP,
        width: PIPE_WIDTH,
        height: canvas.height - height - PIPE_GAP,
        passed: false
    });
}

// Update pipes position
function updatePipes() {
    const currentTime = Date.now();
    
    // Spawn new pipes
    if (currentTime - lastPipeSpawn > PIPE_SPAWN_INTERVAL) {
        spawnPipe();
        lastPipeSpawn = currentTime;
    }
    
    // Move pipes and check for collision
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        pipe.x -= PIPE_SPEED * deltaTime;
        
        // Check for collision
        if (
            bird.x + bird.width > pipe.x &&
            bird.x < pipe.x + pipe.width &&
            bird.y + bird.height > pipe.y &&
            bird.y < pipe.y + pipe.height
        ) {
            endGame();
        }
        
        // Check if bird passed the pipe
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            // Only count score for one pipe of the pair (top pipe)
            if (pipe.y === 0) {
                score++;
                updateScore();
            }
        }
        
        // Remove pipes that are off screen
        if (pipe.x + pipe.width < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = score;
    finalScoreDisplay.textContent = score;
}

// End the game
function endGame() {
    console.log("endGame called");
    gameOver = true;
    if (gameOverScreen) {
        console.log("Showing game over screen");
        gameOverScreen.style.display = 'flex';
    } else {
        console.error("Game over screen element not available");
    }
}

// Draw the bird
function drawBird() {
    console.log("Drawing bird at:", bird.x, bird.y);
    
    // Check if context exists
    if (!ctx) {
        console.error("Canvas context not available");
        return;
    }
    
    // Calculate rotation based on velocity
    const rotation = Math.min(Math.max(bird.velocity / 10, -0.5), 0.5);
    
    try {
        // Save context state
        ctx.save();
        
        // Translate to bird center
        ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
        
        // Rotate
        ctx.rotate(rotation);
        
        // Check if bird image is loaded
        if (birdImage.complete && birdImage.naturalWidth > 0) {
            // Draw bird image
            ctx.drawImage(
                birdImage,
                -bird.width / 2,
                -bird.height / 2,
                bird.width,
                bird.height
            );
        } else {
            // Fallback if image is not loaded
            console.warn("Bird image not fully loaded, using fallback");
            ctx.fillStyle = '#1DA1F2';
            ctx.beginPath();
            ctx.arc(0, 0, bird.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Restore context state
        ctx.restore();
    } catch (error) {
        console.error("Error drawing bird:", error);
    }
}

// Draw pipes
function drawPipes() {
    // Check if context exists
    if (!ctx) {
        console.error("Canvas context not available");
        return;
    }
    
    try {
        ctx.fillStyle = '#1DA1F2';
        
        for (const pipe of pipes) {
            ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        }
    } catch (error) {
        console.error("Error drawing pipes:", error);
    }
}

// Draw background
function drawBackground() {
    // Check if context exists
    if (!ctx) {
        console.error("Canvas context not available");
        return;
    }
    
    try {
        // Sky
        ctx.fillStyle = '#f5f8fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ground
        ctx.fillStyle = '#AAB8C2';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    } catch (error) {
        console.error("Error drawing background:", error);
    }
}

// Animation loop
function animate() {
    try {
        // Calculate delta time for smoother animations
        const now = Date.now();
        deltaTime = (now - lastTime) / 16.67; // normalize to ~60fps
        lastTime = now;
        
        // Check if context exists
        if (!ctx || !canvas) {
            console.error("Canvas or context not available");
            return;
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        drawBackground();
        
        // Draw pipes
        drawPipes();
        
        // Draw bird
        drawBird();
        
        // Update game state if game is active
        if (gameStarted && !gameOver) {
            updateBird();
            updatePipes();
        }
        
        // Continue animation loop
        frameId = requestAnimationFrame(animate);
    } catch (error) {
        console.error("Error in animation loop:", error);
        // Try to recover by restarting the animation loop
        frameId = requestAnimationFrame(animate);
    }
}

// Initialize the game when the page loads
window.addEventListener('load', init);

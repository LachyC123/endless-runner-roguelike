// Shadow Runner - Endless Roguelike
// Mobile-first 2D endless runner with touch controls

(function() {
    'use strict';

    // ==================== GAME CONFIGURATION ====================
    const CONFIG = {
        // Player settings
        playerWidth: 40,
        playerHeight: 60,
        jumpForce: -18,
        gravity: 0.8,
        slideHeight: 30,
        slideDuration: 500,
        
        // Lane settings
        laneCount: 3,
        laneWidth: 80,
        laneSwitchSpeed: 0.15,
        
        // Game settings
        baseSpeed: 6,
        maxSpeed: 15,
        speedIncrement: 0.001,
        groundHeight: 100,
        
        // Spawn settings
        obstacleSpawnRate: 0.02,
        coinSpawnRate: 0.03,
        powerupSpawnRate: 0.005,
        minObstacleGap: 200,
        
        // Touch settings
        swipeThreshold: 30,
        tapThreshold: 10,
        
        // Frame timing
        maxDeltaTime: 33, // Cap at ~30fps equivalent to prevent huge jumps
        targetFrameTime: 16.67, // 60fps target
        
        // Visual settings
        colors: {
            sky: ['#1a1a2e', '#16213e', '#0f3460'],
            ground: '#2d2d44',
            groundLine: '#3d3d55',
            player: '#e94560',
            playerGlow: 'rgba(233, 69, 96, 0.5)',
            obstacle: '#ff6b6b',
            coin: '#ffd700',
            powerup: '#00ff88'
        }
    };
    
    // ==================== DEBUG STATE ====================
    const debug = {
        enabled: true,
        fps: 0,
        dt: 0,
        tickCount: 0,
        fpsUpdateTime: 0,
        frameCount: 0
    };

    // ==================== GAME STATE ====================
    const state = {
        // Game status
        gameRunning: false,
        gamePaused: false,
        
        // Player state
        player: {
            x: 0,
            y: 0,
            targetLane: 1,
            currentLane: 1,
            velocityY: 0,
            isJumping: false,
            isSliding: false,
            slideTimer: 0,
            isInvincible: false,
            invincibleTimer: 0
        },
        
        // Game objects
        obstacles: [],
        coins: [],
        powerups: [],
        particles: [],
        backgrounds: [],
        
        // Score
        distance: 0,
        coins: 0,
        score: 0,
        multiplier: 1,
        
        // Speed
        currentSpeed: CONFIG.baseSpeed,
        
        // Upgrades (roguelike persistence)
        upgrades: {
            jumpHeight: 0,
            coinMagnet: 0,
            shield: 0,
            multiplier: 0,
            startSpeed: 0
        },
        
        // Persistent data
        highScore: 0,
        totalCoins: 0,
        
        // Touch handling
        touchStartX: 0,
        touchStartY: 0,
        touchStartTime: 0,
        isTouching: false
    };

    // ==================== UPGRADE DEFINITIONS ====================
    const UPGRADES = [
        {
            id: 'jumpHeight',
            name: 'Higher Jump',
            icon: '🦘',
            description: 'Jump higher to clear obstacles',
            maxLevel: 5,
            baseCost: 50,
            costMultiplier: 1.5,
            effect: (level) => level * 2
        },
        {
            id: 'coinMagnet',
            name: 'Coin Magnet',
            icon: '🧲',
            description: 'Attract coins from further away',
            maxLevel: 5,
            baseCost: 75,
            costMultiplier: 1.6,
            effect: (level) => level * 30
        },
        {
            id: 'shield',
            name: 'Shield Duration',
            icon: '🛡️',
            description: 'Shields last longer',
            maxLevel: 5,
            baseCost: 100,
            costMultiplier: 1.7,
            effect: (level) => level * 1000
        },
        {
            id: 'multiplier',
            name: 'Score Bonus',
            icon: '⭐',
            description: 'Start with higher multiplier',
            maxLevel: 3,
            baseCost: 200,
            costMultiplier: 2,
            effect: (level) => level * 0.5
        },
        {
            id: 'startSpeed',
            name: 'Head Start',
            icon: '🚀',
            description: 'Start further ahead',
            maxLevel: 5,
            baseCost: 80,
            costMultiplier: 1.5,
            effect: (level) => level * 100
        }
    ];

    // ==================== CANVAS SETUP ====================
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    let canvasWidth, canvasHeight, groundY, lanePositions;
    let currentDpr = 1;

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        currentDpr = dpr;
        
        // Use clientWidth/clientHeight for accurate sizing
        const container = document.getElementById('game-container');
        canvasWidth = container ? container.clientWidth : window.innerWidth;
        canvasHeight = container ? container.clientHeight : window.innerHeight;
        
        // Set canvas internal resolution (accounting for device pixel ratio)
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        
        // Set canvas display size
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
        
        // Reset and scale context for high DPI
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        
        // Calculate positions
        groundY = canvasHeight - CONFIG.groundHeight;
        
        // Calculate lane positions (centered)
        const totalWidth = CONFIG.laneWidth * CONFIG.laneCount;
        const startX = (canvasWidth - totalWidth) / 2;
        lanePositions = [];
        for (let i = 0; i < CONFIG.laneCount; i++) {
            lanePositions.push(startX + CONFIG.laneWidth * i + CONFIG.laneWidth / 2);
        }
        
        // Initialize backgrounds
        initBackgrounds();
    }

    // ==================== DOM ELEMENTS ====================
    const elements = {
        startScreen: document.getElementById('start-screen'),
        upgradeScreen: document.getElementById('upgrade-screen'),
        gameoverScreen: document.getElementById('gameover-screen'),
        pauseScreen: document.getElementById('pause-screen'),
        tapOverlay: document.getElementById('tap-overlay'),
        hud: document.getElementById('hud'),
        pauseBtn: document.getElementById('pause-btn'),
        
        // Stats
        highScore: document.getElementById('high-score'),
        totalCoins: document.getElementById('total-coins'),
        distance: document.getElementById('distance'),
        coins: document.getElementById('coins'),
        multiplier: document.getElementById('multiplier'),
        
        // Game over
        finalDistance: document.getElementById('final-distance'),
        finalCoins: document.getElementById('final-coins'),
        finalScore: document.getElementById('final-score'),
        newRecord: document.getElementById('new-record'),
        
        // Upgrades
        upgradesContainer: document.getElementById('upgrades-container'),
        upgradeCoins: document.getElementById('upgrade-coins')
    };

    // ==================== INITIALIZATION ====================
    function init() {
        loadSaveData();
        resizeCanvas();
        setupEventListeners();
        updateStartScreen();
        initBackgrounds();
        
        // Start render loop immediately
        startLoop();
    }

    function loadSaveData() {
        try {
            const saved = localStorage.getItem('shadowRunner');
            if (saved) {
                const data = JSON.parse(saved);
                state.highScore = data.highScore || 0;
                state.totalCoins = data.totalCoins || 0;
                state.upgrades = { ...state.upgrades, ...data.upgrades };
            }
        } catch (e) {
            console.warn('Could not load save data');
        }
    }

    function saveData() {
        try {
            localStorage.setItem('shadowRunner', JSON.stringify({
                highScore: state.highScore,
                totalCoins: state.totalCoins,
                upgrades: state.upgrades
            }));
        } catch (e) {
            console.warn('Could not save data');
        }
    }

    function updateStartScreen() {
        elements.highScore.textContent = Math.floor(state.highScore);
        elements.totalCoins.textContent = state.totalCoins;
    }

    // ==================== BACKGROUNDS ====================
    function initBackgrounds() {
        state.backgrounds = [
            { y: 0, speed: 0.2, buildings: generateBuildings(0.3, 80, 200) },
            { y: 0, speed: 0.5, buildings: generateBuildings(0.5, 50, 120) },
            { y: 0, speed: 1, buildings: generateBuildings(0.7, 30, 80) }
        ];
    }

    function generateBuildings(alpha, minHeight, maxHeight) {
        const buildings = [];
        let x = 0;
        while (x < canvasWidth + 200) {
            const width = 30 + Math.random() * 60;
            const height = minHeight + Math.random() * (maxHeight - minHeight);
            buildings.push({ x, width, height, alpha });
            x += width + Math.random() * 30;
        }
        return buildings;
    }

    // ==================== EVENT LISTENERS ====================
    function setupEventListeners() {
        // Resize handling
        window.addEventListener('resize', resizeCanvas);
        
        // Orientation change handling (for mobile)
        window.addEventListener('orientationchange', () => {
            // Delay resize to ensure new dimensions are available
            setTimeout(resizeCanvas, 100);
        });
        
        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Touch events
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Mouse fallback for testing
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        
        // Buttons
        document.getElementById('start-btn').addEventListener('click', startGame);
        document.getElementById('retry-btn').addEventListener('click', startGame);
        document.getElementById('upgrade-btn').addEventListener('click', showUpgradeScreen);
        document.getElementById('continue-btn').addEventListener('click', hideUpgradeScreen);
        document.getElementById('pause-btn').addEventListener('click', togglePause);
        document.getElementById('resume-btn').addEventListener('click', togglePause);
        document.getElementById('quit-btn').addEventListener('click', quitGame);
        
        // Tap overlay for mobile (if shown)
        if (elements.tapOverlay) {
            elements.tapOverlay.addEventListener('click', handleTapOverlay);
            elements.tapOverlay.addEventListener('touchend', handleTapOverlay);
        }
        
        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (state.gameRunning) e.preventDefault();
        }, { passive: false });
    }
    
    function handleVisibilityChange() {
        if (document.hidden && state.gameRunning && !state.gamePaused) {
            // Auto-pause when tab becomes hidden
            togglePause();
        }
    }
    
    function handleTapOverlay(e) {
        e.preventDefault();
        if (elements.tapOverlay) {
            elements.tapOverlay.classList.add('hidden');
        }
        // Start the game on tap
        startGame();
    }
    
    // Show tap overlay for mobile users on the game canvas (not start screen)
    function showTapOverlay() {
        if (elements.tapOverlay) {
            elements.tapOverlay.classList.remove('hidden');
        }
    }

    // ==================== TOUCH HANDLING ====================
    function handleTouchStart(e) {
        e.preventDefault();
        if (!state.gameRunning || state.gamePaused) return;
        
        const touch = e.touches[0];
        state.touchStartX = touch.clientX;
        state.touchStartY = touch.clientY;
        state.touchStartTime = Date.now();
        state.isTouching = true;
    }

    function handleTouchMove(e) {
        e.preventDefault();
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        if (!state.gameRunning || state.gamePaused || !state.isTouching) return;
        
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - state.touchStartX;
        const deltaY = touch.clientY - state.touchStartY;
        const deltaTime = Date.now() - state.touchStartTime;
        
        state.isTouching = false;
        
        // Determine gesture
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX < CONFIG.tapThreshold && absY < CONFIG.tapThreshold && deltaTime < 300) {
            // Tap - Jump
            jump();
        } else if (absX > CONFIG.swipeThreshold || absY > CONFIG.swipeThreshold) {
            if (absX > absY) {
                // Horizontal swipe - Lane change
                if (deltaX > 0) {
                    switchLane(1);
                } else {
                    switchLane(-1);
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    // Swipe down - Slide
                    slide();
                } else {
                    // Swipe up - Jump
                    jump();
                }
            }
        }
    }

    function handleMouseDown(e) {
        if (!state.gameRunning || state.gamePaused) return;
        state.touchStartX = e.clientX;
        state.touchStartY = e.clientY;
        state.touchStartTime = Date.now();
        state.isTouching = true;
    }

    function handleMouseUp(e) {
        if (!state.gameRunning || state.gamePaused || !state.isTouching) return;
        
        const deltaX = e.clientX - state.touchStartX;
        const deltaY = e.clientY - state.touchStartY;
        
        state.isTouching = false;
        
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX < CONFIG.tapThreshold && absY < CONFIG.tapThreshold) {
            jump();
        } else if (absX > CONFIG.swipeThreshold || absY > CONFIG.swipeThreshold) {
            if (absX > absY) {
                deltaX > 0 ? switchLane(1) : switchLane(-1);
            } else {
                deltaY > 0 ? slide() : jump();
            }
        }
    }

    // ==================== PLAYER ACTIONS ====================
    function jump() {
        if (state.player.isJumping || state.player.isSliding) return;
        
        const jumpBonus = UPGRADES.find(u => u.id === 'jumpHeight').effect(state.upgrades.jumpHeight);
        state.player.velocityY = CONFIG.jumpForce - jumpBonus;
        state.player.isJumping = true;
        
        createParticles(state.player.x, groundY, 5, CONFIG.colors.playerGlow);
    }

    function slide() {
        if (state.player.isJumping || state.player.isSliding) return;
        
        state.player.isSliding = true;
        state.player.slideTimer = CONFIG.slideDuration;
        
        createParticles(state.player.x, groundY - 20, 3, CONFIG.colors.playerGlow);
    }

    function switchLane(direction) {
        const newLane = state.player.targetLane + direction;
        if (newLane >= 0 && newLane < CONFIG.laneCount) {
            state.player.targetLane = newLane;
        }
    }

    // ==================== GAME CONTROL ====================
    function startGame() {
        // Reset timing to prevent huge delta jump on game start
        resetTiming();
        
        // Reset game state
        state.gameRunning = true;
        state.gamePaused = false;
        
        // Reset player
        state.player = {
            x: lanePositions[1],
            y: groundY - CONFIG.playerHeight,
            targetLane: 1,
            currentLane: 1,
            velocityY: 0,
            isJumping: false,
            isSliding: false,
            slideTimer: 0,
            isInvincible: false,
            invincibleTimer: 0
        };
        
        // Reset game objects
        state.obstacles = [];
        state.coins = [];
        state.powerups = [];
        state.particles = [];
        
        // Reset score with head start bonus
        const headStart = UPGRADES.find(u => u.id === 'startSpeed').effect(state.upgrades.startSpeed);
        state.distance = headStart;
        state.coins = 0;
        state.score = 0;
        
        // Apply multiplier upgrade
        const multiplierBonus = UPGRADES.find(u => u.id === 'multiplier').effect(state.upgrades.multiplier);
        state.multiplier = 1 + multiplierBonus;
        
        // Reset speed
        state.currentSpeed = CONFIG.baseSpeed;
        
        // Hide screens, show HUD
        elements.startScreen.classList.add('hidden');
        elements.gameoverScreen.classList.add('hidden');
        elements.upgradeScreen.classList.add('hidden');
        elements.pauseScreen.classList.add('hidden');
        elements.hud.classList.remove('hidden');
        elements.pauseBtn.classList.remove('hidden');
        
        // Update multiplier display
        if (state.multiplier > 1) {
            elements.multiplier.textContent = `x${state.multiplier.toFixed(1)}`;
            elements.multiplier.classList.remove('hidden');
        } else {
            elements.multiplier.classList.add('hidden');
        }
    }

    function togglePause() {
        state.gamePaused = !state.gamePaused;
        
        if (state.gamePaused) {
            elements.pauseScreen.classList.remove('hidden');
        } else {
            elements.pauseScreen.classList.add('hidden');
            // Reset timing when resuming to prevent huge delta jump
            resetTiming();
        }
    }

    function quitGame() {
        state.gameRunning = false;
        elements.pauseScreen.classList.add('hidden');
        elements.hud.classList.add('hidden');
        elements.pauseBtn.classList.add('hidden');
        elements.startScreen.classList.remove('hidden');
        updateStartScreen();
    }

    function gameOver() {
        state.gameRunning = false;
        
        // Calculate final score
        state.score = Math.floor(state.distance * state.multiplier + state.coins * 10);
        
        // Update totals
        state.totalCoins += state.coins;
        const isNewRecord = state.score > state.highScore;
        if (isNewRecord) {
            state.highScore = state.score;
        }
        
        saveData();
        
        // Update game over screen
        elements.finalDistance.textContent = Math.floor(state.distance) + 'm';
        elements.finalCoins.textContent = state.coins;
        elements.finalScore.textContent = Math.floor(state.score);
        
        if (isNewRecord) {
            elements.newRecord.classList.remove('hidden');
        } else {
            elements.newRecord.classList.add('hidden');
        }
        
        // Show game over screen
        elements.hud.classList.add('hidden');
        elements.pauseBtn.classList.add('hidden');
        elements.gameoverScreen.classList.remove('hidden');
    }

    // ==================== UPGRADE SYSTEM ====================
    function showUpgradeScreen() {
        elements.gameoverScreen.classList.add('hidden');
        elements.upgradeScreen.classList.remove('hidden');
        renderUpgrades();
    }

    function hideUpgradeScreen() {
        elements.upgradeScreen.classList.add('hidden');
        elements.startScreen.classList.remove('hidden');
        updateStartScreen();
    }

    function renderUpgrades() {
        elements.upgradeCoins.textContent = state.totalCoins;
        elements.upgradesContainer.innerHTML = '';
        
        UPGRADES.forEach(upgrade => {
            const level = state.upgrades[upgrade.id];
            const isMaxed = level >= upgrade.maxLevel;
            const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
            const canAfford = state.totalCoins >= cost && !isMaxed;
            
            const item = document.createElement('div');
            item.className = `upgrade-item${canAfford ? ' affordable' : ''}${isMaxed ? ' maxed' : ''}`;
            
            item.innerHTML = `
                <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-desc">${upgrade.description}</div>
                    <div class="upgrade-level">Level ${level}/${upgrade.maxLevel}</div>
                </div>
                <div class="upgrade-cost">${isMaxed ? 'MAX' : '💰 ' + cost}</div>
            `;
            
            if (canAfford) {
                item.addEventListener('click', () => purchaseUpgrade(upgrade.id, cost));
            }
            
            elements.upgradesContainer.appendChild(item);
        });
    }

    function purchaseUpgrade(id, cost) {
        if (state.totalCoins >= cost) {
            state.totalCoins -= cost;
            state.upgrades[id]++;
            saveData();
            renderUpgrades();
        }
    }

    // ==================== SPAWNING ====================
    function spawnObstacle() {
        // Check minimum gap
        const lastObstacle = state.obstacles[state.obstacles.length - 1];
        if (lastObstacle && canvasWidth - lastObstacle.x < CONFIG.minObstacleGap) return;
        
        const lane = Math.floor(Math.random() * CONFIG.laneCount);
        const type = Math.random() < 0.5 ? 'low' : 'high';
        
        const obstacle = {
            x: canvasWidth + 50,
            lane: lane,
            type: type,
            width: 40,
            height: type === 'low' ? 40 : 60,
            y: type === 'low' ? groundY - 40 : groundY - 80
        };
        
        state.obstacles.push(obstacle);
    }

    function spawnCoin() {
        const lane = Math.floor(Math.random() * CONFIG.laneCount);
        const pattern = Math.random();
        
        if (pattern < 0.3) {
            // Single coin
            state.coins.push({
                x: canvasWidth + 50,
                y: groundY - 50 - Math.random() * 100,
                lane: lane,
                collected: false
            });
        } else if (pattern < 0.6) {
            // Line of coins
            for (let i = 0; i < 3; i++) {
                state.coins.push({
                    x: canvasWidth + 50 + i * 50,
                    y: groundY - 70,
                    lane: lane,
                    collected: false
                });
            }
        } else {
            // Arc of coins
            for (let i = 0; i < 5; i++) {
                const arcY = Math.sin(i / 4 * Math.PI) * 80;
                state.coins.push({
                    x: canvasWidth + 50 + i * 40,
                    y: groundY - 50 - arcY,
                    lane: lane,
                    collected: false
                });
            }
        }
    }

    function spawnPowerup() {
        const lane = Math.floor(Math.random() * CONFIG.laneCount);
        const types = ['shield', 'magnet', 'multiplier'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        state.powerups.push({
            x: canvasWidth + 50,
            y: groundY - 100,
            lane: lane,
            type: type,
            collected: false
        });
    }

    // ==================== UPDATE LOGIC ====================
    function update(deltaTime) {
        if (!state.gameRunning || state.gamePaused) return;
        
        const dt = deltaTime / 16.67; // Normalize to 60fps
        
        // Update speed
        if (state.currentSpeed < CONFIG.maxSpeed) {
            state.currentSpeed += CONFIG.speedIncrement * dt;
        }
        
        // Update distance
        state.distance += state.currentSpeed * 0.1 * dt;
        
        // Update player
        updatePlayer(dt);
        
        // Spawn objects
        if (Math.random() < CONFIG.obstacleSpawnRate * dt) spawnObstacle();
        if (Math.random() < CONFIG.coinSpawnRate * dt) spawnCoin();
        if (Math.random() < CONFIG.powerupSpawnRate * dt) spawnPowerup();
        
        // Update objects
        updateObstacles(dt);
        updateCoins(dt);
        updatePowerups(dt);
        updateParticles(dt);
        updateBackgrounds(dt);
        
        // Update HUD
        elements.distance.textContent = Math.floor(state.distance) + 'm';
        elements.coins.textContent = state.coins;
    }

    function updatePlayer(dt) {
        const player = state.player;
        
        // Lane switching
        const targetX = lanePositions[player.targetLane];
        player.x += (targetX - player.x) * CONFIG.laneSwitchSpeed * dt;
        player.currentLane = player.targetLane;
        
        // Jumping physics
        if (player.isJumping) {
            player.velocityY += CONFIG.gravity * dt;
            player.y += player.velocityY * dt;
            
            // Land
            const groundLevel = groundY - CONFIG.playerHeight;
            if (player.y >= groundLevel) {
                player.y = groundLevel;
                player.velocityY = 0;
                player.isJumping = false;
            }
        }
        
        // Sliding
        if (player.isSliding) {
            player.slideTimer -= 16.67 * dt;
            if (player.slideTimer <= 0) {
                player.isSliding = false;
            }
        }
        
        // Invincibility
        if (player.isInvincible) {
            player.invincibleTimer -= 16.67 * dt;
            if (player.invincibleTimer <= 0) {
                player.isInvincible = false;
            }
        }
    }

    function updateObstacles(dt) {
        const player = state.player;
        const playerHeight = player.isSliding ? CONFIG.slideHeight : CONFIG.playerHeight;
        const playerY = player.isSliding ? groundY - CONFIG.slideHeight : player.y;
        
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
            const obs = state.obstacles[i];
            obs.x -= state.currentSpeed * dt;
            
            // Remove off-screen
            if (obs.x + obs.width < 0) {
                state.obstacles.splice(i, 1);
                continue;
            }
            
            // Check collision
            const obsX = lanePositions[obs.lane];
            if (!player.isInvincible &&
                Math.abs(player.x - obsX) < (CONFIG.playerWidth + obs.width) / 2 - 10 &&
                obs.x < player.x + CONFIG.playerWidth / 2 &&
                obs.x + obs.width > player.x - CONFIG.playerWidth / 2) {
                
                // Vertical collision check
                if (obs.type === 'low') {
                    // Low obstacle - must jump over
                    if (playerY + playerHeight > obs.y) {
                        gameOver();
                        return;
                    }
                } else {
                    // High obstacle - can slide under or jump over
                    if (playerY + playerHeight > obs.y && playerY < obs.y + obs.height) {
                        if (!player.isSliding || playerY + playerHeight > obs.y) {
                            gameOver();
                            return;
                        }
                    }
                }
            }
        }
    }

    function updateCoins(dt) {
        const player = state.player;
        const magnetRange = 50 + UPGRADES.find(u => u.id === 'coinMagnet').effect(state.upgrades.coinMagnet);
        
        for (let i = state.coins.length - 1; i >= 0; i--) {
            const coin = state.coins[i];
            coin.x -= state.currentSpeed * dt;
            
            // Remove off-screen or collected
            if (coin.x < -50 || coin.collected) {
                state.coins.splice(i, 1);
                continue;
            }
            
            // Magnet effect
            const coinX = lanePositions[coin.lane];
            const dx = player.x - coinX;
            const dy = (player.y + CONFIG.playerHeight / 2) - coin.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < magnetRange) {
                coin.x += dx * 0.1 * dt;
                coin.y += dy * 0.1 * dt;
            }
            
            // Collect
            if (dist < 40) {
                coin.collected = true;
                state.coins++;
                createParticles(coin.x, coin.y, 5, CONFIG.colors.coin);
            }
        }
    }

    function updatePowerups(dt) {
        const player = state.player;
        
        for (let i = state.powerups.length - 1; i >= 0; i--) {
            const powerup = state.powerups[i];
            powerup.x -= state.currentSpeed * dt;
            
            // Remove off-screen or collected
            if (powerup.x < -50 || powerup.collected) {
                state.powerups.splice(i, 1);
                continue;
            }
            
            // Collect
            const powerupX = lanePositions[powerup.lane];
            const dx = player.x - powerupX;
            const dy = (player.y + CONFIG.playerHeight / 2) - powerup.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 50) {
                powerup.collected = true;
                activatePowerup(powerup.type);
                createParticles(powerup.x, powerup.y, 10, CONFIG.colors.powerup);
            }
        }
    }

    function activatePowerup(type) {
        const shieldBonus = UPGRADES.find(u => u.id === 'shield').effect(state.upgrades.shield);
        
        switch (type) {
            case 'shield':
                state.player.isInvincible = true;
                state.player.invincibleTimer = 3000 + shieldBonus;
                break;
            case 'magnet':
                // Temporary super magnet (handled in updateCoins)
                break;
            case 'multiplier':
                state.multiplier = Math.min(state.multiplier + 0.5, 5);
                elements.multiplier.textContent = `x${state.multiplier.toFixed(1)}`;
                elements.multiplier.classList.remove('hidden');
                break;
        }
    }

    function updateParticles(dt) {
        for (let i = state.particles.length - 1; i >= 0; i--) {
            const p = state.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 0.3 * dt;
            p.life -= 0.02 * dt;
            
            if (p.life <= 0) {
                state.particles.splice(i, 1);
            }
        }
    }

    function updateBackgrounds(dt) {
        state.backgrounds.forEach(bg => {
            bg.buildings.forEach(building => {
                building.x -= state.currentSpeed * bg.speed * dt;
                if (building.x + building.width < 0) {
                    // Recycle building to the right
                    const rightmost = bg.buildings.reduce((max, b) => Math.max(max, b.x + b.width), 0);
                    building.x = rightmost + Math.random() * 30;
                    building.width = 30 + Math.random() * 60;
                }
            });
        });
    }

    function createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            state.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 3,
                size: 3 + Math.random() * 5,
                color: color,
                life: 1
            });
        }
    }

    // ==================== RENDERING ====================
    function render() {
        // Clear
        ctx.fillStyle = CONFIG.colors.sky[0];
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, groundY);
        skyGradient.addColorStop(0, CONFIG.colors.sky[0]);
        skyGradient.addColorStop(0.5, CONFIG.colors.sky[1]);
        skyGradient.addColorStop(1, CONFIG.colors.sky[2]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvasWidth, groundY);
        
        // Draw backgrounds
        renderBackgrounds();
        
        // Draw ground
        ctx.fillStyle = CONFIG.colors.ground;
        ctx.fillRect(0, groundY, canvasWidth, CONFIG.groundHeight);
        
        // Ground lines (running effect)
        ctx.strokeStyle = CONFIG.colors.groundLine;
        ctx.lineWidth = 2;
        const lineOffset = (state.distance * 3) % 40;
        for (let x = -lineOffset; x < canvasWidth; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, groundY + 5);
            ctx.lineTo(x + 20, groundY + 5);
            ctx.stroke();
        }
        
        // Lane indicators
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        lanePositions.forEach(x => {
            ctx.beginPath();
            ctx.setLineDash([10, 10]);
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
            ctx.setLineDash([]);
        });
        
        // Draw obstacles
        renderObstacles();
        
        // Draw coins
        renderCoins();
        
        // Draw powerups
        renderPowerups();
        
        // Draw player
        renderPlayer();
        
        // Draw particles
        renderParticles();
    }

    function renderBackgrounds() {
        state.backgrounds.forEach(bg => {
            bg.buildings.forEach(building => {
                ctx.fillStyle = `rgba(30, 30, 50, ${building.alpha})`;
                ctx.fillRect(
                    building.x,
                    groundY - building.height,
                    building.width,
                    building.height
                );
                
                // Windows
                ctx.fillStyle = `rgba(255, 255, 150, ${building.alpha * 0.3})`;
                const windowSize = 5;
                const windowGap = 12;
                for (let wy = groundY - building.height + 15; wy < groundY - 10; wy += windowGap) {
                    for (let wx = building.x + 8; wx < building.x + building.width - 8; wx += windowGap) {
                        if (Math.random() > 0.3) {
                            ctx.fillRect(wx, wy, windowSize, windowSize);
                        }
                    }
                }
            });
        });
    }

    function renderObstacles() {
        state.obstacles.forEach(obs => {
            const obsX = lanePositions[obs.lane];
            
            // Glow
            ctx.shadowColor = CONFIG.colors.obstacle;
            ctx.shadowBlur = 15;
            
            ctx.fillStyle = CONFIG.colors.obstacle;
            
            if (obs.type === 'low') {
                // Spike-like obstacle
                ctx.beginPath();
                ctx.moveTo(obsX - obs.width / 2, groundY);
                ctx.lineTo(obsX, obs.y);
                ctx.lineTo(obsX + obs.width / 2, groundY);
                ctx.closePath();
                ctx.fill();
            } else {
                // Barrier obstacle
                ctx.fillRect(obsX - obs.width / 2, obs.y, obs.width, obs.height);
                
                // Hazard stripes
                ctx.fillStyle = '#ff3333';
                for (let i = 0; i < obs.height; i += 15) {
                    ctx.fillRect(obsX - obs.width / 2, obs.y + i, obs.width, 7);
                }
            }
            
            ctx.shadowBlur = 0;
        });
    }

    function renderCoins() {
        state.coins.forEach(coin => {
            if (coin.collected) return;
            
            const coinX = lanePositions[coin.lane] + (coin.x - canvasWidth - 50);
            
            // Glow
            ctx.shadowColor = CONFIG.colors.coin;
            ctx.shadowBlur = 10;
            
            // Coin
            ctx.fillStyle = CONFIG.colors.coin;
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner circle
            ctx.fillStyle = '#ffed4a';
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, 7, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        });
    }

    function renderPowerups() {
        state.powerups.forEach(powerup => {
            if (powerup.collected) return;
            
            const x = powerup.x;
            const y = powerup.y;
            
            // Glow
            ctx.shadowColor = CONFIG.colors.powerup;
            ctx.shadowBlur = 20;
            
            // Box
            ctx.fillStyle = CONFIG.colors.powerup;
            ctx.fillRect(x - 15, y - 15, 30, 30);
            
            // Icon
            ctx.fillStyle = '#000';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const icons = { shield: '🛡️', magnet: '🧲', multiplier: '⭐' };
            ctx.fillText(icons[powerup.type], x, y);
            
            ctx.shadowBlur = 0;
        });
    }

    function renderPlayer() {
        const player = state.player;
        const height = player.isSliding ? CONFIG.slideHeight : CONFIG.playerHeight;
        const y = player.isSliding ? groundY - CONFIG.slideHeight : player.y;
        
        // Invincibility effect
        if (player.isInvincible) {
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 30;
            
            // Shield bubble
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(player.x, y + height / 2, CONFIG.playerWidth, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Player glow
        ctx.shadowColor = CONFIG.colors.player;
        ctx.shadowBlur = 20;
        
        // Player body
        ctx.fillStyle = CONFIG.colors.player;
        
        if (player.isSliding) {
            // Sliding pose
            ctx.beginPath();
            ctx.ellipse(player.x, y + height / 2, CONFIG.playerWidth / 2, height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Running pose
            ctx.fillRect(
                player.x - CONFIG.playerWidth / 2,
                y,
                CONFIG.playerWidth,
                height
            );
            
            // Head
            ctx.beginPath();
            ctx.arc(player.x, y - 5, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Running legs animation
            const legOffset = Math.sin(state.distance * 0.3) * 10;
            ctx.fillRect(player.x - 8, y + height - 5, 8, 15 + legOffset);
            ctx.fillRect(player.x, y + height - 5, 8, 15 - legOffset);
        }
        
        ctx.shadowBlur = 0;
    }

    function renderParticles() {
        state.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // ==================== GAME LOOP ====================
    let lastTime = 0;
    let loopRunning = false;
    let animationFrameId = null;

    function gameLoop(timestamp) {
        // Use performance.now() as backup for more accurate timing
        const now = timestamp || performance.now();
        
        // Handle first frame or large gaps (e.g., after tab switch)
        if (lastTime === 0) {
            lastTime = now;
        }
        
        let deltaTime = now - lastTime;
        lastTime = now;
        
        // Clamp deltaTime to prevent huge jumps after tab switching or long pauses
        deltaTime = Math.min(deltaTime, CONFIG.maxDeltaTime);
        
        // Update debug info
        debug.dt = deltaTime;
        debug.tickCount++;
        debug.frameCount++;
        
        // Calculate FPS every second
        if (now - debug.fpsUpdateTime >= 1000) {
            debug.fps = debug.frameCount;
            debug.frameCount = 0;
            debug.fpsUpdateTime = now;
        }
        
        update(deltaTime);
        render();
        renderDebugHUD();
        
        // Continue the loop
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function startLoop() {
        if (!loopRunning) {
            loopRunning = true;
            lastTime = 0; // Reset to avoid huge delta on first frame
            debug.fpsUpdateTime = performance.now();
            debug.frameCount = 0;
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function resetTiming() {
        lastTime = 0; // This will cause gameLoop to reset timing on next frame
    }
    
    // ==================== DEBUG HUD ====================
    function renderDebugHUD() {
        if (!debug.enabled) return;
        
        const padding = 10;
        const lineHeight = 16;
        const x = padding;
        let y = padding + lineHeight;
        
        ctx.save();
        
        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(5, 5, 180, 120);
        
        // Debug text
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const debugLines = [
            `running: ${state.gameRunning}`,
            `paused: ${state.gamePaused}`,
            `dt: ${debug.dt.toFixed(2)}ms`,
            `fps: ${debug.fps}`,
            `player.x: ${state.player.x ? state.player.x.toFixed(1) : 'N/A'}`,
            `speed: ${state.currentSpeed.toFixed(2)}`,
            `tickCount: ${debug.tickCount}`
        ];
        
        debugLines.forEach((line, i) => {
            ctx.fillText(line, x, y + i * lineHeight);
        });
        
        ctx.restore();
    }

    // ==================== START ====================
    init();
})();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'playing';

const player = {
    x: 0,
    y: 0,
    radius: 40,
    angle: 0,

    hp: 3,
    maxHp: 3,
    shield: 0,

    damage: 1,
    hasDoubleShot: false,

    level: 1,
    currentXp: 0,
    nextLevelXp: 200,

    stats: {
        hp: 1,
        fireRate: 1,
        speed: 1,
        damage: 1,
        shield: 0,
        doubleShot: 0
    }
};

let fireRate = 500;
let projectileSpeed = 5;
let isShooting = false;
let lastShotTime = 0;

const projectiles = [];
const enemies = [];
const particles = [];
let currentUpgradeOptions = [];

const powerUps = [
    {
        id: 'hp',
        name: 'Vida Extra',
        desc: 'Aumenta +1 HP máximo',
        icon: '💖',
        weight: 10
    },
    {
        id: 'fireRate',
        name: 'Cadência',
        desc: 'Atira mais rápido',
        icon: '⚡',
        weight: 10
    },
    {
        id: 'speed',
        name: 'Velocidade',
        desc: 'Tiros mais velozes',
        icon: '🚀',
        weight: 10
    },
    {
        id: 'damage',
        name: 'Dano',
        desc: 'Tiros mais fortes',
        icon: '💥',
        weight: 10
    },
    {
        id: 'shield',
        name: 'Escudo',
        desc: 'Protege contra 2 hits',
        icon: '🛡️',
        weight: 8
    },
    {
        id: 'doubleShot',
        name: 'Tiro Duplo',
        desc: 'Dispara 2 projéteis',
        icon: '🔫',
        weight: 2
    }
];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player.x = canvas.width / 2;
    player.y = canvas.height - 25;
}

function getBulletColor() {
    if (player.damage === 1) return '#ffeb3b';
    if (player.damage === 2) return '#ff9800';
    if (player.damage === 3) return '#f44336';
    return '#9c27b0';
}

function createBullet(angleOffset = 0) {
    const angle = player.angle + angleOffset;

    projectiles.push({
        x: player.x + Math.cos(angle) * 70,
        y: player.y + Math.sin(angle) * 70,
        vx: Math.cos(angle) * projectileSpeed,
        vy: Math.sin(angle) * projectileSpeed,
        damage: player.damage,
        color: getBulletColor()
    });
}

function shoot(timestamp) {
    if (!isShooting) return;
    if (timestamp - lastShotTime <= fireRate) return;

    createBullet();

    if (player.hasDoubleShot) {
        createBullet(0.15);
    }

    lastShotTime = timestamp;
}

function getRandomWeightedUpgrade(pool) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    const randomValue = Math.random() * totalWeight;

    let accumulatedWeight = 0;

    for (let i = 0; i < pool.length; i++) {
        accumulatedWeight += pool[i].weight;

        if (randomValue <= accumulatedWeight) {
            return i;
        }
    }

    return 0;
}

function startLevelUp() {
    gameState = 'leveling';
    isShooting = false;
    currentUpgradeOptions = [];

    const availableUpgrades = [...powerUps];

    for (let i = 0; i < 3; i++) {
        const selectedIndex = getRandomWeightedUpgrade(availableUpgrades);
        currentUpgradeOptions.push(availableUpgrades[selectedIndex]);
        availableUpgrades.splice(selectedIndex, 1);
    }
}

function applyUpgrade(upgradeId) {
    player.stats[upgradeId]++;

    if (upgradeId === 'hp') {
        player.maxHp++;
        player.hp++;
    }

    if (upgradeId === 'fireRate') {
        fireRate = Math.max(100, fireRate - 80);
    }

    if (upgradeId === 'speed') {
        projectileSpeed += 2;
    }

    if (upgradeId === 'damage') {
        player.damage += 1;
    }

    if (upgradeId === 'shield') {
        player.shield = 2;
    }

    if (upgradeId === 'doubleShot') {
        player.hasDoubleShot = true;
    }

    player.currentXp -= player.nextLevelXp;
    player.level++;
    player.nextLevelXp = Math.floor(player.nextLevelXp * 1.5);

    gameState = 'playing';
}

function checkUpgradeClick(event) {
    const cardWidth = 220;
    const cardHeight = 300;
    const spacing = 30;

    const totalWidth = (cardWidth * 3) + (spacing * 2);
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - cardHeight) / 2;

    currentUpgradeOptions.forEach((option, index) => {
        const cardX = startX + index * (cardWidth + spacing);
        const cardY = startY;

        const clickedInsideX = event.clientX > cardX && event.clientX < cardX + cardWidth;
        const clickedInsideY = event.clientY > cardY && event.clientY < cardY + cardHeight;

        if (clickedInsideX && clickedInsideY) {
            applyUpgrade(option.id);
        }
    });
}

function createEnemyByLevel() {
    const enemy = {
        type: 'sphere',
        radius: 22,
        hp: 1,
        xp: 20,
        color: '#ff80ab',
        speedMin: 1.2,
        speedMax: 2.2
    };

    if (player.level >= 6) {
        const roll = Math.random();

        if (roll < 0.3) {
            enemy.type = 'diamond';
            enemy.radius = 26;
            enemy.hp = 3;
            enemy.xp = 55;
            enemy.color = '#4caf50';
            enemy.speedMin = 2.4;
            enemy.speedMax = 3.2;
            return enemy;
        }

        if (roll < 0.65) {
            enemy.type = 'triangle';
            enemy.hp = 2;
            enemy.xp = 35;
            enemy.color = '#f44336';
            enemy.speedMin = 1.5;
            enemy.speedMax = 2.4;
            return enemy;
        }

        return enemy;
    }

    if (player.level >= 3 && Math.random() < 0.5) {
        enemy.type = 'triangle';
        enemy.hp = 2;
        enemy.xp = 35;
        enemy.color = '#f44336';
        enemy.speedMin = 1.5;
        enemy.speedMax = 2.4;
    }

    return enemy;
}

function spawnEnemy() {
    if (gameState !== 'playing') return;

    const enemyData = createEnemyByLevel();

    let x;
    let y;

    if (Math.random() < 0.5) {
        x = Math.random() * canvas.width;
        y = -enemyData.radius;
    } else {
        x = Math.random() < 0.5 ? -enemyData.radius : canvas.width + enemyData.radius;
        y = Math.random() * (canvas.height / 2);
    }

    const angleToPlayer = Math.atan2(player.y - y, player.x - x);
    const speed =
        enemyData.speedMin + Math.random() * (enemyData.speedMax - enemyData.speedMin);

    enemies.push({
        x,
        y,
        radius: enemyData.radius,
        vx: Math.cos(angleToPlayer) * speed,
        vy: Math.sin(angleToPlayer) * speed,
        type: enemyData.type,
        hp: enemyData.hp,
        xp: enemyData.xp,
        color: enemyData.color,
        angle: angleToPlayer
    });
}

function createEnemyParticles(enemy) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: enemy.x,
            y: enemy.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            alpha: 1,
            color: enemy.color
        });
    }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];

        projectile.x += projectile.vx;
        projectile.y += projectile.vy;

        const isOutOfBounds =
            projectile.x < 0 ||
            projectile.x > canvas.width ||
            projectile.y < 0 ||
            projectile.y > canvas.height;

        if (isOutOfBounds) {
            projectiles.splice(i, 1);
        }
    }
}

function updateEnemies() {
    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = enemies[enemyIndex];

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        if (enemy.type === 'triangle' || enemy.type === 'diamond') {
            enemy.angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        }

        const hitPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y) < enemy.radius + 35;

        if (hitPlayer) {
            if (player.shield > 0) {
                player.shield--;
            } else {
                player.hp--;
            }

            enemies.splice(enemyIndex, 1);

            if (player.hp <= 0) {
                gameState = 'gameOver';
            }

            continue;
        }

        for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
            const projectile = projectiles[projectileIndex];

            const hitByProjectile =
                Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y) < enemy.radius;

            if (!hitByProjectile) continue;

            enemy.hp -= projectile.damage;
            projectiles.splice(projectileIndex, 1);

            if (enemy.hp <= 0) {
                player.currentXp += enemy.xp;
                createEnemyParticles(enemy);
                enemies.splice(enemyIndex, 1);

                if (player.currentXp >= player.nextLevelXp) {
                    startLevelUp();
                }
            }

            break;
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.alpha -= 0.02;

        if (particle.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

function update(timestamp) {
    if (gameState !== 'playing') return;

    shoot(timestamp);
    updateProjectiles();
    updateEnemies();
    updateParticles();
}

function drawXpBar() {
    const barWidth = 300;
    const barHeight = 15;
    const barX = canvas.width / 2 - barWidth / 2;
    const barY = 40;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(
        barX,
        barY,
        barWidth * (player.currentXp / player.nextLevelXp),
        barHeight
    );
}

function drawLevelText() {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`NÍVEL ${player.level}`, canvas.width / 2, 30);
}

function drawLives() {
    ctx.fillStyle = '#ff5252';

    for (let i = 0; i < player.hp; i++) {
        ctx.beginPath();
        ctx.arc(35 + i * 30, 35, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawEnemies() {
    enemies.forEach((enemy) => {
        ctx.fillStyle = enemy.color;

        if (enemy.type === 'sphere') {
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        if (enemy.type === 'triangle') {
            ctx.save();
            ctx.translate(enemy.x, enemy.y);
            ctx.rotate(enemy.angle);

            ctx.beginPath();
            ctx.moveTo(enemy.radius, 0);
            ctx.lineTo(-enemy.radius, -enemy.radius);
            ctx.lineTo(-enemy.radius, enemy.radius);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
            return;
        }

        if (enemy.type === 'diamond') {
            ctx.save();
            ctx.translate(enemy.x, enemy.y);
            ctx.rotate(enemy.angle + Math.PI / 2);

            ctx.beginPath();
            ctx.moveTo(0, -enemy.radius);
            ctx.lineTo(enemy.radius * 0.8, 0);
            ctx.lineTo(0, enemy.radius);
            ctx.lineTo(-enemy.radius * 0.8, 0);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    });
}

function drawProjectiles() {
    projectiles.forEach((projectile) => {
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawParticles() {
    particles.forEach((particle) => {
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

function drawShield() {
    if (player.shield <= 0) return;

    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 50, 0, Math.PI * 2);
    ctx.stroke();
}

function drawPlayer() {
    ctx.fillStyle = '#455a64';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 40, Math.PI, 0);
    ctx.fill();

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = '#78909c';
    ctx.fillRect(0, -10, 70, 20);
    ctx.restore();
}

function drawLevelUpMenu() {
    if (gameState !== 'leveling') return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cardWidth = 220;
    const cardHeight = 300;
    const spacing = 30;
    const totalWidth = (cardWidth * 3) + (spacing * 2);
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - cardHeight) / 2;

    currentUpgradeOptions.forEach((option, index) => {
        const x = startX + index * (cardWidth + spacing);
        const y = startY;

        ctx.fillStyle = '#263238';
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, cardWidth, cardHeight);
        ctx.strokeRect(x, y, cardWidth, cardHeight);

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';

        ctx.font = '40px Arial';
        ctx.fillText(option.icon, x + cardWidth / 2, y + 60);

        ctx.font = 'bold 20px Arial';
        ctx.fillText(option.name, x + cardWidth / 2, y + 110);

        ctx.font = '14px Arial';
        ctx.fillText(option.desc, x + cardWidth / 2, y + 150);

        ctx.fillStyle = '#00e5ff';
        ctx.fillText(
            `Nível ${player.stats[option.id]} → ${player.stats[option.id] + 1}`,
            x + cardWidth / 2,
            y + 260
        );
    });
}

function drawGameOver() {
    if (gameState !== 'gameOver') return;

    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawXpBar();
    drawLevelText();
    drawLives();
    drawEnemies();
    drawProjectiles();
    drawParticles();
    drawShield();
    drawPlayer();
    drawLevelUpMenu();
    drawGameOver();
}

function gameLoop(timestamp) {
    update(timestamp);
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;

    if (gameState === 'playing') {
        isShooting = true;
        return;
    }

    if (gameState === 'leveling') {
        checkUpgradeClick(event);
    }
});

window.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
        isShooting = false;
    }
});

window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

canvas.addEventListener('mousemove', (event) => {
    if (gameState !== 'playing') return;

    player.angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    );
});

resizeCanvas();
setInterval(spawnEnemy, 900);
requestAnimationFrame(gameLoop);
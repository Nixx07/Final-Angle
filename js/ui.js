import { ctx, canvas, GAME_STATES } from './config.js';
import { player, game, enemies, projectiles, particles } from './state.js';
import { upgradeIcons } from './icons.js';

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
        barWidth * Math.min(player.currentXp / player.nextLevelXp, 1),
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

function drawBossHealthBar(enemy) {
    const barWidth = 420;
    const barHeight = 18;
    const x = canvas.width / 2 - barWidth / 2;
    const y = 72;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#7c4dff';
    ctx.fillRect(x, y, barWidth * (enemy.hp / enemy.maxHp), barHeight);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ABYSS CORE', canvas.width / 2, y - 8);
}

function drawBoss(enemy) {
    const pulseSize = Math.sin(enemy.pulse) * 6;

    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.angle);

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(124, 77, 255, 0.22)';
    ctx.lineWidth = 10;
    ctx.arc(0, 0, enemy.radius + 14 + pulseSize, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(enemy.angle * -0.5);
    ctx.beginPath();
    ctx.fillStyle = enemy.hitFlash > 0 ? '#ffffff' : '#7c4dff';

    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = Math.cos(angle) * enemy.radius;
        const py = Math.sin(angle) * enemy.radius;

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#311b92';
    ctx.arc(0, 0, enemy.radius * 0.42, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#b388ff';
    ctx.arc(0, 0, enemy.radius * 0.16 + pulseSize * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawOctagon(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.angle);

    ctx.beginPath();

    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const px = Math.cos(angle) * enemy.radius;
        const py = Math.sin(angle) * enemy.radius;

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.closePath();
    ctx.fillStyle = '#8e24aa';
    ctx.fill();

    ctx.strokeStyle = '#ce93d8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = '#f3e5f5';
    ctx.fill();

    ctx.restore();
}

function drawEnemies() {
    enemies.forEach((enemy) => {
        if (enemy.type === 'boss') {
            drawBoss(enemy);
            return;
        }

        if (enemy.type === 'octagon') {
            drawOctagon(enemy);
            return;
        }

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
            return;
        }

        if (enemy.type === 'square') {
            ctx.save();
            ctx.translate(enemy.x, enemy.y);
            ctx.rotate(enemy.angle);

            const size = enemy.radius * 1.7;

            ctx.fillRect(-size / 2, -size / 2, size, size);

            ctx.strokeStyle = '#42a5f5';
            ctx.lineWidth = 2;
            ctx.strokeRect(-size / 2, -size / 2, size, size);

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
        ctx.arc(particle.x, particle.y, particle.size || 3, 0, Math.PI * 2);
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
    if (game.state !== GAME_STATES.LEVELING) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cardWidth = 220;
    const cardHeight = 300;
    const spacing = 30;
    const totalWidth = (cardWidth * 3) + (spacing * 2);
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - cardHeight) / 2;

    game.currentUpgradeOptions.forEach((option, index) => {
        const x = startX + index * (cardWidth + spacing);
        const y = startY;

        ctx.fillStyle = '#263238';
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, cardWidth, cardHeight);
        ctx.strokeRect(x, y, cardWidth, cardHeight);

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';

        const icon = upgradeIcons[option.id];
        if (icon && icon.complete) {
            ctx.drawImage(icon, x + cardWidth / 2 - 28, y + 26, 56, 56);
        }

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

function drawBossIntroOverlay() {
    if (game.state !== GAME_STATES.BOSS_ENTERING) return;

    const elapsed = performance.now() - game.bossIntroStart;
    const blink = Math.floor(elapsed / 180) % 2 === 0;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = blink ? '#ff1744' : '#ffffff';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('WARNING', canvas.width / 2, canvas.height / 2 - 25);

    ctx.font = 'bold 26px Arial';
    ctx.fillText('ABYSS CORE INCOMING', canvas.width / 2, canvas.height / 2 + 20);
}

function drawGameOver() {
    if (game.state !== GAME_STATES.GAME_OVER) return;

    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

function drawTestHint() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Botão direito: abrir level up de teste', canvas.width - 18, canvas.height - 18);
}

export function draw() {
    const shakeX = game.screenShake > 0 ? (Math.random() - 0.5) * game.screenShake : 0;
    const shakeY = game.screenShake > 0 ? (Math.random() - 0.5) * game.screenShake : 0;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(shakeX, shakeY);

    drawXpBar();
    drawLevelText();
    drawLives();
    drawEnemies();
    drawProjectiles();
    drawParticles();
    drawShield();
    drawPlayer();

    const boss = enemies.find((enemy) => enemy.type === 'boss');
    if (boss) {
        drawBossHealthBar(boss);
    }

    ctx.restore();

    drawLevelUpMenu();
    drawBossIntroOverlay();
    drawGameOver();
    drawTestHint();

    if (game.screenShake > 0) {
        game.screenShake *= 0.85;

        if (game.screenShake < 0.4) {
            game.screenShake = 0;
        }
    }
}
import { ctx, canvas, GAME_STATES } from './config.js';
import { player, game, enemies, projectiles, particles, damageNumbers, pickups } from './state.js';
import { upgradeIcons } from './icons.js';

function drawDamageNumbers(delta) {
    const timeScale = delta / (1000 / 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';

    for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const d = damageNumbers[i];

        ctx.globalAlpha = d.alpha;
        ctx.fillText(`-${d.val}`, d.x, d.y);

        d.y -= 1 * timeScale;
        d.alpha -= 0.02 * timeScale;
        d.life = Math.max(0, d.life - delta);

        if (d.life <= 0) {
            damageNumbers.splice(i, 1);
        }
    }

    ctx.globalAlpha = 1;
}

function drawProjectileTrails() {
    projectiles.forEach((projectile) => {
        if (!projectile.trail || projectile.trail.length === 0) return;

        projectile.trail.forEach((point, index) => {
            const ratio = (index + 1) / projectile.trail.length;
            const size = 2 + 5 * ratio;

            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fillStyle = projectile.color;
            ctx.globalAlpha = 0.08 + ratio * 0.35;
            ctx.fill();
            ctx.closePath();
        });
    });

    ctx.globalAlpha = 1;
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

    ctx.fillStyle = enemy.type === 'voidWeaver' ? '#6200ea' : '#7c4dff';
    ctx.fillRect(x, y, barWidth * (enemy.hp / enemy.maxHp), barHeight);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(enemy.type === 'voidWeaver' ? 'VOID WEAVER' : 'ABYSS CORE', canvas.width / 2, y - 8);
}

function drawBoss(enemy) {
    const pulseSize = Math.sin(enemy.pulse || 0) * 6;

    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.angle || 0);

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(124, 77, 255, 0.22)';
    ctx.lineWidth = 10;
    ctx.arc(0, 0, enemy.radius + 14 + pulseSize, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate((enemy.angle || 0) * -0.5);
    ctx.beginPath();
    ctx.fillStyle = enemy.hitFlash > 0 ? '#ffffff' : '#7c4dff';

    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = Math.cos(angle) * enemy.radius;
        const py = Math.sin(angle) * enemy.radius;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
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
}

function drawVoidWeaver(boss) {
    const time = Date.now() * 0.003;

    ctx.translate(boss.x, boss.y);
    ctx.rotate(time * 0.4);

    const glow = boss.hitFlash > 0 ? '#ffffff' : boss.secondaryColor;
    const core = boss.hitFlash > 0 ? '#cfd8dc' : boss.color;
    const inner = boss.hitFlash > 0 ? '#ffffff' : '#000000';
    const ringRadius = boss.radius + Math.sin(time * 3) * 5;

    ctx.strokeStyle = glow;
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i + time * 0.5;
        const startX = Math.cos(angle) * (boss.radius - 10);
        const startY = Math.sin(angle) * (boss.radius - 10);
        const endX = Math.cos(angle) * (ringRadius + 10);
        const endY = Math.sin(angle) * (ringRadius + 10);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
    ctx.fillStyle = core;
    ctx.fill();

    ctx.strokeStyle = glow;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, boss.radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = inner;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 14 + Math.sin(time * 4) * 3, 0, Math.PI * 2);
    ctx.fillStyle = '#84ffff';
    ctx.fill();
}

function drawOctagon(enemy) {
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.angle || 0);

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const px = Math.cos(angle) * enemy.radius;
        const py = Math.sin(angle) * enemy.radius;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
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
}

function drawEliteAura(enemy) {
    const pulse = Math.sin(enemy.glow || 0) * 5;

    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius + 10 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = enemy.hitFlash > 0 ? '#ffffff' : 'rgba(255, 215, 64, 0.85)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius + 18 + pulse * 0.6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 241, 118, 0.28)';
    ctx.lineWidth = 6;
    ctx.stroke();
}

function drawEnemyShape(enemy, typeToDraw) {
    if (typeToDraw === 'sphere' || typeToDraw === 'swarm') {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    if (typeToDraw === 'triangle') {
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.angle || 0);

        ctx.beginPath();
        ctx.moveTo(enemy.radius, 0);
        ctx.lineTo(-enemy.radius, -enemy.radius);
        ctx.lineTo(-enemy.radius, enemy.radius);
        ctx.closePath();
        ctx.fill();
        return;
    }

    if (typeToDraw === 'diamond') {
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate((enemy.angle || 0) + Math.PI / 2);

        ctx.beginPath();
        ctx.moveTo(0, -enemy.radius);
        ctx.lineTo(enemy.radius * 0.8, 0);
        ctx.lineTo(0, enemy.radius);
        ctx.lineTo(-enemy.radius * 0.8, 0);
        ctx.closePath();
        ctx.fill();
        return;
    }

    if (typeToDraw === 'square') {
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.angle || 0);

        const size = enemy.radius * 1.7;
        ctx.fillRect(-size / 2, -size / 2, size, size);

        ctx.strokeStyle = enemy.elite ? '#fff59d' : '#42a5f5';
        ctx.lineWidth = enemy.elite ? 4 : 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
    }
}

function drawEnemies() {
    enemies.forEach((enemy) => {
        ctx.save();

        if (enemy.hitFlash > 0) {
            ctx.filter = 'brightness(5)';
        }

        if (enemy.type === 'voidWeaver') {
            drawVoidWeaver(enemy);
            ctx.restore();
            return;
        }

        if (enemy.type === 'boss') {
            drawBoss(enemy);
            ctx.restore();
            return;
        }

        if (enemy.type === 'octagon') {
            drawOctagon(enemy);
            ctx.restore();
            return;
        }

        if (enemy.elite) {
            drawEliteAura(enemy);
        }

        ctx.fillStyle = enemy.hitFlash > 0 ? '#ffffff' : enemy.color;

        const shapeType = enemy.elite ? enemy.baseType : enemy.type;
        drawEnemyShape(enemy, shapeType);

        ctx.restore();
    });
}

function drawProjectiles() {
    projectiles.forEach((projectile) => {
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius || 6, 0, Math.PI * 2);
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
    });

    ctx.globalAlpha = 1;
}

function drawPickups() {
    pickups.forEach((pickup) => {
        const pulse = Math.sin(pickup.pulse) * 3;

        ctx.save();
        ctx.translate(pickup.x, pickup.y);

        if (pickup.kind === 'heal') {
            ctx.rotate(Math.PI / 4);

            const size = pickup.radius * 1.5 + pulse;
            ctx.fillStyle = '#66bb6a';
            ctx.fillRect(-size / 2, -size / 2, size, size);

            ctx.rotate(-Math.PI / 4);
            ctx.fillStyle = '#e8f5e9';
            ctx.fillRect(-5, -14, 10, 28);
            ctx.fillRect(-14, -5, 28, 10);
        } else if (pickup.kind === 'chest') {
            const w = pickup.radius * 2.1 + pulse;
            const h = pickup.radius * 1.5 + pulse * 0.5;

            ctx.fillStyle = '#6d4c41';
            ctx.fillRect(-w / 2, -h / 2, w, h);

            ctx.strokeStyle = '#ffd54f';
            ctx.lineWidth = 3;
            ctx.strokeRect(-w / 2, -h / 2, w, h);

            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(0, h / 2);
            ctx.stroke();

            ctx.fillStyle = '#ffecb3';
            ctx.fillRect(-4, -3, 8, 6);
        }

        ctx.restore();
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
    ctx.save();

    if (player.invincibleTimer > 0) {
        const blink = Math.floor(performance.now() / 80) % 2 === 0;
        ctx.globalAlpha = blink ? 1 : 0.25;
    }

    if (game.isDashing) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00e5ff';
        ctx.globalAlpha = 0.6;
    }

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

    ctx.restore();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(player.x - 20, player.y + 30, 40, 5);

    ctx.fillStyle = game.dashCooldown <= 0 ? '#00e5ff' : '#555';
    const dashCooldownMax = 45 * (1000 / 60);
    const dashProgress = Math.max(0, 1 - (game.dashCooldown || 0) / dashCooldownMax);
    ctx.fillRect(player.x - 20, player.y + 30, 40 * dashProgress, 5);
}

function drawLevelUpMenu() {
    if (game.state !== GAME_STATES.LEVELING) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cardWidth = 220;
    const cardHeight = 300;
    const spacing = 30;
    const totalWidth = cardWidth * 3 + spacing * 2;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - cardHeight) / 2;

    if (game.pendingLevelUps > 1) {
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Escolha ${game.pendingLevelUps} upgrades`, canvas.width / 2, startY - 30);
    }

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
    if (!game.bossSpawned && !game.boss2Active) return;

    const elapsed = performance.now() - game.bossIntroStart;
    const introDuration = 2200;

    if (elapsed < 0 || elapsed > introDuration) return;

    const blink = Math.floor(elapsed / 180) % 2 === 0;
    const currentBoss = enemies.find((enemy) => enemy.type === 'voidWeaver' || enemy.type === 'boss');

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = blink ? '#ff1744' : '#ffffff';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('WARNING', canvas.width / 2, canvas.height / 2 - 25);

    ctx.font = 'bold 26px Arial';
    ctx.fillText(
        currentBoss && currentBoss.type === 'voidWeaver'
            ? 'VOID WEAVER INCOMING'
            : 'ABYSS CORE INCOMING',
        canvas.width / 2,
        canvas.height / 2 + 20
    );
}

function drawSwarmWarning() {
    if (game.swarmFlashTimer > 0) {
        const fullDuration = 45 * (1000 / 60);
        const alpha = 0.18 + Math.min(1, game.swarmFlashTimer / fullDuration) * 0.22;
        ctx.fillStyle = `rgba(255, 235, 59, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (game.swarmMessageTimer > 0) {
        const blink = Math.floor(performance.now() / 140) % 2 === 0;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = blink ? '#ffee58' : '#ffffff';
        ctx.font = 'bold 44px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AVISO', canvas.width / 2, canvas.height / 2 - 18);

        ctx.font = 'bold 24px Arial';
        ctx.fillText('ENXAME DETECTADO', canvas.width / 2, canvas.height / 2 + 22);
    }
}

function drawGameOver() {
    if (game.state !== GAME_STATES.GAME_OVER) return;

    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

function drawVictory() {
    if (game.state !== GAME_STATES.VICTORY) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffea00';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VITÓRIA!', canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Parabéns, você derrotou o boss de nível 20!', canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText('Voltando ao menu...', canvas.width / 2, canvas.height / 2 + 70);
}

function drawDashHint() {
    if (game.dashHintTimer <= 0) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(canvas.width / 2 - 210, canvas.height - 120, 420, 60);

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Dash liberado! Aperte Espaço para usar', canvas.width / 2, canvas.height - 80);
}

function drawTestHint() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
}

export function draw(delta) {
    const shakeX = game.screenShake > 0 ? (Math.random() - 0.5) * game.screenShake : 0;
    const shakeY = game.screenShake > 0 ? (Math.random() - 0.5) * game.screenShake : 0;

    ctx.save();
    ctx.clearRect(-100, -100, canvas.width + 200, canvas.height + 200);
    ctx.translate(shakeX, shakeY);

    drawXpBar();
    drawLevelText();
    drawLives();
    drawEnemies();
    drawProjectileTrails();
    drawProjectiles();
    drawParticles();
    drawPickups();
    drawShield();
    drawPlayer();
    drawDamageNumbers(delta);

    const boss = enemies.find((enemy) => enemy.type === 'voidWeaver' || enemy.type === 'boss');
    if (boss) {
        drawBossHealthBar(boss);
    }

    ctx.restore();

    drawLevelUpMenu();
    drawBossIntroOverlay();
    drawDashHint();
    drawSwarmWarning();
    drawGameOver();
    drawVictory();
    drawTestHint();

    if (game.screenShake > 0) {
        const decayRate = Math.pow(0.9, delta / (1000 / 60));
        game.screenShake *= decayRate;

        if (game.screenShake < 0.4) {
            game.screenShake = 0;
        }
    }
}
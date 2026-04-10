import { canvas, GAME_STATES } from './config.js';
import { player, game, enemies, projectiles } from './state.js';
import { createEnemyParticles } from './particles.js';
import { startLevelUp } from './upgrades.js';

function createBaseEnemy() {
    return {
        type: 'sphere',
        radius: 22,
        hp: 1,
        xp: 20,
        color: '#ff80ab',
        speedMin: 1.2,
        speedMax: 2.2,
        damage: 1
    };
}

function createEnemyByLevel() {
    if (player.level >= 10) {
        const roll = Math.random();

        if (roll < 0.5) {
            return {
                type: 'triangle',
                radius: 22,
                hp: 2,
                xp: 35,
                color: '#f44336',
                speedMin: 1.5,
                speedMax: 2.4,
                damage: 1
            };
        }

        if (roll < 0.8) {
            return {
                type: 'square',
                radius: 26,
                hp: 3,
                xp: 85,
                color: '#0d47a1',
                speedMin: 1.2,
                speedMax: 2.2,
                damage: 2
            };
        }

        return {
            type: 'diamond',
            radius: 26,
            hp: 3,
            xp: 55,
            color: '#4caf50',
            speedMin: 2.4,
            speedMax: 3.2,
            damage: 1
        };
    }

    if (player.level >= 8) {
        const roll = Math.random();

        if (roll < 0.65) {
            return {
                type: 'triangle',
                radius: 22,
                hp: 2,
                xp: 35,
                color: '#f44336',
                speedMin: 1.5,
                speedMax: 2.4,
                damage: 1
            };
        }

        if (roll < 0.9) {
            return {
                type: 'square',
                radius: 26,
                hp: 3,
                xp: 85,
                color: '#0d47a1',
                speedMin: 1.2,
                speedMax: 2.2,
                damage: 2
            };
        }

        return {
            type: 'diamond',
            radius: 26,
            hp: 3,
            xp: 55,
            color: '#4caf50',
            speedMin: 2.4,
            speedMax: 3.2,
            damage: 1
        };
    }

    if (player.level >= 6) {
        const roll = Math.random();

        if (roll < 0.3) {
            return {
                type: 'diamond',
                radius: 26,
                hp: 3,
                xp: 55,
                color: '#4caf50',
                speedMin: 2.4,
                speedMax: 3.2,
                damage: 1
            };
        }

        if (roll < 0.65) {
            return {
                type: 'triangle',
                radius: 22,
                hp: 2,
                xp: 35,
                color: '#f44336',
                speedMin: 1.5,
                speedMax: 2.4,
                damage: 1
            };
        }

        return createBaseEnemy();
    }

    if (player.level >= 3 && Math.random() < 0.5) {
        return {
            type: 'triangle',
            radius: 22,
            hp: 2,
            xp: 35,
            color: '#f44336',
            speedMin: 1.5,
            speedMax: 2.4,
            damage: 1
        };
    }

    return createBaseEnemy();
}

function createBoss() {
    return {
        type: 'boss',
        x: canvas.width / 2,
        y: -160,
        radius: 78,
        hp: 200,
        maxHp: 200,
        xp: 350,
        color: '#7c4dff',
        angle: 0,

        targetY: 150,
        phase: 'entering',
        pulse: 0,
        driftAngle: 0,
        hitFlash: 0,
        summonCooldown: 120
    };
}

function createBossMinion(x, y) {
    const angleToPlayer = Math.atan2(player.y - y, player.x - x);
    const speed = 2.1;

    return {
        type: 'octagon',
        x,
        y,
        radius: 18,
        vx: Math.cos(angleToPlayer) * speed,
        vy: Math.sin(angleToPlayer) * speed,
        hp: 2,
        xp: 28,
        color: '#8e24aa',
        angle: angleToPlayer,
        spin: Math.random() > 0.5 ? 0.05 : -0.05,
        damage: 1
    };
}

function spawnBossMinions(boss) {
    const totalMinions = 2;

    for (let i = 0; i < totalMinions; i++) {
        const spawnAngle = boss.angle + (i === 0 ? -0.8 : 0.8);
        const distance = boss.radius + 28;
        const x = boss.x + Math.cos(spawnAngle) * distance;
        const y = boss.y + Math.sin(spawnAngle) * distance;

        enemies.push(createBossMinion(x, y));
    }

    game.screenShake = Math.max(game.screenShake, 8);
}

function spawnBoss() {
    enemies.push(createBoss());
    game.bossSpawned = true;
    game.bossIntroStart = performance.now();
    game.state = GAME_STATES.BOSS_ENTERING;
    game.screenShake = 18;
}

export function spawnEnemy() {
    if (game.state !== GAME_STATES.PLAYING) return;
    if (game.bossSpawned && !game.bossDefeated) return;

    if (player.level >= 10 && !game.bossSpawned) {
        spawnBoss();
        return;
    }

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
        angle: angleToPlayer,
        damage: enemyData.damage
    });
}

function updateBoss(enemy) {
    enemy.pulse += 0.08;

    if (enemy.phase === 'entering') {
        enemy.y += 2.8;
        enemy.angle += 0.04;

        if (enemy.y >= enemy.targetY) {
            enemy.y = enemy.targetY;
            enemy.phase = 'active';
            game.state = GAME_STATES.PLAYING;
            game.screenShake = 10;
        }

        return;
    }

    enemy.driftAngle += 0.02;
    enemy.x += Math.sin(enemy.driftAngle) * 1.6;

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    enemy.angle = Math.atan2(dy, dx);

    enemy.x += Math.cos(enemy.angle) * 0.35;
    enemy.y += Math.sin(enemy.angle) * 0.2;

    const margin = enemy.radius + 20;

    if (enemy.x < margin) enemy.x = margin;
    if (enemy.x > canvas.width - margin) enemy.x = canvas.width - margin;
    if (enemy.y < 80) enemy.y = 80;
    if (enemy.y > canvas.height / 2) enemy.y = canvas.height / 2;

    enemy.summonCooldown--;

    if (enemy.summonCooldown <= 0) {
        spawnBossMinions(enemy);
        enemy.summonCooldown = 150;
    }

    if (enemy.hitFlash > 0) {
        enemy.hitFlash--;
    }
}

function updateBossMinion(enemy) {
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;
    enemy.angle += enemy.spin;

    const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    const homingStrength = 0.08;

    enemy.vx += Math.cos(angleToPlayer) * homingStrength;
    enemy.vy += Math.sin(angleToPlayer) * homingStrength;

    const maxSpeed = 2.8;
    const currentSpeed = Math.hypot(enemy.vx, enemy.vy);

    if (currentSpeed > maxSpeed) {
        enemy.vx = (enemy.vx / currentSpeed) * maxSpeed;
        enemy.vy = (enemy.vy / currentSpeed) * maxSpeed;
    }
}

function damagePlayer(amount) {
    if (player.shield > 0) {
        player.shield--;
        return;
    }

    player.hp -= amount;

    if (player.hp <= 0) {
        player.hp = 0;
        game.state = GAME_STATES.GAME_OVER;
    }
}

export function updateEnemies() {
    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = enemies[enemyIndex];

        if (enemy.type === 'boss') {
            updateBoss(enemy);
        } else if (enemy.type === 'octagon') {
            updateBossMinion(enemy);
        } else {
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;

            if (
                enemy.type === 'triangle' ||
                enemy.type === 'diamond' ||
                enemy.type === 'square'
            ) {
                enemy.angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            }
        }

        const collisionPadding = enemy.type === 'boss' ? 48 : 35;
        const hitPlayer =
            Math.hypot(enemy.x - player.x, enemy.y - player.y) < enemy.radius + collisionPadding;

        if (hitPlayer) {
            if (enemy.type === 'boss') {
                damagePlayer(2);
                enemy.hitFlash = 8;
                game.screenShake = 12;
            } else {
                damagePlayer(enemy.damage || 1);
                enemies.splice(enemyIndex, 1);
            }

            continue;
        }

        if (enemy.type === 'boss' && enemy.phase === 'entering') {
            continue;
        }

        for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
            const projectile = projectiles[projectileIndex];

            const hitDistance = enemy.type === 'boss' ? enemy.radius + 10 : enemy.radius;
            const hitByProjectile =
                Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y) < hitDistance;

            if (!hitByProjectile) continue;

            enemy.hp -= projectile.damage;
            projectiles.splice(projectileIndex, 1);

            if (enemy.type === 'boss') {
                enemy.hitFlash = 4;
                game.screenShake = 5;
            }

            if (enemy.hp <= 0) {
                player.currentXp += enemy.xp;
                createEnemyParticles(enemy);
                enemies.splice(enemyIndex, 1);

                if (enemy.type === 'boss') {
                    game.bossDefeated = true;
                    game.screenShake = 22;
                }

                if (player.currentXp >= player.nextLevelXp) {
                    startLevelUp();
                }
            }

            break;
        }
    }
}
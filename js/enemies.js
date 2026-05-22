import { canvas, GAME_STATES } from './config.js';
import { player, game, enemies, projectiles, damageNumbers, pickups } from './state.js';
import { createEnemyParticles } from './particles.js';
import { startLevelUp, applyRandomFreeUpgrade } from './upgrades.js';

// =========================
// Inimigos base
// =========================

function createBaseEnemy() {
    return {
        type: 'sphere',
        radius: 22,
        hp: 1,
        xp: 24,
        color: '#ff80ab',
        speedMin: 1.2,
        speedMax: 2.2,
        damage: 1,
        hitFlash: 0
    };
}

function createEnemyByLevel() {
    let enemy;

    if (player.level >= 10) {
        const roll = Math.random();

        if (roll < 0.5) {
            enemy = {
                type: 'triangle',
                radius: 22,
                hp: 2,
                xp: 40,
                color: '#f44336',
                speedMin: 1.5,
                speedMax: 2.4,
                damage: 1
            };
        } else if (roll < 0.8) {
            enemy = {
                type: 'square',
                radius: 26,
                hp: 3,
                xp: 95,
                color: '#0d47a1',
                speedMin: 1.2,
                speedMax: 2.2,
                damage: 2
            };
        } else {
            enemy = {
                type: 'diamond',
                radius: 26,
                hp: 3,
                xp: 65,
                color: '#4caf50',
                speedMin: 2.4,
                speedMax: 3.2,
                damage: 1
            };
        }
    } else if (player.level >= 8) {
        const roll = Math.random();

        if (roll < 0.65) {
            enemy = {
                type: 'triangle',
                radius: 22,
                hp: 2,
                xp: 40,
                color: '#f44336',
                speedMin: 1.5,
                speedMax: 2.4,
                damage: 1
            };
        } else if (roll < 0.9) {
            enemy = {
                type: 'square',
                radius: 26,
                hp: 3,
                xp: 95,
                color: '#0d47a1',
                speedMin: 1.2,
                speedMax: 2.2,
                damage: 2
            };
        } else {
            enemy = {
                type: 'diamond',
                radius: 26,
                hp: 3,
                xp: 65,
                color: '#4caf50',
                speedMin: 2.4,
                speedMax: 3.2,
                damage: 1
            };
        }
    } else if (player.level >= 6) {
        const roll = Math.random();

        if (roll < 0.3) {
            enemy = {
                type: 'diamond',
                radius: 26,
                hp: 3,
                xp: 65,
                color: '#4caf50',
                speedMin: 2.4,
                speedMax: 3.2,
                damage: 1
            };
        } else if (roll < 0.65) {
            enemy = {
                type: 'triangle',
                radius: 22,
                hp: 2,
                xp: 40,
                color: '#f44336',
                speedMin: 1.5,
                speedMax: 2.4,
                damage: 1
            };
        } else {
            enemy = createBaseEnemy();
        }
    } else if (player.level >= 3 && Math.random() < 0.5) {
        enemy = {
            type: 'triangle',
            radius: 22,
            hp: 2,
            xp: 40,
            color: '#f44336',
            speedMin: 1.5,
            speedMax: 2.4,
            damage: 1
        };
    } else {
        enemy = createBaseEnemy();
    }

    enemy.hitFlash = 0;
    return enemy;
}

// =========================
// Horda
// =========================

function createSwarmEnemy() {
    return {
        type: 'swarm',
        radius: 16,
        hp: 1,
        xp: 35,
        color: '#ffd54f',
        damage: 1,
        hitFlash: 0,
        elite: false
    };
}

function startSwarmEvent() {
    game.swarmActive = true;
    game.swarmPendingCount = player.level <= 5 ? 55 : (player.level <= 12 ? 85 : 110);
    game.swarmFlashTimer = 45;
    game.swarmMessageTimer = 110;
    game.swarmCooldown = 1100;
    game.screenShake = Math.max(game.screenShake, 10);
}

function spawnSwarmEnemy() {
    const enemyData = createSwarmEnemy();
    const margin = 40;
    let x;
    let y;

    if (Math.random() < 0.5) {
        x = Math.random() * canvas.width;
        y = -margin;
    } else {
        x = Math.random() < 0.5 ? -margin : canvas.width + margin;
        y = Math.random() * (canvas.height * 0.5);
    }

    const angle = Math.atan2(player.y - y, player.x - x);
    const speed = 0.8 + Math.random() * 0.4;

    enemies.push({
        ...enemyData,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        angle
    });
}

// =========================
// Elite
// =========================

function createEliteEnemy(baseEnemy) {
    const sizeMultiplier = 1.6;
    const hpMultiplier = 5;
    const xpMultiplier = 4.5;

    return {
        ...baseEnemy,
        type: `${baseEnemy.type}_elite`,
        baseType: baseEnemy.type,
        radius: Math.round(baseEnemy.radius * sizeMultiplier),
        hp: Math.max(10, Math.round(baseEnemy.hp * hpMultiplier)),
        maxHp: Math.max(10, Math.round(baseEnemy.hp * hpMultiplier)),
        xp: Math.round(baseEnemy.xp * xpMultiplier),
        damage: 2,
        elite: true,
        glow: 0,
        hitFlash: 0,
        baseSpeed: (baseEnemy.speedMin || 1.2) + 0.5,
        maxSpeed: 3.5
    };
}

function maybeSpawnElite() {
    const eliteTier = Math.floor(player.level / 6);

    if (eliteTier <= 0) return false;
    if (game.lastEliteLevelSpawned >= eliteTier) return false;
    if (game.bossSpawned && !game.bossDefeated) return false;
    if (game.boss2Active) return false;

    const baseEnemy = createEnemyByLevel();
    const eliteData = createEliteEnemy(baseEnemy);
    const margin = 50;

    let x;
    let y;

    if (Math.random() < 0.5) {
        x = Math.random() * canvas.width;
        y = -margin;
    } else {
        x = Math.random() < 0.5 ? -margin : canvas.width + margin;
        y = Math.random() * (canvas.height * 0.4);
    }

    const angle = Math.atan2(player.y - y, player.x - x);

    enemies.push({
        ...eliteData,
        x,
        y,
        vx: Math.cos(angle) * eliteData.baseSpeed,
        vy: Math.sin(angle) * eliteData.baseSpeed,
        angle
    });

    game.lastEliteLevelSpawned = eliteTier;
    game.screenShake = Math.max(game.screenShake, 12);

    return true;
}

function dropEliteReward(enemy) {
    const kind = Math.random() < 0.55 ? 'heal' : 'chest';

    pickups.push({
        kind,
        x: enemy.x,
        y: enemy.y,
        radius: kind === 'heal' ? 14 : 18,
        pulse: 0,
        life: 1200,
        speed: 3
    });
}

// =========================
// Boss
// =========================

function createBoss() {
    return {
        type: 'boss',
        x: canvas.width / 2,
        y: -160,
        radius: 78,
        hp: 200,
        maxHp: 200,
        xp: 10000,
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
    const startSpeed = 1.35;

    return {
        type: 'octagon',
        x,
        y,
        radius: 18,
        vx: Math.cos(angleToPlayer) * startSpeed,
        vy: Math.sin(angleToPlayer) * startSpeed,
        hp: 2,
        xp: 28,
        color: '#8e24aa',
        angle: angleToPlayer,
        spin: Math.random() > 0.5 ? 0.04 : -0.04,
        damage: 1,
        hitFlash: 0
    };
}

function spawnBossMinions(boss) {
    for (let i = 0; i < 2; i++) {
        const spawnAngle = boss.angle + (i === 0 ? -0.8 : 0.8);
        const distanceFromBoss = boss.radius + 28;
        const minionX = boss.x + Math.cos(spawnAngle) * distanceFromBoss;
        const minionY = boss.y + Math.sin(spawnAngle) * distanceFromBoss;

        enemies.push(createBossMinion(minionX, minionY));
    }
}

function spawnBoss() {
    enemies.push(createBoss());
    game.bossSpawned = true;
    game.bossIntroStart = performance.now();
    game.state = GAME_STATES.PLAYING;
    game.screenShake = 18;
}

function spawnLevel20Boss() {
    const boss = {
        type: 'voidWeaver',
        x: canvas.width / 2,
        y: -120,
        hp: 1500,
        maxHp: 1500,
        xp: 20000,
        radius: 72,
        phase: 'entering',
        attackTimer: 0,
        angle: 0,
        color: '#004d40',
        secondaryColor: '#00bfa5',
        hitFlash: 0,
        driftAngle: 0,
        orbitPhase: 0
    };

    enemies.push(boss);
    game.boss2Active = true;
    game.bossIntroStart = performance.now();
    game.screenShake = 24;
}

function updateVoidWeaver(boss) {
    boss.attackTimer++;
    boss.orbitPhase += 0.04;
    boss.driftAngle += 0.01;
    boss.pulse = (boss.pulse || 0) + 0.05;

    if (boss.phase === 'entering') {
        boss.y += 2;

        if (boss.y >= 160) {
            boss.y = 160;
            boss.phase = 'attack1';
            boss.attackTimer = 0;
        }

        return;
    }

    boss.x += Math.sin(boss.driftAngle) * 1.8;
    boss.y += Math.sin(boss.driftAngle * 0.8) * 0.9;

    if (boss.phase === 'attack1') {
        if (boss.attackTimer % 90 === 0) {
            spawnBulletRing(boss.x, boss.y, 4, 3, '#18ffff');
        }

        if (boss.attackTimer % 180 === 0) {
            spawnVoidBurst(boss);
        }

        if (boss.attackTimer > 300) {
            boss.phase = 'attack2';
            boss.attackTimer = 0;
        }

        boss.x = Math.max(boss.radius + 20, Math.min(canvas.width - boss.radius - 20, boss.x));
        boss.y = Math.max(80, Math.min(canvas.height - boss.radius - 100, boss.y));
        return;
    }

    if (boss.phase === 'attack2') {
        if (boss.attackTimer === 1) {
            boss.targetAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        }

        if (boss.attackTimer < 35) {
            boss.x += Math.cos(boss.targetAngle) * 4;
            boss.y += Math.sin(boss.targetAngle) * 3;
        } else if (boss.attackTimer % 30 === 0) {
            spawnTargetedVolley(boss, 2, 3.5);
        }

        if (boss.attackTimer > 100) {
            boss.phase = 'attack1';
            boss.attackTimer = 0;
        }
    }

    boss.x = Math.max(boss.radius + 10, Math.min(canvas.width - boss.radius - 10, boss.x));
    boss.y = Math.max(boss.radius + 20, Math.min(canvas.height - boss.radius - 100, boss.y));
}

function spawnVoidBurst(boss) {
    const ringCount = 4;

    for (let i = 0; i < ringCount; i++) {
        const angle = (Math.PI * 2 / ringCount) * i + boss.orbitPhase;

        projectiles.push({
            x: boss.x + Math.cos(angle) * 40,
            y: boss.y + Math.sin(angle) * 40,
            vx: Math.cos(angle) * 4,
            vy: Math.sin(angle) * 4,
            enemyBullet: true,
            damage: 0.5,
            color: '#64ffda',
            radius: 6
        });
    }
}

function spawnTargetedVolley(boss, count, speed) {
    for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * 0.35;
        const angle = boss.targetAngle + offset;

        projectiles.push({
            x: boss.x + Math.cos(angle) * 30,
            y: boss.y + Math.sin(angle) * 30,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            enemyBullet: true,
            damage: 0.5,
            color: '#82fff4',
            radius: 7
        });
    }
}

function spawnBulletRing(x, y, count, speed, color = '#00e5ff') {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;

        projectiles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            enemyBullet: true,
            color,
            radius: 8
        });
    }
}

// =========================
// Spawn principal
// =========================

export function spawnEnemy() {
    if (game.state !== GAME_STATES.PLAYING) return;
    if ((game.bossSpawned && !game.bossDefeated) || game.boss2Active) return;

    if (game.swarmCooldown > 0) {
        game.swarmCooldown--;
    }

    // Boss 2 tem prioridade total no nível 20
    if (player.level >= 20 && !game.boss2Active) {
        spawnLevel20Boss();
        game.boss2Active = true;
        return;
    }

    const swarmLevels = [5, 8, 12];
    const shouldStartSwarm =
        swarmLevels.includes(player.level) ||
        (player.level > 12 && (player.level - 12) % 4 === 0);

    if (!game.swarmActive && game.lastSwarmLevel !== player.level && shouldStartSwarm) {
        startSwarmEvent();
        game.lastSwarmLevel = player.level;
    }

    if (game.swarmActive) {
        const amountToSpawn = Math.min(2, game.swarmPendingCount);

        for (let i = 0; i < amountToSpawn; i++) {
            spawnSwarmEnemy();
        }

        game.swarmPendingCount -= amountToSpawn;

        if (game.swarmPendingCount <= 0) {
            game.swarmActive = false;
        }

        return;
    }

    if (maybeSpawnElite()) return;

    if (player.level >= 10 && !game.bossSpawned) {
        spawnBoss();
        return;
    }

    const enemyData = createEnemyByLevel();
    const margin = 40;
    let x;
    let y;

    if (Math.random() < 0.5) {
        x = Math.random() * canvas.width;
        y = -margin;
    } else {
        x = Math.random() < 0.5 ? -margin : canvas.width + margin;
        y = Math.random() * (canvas.height * 0.4);
    }

    const angle = Math.atan2(player.y - y, player.x - x);
    const speed = enemyData.speedMin + Math.random() * (enemyData.speedMax - enemyData.speedMin);

    enemies.push({
        ...enemyData,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        angle
    });
}

// =========================
// Pickups
// =========================

export function updatePickups() {
    for (let i = pickups.length - 1; i >= 0; i--) {
        const pickup = pickups[i];

        pickup.pulse += 0.05;
        pickup.life--;

        const dx = player.x - pickup.x;
        const dy = player.y - pickup.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 0) {
            const speed = pickup.speed || 3;
            pickup.x += (dx / distance) * speed;
            pickup.y += (dy / distance) * speed;
        }

        if (distance < 45) {
            if (pickup.kind === 'heal') {
                player.hp = Math.min(player.hp + 1, player.maxHp);
            } else if (pickup.kind === 'chest') {
                applyRandomFreeUpgrade();
            }

            pickups.splice(i, 1);
            continue;
        }

        if (pickup.life <= 0) {
            pickups.splice(i, 1);
        }
    }
}

// =========================
// Dano no player
// =========================

export function damagePlayer(amount) {
    if (player.invincibleTimer > 0) return;

    if (player.shield > 0) {
        player.shield--;
        game.screenShake = 15;
        player.invincibleTimer = 120;
        return;
    }

    player.hp -= amount;
    player.invincibleTimer = 120;
    game.screenShake = 20;

    if (player.hp <= 0) {
        game.state = GAME_STATES.GAME_OVER;
    }
}

// =========================
// Atualização dos inimigos
// =========================

export function updateEnemies() {
    updatePickups();

    if (game.swarmFlashTimer > 0) game.swarmFlashTimer--;
    if (game.swarmMessageTimer > 0) game.swarmMessageTimer--;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (enemy.hitFlash > 0) {
            enemy.hitFlash--;
        }

        if (enemy.type === 'voidWeaver') {
            updateVoidWeaver(enemy);
        } else if (enemy.type === 'boss') {
            updateBoss(enemy);
        } else if (enemy.type === 'octagon') {
            updateBossMinion(enemy);
        } else if (enemy.elite) {
            updateElite(enemy);
        } else {
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;
            enemy.angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        }

        const collisionDistance =
            enemy.type === 'boss' || enemy.type === 'voidWeaver'
                ? enemy.radius + 8
                : enemy.radius + 15;

        const touchingPlayer =
            Math.hypot(enemy.x - player.x, enemy.y - player.y) < collisionDistance;

        if (touchingPlayer) {
            if (game.isDashing) {
                if (enemy.type !== 'boss' && enemy.type !== 'voidWeaver') {
                    enemy.hp -= 10;
                    enemy.hitFlash = 6;
                    game.screenShake = Math.max(game.screenShake, 6);

                    if (enemy.hp <= 0) {
                        player.currentXp += enemy.xp;
                        createEnemyParticles(enemy);

                        if (enemy.elite) {
                            dropEliteReward(enemy);
                        }

                        enemies.splice(i, 1);

                        if (player.currentXp >= player.nextLevelXp) {
                            startLevelUp();
                        }
                    }
                }

                continue;
            }

            if (enemy.type === 'boss' || enemy.type === 'voidWeaver') {
                damagePlayer(2);
            } else {
                damagePlayer(enemy.damage || 1);
                enemies.splice(i, 1);
            }

            continue;
        }

        for (let j = projectiles.length - 1; j >= 0; j--) {
            const bullet = projectiles[j];
            if (bullet.enemyBullet) continue;

            const hitDistance =
                enemy.type === 'boss' || enemy.type === 'voidWeaver'
                    ? enemy.radius + 10
                    : enemy.radius;

            if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < hitDistance) {
                const damageValue = bullet.damage || 1;
                enemy.hp -= damageValue;
                const isBossEnemy = enemy.type === 'boss' || enemy.type === 'voidWeaver';

                if (!isBossEnemy) {
                    enemy.hitFlash = 5;
                    game.screenShake = Math.max(game.screenShake, enemy.elite ? 5 : 3);
                }

                if (isBossEnemy) {
                    if (enemy.lastDamageNumber && enemy.lastDamageNumber.life > 0) {
                        enemy.lastDamageNumber.val += damageValue;
                        enemy.lastDamageNumber.alpha = 1;
                        enemy.lastDamageNumber.life = 25;
                        enemy.lastDamageNumber.x = enemy.x;
                        enemy.lastDamageNumber.y = enemy.y;
                    } else {
                        const damageNumber = {
                            x: enemy.x,
                            y: enemy.y,
                            val: damageValue,
                            alpha: 1,
                            life: 25
                        };
                        damageNumbers.push(damageNumber);
                        enemy.lastDamageNumber = damageNumber;
                    }
                } else {
                    damageNumbers.push({
                        x: enemy.x,
                        y: enemy.y,
                        val: damageValue,
                        alpha: 1,
                        life: enemy.elite ? 50 : 40
                    });
                }

                if (!bullet.hits) {
                    bullet.hits = [];
                }

                if (!bullet.hits.includes(enemy)) {
                    bullet.hits.push(enemy);
                    bullet.pierceCount--;

                    if (bullet.pierceCount <= 0 || enemy.type === 'boss' || enemy.type === 'voidWeaver') {
                        projectiles.splice(j, 1);
                    }
                }

                if (enemy.hp <= 0) {
                    player.currentXp += enemy.xp || 0;
                    createEnemyParticles(enemy);

                    if (enemy.elite) {
                        dropEliteReward(enemy);
                    }

                    if (enemy.type === 'boss') {
                        game.bossDefeated = true;
                        game.screenShake = 30;
                        player.hp = player.maxHp;
                    }

                    if (enemy.type === 'voidWeaver') {
                        game.boss2Active = false;
                        game.screenShake = 35;
                        player.hp = player.maxHp;
                    }

                    enemies.splice(i, 1);

                    if (player.currentXp >= player.nextLevelXp) {
                        startLevelUp();
                    }

                    break;
                }
            }
        }
    }
}

// =========================
// Comportamentos específicos
// =========================

function updateBoss(boss) {
    if (boss.phase === 'entering') {
        boss.y += 1.5;

        if (boss.y >= boss.targetY) {
            boss.y = boss.targetY;
            boss.phase = 'active';
        }

        return;
    }

    boss.pulse += 0.05;
    boss.driftAngle += 0.01;
    boss.x += Math.sin(boss.driftAngle) * 1.2;

    const dx = player.x - boss.x;
    const dy = player.y - boss.y;

    boss.angle = Math.atan2(dy, dx);
    boss.x += Math.cos(boss.angle) * 0.35;
    boss.y += Math.sin(boss.angle) * 0.2;

    boss.summonCooldown--;

    if (boss.summonCooldown <= 0) {
        spawnBossMinions(boss);
        boss.summonCooldown = 150;
    }
}

function updateBossMinion(minion) {
    minion.x += minion.vx;
    minion.y += minion.vy;

    const angle = Math.atan2(player.y - minion.y, player.x - minion.x);
    minion.angle = angle;

    minion.vx += Math.cos(angle) * 0.035;
    minion.vy += Math.sin(angle) * 0.035;

    const maxSpeed = 1.9;
    const speed = Math.hypot(minion.vx, minion.vy);

    if (speed > maxSpeed) {
        minion.vx = (minion.vx / speed) * maxSpeed;
        minion.vy = (minion.vy / speed) * maxSpeed;
    }
}

function updateElite(enemy) {
    enemy.glow += 0.12;

    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    const acceleration = 0.06;

    enemy.vx += Math.cos(angle) * acceleration;
    enemy.vy += Math.sin(angle) * acceleration;

    const currentSpeed = Math.hypot(enemy.vx, enemy.vy);

    if (currentSpeed > enemy.maxSpeed) {
        enemy.vx = (enemy.vx / currentSpeed) * enemy.maxSpeed;
        enemy.vy = (enemy.vy / currentSpeed) * enemy.maxSpeed;
    }

    enemy.x += enemy.vx;
    enemy.y += enemy.vy;
    enemy.angle = angle;
}
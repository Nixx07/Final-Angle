import { canvas, GAME_STATES } from './config.js';
import { player, game, enemies, projectiles, damageNumbers, pickups, particles } from './state.js'; 
import { createEnemyParticles } from './particles.js';
import { startLevelUp, applyRandomFreeUpgrade } from './upgrades.js';
import { showVictoryModal } from './victory.js';

const FRAME_DURATION = 1000 / 60;

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
        speedMin: 2.0,
        speedMax: 3.0,
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
                speedMin: 2.3,
                speedMax: 3.2,
                damage: 1
            };
        } else if (roll < 0.8) {
            enemy = {
                type: 'square',
                radius: 26,
                hp: 3,
                xp: 95,
                color: '#0d47a1',
                speedMin: 2.0,
                speedMax: 3.0,
                damage: 2
            };
        } else {
            enemy = {
                type: 'diamond',
                radius: 26,
                hp: 3,
                xp: 65,
                color: '#4caf50',
                speedMin: 3.2,
                speedMax: 4.0,
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
                speedMin: 2.3,
                speedMax: 3.2,
                damage: 1
            };
        } else if (roll < 0.9) {
            enemy = {
                type: 'square',
                radius: 26,
                hp: 3,
                xp: 95,
                color: '#0d47a1',
                speedMin: 2.0,
                speedMax: 3.0,
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
                speedMin: 3.2,
                speedMax: 4.0,
                damage: 1
            };
        } else if (roll < 0.65) {
            enemy = {
                type: 'triangle',
                radius: 22,
                hp: 2,
                xp: 40,
                color: '#f44336',
                speedMin: 2.3,
                speedMax: 3.2,
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
            speedMin: 2.3,
            speedMax: 3.2,
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
    game.swarmFlashTimer = 45 * FRAME_DURATION;
    game.swarmMessageTimer = 110 * FRAME_DURATION;
    game.swarmCooldown = 1100 * FRAME_DURATION;
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
    const speed = 1.2 + Math.random() * 0.8;

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
        baseSpeed: (baseEnemy.speedMin || 1.2) + 1.2,
        maxSpeed: 4.0
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
        summonCooldown: 120 * FRAME_DURATION
    };
}

function createBossMinion(x, y) {
    const angleToPlayer = Math.atan2(player.y - y, player.x - x);
    const startSpeed = 2.2;

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
        isLevel20Boss: true,
        x: canvas.width / 2,
        y: -120,
        hp: 3000,
        maxHp: 3000,
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
    game.dashHintTimer = 240 * FRAME_DURATION;
    game.bossIntroStart = performance.now();
    game.screenShake = 24;
}

// CORREÇÃO: Alterado de 4 segundos para 2 segundos conforme seu pedido (2000ms)
function triggerFinalBossVictory() {
    if (game.state === GAME_STATES.VICTORY) return;

    game.boss2Active = false;
    game.bossSpawned = false;
    game.bossDefeated = true;
    game.state = GAME_STATES.VICTORY;
    game.isShooting = false;
    game.isDashing = false;
    game.dashHintTimer = 0;
    game.dashCooldown = 0;
    projectiles.length = 0;
    particles.length = 0;
    pickups.length = 0;
    damageNumbers.length = 0;
    enemies.length = 0;
    game.screenShake = 35;
    player.hp = player.maxHp;
}

function updateVoidWeaver(boss, delta) {
    const timeScale = delta / FRAME_DURATION;
    const previousAttackTimer = boss.attackTimer;
    boss.attackTimer += delta;

    boss.orbitPhase += 0.04 * timeScale;
    boss.driftAngle += 0.01 * timeScale;
    boss.pulse = (boss.pulse || 0) + 0.05 * timeScale;

    if (boss.phase === 'entering') {
        boss.y += 3 * timeScale;

        if (boss.y >= 160) {
            boss.y = 160;
            boss.phase = 'attack1';
            boss.attackTimer = 0;
        }

        return;
    }

    boss.x += Math.sin(boss.driftAngle) * 2.2 * timeScale;
    boss.y += Math.sin(boss.driftAngle * 0.8) * 1.1 * timeScale;

    if (boss.phase === 'attack1') {
        const ringTime = 90 * FRAME_DURATION;
        const burstTime = 180 * FRAME_DURATION;

        if (previousAttackTimer < ringTime && boss.attackTimer >= ringTime) {
            spawnBulletRing(boss.x, boss.y, 6, 3, '#18ffff');
        }

        if (previousAttackTimer < burstTime && boss.attackTimer >= burstTime) {
            spawnVoidBurst(boss);
        }

        if (boss.attackTimer > 300 * FRAME_DURATION) {
            boss.phase = 'attack2';
            boss.attackTimer = 0;
        }

        boss.x = Math.max(boss.radius + 20, Math.min(canvas.width - boss.radius - 20, boss.x));
        boss.y = Math.max(80, Math.min(canvas.height - boss.radius - 100, boss.y));
        return;
    }

    if (boss.phase === 'attack2') {
        if (previousAttackTimer <= 0 && boss.attackTimer > 0) {
            boss.targetAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        }

        if (boss.attackTimer < 35 * FRAME_DURATION) {
            boss.x += Math.cos(boss.targetAngle) * 4 * timeScale;
            boss.y += Math.sin(boss.targetAngle) * 3 * timeScale;
        } else {
            const volleyStart = 35 * FRAME_DURATION;
            const volleyInterval = 30 * FRAME_DURATION;
            const previousIndex = Math.floor(Math.max(0, previousAttackTimer - volleyStart) / volleyInterval);
            const currentIndex = Math.floor(Math.max(0, boss.attackTimer - volleyStart) / volleyInterval);

            if (currentIndex > previousIndex) {
                spawnTargetedVolley(boss, 6, 5.5);
            }
        }

        if (boss.attackTimer > 100 * FRAME_DURATION) {
            boss.phase = 'attack1';
            boss.attackTimer = 0;
        }
    }

    boss.x = Math.max(boss.radius + 10, Math.min(canvas.width - boss.radius - 10, boss.x));
    boss.y = Math.max(boss.radius + 20, Math.min(canvas.height - boss.radius - 100, boss.y));
}

function spawnVoidBurst(boss) {
    const ringCount = 6;

    for (let i = 0; i < ringCount; i++) {
        const angle = (Math.PI * 2 / ringCount) * i + boss.orbitPhase;

        projectiles.push({
            x: boss.x + Math.cos(angle) * 40,
            y: boss.y + Math.sin(angle) * 40,
            vx: Math.cos(angle) * 5.4,
            vy: Math.sin(angle) * 5.4,
            enemyBullet: true,
            damage: 2,
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
            damage: 2,
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
        game.swarmCooldown = Math.max(0, game.swarmCooldown - 600);
    }

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

    if (player.level >= 10 && !game.bossSpawned && !game.bossDefeated) {
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

export function updatePickups(delta) {
    const timeScale = delta / FRAME_DURATION;

    for (let i = pickups.length - 1; i >= 0; i--) {
        const pickup = pickups[i];

        pickup.pulse += 0.05 * timeScale;
        pickup.life = Math.max(0, pickup.life - delta);

        const dx = player.x - pickup.x;
        const dy = player.y - pickup.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 0) {
            const speed = pickup.speed || 3;
            pickup.x += (dx / distance) * speed * timeScale;
            pickup.y += (dy / distance) * speed * timeScale;
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
        player.invincibleTimer = 120 * FRAME_DURATION;
        return;
    }

    player.hp -= amount;
    player.invincibleTimer = 120 * FRAME_DURATION;
    game.screenShake = 20;

    if (player.hp <= 0) {
        game.state = GAME_STATES.GAME_OVER;
    }
}

// =========================
// Atualização dos inimigos
// =========================

export function updateEnemies(delta) {
    updatePickups(delta);

    const timeScale = delta / FRAME_DURATION;

    if (game.swarmFlashTimer > 0) {
        game.swarmFlashTimer = Math.max(0, game.swarmFlashTimer - delta);
    }
    if (game.swarmMessageTimer > 0) {
        game.swarmMessageTimer = Math.max(0, game.swarmMessageTimer - delta);
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (enemy.hitFlash > 0) {
            enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
        }

        if (enemy.type === 'voidWeaver') {
            updateVoidWeaver(enemy, delta);
        } else if (enemy.type === 'boss') {
            updateBoss(enemy, delta);
        } else if (enemy.type === 'octagon') {
            updateBossMinion(enemy, delta);
        } else if (enemy.elite) {
            updateElite(enemy, delta);
        } else {
            enemy.x += enemy.vx * timeScale;
            enemy.y += enemy.vy * timeScale;
            enemy.angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        }

        const collisionDistance =
            enemy.type === 'boss' || enemy.type === 'voidWeaver'
                ? enemy.radius + 20
                : enemy.radius + 15;

        const touchingPlayer =
            Math.hypot(enemy.x - player.x, enemy.y - player.y) < collisionDistance;

        if (touchingPlayer) {
            if (game.isDashing) {
                if (enemy.type !== 'boss' && enemy.type !== 'voidWeaver') {
                    enemy.hp -= 10;
                    enemy.hitFlash = 100;
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
                    enemy.hitFlash = 100;
                    game.screenShake = Math.max(game.screenShake, enemy.elite ? 5 : 3);
                }

                if (isBossEnemy) {
                    if (enemy.lastDamageNumber && enemy.lastDamageNumber.life > 0) {
                        enemy.lastDamageNumber.val += damageValue;
                        enemy.lastDamageNumber.alpha = 1;
                        enemy.lastDamageNumber.life = 25 * FRAME_DURATION;
                        enemy.lastDamageNumber.x = enemy.x;
                        enemy.lastDamageNumber.y = enemy.y;
                    } else {
                        const damageNumber = {
                            x: enemy.x,
                            y: enemy.y,
                            val: damageValue,
                            alpha: 1,
                            life: 25 * FRAME_DURATION
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
                        life: enemy.elite ? 50 * FRAME_DURATION : 40 * FRAME_DURATION
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
                    createEnemyParticles(enemy);

                    if (enemy.type === 'boss' || (enemy.type === 'voidWeaver' && !enemy.isLevel20Boss)) {
                        game.bossSpawned = false;
                        game.bossDefeated = true;
                        applyRandomFreeUpgrade();
                        applyRandomFreeUpgrade();
                        startLevelUp();
                        player.hp = player.maxHp;
                    } else if (enemy.type === 'voidWeaver' && enemy.isLevel20Boss) {
                        // CORREÇÃO: Limpa o jogo para evitar bugs de física com o jogo parado
                        enemies.length = 0;
                        projectiles.length = 0;
                        
                        game.state = GAME_STATES.VICTORY;
                        game.bossDefeated = true;
                        
                        // Mostra a tela de vitória do HTML
                        showVictoryModal();
                        return;
                    }

                    // Resto do código de ganho de XP e remoção do inimigo convencional
                    player.currentXp += enemy.xp || 0;

                    if (enemy.elite) {
                        dropEliteReward(enemy);
                    }

                    enemies.splice(i, 1);

                    if (player.currentXp >= player.nextLevelXp && game.state !== GAME_STATES.VICTORY) {
                        startLevelUp();
                    }

                    break;
                }
            }
        }
    }

    const finalBossAlive = enemies.some((enemy) => enemy.type === 'voidWeaver');
    if (!finalBossAlive && game.boss2Active && game.state !== GAME_STATES.VICTORY) {
        triggerFinalBossVictory();
    }
} // CORREÇÃO: Chave fechada corretamente aqui!

// =========================
// Comportamentos específicos
// =========================

function updateBoss(boss, delta) {
    const timeScale = delta / FRAME_DURATION;

    if (boss.phase === 'entering') {
        boss.y += 1.5 * timeScale;

        if (boss.y >= boss.targetY) {
            boss.y = boss.targetY;
            boss.phase = 'active';
        }

        return;
    }

    boss.pulse += 0.05 * timeScale;
    boss.driftAngle += 0.01 * timeScale;
    boss.x += Math.sin(boss.driftAngle) * 1.2 * timeScale;

    const dx = player.x - boss.x;
    const dy = player.y - boss.y;

    boss.angle = Math.atan2(dy, dx);
    boss.x += Math.cos(boss.angle) * 0.35 * timeScale;
    boss.y += Math.sin(boss.angle) * 0.2 * timeScale;

    boss.summonCooldown = Math.max(0, boss.summonCooldown - delta);

    if (boss.summonCooldown <= 0) {
        spawnBossMinions(boss);
        boss.summonCooldown = 150 * FRAME_DURATION;
    }
}

function updateBossMinion(minion, delta) {
    const timeScale = delta / FRAME_DURATION;

    minion.x += minion.vx * timeScale;
    minion.y += minion.vy * timeScale;

    const angle = Math.atan2(player.y - minion.y, player.x - minion.x);
    minion.angle = angle;

    minion.vx += Math.cos(angle) * 0.035 * timeScale;
    minion.vy += Math.sin(angle) * 0.035 * timeScale;

    const maxSpeed = 2.4;
    const speed = Math.hypot(minion.vx, minion.vy);

    if (speed > maxSpeed) {
        minion.vx = (minion.vx / speed) * maxSpeed;
        minion.vy = (minion.vy / speed) * maxSpeed;
    }
}

function updateElite(enemy, delta) {
    const timeScale = delta / FRAME_DURATION;

    enemy.glow += 0.12 * timeScale;

    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    const acceleration = 0.06;

    enemy.vx += Math.cos(angle) * acceleration * timeScale;
    enemy.vy += Math.sin(angle) * acceleration * timeScale;

    const currentSpeed = Math.hypot(enemy.vx, enemy.vy);

    if (currentSpeed > enemy.maxSpeed) {
        enemy.vx = (enemy.vx / currentSpeed) * enemy.maxSpeed;
        enemy.vy = (enemy.vy / currentSpeed) * enemy.maxSpeed;
    }

    enemy.x += enemy.vx * timeScale;
    enemy.y += enemy.vy * timeScale;
    enemy.angle = angle;
}

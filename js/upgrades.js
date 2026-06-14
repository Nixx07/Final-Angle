import { powerUps, GAME_STATES, canvas } from './config.js';
import { player, game, enemies, projectiles, pickups, particles, damageNumbers } from './state.js';

function getRandomWeightedUpgrade(pool) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    if (totalWeight <= 0) return 0;

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

function getAvailableUpgrades() {
    return powerUps.filter(upg => {
        if (upg.condition) return upg.condition(player, game);
        return true;
    });
}

function applyUpgradeEffect(upgradeId) {
    if (player.stats[upgradeId] !== undefined) {
        player.stats[upgradeId]++;
    }

    if (upgradeId === 'hp') {
        player.maxHp++;
        player.hp++;
    }

    if (upgradeId === 'heal') {
        player.hp = Math.min(player.hp + 1, player.maxHp);
    }

    if (upgradeId === 'fireRate') {
        game.fireRate = Math.max(100, game.fireRate - 80);
    }

    if (upgradeId === 'speed') {
        game.projectileSpeed += 2;
    }

    if (upgradeId === 'damage') {
        player.damage += 1;
    }

    if (upgradeId === 'shield') {
        player.shield = 2;
    }

    if (upgradeId === 'piercing') {
        player.pierceCount++;
    }

    if (upgradeId === 'doubleShot') {
        player.hasDoubleShot = true;
    }

    if (upgradeId === 'spreadShot') {
        player.hasSpreadShot = true;
    }
}

function openUpgradeMenu() {
    const availableUpgrades = getAvailableUpgrades();
    if (availableUpgrades.length === 0) {
        game.currentUpgradeOptions = [];
        game.state = GAME_STATES.PLAYING;
        return;
    }

    game.state = GAME_STATES.LEVELING;
    game.isShooting = false;
    game.currentUpgradeOptions = [];

    const optionsCount = Math.min(3, availableUpgrades.length);

    for (let i = 0; i < optionsCount; i++) {
        if (availableUpgrades.length === 0) break;
        const selectedIndex = getRandomWeightedUpgrade(availableUpgrades);
        game.currentUpgradeOptions.push(availableUpgrades[selectedIndex]);
        availableUpgrades.splice(selectedIndex, 1);
    }
}

export function getUpgradeMenuLayout(optionCount = 3) {
    const useStackLayout = canvas.width < 900 && canvas.height > canvas.width;
    const spacing = useStackLayout ? 14 : 30;

    if (!useStackLayout) {
        const cardWidth = 220;
        const cardHeight = 300;
        const totalWidth = (cardWidth * optionCount) + (spacing * Math.max(0, optionCount - 1));
        const startX = (canvas.width - totalWidth) / 2;
        const startY = (canvas.height - cardHeight) / 2;

        return {
            cardWidth,
            cardHeight,
            spacing,
            startX,
            startY,
            useStackLayout,
            cards: Array.from({ length: optionCount }, (_, index) => ({
                x: startX + index * (cardWidth + spacing),
                y: startY
            }))
        };
    }

    const availableWidth = canvas.width - 32;
    const availableHeight = canvas.height - 140;
    const cardWidth = Math.min(320, availableWidth);
    const cardHeight = Math.min(170, Math.max(120, Math.floor((availableHeight - spacing * (optionCount - 1)) / optionCount)));
    const totalHeight = (cardHeight * optionCount) + (spacing * Math.max(0, optionCount - 1));
    const startX = (canvas.width - cardWidth) / 2;
    const startY = Math.max(70, (canvas.height - totalHeight) / 2);

    return {
        cardWidth,
        cardHeight,
        spacing,
        startX,
        startY,
        useStackLayout,
        cards: Array.from({ length: optionCount }, (_, index) => ({
            x: startX,
            y: startY + index * (cardHeight + spacing)
        }))
    };
}

export function startLevelUp() {
    let levelsGained = 0;
    while (player.currentXp >= player.nextLevelXp) {
        player.currentXp -= player.nextLevelXp;
        player.level++;
        player.nextLevelXp = Math.floor(player.nextLevelXp * 1.16) + 40;
        levelsGained++;
    }

    if (!levelsGained && game.state !== GAME_STATES.LEVELING) return;

    game.pendingLevelUps += levelsGained;

    if (game.pendingLevelUps <= 0) {
        game.state = GAME_STATES.PLAYING;
        return;
    }

    openUpgradeMenu();
}

export function applyUpgrade(upgradeId) {
    applyUpgradeEffect(upgradeId);
    game.pendingLevelUps = Math.max(0, game.pendingLevelUps - 1);
    game.currentUpgradeOptions = [];

    if (game.pendingLevelUps > 0) {
        openUpgradeMenu();
    } else {
        game.state = GAME_STATES.PLAYING;
    }
}

export function applyRandomFreeUpgrade() {
    const availableUpgrades = getAvailableUpgrades();
    if (availableUpgrades.length === 0) return null;

    const selectedIndex = getRandomWeightedUpgrade(availableUpgrades);
    const selected = availableUpgrades[selectedIndex];

    applyUpgradeEffect(selected.id);
    return selected;
}

export function forceLevelUpForTest() {
    if (game.state === GAME_STATES.GAME_OVER) return;
    if (game.state === GAME_STATES.BOSS_ENTERING) return;
    if (game.state === GAME_STATES.LEVELING) return;

    player.currentXp = player.nextLevelXp;
    startLevelUp();
}

export function prepareBossLevel20Test() {
    if (game.state === GAME_STATES.GAME_OVER) return;
    if (game.state === GAME_STATES.BOSS_ENTERING) return;
    if (game.state === GAME_STATES.LEVELING) return;

    enemies.length = 0;
    projectiles.length = 0;
    pickups.length = 0;
    particles.length = 0;
    damageNumbers.length = 0;

    player.level = 20;
    player.currentXp = 0;
    player.nextLevelXp = 999999;

    player.stats.hp = Math.max(player.stats.hp, 2);
    player.maxHp = Math.max(player.maxHp, 5);
    player.hp = player.maxHp;

    player.stats.damage = 10;
    player.damage = 10;

    player.stats.fireRate = 3;
    game.fireRate = Math.max(100, 450 - 80 * 3);

    player.stats.speed = 5;
    game.projectileSpeed = 5 + 2 * 5;

    player.stats.shield = Math.max(player.stats.shield, 1);
    player.shield = 2;

    player.stats.spreadShot = Math.max(player.stats.spreadShot, 1);
    player.hasSpreadShot = true;
    player.hasDoubleShot = false;

    game.bossSpawned = false;
    game.bossDefeated = false;
    game.boss2Active = false;
    game.pendingLevelUps = 0;
    game.bossIntroStart = 0;
    game.swarmActive = false;
    game.swarmPendingCount = 0;
    game.swarmFlashTimer = 0;
    game.swarmMessageTimer = 0;
    game.swarmCooldown = 0;
    game.lastSwarmLevel = 0;
}

export function checkUpgradeClick(event) {
    if (game.state !== GAME_STATES.LEVELING || game.currentUpgradeOptions.length === 0) return;

    const layout = getUpgradeMenuLayout(game.currentUpgradeOptions.length);

    game.currentUpgradeOptions.forEach((option, index) => {
        const card = layout.cards[index];
        if (!card) return;

        const clickedInsideX = event.clientX > card.x && event.clientX < card.x + layout.cardWidth;
        const clickedInsideY = event.clientY > card.y && event.clientY < card.y + layout.cardHeight;

        if (clickedInsideX && clickedInsideY) {
            applyUpgrade(option.id);
        }
    });
}
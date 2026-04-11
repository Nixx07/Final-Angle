import { powerUps, GAME_STATES, canvas } from './config.js';
import { player, game } from './state.js';

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

function getAvailableUpgrades() {
    return powerUps.filter(upg => {
        if (upg.condition) return upg.condition(player);
        return true;
    });
}

function applyUpgradeEffect(upgradeId) {
    player.stats[upgradeId]++;

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

export function startLevelUp() {
    game.state = GAME_STATES.LEVELING;
    game.isShooting = false;
    game.currentUpgradeOptions = [];

    const availableUpgrades = getAvailableUpgrades();

    for (let i = 0; i < 3; i++) {
        if (availableUpgrades.length === 0) break;

        const selectedIndex = getRandomWeightedUpgrade(availableUpgrades);
        game.currentUpgradeOptions.push(availableUpgrades[selectedIndex]);
        availableUpgrades.splice(selectedIndex, 1);
    }
}

export function applyUpgrade(upgradeId) {
    applyUpgradeEffect(upgradeId);

    player.currentXp -= player.nextLevelXp;
    player.level++;
    player.nextLevelXp = Math.floor(player.nextLevelXp * 1.5);

    game.state = GAME_STATES.PLAYING;
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

export function checkUpgradeClick(event) {
    const cardWidth = 220;
    const cardHeight = 300;
    const spacing = 30;

    const totalWidth = (cardWidth * 3) + (spacing * 2);
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - cardHeight) / 2;

    game.currentUpgradeOptions.forEach((option, index) => {
        const cardX = startX + index * (cardWidth + spacing);
        const cardY = startY;

        const clickedInsideX = event.clientX > cardX && event.clientX < cardX + cardWidth;
        const clickedInsideY = event.clientY > cardY && event.clientY < cardY + cardHeight;

        if (clickedInsideX && clickedInsideY) {
            applyUpgrade(option.id);
        }
    });
}
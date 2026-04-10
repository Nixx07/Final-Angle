import { GAME_STATES } from './config.js';

export let bossSpawned = false;
export let bossIntroStart = 0;

export const player = {
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

export const game = {
    state: GAME_STATES.PLAYING,
    fireRate: 500,
    projectileSpeed: 5,
    isShooting: false,
    lastShotTime: 0,
    currentUpgradeOptions: [],

    bossSpawned: false,
    bossDefeated: false,
    bossIntroStart: 0,
    screenShake: 0
};

export const projectiles = [];
export const enemies = [];
export const particles = [];

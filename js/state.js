import { GAME_STATES } from './config.js';

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
    hasSpreadShot: false,
    pierceCount: 1,
    level: 1,
    currentXp: 0,
    nextLevelXp: 200,
    invincibleTimer: 0,
    dashTimer: 0,
    dashDirection: 0,
    dashSpeed: 0,
    stats: {
        hp: 1, heal: 0, fireRate: 1, speed: 1,
        damage: 1, shield: 0, piercing: 0,
        doubleShot: 0, spreadShot: 0
    }
};

export const game = {
    state: GAME_STATES.PLAYING,
    fireRate: 450,
    projectileSpeed: 8,
    isShooting: false,
    lastShotTime: 0,
    currentUpgradeOptions: [],
    
    // Boss
    bossSpawned: false,
    bossDefeated: false,
    bossIntroStart: 0,
    boss2Active: false,
    pendingLevelUps: 0,
    dashHintTimer: 0,
    victoryTimer: 0,
    dashCooldown: 0,
    isDashing: false,
    
    // Eventos e Efeitos
    screenShake: 0,
    swarmActive: false,
    swarmPendingCount: 0,
    swarmFlashTimer: 0,
    swarmMessageTimer: 0,
    swarmCooldown: 0,
    lastSwarmLevel: 0,
    lastEliteLevelSpawned: 0
};

export const projectiles = [];
export const enemies = [];
export const particles = [];
export const damageNumbers = [];
export const pickups = [];
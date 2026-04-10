import { canvas } from './config.js';
import { player, game, projectiles } from './state.js';
import { getBulletColor } from './player.js';

export function createBullet(angleOffset = 0) {
    const angle = player.angle + angleOffset;

    projectiles.push({
        x: player.x + Math.cos(angle) * 70,
        y: player.y + Math.sin(angle) * 70,
        vx: Math.cos(angle) * game.projectileSpeed,
        vy: Math.sin(angle) * game.projectileSpeed,
        damage: player.damage,
        color: getBulletColor()
    });
}

export function shoot(timestamp) {
    if (!game.isShooting) return;
    if (timestamp - game.lastShotTime <= game.fireRate) return;

    createBullet();

    if (player.hasDoubleShot) {
        createBullet(0.15);
    }

    game.lastShotTime = timestamp;
}

export function updateProjectiles() {
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
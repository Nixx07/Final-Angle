import { canvas } from './config.js';
import { player, game, projectiles } from './state.js';
import { damagePlayer } from './enemies.js';
import { getBulletColor } from './player.js';

/**
 * Cria um projétil com suporte a deslocamento lateral (sideOffset) 
 * para tiros paralelos (Double Shot).
 */
export function createBullet(angleOffset = 0, sideOffset = 0) {
    const angle = player.angle + angleOffset;
    
    // Calcula o deslocamento perpendicular à direção do tiro para criar tiros paralelos
    const perpX = Math.cos(angle + Math.PI / 2) * sideOffset;
    const perpY = Math.sin(angle + Math.PI / 2) * sideOffset;

    const bullet = {
        x: player.x + Math.cos(angle) * 70 + perpX,
        y: player.y + Math.sin(angle) * 70 + perpY,
        vx: Math.cos(angle) * game.projectileSpeed,
        vy: Math.sin(angle) * game.projectileSpeed,
        damage: player.damage,
        color: getBulletColor(),
        pierceCount: player.pierceCount || 1,
        enemyBullet: false,
        trail: []
    };

    projectiles.push(bullet);
}

export function shoot(timestamp) {
    if (!game.isShooting) return;
    if (timestamp - game.lastShotTime <= game.fireRate) return;

    if (player.hasSpreadShot) {
        // Tiro Triplo (Leque)
        createBullet(0);
        createBullet(-0.20);
        createBullet(0.20);
    } else if (player.hasDoubleShot) {
        // CORREÇÃO: Tiro Duplo agora é PARALELO (lado a lado), não em "V"
        // Isso permite que você acerte o inimigo que está exatamente na mira
        createBullet(0, -12); // Bala esquerda
        createBullet(0, 12);  // Bala direita
    } else {
        createBullet(0);
    }

    game.lastShotTime = timestamp;
}

export function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];

        if (!projectile.trail) projectile.trail = []; 
        projectile.trail.push({ x: projectile.x, y: projectile.y });
        
        // Mantém um rastro curto para performance e visual
        if (projectile.trail.length > 8) projectile.trail.shift();

        projectile.x += projectile.vx;
        projectile.y += projectile.vy;

        if (projectile.enemyBullet) {
            const distanceToPlayer = Math.hypot(projectile.x - player.x, projectile.y - player.y);
            const hitRadius = (projectile.radius || 6) + player.radius;

            if (distanceToPlayer < hitRadius) {
                damagePlayer(projectile.damage || 0.5);
                projectiles.splice(i, 1);
                continue;
            }
        }

        const isOutOfBounds =
            projectile.x < -100 ||
            projectile.x > canvas.width + 100 ||
            projectile.y < -100 ||
            projectile.y > canvas.height + 100;

        if (isOutOfBounds) {
            projectiles.splice(i, 1);
        }
    }
}
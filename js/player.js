import { canvas } from './config.js';
import { game, player } from './state.js';

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player.x = canvas.width / 2;
    player.y = canvas.height - 25;
}

export function updatePlayerAngle(mouseX, mouseY) {
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
}

export function updatePlayerDash() {
    if (game.dashCooldown > 0) {
        game.dashCooldown = Math.max(0, game.dashCooldown - 1);
    }

    if (player.invincibleTimer > 0) {
        player.invincibleTimer = Math.max(0, player.invincibleTimer - 1);
    }

    if (!game.isDashing || player.dashTimer <= 0) return;

    player.x += Math.cos(player.dashDirection) * player.dashSpeed;
    player.y += Math.sin(player.dashDirection) * player.dashSpeed;
    player.dashTimer--;

    if (player.dashTimer <= 0) {
        game.isDashing = false;
        player.radius = 40;
        player.dashSpeed = 0;
    }

    const margin = player.radius + 12;
    player.x = Math.max(margin, Math.min(canvas.width - margin, player.x));
    player.y = Math.max(margin, Math.min(canvas.height - margin, player.y));
}

export function getBulletColor() {
    if (player.damage === 1) return '#ffeb3b';
    if (player.damage === 2) return '#ff9800';
    if (player.damage === 3) return '#f44336';
    return '#9c27b0';
}
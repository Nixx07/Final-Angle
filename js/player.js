import { canvas } from './config.js';
import { game, player } from './state.js';

function isTouchDevice() {
    return window.matchMedia?.('(pointer: coarse)').matches;
}

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player.x = canvas.width / 2;
    player.y = canvas.height - (isTouchDevice() ? 88 : 25);
}

export function updatePlayerAngle(mouseX, mouseY) {
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
}

const FRAME_DURATION = 1000 / 60;

export function updatePlayerDash(delta) {
    if (game.dashCooldown > 0) {
        game.dashCooldown = Math.max(0, game.dashCooldown - delta);
    }

    if (player.invincibleTimer > 0) {
        player.invincibleTimer = Math.max(0, player.invincibleTimer - delta);
    }

    if (!game.isDashing || player.dashTimer <= 0) return;

    const timeScale = delta / FRAME_DURATION;
    player.x += Math.cos(player.dashDirection) * player.dashSpeed * timeScale;
    player.y += Math.sin(player.dashDirection) * player.dashSpeed * timeScale;
    player.dashTimer = Math.max(0, player.dashTimer - delta);

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
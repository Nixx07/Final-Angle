import { canvas } from './config.js';
import { player } from './state.js';

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player.x = canvas.width / 2;
    player.y = canvas.height - 25;
}

export function updatePlayerAngle(mouseX, mouseY) {
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
}

export function getBulletColor() {
    if (player.damage === 1) return '#ffeb3b';
    if (player.damage === 2) return '#ff9800';
    if (player.damage === 3) return '#f44336';
    return '#9c27b0';
}
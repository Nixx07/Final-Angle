import { resizeCanvas, updatePlayerDash } from './player.js';
import { setupInput } from './input.js';
import { spawnEnemy, updateEnemies } from './enemies.js';
import { updateProjectiles, shoot } from './projectiles.js';
import { updateParticles } from './particles.js';
import { draw } from './ui.js';
import { game } from './state.js';
import { GAME_STATES } from './config.js';

const FRAME_DURATION = 1000 / 60;
let lastTimestamp = 0;

function update(delta, timestamp) {
    if (game.state === GAME_STATES.PLAYING) {
        updatePlayerDash(delta);

        if (game.dashHintTimer > 0) {
            game.dashHintTimer = Math.max(0, game.dashHintTimer - delta);
        }

        shoot(timestamp);
        updateProjectiles(delta);
        updateEnemies(delta);
        updateParticles(delta);
        return;
    }
}

function gameLoop(timestamp) {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
    }

    const delta = Math.min(timestamp - lastTimestamp, FRAME_DURATION * 4);
    lastTimestamp = timestamp;

    update(delta, timestamp);
    if (game.state !== GAME_STATES.VICTORY) {
        draw(delta);
    }

    requestAnimationFrame(gameLoop);
}

resizeCanvas();
setupInput();
setInterval(() => {
    if (game.state === GAME_STATES.PLAYING) {
        spawnEnemy();
    }
}, 600);

requestAnimationFrame(gameLoop);
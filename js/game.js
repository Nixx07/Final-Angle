import { resizeCanvas } from './player.js';
import { setupInput } from './input.js';
import { spawnEnemy, updateEnemies } from './enemies.js';
import { updateProjectiles, shoot } from './projectiles.js';
import { updateParticles } from './particles.js';
import { draw } from './ui.js';
import { game } from './state.js';
import { GAME_STATES } from './config.js';

function update(timestamp) {
    if (game.state === GAME_STATES.GAME_OVER) return;
    if (game.state === GAME_STATES.LEVELING) return;

    if (game.state === GAME_STATES.PLAYING) {
        shoot(timestamp);
        updateProjectiles();
    }

    updateEnemies();
    updateParticles();
}

function gameLoop(timestamp) {
    update(timestamp);
    draw();
    requestAnimationFrame(gameLoop);
}

resizeCanvas();
setupInput();
setInterval(spawnEnemy, 900);
requestAnimationFrame(gameLoop);
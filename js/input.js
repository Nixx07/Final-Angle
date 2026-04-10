import { canvas, GAME_STATES } from './config.js';
import { game } from './state.js';
import { updatePlayerAngle, resizeCanvas } from './player.js';
import { checkUpgradeClick, forceLevelUpForTest } from './upgrades.js';

export function setupInput() {
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousedown', (event) => {
        if (event.button === 0) {
            if (game.state === GAME_STATES.PLAYING) {
                game.isShooting = true;
                return;
            }

            if (game.state === GAME_STATES.LEVELING) {
                checkUpgradeClick(event);
            }
        }

        if (event.button === 2) {
            forceLevelUpForTest();
        }
    });

    window.addEventListener('mouseup', (event) => {
        if (event.button === 0) {
            game.isShooting = false;
        }
    });

    window.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    canvas.addEventListener('mousemove', (event) => {
        if (game.state !== GAME_STATES.PLAYING) return;
        updatePlayerAngle(event.clientX, event.clientY);
    });
}
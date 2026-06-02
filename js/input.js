import { canvas, GAME_STATES } from './config.js';
import { game, player } from './state.js';
import { updatePlayerAngle, resizeCanvas } from './player.js';
import { checkUpgradeClick, forceLevelUpForTest, prepareBossLevel20Test } from './upgrades.js';

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

    window.addEventListener('keydown', (e) => {
        if (
            e.code === 'Space' &&
            game.dashCooldown <= 0 &&
            game.state === GAME_STATES.PLAYING &&
            game.boss2Active
        ) {
            performDash();
        }
    });

    const FRAME_DURATION = 1000 / 60;

    function performDash() {
        game.isDashing = true;
        game.dashCooldown = 45 * FRAME_DURATION;
        player.dashTimer = 14 * FRAME_DURATION;
        player.dashDirection = player.angle;
        player.dashSpeed = 28;
        player.radius = 32;
    }
}
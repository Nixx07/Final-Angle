import { canvas, GAME_STATES } from './config.js';
import { game, player } from './state.js';
import { updatePlayerAngle, resizeCanvas } from './player.js';
import { checkUpgradeClick, forceLevelUpForTest, prepareBossLevel20Test } from './upgrades.js';

export function setupInput() {
    let activePointerId = null;

    window.addEventListener('resize', resizeCanvas);

    const dashButton = document.getElementById('mobileDashButton');

    function performDash() {
        game.isDashing = true;
        game.dashCooldown = 45 * FRAME_DURATION;
        player.dashTimer = 14 * FRAME_DURATION;
        player.dashDirection = player.angle;
        player.dashSpeed = 28;
        player.radius = 32;
    }

    function isPrimaryPointer(event) {
        return event.pointerType !== 'mouse' || event.button === 0;
    }

    function stopShooting(event) {
        if (activePointerId !== null && event.pointerId !== activePointerId) return;

        if (event.pointerType !== 'mouse') {
            activePointerId = null;
        }

        game.isShooting = false;
    }

    canvas.addEventListener('pointerdown', (event) => {
        if (!isPrimaryPointer(event)) return;

        event.preventDefault();

        if (game.state === GAME_STATES.LEVELING) {
            checkUpgradeClick(event);
            return;
        }

        if (game.state !== GAME_STATES.PLAYING) return;

        game.isShooting = true;
        updatePlayerAngle(event.clientX, event.clientY);

        if (event.pointerType !== 'mouse') {
            activePointerId = event.pointerId;
            canvas.setPointerCapture?.(event.pointerId);
        }
    });

    canvas.addEventListener('pointermove', (event) => {
        if (game.state !== GAME_STATES.PLAYING) return;

        if (event.pointerType === 'mouse' || activePointerId === event.pointerId) {
            updatePlayerAngle(event.clientX, event.clientY);
        }
    });

    window.addEventListener('pointerup', stopShooting);
    window.addEventListener('pointercancel', stopShooting);
    window.addEventListener('blur', () => {
        activePointerId = null;
        game.isShooting = false;
    });

    window.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    canvas.addEventListener('mousemove', (event) => {
        if (game.state !== GAME_STATES.PLAYING) return;
        updatePlayerAngle(event.clientX, event.clientY);
    });

    if (dashButton) {
        dashButton.addEventListener('pointerdown', (event) => {
            event.preventDefault();

            if (
                game.dashCooldown <= 0 &&
                game.state === GAME_STATES.PLAYING &&
                game.boss2Active
            ) {
                performDash();
            }
        });
    }

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
}
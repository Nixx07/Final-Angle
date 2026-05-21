import { resizeCanvas } from './player.js';
import { game } from './state.js';
import { GAME_STATES } from './config.js';

export function setupMenu() {
    const menuOverlay = document.getElementById('gameMenu');
    const tutorialModal = document.getElementById('tutorialModal');
    const startButton = document.getElementById('startGameBtn');
    const tutorialButton = document.getElementById('tutorialBtn');
    const closeButton = document.getElementById('closeTutorialBtn');

    if (!menuOverlay || !tutorialModal || !startButton || !tutorialButton || !closeButton) return;

    startButton.addEventListener('click', () => {
        menuOverlay.classList.add('hidden');
        game.state = GAME_STATES.PLAYING;
        game.isShooting = false;
        resizeCanvas();
    });

    tutorialButton.addEventListener('click', () => {
        tutorialModal.classList.remove('hidden');
    });

    closeButton.addEventListener('click', () => {
        tutorialModal.classList.add('hidden');
    });

    tutorialModal.addEventListener('click', (event) => {
        if (event.target === tutorialModal) {
            tutorialModal.classList.add('hidden');
        }
    });
}

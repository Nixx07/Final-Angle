import { particles } from './state.js';

export function createEnemyParticles(enemy) {
    const totalParticles = enemy.type === 'boss' ? 24 : 8;

    for (let i = 0; i < totalParticles; i++) {
        particles.push({
            x: enemy.x,
            y: enemy.y,
            vx: (Math.random() - 0.5) * (enemy.type === 'boss' ? 8 : 5),
            vy: (Math.random() - 0.5) * (enemy.type === 'boss' ? 8 : 5),
            alpha: 1,
            color: enemy.color,
            size: enemy.type === 'boss' ? 5 : 3
        });
    }
}

export function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.alpha -= 0.02;

        if (particle.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}
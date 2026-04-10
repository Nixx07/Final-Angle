export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

export const GAME_STATES = {
    PLAYING: 'playing',
    LEVELING: 'leveling',
    BOSS_ENTERING: 'bossEntering',
    GAME_OVER: 'gameOver'
};

export const powerUps = [
    {
        id: 'hp',
        name: 'Vida Extra',
        desc: 'Aumenta +1 HP máximo',
        weight: 10
    },
    {
        id: 'fireRate',
        name: 'Cadência',
        desc: 'Atira mais rápido',
        weight: 10
    },
    {
        id: 'speed',
        name: 'Velocidade',
        desc: 'Tiros mais velozes',
        weight: 10
    },
    {
        id: 'damage',
        name: 'Dano',
        desc: 'Tiros mais fortes',
        weight: 10
    },
    {
        id: 'shield',
        name: 'Escudo',
        desc: 'Protege contra 2 hits',
        weight: 8
    },
    {
        id: 'doubleShot',
        name: 'Tiro Duplo',
        desc: 'Dispara 2 projéteis',
        weight: 2
    }
];
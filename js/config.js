export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

export const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    LEVELING: 'leveling',
    BOSS_ENTERING: 'bossEntering',
    GAME_OVER: 'gameOver',
    VICTORY: 'victory'
};

export const powerUps = [
    {
        id: 'hp',
        name: 'Vida Máxima',
        desc: 'Aumenta +1 HP máximo',
        weight: 10,
        condition: () => true
    },
    {
        id: 'heal',
        name: 'Cura',
        desc: 'Restaura 1 de HP',
        weight: 15,
        condition: (player) => player.hp < player.maxHp 
    },
    {
        id: 'fireRate',
        name: 'Cadência',
        desc: 'Atira mais rápido',
        weight: 10,
        condition: (player, game) => game.fireRate > 180
    },
    {
        id: 'speed',
        name: 'Velocidade',
        desc: 'Tiros mais velozes',
        weight: 10,
        condition: () => true
    },
    {
        id: 'damage',
        name: 'Dano',
        desc: 'Tiros mais fortes',
        weight: 10,
        condition: (player) => player.damage < 10
    },
    {
        id: 'shield',
        name: 'Escudo',
        desc: 'Protege contra 2 hits',
        weight: 8,
        condition: (player) => player.shield === 0 
    },
    {
        id: 'piercing',
        name: 'Perfurante',
        desc: 'Atravessa +1 inimigo',
        weight: 6,
        condition: () => true
    },
    {
        id: 'doubleShot',
        name: 'Tiro Duplo',
        desc: 'Dispara 2 projéteis',
        weight: 5,
        condition: (player) => !player.hasDoubleShot && !player.hasSpreadShot
    },
    {
        id: 'spreadShot',
        name: 'Tiro Espalhado',
        desc: 'Dispara em arco',
        weight: 4,
        condition: (player) => !player.hasSpreadShot && player.hasDoubleShot
    }
];
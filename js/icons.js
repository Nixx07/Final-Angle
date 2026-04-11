function svgToDataUrl(svg) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createIcon(svg) {
    const image = new Image();
    image.src = svgToDataUrl(svg);
    return image;
}

export const upgradeIcons = {
    hp: createIcon(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <path fill="#ff4d6d" d="M32 56C30 54 10 39 10 23c0-7 5-11 11-11 5 0 8 3 11 7 3-4 6-7 11-7 6 0 11 4 11 11 0 16-20 31-22 33z"/>
            <path fill="#ff8fa3" d="M32 52C29 49 14 37 14 24c0-5 3-8 7-8 4 0 7 2 11 8 4-6 7-8 11-8 4 0 7 3 7 8 0 13-15 25-18 28z"/>
        </svg>
    `),

    fireRate: createIcon(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <path fill="#ffd60a" d="M36 4 14 34h14l-4 26 26-34H36z"/>
            <path fill="#fff3b0" d="M34 10 20 30h10l-3 17 17-23H34z"/>
        </svg>
    `),

    speed: createIcon(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <path fill="#4cc9f0" d="M10 32 34 14v10h20v16H34v10z"/>
            <path fill="#bdefff" d="M18 32 30 23v6h16v6H30v6z"/>
        </svg>
    `),

    damage: createIcon(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <path fill="#ff6b35" d="M32 6 39 21l17 2-13 11 4 18-15-9-15 9 4-18L8 23l17-2z"/>
            <circle cx="32" cy="32" r="7" fill="#ffd166"/>
        </svg>
    `),

    shield: createIcon(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <path fill="#00b4d8" d="M32 6 50 13v15c0 14-8 24-18 30C22 52 14 42 14 28V13z"/>
            <path fill="#90e0ef" d="M32 12 45 17v11c0 10-5 18-13 23-8-5-13-13-13-23V17z"/>
            <path fill="#caf0f8" d="M32 20 36 28h8l-6 5 2 8-8-5-8 5 2-8-6-5h8z"/>
        </svg>
    `),

    doubleShot: createIcon(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <rect x="14" y="10" width="10" height="36" rx="4" fill="#adb5bd"/>
            <rect x="40" y="10" width="10" height="36" rx="4" fill="#adb5bd"/>
            <path d="M19 46v10" stroke="#f8f9fa" stroke-width="4" stroke-linecap="round"/>
            <path d="M45 46v10" stroke="#f8f9fa" stroke-width="4" stroke-linecap="round"/>
            <circle cx="19" cy="18" r="4" fill="#ffb703"/>
            <circle cx="45" cy="18" r="4" fill="#ffb703"/>
        </svg>
    `),
    heal: createIcon(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <path fill="#2a9d8f" d="M32 4 L48 20 V44 L32 60 L16 44 V20 Z"/>
            <rect x="28" y="20" width="8" height="24" fill="#e9c46a"/>
            <rect x="20" y="28" width="24" height="8" fill="#e9c46a"/>
        </svg>
    `),

    piercing: createIcon(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <path fill="#e76f51" d="M10 32 L54 32" stroke="#e76f51" stroke-width="6" stroke-linecap="round"/>
            <polygon points="44,22 60,32 44,42" fill="#e76f51"/>
            <circle cx="24" cy="32" r="14" fill="none" stroke="#f4a261" stroke-width="4" stroke-dasharray="6,4"/>
        </svg>
    `),

    spreadShot: createIcon(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <path d="M16 48 L48 16" stroke="#48cae4" stroke-width="6" stroke-linecap="round"/>
            <path d="M32 54 L32 10" stroke="#0077b6" stroke-width="6" stroke-linecap="round"/>
            <path d="M48 48 L16 16" stroke="#48cae4" stroke-width="6" stroke-linecap="round"/>
            <circle cx="48" cy="16" r="6" fill="#caf0f8"/>
            <circle cx="32" cy="10" r="6" fill="#caf0f8"/>
            <circle cx="16" cy="16" r="6" fill="#caf0f8"/>
        </svg>
    `)
};
export function showVictoryModal() {
    const victoryModal = document.getElementById('victoryModal');
    const backToMenuBtn = document.getElementById('backToMenuBtn');

    if (!victoryModal) {
        console.error("Erro: O elemento 'victoryModal' não foi encontrado no HTML.");
        return;
    }

    victoryModal.classList.remove('hidden');

    if (backToMenuBtn) {
        backToMenuBtn.onclick = () => {
            window.location.href = 'menu.html';
        };
    }
}
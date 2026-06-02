const modal = document.getElementById('modalTutorial');
const btnFechar = document.getElementById('fecharTutorial');
const btnAbrir = document.getElementById('tutorial');

function abrirModal() {
    modal.classList.add('mostrar');
}

function fecharModal() {
    modal.classList.remove('mostrar');
}

btnAbrir.addEventListener('click', abrirModal);
btnFechar.addEventListener('click', fecharModal);
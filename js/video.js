const btnPlay = document.getElementById('PlayVideo');
const btnTrailer = document.getElementById('btnAbrirVideo');
const botaoFecharVideo = document.getElementById('btnFecharVideo');
const videoModal = document.getElementById('videoModal');
const meuVideo = document.getElementById('meuVideo');

function abrirVideo() {
    videoModal.classList.remove('oculto');
    if (meuVideo) {
        meuVideo.play();
    }
}

function fecharVideo() {
    videoModal.classList.add('oculto');
    if (meuVideo) {
        meuVideo.pause();
        meuVideo.currentTime = 0;
    }
}

if (btnPlay) {
    btnPlay.addEventListener('click', abrirVideo);
}

if (btnTrailer) {
    btnTrailer.addEventListener('click', abrirVideo);
}

if (botaoFecharVideo) {
    botaoFecharVideo.addEventListener('click', fecharVideo);
}

if (videoModal) {
    videoModal.addEventListener('click', (event) => {
        if (event.target === videoModal) {
            fecharVideo();
        }
    });
}
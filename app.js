// Registrar o Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker registrado com sucesso!'))
    .catch(err => console.error('Erro ao registrar Service Worker:', err));
}

// Instalação do PWA
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';

  installBtn.addEventListener('click', () => {
    installBtn.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou instalar o PWA');
      } else {
        console.log('Usuário recusou instalar o PWA');
      }
      deferredPrompt = null;
    });
  });
});

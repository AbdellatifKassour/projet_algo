document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password-input');
  const unlockBtn = document.getElementById('unlock-btn');
  const errorMessage = document.getElementById('error-message');

  // Le mot de passe correct
  const correctPassword = "MSI20252026"; 

  // Si l'utilisateur est déjà déverrouillé, l'envoyer directement à l'accueil
  if (sessionStorage.getItem('isUnlocked') === 'true') {
    window.location.href = 'home.html';
  }

  unlockBtn.addEventListener('click', checkPassword);
  passwordInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      checkPassword();
    }
  });

  function checkPassword() {
    if (passwordInput.value === correctPassword) {
      // Clé correcte ! On sauvegarde dans la session.
      sessionStorage.setItem('isUnlocked', 'true');
      // On redirige vers la page d'accueil (la boîte est ouverte)
      window.location.href = 'home.html';
    } else {
      // Mot de passe incorrect
      errorMessage.style.display = 'block';
      passwordInput.value = '';
    }
  }
});
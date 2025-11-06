// Ce script vérifie si l'utilisateur est authentifié.
// S'il ne l'est pas, il le renvoie à la page de connexion (index.html).

if (sessionStorage.getItem('isUnlocked') !== 'true') {
  // Pas de clé ! Retour à la porte.
  window.location.href = 'index.html';
}
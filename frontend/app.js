// Arquivo comum com configuração e checagem de autenticação
const API_URL = "http://localhost:3000/api";

document.addEventListener('DOMContentLoaded', () => {
  const usuarioLogado = localStorage.getItem('usuarioLogado');
  if (!usuarioLogado) {
    // permite acesso à página de login e à index (navegação)
    if (!window.location.pathname.includes('login.html') && !window.location.pathname.endsWith('index.html')) {
      window.location.href = 'login.html';
    }
    return;
  }
  document.body.style.display = 'block';
});

function deslogar() {
  if (confirm('Deseja realmente sair do sistema?')) {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
  }
}

// Credenciais de exemplo (em produção, use backend para validação)
    const USUARIOS_VALIDOS = {
      'admin': 'admin123',
      'biblioteca': 'biblioteca123',
      'usuario': 'senha123'
    };

    
    window.addEventListener('DOMContentLoaded', () => {
      const usuarioLogado = localStorage.getItem('usuarioLogado');
      if (usuarioLogado) {
        mostrarSistema(usuarioLogado);
      }
    });

   
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const usuario = document.getElementById('usuario').value;
      const senha = document.getElementById('senha').value;
      const errorMessage = document.getElementById('errorMessage');

     
      if (USUARIOS_VALIDOS[usuario] && USUARIOS_VALIDOS[usuario] === senha) {
       
        localStorage.setItem('usuarioLogado', usuario);
        mostrarSistema(usuario);
      } else {
        
        errorMessage.classList.add('show');
        document.getElementById('senha').value = '';
        
        setTimeout(() => {
          errorMessage.classList.remove('show');
        }, 3000);
      }
    });

  
    /* A exibição do sistema é feita pela função mostrarSistema abaixo,
       que salva o usuário no localStorage e redireciona para a página
       de navegação principal (index.html). */


    function logout() {
      if (confirm('Deseja realmente sair do sistema?')) {
        localStorage.removeItem('usuarioLogado');
        document.getElementById('sistemaContainer').classList.remove('active');
        document.getElementById('loginContainer').style.display = 'block';
        document.getElementById('loginForm').reset();
      }
    }
    function mostrarSistema(usuario) {
  localStorage.setItem('usuarioLogado', usuario);

  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('usuarios-table')) carregarUsuarios();

  const form = document.getElementById('form-usuario');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('usuario-nome').value;
      const matricula = document.getElementById('usuario-matricula').value;
      const email = document.getElementById('usuario-email').value;
      const telefone = document.getElementById('usuario-telefone').value;
      try {
        const response = await fetch(`${API_URL}/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, matricula, email, telefone })
        });
        if (response.ok) {
          alert('Usuário criado com sucesso!');
          form.reset();
          carregarUsuarios();
        } else {
          const error = await response.json();
          alert(`Erro: ${error.erro || 'Não foi possível criar usuário'}`);
        }
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
        alert('Erro ao criar usuário');
      }
    });
  }

function formatarTelefoneBR(numero) {
  numero = numero.replace(/\D/g, ""); // remove tudo que não for número

  if (numero.length === 11) {
    // Com nono dígito (ex: 85994039818)
    return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
  } else if (numero.length === 10) {
    // Sem nono dígito
    return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
  }

  return numero; // retorna como está se não bater com padrões esperados
}

  const busca = document.getElementById('buscar-usuario');
  if (busca) {
    busca.addEventListener('keyup', buscarUsuarioTempoReal);
  }

  const limparBtn = document.getElementById('limpar-busca-usuario');
  if (limparBtn) limparBtn.addEventListener('click', limparBuscaUsuario);
});

async function carregarUsuarios() {
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    const usuarios = await response.json();
    const tbody = document.querySelector('#usuarios-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    usuarios.forEach(usuario => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${usuario.id_usuario}</td>
        <td>${usuario.nome}</td>
        <td>${usuario.matricula}</td>
        <td>${usuario.email}</td>
        <td>${usuario.telefone || '-'}</td>
        <td>
          <button class="btn-delete" onclick="deletarUsuario(${usuario.id_usuario})">Deletar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    alert('Erro ao carregar usuários');
  }
}

async function deletarUsuario(id) {
  if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
  try {
    const response = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
    if (response.ok) {
      alert('Usuário deletado com sucesso!');
      carregarUsuarios();
    }
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    alert('Erro ao deletar usuário');
  }
}

async function buscarUsuarioTempoReal() {
  const nome = document.getElementById('buscar-usuario').value.trim();
  if (!nome) return carregarUsuarios();
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    const usuarios = await response.json();
    const usuariosFiltrados = (usuarios || []).filter(u => u.nome.toLowerCase().includes(nome.toLowerCase()));
    const tbody = document.querySelector('#usuarios-table tbody');
    tbody.innerHTML = '';
    if (usuariosFiltrados.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>Nenhum usuário encontrado.</td></tr>";
      return;
    }
    usuariosFiltrados.forEach(usuario => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${usuario.id_usuario}</td>
        <td>${usuario.nome}</td>
        <td>${usuario.matricula}</td>
        <td>${usuario.email}</td>
        <td>${usuario.telefone || '-'}</td>
        <td>
          <button class="btn-delete" onclick="deletarUsuario(${usuario.id_usuario})">Deletar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    alert('Erro ao buscar usuário.');
  }
}

function limparBuscaUsuario() {
  const input = document.getElementById('buscar-usuario');
  if (input) input.value = '';
  carregarUsuarios();
}

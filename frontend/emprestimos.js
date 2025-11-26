document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('emprestimos-table')) carregarEmprestimos();

  const form = document.getElementById('form-emprestimo');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id_usuario = document.getElementById('emprestimo-usuario').value;
      const id_livro = document.getElementById('emprestimo-livro').value;
      const dias_emprestimo = document.getElementById('emprestimo-dias').value;
      try {
        const response = await fetch(`${API_URL}/emprestimos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_usuario, id_livro, dias_emprestimo })
        });
        if (response.ok) {
          alert('Empréstimo realizado com sucesso!');
          form.reset();
          carregarEmprestimos();
        } else {
          const error = await response.json();
          alert(`Erro: ${error.erro || 'Não foi possível realizar empréstimo'}`);
        }
      } catch (error) {
        console.error('Erro ao realizar empréstimo:', error);
        alert('Erro ao realizar empréstimo');
      }
    });
  }

  const buscarBtn = document.getElementById('buscar-emprestimo-btn');
  if (buscarBtn) buscarBtn.addEventListener('click', buscarEmprestimo);

  const limparBtn = document.getElementById('limpar-emprestimos');
  if (limparBtn) limparBtn.addEventListener('click', carregarEmprestimos);
});

async function carregarEmprestimos() {
  try {
    const response = await fetch(`${API_URL}/emprestimos`);
    const emprestimos = await response.json();
    const tbody = document.querySelector('#emprestimos-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    for (const emp of (emprestimos || [])) {
      let dataDevolucao = emp.data_devolucao ? emp.data_devolucao : '-';
      let multaDisplay = 'R$ 0,00';
      const idMultaFromEmp = emp.id_multa || emp.id_multa === 0 ? emp.id_multa : (emp.multa ? emp.multa : null);
      if (idMultaFromEmp) {
        try {
          const r = await fetch(`${API_URL}/multas/${idMultaFromEmp}`);
          if (r.ok) {
            const multaObj = await r.json();
            if (multaObj && (multaObj.valor !== undefined && multaObj.valor !== null)) {
              multaDisplay = `R$ ${parseFloat(multaObj.valor).toFixed(2)}`;
            }
          }
        } catch (err) {
          console.warn('Não foi possível buscar multa do empréstimo', idMultaFromEmp, err);
        }
      } else if (emp.multa !== undefined && emp.multa !== null) {
        multaDisplay = `R$ ${parseFloat(emp.multa).toFixed(2)}`;
      }

      const btnDevolver = emp.data_devolucao ? '' : `<button class="btn-devolver" onclick="devolverLivro(${emp.id_emprestimo})">Devolver</button>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${emp.id_emprestimo}</td>
        <td>${emp.usuario_nome || emp.usuario || '-'}</td>
        <td>${emp.livro_titulo || emp.titulo || '-'}</td>
        <td>${emp.data_retirada}</td>
        <td>${emp.data_prevista_devolucao}</td>
        <td>${dataDevolucao}</td>
        <td>${multaDisplay}</td>
        <td>
          ${btnDevolver}
          <button class="btn-delete" onclick="deletarEmprestimo(${emp.id_emprestimo})">Deletar</button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    carregarUsuariosSelect();
    carregarLivrosSelect();
  } catch (error) {
    console.error('Erro ao carregar empréstimos:', error);
    alert('Erro ao carregar empréstimos');
  }
}

async function carregarUsuariosSelect() {
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    const usuarios = await response.json();
    const select = document.getElementById('emprestimo-usuario');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um Usuário</option>';
    (usuarios || []).forEach(usuario => {
      const option = document.createElement('option');
      option.value = usuario.id_usuario;
      option.textContent = usuario.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar usuários para select:', error);
  }
}

async function carregarLivrosSelect() {
  try {
    const response = await fetch(`${API_URL}/livros`);
    const livros = await response.json();
    const select = document.getElementById('emprestimo-livro');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um Livro</option>';
    (livros || []).filter(l => l.disponivel).forEach(livro => {
      const option = document.createElement('option');
      option.value = livro.id_livro;
      option.textContent = livro.titulo;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar livros para select:', error);
  }
}

async function devolverLivro(id) {
  try {
    const response = await fetch(`${API_URL}/emprestimos/${id}/devolver`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
    if (response.ok) {
      const result = await response.json();
      const multaNum = result && result.multa !== undefined ? result.multa : 0;
      alert(`Livro devolvido com sucesso!\nMulta: R$ ${parseFloat(multaNum).toFixed(2)}`);
      carregarEmprestimos();
    } else {
      const err = await response.json();
      alert(`Erro ao devolver: ${err.erro || 'Erro desconhecido'}`);
    }
  } catch (error) {
    console.error('Erro ao devolver livro:', error);
    alert('Erro ao devolver livro');
  }
}

async function deletarEmprestimo(id) {
  if (!confirm('Tem certeza que deseja deletar este empréstimo?')) return;
  try {
    const response = await fetch(`${API_URL}/emprestimos/${id}`, { method: 'DELETE' });
    if (response.ok) {
      alert('Empréstimo deletado com sucesso!');
      carregarEmprestimos();
    }
  } catch (error) {
    console.error('Erro ao deletar empréstimo:', error);
    alert('Erro ao deletar empréstimo');
  }
}

async function buscarEmprestimo() {
  const nome = document.getElementById('buscar-emprestimo').value.trim();
  if (!nome) return alert('Digite um nome para buscar.');
  try {
    const response = await fetch(`${API_URL}/emprestimos`);
    const emprestimos = await response.json();
    const emprestimosFiltrados = (emprestimos || []).filter(emp => (emp.usuario_nome || emp.usuario || '').toLowerCase().includes(nome.toLowerCase()));
    const tbody = document.querySelector('#emprestimos-table tbody');
    tbody.innerHTML = '';
    if (emprestimosFiltrados.length === 0) {
      tbody.innerHTML = "<tr><td colspan='8'>Nenhum empréstimo encontrado.</td></tr>";
      return;
    }
    for (const emp of emprestimosFiltrados) {
      let dataDevolucao = emp.data_devolucao ? emp.data_devolucao : '-';
      let multaDisplay = 'R$ 0,00';
      const idMultaFromEmp = emp.id_multa || emp.id_multa === 0 ? emp.id_multa : (emp.multa ? emp.multa : null);
      if (idMultaFromEmp) {
        try {
          const r = await fetch(`${API_URL}/multas/${idMultaFromEmp}`);
          if (r.ok) {
            const multaObj = await r.json();
            if (multaObj && (multaObj.valor !== undefined && multaObj.valor !== null)) {
              multaDisplay = `R$ ${parseFloat(multaObj.valor).toFixed(2)}`;
            }
          }
        } catch (err) {
          console.warn('Não foi possível buscar multa do empréstimo', idMultaFromEmp, err);
        }
      } else if (emp.multa !== undefined && emp.multa !== null) {
        multaDisplay = `R$ ${parseFloat(emp.multa).toFixed(2)}`;
      }

      const btnDevolver = emp.data_devolucao ? '' : `<button class="btn-devolver" onclick="devolverLivro(${emp.id_emprestimo})">Devolver</button>`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${emp.id_emprestimo}</td>
        <td>${emp.usuario_nome || emp.usuario || '-'}</td>
        <td>${emp.livro_titulo || emp.titulo || '-'}</td>
        <td>${emp.data_retirada}</td>
        <td>${emp.data_prevista_devolucao}</td>
        <td>${dataDevolucao}</td>
        <td>${multaDisplay}</td>
        <td>
          ${btnDevolver}
          <button class="btn-delete" onclick="deletarEmprestimo(${emp.id_emprestimo})">Deletar</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  } catch (error) {
    console.error('Erro ao buscar empréstimo:', error);
    alert('Erro ao buscar empréstimo.');
  }
}

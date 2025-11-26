document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('livros-table')) carregarLivros();

  const form = document.getElementById('form-livro');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titulo = document.getElementById('livro-titulo').value;
      const autor = document.getElementById('livro-autor').value;
      const ano_publicacao = document.getElementById('livro-ano').value;
      const categoria = document.getElementById('livro-categoria').value;
      try {
        const response = await fetch(`${API_URL}/livros`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, autor, ano_publicacao, categoria })
        });
        if (response.ok) {
          alert('Livro criado com sucesso!');
          form.reset();
          carregarLivros();
        } else {
          const error = await response.json();
          alert(`Erro: ${error.erro || 'Não foi possível criar livro'}`);
        }
      } catch (error) {
        console.error('Erro ao criar livro:', error);
        alert('Erro ao criar livro');
      }
    });
  }

  const busca = document.getElementById('buscar-livro');
  if (busca) busca.addEventListener('keyup', buscarLivroTempoReal);

  const limparBtn = document.getElementById('limpar-busca-livro');
  if (limparBtn) limparBtn.addEventListener('click', limparBuscaLivro);
});

async function carregarLivros() {
  try {
    const response = await fetch(`${API_URL}/livros`);
    const livros = await response.json();
    const tbody = document.querySelector('#livros-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    livros.forEach(livro => {
      const disponivel = livro.disponivel ? '<span class="badge badge-disponivel">Disponível</span>' : '<span class="badge badge-indisponivel">Indisponível</span>';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${livro.id_livro}</td>
        <td>${livro.titulo}</td>
        <td>${livro.autor}</td>
        <td>${livro.ano_publicacao || '-'}</td>
        <td>${livro.categoria || '-'}</td>
        <td>${disponivel}</td>
        <td>
          <button class="btn-delete" onclick="deletarLivro(${livro.id_livro})">Deletar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar livros:', error);
    alert('Erro ao carregar livros');
  }
}

async function deletarLivro(id) {
  if (!confirm('Tem certeza que deseja deletar este livro?')) return;
  try {
    const response = await fetch(`${API_URL}/livros/${id}`, { method: 'DELETE' });
    if (response.ok) {
      alert('Livro deletado com sucesso!');
      carregarLivros();
    }
  } catch (error) {
    console.error('Erro ao deletar livro:', error);
    alert('Erro ao deletar livro');
  }
}

async function buscarLivroTempoReal() {
  const titulo = document.getElementById('buscar-livro').value.trim();
  if (!titulo) return carregarLivros();
  try {
    const response = await fetch(`${API_URL}/livros`);
    const livros = await response.json();
    const livrosFiltrados = (livros || []).filter(l => (l.titulo || '').toLowerCase().includes(titulo.toLowerCase()));
    const tbody = document.querySelector('#livros-table tbody');
    tbody.innerHTML = '';
    if (livrosFiltrados.length === 0) {
      tbody.innerHTML = "<tr><td colspan='7'>Nenhum livro encontrado.</td></tr>";
      return;
    }
    livrosFiltrados.forEach(livro => {
      const disponivel = livro.disponivel ? '<span class="badge badge-disponivel">Disponível</span>' : '<span class="badge badge-indisponivel">Indisponível</span>';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${livro.id_livro}</td>
        <td>${livro.titulo}</td>
        <td>${livro.autor}</td>
        <td>${livro.ano_publicacao || '-'}</td>
        <td>${livro.categoria || '-'}</td>
        <td>${disponivel}</td>
        <td>
          <button class="btn-delete" onclick="deletarLivro(${livro.id_livro})">Deletar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao buscar livro:', error);
    alert('Erro ao buscar livro.');
  }
}

function limparBuscaLivro() {
  const input = document.getElementById('buscar-livro');
  if (input) input.value = '';
  carregarLivros();
}

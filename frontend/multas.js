let multaSelecionada = null;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('multas-table')) carregarMultas();

  const form = document.getElementById('form-multa');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('multa-id').value;
      const id_emprestimo = document.getElementById('multa-emprestimo-id').value;
      const valor = document.getElementById('multa-valor').value;
      const pago = document.getElementById('multa-pago').checked;

      const url = id ? `${API_URL}/multas/${id}` : `${API_URL}/multas`;
      const method = id ? 'PUT' : 'POST';
      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_emprestimo, valor, pago })
        });
        if (response.ok) {
          alert(`Multa ${id ? 'atualizada' : 'cadastrada'} com sucesso!`);
          form.reset();
          document.getElementById('multa-id').value = '';
          carregarMultas();
        } else {
          const error = await response.json();
          alert(`Erro: ${error.erro || 'Não foi possível salvar a multa.'}`);
        }
      } catch (error) {
        console.error('Erro ao salvar multa:', error);
        alert('Ocorreu um erro na comunicação com o servidor.');
      }
    });
  }

  const limparBtn = document.getElementById('btn-limpar-form-multa');
  if (limparBtn) limparBtn.addEventListener('click', () => { document.getElementById('form-multa').reset(); document.getElementById('multa-id').value = ''; });

  const busca = document.getElementById('buscar-multa');
  if (busca) busca.addEventListener('keyup', buscarMultaTempoReal);

  const limparBusca = document.getElementById('limpar-busca-multa');
  if (limparBusca) limparBusca.addEventListener('click', limparBuscaMulta);

  const modalConfirm = document.getElementById('confirmar-pagamento');
  const modalClose = document.getElementById('fechar-pagamento');
  if (modalConfirm) modalConfirm.addEventListener('click', confirmarPagamento);
  if (modalClose) modalClose.addEventListener('click', fecharModalPagamento);
});

async function editarMulta(id) {
  try {
    const response = await fetch(`${API_URL}/multas/${id}`);
    if (!response.ok) throw new Error('Multa não encontrada');
    const multa = await response.json();
    document.getElementById('multa-id').value = multa.id !== undefined ? multa.id : (multa.id_multa || '');
    document.getElementById('multa-emprestimo-id').value = multa.id_emprestimo || multa.emprestimo || '';
    document.getElementById('multa-valor').value = multa.valor || '';
    document.getElementById('multa-pago').checked = Boolean(multa.pago || multa.pago === 1 || multa.pago === true);
    document.getElementById('form-multa').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Erro ao buscar dados da multa:', error);
    alert('Não foi possível carregar os dados para edição.');
  }
}

async function deletarMulta(id) {
  if (!confirm('Tem certeza que deseja deletar esta multa?')) return;
  try {
    const response = await fetch(`${API_URL}/multas/${id}`, { method: 'DELETE' });
    if (response.ok) {
      alert('Multa deletada com sucesso!');
      carregarMultas();
    } else {
      const err = await response.json();
      alert(`Erro ao deletar multa: ${err.erro || 'Erro desconhecido'}`);
    }
  } catch (error) {
    console.error('Erro ao deletar multa:', error);
    alert('Erro ao deletar multa');
  }
}

async function carregarMultas() {
  try {
    const response = await fetch(`${API_URL}/multas`);
    const multas = await response.json();
    const tbody = document.querySelector('#multas-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    (multas || []).forEach(multa => {
      const id = multa.id !== undefined ? multa.id : (multa.id_multa || multa.idMulta || '');
      const id_emprestimo = multa.id_emprestimo || multa.emprestimo || '-';
      const usuario = multa.usuario || multa.usuario_nome || '-';
      const valor = multa.valor !== undefined ? parseFloat(multa.valor).toFixed(2) : '0.00';
      const pago = multa.pago === 1 || multa.pago === true || multa.pago === 'true';
      const status = pago ? '<span class="badge badge-disponivel">Paga</span>' : '<span class="badge badge-indisponivel">Pendente</span>';
      const valorFormatado = `R$ ${valor}`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${id}</td>
        <td>${usuario}</td>
        <td>${id_emprestimo}</td>
        <td>${valorFormatado}</td>
        <td>${status}</td>
        <td class="actions">
          ${!pago ? `<button class="btn-devolver" onclick="pagarMulta(${id})">Pagar</button>` : ''}
          <button class="btn-delete" onclick="deletarMulta(${id})">Deletar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar multas:', error);
  }
}

function pagarMulta(id) {
  multaSelecionada = id;
  const modal = document.getElementById('modalPagamento');
  if (modal) modal.style.display = 'block';
}

function fecharModalPagamento() {
  multaSelecionada = null;
  const modal = document.getElementById('modalPagamento');
  if (modal) modal.style.display = 'none';
}

async function confirmarPagamento() {
  if (!multaSelecionada) return alert('Nenhuma multa selecionada.');
  const forma = document.getElementById('formaPagamento').value;
  try {
    const resposta = await fetch(`${API_URL}/multas/${multaSelecionada}/pagar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forma_pagamento: forma })
    });
    const dados = await resposta.json();
    alert(dados.mensagem || 'Pagamento realizado!');
    fecharModalPagamento();
    carregarMultas();
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    alert('Erro ao confirmar pagamento.');
  }
}

async function buscarMultaTempoReal() {
  const nome = document.getElementById('buscar-multa').value.trim();
  if (!nome) return carregarMultas();
  try {
    const response = await fetch(`${API_URL}/multas`);
    const multas = await response.json();
    const multasFiltradas = (multas || []).filter(multa => ((multa.usuario || multa.usuario_nome) || '').toLowerCase().includes(nome.toLowerCase()));
    const tbody = document.querySelector('#multas-table tbody');
    tbody.innerHTML = '';
    if (multasFiltradas.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>Nenhuma multa encontrada.</td></tr>";
      return;
    }
    multasFiltradas.forEach(multa => {
      const id = multa.id !== undefined ? multa.id : (multa.id_multa || multa.idMulta || '');
      const id_emprestimo = multa.id_emprestimo || multa.emprestimo || '-';
      const usuario = multa.usuario || multa.usuario_nome || '-';
      const valor = multa.valor !== undefined ? parseFloat(multa.valor).toFixed(2) : '0.00';
      const pago = multa.pago === 1 || multa.pago === true || multa.pago === 'true';
      const status = pago ? '<span class="badge badge-disponivel">Paga</span>' : '<span class="badge badge-indisponivel">Pendente</span>';
      const valorFormatado = `R$ ${valor}`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${id}</td>
        <td>${usuario}</td>
        <td>${id_emprestimo}</td>
        <td>${valorFormatado}</td>
        <td>${status}</td>
        <td class="actions">
          ${!pago ? `<button class="btn-devolver" onclick="pagarMulta(${id})">Pagar</button>` : ''}
          <button class="btn-delete" onclick="deletarMulta(${id})">Deletar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao buscar multa:', error);
    alert('Erro ao buscar multa.');
  }
}

function limparBuscaMulta() {
  const input = document.getElementById('buscar-multa');
  if (input) input.value = '';
  carregarMultas();
}

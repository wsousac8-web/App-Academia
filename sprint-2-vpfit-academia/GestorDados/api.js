// GestorDados/api.js
// Todas as chamadas ao backend (Express + PostgreSQL no Supabase) ficam aqui.
// Cada função devolve { ok: true, dados } ou { ok: false, erro } — nunca lança exceção,
// então as telas só precisam olhar o "ok".

export const API_URL = 'https://vpfit-backend.onrender.com';

export const PLANOS = ['Mensal', 'Semestral', 'Anual'];
export const STATUS = ['Ativo', 'Pendente', 'Inativo'];

async function chamarApi(rota, opcoes = {}) {
  try {
    const resposta = await fetch(`${API_URL}${rota}`, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json' },
    });
    // Algumas respostas de erro (ex.: página do Render enquanto o servidor acorda) não são JSON
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      return { ok: false, status: resposta.status, erro: dados?.erro || `Erro ${resposta.status} no servidor.` };
    }
    return { ok: true, dados };
  } catch (e) {
    return { ok: false, erro: 'Sem conexão com o servidor. Tente novamente em instantes.' };
  }
}

export function fazerLoginApi(email, senha) {
  return chamarApi('/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
}

export function listarAlunos() {
  return chamarApi('/alunos');
}

export function cadastrarAluno(aluno) {
  return chamarApi('/alunos', { method: 'POST', body: JSON.stringify(aluno) });
}

// "alteracoes" pode ter nome, plano e/ou status — só o que for enviado é alterado
export function atualizarAluno(id, alteracoes) {
  return chamarApi(`/alunos/${id}`, { method: 'PUT', body: JSON.stringify(alteracoes) });
}

export function excluirAluno(id) {
  return chamarApi(`/alunos/${id}`, { method: 'DELETE' });
}

// =========================================================
//  Funções de alunos usadas pelo App.js
// =========================================================
import { requisicao, estaLogado } from './http';

// Mesmos valores aceitos pelo banco (veja backend/schema.sql)
export const PLANOS = ['Mensal', 'Trimestral', 'Anual'];
export const STATUS = ['Ativo', 'Inativo', 'Pendente'];

export async function listarAlunos() {
  // O App chama esta função assim que abre, antes do login.
  // Nesse momento só "acordamos" o servidor e devolvemos uma lista vazia,
  // sem mostrar erro para o usuário.
  if (!estaLogado()) {
    requisicao('/health'); // não precisa esperar a resposta
    return { ok: true, dados: [] };
  }
  return requisicao('/alunos');
}

export async function cadastrarAluno(aluno) {
  return requisicao('/alunos', { metodo: 'POST', corpo: aluno });
}

export async function atualizarAluno(id, alteracoes) {
  return requisicao(`/alunos/${id}`, { metodo: 'PUT', corpo: alteracoes });
}

export async function excluirAluno(id) {
  return requisicao(`/alunos/${id}`, { metodo: 'DELETE' });
}

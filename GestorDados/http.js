// =========================================================
//  Função única que conversa com o servidor.
//  Sempre devolve { ok: true, dados } ou { ok: false, erro }
//  — é exatamente o formato que o App.js espera.
// =========================================================
import { API_URL } from './config';

// O servidor grátis do Render "dorme" e pode levar ~1 minuto para acordar
const TEMPO_LIMITE_MS = 70000;

// Token de login guardado na memória enquanto o app está aberto
let token = null;

export function definirToken(novoToken) {
  token = novoToken;
}

export function estaLogado() {
  return token !== null;
}

export async function requisicao(caminho, { metodo = 'GET', corpo } = {}) {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  try {
    const cabecalhos = { 'Content-Type': 'application/json' };
    if (token) cabecalhos.Authorization = `Bearer ${token}`;

    const resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: controle.signal,
    });

    // Tenta ler a resposta como JSON (pode vir vazia)
    let dados = null;
    try {
      dados = await resposta.json();
    } catch {
      dados = null;
    }

    if (!resposta.ok) {
      // Token vencido: "desloga" para o usuário entrar de novo
      if (resposta.status === 401) token = null;
      return { ok: false, erro: dados?.erro || `Erro do servidor (código ${resposta.status}).` };
    }

    return { ok: true, dados };
  } catch (erro) {
    if (erro.name === 'AbortError') {
      return { ok: false, erro: 'O servidor demorou demais para responder. Tente de novo.' };
    }
    return { ok: false, erro: 'Não foi possível conectar ao servidor. Verifique sua internet.' };
  } finally {
    clearTimeout(timer);
  }
}

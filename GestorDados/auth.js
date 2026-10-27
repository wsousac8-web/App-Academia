// =========================================================
//  Login do administrador
// =========================================================
import { requisicao, definirToken } from './http';

export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export async function validarLogin(email, senha) {
  const resultado = await requisicao('/login', {
    metodo: 'POST',
    corpo: { email: email.trim().toLowerCase(), senha },
  });

  if (!resultado.ok) {
    return { ok: false, erro: resultado.erro };
  }

  definirToken(resultado.dados.token);
  return { ok: true, usuario: resultado.dados.usuario };
}

// Opcional: chame no botão "Sair" para apagar o login da memória
export function sairDaConta() {
  definirToken(null);
}

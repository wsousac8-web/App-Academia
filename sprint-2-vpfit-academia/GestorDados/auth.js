// GestorDados/auth.js
// Validação do login de administrador, feita pelo backend (rota POST /login).
// As contas ficam na tabela "administradores" do banco, com a senha criptografada (bcrypt).

import { fazerLoginApi } from './api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailValido(email) {
  return EMAIL_REGEX.test(email.trim());
}

// Retorna { ok: true, usuario } ou { ok: false, erro }
export async function validarLogin(email, senha) {
  const resultado = await fazerLoginApi(email.trim().toLowerCase(), senha);
  if (!resultado.ok) return { ok: false, erro: resultado.erro };
  return { ok: true, usuario: resultado.dados };
}

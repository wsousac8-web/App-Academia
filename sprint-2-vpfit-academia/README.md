# VPFIT Academia — App

App de gestão de academia feito em **React Native (Expo)**. Os dados ficam em um banco
**PostgreSQL no Supabase**, acessado pela API do backend (`vpfit-backend`, publicado no Render).

## Funcionalidades
- Login de administrador validado pelo banco (senha criptografada no servidor)
- Painel com total de alunos ativos, inativos e pendentes
- Cadastro de aluno (nome, plano e status)
- Alteração de plano e status de um aluno
- Exclusão de aluno

## Estrutura
```
App.js                 telas do app (boas-vindas, login, recuperação, painel)
GestorDados/api.js     todas as chamadas ao backend (listar, cadastrar, alterar, excluir, login)
GestorDados/auth.js    validação do login
assets/                imagens e ícones
```

## Como rodar
```bash
npm install
npx expo start
```
Depois é só abrir no Expo Go (Android) lendo o QR code.

> O backend fica no plano gratuito do Render e "dorme" quando não é usado. O primeiro acesso pode
> levar cerca de 1 minuto — abra https://vpfit-backend.onrender.com/ no navegador antes de usar o app.

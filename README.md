# Projeto Amar Angola

Site institucional do **Projeto Amar Angola**, uma iniciativa social sediada em Benguela, Angola (desde 2023), que atende mais de 400 crianças em Benguela e Luanda com almoços mensais, bíblias, presentes e apoio via padrinhamento.

O site é uma landing page estática de página única (SPA por âncoras), com um painel administrativo simples embutido para atualizar estatísticas e a galeria de fotos.

## 📁 Estrutura do projeto

```
.
├── index.html    # Estrutura HTML: seções públicas + painel admin
├── style.css     # Estilos de todo o site (826 linhas)
├── script.js     # Comportamento do site público (menu, scroll, modal de envio de fotos)
└── admin.js      # Lógica do painel administrativo
```

## 🧩 Seções do site

| Âncora | Seção |
|---|---|
| `#sobre` | Sobre o projeto |
| `#relatos` | Relatos / depoimentos |
| `#como-ajudar` | Como funciona a doação |
| `#adocao` | Caminho da adoção em Benguela |
| `#contato` | Formas de contato / QR code |
| `#galeria` | Galeria de fotos e vídeos |

A navegação usa scroll suave até essas âncoras, com offset para compensar a navbar fixa, e um menu hambúrguer responsivo (`script.js`).

## 🔐 Painel administrativo em produção

Acessível pelo ícone de admin no cabeçalho, o painel permite, após login:

- Atualizar métricas exibidas no site: **visitas**, **doações** e **total de padrinhos**.
- Adicionar fotos à galeria pública via backend seguro.
- Remover fotos previamente publicadas.

Toda a persistência real é feita em **Supabase + Serverless Functions da Vercel**. O login usa sessão JWT em cookie seguro, e o conteúdo não fica mais no navegador em `localStorage`.

> ⚠️ A autenticação agora é server-side, com credenciais criptografadas e proteção por rate limiting. Isso é a versão adequada para produção.

## 📸 Envio de fotos pelo público

Visitantes podem selecionar fotos no modal de contato; o site gera a mensagem e abre o **WhatsApp** para comunicação direta com a equipe.

## 🚀 Como rodar localmente

Use a versão com backend localmente e configure as variáveis em `.env.local`:

```bash
npm install
cp .env.example .env.local
# edite os valores antes de rodar
node scripts/criar-admin.js admin "uma-senha-forte-aqui"
python -m http.server 8000
```

Para validação rápida do JavaScript:

```bash
npm run check
```

## 🛠️ Tecnologias usadas

- HTML5 / CSS3
- JavaScript puro
- Vercel Serverless Functions
- Supabase Postgres + Storage
- Upstash Redis para rate limiting
- JWT em cookie HttpOnly
- Google Fonts: `DM Serif Display` e `DM Sans`
- Integração com WhatsApp via `wa.me`

## 📌 Observações

- O projeto foi migrado para a arquitetura de produção.
- As variáveis de ambiente precisam ser cadastradas em Vercel antes do deploy.
- O arquivo `.env.local` não deve ser enviado para o Git.

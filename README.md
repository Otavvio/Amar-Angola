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

## 🔐 Painel administrativo

Acessível pelo ícone de admin no cabeçalho (`abrirAdminPanel()`), o painel permite, após login:

- Atualizar métricas exibidas no site: **visitas**, **doações** e **total de padrinhos**.
- Adicionar fotos/vídeos à galeria pública (upload local, sem servidor).
- Remover fotos previamente adicionadas.

Toda a persistência de dados (login, contadores e galeria) é feita via **`localStorage`** do navegador — não há back-end nem banco de dados.

> ⚠️ **Atenção de segurança:** as credenciais de admin estão fixas em texto puro dentro de `admin.js` (visível a qualquer visitante que inspecione o código-fonte), e a autenticação/dados ficam só no `localStorage` do navegador — ou seja, sem servidor, sem criptografia e sem sincronização entre dispositivos. Isso é adequado apenas para demonstração; **não deve ser usado em produção** sem uma reformulação com autenticação e armazenamento reais no back-end.

## 📸 Envio de fotos pelo público

Visitantes podem selecionar fotos/vídeos no modal de contato; o site gera uma mensagem com os nomes dos arquivos e abre o **WhatsApp** (via link `wa.me`) para que o envio das mídias seja concluído na conversa.

## 🚀 Como rodar localmente

Por ser um site estático, basta abrir `index.html` em um navegador, ou servir a pasta com um servidor local simples:

```bash
npx serve .
# ou
python3 -m http.server 8000
```

## 🛠️ Tecnologias usadas

- HTML5 / CSS3 (sem frameworks)
- JavaScript puro (Vanilla JS, sem dependências)
- Google Fonts: `DM Serif Display` e `DM Sans`
- Integração com WhatsApp via `wa.me`

## 📌 Observações

- Não há build step, bundler ou dependências de terceiros — os três arquivos (`.html`, `.css`, `.js`) podem ser hospedados em qualquer servidor estático (GitHub Pages, Netlify, Vercel, etc.).
- Os dados do painel admin são **locais ao navegador**: limpar o cache/localStorage apaga fotos e estatísticas cadastradas.

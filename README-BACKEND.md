# Back-end do Projeto Amar Angola (Vercel + Supabase)

## 1. Criar o projeto no Supabase
1. Crie um projeto em https://supabase.com.
2. Vá em **SQL Editor** e rode o conteúdo de `sql/schema.sql`.
3. Vá em **Storage** e crie um bucket chamado `galeria`, marcado como **público**
   (assim `getPublicUrl` funciona sem assinatura de URL).
4. Vá em **Project Settings > API** e anote a `Project URL` e a
   `service_role key` (não a `anon key` — as funções usam a service role).

## 2. Configurar variáveis de ambiente
Copie `.env.example` para `.env.local` e preencha os valores. Em produção,
cadastre as mesmas variáveis em **Vercel > Project Settings >
Environment Variables**.

## 3. Criar o primeiro usuário admin
Localmente, com as variáveis do Supabase exportadas no terminal:
```bash
npm install
node scripts/criar-admin.js admin "uma-senha-forte-aqui"
```
Isso grava só o hash da senha na tabela `admins` — a senha em texto puro
nunca fica salva em lugar nenhum.

## 4. Criar o banco de rate limiting (Upstash)
1. Crie uma conta gratuita em https://upstash.com e um database Redis.
2. Em **Details > REST API**, copie `UPSTASH_REDIS_REST_URL` e
   `UPSTASH_REDIS_REST_TOKEN` para o seu `.env.local`/Vercel.
   Isso limita `/api/login` a 5 tentativas por minuto por IP.

## 5. Juntar com o site estático
Coloque as pastas `api/` e `lib/` na raiz do repositório do site (mesmo
nível de `index.html`). Substitua o `admin.js` e o `script.js` atuais
pelos que estão em `public/` neste pacote. `index.html` e `style.css`
não precisam mudar.

## 6. Deploy
1. Suba o repositório (com `api/`, `lib/`, `index.html`, `style.css`,
   `script.js`, `admin.js`, `package.json`) para o GitHub.
2. Importe o repositório na Vercel — ela detecta as funções em `api/`
   automaticamente, não precisa de configuração extra.
3. Confirme que as variáveis de ambiente foram cadastradas antes do deploy.

## 7. Testar
- Abra o site publicado, clique no ícone de admin e faça login com o
  usuário criado no passo 3.
- Atualize doações/padrinhos e confirme que persistem após recarregar a
  página em outro navegador (prova de que já não é mais `localStorage`).
- Envie uma foto pela galeria do admin e confira se ela aparece na seção
  pública `#galeria` para qualquer visitante.

## Já incluído neste pacote
- **Contagem de visitas**: `POST /api/visit`, chamado automaticamente pelo
  `script.js` público. Usa a function `incrementar_visitas()` do Postgres
  (incremento atômico) e um cookie de 30 minutos para não contar
  recarregamentos repetidos da mesma visita como visitas novas. Isso é
  mais simples que uma ferramenta de analytics dedicada, mas também mais
  simples que ela em recursos (sem funil, sem origem de tráfego etc.) —
  se essas métricas forem importantes no futuro, vale complementar com
  Plausible ou Google Analytics.
- **Rate limiting no login**: `/api/login` aceita no máximo 5 tentativas
  por minuto por IP, usando Upstash Redis (compartilhado entre as
  instâncias da function, diferente de um contador em memória local).

## Limitações conhecidas / próximos passos
- Upload vai como base64 dentro do corpo da requisição, limitado a 10MB.
  Para vídeos maiores, o próximo passo é gerar uma *signed upload URL* do
  Supabase Storage e fazer o navegador enviar o arquivo direto pro bucket,
  sem passar pela function.

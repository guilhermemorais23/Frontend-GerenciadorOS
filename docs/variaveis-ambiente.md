# Variáveis de ambiente

Referência única para o frontend (Next.js) e o backend (`gerenciador-de-os`).  
**Não commite segredos:** use `.env.local` (frontend) e `.env` (backend) a partir dos arquivos `.env.example`.

## Arquivos modelo

| Projeto | Copiar de | Para |
|--------|-----------|------|
| Frontend (raiz do repo) | [`.env.example`](../.env.example) | `.env.local` |
| Backend | [`gerenciador-de-os/.env.example`](../gerenciador-de-os/.env.example) | `gerenciador-de-os/.env` |

## Desenvolvimento local

- Frontend: `http://localhost:3000`
- Backend: defina `PORT` no `.env` do backend (ex.: `3001`). O código usa `10000` se `PORT` não existir; alinhe com `NEXT_PUBLIC_API_URL`.
- Variável principal do frontend: `NEXT_PUBLIC_API_URL` apontando para a URL do backend (ex.: `http://localhost:3001`).

### Rodar o backend

```bash
cd gerenciador-de-os
npm run db:up
npm run dev
```

Sem Docker: MongoDB local e `MONGO_URI` no `.env` (veja o `.env.example` do backend).

### Rodar o frontend

Na raiz do repositório:

```bash
npm run dev
```

### Notas (local)

- Evite apontar `NEXT_PUBLIC_API_URL` para produção durante testes locais, se a política do time for usar só API local.
- WhatsApp pelo backend depende de `WASENDER_API_KEY` (e opcionalmente sessão) no `.env` do backend.

## Produção

### Backend (ex.: Render)

| Variável | Descrição |
|----------|-----------|
| `NODE_ENV` | `production` |
| `PORT` | Porta do provedor (ex.: `10000`) |
| `JWT_SECRET` | Segredo forte para JWT |
| `MONGO_URI` | **Obrigatório em produção** (ou `MONGODB_URI` / `DATABASE_URL` conforme o `server.js`) |
| `WASENDER_BASE_URL` | Padrão: `https://www.wasenderapi.com` |
| `WASENDER_API_KEY` | Chave WasenderAPI |
| `WASENDER_SESSION` | Opcional |
| `WASENDER_OS_CONTROL_GROUP_ID` | Opcional; grupo fixo que recebe resumo/PDF quando o admin valida uma OS |
| `WASENDER_OS_CONTROL_GROUP_NAME` | Opcional; nome usado pelo helper de criação do grupo |

Comportamento esperado pelo código: em produção, sem URI de Mongo, o processo encerra no boot. Rotas de compatibilidade de desenvolvimento ficam desativadas.

### Frontend (ex.: Vercel / Render)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL pública do backend |
| `BACKEND_URL` | Mesma URL (usada em `app/lib/api.ts` e no proxy quando aplicável) |

### Smoke test após deploy

1. Abrir `/login` e autenticar como admin.
2. Criar uma OS.
3. Editar a OS e trocar técnico.
4. Validar envio de WhatsApp (WasenderAPI).
5. Baixar PDF no dashboard e na tela de detalhe.

### Observação funcional

- Canal de e-mail pode estar desativado ou opcional; SMTP está documentado no `.env.example` do backend.
- Fluxo de WhatsApp atual passa pelo backend (WasenderAPI), endpoint de envio conforme implementação em rotas/serviços.
- Para criar o grupo de controle, execute uma única vez o helper `createWasenderControlGroup()` do serviço de delivery. Ele chama `/api/groups` com o participante `558387037644`; salve o ID retornado em `WASENDER_OS_CONTROL_GROUP_ID` para evitar duplicar grupos.

## Opcional: Postgres / Supabase

Variáveis usadas em partes do backend (migração, scripts): `USE_SUPABASE`, `SUPABASE_DB_URL`, `TARGET_POSTGRES_URL`, `POSTGRES_URL`, `DATABASE_URL_POSTGRES`. Ver comentários em `gerenciador-de-os/.env.example`.

## Scripts e importação (avançado)

Scripts em `gerenciador-de-os` podem usar variáveis adicionais (`MONGO_BACKUP_FILE`, `TARGET_MONGO_URI`, caminhos de JSON de import, etc.). Consulte o script específico ou o código em `src/scripts/`.

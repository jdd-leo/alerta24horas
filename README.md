# Alerta 24 Horas

App web colaborativo para apoio em enchentes e desastres naturais. Mostra um **mapa de calor**
dos pontos de alagamento reportados pelos usuários e **sinalizações** (emoji + título + descrição
+ fotos) de necessidades e ofertas de ajuda. Backend e frontend são **separados**, permitindo
reaproveitar as mesmas rotas em um futuro app mobile.

## Arquitetura

- **backend/** — API REST em NestJS + Prisma + PostgreSQL. Login Google (verificação de idToken)
  com JWT próprio. Fotos em disco servidas como estático.
- **frontend/** — SPA em React + Vite + Leaflet (OpenStreetMap, sem API key).

### Regras de negócio

- **Login opcional:** o mapa e a visualização são públicos. O login Google é exigido apenas para
  **criar** alagamentos/sinalizações e gerenciar "minhas sinalizações".
- **Sinalizações:** máx. **3 ativas** por usuário, expiram em **24h**.
- **Alagamentos:** máx. **10 ativos** por usuário, expiram em **72h**.
- **Expiração e exclusão são soft:** dados nunca são apagados fisicamente. Após o `expiresAt`
  deixam de aparecer; a exclusão pelo usuário apenas marca `deletedAt`. As leituras filtram
  `expiresAt > agora` e `deletedAt IS NULL`.
- O mapa exibe a **última atualização de alagamento da região** e o painel de cada sinalização
  mostra **há quanto tempo** foi criada.

## Pré-requisitos

- Node.js 22+
- Docker (para o PostgreSQL)

## Como rodar

### 1. Backend

```bash
cd backend
cp .env.example .env          # ajuste se necessário
docker compose up -d          # sobe o Postgres na porta 5434
npm install
npx prisma migrate dev        # cria o schema
npm run start:dev             # API em http://localhost:3333/api
```

> O Postgres do docker-compose usa a porta **5434** no host para não conflitar com instâncias locais.

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # defina VITE_API_URL e (opcional) VITE_GOOGLE_CLIENT_ID
npm install
npm run dev                   # app em http://localhost:5173
```

## Login

### Desenvolvimento (sem Google)

Com `DEV_AUTH=true` no backend (padrão do `.env.example`), o frontend mostra um campo de
**login de desenvolvimento** por e-mail — útil para testar sem configurar o Google. Nunca use
`DEV_AUTH=true` em produção.

### Google OAuth (produção)

1. No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crie um
   **OAuth Client ID** do tipo *Web application*.
2. Em *Authorized JavaScript origins*, adicione a origem do frontend (ex.: `http://localhost:5173`).
3. Copie o Client ID para:
   - `backend/.env` → `GOOGLE_CLIENT_ID`
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID`
4. Defina `DEV_AUTH=false` no backend.

## API (prefixo `/api`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth/google` | — | Login via idToken do Google → `{ token, user }` |
| POST | `/auth/dev-login` | — | Login de dev (só com `DEV_AUTH=true`) |
| GET | `/auth/me` | JWT | Usuário atual |
| GET | `/floods?bbox=minLng,minLat,maxLng,maxLat` | — | Alagamentos ativos + `lastUpdatedAt` |
| POST | `/floods` | JWT | Cria alagamento (`level`, `lat`, `lng`); 409 se >10 ativos |
| GET | `/signals?bbox=...` | — | Sinalizações ativas |
| GET | `/signals/mine` | JWT | Sinalizações ativas do usuário |
| GET | `/signals/:id` | — | Detalhe |
| POST | `/signals` | JWT | Cria (multipart: emoji, title, description, lat, lng, até 2 fotos); 409 se >3 ativas |
| DELETE | `/signals/:id` | JWT | Soft-delete (só dono) |
| GET | `/emergency-contacts` | — | Contatos de emergência (hardcoded) |

`FloodLevel`: `LOW` (pouca água), `MEDIUM` (até 1 metro), `HIGH` (muita água).

## Estrutura

```
alerta24horas/
├── backend/    # NestJS + Prisma (API REST)
└── frontend/   # React + Vite + Leaflet (SPA)
```

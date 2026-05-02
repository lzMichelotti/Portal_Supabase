# Portal de Links

Sistema interno com dashboard corporativo para centralizacao de links e chamados.

## Estrutura do Projeto

- backend/: API FastAPI, modelos SQLAlchemy e dependencias Python.
- frontend/: App React (Vite), layout do dashboard e integracao com a API.

## Stack Atual

- Backend: FastAPI, SQLAlchemy, PostgreSQL.
- Frontend: React 18, Vite, CSS.

## Como Rodar

### Opção recomendada: Docker

Na raiz do projeto:

```bash
docker compose up --build
```

Depois acesse:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

### 1) Banco de dados

Na raiz do projeto:

```bash
docker compose up -d
```

### 2) Backend

Na raiz do projeto:

```bash
source venv/bin/activate
pip install -r backend/requirements.txt
cd backend
uvicorn app:app --reload
```

Backend disponivel em http://127.0.0.1:8000.

### 3) Frontend

Em outro terminal, na raiz do projeto:

```bash
cd frontend
npm install
npm run dev
```

Frontend disponivel em http://localhost:5173.

## Deploy em Produção

### Supabase

Use a connection string do Supabase em `DATABASE_URL` e defina `DATABASE_SSLMODE=require` no backend.
Se quiser manter os dados iniciais de empresa, deixe `RUN_SEED_DB=true`.

### Vercel

No frontend, defina `VITE_API_URL` apontando para a URL pública do backend.
Se a API estiver em outro domínio, adicione a origem do Vercel em `CORS_ORIGINS` no backend.

Arquivos de apoio:

- [backend/.env.example](backend/.env.example)
- [frontend/.env.example](frontend/.env.example)
- [frontend/vercel.json](frontend/vercel.json)

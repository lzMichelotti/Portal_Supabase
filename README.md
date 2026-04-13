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

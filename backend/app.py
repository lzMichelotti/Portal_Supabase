import os
import json
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import Body, Depends, FastAPI, HTTPException
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Importando database.py
from database import SessionLocal, Empresa, Link, Chamado, AgendaEvento

app = FastAPI(title="API Portal Corporativo", version="1.0.0")

N8N_CHAT_WEBHOOK_URL = os.getenv(
    "N8N_CHAT_WEBHOOK_URL",
    "https://pyritic-unrecurrently-kia.ngrok-free.dev/webhook/1eac8022-d5e8-4ebf-a5fe-d4014027710c",
)

default_cors_origins = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://192.168.145.11:5173"
cors_origins_raw = os.getenv("CORS_ORIGINS", default_cors_origins)
cors_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]
default_cors_origin_regex = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
cors_origin_regex = os.getenv("CORS_ORIGIN_REGEX", default_cors_origin_regex)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=False,
    allow_methods=["*"],    
    allow_headers=["*"],
    
    
)

# Injeção de dependência do Banco de Dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

DBDep = Annotated[Session, Depends(get_db)]

# ------------------ SCHEMAS PYDANTIC (Validação) ------------------ 

class EmpresaCreate(BaseModel):
    nome: str

class LinkCreate(BaseModel):
    empresa_id: int
    titulo: str
    url: str
    descricao: Optional[str] = None

class ChamadoCreate(BaseModel):
    empresa_id: int
    titulo: str
    descricao: str
    status: Optional[str] = "Aberto"


class LinkUpdate(BaseModel):
    empresa_id: Optional[int] = None
    titulo: Optional[str] = None
    url: Optional[str] = None
    descricao: Optional[str] = None


class ChamadoUpdate(BaseModel):
    status: Optional[str] = None
    observacao_ti: Optional[str] = None


class AgendaEventoCreate(BaseModel):
    titulo: str
    data_inicio: datetime
    data_fim: datetime
    local: Optional[str] = None
    descricao: Optional[str] = None


class AgendaEventoUpdate(BaseModel):
    titulo: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    local: Optional[str] = None
    descricao: Optional[str] = None


class ChatbotMessageCreate(BaseModel):
    sessionId: str
    chatInput: str

@app.post("/chatbot/n8n")
def proxy_n8n_chatbot(payload: ChatbotMessageCreate = Body(...)):
    request_body = payload.model_dump(exclude_none=True)
    upstream_request = Request(
        N8N_CHAT_WEBHOOK_URL,
        data=json.dumps(request_body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
        },
        method="POST",
    )

    try:
        with urlopen(upstream_request, timeout=30) as upstream_response:
            response_body = upstream_response.read()
            response_content_type = upstream_response.headers.get_content_type()
            response_charset = upstream_response.headers.get_content_charset() or "utf-8"

            if response_content_type == "application/json":
                try:
                    return JSONResponse(
                        content=json.loads(response_body.decode(response_charset)),
                        status_code=upstream_response.status,
                    )
                except json.JSONDecodeError:
                    pass

            return Response(
                content=response_body,
                media_type=response_content_type or "text/plain",
                status_code=upstream_response.status,
            )
    except HTTPError as error:
        error_body = error.read().decode("utf-8", errors="replace")
        raise HTTPException(status_code=error.code, detail=error_body or "Erro ao chamar o chatbot.")
    except URLError as error:
        raise HTTPException(status_code=502, detail=f"Falha ao conectar ao chatbot: {error.reason}")

# ------------------------ GET (Leitura) ------------------------

@app.get("/empresas")
def read_empresas(db: DBDep):
    return db.query(Empresa).all()

@app.get("/empresas/{empresa_id}/links")
def read_links_da_empresa(empresa_id: int, db: DBDep):
    return db.query(Link).filter(Link.empresa_id == empresa_id).all()

@app.get("/empresas/{empresa_id}/chamados")
def read_chamados_da_empresa(empresa_id: int, db: DBDep):
    return db.query(Chamado).filter(Chamado.empresa_id == empresa_id).all()

@app.get("/links")
def read_links(db: DBDep):
    return db.query(Link).all()

@app.get("/chamados")
def read_chamados(db: DBDep):
    return db.query(Chamado).all()


@app.get("/agenda")
def read_agenda(db: DBDep):
    eventos = db.query(AgendaEvento).order_by(AgendaEvento.data_inicio.asc()).all()
    return {"eventos": eventos}

# ------------------------ POST (Criação) ------------------------


@app.post("/links")
def create_link(link: LinkCreate, db: DBDep):
    # Verifica se a empresa existe antes de criar o link
    empresa_existe = db.query(Empresa).filter(Empresa.id == link.empresa_id).first()
    if not empresa_existe:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")
        
    db_link = Link(**link.model_dump())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

@app.post("/chamados")
def create_chamado(chamado: ChamadoCreate, db: DBDep):
    dados_chamado = chamado.model_dump()
    dados_chamado["status"] = "Aberto"
    db_chamado = Chamado(**dados_chamado)
    db.add(db_chamado)
    db.commit()
    db.refresh(db_chamado)
    return db_chamado


@app.post("/agenda")
def create_agenda_evento(evento: AgendaEventoCreate, db: DBDep):
    if evento.data_fim < evento.data_inicio:
        raise HTTPException(status_code=400, detail="A data final não pode ser anterior à data inicial.")

    db_evento = AgendaEvento(**evento.model_dump())
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)
    return db_evento


# ------------------------ PUT (Atualização) ------------------------

@app.put("/links/{link_id}")
def update_link(link_id: int, link_atualizado: LinkUpdate, db: DBDep):
    db_link = db.query(Link).filter(Link.id == link_id).first()
    if not db_link:
        raise HTTPException(status_code=404, detail="Link não encontrado")
    
    # O exclude_unset=True pega apenas os campos que o frontend enviou para mudar
    dados_novos = link_atualizado.model_dump(exclude_unset=True)
    for key, value in dados_novos.items():
        setattr(db_link, key, value)
        
    db.commit()
    db.refresh(db_link)
    return db_link

@app.put("/chamados/{chamado_id}")
def update_chamado(chamado_id: int, chamado_atualizado: ChamadoUpdate, db: DBDep):
    db_chamado = db.query(Chamado).filter(Chamado.id == chamado_id).first()
    if not db_chamado:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")
    
    dados_novos = chamado_atualizado.model_dump(exclude_unset=True)
    for key, value in dados_novos.items():
        setattr(db_chamado, key, value)
        
    db.commit()
    db.refresh(db_chamado)
    return db_chamado


@app.put("/agenda/{evento_id}")
def update_agenda_evento(evento_id: int, evento_atualizado: AgendaEventoUpdate, db: DBDep):
    db_evento = db.query(AgendaEvento).filter(AgendaEvento.id == evento_id).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    dados_novos = evento_atualizado.model_dump(exclude_unset=True)
    data_inicio_final = dados_novos.get("data_inicio", db_evento.data_inicio)
    data_fim_final = dados_novos.get("data_fim", db_evento.data_fim)
    if data_fim_final < data_inicio_final:
        raise HTTPException(status_code=400, detail="A data final não pode ser anterior à data inicial.")

    for key, value in dados_novos.items():
        setattr(db_evento, key, value)

    db.commit()
    db.refresh(db_evento)
    return db_evento


# ------------------------ DELETE (Exclusão) ------------------------

@app.delete("/links/{link_id}")
def delete_link(link_id: int, db: DBDep):
    db_link = db.query(Link).filter(Link.id == link_id).first()
    if not db_link:
        raise HTTPException(status_code=404, detail="Link não encontrado")
        
    db.delete(db_link)
    db.commit()
    return {"mensagem": "Link excluído com sucesso"}

@app.delete("/chamados/{chamado_id}")
def delete_chamado(chamado_id: int, db: DBDep):
    db_chamado = db.query(Chamado).filter(Chamado.id == chamado_id).first()
    if not db_chamado:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")
        
    db.delete(db_chamado)
    db.commit()
    return {"mensagem": "Chamado excluído com sucesso"}


@app.delete("/agenda/{evento_id}")
def delete_agenda_evento(evento_id: int, db: DBDep):
    db_evento = db.query(AgendaEvento).filter(AgendaEvento.id == evento_id).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    db.delete(db_evento)
    db.commit()
    return {"mensagem": "Evento excluído com sucesso"}


@app.delete("/chamados/status/resolvido")
def delete_resolved_chamados(db: DBDep):
    """Deleta todos os chamados com status 'Resolvido'"""
    chamados_deletados = db.query(Chamado).filter(Chamado.status == "Resolvido").delete()
    db.commit()
    return {"mensagem": f"{chamados_deletados} chamado(s) resolvido(s) excluído(s) com sucesso", "quantidade": chamados_deletados}
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Importando database.py
from database import SessionLocal, Empresa, Link, Chamado

app = FastAPI(title="API Portal Corporativo", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.145.11:5173",
    ],
    allow_credentials=True,
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

@app.delete("/chamados/status/resolvido")
def delete_resolved_chamados(db: DBDep):
    """Deleta todos os chamados com status 'Resolvido'"""
    chamados_deletados = db.query(Chamado).filter(Chamado.status == "Resolvido").delete()
    db.commit()
    return {"mensagem": f"{chamados_deletados} chamado(s) resolvido(s) excluído(s) com sucesso", "quantidade": chamados_deletados}
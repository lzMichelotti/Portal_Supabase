import os

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://magni:magni1234@127.0.0.1:5440/magni_db")
DATABASE_SSLMODE = os.getenv("DATABASE_SSLMODE", "prefer")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"sslmode": DATABASE_SSLMODE},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Empresa(Base):
    __tablename__ = 'empresas'
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False, unique=True)

    links = relationship("Link", back_populates="empresa")
    chamados = relationship("Chamado", back_populates="empresa")

class Link(Base):
    __tablename__ = 'links'
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), nullable=False)
    titulo = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    descricao = Column(Text, nullable=True)
    atualizado_em = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    empresa = relationship("Empresa", back_populates="links")

class Chamado(Base):
    __tablename__ = 'chamados'
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), nullable=False)
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=False)
    status = Column(String(50), default="Aberto")
    observacao_ti = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.now)
    atualizado_em = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    empresa = relationship("Empresa", back_populates="chamados")


class AgendaEvento(Base):
    __tablename__ = "agenda_eventos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    data_inicio = Column(DateTime, nullable=False)
    data_fim = Column(DateTime, nullable=False)
    local = Column(String(255), nullable=True)
    descricao = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.now)
    atualizado_em = Column(DateTime, default=datetime.now, onupdate=datetime.now)

## USEI CODIGO A BAIXO PARA ADICIONAR UMA COLUNA, USAR O MESMO PARA ADICIONAR COLUNAS SE NECESSÁRIO

# def atualizar_tabela_chamados():
#     inspetor = inspect(engine)
#     colunas_existentes = {coluna["name"] for coluna in inspetor.get_columns("chamados")}

#     with engine.begin() as conexao:
#         if "observacao_ti" not in colunas_existentes:
#             conexao.execute(text("ALTER TABLE chamados ADD COLUMN observacao_ti TEXT"))
#             print("Coluna 'observacao_ti' adicionada com sucesso.")
            
#         if "atualizado_em" not in colunas_existentes:
#             conexao.execute(text("ALTER TABLE chamados ADD COLUMN atualizado_em TIMESTAMP"))
#             print("Coluna 'atualizado_em' adicionada com sucesso.")

Base.metadata.create_all(bind=engine)
print("Tabelas do Portal verificadas e criadas com sucesso no PostgreSQL")
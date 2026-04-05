import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path("banco.sqlite")

SQL_CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa TEXT NOT NULL,
    titulo TEXT NOT NULL,
    url TEXT NOT NULL,
    descricao TEXT,
    atualizado_em TEXT
);
"""

def obter_conexao():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

def inicializar_banco():
    with obter_conexao() as con:
        con.execute(SQL_CRIAR_TABELA)

def criar_link(empresa, titulo, url, descricao=""):
    titulo = (titulo or "").strip()
    url = (url or "").strip()
    
    if not titulo or not url:
        raise ValueError("Título e URL são obrigatórios.")
        
    agora = datetime.now().isoformat(timespec="seconds")
    
    with obter_conexao() as con:
        cur = con.execute(
            """
            INSERT INTO links (empresa, titulo, url, descricao, atualizado_em) 
            VALUES (?, ?, ?, ?, ?)
            """,
            (empresa, titulo, url, (descricao or "").strip(), agora)
        )
        return cur.lastrowid

def buscar_links():
    with obter_conexao() as con:
        cur = con.execute("SELECT * FROM links")
        dados = cur.fetchall()
        
        empresas = {"Empresa 1": [], "Empresa 2": [], "Empresa 3": []}
        for linha in dados:
            if linha['empresa'] in empresas:
                empresas[linha['empresa']].append(dict(linha))
        return empresas

def excluir_link(link_id: int):
    with obter_conexao() as con:
        cur = con.execute("DELETE FROM links WHERE id = ?", (link_id,))
        return cur.rowcount > 0
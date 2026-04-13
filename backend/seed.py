from database import Empresa, SessionLocal

##POPULAR BANCO DE DADOS COM DADOS ESTÁTICOS 

def popular_empresas_iniciais():
    """Popula o banco com as empresas do grupo e a categoria Geral."""
    # Adicionamos 'Geral' na lista para que ela herde todas as funcionalidades
    empresas_padrao = ["MagniCred", "Magni", "BT Advogados", "Geral"]
    
    db = SessionLocal()
    try:
        for nome_empresa in empresas_padrao:
            empresa_existe = db.query(Empresa).filter(Empresa.nome == nome_empresa).first()
            
            if not empresa_existe:
                nova_empresa = Empresa(nome=nome_empresa)
                db.add(nova_empresa)
                print(f"Entidade '{nome_empresa}' criada com sucesso.")
                
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    popular_empresas_iniciais()
from flask import Flask, render_template, request, redirect, url_for
import database

app = Flask(__name__, static_folder='assets', static_url_path='/assets')

database.inicializar_banco()

@app.route('/')
def index():
    dados_organizados = database.buscar_links()
    return render_template('index.html', dados=dados_organizados)

@app.route('/adicionar', methods=['POST'])
def adicionar():
    empresa = request.form['empresa']
    titulo = request.form['titulo']
    url = request.form['url']
    descricao = request.form['descricao']
    
    database.criar_link(empresa, titulo, url, descricao)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
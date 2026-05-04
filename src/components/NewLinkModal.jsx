import { useState } from "react";

const initialForm = {
  empresa_id: "",
  titulo: "",
  url: "",
  descricao: ""
};

function NewLinkModal({ open, empresas, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(initialForm);

  if (!open) {
    return null;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      empresa_id: Number(form.empresa_id)
    });
    setForm(initialForm);
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Adicionar novo link">
      <div className="modal">
        <div className="modal__header">
          <h3>Adicionar Novo Link</h3>
          <button type="button" onClick={onClose} aria-label="Fechar modal">
            x
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label>
            Empresa
            <select name="empresa_id" value={form.empresa_id} onChange={handleChange} required>
              <option value="">Selecione</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Titulo
            <input
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              required
              placeholder="Ex: Sistema Financeiro"
            />
          </label>

          <label>
            URL
            <input
              type="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              required
              placeholder="https://..."
            />
          </label>

          <label>
            Descricao
            <textarea
              name="descricao"
              rows="3"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Descricao breve do sistema"
            />
          </label>

          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewLinkModal;

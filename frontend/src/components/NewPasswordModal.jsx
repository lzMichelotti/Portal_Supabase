import { useState } from "react";
import { createSenha } from "../api";

const initial = { titulo: "", usuario: "", senha: "", descricao: "" };

function NewPasswordModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const data = await createSenha(form);
      onSaved(data);
      setForm(initial);
      onClose();
    } catch (err) {
      setError("Erro ao salvar senha.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Nova senha">
      <div className="modal">
        <div className="modal__header">
          <h3>Nova Senha</h3>
          <button type="button" onClick={onClose}>x</button>
        </div>
        <form className="modal__form" onSubmit={handleSubmit}>
          <label>
            Título
            <input name="titulo" value={form.titulo} onChange={handleChange} required />
          </label>
          <label>
            Usuário
            <input name="usuario" value={form.usuario} onChange={handleChange} />
          </label>
          <label>
            Senha
            <input name="senha" value={form.senha} onChange={handleChange} required />
          </label>
          <label>
            Descrição
            <textarea name="descricao" value={form.descricao} onChange={handleChange} />
          </label>

          {error && <p className="feedback feedback--error">{error}</p>}

          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewPasswordModal;
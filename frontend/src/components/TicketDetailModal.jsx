import { useEffect, useState } from "react";

const statusOptions = ["Aberto", "Em Andamento", "Resolvido"];

function TicketDetailModal({ open, ticket, onClose, onSubmit, submitting }) {
  const [status, setStatus] = useState(ticket?.status || "Aberto");
  const [observacaoTi, setObservacaoTi] = useState(ticket?.observacao_ti || "");

  useEffect(() => {
    if (open) {
      setStatus(ticket?.status || "Aberto");
      setObservacaoTi(ticket?.observacao_ti || "");
    }
  }, [open, ticket]);

  if (!open || !ticket) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(ticket.id, {
      status,
      observacao_ti: observacaoTi
    });
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Detalhe do chamado">
      <div className="modal modal--wide">
        <div className="modal__header">
          <h3>Detalhe do Chamado #{ticket.id}</h3>
          <button type="button" onClick={onClose} aria-label="Fechar modal">
            x
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="ticket-detail-summary">
            <div>
              <strong>{ticket.titulo}</strong>
              <p>{ticket.empresaNome}</p>
            </div>
            <span className="ticket-detail-summary__status">{ticket.status}</span>
          </div>

          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Descricao do chamado
            <textarea value={ticket.descricao} rows="4" disabled />
          </label>

          <label>
            Observacao do TI
            <textarea
              name="observacao_ti"
              rows="5"
              value={observacaoTi}
              onChange={(event) => setObservacaoTi(event.target.value)}
              placeholder="Registrar analise, andamento e orientacoes do TI"
            />
          </label>

          <div className="modal__footer modal__footer--spread">
            <small>Aberto em {new Date(ticket.criado_em).toLocaleString("pt-BR")}</small>
            <div className="modal__footer-actions">
              <button type="button" className="btn btn--secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar Alteracoes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TicketDetailModal;

import StatusBadge from "./StatusBadge";

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function TicketHistoryModal({ open, tickets, onClose, onOpenTicket, onDelete, userRole }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Histórico de chamados">
      <div className="modal modal--wide modal--history">
        <div className="modal__header">
          <h3>Histórico de Chamados Concluídos</h3>
          <button type="button" onClick={onClose} aria-label="Fechar histórico">
            x
          </button>
        </div>

        <div className="modal__form modal__form--history">
          {tickets.length === 0 ? (
            <p className="empty-state">Nenhum chamado concluído foi encontrado.</p>
          ) : (
            <div className="ticket-history-list">
              {tickets.map((ticket) => (
                <article key={ticket.id} className="ticket-history-card">
                  <div className="ticket-history-card__top">
                    <div>
                      <span className="ticket-card__id">#{ticket.id}</span>
                      <strong>{ticket.titulo}</strong>
                      <p>{ticket.empresaNome}</p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>

                  <div className="ticket-history-card__body">
                    <p>
                      <strong>Descrição:</strong> {ticket.descricao}
                    </p>
                    <p>
                      <strong>Observação do TI:</strong> {ticket.observacao_ti || "Sem observação registrada."}
                    </p>
                    <p>
                      <strong>Criado em:</strong> {formatDateTime(ticket.criado_em)}
                    </p>
                    <p>
                      <strong>Atualizado em:</strong> {formatDateTime(ticket.atualizado_em)}
                    </p>
                  </div>

                  <div className="ticket-history-card__actions">
                    <button
                      type="button"
                      className="btn btn--secondary btn--small"
                      onClick={() => onOpenTicket(ticket)}
                    >
                      Ver detalhes
                    </button>
                    {userRole === 'chefe' && (
                      <button
                        type="button"
                        className="btn btn--danger btn--small"
                        onClick={() => {
                          if (onDelete) onDelete(ticket.id);
                        }}
                      >
                        Deletar
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketHistoryModal;
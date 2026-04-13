import StatusBadge from "./StatusBadge";

function formatDate(dateInput) {
  if (!dateInput) {
    return "-";
  }

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function TicketList({ items, onOpenTicket, onClearResolved }) {
  const columns = [
    { key: "Aberto", title: "Abertos" },
    { key: "Em Andamento", title: "Em Andamento" },
    { key: "Resolvido", title: "Resolvidos" }
  ].map((column) => ({
    ...column,
    items: items.filter((ticket) => ticket.status === column.key)
  }));

  const resolvedCount = columns.find((col) => col.key === "Resolvido")?.items.length || 0;

  return (
    <div className="ticket-board">
      <div className="ticket-board__head">
        {columns.map((column) => (
          <div key={column.key} className="ticket-board__head-item">
            <div>
              <strong>{column.title}</strong>
              <span>{column.items.length}</span>
            </div>
            {column.key === "Resolvido" && resolvedCount > 0 && (
              <button
                type="button"
                className="btn btn--danger btn--small"
                onClick={onClearResolved}
                title="Limpar todos os chamados resolvidos"
              >
                Limpar
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="ticket-board__columns">
        {columns.map((column) => (
          <section key={column.key} className="ticket-column">
            {column.items.length === 0 ? (
              <p className="ticket-column__empty">Nenhum chamado nesta coluna.</p>
            ) : (
              column.items.map((ticket) => (
                <button
                  type="button"
                  className="ticket-card"
                  key={ticket.id}
                  onClick={() => onOpenTicket(ticket)}
                >
                  <div className="ticket-card__top">
                    <span className="ticket-card__id">#{ticket.id}</span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h3>{ticket.titulo}</h3>
                  <p>{ticket.empresaNome}</p>
                  <small>{formatDate(ticket.criado_em)}</small>
                </button>
              ))
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export default TicketList;

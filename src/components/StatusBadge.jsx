const statusClassMap = {
  Aberto: "status-badge--open",
  "Em Andamento": "status-badge--progress",
  Resolvido: "status-badge--done"
};

function StatusBadge({ status }) {
  const className = statusClassMap[status] || "status-badge--open";

  return <span className={`status-badge ${className}`}>{status}</span>;
}

export default StatusBadge;

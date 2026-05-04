function LinkCard({ item, onDelete }) {
  return (
    <div className="link-card-wrapper">
      <a className="link-card" href={item.url} target="_blank" rel="noreferrer">
        <span className="link-card__icon" aria-hidden="true">↗</span>
        <h3>{item.titulo}</h3>
        <p>{item.descricao || "Sem descricao cadastrada."}</p>
        <small>{item.url}</small>
      </a>
      <button
        type="button"
        className="link-card__delete"
        onClick={() => onDelete(item.id)}
        title="Deletar link"
        aria-label={`Deletar link ${item.titulo}`}
      >
        ✕
      </button>
    </div>
  );
}

function LinkSection({ title, items, onDeleteLink }) {
  return (
    <section className="section-block">
      <div className="section-block__header">
        <h2>{title}</h2>
      </div>

      {items.length > 0 ? (
        <div className="link-grid">
          {items.map((item) => (
            <LinkCard key={item.id} item={item} onDelete={onDeleteLink} />
          ))}
        </div>
      ) : (
        <p className="empty-state">Nenhum link cadastrado para este setor.</p>
      )}
    </section>
  );
}

export default LinkSection;

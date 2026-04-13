function LinkCard({ item }) {
  return (
    <a className="link-card" href={item.url} target="_blank" rel="noreferrer">
      <span className="link-card__icon" aria-hidden="true">↗</span>
      <h3>{item.titulo}</h3>
      <p>{item.descricao || "Sem descricao cadastrada."}</p>
      <small>{item.url}</small>
    </a>
  );
}

function LinkSection({ title, items }) {
  return (
    <section className="section-block">
      <div className="section-block__header">
        <h2>{title}</h2>
      </div>

      {items.length > 0 ? (
        <div className="link-grid">
          {items.map((item) => (
            <LinkCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="empty-state">Nenhum link cadastrado para este setor.</p>
      )}
    </section>
  );
}

export default LinkSection;

const navItems = [
  { id: "links", label: "Portal de Links" },
  { id: "helpdesk", label: "Helpdesk" }
];

function Sidebar({ activeTab, onChangeTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark" aria-hidden="true">MP</span>
        <div>
          <strong>Magni Portal</strong>
          <small>Intranet Corporativa</small>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Navegacao principal">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar__nav-item ${activeTab === item.id ? "is-active" : ""}`}
            onClick={() => onChangeTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;

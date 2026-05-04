import logoMagni from "../assets/Logo_magni.jpg";

const navItems = [
  { id: "links", label: "Portal de Links" },
  { id: "agenda", label: "Agenda" },
  { id: "senhas", label: "Senhas" },
  { id: "helpdesk", label: "Helpdesk" }
];

function Sidebar({ activeTab, onChangeTab, userRole }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img src={logoMagni} alt="Logo Magni" className="sidebar__brand-logo" />
        <div>
          <strong>Magni Portal</strong>
          <small>Intranet Corporativa</small>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Navegacao principal">
        {navItems
          .filter((i) => (i.id === 'senhas' ? userRole === 'chefe' : true))
          .map((item) => (
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

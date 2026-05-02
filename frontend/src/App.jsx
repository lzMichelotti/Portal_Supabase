import { useEffect, useMemo, useState } from "react";
import AgendaPanel from "./components/AgendaPanel";
import ChatbotPanel from "./components/ChatbotPanel";
import LinkSection from "./components/LinkSection";
import NewLinkModal from "./components/NewLinkModal";
import NewTicketModal from "./components/NewTicketModal";
import TicketHistoryModal from "./components/TicketHistoryModal";
import TicketDetailModal from "./components/TicketDetailModal";
import Sidebar from "./components/Sidebar";
import TicketList from "./components/TicketList";
import {
  createChamado,
  createLink,
  deleteLink,
  getChamados,
  getEmpresas,
  getLinks,
  updateChamado
} from "./api";
import logoBtAdvogados from "./assets/Logo_BTadvogados.jpg";
import logoMagni from "./assets/Logo_magni.jpg";
import logoMagniCred from "./assets/Logo_magnicred.jpg";

const COMPANY_ORDER = ["MagniCred", "Magni", "BT Advogados", "Geral"];

const COMPANY_META = {
  MagniCred: { logo: logoMagniCred, initials: "MC" },
  Magni: { logo: logoMagni, initials: "MG" },
  "BT Advogados": { logo: logoBtAdvogados, initials: "BT" },
  Geral: { logo: null, initials: "GE" }
};

function normalizeCompanyName(rawCompanyName) {
  const normalized = (rawCompanyName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (!normalized) {
    return "Geral";
  }

  if (normalized.includes("empresa 1")) return "Magni";
  if (normalized.includes("empresa 2")) return "MagniCred";
  if (normalized.includes("empresa 3")) return "BT Advogados";
  if (normalized.includes("empresa 4")) return "Geral";
  if (normalized.includes("cred")) return "MagniCred";
  if (normalized.includes("bt") || normalized.includes("advog")) return "BT Advogados";
  if (normalized.includes("magni")) return "Magni";
  if (normalized.includes("geral")) return "Geral";

  return "Geral";
}

function App() {
  const [activeTab, setActiveTab] = useState("links");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [links, setLinks] = useState([]);
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [submittingLink, setSubmittingLink] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);
  const [submittingTicketUpdate, setSubmittingTicketUpdate] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [empresasData, linksData, chamadosData] = await Promise.all([
          getEmpresas(),
          getLinks(),
          getChamados()
        ]);
        setEmpresas(empresasData);
        setLinks(linksData);
        setChamados(chamadosData);
      } catch {
        setError("Nao foi possivel carregar os dados do dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const empresasMap = useMemo(() => {
    const map = new Map();
    empresas.forEach((empresa) => {
      map.set(empresa.id, empresa.nome);
    });
    return map;
  }, [empresas]);

  const groupedLinks = useMemo(() => {
    const groups = {};

    COMPANY_ORDER.forEach((companyName) => {
      groups[companyName] = [];
    });

    links.forEach((item) => {
      const empresaNome = normalizeCompanyName(empresasMap.get(item.empresa_id));
      if (!groups[empresaNome]) {
        groups[empresaNome] = [];
      }

      groups[empresaNome].push(item);
    });

    return groups;
  }, [links, empresasMap]);

  const chamadosComEmpresa = useMemo(() => {
    return chamados.map((chamado) => ({
      ...chamado,
      empresaNome: empresasMap.get(chamado.empresa_id) || "Nao informado"
    }));
  }, [chamados, empresasMap]);

  const chamadosAtivos = useMemo(
    () => chamadosComEmpresa.filter((chamado) => chamado.status !== "Resolvido"),
    [chamadosComEmpresa]
  );

  const chamadosHistorico = useMemo(
    () =>
      chamadosComEmpresa
        .filter((chamado) => chamado.status === "Resolvido")
        .sort((a, b) => new Date(b.atualizado_em || b.criado_em) - new Date(a.atualizado_em || a.criado_em)),
    [chamadosComEmpresa]
  );

  async function handleCreateTicket(formData) {
    try {
      setSubmittingTicket(true);
      const createdTicket = await createChamado(formData);
      setChamados((prev) => [createdTicket, ...prev]);
      setIsModalOpen(false);
    } catch {
      setError("Erro ao abrir novo chamado.");
    } finally {
      setSubmittingTicket(false);
    }
  }

  async function handleCreateLink(formData) {
    try {
      setSubmittingLink(true);
      const createdLink = await createLink(formData);
      setLinks((prev) => [createdLink, ...prev]);
      setIsLinkModalOpen(false);

      const companyName = normalizeCompanyName(empresasMap.get(createdLink.empresa_id));
      setSelectedCompany(companyName);
    } catch {
      setError("Erro ao adicionar novo link.");
    } finally {
      setSubmittingLink(false);
    }
  }

  function openTicketDetail(ticket) {
    setSelectedTicket(ticket);
    setIsTicketDetailOpen(true);
  }

  function closeTicketDetail() {
    setIsTicketDetailOpen(false);
    setSelectedTicket(null);
  }

  function openHistory() {
    setIsHistoryOpen(true);
  }

  function closeHistory() {
    setIsHistoryOpen(false);
  }

  async function handleUpdateTicket(ticketId, payload) {
    try {
      setSubmittingTicketUpdate(true);
      const updatedTicket = await updateChamado(ticketId, payload);

      setChamados((prev) =>
        prev.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))
      );
      setSelectedTicket((prevSelected) =>
        prevSelected && prevSelected.id === updatedTicket.id ? updatedTicket : prevSelected
      );
    } catch {
      setError("Erro ao atualizar chamado.");
    } finally {
      setSubmittingTicketUpdate(false);
    }
  }

  async function handleDeleteLink(linkId) {
    if (!confirm("Tem certeza que deseja deletar este link?")) {
      return;
    }

    try {
      await deleteLink(linkId);
      setLinks((prev) => prev.filter((link) => link.id !== linkId));
    } catch {
      setError("Erro ao deletar link.");
    }
  }

  return (
    <div className="layout">
      <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

      <div className="main-column">
        <main className="content">
          {loading && <p className="feedback">Carregando dados...</p>}
          {error && <p className="feedback feedback--error">{error}</p>}

          {!loading && !error && activeTab === "links" && (
            <section>
              <div className="section-title-row section-title-row--spread">
                <h2>Sistemas e Links Rapidos</h2>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setIsLinkModalOpen(true)}
                >
                  Adicionar Link
                </button>
              </div>

              <div className="company-grid">
                {COMPANY_ORDER.map((companyName) => {
                  const companyMeta = COMPANY_META[companyName];
                  return (
                    <button
                      key={companyName}
                      type="button"
                      className={`company-card ${selectedCompany === companyName ? "is-active" : ""}`}
                      onClick={() =>
                        setSelectedCompany((prevSelected) =>
                          prevSelected === companyName ? null : companyName
                        )
                      }
                    >
                      {companyMeta.logo ? (
                        <img src={companyMeta.logo} alt={`Logo ${companyName}`} />
                      ) : (
                        <span className="company-card__fallback" aria-hidden="true">
                          {companyMeta.initials}
                        </span>
                      )}
                      <strong>{companyName}</strong>
                    </button>
                  );
                })}
              </div>

              {selectedCompany ? (
                <LinkSection
                  key={selectedCompany}
                  title={selectedCompany}
                  items={groupedLinks[selectedCompany] || []}
                  onDeleteLink={handleDeleteLink}
                />
              ) : (
                <p className="empty-state">Selecione uma empresa para visualizar os links.</p>
              )}
            </section>
          )}

          {!loading && !error && activeTab === "agenda" && (
            <AgendaPanel title="Google Calendar" />
          )}

          {!loading && !error && activeTab === "agenda-teste" && (
            <section className="agenda-test-layout">
              <div className="agenda-test-layout__main">
                <AgendaPanel title="Agenda" />
              </div>
              <div className="agenda-test-layout__side">
                <ChatbotPanel />
              </div>
            </section>
          )}

          {!loading && !error && activeTab === "helpdesk" && (
            <section>
              <div className="section-title-row section-title-row--spread">
                <h2>Central de Atendimento interno</h2>
                <div className="helpdesk-actions">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={openHistory}
                  >
                    📁 Histórico
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Abrir Novo Chamado
                  </button>
                </div>
              </div>

              <TicketList items={chamadosAtivos} onOpenTicket={openTicketDetail} />
            </section>
          )}
        </main>
      </div>

      <NewTicketModal
        open={isModalOpen}
        empresas={empresas}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
        submitting={submittingTicket}
      />

      <NewLinkModal
        open={isLinkModalOpen}
        empresas={empresas}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={handleCreateLink}
        submitting={submittingLink}
      />

      <TicketDetailModal
        open={isTicketDetailOpen}
        ticket={selectedTicket}
        onClose={closeTicketDetail}
        onSubmit={handleUpdateTicket}
        submitting={submittingTicketUpdate}
      />

      <TicketHistoryModal
        open={isHistoryOpen}
        tickets={chamadosHistorico}
        onClose={closeHistory}
        onOpenTicket={openTicketDetail}
      />
    </div>
  );
}

export default App;

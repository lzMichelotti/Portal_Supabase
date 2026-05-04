import { useEffect, useState } from "react";
import { getSenhas, deleteSenha } from "../api";
import NewPasswordModal from "./NewPasswordModal";

function PasswordsPanel({ userRole }) {
  const [senhas, setSenhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getSenhas();
        setSenhas(data);
      } catch (e) {
        setError("Erro ao carregar senhas.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Deletar esta senha?")) return;
    try {
      await deleteSenha(id);
      setSenhas((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Erro ao deletar.");
    }
  }

  return (
    <section>
      <div className="section-title-row section-title-row--spread">
        <h2>Senhas</h2>
        <div>
          {userRole === 'chefe' && (
            <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
              Nova Senha
            </button>
          )}
        </div>
      </div>

      {loading && <p className="feedback">Carregando...</p>}
      {error && <p className="feedback feedback--error">{error}</p>}

      {!loading && !error && (
        <div className="section-block">
          {senhas.length === 0 ? (
            <p className="empty-state">Nenhuma senha cadastrada.</p>
          ) : (
            <div className="password-list">
              {senhas.map((s) => (
                <div key={s.id} className="password-card">
                  <div>
                    <strong>{s.titulo}</strong>
                    <p>{s.usuario || "-"}</p>
                  </div>
                  <div>
                    <small>{s.descricao || ""}</small>
                  </div>
                  <div className="password-card__actions">
                    <button
                      type="button"
                      className="btn btn--secondary btn--small"
                      onClick={() => {
                        const was = prompt("Senha (copiar para clipboard):", s.senha);
                        if (was !== null) {
                          navigator.clipboard?.writeText(s.senha);
                        }
                      }}
                    >
                      Copiar
                    </button>
                    {userRole === 'chefe' && (
                      <button type="button" className="btn btn--danger btn--small" onClick={() => handleDelete(s.id)}>
                        Deletar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <NewPasswordModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSaved={(newS) => setSenhas((p) => [newS, ...p])} />
    </section>
  );
}

export default PasswordsPanel;

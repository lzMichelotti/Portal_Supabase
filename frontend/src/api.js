const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erro ao comunicar com a API.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getEmpresas() {
  return request("/empresas");
}

export function getLinks() {
  return request("/links");
}

export function getChamados() {
  return request("/chamados");
}

export function createChamado(payload) {
  return request("/chamados", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateChamado(chamadoId, payload) {
  return request(`/chamados/${chamadoId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function createLink(payload) {
  return request("/links", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

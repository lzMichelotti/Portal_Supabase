export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    let message = "";

    try {
      if (contentType.includes("application/json")) {
        const data = await response.json();
        message = data?.detail || data?.message || JSON.stringify(data);
      } else {
        message = await response.text();
      }
    } catch {
      message = "";
    }

    throw new Error(message || `Erro HTTP ${response.status}.`);
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

export function deleteLink(linkId) {
  return request(`/links/${linkId}`, {
    method: "DELETE"
  });
}

export function clearResolvedTickets() {
  return request("/chamados/status/resolvido", {
    method: "DELETE"
  });
}

export function getAgenda() {
  return request("/agenda");
}

export function createAgendaEvent(payload) {
  return request("/agenda", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAgendaEvent(eventId, payload) {
  return request(`/agenda/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteAgendaEvent(eventId) {
  return request(`/agenda/${eventId}`, {
    method: "DELETE"
  });
}

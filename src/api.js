import { getSupabaseClient } from "./lib/supabaseClient";

function getClient() {
  return getSupabaseClient();
}

function ensureError(error, fallbackMessage) {
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallbackMessage);
}

export async function getEmpresas() {
  const { data, error } = await getClient().from("empresas").select("*").order("nome");
  if (error) throw ensureError(error, "Erro ao carregar empresas.");
  return data ?? [];
}

export async function getLinks() {
  const { data, error } = await getClient().from("links").select("*").order("id", { ascending: false });
  if (error) throw ensureError(error, "Erro ao carregar links.");
  return data ?? [];
}

export async function getChamados() {
  const { data, error } = await getClient().from("chamados").select("*").order("criado_em", { ascending: false });
  if (error) throw ensureError(error, "Erro ao carregar chamados.");
  return data ?? [];
}

export async function createChamado(payload) {
  const client = getClient();
  const { data: { user } } = await client.auth.getUser();
  const row = {
    empresa_id: Number(payload.empresa_id),
    titulo: payload.titulo,
    descricao: payload.descricao,
    status: "Aberto",
    created_by: user?.id || null
  };
  const { data, error } = await getClient().from("chamados").insert(row).select("*").single();
  if (error) throw ensureError(error, "Erro ao criar chamado.");
  return data;
}

export async function updateChamado(chamadoId, payload) {
  const row = { ...payload, atualizado_em: new Date().toISOString() };
  const { data, error } = await getClient().from("chamados").update(row).eq("id", chamadoId).select("*").single();
  if (error) throw ensureError(error, "Erro ao atualizar chamado.");
  return data;
}

export async function createLink(payload) {
  const row = { empresa_id: Number(payload.empresa_id), titulo: payload.titulo, url: payload.url, descricao: payload.descricao ?? null };
  const { data, error } = await getClient().from("links").insert(row).select("*").single();
  if (error) throw ensureError(error, "Erro ao criar link.");
  return data;
}

export async function deleteLink(linkId) {
  const { error } = await getClient().from("links").delete().eq("id", linkId);
  if (error) throw ensureError(error, "Erro ao deletar link.");
}

export async function getAgenda() {
  const { data, error } = await getClient().from("agenda_eventos").select("*").order("data_inicio");
  if (error) throw ensureError(error, "Erro ao carregar agenda.");
  return data ?? [];
}

export async function createAgendaEvent(payload) {
  const { data, error } = await getClient().from("agenda_eventos").insert(payload).select("*").single();
  if (error) throw ensureError(error, "Erro ao criar evento da agenda.");
  return data;
}

export async function updateAgendaEvent(eventId, payload) {
  const { data, error } = await getClient().from("agenda_eventos").update({ ...payload, atualizado_em: new Date().toISOString() }).eq("id", eventId).select("*").single();
  if (error) throw ensureError(error, "Erro ao atualizar evento da agenda.");
  return data;
}

export async function deleteAgendaEvent(eventId) {
  const { error } = await getClient().from("agenda_eventos").delete().eq("id", eventId);
  if (error) throw ensureError(error, "Erro ao excluir evento da agenda.");
}

// --- Senhas (Passwords)
export async function getSenhas() {
  const { data, error } = await getClient().from("senhas").select("*").order("criado_em", { ascending: false });
  if (error) throw ensureError(error, "Erro ao carregar senhas.");
  return data ?? [];
}

export async function createSenha(payload) {
  const row = { titulo: payload.titulo, usuario: payload.usuario || null, senha: payload.senha, descricao: payload.descricao || null };
  const { data, error } = await getClient().from("senhas").insert(row).select("*").single();
  if (error) throw ensureError(error, "Erro ao criar senha.");
  return data;
}

export async function deleteSenha(id) {
  const { error } = await getClient().from("senhas").delete().eq("id", id);
  if (error) throw ensureError(error, "Erro ao deletar senha.");
}

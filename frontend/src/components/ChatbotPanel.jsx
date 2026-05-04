import { useEffect, useRef, useState } from "react";

const CHAT_WEBHOOK_URL = import.meta.env.VITE_CHATBOT_WEBHOOK || null;

function createMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content
  };
}

function extractReply(payload) {
  if (payload == null) {
    return "";
  }

  if (typeof payload === "string") {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => extractReply(item)).filter(Boolean).join("\n");
  }

  if (typeof payload === "object") {
    const keys = ["reply", "response", "message", "text", "output", "answer", "content"];

    for (const key of keys) {
      const value = extractReply(payload[key]);
      if (value) {
        return value;
      }
    }

    if (payload.data) {
      const value = extractReply(payload.data);
      if (value) {
        return value;
      }
    }

    return JSON.stringify(payload, null, 2);
  }

  return String(payload);
}

async function readResponse(response) {
  const text = await response.text();

  if (!text) {
    return "";
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return extractReply(JSON.parse(text)) || text;
    } catch {
      return text;
    }
  }

  const trimmed = text.trim();
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      return extractReply(JSON.parse(trimmed)) || text;
    } catch {
      return text;
    }
  }

  return text;
}

function ChatbotPanel() {
  const [messages, setMessages] = useState(() => [
    createMessage("assistant", "Digite uma mensagem para conversar com o chatbot do n8n.")
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmed = inputValue.trim();
    if (!trimmed || isSending) {
      return;
    }

    if (!CHAT_WEBHOOK_URL) {
      setError("Chatbot desabilitado: nenhum webhook configurado.");
      setMessages((previous) => [
        ...previous,
        createMessage("assistant", "Chatbot está desabilitado no momento.")
      ]);
      return;
    }

    setError("");
    setMessages((previous) => [...previous, createMessage("user", trimmed)]);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await fetch(CHAT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*"
        },
        body: JSON.stringify({
          sessionId: `usuario-${Date.now()}`,
          chatInput: trimmed
        })
      });

      const reply = await readResponse(response);

      if (!response.ok) {
        throw new Error(reply || `Erro HTTP ${response.status}`);
      }

      setMessages((previous) => [
        ...previous,
        createMessage("assistant", reply || "O webhook respondeu sem texto.")
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Nao foi possivel conectar ao chatbot."
      );
      setMessages((previous) => [
        ...previous,
        createMessage(
          "assistant",
          "Nao consegui obter resposta do chatbot agora. Verifique o webhook e tente novamente."
        )
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="chatbot-panel">
      <div className="chatbot-panel__header">
        <div>
          <span className="agenda-hero__eyebrow">Chat IA</span>
          <h2>Chatbot do n8n</h2>
          <p>O chat fica à direita e conversa com o webhook configurado via POST.</p>
        </div>

        <span className={`agenda-pill ${isSending ? "agenda-pill--accent" : ""}`}>
          {isSending ? "Enviando" : "Pronto"}
        </span>
      </div>

      <div className="chatbot-panel__messages" aria-live="polite" aria-label="Conversa do chatbot">
        {messages.map((message) => (
          <article key={message.id} className={`chatbot-message chatbot-message--${message.role}`}>
            <span className="chatbot-message__label">
              {message.role === "user" ? "Você" : "IA"}
            </span>
            <p>{message.content}</p>
          </article>
        ))}
        <div ref={endRef} />
      </div>

      <form className="chatbot-form" onSubmit={handleSubmit}>
        <label className="chatbot-form__field">
          <span>Mensagem</span>
          <textarea
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Escreva aqui..."
            rows={4}
            disabled={isSending}
          />
        </label>

        <div className="chatbot-form__actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!inputValue.trim() || isSending}
          >
            {isSending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>

      {error && <p className="feedback feedback--error">{error}</p>}
    </section>
  );
}

export default ChatbotPanel;
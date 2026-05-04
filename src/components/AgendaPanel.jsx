const DEFAULT_GOOGLE_CALENDAR_EMBED_URL =
  import.meta.env.VITE_GOOGLE_CALENDAR_EMBED_URL ||
  "https://calendar.google.com/calendar/embed?src=reuniao.magnicred%40gmail.com&ctz=America%2FSao_Paulo";

function AgendaPanel({ title = "Google Calendar", embedUrl = DEFAULT_GOOGLE_CALENDAR_EMBED_URL }) {
  return (
    <section className="agenda-shell">
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
          padding: "1rem"
        }}
      >
        <iframe
          src={embedUrl}
          title={title}
          style={{
            width: "100%",
            height: "80vh",
            minHeight: "600px",
            border: 0,
            borderRadius: "14px",
            display: "block"
          }}
          frameBorder="0"
          scrolling="no"
        />
      </div>
    </section>
  );
}

export default AgendaPanel;

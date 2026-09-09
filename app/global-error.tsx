"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#f7f8fa",
          color: "#0a0a0b",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Something broke.</p>
          <p style={{ fontSize: 13.5, color: "#6b6f79", marginTop: 8, lineHeight: 1.6 }}>
            The app hit an error it could not recover from. Your data is stored locally in
            this browser and has not been lost.
          </p>
          {error.digest && (
            <p style={{ fontSize: 11, color: "#9aa0aa", marginTop: 10 }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: 18,
              height: 40,
              padding: "0 18px",
              borderRadius: 10,
              border: "none",
              background: "#0a0a0b",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

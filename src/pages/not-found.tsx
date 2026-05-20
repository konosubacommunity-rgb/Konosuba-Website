import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div style={{ minHeight: "100vh", background: "#080812", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins', sans-serif", color: "#fff", textAlign: "center", padding: "2rem" }}>
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🗡️</div>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: ".5rem" }}>404 — Page Not Found</h1>
      <p style={{ color: "#546e7a", marginBottom: "2rem" }}>This dungeon doesn't exist. Head back to safety.</p>
      <button
        onClick={() => setLocation("/")}
        style={{ background: "linear-gradient(135deg,#4fc3f7,#0288d1)", border: "none", color: "#000", padding: ".75rem 2rem", borderRadius: "50px", fontWeight: 700, fontSize: "1rem", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
      >
        ← Back Home
      </button>
    </div>
  );
}

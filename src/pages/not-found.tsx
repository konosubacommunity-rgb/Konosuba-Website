import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ fontSize: "6rem", fontWeight: 900, background: "linear-gradient(135deg, #00d9ff, #7040c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>404</div>
      <p style={{ color: "#a0a0c0", fontSize: "1.1rem" }}>This page doesn't exist</p>
      <button onClick={() => setLocation("/")} style={{ background: "linear-gradient(135deg, #00d9ff, #00b8cc)", color: "#000", border: "none", padding: "0.8rem 2rem", borderRadius: "50px", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
        Go Home
      </button>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { apiLogin, apiSignup, setSession } from "@/lib/api";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("NG");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanPhone = phone.trim().replace(/[\s+\-()]/g, "");

    if (!cleanPhone || !password) { setError("❌ Please fill in all required fields"); return; }
    if (cleanPhone.length < 10) { setError("❌ Phone number must include country code (e.g. 2348012345678)"); return; }
    if (isSignup && !username.trim()) { setError("❌ Please choose a username"); return; }

    setLoading(true);
    try {
      let data;
      if (isSignup) {
        data = await apiSignup(cleanPhone, username.trim(), password, country || "NG");
        setSession(data.token, { phone: cleanPhone, username: data.user.username });
        setSuccess("✅ Account created! Welcome bonus $43,000 added. Redirecting...");
      } else {
        data = await apiLogin(cleanPhone, password);
        setSession(data.token, { phone: cleanPhone, username: data.user.username });
        setSuccess("✅ Logged in! Redirecting to your dashboard...");
      }
      setTimeout(() => setLocation("/dashboard"), 1400);
    } catch (err: unknown) {
      setError("❌ " + (err instanceof Error ? err.message : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    setIsSignup(!isSignup);
    setError("");
    setSuccess("");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", flexDirection: "column", gap: "1.5rem" }}>
      <style>{`
        .auth-wrap {
          background: linear-gradient(135deg, rgba(112,64,192,0.1) 0%, rgba(0,217,255,0.05) 100%);
          border: 1px solid rgba(0,217,255,0.2);
          border-radius: 20px;
          padding: 3rem;
          width: 100%;
          max-width: 460px;
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 60px rgba(0,217,255,0.12);
          animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }

        .logo-section { text-align:center; margin-bottom:2rem; }
        .logo-icon { font-size:3.5rem; margin-bottom:0.5rem; filter:drop-shadow(0 0 15px rgba(0,217,255,0.6)); }
        .logo-section h1 {
          font-size:1.8rem; font-weight:900;
          background:linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          margin-bottom:0.3rem;
        }
        .logo-section p { color:var(--text-secondary); font-size:0.92rem; }

        .sync-banner {
          background: rgba(0,217,255,0.07);
          border: 1px solid rgba(0,217,255,0.2);
          border-radius: 10px;
          padding: 0.8rem 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: flex;
          gap: 0.6rem;
          align-items: flex-start;
          line-height: 1.5;
        }
        .sync-banner .sync-icon { flex-shrink:0; font-size:1rem; margin-top:1px; }

        .form-group { margin-bottom:1.4rem; }
        label { display:block; margin-bottom:0.45rem; color:var(--text-secondary); font-weight:600; font-size:0.9rem; }
        .auth-input {
          width:100%; padding:0.9rem 1rem;
          background:rgba(0,217,255,0.07);
          border:1px solid rgba(0,217,255,0.2);
          border-radius:12px;
          color:var(--text-primary);
          font-size:1rem;
          transition:all 0.25s;
        }
        .auth-input::placeholder { color:rgba(216,192,248,0.45); }
        .auth-input:focus { outline:none; background:rgba(0,217,255,0.13); border-color:rgba(0,217,255,0.45); box-shadow:0 0 18px rgba(0,217,255,0.18); }
        .form-hint { font-size:0.8rem; color:rgba(216,192,248,0.6); margin-top:0.4rem; }

        .phone-highlight {
          border-color: rgba(0,217,255,0.5) !important;
          background: rgba(0,217,255,0.1) !important;
        }

        .submit-btn {
          width:100%; padding:0.95rem;
          background:linear-gradient(135deg, var(--cyan), #00b8cc);
          color:#000; border:none; border-radius:12px;
          font-weight:700; font-size:1.05rem; cursor:pointer;
          transition:all 0.25s;
          box-shadow:0 10px 28px rgba(0,217,255,0.35);
          margin-bottom:1rem;
        }
        .submit-btn:hover:not(:disabled) { transform:translateY(-3px); box-shadow:0 15px 38px rgba(0,217,255,0.55); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

        .divider { display:flex; align-items:center; margin:1.2rem 0; color:var(--text-secondary); font-size:0.85rem; }
        .divider::before,.divider::after { content:''; flex:1; height:1px; background:var(--border); }
        .divider::before { margin-right:0.9rem; }
        .divider::after { margin-left:0.9rem; }

        .toggle-wrap { text-align:center; }
        .toggle-btn { background:none; border:none; color:var(--cyan); cursor:pointer; text-decoration:underline; font-size:0.88rem; }
        .toggle-btn:hover { color:#00b8cc; }

        .back-link { display:block; text-align:center; color:var(--text-secondary); font-size:0.88rem; cursor:pointer; margin-top:0.9rem; }
        .back-link:hover { color:var(--cyan); }

        .msg { padding:0.75rem 0.9rem; border-radius:9px; margin-bottom:1rem; font-size:0.88rem; }
        .msg-err  { background:rgba(255,107,107,0.1); border:1px solid rgba(255,107,107,0.3); color:#ff9999; }
        .msg-ok   { background:rgba(0,212,127,0.1);  border:1px solid rgba(0,212,127,0.3);  color:#66ffcc; }

        .spin { display:inline-block; width:14px; height:14px; border:2px solid rgba(0,0,0,0.25); border-top-color:#000; border-radius:50%; animation:spin 0.7s linear infinite; margin-right:0.4rem; vertical-align:middle; }
        @keyframes spin { to { transform:rotate(360deg); } }

        @media (max-width:480px) {
          .auth-wrap { padding:2rem 1.4rem; }
          .logo-section h1 { font-size:1.5rem; }
        }
      `}</style>

      <div className="auth-wrap">
        <div className="logo-section">
          <div className="logo-icon">🧿</div>
          <h1>Aqua Bot</h1>
          <p>{isSignup ? "Create your account" : "Sign in to your account"}</p>
        </div>

        {/* Sync explainer */}
        <div className="sync-banner">
          <span className="sync-icon">📱</span>
          <span>
            {isSignup
              ? "Use your WhatsApp number to register. Everything you do on the bot — wallet, XP, level — instantly appears here."
              : "Sign in with the WhatsApp number you registered with. Your bot data syncs live to this dashboard."}
          </span>
        </div>

        {error   && <div className="msg msg-err"  data-testid="error-message">{error}</div>}
        {success && <div className="msg msg-ok"   data-testid="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">📱 WhatsApp Number <span style={{ color: "var(--cyan)" }}>*</span></label>
            <input
              className={`auth-input${phone.trim().length > 8 ? " phone-highlight" : ""}`}
              id="phone"
              type="tel"
              placeholder="e.g. 2348012345678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              data-testid="input-phone"
              autoComplete="tel"
              required
            />
            <div className="form-hint">Country code + number, no spaces or + (e.g. 234 for Nigeria)</div>
          </div>

          {/* Username — signup only */}
          {isSignup && (
            <div className="form-group">
              <label htmlFor="username">👤 Username</label>
              <input
                className="auth-input"
                id="username"
                type="text"
                placeholder="Choose your display name"
                value={username}
                onChange={e => setUsername(e.target.value)}
                data-testid="input-username"
                autoComplete="username"
              />
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">🔑 Password</label>
            <input
              className="auth-input"
              id="password"
              type="password"
              placeholder={isSignup ? "Create a password" : "Enter your password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              data-testid="input-password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
            />
          </div>

          {/* Country — signup only */}
          {isSignup && (
            <div className="form-group">
              <label htmlFor="country">🌍 Country Code</label>
              <input
                className="auth-input"
                id="country"
                type="text"
                placeholder="NG, US, UK, GH…"
                value={country}
                onChange={e => setCountry(e.target.value.toUpperCase())}
                data-testid="input-country"
                maxLength={3}
              />
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading} data-testid="button-submit">
            {loading
              ? <><span className="spin" />Processing…</>
              : isSignup ? "🎉 Create Account" : "Sign In →"}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="toggle-wrap">
          <button className="toggle-btn" onClick={toggle} data-testid="button-toggle-mode">
            {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>

        <span className="back-link" onClick={() => setLocation("/")} data-testid="link-home">
          ← Back to Home
        </span>
      </div>
    </div>
  );
}

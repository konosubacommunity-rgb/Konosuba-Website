import { useState } from "react";
import { useLocation } from "wouter";
import { Phone, Lock, User, Globe, Eye, EyeOff, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { apiLogin, apiSignup, setSession } from "@/lib/api";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isSignup, setIsSignup] = useState(false);
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("NG");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (isSignup) {
        const res = await apiSignup(phone.replace(/\D/g, ''), username, password, country);
        setSession(res.token, { phone: phone.replace(/\D/g, ''), username: res.user?.username || username });
        setSuccess("Account created! Redirecting…");
        setTimeout(() => setLocation("/dashboard"), 1000);
      } else {
        const res = await apiLogin(phone.replace(/\D/g, ''), password);
        setSession(res.token, { phone: phone.replace(/\D/g, ''), username: res.user?.username || phone });
        setSuccess("Logged in! Redirecting…");
        setTimeout(() => setLocation("/dashboard"), 800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080812", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      <style>{`
        .auth-glow { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .auth-card { width: 100%; max-width: 420px; background: rgba(14,14,28,.9); border: 1px solid rgba(79,195,247,.12); border-radius: 24px; padding: 2.2rem 2rem; position: relative; z-index: 2; box-shadow: 0 24px 64px rgba(0,0,0,.5); }
        .auth-logo { display: flex; align-items: center; gap: .65rem; margin-bottom: 2rem; cursor: pointer; }
        .auth-logo-img { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; border: 2px solid rgba(79,195,247,.4); }
        .auth-logo-name { font-weight: 900; font-size: 1rem; color: #fff; }
        .auth-title { font-size: 1.45rem; font-weight: 900; margin-bottom: .35rem; }
        .auth-sub { color: #455a64; font-size: .83rem; margin-bottom: 1.8rem; line-height: 1.6; }
        .form-group { margin-bottom: 1rem; }
        .form-label { font-size: .73rem; font-weight: 700; color: #546e7a; margin-bottom: .4rem; display: flex; align-items: center; gap: .3rem; text-transform: uppercase; letter-spacing: .04em; }
        .form-input-wrap { position: relative; }
        .form-icon { position: absolute; left: .85rem; top: 50%; transform: translateY(-50%); color: #37474f; pointer-events: none; }
        .form-input { width: 100%; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 12px; padding: .75rem .85rem .75rem 2.5rem; color: #fff; font-size: .88rem; font-family: 'Poppins', sans-serif; outline: none; transition: border-color .2s, box-shadow .2s; }
        .form-input:focus { border-color: rgba(79,195,247,.4); box-shadow: 0 0 0 3px rgba(79,195,247,.07); }
        .form-input::placeholder { color: #37474f; }
        .form-hint { font-size: .68rem; color: #37474f; margin-top: .3rem; padding-left: .2rem; }
        .pass-eye { position: absolute; right: .75rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #455a64; cursor: pointer; padding: .2rem; display: flex; align-items: center; }
        .submit-btn { width: 100%; background: linear-gradient(135deg,#4fc3f7,#0288d1); color: #000; border: none; border-radius: 14px; padding: .9rem; font-weight: 800; font-size: .95rem; cursor: pointer; font-family: 'Poppins', sans-serif; margin-top: .5rem; display: flex; align-items: center; justify-content: center; gap: .5rem; box-shadow: 0 8px 24px rgba(79,195,247,.25); transition: all .25s; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(79,195,247,.4); }
        .submit-btn:disabled { opacity: .65; cursor: not-allowed; }
        .divider { text-align: center; color: #37474f; font-size: .78rem; margin: 1.1rem 0; position: relative; }
        .divider::before, .divider::after { content: ''; position: absolute; top: 50%; width: 42%; height: 1px; background: rgba(255,255,255,.06); }
        .divider::before { left: 0; } .divider::after { right: 0; }
        .toggle-link { background: none; border: none; color: #4fc3f7; font-size: .83rem; cursor: pointer; font-family: 'Poppins', sans-serif; font-weight: 500; }
        .toggle-link:hover { text-decoration: underline; }
        .back-link { display: flex; align-items: center; gap: .35rem; color: #455a64; font-size: .78rem; cursor: pointer; margin-top: 1.1rem; justify-content: center; transition: color .2s; }
        .back-link:hover { color: #4fc3f7; }
        .msg { padding: .65rem .9rem; border-radius: 10px; font-size: .8rem; font-weight: 500; margin-bottom: .9rem; display: flex; align-items: center; gap: .45rem; }
        .msg-err { background: rgba(239,83,80,.08); border: 1px solid rgba(239,83,80,.22); color: #ef5350; }
        .msg-ok { background: rgba(165,214,167,.08); border: 1px solid rgba(165,214,167,.22); color: #a5d6a7; }
        .wa-notice { background: rgba(165,214,167,.05); border: 1px solid rgba(165,214,167,.15); border-radius: 12px; padding: .75rem 1rem; font-size: .76rem; color: #78909c; line-height: 1.6; margin-bottom: 1.5rem; }
        .wa-notice strong { color: #a5d6a7; }
      `}</style>

      <div className="auth-glow" style={{ width: 400, height: 400, background: "rgba(79,195,247,.06)", top: -100, right: -100 }} />
      <div className="auth-glow" style={{ width: 300, height: 300, background: "rgba(255,213,79,.04)", bottom: -80, left: -80 }} />

      <div className="auth-card">
        <div className="auth-logo" onClick={() => setLocation("/")}>
          <img className="auth-logo-img" src="https://cdn.myanimelist.net/images/characters/14/282523.jpg" alt="Aqua" />
          <span className="auth-logo-name">Konosuba Bot</span>
        </div>

        <h2 className="auth-title">{isSignup ? "Create Account" : "Welcome Back"}</h2>
        <p className="auth-sub">{isSignup ? "Register with your WhatsApp number to link your bot data." : "Sign in to view your dashboard, stats and progress."}</p>

        <div className="wa-notice">
          <strong>🔗 WhatsApp Sync</strong> — Use the same phone number you registered with on the bot. Your account will automatically sync across WhatsApp and web.
        </div>

        {error && <div className="msg msg-err">❌ {error}</div>}
        {success && <div className="msg msg-ok">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="form-label"><Phone size={11} /> WhatsApp Number</div>
            <div className="form-input-wrap">
              <Phone size={14} className="form-icon" />
              <input className="form-input" type="tel" placeholder="e.g. 2348012345678" value={phone} onChange={e => setPhone(e.target.value)} required autoComplete="tel" />
            </div>
            <div className="form-hint">Country code + number, no + or spaces (234 = Nigeria)</div>
          </div>

          {isSignup && (
            <div className="form-group">
              <div className="form-label"><User size={11} /> Username</div>
              <div className="form-input-wrap">
                <User size={14} className="form-icon" />
                <input className="form-input" type="text" placeholder="Your display name" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
              </div>
            </div>
          )}

          <div className="form-group">
            <div className="form-label"><Lock size={11} /> Password</div>
            <div className="form-input-wrap">
              <Lock size={14} className="form-icon" />
              <input
                className="form-input" type={showPass ? "text" : "password"}
                style={{ paddingRight: "2.8rem" }}
                placeholder={isSignup ? "Create a password" : "Enter your password"}
                value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete={isSignup ? "new-password" : "current-password"}
              />
              <button type="button" className="pass-eye" onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {isSignup && (
            <div className="form-group">
              <div className="form-label"><Globe size={11} /> Country Code</div>
              <div className="form-input-wrap">
                <Globe size={14} className="form-icon" />
                <input className="form-input" type="text" placeholder="NG, US, GH, UK…" value={country} onChange={e => setCountry(e.target.value.toUpperCase())} maxLength={3} />
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading
              ? <><Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} /> Processing…</>
              : isSignup ? <><Sparkles size={15} /> Create Account</> : "Sign In →"}
          </button>
        </form>

        <div className="divider">or</div>
        <div style={{ textAlign: "center" }}>
          <button className="toggle-link" onClick={() => { setIsSignup(s => !s); setError(""); setSuccess(""); }}>
            {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
        <div className="back-link" onClick={() => setLocation("/")}>
          <ArrowLeft size={13} /> Back to Home
        </div>
      </div>
    </div>
  );
      }

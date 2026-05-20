import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { getCurrentUser, clearSession, formatMoney, formatTime, apiGetUser, apiGetActivities } from "@/lib/api";

interface UserData {
  username: string;
  phone: string;
  wallet: number;
  bank: number;
  level: number;
  xp: number;
  streak: number;
  registered: boolean;
  accNo?: string;
  createdAt?: string;
}

interface Activity {
  icon?: string;
  title?: string;
  desc?: string;
  type?: string;
  timestamp: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [syncState, setSyncState] = useState<"loading" | "live" | "error">("loading");
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const currentUser = getCurrentUser();

  const loadData = useCallback(async () => {
    if (!currentUser) { setLocation("/auth"); return; }
    try {
      const [user, actData] = await Promise.all([
        apiGetUser(currentUser.phone),
        apiGetActivities(currentUser.phone),
      ]);
      setUserData({ ...user, phone: currentUser.phone });
      setActivities(actData.activities || []);
      setSyncState("live");
      setLastSync(new Date());
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "unauthorized") {
        clearSession();
        setLocation("/auth");
      } else {
        setSyncState("error");
      }
    }
  }, [currentUser, setLocation]);

  useEffect(() => {
    if (!getCurrentUser()) { setLocation("/auth"); return; }
    loadData();
    const iv = setInterval(loadData, 3000);
    return () => clearInterval(iv);
  }, [loadData, setLocation]);

  function logout() {
    clearSession();
    setLocation("/auth");
  }

  const netWorth = userData ? (userData.wallet || 0) + (userData.bank || 0) : 0;
  const xpPct    = userData ? Math.min(100, Math.round((userData.xp / (userData.level * 100)) * 100)) : 0;

  return (
    <div>
      <style>{`
        .dc { max-width:920px; margin:0 auto; padding:2rem; }

        /* ── header ── */
        .dh {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:2rem; padding-bottom:1.4rem;
          border-bottom:1px solid var(--border);
          flex-wrap:wrap; gap:1rem;
        }
        .dh-logo { display:flex; align-items:center; gap:0.5rem; font-weight:900; font-size:1.35rem; }
        .dh-right { display:flex; gap:0.8rem; align-items:center; flex-wrap:wrap; }

        .sync-pill {
          display:flex; align-items:center; gap:0.5rem;
          font-size:0.8rem; color:var(--text-secondary);
          background:rgba(0,217,255,0.07);
          padding:0.35rem 0.8rem; border-radius:20px;
          border:1px solid rgba(0,217,255,0.15);
        }
        .dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
        .dot-live    { background:#00d47e; box-shadow:0 0 6px #00d47e; }
        .dot-loading { background:var(--cyan); animation:blink 1.2s ease-in-out infinite; }
        .dot-error   { background:#ff6b6b; }
        @keyframes blink { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

        .logout-btn {
          background:rgba(255,80,80,0.1); border:1px solid rgba(255,80,80,0.3);
          color:#ff9999; padding:0.4rem 1rem; border-radius:8px;
          cursor:pointer; font-weight:600; font-size:0.85rem; transition:all 0.25s;
        }
        .logout-btn:hover { background:rgba(255,80,80,0.2); }

        /* ── sync banner (only shown when not registered on website) ── */
        .reg-banner {
          background:linear-gradient(135deg,rgba(0,217,255,0.08),rgba(112,64,192,0.08));
          border:1px solid rgba(0,217,255,0.25);
          border-radius:14px; padding:1.2rem 1.4rem;
          margin-bottom:1.5rem;
          display:flex; gap:1rem; align-items:center;
        }
        .reg-banner-text { flex:1; font-size:0.9rem; color:var(--text-secondary); line-height:1.5; }
        .reg-banner-text strong { color:var(--cyan); }
        .reg-banner-btn {
          background:linear-gradient(135deg,var(--cyan),#00b8cc);
          color:#000; border:none; padding:0.55rem 1.1rem;
          border-radius:9px; font-weight:700; font-size:0.85rem;
          cursor:pointer; white-space:nowrap; flex-shrink:0;
        }

        /* ── profile card ── */
        .prof {
          background:linear-gradient(135deg,rgba(112,64,192,0.14),rgba(0,217,255,0.07));
          border:1px solid rgba(0,217,255,0.2);
          border-radius:18px; padding:2rem; text-align:center;
          margin-bottom:1.5rem; position:relative;
        }
        .prof-av {
          width:76px; height:76px; border-radius:50%;
          background:linear-gradient(135deg,var(--primary),var(--cyan));
          display:flex; align-items:center; justify-content:center;
          font-size:2.3rem; margin:0 auto 1rem;
          box-shadow:0 0 28px rgba(0,217,255,0.25);
        }
        .prof-name { font-size:1.4rem; font-weight:700; margin-bottom:0.25rem; }
        .prof-sub  { color:var(--text-secondary); font-size:0.88rem; margin-bottom:0.6rem; }

        .badges { display:flex; gap:0.5rem; justify-content:center; flex-wrap:wrap; margin-top:0.5rem; }
        .badge {
          font-size:0.75rem; padding:0.25rem 0.65rem; border-radius:20px;
          font-weight:600; border:1px solid;
        }
        .badge-green  { color:#66ffcc; border-color:rgba(102,255,204,0.35); background:rgba(102,255,204,0.08); }
        .badge-purple { color:#c0a0f0; border-color:rgba(192,160,240,0.35); background:rgba(192,160,240,0.08); }
        .badge-blue   { color:var(--cyan); border-color:rgba(0,217,255,0.35); background:rgba(0,217,255,0.08); }

        /* ── XP bar ── */
        .xp-bar-wrap { margin-top:1rem; }
        .xp-bar-label { display:flex; justify-content:space-between; font-size:0.78rem; color:var(--text-secondary); margin-bottom:0.35rem; }
        .xp-bar-track { height:7px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden; }
        .xp-bar-fill  { height:100%; border-radius:4px; background:linear-gradient(90deg,var(--primary),var(--cyan)); transition:width 0.6s ease; }

        /* ── stats grid ── */
        .sg { display:grid; grid-template-columns:repeat(auto-fit,minmax(138px,1fr)); gap:1rem; margin-bottom:1.5rem; }
        .sc {
          background:linear-gradient(135deg,rgba(112,64,192,0.11),rgba(0,217,255,0.05));
          border:1px solid rgba(0,217,255,0.13); border-radius:13px;
          padding:1.1rem; text-align:center; transition:all 0.25s;
        }
        .sc:hover { transform:translateY(-3px); border-color:rgba(0,217,255,0.28); }
        .sc-label { color:var(--text-secondary); font-size:0.8rem; margin-bottom:0.45rem; }
        .sc-val   { font-size:1.35rem; font-weight:700; color:var(--cyan); }

        /* ── activity log ── */
        .sec-title { font-size:0.95rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.8rem; }
        .alist {
          background:rgba(5,2,16,0.5); border:1px solid var(--border);
          border-radius:13px; overflow:hidden; max-height:420px; overflow-y:auto;
        }
        .alist::-webkit-scrollbar { width:4px; }
        .alist::-webkit-scrollbar-thumb { background:rgba(0,217,255,0.25); border-radius:2px; }
        .aitem {
          display:flex; gap:0.9rem; align-items:flex-start;
          padding:0.9rem 1.1rem; border-bottom:1px solid rgba(112,64,192,0.13);
          transition:background 0.2s;
        }
        .aitem:last-child { border-bottom:none; }
        .aitem:hover { background:rgba(0,217,255,0.035); }
        .aicon { font-size:1.4rem; flex-shrink:0; }
        .atitle { font-weight:600; font-size:0.9rem; margin-bottom:0.18rem; }
        .adesc  { color:var(--text-secondary); font-size:0.82rem; margin-bottom:0.2rem; }
        .atime  { color:rgba(216,192,248,0.45); font-size:0.75rem; }
        .empty  { padding:2.5rem; text-align:center; color:var(--text-secondary); font-size:0.9rem; }

        .skel { background:linear-gradient(90deg,rgba(112,64,192,0.1) 25%,rgba(0,217,255,0.07) 50%,rgba(112,64,192,0.1) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:6px; display:inline-block; }
        @keyframes shimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }

        .last-sync { font-size:0.72rem; color:rgba(216,192,248,0.4); }

        @media(max-width:600px){
          .dc { padding:1rem; }
          .dh { flex-direction:column; align-items:flex-start; }
          .sg { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <div className="dc">

        {/* ── Header ── */}
        <div className="dh">
          <div className="dh-logo"><span>🧿</span><span>Aqua Bot</span></div>
          <div className="dh-right">
            <div className="sync-pill" data-testid="status-sync">
              <div className={`dot ${syncState === "live" ? "dot-live" : syncState === "error" ? "dot-error" : "dot-loading"}`} />
              <span>
                {syncState === "live"
                  ? lastSync ? `Synced ${formatTime(lastSync)}` : "Live"
                  : syncState === "error" ? "Sync failed" : "Syncing…"}
              </span>
            </div>
            <button className="logout-btn" onClick={logout} data-testid="button-logout">Logout</button>
          </div>
        </div>

        {/* ── Unregistered nudge ── */}
        {userData && !userData.registered && (
          <div className="reg-banner">
            <span style={{ fontSize: "1.6rem" }}>🔗</span>
            <div className="reg-banner-text">
              <strong>Link your WhatsApp account</strong> — type <strong>.reg</strong> in the bot to get your registration link, or sign up with your WhatsApp number below.
            </div>
            <button className="reg-banner-btn" onClick={() => setLocation("/auth")}>Register Now</button>
          </div>
        )}

        {/* ── Profile card ── */}
        <div className="prof">
          <div className="prof-av">👤</div>
          <div className="prof-name" data-testid="text-username">
            {userData
              ? userData.username || currentUser?.username || "User"
              : <span className="skel" style={{ width: 120, height: 22 }} />}
          </div>
          <div className="prof-sub" data-testid="text-phone">
            {currentUser ? `📱 +${currentUser.phone}` : ""}
          </div>

          <div className="badges">
            {userData?.registered
              ? <span className="badge badge-green">✅ WhatsApp Linked</span>
              : <span className="badge badge-purple">⚠️ Not Linked</span>}
            {userData && <span className="badge badge-blue">⭐ Level {userData.level}</span>}
            {userData?.accNo && <span className="badge badge-purple">🔑 #{userData.accNo}</span>}
          </div>

          {/* XP progress */}
          {userData && (
            <div className="xp-bar-wrap">
              <div className="xp-bar-label">
                <span>⚡ XP Progress</span>
                <span>{userData.xp} / {userData.level * 100}</span>
              </div>
              <div className="xp-bar-track">
                <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Stats grid ── */}
        <div className="sg">
          {[
            { label: "💰 Wallet",    id: "wallet",   val: userData ? formatMoney(userData.wallet)  : null },
            { label: "🏦 Bank",      id: "bank",     val: userData ? formatMoney(userData.bank)    : null },
            { label: "⭐ Level",     id: "level",    val: userData ? String(userData.level)        : null },
            { label: "⚡ XP",        id: "xp",       val: userData ? `${userData.xp}/${userData.level * 100}` : null },
            { label: "🔥 Streak",    id: "streak",   val: userData ? String(userData.streak)       : null },
            { label: "💎 Net Worth", id: "networth", val: userData ? formatMoney(netWorth)          : null },
          ].map(s => (
            <div className="sc" key={s.id}>
              <div className="sc-label">{s.label}</div>
              <div className="sc-val" data-testid={`text-${s.id}`}>
                {s.val !== null ? s.val : <span className="skel" style={{ width: 56, height: 20 }} />}
              </div>
            </div>
          ))}
        </div>

        {/* ── Activity log ── */}
        <div className="sec-title">📊 Recent Activity</div>
        <div className="alist" data-testid="list-activities">
          {activities.length === 0 ? (
            <div className="empty">
              No activities yet.<br />
              <span style={{ fontSize: "0.82rem" }}>Go play on WhatsApp — your wallet, XP and events will appear here in real time.</span>
            </div>
          ) : (
            [...activities].reverse().map((a, i) => (
              <div className="aitem" key={i} data-testid={`row-activity-${i}`}>
                <div className="aicon">{a.icon || "📝"}</div>
                <div>
                  <div className="atitle">{a.title || "Activity"}</div>
                  {a.desc && <div className="adesc">{a.desc}</div>}
                  <div className="atime">{formatTime(a.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

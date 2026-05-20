import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  RefreshCw, Bell, LogOut, Wallet, Building2, Star, Zap,
  Flame, Trophy, Award, Edit3, Image, Frame, ArrowLeft,
  Swords, ShoppingBag, Layers, Sparkles
} from "lucide-react";
import {
  getCurrentUser, getToken, clearSession, formatMoney, formatTime,
  apiGetUser, apiGetActivities, apiGetLeaderboard, getJid
} from "@/lib/api";

const TABS = [
  { id: "overview", label: "Overview", icon: <Layers size={13} /> },
  { id: "deck", label: "Deck", icon: <Swords size={13} /> },
  { id: "inventory", label: "Inventory", icon: <ShoppingBag size={13} /> },
  { id: "pokemon", label: "Pokémon", icon: <Sparkles size={13} /> },
];

const ACHIEVEMENTS_DEFAULT = [
  { icon: "🗡️", name: "First Blood", desc: "Win your first battle" },
  { icon: "💰", name: "Rich Kid", desc: "Earn $1,000" },
  { icon: "⭐", name: "Level Up", desc: "Reach level 5" },
  { icon: "🎯", name: "Precision", desc: "Land 10 crits" },
  { icon: "🔥", name: "On Fire", desc: "7-day streak" },
  { icon: "🏆", name: "Champion", desc: "Top 10 leaderboard" },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const currentUser = getCurrentUser();

  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [activities, setActivities] = useState<unknown[]>([]);
  const [leaderboard, setLeaderboard] = useState<unknown[]>([]);
  const [syncState, setSyncState] = useState<"loading" | "live" | "error">("loading");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!currentUser || !getToken()) {
      setLocation("/auth");
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setSyncState("loading");
    try {
      const [user, acts, lb] = await Promise.all([
        apiGetUser(currentUser.phone),
        apiGetActivities(currentUser.phone),
        apiGetLeaderboard(),
      ]);
      if (user) setUserData(user);
      setActivities(acts?.activities || []);
      setLeaderboard(lb?.users || []);
      setSyncState("live");
      setLastSync(new Date().toISOString());
    } catch {
      setSyncState("error");
    }
  }, [currentUser?.phone]);

  useEffect(() => { loadData(); }, [loadData]);

  function logout() { clearSession(); setLocation("/"); }

  if (!currentUser) return null;

  const displayName = (userData?.username as string) || (userData?.name as string) || currentUser.username || currentUser.phone;
  const jid = getJid(currentUser.phone);
  const xpMax = Math.max(1000, Math.ceil(((userData?.level as number) || 1) * 1000 * 1.15));
  const xpPct = Math.min(100, (((userData?.xp as number) || 0) / xpMax) * 100);
  const netWorth = ((userData?.wallet as number) || 0) + ((userData?.bank as number) || 0);
  const avatarUrl = (userData?.avatar as string) || (userData?.profilePic as string) || "";

  return (
    <div style={{ minHeight: "100vh", background: "#080812", fontFamily: "'Poppins', sans-serif", color: "#fff" }}>
      <style>{`
        /* ── NAV ── */
        .dash-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: .75rem 1.3rem; gap: .7rem;
          background: rgba(8,8,18,.92); border-bottom: 1px solid rgba(79,195,247,.1);
          position: sticky; top: 0; z-index: 100; backdrop-filter: blur(20px);
        }
        .dash-logo { display: flex; align-items: center; gap: .55rem; cursor: pointer; }
        .dash-logo-img { width: 32px; height: 32px; border-radius: 9px; object-fit: cover; border: 1.5px solid rgba(79,195,247,.35); }
        .dash-logo-name { font-weight: 900; font-size: .92rem; }
        .dash-nav-right { display: flex; align-items: center; gap: .55rem; }
        .sync-pill { display: flex; align-items: center; gap: .4rem; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 50px; padding: .28rem .75rem; font-size: .7rem; color: #546e7a; }
        .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .dot-live { background: #a5d6a7; box-shadow: 0 0 8px rgba(165,214,167,.6); animation: blink 2s infinite; }
        .dot-error { background: #ef5350; }
        .dot-loading { background: #ffd54f; animation: blink .8s infinite; }
        @keyframes blink { 0%,100%{opacity:.4} 50%{opacity:1} }
        .icon-btn { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); color: #78909c; width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; }
        .icon-btn:hover { border-color: rgba(79,195,247,.25); color: #4fc3f7; }
        .logout-btn { display: flex; align-items: center; gap: .4rem; background: rgba(239,83,80,.07); border: 1px solid rgba(239,83,80,.18); color: #ef5350; padding: .35rem .75rem; border-radius: 9px; font-size: .75rem; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all .2s; }
        .logout-btn:hover { background: rgba(239,83,80,.14); }

        /* ── WRAP ── */
        .dash-wrap { max-width: 520px; margin: 0 auto; padding: 1.2rem 1rem 4rem; }

        /* ── SYNC BANNER ── */
        .sync-banner { background: rgba(79,195,247,.05); border: 1px solid rgba(79,195,247,.15); border-radius: 14px; padding: .75rem 1rem; margin-bottom: 1rem; font-size: .76rem; color: #78909c; display: flex; align-items: flex-start; gap: .6rem; line-height: 1.55; }
        .sync-banner strong { color: #4fc3f7; }

        /* ── PROFILE CARD ── */
        .prof-card {
          border-radius: 22px; overflow: hidden; margin-bottom: 1rem;
          border: 1px solid rgba(255,255,255,.07);
          background: rgba(12,12,24,.8);
          position: relative;
        }
        .prof-cover {
          height: 130px; position: relative;
          background: linear-gradient(135deg, #0a0a1a 0%, #12123a 40%, #0d1a2a 70%, #080812 100%);
          overflow: hidden;
        }
        .prof-cover-stars {
          position: absolute; inset: 0; overflow: hidden;
        }
        .prof-cover-star { position: absolute; border-radius: 50%; background: #fff; animation: twinkle 3s infinite; }
        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:.7} }
        .prof-cover-glow { position: absolute; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(79,195,247,.15), transparent 70%); top: -60px; right: -40px; }
        .prof-cover-glow2 { position: absolute; width: 150px; height: 150px; border-radius: 50%; background: radial-gradient(circle, rgba(255,213,79,.08), transparent 70%); bottom: -50px; left: 20px; }

        /* Avatar ring */
        .prof-av-outer {
          position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%);
          width: 92px; height: 92px; border-radius: 50%;
          background: linear-gradient(135deg, #4fc3f7, #ffd54f, #ce93d8, #4fc3f7);
          padding: 3px; z-index: 2;
          box-shadow: 0 0 24px rgba(79,195,247,.4), 0 0 48px rgba(79,195,247,.2);
        }
        .prof-av-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: #0e0e20; display: flex; align-items: center; justify-content: center;
          font-size: 2.4rem; overflow: hidden; position: relative;
        }
        .prof-av-inner img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .prof-av-badge {
          position: absolute; bottom: -4px; right: -4px; z-index: 3;
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg,#ffd54f,#ff8f00);
          display: flex; align-items: center; justify-content: center;
          font-size: .9rem; border: 2px solid #0e0e20;
          box-shadow: 0 2px 8px rgba(255,213,79,.5);
        }

        .prof-body { padding: 3.2rem 1.2rem 1.4rem; text-align: center; }
        .prof-name { font-size: 1.2rem; font-weight: 900; color: #fff; margin-bottom: .22rem; letter-spacing: -.01em; text-transform: uppercase; }
        .prof-role { color: #546e7a; font-size: .78rem; margin-bottom: .22rem; }
        .prof-phone { color: #37474f; font-size: .72rem; margin-bottom: .15rem; }
        .prof-jid { color: rgba(79,195,247,.4); font-size: .64rem; margin-bottom: .85rem; font-family: monospace; }
        .prof-edit-btns { display: flex; gap: .45rem; justify-content: center; flex-wrap: wrap; margin-bottom: .9rem; }
        .edit-btn { display: flex; align-items: center; gap: .32rem; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09); color: #90a4ae; padding: .4rem .85rem; border-radius: 50px; font-size: .74rem; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all .2s; white-space: nowrap; }
        .edit-btn:hover { background: rgba(79,195,247,.1); border-color: rgba(79,195,247,.25); color: #4fc3f7; }
        .prof-badges { display: flex; gap: .42rem; justify-content: center; flex-wrap: wrap; margin-bottom: .9rem; }
        .badge { font-size: .68rem; padding: .18rem .58rem; border-radius: 50px; font-weight: 600; border: 1px solid; }
        .badge-green { color: #80cbc4; border-color: rgba(128,203,196,.28); background: rgba(128,203,196,.07); }
        .badge-purple { color: #ce93d8; border-color: rgba(206,147,216,.28); background: rgba(206,147,216,.07); }
        .badge-cyan { color: #4fc3f7; border-color: rgba(79,195,247,.28); background: rgba(79,195,247,.07); }
        .badge-gold { color: #ffd54f; border-color: rgba(255,213,79,.28); background: rgba(255,213,79,.07); }

        .xp-wrap { margin: .9rem 0 0; }
        .xp-labels { display: flex; justify-content: space-between; font-size: .7rem; color: #455a64; margin-bottom: .35rem; }
        .xp-track { height: 7px; background: rgba(255,255,255,.05); border-radius: 50px; overflow: hidden; }
        .xp-fill { height: 100%; background: linear-gradient(90deg,#4fc3f7,#ffd54f); border-radius: 50px; transition: width .6s ease; }

        /* ── STATS ── */
        .stats-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: .7rem; margin-bottom: 1rem; }
        .stat-card { display: flex; align-items: center; gap: .8rem; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 16px; padding: .9rem 1rem; transition: all .2s; }
        .stat-card:hover { border-color: rgba(79,195,247,.2); background: rgba(79,195,247,.03); }
        .stat-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .si-wallet { background: rgba(79,195,247,.15); color: #4fc3f7; }
        .si-bank { background: rgba(206,147,216,.15); color: #ce93d8; }
        .si-level { background: rgba(255,213,79,.15); color: #ffd54f; }
        .si-xp { background: rgba(165,214,167,.15); color: #a5d6a7; }
        .si-flame { background: rgba(255,183,77,.15); color: #ffb74d; }
        .si-trophy { background: rgba(239,83,80,.15); color: #ef5350; }
        .stat-val { font-size: clamp(.95rem,2.5vw,1.15rem); font-weight: 800; color: #fff; line-height: 1; }
        .stat-lbl { font-size: .68rem; color: #455a64; margin-top: .1rem; }

        /* ── TABS ── */
        .tabs-wrap { display: flex; gap: .35rem; margin-bottom: 1.1rem; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 50px; padding: .3rem; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .tabs-wrap::-webkit-scrollbar { display: none; }
        .tab-btn { display: flex; align-items: center; gap: .38rem; padding: .48rem .9rem; border-radius: 50px; font-size: .78rem; font-weight: 600; border: none; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all .2s; white-space: nowrap; flex-shrink: 0; min-height: 36px; }
        .tab-inactive { background: transparent; color: #546e7a; }
        .tab-inactive:hover { color: #fff; background: rgba(255,255,255,.06); }
        .tab-active { background: linear-gradient(135deg,#4fc3f7,#0288d1); color: #000; box-shadow: 0 4px 12px rgba(79,195,247,.3); }

        .sec-title { font-size: .75rem; font-weight: 700; color: #37474f; margin-bottom: .75rem; text-transform: uppercase; letter-spacing: .06em; display: flex; align-items: center; gap: .38rem; }

        /* ── ACTIVITY ── */
        .act-list { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.06); border-radius: 16px; overflow: hidden; }
        .act-item { display: flex; gap: .8rem; align-items: flex-start; padding: .85rem 1rem; border-bottom: 1px solid rgba(255,255,255,.04); transition: background .18s; }
        .act-item:last-child { border-bottom: none; }
        .act-item:hover { background: rgba(79,195,247,.02); }
        .act-icon { width: 36px; height: 36px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
        .act-title { font-weight: 600; font-size: .84rem; margin-bottom: .1rem; }
        .act-desc { color: #455a64; font-size: .76rem; }
        .act-time { color: rgba(69,90,100,.55); font-size: .68rem; margin-top: .12rem; }
        .empty-state { padding: 2.5rem; text-align: center; color: #37474f; font-size: .84rem; line-height: 1.7; }

        .skel { background: linear-gradient(90deg,rgba(79,195,247,.08) 25%,rgba(255,255,255,.04) 50%,rgba(79,195,247,.08) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 5px; display: inline-block; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── ACHIEVEMENTS ── */
        .ach-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(140px,1fr)); gap: .65rem; }
        .ach-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,213,79,.12); border-radius: 15px; padding: .9rem; text-align: center; transition: all .2s; }
        .ach-card:hover { border-color: rgba(255,213,79,.3); }
        .ach-icon { font-size: 1.6rem; margin-bottom: .45rem; }
        .ach-name { font-size: .78rem; font-weight: 700; margin-bottom: .18rem; }
        .ach-desc { font-size: .65rem; color: #455a64; }

        /* ── POKEMON TAB ── */
        .poke-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(100px,1fr)); gap: .65rem; }
        .poke-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 15px; padding: .85rem; text-align: center; transition: all .2s; cursor: pointer; }
        .poke-card:hover { border-color: rgba(165,214,167,.25); transform: translateY(-2px); }

        /* ── RESPONSIVE ── */
        @media (max-width: 600px) {
          .dash-wrap { padding: 1rem .85rem 3rem; }
          .sync-pill { display: none; }
          .logout-btn span { display: none; }
          .stat-card { padding: .75rem .8rem; gap: .6rem; }
          .stat-val { font-size: .95rem; }
          .prof-edit-btns { gap: .38rem; }
          .edit-btn { padding: .38rem .7rem; font-size: .7rem; }
        }
        @media (min-width: 700px) {
          .stats-grid { grid-template-columns: repeat(4,1fr); }
        }
      `}</style>

      {/* NAV */}
      <nav className="dash-nav">
        <div className="dash-logo" onClick={() => setLocation("/")}>
          <img className="dash-logo-img" src="https://cdn.myanimelist.net/images/characters/14/282523.jpg" alt="Aqua" />
          <span className="dash-logo-name">Konosuba</span>
        </div>
        <div className="dash-nav-right">
          <div className="sync-pill">
            <div className={`dot ${syncState === "live" ? "dot-live" : syncState === "error" ? "dot-error" : "dot-loading"}`} />
            {syncState === "live" ? (lastSync ? `Synced ${formatTime(lastSync)}` : "Live") : syncState === "error" ? "Sync error" : "Syncing…"}
          </div>
          <button className="icon-btn" onClick={loadData} title="Refresh"><RefreshCw size={14} /></button>
          <button className="icon-btn" title="Notifications"><Bell size={14} /></button>
          <button className="logout-btn" onClick={logout}><LogOut size={12} /><span>Logout</span></button>
        </div>
      </nav>

      <div className="dash-wrap">
        {/* WhatsApp sync info */}
        {userData && !(userData.registered as boolean) && (
          <div className="sync-banner">
            <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>🔗</span>
            <div>
              <strong>Link your WhatsApp</strong> — type <strong>.reg</strong> in the bot to connect your account. Your JID: <code style={{ fontSize: ".68rem", color: "#4fc3f7" }}>{jid}</code>
            </div>
          </div>
        )}

        {/* ── PROFILE CARD ── */}
        <div className="prof-card">
          <div className="prof-cover">
            <div className="prof-cover-stars">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="prof-cover-star" style={{
                  width: Math.random() * 2 + 1 + "px",
                  height: Math.random() * 2 + 1 + "px",
                  left: (i * 5.1) % 100 + "%",
                  top: (i * 7.3) % 100 + "%",
                  animationDelay: (i * 0.15) + "s",
                }} />
              ))}
            </div>
            <div className="prof-cover-glow" />
            <div className="prof-cover-glow2" />
            <div className="prof-av-outer">
              <div className="prof-av-inner">
                {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : "👤"}
                <div className="prof-av-badge">🏅</div>
              </div>
            </div>
          </div>
          <div className="prof-body">
            <div className="prof-name">
              {userData ? displayName.toUpperCase() : <span className="skel" style={{ width: 130, height: 22 }} />}
            </div>
            <div className="prof-role">
              {userData ? `${(userData.rpg as Record<string,unknown>)?.class || "Adventurer"} · Level ${userData.level}` : <span className="skel" style={{ width: 90, height: 14 }} />}
            </div>
            <div className="prof-phone">{currentUser ? `+${currentUser.phone}` : ""}</div>
            <div className="prof-jid">{jid}</div>

            <div className="prof-edit-btns">
              <button className="edit-btn"><Edit3 size={11} /> Edit Avatar</button>
              <button className="edit-btn"><Image size={11} /> Edit Cover</button>
              <button className="edit-btn"><Frame size={11} /> Edit Frame</button>
            </div>

            <div className="prof-badges">
              {(userData?.registered as boolean)
                ? <span className="badge badge-green">✅ WhatsApp Linked</span>
                : <span className="badge badge-purple">⚠️ Not Linked</span>}
              {userData && <span className="badge badge-cyan">⭐ Level {userData.level as number}</span>}
              {(userData?.rpg as Record<string,unknown>)?.prestige && Number((userData?.rpg as Record<string,unknown>).prestige) > 0 && (
                <span className="badge badge-gold">🌟 Prestige {(userData?.rpg as Record<string,unknown>).prestige as number}</span>
              )}
            </div>

            {userData && (
              <div className="xp-wrap">
                <div className="xp-labels">
                  <span><Zap size={10} style={{ display: "inline", marginRight: 3 }} />XP Progress</span>
                  <span>{userData.xp as number} / {xpMax}</span>
                </div>
                <div className="xp-track"><div className="xp-fill" style={{ width: `${xpPct}%` }} /></div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {[
            { icon: <Wallet size={16} />, cls: "si-wallet", label: "Wallet", val: userData ? formatMoney(userData.wallet as number) : null },
            { icon: <Building2 size={16} />, cls: "si-bank", label: "Bank", val: userData ? formatMoney(userData.bank as number) : null },
            { icon: <Star size={16} />, cls: "si-level", label: "Level", val: userData ? String(userData.level) : null },
            { icon: <Zap size={16} />, cls: "si-xp", label: "XP", val: userData ? `${userData.xp}/${xpMax}` : null },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
              <div>
                <div className="stat-val">{s.val ?? <span className="skel" style={{ width: 55, height: 16 }} />}</div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs-wrap">
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? "tab-active" : "tab-inactive"}`} onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <>
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              {[
                { icon: <Flame size={16} />, cls: "si-flame", label: "Streak", val: userData ? `${(userData.streak as number) || 0}d` : null },
                { icon: <Trophy size={16} />, cls: "si-trophy", label: "Net Worth", val: userData ? formatMoney(netWorth) : null },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                  <div>
                    <div className="stat-val">{s.val ?? <span className="skel" style={{ width: 55, height: 16 }} />}</div>
                    <div className="stat-lbl">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sec-title"><Award size={12} /> Achievements</div>
            <div className="ach-grid" style={{ marginBottom: "1.2rem" }}>
              {(Array.isArray(userData?.achievements) && (userData.achievements as unknown[]).length > 0
                ? (userData.achievements as string[]).map((a, i) => ({ icon: ACHIEVEMENTS_DEFAULT[i % ACHIEVEMENTS_DEFAULT.length]?.icon || "🏆", name: a, desc: "Earned in-game" }))
                : ACHIEVEMENTS_DEFAULT
              ).map(a => (
                <div className="ach-card" key={a.name}>
                  <div className="ach-icon">{a.icon}</div>
                  <div className="ach-name">{a.name}</div>
                  <div className="ach-desc">{a.desc}</div>
                </div>
              ))}
            </div>

            <div className="sec-title"><RefreshCw size={12} /> Recent Activity</div>
            <div className="act-list">
              {activities.length === 0 ? (
                <div className="empty-state">No recent activity yet.<br />Start playing on WhatsApp to see your history here.</div>
              ) : (
                (activities as Record<string,unknown>[]).map((a, i) => (
                  <div className="act-item" key={i}>
                    <div className="act-icon" style={{ background: "rgba(79,195,247,.1)" }}>{(a.icon as string) || "⚡"}</div>
                    <div style={{ flex: 1 }}>
                      <div className="act-title">{(a.title as string) || (a.type as string) || "Activity"}</div>
                      <div className="act-desc">{(a.description as string) || ""}</div>
                      <div className="act-time">{a.createdAt ? formatTime(a.createdAt as string) : ""}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── DECK ── */}
        {activeTab === "deck" && (
          <div className="act-list">
            {!(userData?.deck as unknown[])?.length ? (
              <div className="empty-state">No deck found.<br />Play RPG battles on WhatsApp to build your deck.</div>
            ) : (
              (userData?.deck as Record<string,unknown>[]).map((card, i) => (
                <div className="act-item" key={i}>
                  <div className="act-icon" style={{ background: "rgba(239,83,80,.1)" }}>🃏</div>
                  <div>
                    <div className="act-title">{(card.name as string) || "Card"}</div>
                    <div className="act-desc">ATK: {card.attack as number} · DEF: {card.defense as number}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── INVENTORY ── */}
        {activeTab === "inventory" && (
          <div className="act-list">
            {!(userData?.inventory as unknown[])?.length ? (
              <div className="empty-state">No items in inventory.<br />Earn items by playing the bot.</div>
            ) : (
              (userData?.inventory as Record<string,unknown>[]).map((item, i) => (
                <div className="act-item" key={i}>
                  <div className="act-icon" style={{ background: "rgba(255,213,79,.1)" }}>🎒</div>
                  <div>
                    <div className="act-title">{(item.name as string) || "Item"}</div>
                    <div className="act-desc">Qty: {(item.quantity as number) || 1}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── POKEMON ── */}
        {activeTab === "pokemon" && (
          <>
            <div className="sec-title"><Sparkles size={12} /> Your Pokémon</div>
            {!(userData?.pokemon as unknown[])?.length ? (
              <div className="act-list">
                <div className="empty-state">
                  No Pokémon caught yet.<br />Catch them using <strong>.catch</strong> on WhatsApp!<br />
                  <button
                    onClick={() => setLocation("/pokemon")}
                    style={{ marginTop: ".8rem", background: "linear-gradient(135deg,#a5d6a7,#4fc3f7)", border: "none", color: "#000", padding: ".45rem 1.2rem", borderRadius: 50, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
                  >View Pokédex →</button>
                </div>
              </div>
            ) : (
              <div className="poke-grid">
                {(userData?.pokemon as Record<string,unknown>[]).map((p, i) => (
                  <div className="poke-card" key={i} onClick={() => setLocation("/pokemon")}>
                    {(p.sprite as string) && <img src={p.sprite as string} alt={p.name as string} style={{ width: 70, height: 70, objectFit: "contain", margin: "0 auto 6px" }} />}
                    <div style={{ fontSize: ".75rem", fontWeight: 700 }}>{(p.name as string) || "?"}</div>
                    <div style={{ fontSize: ".62rem", color: "#455a64" }}>Lv. {(p.level as number) || "?"}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
                      }

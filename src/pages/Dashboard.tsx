import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
  Wallet, Building2, Zap, Star, Flame, Trophy, LogOut, RefreshCw,
  Edit3, Image, Frame, Sword, Package, Fish, ChevronRight, Bell,
  LayoutGrid, Swords, ScrollText, Activity, Shield, Award, Menu, X
} from "lucide-react";
import { getCurrentUser, clearSession, formatMoney, formatTime, apiGetUser, apiGetActivities } from "@/lib/api";

interface UserData {
  username: string; phone: string;
  wallet: number; bank: number; bankLimit: number;
  level: number; xp: number; streak: number;
  registered: boolean; accNo?: string; country?: string;
  createdAt?: string; updatedAt?: string;
  inventory?: { item: string; qty: number }[];
  pokemon?: { name: string; level: number; nickname?: string; shiny?: boolean }[];
  rpg?: { class: string; hp: number; maxHp: number; attack: number; defense: number; dungeonLevel: number; prestige: number };
  achievements?: string[];
  pet?: { name: string | null; type: string | null; level: number; hunger: number };
}

interface Activity { icon?: string; title?: string; desc?: string; type?: string; timestamp: string; }
type Tab = "overview" | "deck" | "inventory" | "pokemon";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutGrid size={14} /> },
  { id: "deck", label: "Deck", icon: <Swords size={14} /> },
  { id: "inventory", label: "Inventory", icon: <Package size={14} /> },
  { id: "pokemon", label: "Pokémon", icon: <Fish size={14} /> },
];

const ACHIEVEMENTS_DEFAULT = [
  { icon: "👾", name: "First Login", desc: "Joined the community" },
  { icon: "💰", name: "First Wallet", desc: "Earned your first coin" },
  { icon: "⭐", name: "Level 5", desc: "Reached level 5" },
  { icon: "🎰", name: "High Roller", desc: "Won at gambling" },
];

const ACT_COLORS: Record<string, string> = {
  economy: "rgba(79,195,247,0.14)", gambling: "rgba(255,200,0,0.14)",
  rpg: "rgba(200,100,255,0.14)", pokemon: "rgba(255,100,100,0.14)",
  daily: "rgba(0,212,126,0.14)", general: "rgba(112,64,192,0.14)",
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [syncState, setSyncState] = useState<"loading" | "live" | "error">("loading");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const currentUser = getCurrentUser();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      if (err instanceof Error && err.message === "unauthorized") { clearSession(); setLocation("/auth"); }
      else setSyncState("error");
    }
  }, [currentUser, setLocation]);

  useEffect(() => {
    if (!getCurrentUser()) { setLocation("/auth"); return; }
    loadData();
    intervalRef.current = setInterval(loadData, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadData, setLocation]);

  function logout() { clearSession(); setLocation("/auth"); }

  const displayName = userData?.username || currentUser?.username || "Adventurer";
  const xpMax = userData ? userData.level * 100 : 100;
  const xpPct = userData ? Math.min(100, Math.round((userData.xp / xpMax) * 100)) : 0;
  const netWorth = userData ? (userData.wallet || 0) + (userData.bank || 0) : 0;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Poppins', sans-serif", background: "#080812" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ── NAV ── */
        .dash-nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: .85rem 1.2rem; gap: .8rem;
          background: rgba(8,8,18,.92); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(79,195,247,.12);
          position: sticky; top: 0; z-index: 100;
        }
        .dash-logo { display: flex; align-items: center; gap: .55rem; font-weight: 800; font-size: 1rem; color: #fff; flex-shrink: 0; }
        .dash-logo-img { width: 32px; height: 32px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(79,195,247,.4); flex-shrink: 0; }
        .dash-nav-right { display: flex; align-items: center; gap: .6rem; }
        .sync-pill {
          display: flex; align-items: center; gap: .4rem;
          font-size: .7rem; color: #546e7a;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          padding: .28rem .7rem; border-radius: 50px; white-space: nowrap;
        }
        .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .dot-live { background: #00d47e; box-shadow: 0 0 6px #00d47e; }
        .dot-loading { background: #4fc3f7; animation: blink 1.2s ease-in-out infinite; }
        .dot-error { background: #ef5350; }
        @keyframes blink { 0%,100%{opacity:.3} 50%{opacity:1} }
        .icon-btn {
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
          color: #546e7a; width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .2s; flex-shrink: 0;
        }
        .icon-btn:hover { background: rgba(79,195,247,.12); color: #4fc3f7; border-color: rgba(79,195,247,.25); }
        .logout-btn {
          display: flex; align-items: center; gap: .38rem;
          background: rgba(239,83,80,.08); border: 1px solid rgba(239,83,80,.22);
          color: #ef9a9a; padding: .32rem .85rem; border-radius: 50px;
          cursor: pointer; font-weight: 600; font-size: .78rem;
          font-family: 'Poppins', sans-serif; transition: all .2s; white-space: nowrap;
        }
        .logout-btn:hover { background: rgba(239,83,80,.16); }

        /* ── WRAP ── */
        .dash-wrap { max-width: 860px; margin: 0 auto; padding: 1.2rem 1rem 3rem; }

        /* ── BANNER ── */
        .reg-banner {
          background: linear-gradient(135deg,rgba(79,195,247,.06),rgba(112,64,192,.06));
          border: 1px solid rgba(79,195,247,.2); border-radius: 16px;
          padding: 1rem 1.1rem; margin-bottom: 1.2rem;
          display: flex; gap: .9rem; align-items: center; flex-wrap: wrap;
        }
        .reg-banner-text { flex: 1; min-width: 180px; font-size: .82rem; color: #546e7a; line-height: 1.5; }
        .reg-banner-text strong { color: #4fc3f7; }
        .reg-btn {
          background: linear-gradient(135deg,#4fc3f7,#0288d1); color: #000;
          border: none; padding: .48rem 1rem; border-radius: 50px;
          font-weight: 700; font-size: .78rem; cursor: pointer;
          font-family: 'Poppins', sans-serif; white-space: nowrap; flex-shrink: 0;
        }

        /* ── PROFILE CARD ── */
        .prof-card {
          background: linear-gradient(135deg,rgba(79,195,247,.07),rgba(112,64,192,.05));
          border: 1px solid rgba(79,195,247,.15);
          border-radius: 22px; overflow: hidden; margin-bottom: 1.1rem;
        }
        .prof-cover {
          height: 100px;
          background: linear-gradient(135deg,#0a1a35 0%,#0d0a2a 50%,#0a1828 100%);
          position: relative;
        }
        .prof-cover-pattern {
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234fc3f7' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .prof-av-wrap { position: absolute; bottom: -36px; left: 50%; transform: translateX(-50%); }
        .prof-av {
          width: 76px; height: 76px; border-radius: 50%;
          border: 4px solid #080812;
          background: linear-gradient(135deg,#4fc3f7,#0288d1);
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; position: relative;
        }
        .prof-av-badge {
          position: absolute; bottom: 0; right: 0;
          width: 20px; height: 20px; background: #ffd54f;
          border-radius: 50%; border: 2px solid #080812;
          display: flex; align-items: center; justify-content: center; font-size: .55rem;
        }
        .prof-body { padding: 2.6rem 1.2rem 1.4rem; text-align: center; }
        .prof-name { font-size: clamp(1.1rem,3vw,1.35rem); font-weight: 900; margin-bottom: .25rem; letter-spacing: -.01em; }
        .prof-role { color: #546e7a; font-size: .78rem; margin-bottom: .22rem; }
        .prof-phone { color: #37474f; font-size: .72rem; margin-bottom: .85rem; }
        .prof-edit-btns { display: flex; gap: .5rem; justify-content: center; flex-wrap: wrap; margin-bottom: .9rem; }
        .edit-btn {
          display: flex; align-items: center; gap: .32rem;
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
          color: #90a4ae; padding: .4rem .85rem; border-radius: 50px;
          font-size: .74rem; font-weight: 600; cursor: pointer;
          font-family: 'Poppins', sans-serif; transition: all .2s; white-space: nowrap;
        }
        .edit-btn:hover { background: rgba(79,195,247,.1); border-color: rgba(79,195,247,.25); color: #4fc3f7; }
        .prof-badges { display: flex; gap: .42rem; justify-content: center; flex-wrap: wrap; }
        .badge { font-size: .68rem; padding: .18rem .58rem; border-radius: 50px; font-weight: 600; border: 1px solid; }
        .badge-green { color: #80cbc4; border-color: rgba(128,203,196,.28); background: rgba(128,203,196,.07); }
        .badge-purple { color: #ce93d8; border-color: rgba(206,147,216,.28); background: rgba(206,147,216,.07); }
        .badge-cyan { color: #4fc3f7; border-color: rgba(79,195,247,.28); background: rgba(79,195,247,.07); }
        .badge-gold { color: #ffd54f; border-color: rgba(255,213,79,.28); background: rgba(255,213,79,.07); }

        /* XP bar */
        .xp-wrap { margin: .9rem 0 0; }
        .xp-labels { display: flex; justify-content: space-between; font-size: .7rem; color: #455a64; margin-bottom: .35rem; }
        .xp-track { height: 7px; background: rgba(255,255,255,.05); border-radius: 50px; overflow: hidden; }
        .xp-fill { height: 100%; background: linear-gradient(90deg,#4fc3f7,#ffd54f); border-radius: 50px; transition: width .6s ease; }

        /* ── STATS GRID ── */
        .stats-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: .7rem; margin-bottom: 1rem; }
        .stat-card {
          display: flex; align-items: center; gap: .8rem;
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: .9rem 1rem; transition: all .2s;
        }
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
        .tabs-wrap {
          display: flex; gap: .35rem; margin-bottom: 1.1rem;
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
          border-radius: 50px; padding: .3rem;
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .tabs-wrap::-webkit-scrollbar { display: none; }
        .tab-btn {
          display: flex; align-items: center; gap: .38rem;
          padding: .48rem .9rem; border-radius: 50px;
          font-size: .78rem; font-weight: 600; border: none; cursor: pointer;
          font-family: 'Poppins', sans-serif; transition: all .2s; white-space: nowrap;
          flex-shrink: 0; min-height: 36px;
        }
        .tab-inactive { background: transparent; color: #546e7a; }
        .tab-inactive:hover { color: #fff; background: rgba(255,255,255,.06); }
        .tab-active { background: linear-gradient(135deg,#4fc3f7,#0288d1); color: #000; box-shadow: 0 4px 12px rgba(79,195,247,.3); }

        /* ── SECTION TITLE ── */
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

        /* ── SKELETON ── */
        .skel { background: linear-gradient(90deg,rgba(79,195,247,.08) 25%,rgba(255,255,255,.04) 50%,rgba(79,195,247,.08) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 5px; display: inline-block; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── RPG ── */
        .rpg-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: .65rem; }
        .rpg-stat { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 13px; padding: .75rem .9rem; }
        .rpg-lbl { font-size: .68rem; color: #37474f; display: flex; align-items: center; gap: .3rem; margin-bottom: .25rem; }
        .rpg-val { font-weight: 700; font-size: .95rem; }
        .hp-bar { height: 5px; background: rgba(255,255,255,.05); border-radius: 4px; overflow: hidden; margin-top: .28rem; }
        .hp-fill { height: 100%; background: linear-gradient(90deg,#ef5350,#ff8a65); border-radius: 4px; }

        /* ── POKEMON ── */
        .poke-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(110px,1fr)); gap: .65rem; }
        .poke-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 15px; padding: .85rem; text-align: center; transition: all .2s; }
        .poke-card:hover { border-color: rgba(79,195,247,.25); transform: translateY(-2px); }

        /* ── INVENTORY ── */
        .inv-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(140px,1fr)); gap: .65rem; }
        .inv-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 13px; padding: .75rem .9rem; display: flex; align-items: center; gap: .55rem; transition: all .2s; }
        .inv-card:hover { border-color: rgba(79,195,247,.22); }
        .inv-icon { width: 34px; height: 34px; background: rgba(255,255,255,.07); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }

        /* ── ACHIEVEMENTS ── */
        .ach-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(140px,1fr)); gap: .65rem; }
        .ach-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,213,79,.12); border-radius: 15px; padding: .9rem; text-align: center; transition: all .2s; }
        .ach-card:hover { border-color: rgba(255,213,79,.3); }

        /* ── QUICK ACTIONS ── */
        .qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .7rem; }
        .qa-card {
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
          border-radius: 15px; padding: .9rem; display: flex; align-items: center; gap: .75rem;
          cursor: pointer; transition: all .2s;
        }
        .qa-card:hover { border-color: rgba(79,195,247,.25); background: rgba(79,195,247,.03); }
        .qa-icon { width: 36px; height: 36px; background: linear-gradient(135deg,rgba(79,195,247,.2),rgba(0,136,209,.1)); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #4fc3f7; flex-shrink: 0; }

        /* ════ RESPONSIVE ════ */
        @media (max-width: 600px) {
          .dash-wrap { padding: 1rem .85rem 3rem; }
          .sync-pill { display: none; }
          .logout-btn span { display: none; }
          .stats-grid { grid-template-columns: 1fr 1fr; gap: .55rem; }
          .stat-card { padding: .75rem .8rem; gap: .6rem; }
          .stat-val { font-size: .95rem; }
          .prof-edit-btns { gap: .38rem; }
          .edit-btn { padding: .38rem .7rem; font-size: .7rem; }
          .rpg-grid { grid-template-columns: 1fr 1fr; gap: .55rem; }
          .qa-grid { grid-template-columns: 1fr; }
          .poke-grid { grid-template-columns: repeat(auto-fill,minmax(90px,1fr)); }
          .inv-grid { grid-template-columns: 1fr 1fr; }
          .ach-grid { grid-template-columns: repeat(auto-fill,minmax(120px,1fr)); }
        }
        @media (max-width: 400px) {
          .dash-nav { padding: .7rem .85rem; }
          .prof-body { padding: 2.4rem .9rem 1.2rem; }
          .stats-grid { gap: .45rem; }
          .stat-icon { width: 33px; height: 33px; border-radius: 9px; }
        }
        @media (min-width: 700px) {
          .stats-grid { grid-template-columns: repeat(4,1fr); }
        }
      `}</style>

      {/* NAV */}
      <nav className="dash-nav">
        <div className="dash-logo">
          <img className="dash-logo-img" src="https://cdn.myanimelist.net/images/characters/14/282523.jpg" alt="Aqua" />
          Konosuba
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
        {/* Not registered nudge */}
        {userData && !userData.registered && (
          <div className="reg-banner">
            <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>🔗</span>
            <div className="reg-banner-text">
              <strong>Link your WhatsApp</strong> — type <strong>.reg</strong> in the bot to connect your account.
            </div>
            <button className="reg-btn" onClick={() => setLocation("/auth")}>Register</button>
          </div>
        )}

        {/* Profile */}
        <div className="prof-card">
          <div className="prof-cover">
            <div className="prof-cover-pattern" />
            <div className="prof-av-wrap">
              <div className="prof-av">👤<div className="prof-av-badge">🏅</div></div>
            </div>
          </div>
          <div className="prof-body">
            <div className="prof-name">
              {userData ? displayName.toUpperCase() : <span className="skel" style={{ width: 130, height: 22 }} />}
            </div>
            <div className="prof-role">
              {userData ? `${userData.rpg?.class || "Adventurer"} · Level ${userData.level}` : <span className="skel" style={{ width: 90, height: 14 }} />}
            </div>
            <div className="prof-phone">{currentUser ? `+${currentUser.phone}` : ""}</div>

            <div className="prof-edit-btns">
              <button className="edit-btn"><Edit3 size={11} /> Avatar</button>
              <button className="edit-btn"><Image size={11} /> Cover</button>
              <button className="edit-btn"><Frame size={11} /> Frame</button>
            </div>

            <div className="prof-badges">
              {userData?.registered
                ? <span className="badge badge-green">✅ WhatsApp Linked</span>
                : <span className="badge badge-purple">⚠️ Not Linked</span>}
              {userData && <span className="badge badge-cyan">⭐ Level {userData.level}</span>}
              {userData?.rpg?.prestige && userData.rpg.prestige > 0 && <span className="badge badge-gold">🌟 Prestige {userData.rpg.prestige}</span>}
            </div>

            {userData && (
              <div className="xp-wrap">
                <div className="xp-labels">
                  <span><Zap size={10} style={{ display: "inline", marginRight: 3 }} />XP Progress</span>
                  <span>{userData.xp} / {xpMax}</span>
                </div>
                <div className="xp-track"><div className="xp-fill" style={{ width: `${xpPct}%` }} /></div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: <Wallet size={16} />, cls: "si-wallet", label: "Wallet", val: userData ? formatMoney(userData.wallet) : null },
            { icon: <Building2 size={16} />, cls: "si-bank", label: "Bank", val: userData ? formatMoney(userData.bank) : null },
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
                { icon: <Flame size={16} />, cls: "si-flame", label: "Streak", val: userData ? `${userData.streak || 0}d` : null },
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
              {(userData?.achievements?.length
                ? userData.achievements.map((a, i) => ({ icon: ACHIEVEMENTS_DEFAULT[i % ACHIEVEMENTS_DEFAULT.length]?.icon || "🏆", name: a, desc: "Earned in-game" }))
                : ACHIEVEMENTS_DEFAULT
              ).map(a => (
                <div className="ach-card" key={a.name}>
                  <div style={{ fontSize: "1.8rem", marginBottom: ".4rem" }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: ".78rem", color: "#ffd54f", marginBottom: ".18rem" }}>{a.name}</div>
                  <div style={{ fontSize: ".68rem", color: "#37474f" }}>{a.desc}</div>
                </div>
              ))}
            </div>

            <div className="sec-title"><Activity size={12} /> Recent Activity</div>
            <div className="act-list">
              {activities.length === 0 ? (
                <div className="empty-state">
                  No activities yet.<br />
                  <span style={{ fontSize: ".76rem" }}>Play on WhatsApp — events appear here in real time.</span>
                </div>
              ) : (
                [...activities].reverse().slice(0, 20).map((a, i) => (
                  <div className="act-item" key={i}>
                    <div className="act-icon" style={{ background: ACT_COLORS[a.type || "general"] || "rgba(112,64,192,.14)" }}>{a.icon || "📝"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="act-title">{a.title || "Activity"}</div>
                      {a.desc && <div className="act-desc">{a.desc}</div>}
                      <div className="act-time">{formatTime(a.timestamp)}</div>
                    </div>
                    <ChevronRight size={13} color="#263238" style={{ flexShrink: 0 }} />
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: "1.2rem" }}>
              <div className="sec-title"><ScrollText size={12} /> Quick Actions</div>
              <div className="qa-grid">
                {[
                  { icon: <Trophy size={15} />, label: "Leaderboard", desc: "Top players by wallet" },
                  { icon: <ScrollText size={15} />, label: "Quests", desc: "Active quests & rewards" },
                ].map(item => (
                  <div key={item.label} className="qa-card">
                    <div className="qa-icon">{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{item.label}</div>
                      <div style={{ color: "#37474f", fontSize: ".7rem" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── DECK ── */}
        {activeTab === "deck" && (
          <>
            <div className="sec-title"><Sword size={12} /> RPG Stats</div>
            {userData?.rpg ? (
              <div className="rpg-grid" style={{ marginBottom: "1.2rem" }}>
                <div className="rpg-stat">
                  <div className="rpg-lbl"><Shield size={10} /> HP</div>
                  <div className="rpg-val">{userData.rpg.hp}/{userData.rpg.maxHp}</div>
                  <div className="hp-bar"><div className="hp-fill" style={{ width: `${Math.min(100, (userData.rpg.hp / userData.rpg.maxHp) * 100)}%` }} /></div>
                </div>
                <div className="rpg-stat"><div className="rpg-lbl"><Swords size={10} /> Class</div><div className="rpg-val">{userData.rpg.class}</div></div>
                <div className="rpg-stat"><div className="rpg-lbl">⚔️ Attack</div><div className="rpg-val">{userData.rpg.attack}</div></div>
                <div className="rpg-stat"><div className="rpg-lbl"><Shield size={10} /> Defense</div><div className="rpg-val">{userData.rpg.defense}</div></div>
                <div className="rpg-stat"><div className="rpg-lbl">🏰 Dungeon</div><div className="rpg-val">Lv.{userData.rpg.dungeonLevel}</div></div>
                <div className="rpg-stat"><div className="rpg-lbl">🌟 Prestige</div><div className="rpg-val">{userData.rpg.prestige}</div></div>
              </div>
            ) : <div className="empty-state">No RPG data yet. Use <strong>.rpg</strong> on WhatsApp.</div>}

            {userData?.pet?.type && (
              <>
                <div className="sec-title">🐾 Your Pet</div>
                <div className="stat-card" style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "2rem" }}>🐾</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: ".95rem" }}>{userData.pet.name || "Unnamed Pet"}</div>
                    <div style={{ color: "#455a64", fontSize: ".76rem" }}>{userData.pet.type} · Lv.{userData.pet.level}</div>
                    <div style={{ fontSize: ".72rem", color: "#a5d6a7", marginTop: ".2rem" }}>🍖 Hunger: {userData.pet.hunger}%</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── INVENTORY ── */}
        {activeTab === "inventory" && (
          <>
            <div className="sec-title"><Package size={12} /> Inventory</div>
            {userData?.inventory?.length ? (
              <div className="inv-grid">
                {userData.inventory.map((item, i) => (
                  <div className="inv-card" key={i}>
                    <div className="inv-icon">🎒</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: ".78rem" }}>{item.item}</div>
                      <div style={{ fontSize: ".68rem", color: "#4fc3f7" }}>×{item.qty}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="empty-state">Inventory empty.<br /><span style={{ fontSize: ".74rem" }}>Buy items with .buy on WhatsApp.</span></div>}
          </>
        )}

        {/* ── POKEMON ── */}
        {activeTab === "pokemon" && (
          <>
            <div className="sec-title"><Fish size={12} /> Pokémon</div>
            {userData?.pokemon?.length ? (
              <div className="poke-grid">
                {userData.pokemon.map((p, i) => (
                  <div className="poke-card" key={i}>
                    <div style={{ fontSize: "1.9rem", marginBottom: ".35rem" }}>{p.shiny ? "✨" : "🔮"}</div>
                    <div style={{ fontWeight: 700, fontSize: ".76rem" }}>{p.nickname || p.name}</div>
                    <div style={{ fontSize: ".68rem", color: "#455a64", marginTop: ".08rem" }}>Lv.{p.level}</div>
                    {p.shiny && <div style={{ fontSize: ".62rem", color: "#ffd54f" }}>✨ Shiny</div>}
                  </div>
                ))}
              </div>
            ) : <div className="empty-state">No Pokémon yet.<br /><span style={{ fontSize: ".74rem" }}>Use .starter to begin!</span></div>}
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Zap, Shield, Users, TrendingUp, Wallet, Star, ChevronRight, MessageCircle, Swords, Trophy, Sparkles, Menu, X } from "lucide-react";
import { getCurrentUser, clearSession } from "@/lib/api";

const CHARS = [
  { name: "Aqua", role: "Goddess · Useless but loveable", img: "https://cdn.myanimelist.net/images/characters/14/282523.jpg", color: "#4fc3f7", glow: "rgba(79,195,247,0.4)" },
  { name: "Megumin", role: "Arch-Wizard · Explosion!", img: "https://cdn.myanimelist.net/images/characters/14/349249.jpg", color: "#ef5350", glow: "rgba(239,83,80,0.4)" },
  { name: "Darkness", role: "Crusader · M-Masochist", img: "https://cdn.myanimelist.net/images/characters/14/266229.jpg", color: "#ffd54f", glow: "rgba(255,213,79,0.4)" },
  { name: "Kazuma", role: "Adventurer · Reincarnated", img: "https://cdn.myanimelist.net/images/characters/8/301302.jpg", color: "#a5d6a7", glow: "rgba(165,214,167,0.4)" },
];

const FEATURES = [
  { icon: <Wallet size={20} />, title: "Economy System", desc: "Wallet, bank, daily rewards, fishing, digging and more. All synced live.", color: "#4fc3f7" },
  { icon: <Zap size={20} />, title: "Real-Time Sync", desc: "Everything you do on WhatsApp appears instantly on your dashboard.", color: "#ffd54f" },
  { icon: <Star size={20} />, title: "Level & XP", desc: "Level up, earn XP, track your progress and climb the leaderboard.", color: "#ce93d8" },
  { icon: <Swords size={20} />, title: "RPG & Combat", desc: "Battle monsters, join dungeons, unlock classes and gear up for war.", color: "#ef5350" },
  { icon: <Sparkles size={20} />, title: "Pokémon", desc: "Catch Pokémon, battle, evolve, collect shiny variants and trade.", color: "#a5d6a7" },
  { icon: <TrendingUp size={20} />, title: "Gambling", desc: "Coinflip, slots, blackjack, roulette — high risk, high reward.", color: "#ffb74d" },
  { icon: <Shield size={20} />, title: "Group Tools", desc: "Anti-link, welcome messages, admin control and group management.", color: "#80cbc4" },
  { icon: <Users size={20} />, title: "Community", desc: "Guilds, leaderboards, gifting, achievements and global events.", color: "#f48fb1" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Characters", href: "#characters" },
    { label: "Pokémon", onClick: () => { setMenuOpen(false); setLocation("/pokemon"); } },
    { label: "Leaderboard", onClick: () => { setMenuOpen(false); setLocation(currentUser ? "/dashboard" : "/auth"); } },
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Poppins', sans-serif", background: "#080812", overflowX: "hidden" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        img { max-width: 100%; display: block; }

        /* ── NAV ── */
        .kn-nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.9rem 1.5rem;
          background: rgba(8,8,18,.92); backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(79,195,247,.12);
          position: sticky; top: 0; z-index: 200;
          gap: 1rem;
        }
        .kn-logo { display: flex; align-items: center; gap: .65rem; flex-shrink: 0; cursor: pointer; }
        .kn-logo-img { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; border: 2px solid rgba(79,195,247,.4); box-shadow: 0 0 14px rgba(79,195,247,.3); flex-shrink: 0; }
        .kn-logo-name { font-size: 1.05rem; font-weight: 900; color: #fff; line-height: 1.1; }
        .kn-logo-sub { font-size: .6rem; color: #4fc3f7; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
        .kn-nav-links { display: flex; gap: 1.6rem; list-style: none; }
        .kn-nav-links a { color: #78909c; font-weight: 500; font-size: .85rem; cursor: pointer; transition: color .2s; white-space: nowrap; }
        .kn-nav-links a:hover { color: #4fc3f7; }
        .kn-nav-btns { display: flex; gap: .6rem; flex-shrink: 0; align-items: center; }
        .btn-ghost { background: transparent; border: 1px solid rgba(79,195,247,.3); color: #4fc3f7; padding: .5rem 1.1rem; border-radius: 50px; font-weight: 600; font-size: .82rem; cursor: pointer; transition: all .2s; font-family: 'Poppins', sans-serif; white-space: nowrap; }
        .btn-ghost:hover { background: rgba(79,195,247,.1); }
        .btn-main { background: linear-gradient(135deg,#4fc3f7,#0288d1); color: #000; border: none; padding: .5rem 1.3rem; border-radius: 50px; font-weight: 700; font-size: .82rem; cursor: pointer; transition: all .25s; font-family: 'Poppins', sans-serif; white-space: nowrap; box-shadow: 0 4px 14px rgba(79,195,247,.3); }
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(79,195,247,.5); }
        .hamburger { display: none; background: none; border: 1px solid rgba(79,195,247,.3); color: #4fc3f7; border-radius: 8px; padding: .4rem; cursor: pointer; align-items: center; justify-content: center; z-index: 300; position: relative; }

        /* ── LEFT SLIDE DRAWER ── */
        .drawer-overlay {
          display: none; position: fixed; inset: 0; background: rgba(0,0,0,.6);
          z-index: 250; backdrop-filter: blur(4px);
          opacity: 0; transition: opacity .3s ease;
        }
        .drawer-overlay.open { display: block; opacity: 1; }

        .drawer {
          position: fixed; top: 0; left: 0; bottom: 0; width: min(300px, 85vw);
          background: rgba(10,10,24,.97); border-right: 1px solid rgba(79,195,247,.15);
          z-index: 260; transform: translateX(-100%);
          transition: transform .3s cubic-bezier(.4,0,.2,1);
          display: flex; flex-direction: column; padding: 0;
          backdrop-filter: blur(20px);
        }
        .drawer.open { transform: translateX(0); }

        .drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 1.2rem; border-bottom: 1px solid rgba(79,195,247,.1);
        }
        .drawer-logo { display: flex; align-items: center; gap: .55rem; }
        .drawer-logo-img { width: 34px; height: 34px; border-radius: 9px; object-fit: cover; border: 1.5px solid rgba(79,195,247,.4); }
        .drawer-logo-name { font-weight: 900; font-size: .95rem; color: #fff; }
        .drawer-close { background: rgba(79,195,247,.1); border: 1px solid rgba(79,195,247,.2); color: #4fc3f7; border-radius: 7px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        .drawer-nav { flex: 1; overflow-y: auto; padding: .8rem 0; }
        .drawer-link {
          display: flex; align-items: center; gap: .75rem;
          padding: .9rem 1.3rem; color: #90a4ae; font-weight: 500; font-size: .9rem;
          cursor: pointer; border-bottom: 1px solid rgba(255,255,255,.03);
          transition: all .18s; text-decoration: none;
        }
        .drawer-link:hover { color: #4fc3f7; background: rgba(79,195,247,.06); padding-left: 1.6rem; }
        .drawer-link-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(79,195,247,.4); flex-shrink: 0; }

        .drawer-btns { padding: 1rem 1.2rem; display: flex; flex-direction: column; gap: .6rem; border-top: 1px solid rgba(79,195,247,.1); }
        .drawer-btn-ghost { width: 100%; text-align: center; padding: .65rem; border-radius: 50px; border: 1px solid rgba(79,195,247,.3); color: #4fc3f7; font-size: .88rem; font-weight: 600; cursor: pointer; background: transparent; font-family: 'Poppins', sans-serif; transition: all .2s; }
        .drawer-btn-ghost:hover { background: rgba(79,195,247,.1); }
        .drawer-btn-main { width: 100%; text-align: center; padding: .65rem; border-radius: 50px; background: linear-gradient(135deg,#4fc3f7,#0288d1); color: #000; font-size: .88rem; font-weight: 700; cursor: pointer; border: none; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 14px rgba(79,195,247,.3); transition: all .2s; }
        .drawer-btn-main:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,195,247,.5); }

        /* ── HERO ── */
        .hero { position: relative; min-height: 90vh; display: flex; align-items: center; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; background: url('https://cdn.myanimelist.net/images/anime/10/81308l.jpg') center/cover no-repeat; filter: brightness(.2) saturate(1.4); }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(8,8,18,.95) 0%, rgba(8,8,18,.6) 50%, rgba(8,8,18,.9) 100%); }
        .hero-glow { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(79,195,247,.1), transparent 70%); top: -100px; right: 0; pointer-events: none; }
        .hero-inner { position: relative; z-index: 2; max-width: 1100px; margin: 0 auto; padding: 3rem 1.5rem; display: flex; gap: 3rem; align-items: center; flex-wrap: wrap; width: 100%; }
        .hero-text { flex: 1; min-width: 0; }
        .hero-eyebrow { display: inline-flex; align-items: center; gap: .5rem; background: rgba(79,195,247,.08); border: 1px solid rgba(79,195,247,.25); border-radius: 50px; padding: .35rem .9rem; margin-bottom: 1.2rem; font-size: .72rem; color: #4fc3f7; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
        .hero-title { font-size: clamp(2rem, 6vw, 4rem); font-weight: 900; line-height: 1.1; margin-bottom: 1rem; letter-spacing: -.02em; }
        .hero-title .g1 { background: linear-gradient(135deg,#fff 0%,#e0f7fa 60%,#4fc3f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-title .g2 { background: linear-gradient(135deg,#ffd54f,#ef5350); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-desc { color: #78909c; font-size: clamp(.88rem, 2vw, 1rem); line-height: 1.75; margin-bottom: 1.8rem; }
        .hero-btns { display: flex; gap: .8rem; flex-wrap: wrap; }
        .btn-hero-primary { display: inline-flex; align-items: center; gap: .45rem; background: linear-gradient(135deg,#4fc3f7,#0288d1); color: #000; border: none; padding: .9rem 1.8rem; border-radius: 50px; font-weight: 700; font-size: .95rem; cursor: pointer; transition: all .25s; box-shadow: 0 10px 28px rgba(79,195,247,.3); font-family: 'Poppins', sans-serif; }
        .btn-hero-primary:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(79,195,247,.5); }
        .btn-hero-sec { display: inline-flex; align-items: center; gap: .45rem; background: rgba(255,213,79,.07); border: 1px solid rgba(255,213,79,.3); color: #ffd54f; padding: .9rem 1.8rem; border-radius: 50px; font-weight: 600; font-size: .95rem; cursor: pointer; transition: all .25s; font-family: 'Poppins', sans-serif; }
        .btn-hero-sec:hover { background: rgba(255,213,79,.14); }

        .hero-chars { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; flex: 0 0 300px; }
        .char-card { position: relative; border-radius: 16px; overflow: hidden; aspect-ratio: .72; cursor: pointer; transition: transform .3s, box-shadow .3s; border: 1px solid rgba(255,255,255,.06); }
        .char-card:hover { transform: translateY(-5px); }
        .char-card img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
        .char-overlay { position: absolute; inset: 0; background: linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 55%); }
        .char-info { position: absolute; bottom: 0; left: 0; right: 0; padding: .6rem .75rem; }
        .char-name { font-weight: 800; font-size: .78rem; margin-bottom: .08rem; }
        .char-role { font-size: .6rem; color: rgba(255,255,255,.55); }

        /* ── STATS ── */
        .stats-strip { background: linear-gradient(135deg,rgba(79,195,247,.05),rgba(255,213,79,.03)); border-top: 1px solid rgba(79,195,247,.08); border-bottom: 1px solid rgba(79,195,247,.08); padding: 1.8rem 1.5rem; display: flex; justify-content: center; gap: clamp(1.5rem,5vw,4rem); flex-wrap: wrap; }
        .stat-block { text-align: center; }
        .stat-num { font-size: clamp(1.6rem,4vw,2.2rem); font-weight: 900; background: linear-gradient(135deg,#4fc3f7,#ffd54f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .stat-lbl { color: #455a64; font-size: .78rem; font-weight: 500; margin-top: .2rem; }

        /* ── SECTION ── */
        .kn-section { max-width: 1100px; margin: 0 auto; padding: 4rem 1.5rem; }
        .section-tag { display: inline-flex; align-items: center; gap: .4rem; background: rgba(206,147,216,.07); border: 1px solid rgba(206,147,216,.22); border-radius: 50px; padding: .28rem .85rem; font-size: .68rem; color: #ce93d8; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; margin-bottom: .8rem; }
        .section-title { font-size: clamp(1.6rem,4vw,2.2rem); font-weight: 900; margin-bottom: .55rem; letter-spacing: -.01em; }
        .section-sub { color: #455a64; font-size: .9rem; margin-bottom: 2.5rem; line-height: 1.7; }

        /* ── FEATURES ── */
        .feat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: .9rem; }
        .feat-card { background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.06); border-radius: 18px; padding: 1.3rem; transition: all .25s; position: relative; overflow: hidden; }
        .feat-card:hover { border-color: var(--feat-border,rgba(255,255,255,.12)); transform: translateY(-3px); }
        .feat-icon-wrap { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: .9rem; background: var(--feat-icon-bg,rgba(255,255,255,.07)); color: var(--feat-color,#fff); flex-shrink: 0; }
        .feat-title { font-weight: 700; font-size: .9rem; margin-bottom: .35rem; }
        .feat-desc { color: #455a64; font-size: .78rem; line-height: 1.6; }

        /* ── CHARACTERS ── */
        .chars-section { background: linear-gradient(135deg,rgba(79,195,247,.03),rgba(239,83,80,.02)); border-top: 1px solid rgba(255,255,255,.04); border-bottom: 1px solid rgba(255,255,255,.04); padding: 4rem 1.5rem; }
        .chars-inner { max-width: 1100px; margin: 0 auto; }
        .chars-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
        .char-big { position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: .7; cursor: pointer; transition: transform .3s, box-shadow .3s; border: 1px solid rgba(255,255,255,.06); }
        .char-big:hover { transform: translateY(-6px); }
        .char-big img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
        .char-big-overlay { position: absolute; inset: 0; background: linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 50%); }
        .char-big-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.2rem 1rem; }
        .char-big-name { font-weight: 800; font-size: 1rem; margin-bottom: .22rem; }
        .char-big-role { font-size: .74rem; opacity: .6; margin-bottom: .6rem; }
        .char-badge { display: inline-block; padding: .18rem .6rem; border-radius: 50px; font-size: .64rem; font-weight: 700; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15); }

        /* ── CTA ── */
        .cta-section { background: linear-gradient(135deg,rgba(79,195,247,.06),rgba(255,213,79,.04)); border-top: 1px solid rgba(79,195,247,.1); border-bottom: 1px solid rgba(79,195,247,.1); padding: 4rem 1.5rem; text-align: center; }
        .cta-inner { max-width: 600px; margin: 0 auto; }
        .cta-title { font-size: clamp(1.6rem,4vw,2.4rem); font-weight: 900; margin-bottom: .8rem; }
        .cta-sub { color: #546e7a; font-size: .9rem; margin-bottom: 2rem; line-height: 1.7; }
        .cta-btns { display: flex; gap: .85rem; justify-content: center; flex-wrap: wrap; }
        .btn-cta { display: inline-flex; align-items: center; gap: .5rem; padding: .9rem 2rem; border-radius: 50px; font-weight: 700; font-size: .95rem; cursor: pointer; transition: all .25s; font-family: 'Poppins', sans-serif; }
        .btn-cta-p { background: linear-gradient(135deg,#4fc3f7,#0288d1); color: #000; border: none; box-shadow: 0 8px 24px rgba(79,195,247,.3); }
        .btn-cta-p:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(79,195,247,.5); }
        .btn-cta-s { background: rgba(255,213,79,.08); border: 1px solid rgba(255,213,79,.28); color: #ffd54f; }
        .btn-cta-s:hover { background: rgba(255,213,79,.15); }

        /* ── FOOTER ── */
        .kn-footer { background: #060610; border-top: 1px solid rgba(79,195,247,.06); padding: 2.5rem 1.5rem; text-align: center; color: #37474f; font-size: .8rem; line-height: 1.8; }
        .kn-footer a { color: #4fc3f7; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .kn-nav-links { display: none; }
          .kn-nav-btns { display: none; }
          .hamburger { display: flex; }
          .hero-chars { flex: none; width: 100%; grid-template-columns: repeat(4,1fr); gap: .4rem; }
          .chars-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 480px) {
          .hero-chars { grid-template-columns: repeat(2,1fr); }
          .chars-grid { grid-template-columns: repeat(2,1fr); }
          .hero-inner { flex-direction: column; padding: 2rem 1rem; }
        }
      `}</style>

      {/* LEFT DRAWER OVERLAY */}
      <div className={`drawer-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* LEFT SLIDE DRAWER */}
      <div className={`drawer ${menuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <img className="drawer-logo-img" src="https://cdn.myanimelist.net/images/characters/14/282523.jpg" alt="Aqua" />
            <span className="drawer-logo-name">Konosuba</span>
          </div>
          <button className="drawer-close" onClick={() => setMenuOpen(false)}>
            <X size={16} />
          </button>
        </div>
        <nav className="drawer-nav">
          {navLinks.map(link => (
            <div key={link.label}
              className="drawer-link"
              onClick={() => {
                if (link.onClick) link.onClick();
                else setMenuOpen(false);
              }}
            >
              <span className="drawer-link-dot" />
              {link.label}
            </div>
          ))}
          <div className="drawer-link" onClick={() => { setMenuOpen(false); setLocation("/pokemon"); }}>
            <span className="drawer-link-dot" style={{ background: "#a5d6a7" }} />
            Pokédex
          </div>
        </nav>
        <div className="drawer-btns">
          {currentUser ? (
            <>
              <button className="drawer-btn-main" onClick={() => { setMenuOpen(false); setLocation("/dashboard"); }}>My Dashboard</button>
              <button className="drawer-btn-ghost" onClick={() => { clearSession(); setMenuOpen(false); setLocation("/"); }}>Logout</button>
            </>
          ) : (
            <>
              <button className="drawer-btn-ghost" onClick={() => { setMenuOpen(false); setLocation("/auth"); }}>Login</button>
              <button className="drawer-btn-main" onClick={() => { setMenuOpen(false); setLocation("/auth"); }}>Get Started</button>
            </>
          )}
        </div>
      </div>

      {/* NAV */}
      <nav className="kn-nav">
        <div className="kn-logo" onClick={() => setLocation("/")}>
          <img className="kn-logo-img" src="https://cdn.myanimelist.net/images/characters/14/282523.jpg" alt="Aqua" />
          <div>
            <div className="kn-logo-name">Konosuba</div>
            <div className="kn-logo-sub">Bot Dashboard</div>
          </div>
        </div>
        <ul className="kn-nav-links">
          {navLinks.map(link => (
            <li key={link.label}>
              <a onClick={link.onClick || (() => {})} href={link.href || "#"}>{link.label}</a>
            </li>
          ))}
        </ul>
        <div className="kn-nav-btns">
          {currentUser ? (
            <button className="btn-main" onClick={() => setLocation("/dashboard")}>Dashboard</button>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => setLocation("/auth")}>Login</button>
              <button className="btn-main" onClick={() => setLocation("/auth")}>Get Started</button>
            </>
          )}
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(v => !v)}>
          <Menu size={20} />
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-glow" />
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-eyebrow"><Sparkles size={11} /> WhatsApp RPG Universe</div>
            <h1 className="hero-title">
              <span className="g1">Konosuba</span><br />
              <span className="g2">Bot Dashboard</span>
            </h1>
            <p className="hero-desc">Your WhatsApp RPG companion, fully synced to the web. Track XP, economy, Pokémon, achievements and more — all in one place.</p>
            <div className="hero-btns">
              <button className="btn-hero-primary" onClick={() => setLocation(currentUser ? "/dashboard" : "/auth")}>
                <Zap size={16} /> {currentUser ? "Open Dashboard" : "Get Started"} <ChevronRight size={14} />
              </button>
              <button className="btn-hero-sec" onClick={() => setLocation("/pokemon")}>
                <Sparkles size={15} /> View Pokédex
              </button>
            </div>
          </div>
          <div className="hero-chars">
            {CHARS.map(c => (
              <div className="char-card" key={c.name} style={{ boxShadow: menuOpen ? 'none' : `0 0 0 0 ${c.glow}` }}>
                <img src={c.img} alt={c.name} loading="lazy" />
                <div className="char-overlay" />
                <div className="char-info">
                  <div className="char-name" style={{ color: c.color }}>{c.name}</div>
                  <div className="char-role">{c.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="stats-strip">
        {[["10K+","Active Players"],["500K+","Commands Run"],["150+","Bot Features"],["99.9%","Uptime"]].map(([n,l]) => (
          <div className="stat-block" key={l}>
            <div className="stat-num">{n}</div>
            <div className="stat-lbl">{l}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="kn-section" id="features">
        <div className="section-tag"><Zap size={10} /> Features</div>
        <h2 className="section-title">Everything in One Dashboard</h2>
        <p className="section-sub">All your WhatsApp bot activity, stats and progress — beautifully presented on the web.</p>
        <div className="feat-grid">
          {FEATURES.map(f => (
            <div className="feat-card" key={f.title} style={{ ["--feat-color" as string]: f.color, ["--feat-icon-bg" as string]: `${f.color}18`, ["--feat-border" as string]: `${f.color}30` }}>
              <div className="feat-icon-wrap">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CHARACTERS */}
      <section className="chars-section" id="characters">
        <div className="chars-inner">
          <div className="section-tag"><Users size={10} /> Cast</div>
          <h2 className="section-title">Meet the Characters</h2>
          <p className="section-sub">Choose your party — Aqua, Megumin, Darkness and Kazuma await your commands.</p>
          <div className="chars-grid">
            {CHARS.map(c => (
              <div className="char-big" key={c.name} style={{ boxShadow: `0 0 0 1px ${c.color}20` }}>
                <img src={c.img} alt={c.name} loading="lazy" />
                <div className="char-big-overlay" />
                <div className="char-big-info">
                  <div className="char-big-name" style={{ color: c.color }}>{c.name}</div>
                  <div className="char-big-role">{c.role.split(' · ')[0]}</div>
                  <span className="char-badge" style={{ borderColor: `${c.color}30`, color: c.color }}>{c.role.split(' · ')[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="section-tag"><Trophy size={10} /> Join Now</div>
          <h2 className="cta-title">Ready to Start Your Adventure?</h2>
          <p className="cta-sub">Link your WhatsApp account and access your full dashboard — level, economy, Pokémon, achievements and leaderboard.</p>
          <div className="cta-btns">
            <button className="btn-cta btn-cta-p" onClick={() => setLocation(currentUser ? "/dashboard" : "/auth")}>
              <Zap size={16} /> {currentUser ? "Open Dashboard" : "Create Account"}
            </button>
            <button className="btn-cta btn-cta-s" onClick={() => setLocation("/pokemon")}>
              <Sparkles size={15} /> View Pokédex
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="kn-footer">
        <p>© 2025 Konosuba Bot · Built with ⚡ by the community</p>
        <p style={{ marginTop: '.4rem' }}>
          <a href="https://github.com/konosubacommunity-rgb/Konosuba-Bot" target="_blank" rel="noreferrer">GitHub</a>
          {" · "}
          <a href="#features">Features</a>
          {" · "}
          <span style={{ cursor: 'pointer', color: '#a5d6a7' }} onClick={() => setLocation("/pokemon")}>Pokédex</span>
        </p>
      </footer>
    </div>
  );
      }

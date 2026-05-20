import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 4, 21, 0.8);
        }
        .logo { display: flex; align-items: center; gap: 0.5rem; font-weight: 900; font-size: 1.3rem; }
        nav ul { list-style: none; display: flex; gap: 2rem; }
        nav a { color: var(--text-secondary); font-weight: 500; transition: color 0.3s; }
        nav a:hover { color: var(--cyan); }
        .btn-get-started {
          background: linear-gradient(135deg, var(--cyan), #00b8cc);
          color: #000;
          border: none;
          padding: 0.7rem 1.5rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.95rem;
        }
        .btn-get-started:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,217,255,0.4); }

        .hero-wrapper {
          position: relative;
          padding: 5rem 2rem;
          overflow: hidden;
        }
        .hero-background {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 60% 50%, rgba(112,64,192,0.15) 0%, transparent 70%),
                      radial-gradient(ellipse at 20% 20%, rgba(0,217,255,0.08) 0%, transparent 50%);
        }
        .hero-glow {
          position: absolute;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0,217,255,0.1) 0%, transparent 70%);
          right: 10%; top: 50%; transform: translateY(-50%);
          border-radius: 50%;
          animation: pulse 4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100% { transform: translateY(-50%) scale(1); opacity: 0.5; } 50% { transform: translateY(-50%) scale(1.1); opacity: 1; } }
        .hero-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 4rem;
        }
        .hero-text { flex: 1; }
        .hero-text h1 {
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 900;
          background: linear-gradient(135deg, #fff 0%, var(--cyan) 50%, var(--primary-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }
        .hero-text p { color: var(--text-secondary); font-size: 1.15rem; line-height: 1.7; margin-bottom: 2rem; }
        .hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }
        .btn-primary {
          background: linear-gradient(135deg, var(--cyan), #00b8cc);
          color: #000; border: none;
          padding: 1rem 2rem; border-radius: 12px;
          font-weight: 700; font-size: 1rem; cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(0,217,255,0.3);
        }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0,217,255,0.5); }
        .btn-secondary {
          background: rgba(112,64,192,0.2); color: var(--text-primary);
          border: 1px solid rgba(112,64,192,0.4);
          padding: 1rem 2rem; border-radius: 12px;
          font-weight: 600; font-size: 1rem; cursor: pointer;
          transition: all 0.3s;
        }
        .btn-secondary:hover { background: rgba(112,64,192,0.35); }
        .hero-image { flex: 0.8; }
        .hero-card {
          background: linear-gradient(135deg, rgba(112,64,192,0.15), rgba(0,217,255,0.08));
          border: 1px solid rgba(0,217,255,0.25);
          border-radius: 20px;
          padding: 2.5rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 60px rgba(0,217,255,0.1);
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .hero-card-content { text-align: center; }
        .hero-icon { font-size: 4rem; margin-bottom: 1rem; filter: drop-shadow(0 0 20px rgba(0,217,255,0.6)); }
        .hero-card h3 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.8rem; color: var(--cyan); }
        .hero-card p { color: var(--text-secondary); line-height: 1.6; }

        .section { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; }
        .section-title {
          font-size: 2.2rem; font-weight: 900; text-align: center; margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, var(--cyan));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .section-subtitle { color: var(--text-secondary); text-align: center; margin-bottom: 3rem; font-size: 1.05rem; }
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;
        }
        .feature-card {
          background: linear-gradient(135deg, rgba(112,64,192,0.1), rgba(0,217,255,0.05));
          border: 1px solid rgba(0,217,255,0.15);
          border-radius: 16px; padding: 2rem;
          transition: all 0.3s;
          opacity: 0;
          animation: fadeIn 0.6s ease forwards;
        }
        .feature-card:hover { transform: translateY(-5px); border-color: rgba(0,217,255,0.35); box-shadow: 0 15px 40px rgba(0,217,255,0.1); }
        @keyframes fadeIn { to { opacity: 1; } }
        .feature-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .feature-card h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 0.7rem; color: var(--cyan); }
        .feature-card p { color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem; }

        footer {
          text-align: center; padding: 2rem;
          border-top: 1px solid var(--border);
          color: var(--text-secondary); font-size: 0.9rem;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .hero-content { flex-direction: column; gap: 2rem; }
          .hero-image { width: 100%; }
          nav { display: none; }
        }
      `}</style>

      <header>
        <div className="logo">
          <span>🧿</span>
          <span>Aqua Bot</span>
        </div>
        <nav>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#community">Community</a></li>
          </ul>
        </nav>
        <button className="btn-get-started" onClick={() => setLocation("/auth")}>Get Started</button>
      </header>

      <section className="hero-wrapper">
        <div className="hero-background" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome to Aqua Bot</h1>
            <p>The ultimate hub for community bots. Explore our immersive Economy, engage in epic RPG adventures, and conquer interactive games with your friends.</p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => setLocation("/auth")}>Join the Community</button>
              <button className="btn-secondary" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-card">
              <div className="hero-card-content">
                <div className="hero-icon">🧿</div>
                <h3>Multi-System Bot</h3>
                <p>Economy, RPG, Games, Pokémon & more integrated into one powerful platform for WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <h2 className="section-title">Amazing Features</h2>
        <p className="section-subtitle">Everything your community needs to thrive</p>
        <div className="features-grid">
          {[
            { icon: "💰", title: "Economy System", desc: "Full-featured economy with wallet, bank accounts, daily rewards, and interactive trading." },
            { icon: "🎲", title: "Gambling Games", desc: "Coinflip, slots, blackjack, roulette, lottery with fair win rates and exciting mechanics." },
            { icon: "🎮", title: "Mini Games", desc: "Hangman, trivia, riddles, word scramble, math quizzes, and fast typing challenges." },
            { icon: "⚔️", title: "RPG Adventure", desc: "Choose your class, fight monsters, explore dungeons, defeat bosses, and level up." },
            { icon: "🐾", title: "Pokémon Catch", desc: "Catch, train, evolve, and battle Pokémon with full progression and team battles." },
            { icon: "🏰", title: "Guild System", desc: "Create and manage guilds with members, levels, treasury, and leaderboards." },
          ].map((f, i) => (
            <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <p>&copy; 2026 Aqua Bot. Made with 💜 for the KONOSUBA community.</p>
      </footer>
    </div>
  );
}

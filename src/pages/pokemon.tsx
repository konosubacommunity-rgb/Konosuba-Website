import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Sparkles, Zap, Shield, Swords, X } from "lucide-react";

interface PokemonListItem {
  name: string;
  url: string;
}

interface PokemonData {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      "official-artwork": {
        front_default: string;
        front_shiny: string;
      };
      home?: {
        front_default: string;
        front_shiny: string;
      };
    };
  };
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  height: number;
  weight: number;
  base_experience: number;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  normal: { bg: "rgba(168,168,120,.2)", text: "#a8a878", border: "rgba(168,168,120,.4)" },
  fire: { bg: "rgba(240,128,48,.2)", text: "#f08030", border: "rgba(240,128,48,.4)" },
  water: { bg: "rgba(104,144,240,.2)", text: "#6890f0", border: "rgba(104,144,240,.4)" },
  electric: { bg: "rgba(248,208,48,.2)", text: "#f8d030", border: "rgba(248,208,48,.4)" },
  grass: { bg: "rgba(120,200,80,.2)", text: "#78c850", border: "rgba(120,200,80,.4)" },
  ice: { bg: "rgba(152,216,216,.2)", text: "#98d8d8", border: "rgba(152,216,216,.4)" },
  fighting: { bg: "rgba(192,48,40,.2)", text: "#c03028", border: "rgba(192,48,40,.4)" },
  poison: { bg: "rgba(160,64,160,.2)", text: "#a040a0", border: "rgba(160,64,160,.4)" },
  ground: { bg: "rgba(224,192,104,.2)", text: "#e0c068", border: "rgba(224,192,104,.4)" },
  flying: { bg: "rgba(168,144,240,.2)", text: "#a890f0", border: "rgba(168,144,240,.4)" },
  psychic: { bg: "rgba(248,88,136,.2)", text: "#f85888", border: "rgba(248,88,136,.4)" },
  bug: { bg: "rgba(168,184,32,.2)", text: "#a8b820", border: "rgba(168,184,32,.4)" },
  rock: { bg: "rgba(184,160,56,.2)", text: "#b8a038", border: "rgba(184,160,56,.4)" },
  ghost: { bg: "rgba(112,88,152,.2)", text: "#705898", border: "rgba(112,88,152,.4)" },
  dragon: { bg: "rgba(112,56,248,.2)", text: "#7038f8", border: "rgba(112,56,248,.4)" },
  dark: { bg: "rgba(112,88,72,.2)", text: "#705848", border: "rgba(112,88,72,.4)" },
  steel: { bg: "rgba(184,184,208,.2)", text: "#b8b8d0", border: "rgba(184,184,208,.4)" },
  fairy: { bg: "rgba(238,153,172,.2)", text: "#ee99ac", border: "rgba(238,153,172,.4)" },
};

function getTypeStyle(type: string) {
  return TYPE_COLORS[type] || { bg: "rgba(255,255,255,.1)", text: "#fff", border: "rgba(255,255,255,.2)" };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
}

function getHighQualitySprite(p: PokemonData, shiny = false): string {
  if (shiny) {
    return p.sprites.other?.["official-artwork"]?.front_shiny
      || p.sprites.other?.home?.front_shiny
      || p.sprites.front_shiny
      || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${p.id}.png`;
  }
  return p.sprites.other?.["official-artwork"]?.front_default
    || p.sprites.other?.home?.front_default
    || p.sprites.front_default
    || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
}

const PAGE_SIZE = 24;
const CACHE: Record<string, PokemonData> = {};

export default function Pokemon() {
  const [, setLocation] = useLocation();
  const [list, setList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cardData, setCardData] = useState<Record<string, PokemonData>>({});
  const [selected, setSelected] = useState<PokemonData | null>(null);
  const [shiny, setShiny] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchList = useCallback(async (offset: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${offset}`);
      const data = await res.json();
      setList(data.results);
      setTotalCount(data.count);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearch = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const name = q.toLowerCase().trim().replace(/\s+/g, '-');
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!res.ok) { setList([]); setTotalCount(0); setLoading(false); return; }
      const data: PokemonData = await res.json();
      CACHE[data.name] = data;
      setCardData(prev => ({ ...prev, [data.name]: data }));
      setList([{ name: data.name, url: `https://pokeapi.co/api/v2/pokemon/${data.id}/` }]);
      setTotalCount(1);
    } catch {
      setList([]); setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      fetchSearch(searchQuery);
    } else {
      fetchList(page * PAGE_SIZE);
    }
  }, [page, searchQuery, fetchList, fetchSearch]);

  useEffect(() => {
    if (list.length === 0) return;
    const unloaded = list.filter(p => !cardData[p.name] && !CACHE[p.name]);
    if (unloaded.length === 0) return;
    Promise.all(
      unloaded.map(p =>
        fetch(p.url).then(r => r.json()).then((d: PokemonData) => {
          CACHE[d.name] = d;
          return d;
        }).catch(() => null)
      )
    ).then(results => {
      const newData: Record<string, PokemonData> = {};
      results.forEach(d => { if (d) newData[d.name] = d; });
      setCardData(prev => ({ ...prev, ...newData, ...CACHE }));
    });
  }, [list]);

  async function openDetail(item: PokemonListItem) {
    if (CACHE[item.name]) { setSelected(CACHE[item.name]); setShiny(false); return; }
    setLoadingDetail(true);
    try {
      const res = await fetch(item.url);
      const d: PokemonData = await res.json();
      CACHE[d.name] = d;
      setSelected(d);
      setShiny(false);
    } finally {
      setLoadingDetail(false);
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div style={{ minHeight: "100vh", background: "#080812", fontFamily: "'Poppins', sans-serif", color: "#fff" }}>
      <style>{`
        .pk-nav { display: flex; align-items: center; gap: 1rem; padding: .9rem 1.4rem; background: rgba(8,8,18,.92); border-bottom: 1px solid rgba(165,214,167,.12); position: sticky; top: 0; z-index: 100; backdrop-filter: blur(20px); }
        .pk-back { display: flex; align-items: center; gap: .35rem; color: #a5d6a7; font-size: .83rem; font-weight: 600; cursor: pointer; border: 1px solid rgba(165,214,167,.25); border-radius: 50px; padding: .35rem .85rem; background: rgba(165,214,167,.06); transition: all .2s; }
        .pk-back:hover { background: rgba(165,214,167,.12); }
        .pk-title { font-size: 1.05rem; font-weight: 900; flex: 1; }
        .pk-title span { background: linear-gradient(135deg,#a5d6a7,#4fc3f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .pk-search-wrap { padding: 1.2rem 1.4rem; }
        .pk-search { display: flex; align-items: center; gap: .6rem; background: rgba(255,255,255,.04); border: 1px solid rgba(165,214,167,.15); border-radius: 50px; padding: .55rem 1.1rem; max-width: 480px; }
        .pk-search input { flex: 1; background: none; border: none; outline: none; color: #fff; font-size: .88rem; font-family: 'Poppins', sans-serif; }
        .pk-search input::placeholder { color: #546e7a; }
        .pk-search-btn { background: linear-gradient(135deg,#a5d6a7,#4fc3f7); border: none; border-radius: 50px; padding: .35rem .9rem; font-size: .78rem; font-weight: 700; cursor: pointer; color: #000; font-family: 'Poppins', sans-serif; }
        .pk-clear { background: none; border: none; color: #546e7a; cursor: pointer; display: flex; }

        .pk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: .8rem; padding: 0 1.4rem 1.4rem; }
        .pk-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 18px; padding: .9rem .75rem; text-align: center; cursor: pointer; transition: all .22s; position: relative; overflow: hidden; }
        .pk-card:hover { border-color: rgba(165,214,167,.3); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
        .pk-card-num { font-size: .65rem; color: #37474f; font-weight: 600; margin-bottom: .25rem; }
        .pk-card-img-wrap { width: 100px; height: 100px; margin: 0 auto .55rem; display: flex; align-items: center; justify-content: center; }
        .pk-card-img { width: 100%; height: 100%; object-fit: contain; image-rendering: auto; filter: drop-shadow(0 4px 12px rgba(0,0,0,.4)); transition: transform .25s; }
        .pk-card:hover .pk-card-img { transform: scale(1.1) translateY(-4px); }
        .pk-card-name { font-size: .8rem; font-weight: 700; margin-bottom: .45rem; }
        .pk-card-types { display: flex; gap: .3rem; justify-content: center; flex-wrap: wrap; }
        .pk-type { font-size: .62rem; font-weight: 700; padding: .12rem .5rem; border-radius: 50px; border: 1px solid; }

        .pk-skel { animation: pk-shimmer 1.4s infinite; background: linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%); background-size: 200% 100%; border-radius: 50%; }
        @keyframes pk-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .pk-pagination { display: flex; align-items: center; justify-content: center; gap: .8rem; padding: 1.5rem; }
        .pk-page-btn { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); color: #fff; border-radius: 50px; padding: .45rem 1.1rem; font-size: .82rem; font-weight: 600; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: .35rem; font-family: 'Poppins', sans-serif; }
        .pk-page-btn:hover:not(:disabled) { border-color: rgba(165,214,167,.4); color: #a5d6a7; }
        .pk-page-btn:disabled { opacity: .35; cursor: not-allowed; }
        .pk-page-info { font-size: .8rem; color: #455a64; }

        /* MODAL */
        .pk-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.8); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(8px); }
        .pk-modal { background: #0e0e1e; border: 1px solid rgba(165,214,167,.15); border-radius: 24px; width: 100%; max-width: 440px; max-height: 90vh; overflow-y: auto; position: relative; }
        .pk-modal-close { position: absolute; top: .9rem; right: .9rem; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #90a4ae; z-index: 10; transition: all .2s; }
        .pk-modal-close:hover { background: rgba(239,83,80,.1); color: #ef5350; border-color: rgba(239,83,80,.3); }
        .pk-modal-hero { padding: 2rem 1.5rem 1rem; text-align: center; position: relative; background: linear-gradient(180deg,rgba(165,214,167,.05) 0%,transparent 100%); border-bottom: 1px solid rgba(255,255,255,.05); }
        .pk-modal-img-wrap { width: 180px; height: 180px; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; }
        .pk-modal-img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 8px 24px rgba(0,0,0,.5)); transition: all .3s; }
        .pk-modal-shiny-btn { position: absolute; top: 1rem; left: 1rem; background: rgba(255,213,79,.08); border: 1px solid rgba(255,213,79,.25); color: #ffd54f; border-radius: 50px; padding: .28rem .7rem; font-size: .7rem; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all .2s; }
        .pk-modal-shiny-btn.active { background: rgba(255,213,79,.2); border-color: rgba(255,213,79,.5); box-shadow: 0 0 12px rgba(255,213,79,.3); }
        .pk-modal-id { font-size: .7rem; color: #37474f; font-weight: 600; margin-bottom: .3rem; }
        .pk-modal-name { font-size: 1.5rem; font-weight: 900; margin-bottom: .55rem; }
        .pk-modal-types { display: flex; gap: .4rem; justify-content: center; margin-bottom: .8rem; }
        .pk-modal-type { font-size: .75rem; font-weight: 700; padding: .22rem .75rem; border-radius: 50px; border: 1px solid; }
        .pk-modal-body { padding: 1.1rem 1.4rem 1.4rem; }
        .pk-modal-section { margin-bottom: 1.1rem; }
        .pk-modal-sec-title { font-size: .72rem; font-weight: 700; color: #37474f; text-transform: uppercase; letter-spacing: .07em; margin-bottom: .6rem; display: flex; align-items: center; gap: .35rem; }
        .pk-stat-row { display: flex; align-items: center; gap: .7rem; margin-bottom: .4rem; }
        .pk-stat-name { font-size: .7rem; color: #546e7a; width: 90px; flex-shrink: 0; }
        .pk-stat-val { font-size: .75rem; font-weight: 700; width: 32px; flex-shrink: 0; }
        .pk-stat-bar { flex: 1; height: 6px; background: rgba(255,255,255,.06); border-radius: 50px; overflow: hidden; }
        .pk-stat-fill { height: 100%; border-radius: 50px; transition: width .6s ease; }
        .pk-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; }
        .pk-meta-item { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 12px; padding: .65rem .8rem; }
        .pk-meta-label { font-size: .65rem; color: #37474f; margin-bottom: .2rem; }
        .pk-meta-val { font-size: .85rem; font-weight: 700; }
        .pk-abilities { display: flex; flex-wrap: wrap; gap: .4rem; }
        .pk-ability { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 50px; padding: .2rem .7rem; font-size: .72rem; font-weight: 600; }
        .pk-ability.hidden { border-color: rgba(255,213,79,.25); color: #ffd54f; background: rgba(255,213,79,.05); }

        .pk-empty { padding: 3rem; text-align: center; color: #37474f; }

        @media (max-width: 480px) {
          .pk-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: .6rem; padding: 0 .85rem .85rem; }
          .pk-card-img-wrap { width: 80px; height: 80px; }
        }
      `}</style>

      {/* DETAIL MODAL */}
      {selected && (
        <div className="pk-modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="pk-modal">
            <button className="pk-modal-close" onClick={() => setSelected(null)}><X size={16} /></button>
            <div className="pk-modal-hero">
              <button
                className={`pk-modal-shiny-btn ${shiny ? "active" : ""}`}
                onClick={() => setShiny(s => !s)}
              >✨ {shiny ? "Shiny!" : "Shiny"}</button>
              <div className="pk-modal-img-wrap">
                <img
                  className="pk-modal-img"
                  src={getHighQualitySprite(selected, shiny)}
                  alt={selected.name}
                  style={{ filter: shiny ? "drop-shadow(0 8px 24px rgba(255,213,79,.4))" : "drop-shadow(0 8px 24px rgba(0,0,0,.5))" }}
                />
              </div>
              <div className="pk-modal-id">#{String(selected.id).padStart(4, "0")}</div>
              <div className="pk-modal-name">{capitalize(selected.name)}</div>
              <div className="pk-modal-types">
                {selected.types.map(t => {
                  const s = getTypeStyle(t.type.name);
                  return (
                    <span key={t.type.name} className="pk-modal-type" style={{ background: s.bg, color: s.text, borderColor: s.border }}>
                      {capitalize(t.type.name)}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="pk-modal-body">
              {/* Meta */}
              <div className="pk-modal-section">
                <div className="pk-modal-sec-title"><Zap size={11} /> Info</div>
                <div className="pk-meta-grid">
                  {[
                    ["Height", `${(selected.height / 10).toFixed(1)}m`],
                    ["Weight", `${(selected.weight / 10).toFixed(1)}kg`],
                    ["Base XP", String(selected.base_experience || "—")],
                    ["ID", `#${String(selected.id).padStart(4,"0")}`],
                  ].map(([l, v]) => (
                    <div className="pk-meta-item" key={l}>
                      <div className="pk-meta-label">{l}</div>
                      <div className="pk-meta-val">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Stats */}
              <div className="pk-modal-section">
                <div className="pk-modal-sec-title"><Swords size={11} /> Base Stats</div>
                {selected.stats.map(s => {
                  const pct = Math.min(100, (s.base_stat / 255) * 100);
                  const color = pct > 70 ? "#a5d6a7" : pct > 40 ? "#4fc3f7" : "#ef5350";
                  return (
                    <div className="pk-stat-row" key={s.stat.name}>
                      <span className="pk-stat-name">{capitalize(s.stat.name)}</span>
                      <span className="pk-stat-val">{s.base_stat}</span>
                      <div className="pk-stat-bar">
                        <div className="pk-stat-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Abilities */}
              <div className="pk-modal-section">
                <div className="pk-modal-sec-title"><Shield size={11} /> Abilities</div>
                <div className="pk-abilities">
                  {selected.abilities.map(a => (
                    <span key={a.ability.name} className={`pk-ability ${a.is_hidden ? "hidden" : ""}`}>
                      {capitalize(a.ability.name)}{a.is_hidden ? " 🔒" : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="pk-nav">
        <button className="pk-back" onClick={() => setLocation("/")}>
          <ArrowLeft size={14} /> Home
        </button>
        <div className="pk-title"><span>Pokédex</span></div>
        <div style={{ fontSize: ".75rem", color: "#455a64" }}>{totalCount} Pokémon</div>
      </nav>

      {/* SEARCH */}
      <div className="pk-search-wrap">
        <form className="pk-search" onSubmit={e => { e.preventDefault(); setPage(0); setSearchQuery(search); }}>
          <Search size={15} color="#546e7a" />
          <input
            type="text"
            placeholder="Search Pokémon name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="pk-clear" onClick={() => { setSearch(""); setSearchQuery(""); setPage(0); }}>
              <X size={15} />
            </button>
          )}
          <button type="submit" className="pk-search-btn">Search</button>
        </form>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="pk-grid">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 18, padding: ".9rem .75rem", textAlign: "center" }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", margin: "0 auto 10px", background: "rgba(255,255,255,.05)" }} className="pk-skel" />
              <div style={{ height: 12, width: "70%", margin: "0 auto 8px", borderRadius: 6, background: "rgba(255,255,255,.05)" }} className="pk-skel" />
              <div style={{ height: 10, width: "50%", margin: "0 auto", borderRadius: 6, background: "rgba(255,255,255,.05)" }} className="pk-skel" />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="pk-empty">
          <Sparkles size={40} style={{ margin: "0 auto 1rem", opacity: .3 }} />
          <p>No Pokémon found</p>
          <p style={{ fontSize: ".78rem", marginTop: ".4rem" }}>Try a different name or ID</p>
        </div>
      ) : (
        <div className="pk-grid">
          {list.map(item => {
            const data = cardData[item.name] || CACHE[item.name];
            const idFromUrl = parseInt(item.url.split("/").filter(Boolean).pop() || "0");
            const img = data
              ? getHighQualitySprite(data)
              : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idFromUrl}.png`;

            return (
              <div className="pk-card" key={item.name} onClick={() => openDetail(item)}>
                <div className="pk-card-num">#{String(idFromUrl).padStart(4, "0")}</div>
                <div className="pk-card-img-wrap">
                  <img className="pk-card-img" src={img} alt={item.name} loading="lazy" />
                </div>
                <div className="pk-card-name">{capitalize(item.name)}</div>
                {data && (
                  <div className="pk-card-types">
                    {data.types.map(t => {
                      const s = getTypeStyle(t.type.name);
                      return (
                        <span key={t.type.name} className="pk-type" style={{ background: s.bg, color: s.text, borderColor: s.border }}>
                          {capitalize(t.type.name)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {!searchQuery && totalPages > 1 && (
        <div className="pk-pagination">
          <button className="pk-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={15} /> Prev
          </button>
          <span className="pk-page-info">Page {page + 1} of {totalPages}</span>
          <button className="pk-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
      }

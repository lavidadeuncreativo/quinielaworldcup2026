"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResultMap,
  buildStandings,
  completedMatches,
  flags,
  latestCompletedMatch,
  matchTeams,
  matches,
  nextPlayableMatch,
  stageLabels,
} from "@/lib/quiniela";

type Tab = "tabla" | "partidos" | "reglas";
type Guest = { name: string; emoji: string; color: string };
const nouns = ["Ajolote", "Nopal", "Jaguar", "Portero", "Taco", "Coyote", "Volcán", "Trompo"];
const adjectives = ["Galáctico", "Atómico", "Místico", "Relámpago", "Cósmico", "Bravo", "Neón", "Épico"];
const emojis = ["🦎", "🌵", "🐆", "🧤", "🌮", "🐺", "🌋", "⚽"];
const colors = ["#c6ff3d", "#13d9c0", "#ffcb43", "#ff7966", "#b9c8ff", "#ff9bdd"];

type RecentPoint = {
  id: string;
  name: string;
  short: string;
  points: number;
  reason: string;
  color: string;
};

const latestAwardedPoints: RecentPoint[] = [
  { id: "pedro", name: "Pedro", short: "PE", points: 3, reason: "Marcador exacto en España vs Austria.", color: "#dbe8dd" },
  { id: "israel", name: "Israel Cabrera", short: "IC", points: 1, reason: "Acertó al ganador en España vs Austria.", color: "#b9c8ff" },
  { id: "isra", name: "Isra chico", short: "IS", points: 1, reason: "Acertó al ganador en España vs Austria.", color: "#c9ffd5" },
  { id: "alfre", name: "Tío Alfre", short: "TA", points: 1, reason: "Acertó al ganador en España vs Austria.", color: "#ffe0c7" },
  { id: "liz", name: "Liz Flores", short: "LF", points: 1, reason: "Acertó al ganador en España vs Austria.", color: "#ffd4ea" },
  { id: "rebeca", name: "Rebeca Granados", short: "RG", points: 1, reason: "Acertó al ganador en España vs Austria.", color: "#e1d7ff" },
  { id: "alfredito", name: "Alfredito", short: "AL", points: 1, reason: "Acertó al ganador en España vs Austria.", color: "#fff0b8" },
  { id: "nuria", name: "Nuria", short: "NU", points: 1, reason: "Acertó al ganador en España vs Austria.", color: "#c8f3ff" },
];

const medalMeta = {
  1: { medal: "🥇", label: "Oro", className: "gold" },
  2: { medal: "🥈", label: "Plata", className: "silver" },
  3: { medal: "🥉", label: "Bronce", className: "bronze" },
} as const;

function makeGuest(): Guest {
  const i = Math.floor(Math.random() * nouns.length);
  return {
    name: `${nouns[i]} ${adjectives[Math.floor(Math.random() * adjectives.length)]} ${Math.floor(10 + Math.random() * 90)}`,
    emoji: emojis[i],
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("tabla");
  const [results, setResults] = useState<ResultMap>({});
  const [source, setSource] = useState("Sincronizando");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [recap, setRecap] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("quiniela-guest-v1");
    if (raw) {
      try {
        setGuest(JSON.parse(raw));
        return;
      } catch {}
    }
    const g = makeGuest();
    localStorage.setItem("quiniela-guest-v1", JSON.stringify(g));
    setGuest(g);
  }, []);

  useEffect(() => {
    let on = true;
    const sync = async () => {
      try {
        const r = await fetch("/api/results", { cache: "no-store" });
        const data = await r.json();
        if (!on) return;
        setResults(data.results || {});
        setSource(data.source === "supabase" ? "Datos en vivo" : "Modo demo");
      } catch {
        if (on) setSource("Sin conexión");
      }
    };

    sync();
    const id = setInterval(sync, 60000);
    return () => {
      on = false;
      clearInterval(id);
    };
  }, []);

  const table = useMemo(() => buildStandings(results), [results]);
  const next = useMemo(() => nextPlayableMatch(results), [results]);
  const last = useMemo(() => latestCompletedMatch(results), [results]);
  const completed = useMemo(() => completedMatches(results).length, [results]);
  const topThree = table.slice(0, 3);

  const randomize = () => {
    const g = makeGuest();
    localStorage.setItem("quiniela-guest-v1", JSON.stringify(g));
    setGuest(g);
  };

  const share = async () => {
    const imageUrl = `${location.origin}/api/share`;
    const text = "Así va la quiniela familiar 👀";
    try {
      const r = await fetch(imageUrl);
      const blob = await r.blob();
      const file = new File([blob], "tabla-quiniela.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Quiniela Familiar 2026",
          text,
          files: [file],
        });
        return;
      }
    } catch {}

    const fallback = `https://wa.me/?text=${encodeURIComponent(`${text}\n${location.origin}`)}`;
    window.open(fallback, "_blank", "noopener,noreferrer");
  };

  const ai = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standings: table.slice(0, 5),
          latest: last ? { teams: matchTeams(last, results), result: results[last.id] ?? last.baseResult } : null,
        }),
      });
      const data = await r.json();
      setRecap(data.recap || data.error || "No fue posible generar el resumen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="app">
        <header className="topbar">
          <div className="brand">
            <div className="mark">Q</div>
            <div>
              <strong>Quiniela Familiar</strong>
              <small>Mundial 2026 · no oficial</small>
            </div>
          </div>
          <div className="top-actions">
            <span className="sync"><i />{source}</span>
            {guest && (
              <button className="guest" onClick={randomize}>
                <b style={{ background: guest.color }}>{guest.emoji}</b>
                <span>{guest.name}</span>
              </button>
            )}
          </div>
        </header>

        <section className="hero compact-hero">
          <div>
            <span className="eyebrow">Consulta tu lugar y cómo se mueve la tabla</span>
            <h1>Mira en qué lugar vas y cómo se mueve la tabla.</h1>
            <p>Consulta la clasificación actual, los últimos puntos otorgados y el siguiente partido del torneo en una sola vista.</p>
            <div className="actions">
              <button className="primary" onClick={() => setTab("tabla")}>Ver tabla ahora</button>
              <button className="secondary" onClick={share}>Compartir por WhatsApp</button>
              <button className="secondary" onClick={ai} disabled={loading}>{loading ? "Escribiendo…" : "Resumen con IA"}</button>
            </div>
          </div>
          <aside className="next">
            <span>Próximo partido</span>
            {next ? (() => {
              const t = matchTeams(next, results);
              return <><small>{stageLabels[next.stage]}</small><div className="teams"><div><b>{flags[t.home]}</b><strong>{t.home}</strong></div><i>VS</i><div><b>{flags[t.away]}</b><strong>{t.away}</strong></div></div><footer>{next.date} · {next.time}<em>{next.venue}</em></footer></>;
            })() : <p>Torneo terminado.</p>}
          </aside>
        </section>

        {recap && <div className="recap"><div><span>Resumen automático</span><p>{recap}</p></div><button onClick={() => setRecap("")}>×</button></div>}

        <section className="surface first-surface">
          <nav>
            <button className={tab === "tabla" ? "active" : ""} onClick={() => setTab("tabla")}>Clasificación</button>
            <button className={tab === "partidos" ? "active" : ""} onClick={() => setTab("partidos")}>Partidos</button>
            <button className={tab === "reglas" ? "active" : ""} onClick={() => setTab("reglas")}>Reglas y premios</button>
          </nav>

          {tab === "tabla" && (
            <div className="dashboard emphasis-first">
              <article className="panel ranking feature-ranking">
                <header><div><span>Clasificación general</span><h2>Así va la tabla</h2></div><b>{completed} de 31</b></header>

                <div className="podium deluxe-podium">
                  {topThree.map((p) => {
                    const meta = medalMeta[p.rank as 1 | 2 | 3];
                    return <div className={`podium-card deluxe ${meta.className}`} key={p.id}><div className="medal">{meta.medal}</div><span className="position-label">{meta.label}</span><div className="avatar-ring" style={{ background: p.color }}>{p.short}</div><strong>{p.name}</strong><b>{p.points}<small> pts</small></b><span>{p.exact} marcadores exactos</span></div>;
                  })}
                </div>

                <div className="rows">
                  {table.slice(3).map((p) => <div className="row" key={p.id}><i>{p.rank}</i><div className="avatar" style={{ background: p.color }}>{p.short}</div><div><strong>{p.name}</strong><span>{p.exact} marcadores exactos</span></div><b>{p.points}<small> pts</small></b></div>)}
                </div>
              </article>

              <div className="stack">
                <article className="panel result"><span>Último resultado contabilizado</span>{last ? (() => { const t = matchTeams(last, results); const r = results[last.id] ?? last.baseResult; return r && <><div className="score"><div><b>{flags[t.home]}</b><strong>{t.home}</strong></div><i>{r.home}–{r.away}</i><div><b>{flags[t.away]}</b><strong>{t.away}</strong></div></div><p>La tabla ya incluye los puntos y marcadores exactos de este partido.</p></>; })() : <p>Aún no hay resultados.</p>}</article>

                <article className="panel audit log-panel">
                  <span>Últimos puntos otorgados</span>
                  <h2>Qué recibió cada quien y por qué</h2>
                  <p>Solo aparecen quienes sumaron puntos en el último resultado contabilizado.</p>
                  <div className="point-log-list">
                    {latestAwardedPoints.map((item) => <div key={item.id} className="point-log-item"><div className="point-log-head"><div className="mini-avatar" style={{ background: item.color }}>{item.short}</div><strong>{item.name}</strong><b>+{item.points}</b></div><em>{item.reason}</em></div>)}
                  </div>
                </article>
              </div>
            </div>
          )}

          {tab === "partidos" && <div className="calendar">{Object.entries(stageLabels).map(([stage, label]) => <section key={stage}><header><h2>{label}</h2><span>{matches.filter((m) => m.stage === stage).length} partidos</span></header><div>{matches.filter((m) => m.stage === stage).map((m) => { const t = matchTeams(m, results); const r = results[m.id] ?? m.baseResult; return <article className={r ? "finished" : ""} key={m.id}><small>Partido {m.id} · {m.excluded ? "Excluido" : r ? "Final" : "Pendiente"}</small><p><strong>{flags[t.home]} {t.home}</strong><b>{r ? r.home : "–"}</b></p><p><strong>{flags[t.away]} {t.away}</strong><b>{r ? r.away : "–"}</b></p><footer>{m.date} · {m.time}<em>{m.venue}</em></footer></article>; })}</div></section>)}</div>}

          {tab === "reglas" && <div className="rules"><article className="blue"><span>01</span><h2>Marcador exacto</h2><b>3 puntos</b><p>Coincide exactamente con el resultado de los 90 minutos.</p></article><article><span>02</span><h2>Ganador o clasificado</h2><b>1 punto</b><p>Cuando no hay exacto, se reconoce el equipo correcto.</p></article><article><span>03</span><h2>Empate exacto</h2><b>Hasta 4 puntos</b><p>3 por el empate exacto y 1 adicional por el clasificado.</p></article><article className="dark"><span>Bolsa total</span><h2>$1,800 MXN</h2><div><b>1.º $1,000</b><b>2.º $500</b><b>3.º $300</b></div></article></div>}
        </section>

        <footer className="stats"><div><strong>$1,800</strong><span>Bolsa total</span></div><div><strong>9</strong><span>Participantes</span></div><div><strong>{completed}/31</strong><span>Partidos</span></div><div><strong>En vivo</strong><span>Estado</span></div></footer>
      </section>
    </main>
  );
}

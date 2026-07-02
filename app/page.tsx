"use client";

import { useEffect, useMemo, useState } from "react";
import { ResultMap, buildStandings, completedMatches, flags, latestCompletedMatch, matchTeams, matches, nextPlayableMatch, stageLabels } from "@/lib/quiniela";

type Tab="tabla"|"partidos"|"reglas";
type Guest={name:string;emoji:string;color:string};
const nouns=["Ajolote","Nopal","Jaguar","Portero","Taco","Coyote","Volcán","Trompo"];
const adjectives=["Galáctico","Atómico","Místico","Relámpago","Cósmico","Bravo","Neón","Épico"];
const emojis=["🦎","🌵","🐆","🧤","🌮","🐺","🌋","⚽"];
const colors=["#c6ff3d","#13d9c0","#ffcb43","#ff7966","#b9c8ff","#ff9bdd"];

function makeGuest():Guest{const i=Math.floor(Math.random()*nouns.length);return{name:`${nouns[i]} ${adjectives[Math.floor(Math.random()*adjectives.length)]} ${Math.floor(10+Math.random()*90)}`,emoji:emojis[i],color:colors[Math.floor(Math.random()*colors.length)]}}

export default function Home(){
 const[tab,setTab]=useState<Tab>("tabla");
 const[results,setResults]=useState<ResultMap>({});
 const[source,setSource]=useState("Sincronizando");
 const[guest,setGuest]=useState<Guest|null>(null);
 const[recap,setRecap]=useState("");
 const[loading,setLoading]=useState(false);

 useEffect(()=>{const raw=localStorage.getItem("quiniela-guest-v1");if(raw){try{setGuest(JSON.parse(raw))}catch{}}else{const g=makeGuest();localStorage.setItem("quiniela-guest-v1",JSON.stringify(g));setGuest(g)}},[]);
 useEffect(()=>{let on=true;const sync=async()=>{try{const r=await fetch("/api/results",{cache:"no-store"});const data=await r.json();if(on){setResults(data.results||{});setSource(data.source==="supabase"?"Datos en vivo":"Modo demo")}}catch{if(on)setSource("Sin conexión")}};sync();const id=setInterval(sync,60000);return()=>{on=false;clearInterval(id)}},[]);

 const table=useMemo(()=>buildStandings(results),[results]);
 const next=useMemo(()=>nextPlayableMatch(results),[results]);
 const last=useMemo(()=>latestCompletedMatch(results),[results]);
 const completed=useMemo(()=>completedMatches(results).length,[results]);

 const randomize=()=>{const g=makeGuest();localStorage.setItem("quiniela-guest-v1",JSON.stringify(g));setGuest(g)};
 const share=async()=>{const url=`${location.origin}/api/share`;try{const r=await fetch(url);const blob=await r.blob();const file=new File([blob],"tabla-quiniela.png",{type:"image/png"});if(navigator.share&&navigator.canShare?.({files:[file]}))await navigator.share({title:"Quiniela Familiar 2026",text:"Así va la tabla.",files:[file]});else{const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=file.name;a.click()}}catch{navigator.clipboard?.writeText(location.href)}};
 const ai=async()=>{setLoading(true);try{const r=await fetch("/api/recap",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({standings:table.slice(0,5),latest:last?{teams:matchTeams(last,results),result:results[last.id]??last.baseResult}:null})});const data=await r.json();setRecap(data.recap||data.error||"No fue posible generar el resumen.")}finally{setLoading(false)}};

 return <main className="page"><section className="app">
  <header className="topbar">
   <div className="brand"><div className="mark">Q</div><div><strong>Quiniela Familiar</strong><small>Mundial 2026 · no oficial</small></div></div>
   <div className="top-actions"><span className="sync"><i/>{source}</span>{guest&&<button className="guest" onClick={randomize}><b style={{background:guest.color}}>{guest.emoji}</b><span>{guest.name}</span></button>}</div>
  </header>

  <section className="hero">
   <div><span className="eyebrow">Tabla actualizada después de cada partido</span><h1>La competencia familiar, bien llevada.</h1><p>Resultados, puntos y posiciones en una sola vista. El sistema conserva el historial y recalcula la tabla cuando entra un marcador final.</p><div className="actions"><button className="primary" onClick={share}>Compartir tabla</button><button className="secondary" onClick={ai} disabled={loading}>{loading?"Escribiendo…":"Resumen con IA"}</button></div></div>
   <aside className="next"><span>Próximo partido</span>{next?(()=>{const t=matchTeams(next,results);return <><small>{stageLabels[next.stage]}</small><div className="teams"><div><b>{flags[t.home]}</b><strong>{t.home}</strong></div><i>VS</i><div><b>{flags[t.away]}</b><strong>{t.away}</strong></div></div><footer>{next.date} · {next.time}<em>{next.venue}</em></footer></>})():<p>Torneo terminado.</p>}</aside>
  </section>

  {recap&&<div className="recap"><div><span>Resumen automático</span><p>{recap}</p></div><button onClick={()=>setRecap("")}>×</button></div>}

  <section className="surface">
   <nav><button className={tab==="tabla"?"active":""} onClick={()=>setTab("tabla")}>Clasificación</button><button className={tab==="partidos"?"active":""} onClick={()=>setTab("partidos")}>Partidos</button><button className={tab==="reglas"?"active":""} onClick={()=>setTab("reglas")}>Reglas y premios</button></nav>

   {tab==="tabla"&&<div className="dashboard">
    <article className="panel ranking"><header><div><span>Clasificación general</span><h2>Así va la tabla</h2></div><b>{completed} de 31</b></header>
     <div className="podium">{[table[1],table[0],table[2]].map((p,i)=>{const pos=[2,1,3][i];return p&&<div className={`podium-card p${pos}`} key={p.id}><i>{pos}</i><div style={{background:p.color}}>{p.short}</div><strong>{p.name}</strong><b>{p.points}<small> pts</small></b><span>{p.exact} exactos</span></div>})}</div>
     <div className="rows">{table.slice(3).map(p=><div className="row" key={p.id}><i>{p.rank}</i><div className="avatar" style={{background:p.color}}>{p.short}</div><div><strong>{p.name}</strong><span>{p.exact} marcadores exactos</span></div><b>{p.points}<small> pts</small></b></div>)}</div>
    </article>
    <div className="stack">
     <article className="panel result"><span>Último resultado contabilizado</span>{last?(()=>{const t=matchTeams(last,results),r=results[last.id]??last.baseResult;return r&&<><div className="score"><div><b>{flags[t.home]}</b><strong>{t.home}</strong></div><i>{r.home}–{r.away}</i><div><b>{flags[t.away]}</b><strong>{t.away}</strong></div></div><p>La tabla ya incluye los puntos y marcadores exactos de este partido.</p></>})():<p>Aún no hay resultados.</p>}</article>
     <article className="panel audit"><span>Transparencia</span><h2>Cada punto tiene explicación</h2><p>Se guarda el pronóstico, resultado, regla aplicada y puntos otorgados. Nada depende de una interpretación manual.</p><div><small>España 3–0 Austria</small><strong>Israel: +1</strong><em>Acertó al equipo ganador</em></div></article>
    </div>
   </div>}

   {tab==="partidos"&&<div className="calendar">{Object.entries(stageLabels).map(([stage,label])=><section key={stage}><header><h2>{label}</h2><span>{matches.filter(m=>m.stage===stage).length} partidos</span></header><div>{matches.filter(m=>m.stage===stage).map(m=>{const t=matchTeams(m,results),r=results[m.id]??m.baseResult;return <article className={r?"finished":""} key={m.id}><small>Partido {m.id} · {m.excluded?"Excluido":r?"Final":"Pendiente"}</small><p><strong>{flags[t.home]} {t.home}</strong><b>{r?r.home:"–"}</b></p><p><strong>{flags[t.away]} {t.away}</strong><b>{r?r.away:"–"}</b></p><footer>{m.date} · {m.time}<em>{m.venue}</em></footer></article>})}</div></section>)}</div>}

   {tab==="reglas"&&<div className="rules"><article className="blue"><span>01</span><h2>Marcador exacto</h2><b>3 puntos</b><p>Coincide exactamente con el resultado de los 90 minutos.</p></article><article><span>02</span><h2>Ganador o clasificado</h2><b>1 punto</b><p>Cuando no hay exacto, se reconoce el equipo correcto.</p></article><article><span>03</span><h2>Empate exacto</h2><b>Hasta 4 puntos</b><p>3 por el empate exacto y 1 adicional por el clasificado.</p></article><article className="dark"><span>Bolsa total</span><h2>$1,800 MXN</h2><div><b>1.º $1,000</b><b>2.º $500</b><b>3.º $300</b></div></article></div>}
  </section>

  <footer className="stats"><div><strong>$1,800</strong><span>Bolsa total</span></div><div><strong>9</strong><span>Participantes</span></div><div><strong>{completed}/31</strong><span>Partidos</span></div><div><strong>En vivo</strong><span>Estado</span></div></footer>
 </section></main>
}

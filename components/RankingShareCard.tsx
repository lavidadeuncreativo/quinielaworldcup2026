import type { Standing } from "@/lib/quiniela";
import { participantPhotos } from "@/lib/participantPhotos";

type Props = {
  table: Standing[];
  source: string;
  completed: number;
  generatedAt?: string;
};

const today = () => new Intl.DateTimeFormat("es-MX", {
  timeZone: "America/Mexico_City",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit"
}).format(new Date());

function SharePhoto({player,className}:{player:Standing;className:string}){
  const photo = participantPhotos[player.id];
  return <div className={`${className} ${photo?"face-photo":""}`} style={photo?{backgroundImage:`url(${photo})`,backgroundColor:player.color}:{background:player.color}}><span>{player.short}</span></div>
}

export default function RankingShareCard({table,source,completed,generatedAt}:Props){
  const top = table.slice(0,3);
  const rest = table.slice(3);
  return <section className="share-card">
    <header>
      <div className="share-brand"><b>⚽</b><div><strong>Quiniela Familiar 2026</strong><span>Tabla de posiciones</span></div></div>
      <div className="share-meta"><span>{generatedAt ?? today()}</span><small>{source}</small></div>
    </header>
    <div className="share-title">Así va la tabla.</div>
    <div className="share-subtitle">{completed}/31 partidos contabilizados · bolsa $1,800 MXN</div>
    <div className="share-podium">
      {top.map((player,index)=><article key={player.id} className={`share-podium-card rank-${index+1}`}>
        <i>{index+1}</i>
        <strong className="medal-label">{index===0?"Oro - 1er lugar":index===1?"Plata - 2do lugar":"Bronce - 3er lugar"}</strong>
        <SharePhoto player={player} className="share-avatar" />
        <strong>{player.name}</strong>
        <b>{player.points}<span> pts</span></b>
        <small>{player.exact} exactos</small>
      </article>)}
    </div>
    <div className="share-list">
      {rest.map((player,index)=><article key={player.id}>
        <i>{index+4}</i>
        <SharePhoto player={player} className="share-mini" />
        <strong>{player.name}</strong>
        <b>{player.points}<span> pts</span></b>
      </article>)}
    </div>
    <footer><span>Actualización automática</span><b>quiniela familiar</b></footer>
  </section>
}

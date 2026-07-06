import { ImageResponse } from "next/og";
import { buildStandings, type ResultMap } from "@/lib/quiniela";

export const runtime = "edge";

const podiumStyle = (rank:number) => rank===1
  ? { background:"#fff2b7", borderColor:"#f1c94f" }
  : rank===2
    ? { background:"#f2f5fb", borderColor:"#d5ddec" }
    : { background:"#ffe3c8", borderColor:"#e6b17f" };

const medalText = (rank:number) => rank===1 ? "1" : rank===2 ? "2" : rank===3 ? "3" : String(rank);

async function getResults(request:Request){
  try{
    const response = await fetch(new URL("/api/results", request.url), { cache:"no-store" });
    const data = await response.json() as { results?: ResultMap };
    return data.results ?? {};
  }catch{
    return {};
  }
}

export async function GET(request:Request){
  const results = await getResults(request);
  const table = buildStandings(results);
  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";

  return new ImageResponse(
    <div style={{width:"1080px",height:"1350px",display:"flex",flexDirection:"column",padding:"64px",background:"#07131f",color:"white",fontFamily:"Arial, sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"18px"}}>
          <div style={{width:"68px",height:"68px",borderRadius:"20px",background:"#c6ff3d",color:"#102230",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"32px",fontWeight:900}}>Q</div>
          <div style={{display:"flex",flexDirection:"column"}}>
            <div style={{fontSize:"30px",fontWeight:900}}>Quiniela Familiar 2026</div>
            <div style={{marginTop:"6px",fontSize:"18px",color:"#9fb5c4"}}>Tabla de posiciones</div>
          </div>
        </div>
        <div style={{fontSize:"18px",color:"#9fb5c4",fontWeight:700}}>No oficial</div>
      </div>

      <div style={{marginTop:"58px",fontSize:"78px",lineHeight:.95,letterSpacing:"-4px",fontWeight:900}}>Así va la tabla.</div>
      <div style={{marginTop:"16px",fontSize:"26px",color:"#b7c9d4"}}>Clasificación general con los últimos resultados disponibles.</div>

      <div style={{marginTop:"44px",display:"flex",gap:"16px"}}>
        {table.slice(0,3).map((p)=>{
          const style = podiumStyle(p.rank);
          return <div key={p.id} style={{flex:1,minHeight:"300px",borderRadius:"30px",padding:"26px",background:style.background,border:`3px solid ${style.borderColor}`,color:"#102230",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:"54px",height:"54px",borderRadius:"18px",background:"#102230",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"25px",fontWeight:900}}>{medalText(p.rank)}</div>
            <div style={{marginTop:"18px",width:"78px",height:"78px",borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:"23px"}}>{p.short}</div>
            <div style={{marginTop:"16px",fontSize:"25px",fontWeight:900,textAlign:"center"}}>{p.name}</div>
            <div style={{marginTop:"10px",fontSize:"48px",fontWeight:900}}>{p.points}</div>
            <div style={{fontSize:"16px",color:"#55636e",fontWeight:800}}>{p.exact} exactos</div>
          </div>
        })}
      </div>

      <div style={{marginTop:"22px",display:"flex",flexDirection:"column",gap:"12px",padding:"22px",borderRadius:"34px",background:"#f5f7f4",color:"#102230"}}>
        {table.slice(3).map((p)=><div key={p.id} style={{display:"flex",alignItems:"center",minHeight:"80px",padding:"0 24px",borderRadius:"22px",background:"white",border:"1px solid #e7ece9"}}>
          <div style={{width:"56px",fontSize:"24px",fontWeight:900,color:"#72808a"}}>{p.rank}</div>
          <div style={{width:"54px",height:"54px",borderRadius:"50%",background:p.color,color:"#102230",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>{p.short}</div>
          <div style={{flex:1,marginLeft:"18px",fontSize:"25px",fontWeight:900}}>{p.name}</div>
          <div style={{fontSize:"36px",fontWeight:900,color:"#2b57ff"}}>{p.points}</div>
          <div style={{marginLeft:"8px",fontSize:"16px",fontWeight:900,color:"#71808a"}}>PTS</div>
        </div>)}
      </div>

      <div style={{marginTop:"auto",display:"flex",justifyContent:"space-between",fontSize:"20px",fontWeight:800,color:"#93a9b8"}}>
        <span>$1,800 MXN · 9 participantes</span>
        <span>quiniela familiar</span>
      </div>
    </div>,
    {
      width:1080,
      height:1350,
      headers:{
        "Content-Type":"image/png",
        "Cache-Control":"no-store",
        "Content-Disposition":`${download ? "attachment" : "inline"}; filename="tabla-quiniela.png"`
      }
    }
  );
}

import { ImageResponse } from "next/og";
import { buildStandings } from "@/lib/quiniela";

export const runtime="edge";

export async function GET(){
 const table=buildStandings({});
 return new ImageResponse(<div style={{width:"1080px",height:"1350px",display:"flex",flexDirection:"column",padding:"72px",color:"white",background:"linear-gradient(145deg,#07131f,#0d2a3d)",fontFamily:"sans-serif"}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:"18px",fontSize:"28px",fontWeight:800}}><div style={{width:"62px",height:"62px",borderRadius:"20px",background:"#c6ff3d",color:"#102230",display:"flex",alignItems:"center",justifyContent:"center"}}>Q</div>Quiniela Familiar 2026</div><div style={{fontSize:"20px",color:"#9db2c0"}}>Tabla no oficial</div></div>
  <div style={{marginTop:"74px",fontSize:"92px",lineHeight:.94,letterSpacing:"-6px",fontWeight:900}}>Así va<br/>la tabla.</div>
  <div style={{marginTop:"24px",fontSize:"26px",color:"#b7c9d4"}}>Clasificación general después del último resultado contabilizado.</div>
  <div style={{marginTop:"58px",display:"flex",flexDirection:"column",gap:"12px",padding:"24px",borderRadius:"34px",background:"#f5f7f4",color:"#102230"}}>{table.map(p=><div key={p.id} style={{display:"flex",alignItems:"center",minHeight:"82px",padding:"0 24px",borderRadius:"22px",background:p.rank===1?"#10283b":"white",color:p.rank===1?"white":"#102230"}}><div style={{width:"58px",fontSize:"25px",fontWeight:900}}>{p.rank}</div><div style={{width:"54px",height:"54px",borderRadius:"50%",background:p.color,color:"#102230",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>{p.short}</div><div style={{flex:1,marginLeft:"18px",fontSize:"25px",fontWeight:800}}>{p.name}</div><div style={{fontSize:"34px",fontWeight:900,color:p.rank===1?"#c6ff3d":"#2b57ff"}}>{p.points}</div><div style={{marginLeft:"8px",fontSize:"16px",fontWeight:800,opacity:.72}}>PTS</div></div>)}</div>
  <div style={{marginTop:"auto",display:"flex",justifyContent:"space-between",color:"#93a9b8",fontSize:"20px",fontWeight:700}}><span>$1,800 MXN · 9 participantes</span><span>quiniela familiar</span></div>
 </div>,{width:1080,height:1350});
}

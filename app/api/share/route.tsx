import { NextResponse } from "next/server";
import { buildStandings, type ResultMap } from "@/lib/quiniela";

export const dynamic = "force-dynamic";

function esc(value:string){return value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&apos;"}[char] as string))}

async function getResults(request:Request){
 try{
  const response=await fetch(new URL("/api/results",request.url),{cache:"no-store"});
  const data=await response.json() as {results?:ResultMap};
  return data.results??{};
 }catch{return {}}
}

export async function GET(request:Request){
 const table=buildStandings(await getResults(request));
 const top=table.slice(0,3).map((p,i)=>`<g transform="translate(${76+i*314} 352)"><rect width="286" height="292" rx="34" fill="${i===0?"#fff2b7":i===1?"#f2f5fb":"#ffe3c8"}" stroke="${i===0?"#f1c94f":i===1?"#d5ddec":"#e6b17f"}" stroke-width="3"/><circle cx="143" cy="96" r="42" fill="${p.color}"/><text x="143" y="107" text-anchor="middle" font-size="24" font-weight="900" fill="#102230">${esc(p.short)}</text><text x="143" y="164" text-anchor="middle" font-size="25" font-weight="900" fill="#102230">${esc(p.name)}</text><text x="143" y="220" text-anchor="middle" font-size="52" font-weight="900" fill="#102230">${p.points}</text><text x="143" y="252" text-anchor="middle" font-size="17" font-weight="800" fill="#5d6b75">${p.exact} exactos</text></g>`).join("");
 const rest=table.slice(3).map((p,i)=>`<g transform="translate(76 ${704+i*92})"><rect width="928" height="76" rx="24" fill="#ffffff"/><text x="34" y="48" font-size="24" font-weight="900" fill="#72808a">${p.rank}</text><circle cx="96" cy="38" r="27" fill="${p.color}"/><text x="96" y="46" text-anchor="middle" font-size="16" font-weight="900" fill="#102230">${esc(p.short)}</text><text x="142" y="48" font-size="25" font-weight="900" fill="#102230">${esc(p.name)}</text><text x="850" y="49" text-anchor="end" font-size="36" font-weight="900" fill="#2b57ff">${p.points}</text><text x="858" y="48" font-size="16" font-weight="900" fill="#71808a">PTS</text></g>`).join("");
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#07131f"/><stop offset="1" stop-color="#0d2b40"/></linearGradient></defs><rect width="1080" height="1350" fill="url(#bg)"/><circle cx="910" cy="0" r="360" fill="#7057ff" opacity=".38"/><rect x="76" y="64" width="68" height="68" rx="20" fill="#c6ff3d"/><text x="110" y="108" text-anchor="middle" font-family="Arial" font-size="32" font-weight="900" fill="#102230">Q</text><text x="164" y="98" font-family="Arial" font-size="30" font-weight="900" fill="#fff">Quiniela Familiar 2026</text><text x="164" y="126" font-family="Arial" font-size="18" font-weight="700" fill="#a9bdca">Tabla de posiciones</text><text x="76" y="246" font-family="Arial" font-size="82" font-weight="900" letter-spacing="-4" fill="#fff">Así va la tabla.</text><text x="76" y="294" font-family="Arial" font-size="26" fill="#b7c9d4">Clasificación general con los últimos resultados disponibles.</text>${top}<rect x="54" y="682" width="972" height="584" rx="38" fill="#f5f7f4"/>${rest}<text x="76" y="1304" font-family="Arial" font-size="20" font-weight="800" fill="#93a9b8">$1,800 MXN · 9 participantes</text><text x="1004" y="1304" text-anchor="end" font-family="Arial" font-size="20" font-weight="800" fill="#93a9b8">quiniela familiar</text></svg>`;
 return new NextResponse(svg,{headers:{"Content-Type":"image/svg+xml; charset=utf-8","Cache-Control":"no-store"}});
}

import { NextResponse } from "next/server";
import { matchTeams, matches, type MatchResult, type ResultMap } from "@/lib/quiniela";

export const dynamic = "force-dynamic";

type SupabaseRow = {
  external_id:string;
  home_score:number|null;
  away_score:number|null;
  qualified_side:"home"|"away"|null;
  status:string;
  completed_at?:string|null;
};

type ApiFixture = {
  fixture:{ id:number; date:string; status:{ short:string } };
  teams:{
    home:{ name:string; winner:boolean|null };
    away:{ name:string; winner:boolean|null };
  };
  goals:{ home:number|null; away:number|null };
  score:{
    fulltime:{ home:number|null; away:number|null };
    extratime:{ home:number|null; away:number|null };
    penalty:{ home:number|null; away:number|null };
  };
};

const finishedStatuses = new Set(["FT","AET","PEN"]);
const aliases:Record<string,string> = {
  "south africa":"Sudáfrica",
  "canada":"Canadá",
  "germany":"Alemania",
  "paraguay":"Paraguay",
  "netherlands":"Países Bajos",
  "morocco":"Marruecos",
  "brazil":"Brasil",
  "japan":"Japón",
  "france":"Francia",
  "sweden":"Suecia",
  "ivory coast":"Costa de Marfil",
  "cote d ivoire":"Costa de Marfil",
  "norway":"Noruega",
  "mexico":"México",
  "ecuador":"Ecuador",
  "england":"Inglaterra",
  "dr congo":"RD Congo",
  "congo dr":"RD Congo",
  "united states":"Estados Unidos",
  "usa":"Estados Unidos",
  "bosnia and herzegovina":"Bosnia y Herzegovina",
  "bosnia herzegovina":"Bosnia y Herzegovina",
  "belgium":"Bélgica",
  "senegal":"Senegal",
  "portugal":"Portugal",
  "croatia":"Croacia",
  "spain":"España",
  "austria":"Austria",
  "switzerland":"Suiza",
  "algeria":"Argelia",
  "argentina":"Argentina",
  "cape verde":"Cabo Verde",
  "colombia":"Colombia",
  "ghana":"Ghana",
  "australia":"Australia",
  "egypt":"Egipto"
};

function key(value:string){
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z ]/g," ").replace(/\s+/g," ").trim().toLowerCase();
}

function normalizeTeam(value:string){
  return aliases[key(value)] ?? value;
}

async function loadFromApiFootball():Promise<ResultMap|null>{
  const apiKey = process.env.API_FOOTBALL_KEY ?? process.env.SPORTS_API_KEY;
  if(!apiKey) return null;

  const endpoint = "https://v3.football.api-sports.io/fixtures?league=1&season=2026&from=2026-06-28&to=2026-07-19";
  const response = await fetch(endpoint,{
    headers:{ "x-apisports-key":apiKey },
    next:{ revalidate:7200 }
  });
  if(!response.ok) throw new Error(`API-Football ${response.status}`);
  const body = await response.json() as { response:ApiFixture[] };
  const fixtures = (body.response ?? []).filter(item=>finishedStatuses.has(item.fixture.status.short)).sort((a,b)=>Date.parse(a.fixture.date)-Date.parse(b.fixture.date));
  const results:ResultMap = {};

  for(const fixture of fixtures){
    const apiHome = normalizeTeam(fixture.teams.home.name);
    const apiAway = normalizeTeam(fixture.teams.away.name);
    const candidate = matches.find(match=>{
      if(match.excluded || results[match.id]) return false;
      const teams = matchTeams(match,results);
      return (teams.home===apiHome && teams.away===apiAway) || (teams.home===apiAway && teams.away===apiHome);
    });
    if(!candidate) continue;

    const teams = matchTeams(candidate,results);
    const reversed = teams.home===apiAway && teams.away===apiHome;
    const rawHome = fixture.score.fulltime.home ?? fixture.goals.home;
    const rawAway = fixture.score.fulltime.away ?? fixture.goals.away;
    if(rawHome===null || rawAway===null) continue;

    const home = reversed ? rawAway : rawHome;
    const away = reversed ? rawHome : rawAway;
    let qualified:"home"|"away"|null = null;
    const apiWinner = fixture.teams.home.winner ? "home" : fixture.teams.away.winner ? "away" : null;
    if(apiWinner) qualified = reversed ? (apiWinner==="home"?"away":"home") : apiWinner;

    const result:MatchResult = { home, away, qualified, final:true, completedAt:fixture.fixture.date };
    results[candidate.id] = result;
  }
  return results;
}

async function loadFromSupabase():Promise<ResultMap|null>{
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const keyValue = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !keyValue) return null;
  const response = await fetch(`${url}/rest/v1/matches?select=external_id,home_score,away_score,qualified_side,status,completed_at&status=eq.final`,{
    headers:{ apikey:keyValue, Authorization:`Bearer ${keyValue}` },
    cache:"no-store"
  });
  if(!response.ok) throw new Error(`Supabase ${response.status}`);
  const rows = await response.json() as SupabaseRow[];
  const results:ResultMap = {};
  rows.forEach(row=>{
    if(row.home_score===null || row.away_score===null) return;
    results[row.external_id] = { home:row.home_score, away:row.away_score, qualified:row.qualified_side, final:true, completedAt:row.completed_at ?? undefined };
  });
  return results;
}

export async function GET(){
  try{
    const apiResults = await loadFromApiFootball();
    const databaseResults = await loadFromSupabase();
    const results = { ...(apiResults ?? {}), ...(databaseResults ?? {}) };
    const source = databaseResults ? "supabase" : apiResults ? "api-football" : "demo";
    return NextResponse.json({ results, source, refreshSeconds:7200, generatedAt:new Date().toISOString() },{
      headers:{ "Cache-Control":"public, s-maxage=7200, stale-while-revalidate=300" }
    });
  }catch(error){
    console.error(error);
    return NextResponse.json({ results:{}, source:"demo", error:"No fue posible sincronizar resultados." },{ status:200 });
  }
}

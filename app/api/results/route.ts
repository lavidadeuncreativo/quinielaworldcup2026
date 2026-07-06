import { NextResponse } from "next/server";
import { matchTeams, matches, type MatchResult, type ResultMap } from "@/lib/quiniela";

export const dynamic = "force-dynamic";

type FixtureInfo = {
  dateUtc:string;
  status:string;
  statusLong?:string;
  elapsed?:number|null;
  venue?:string;
  homeScore?:number|null;
  awayScore?:number|null;
  isLive?:boolean;
};
type FixtureMap = Record<string, FixtureInfo>;
type SyncPayload = { results:ResultMap; fixtures:FixtureMap; hasLive:boolean };
type SupabaseRow = { external_id:string; home_score:number|null; away_score:number|null; qualified_side:"home"|"away"|null; status:string; completed_at?:string|null };
type ApiFixture = {
  fixture:{
    id:number;
    date:string;
    status:{ short:string; long?:string; elapsed?:number|null };
    venue?:{ name?:string|null; city?:string|null };
  };
  teams:{ home:{ name:string; winner:boolean|null }; away:{ name:string; winner:boolean|null } };
  goals:{ home:number|null; away:number|null };
  score:{ fulltime:{ home:number|null; away:number|null } };
};

const finishedStatuses = new Set(["FT","AET","PEN"]);
const liveStatuses = new Set(["1H","HT","2H","ET","BT","P","LIVE","INT"]);
const aliases:Record<string,string>={"south africa":"Sudáfrica",canada:"Canadá",germany:"Alemania",paraguay:"Paraguay",netherlands:"Países Bajos",morocco:"Marruecos",brazil:"Brasil",japan:"Japón",france:"Francia",sweden:"Suecia","ivory coast":"Costa de Marfil","cote d ivoire":"Costa de Marfil",norway:"Noruega",mexico:"México",ecuador:"Ecuador",england:"Inglaterra","dr congo":"RD Congo","congo dr":"RD Congo","united states":"Estados Unidos",usa:"Estados Unidos","bosnia and herzegovina":"Bosnia y Herzegovina","bosnia herzegovina":"Bosnia y Herzegovina",belgium:"Bélgica",senegal:"Senegal",portugal:"Portugal",croatia:"Croacia",spain:"España",austria:"Austria",switzerland:"Suiza",algeria:"Argelia",argentina:"Argentina","cape verde":"Cabo Verde",colombia:"Colombia",ghana:"Ghana",australia:"Australia",egypt:"Egipto"};
function key(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z ]/g," ").replace(/\s+/g," ").trim().toLowerCase()}
function normalizeTeam(value:string){return aliases[key(value)]??value}
function venueName(item:ApiFixture){return [item.fixture.venue?.name,item.fixture.venue?.city].filter(Boolean).join(" · ")||undefined}
function findMatch(apiHome:string,apiAway:string,results:ResultMap){return matches.find(match=>{if(match.excluded)return false;const teams=matchTeams(match,results);return (teams.home===apiHome&&teams.away===apiAway)||(teams.home===apiAway&&teams.away===apiHome)})}

async function loadFromApiFootball():Promise<SyncPayload|null>{
 const apiKey=process.env.API_FOOTBALL_KEY??process.env.SPORTS_API_KEY;if(!apiKey)return null;
 const endpoint="https://v3.football.api-sports.io/fixtures?league=1&season=2026&from=2026-06-28&to=2026-07-19";
 const response=await fetch(endpoint,{headers:{"x-apisports-key":apiKey},cache:"no-store"});
 if(!response.ok)throw new Error(`API-Football ${response.status}`);
 const body=await response.json() as { response:ApiFixture[] };
 const items=(body.response??[]).sort((a,b)=>Date.parse(a.fixture.date)-Date.parse(b.fixture.date));
 const results:ResultMap={};const fixtures:FixtureMap={};let hasLive=false;
 for(const item of items){
  const apiHome=normalizeTeam(item.teams.home.name),apiAway=normalizeTeam(item.teams.away.name),match=findMatch(apiHome,apiAway,results);if(!match)continue;
  const teams=matchTeams(match,results),reversed=teams.home===apiAway&&teams.away===apiHome;
  const liveHome=reversed?item.goals.away:item.goals.home,liveAway=reversed?item.goals.home:item.goals.away;
  const status=item.fixture.status.short,isLive=liveStatuses.has(status);
  if(isLive)hasLive=true;
  fixtures[match.id]={dateUtc:item.fixture.date,status,statusLong:item.fixture.status.long,elapsed:item.fixture.status.elapsed??null,venue:venueName(item),homeScore:liveHome,awayScore:liveAway,isLive};
  if(!finishedStatuses.has(status))continue;
  const rawHome=item.score.fulltime.home??item.goals.home,rawAway=item.score.fulltime.away??item.goals.away;if(rawHome===null||rawAway===null)continue;
  const home=reversed?rawAway:rawHome,away=reversed?rawHome:rawAway;
  const apiWinner=item.teams.home.winner?"home":item.teams.away.winner?"away":null;
  const qualified=apiWinner?(reversed?(apiWinner==="home"?"away":"home"):apiWinner):null;
  results[match.id]={home,away,qualified,final:true,completedAt:item.fixture.date};
 }
 return {results,fixtures,hasLive};
}

async function loadFromSupabase():Promise<ResultMap|null>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,keyValue=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!keyValue)return null;
 const response=await fetch(`${url}/rest/v1/matches?select=external_id,home_score,away_score,qualified_side,status,completed_at&status=eq.final`,{headers:{apikey:keyValue,Authorization:`Bearer ${keyValue}`},cache:"no-store"});
 if(!response.ok)throw new Error(`Supabase ${response.status}`);
 const rows=await response.json() as SupabaseRow[];const results:ResultMap={};
 rows.forEach(row=>{if(row.home_score===null||row.away_score===null)return;results[row.external_id]={home:row.home_score,away:row.away_score,qualified:row.qualified_side,final:true,completedAt:row.completed_at??undefined}});
 return results;
}

export async function GET(){
 try{
  const apiPayload=await loadFromApiFootball();
  const databaseResults=await loadFromSupabase();
  const results={...(apiPayload?.results??{}),...(databaseResults??{})};
  const source=databaseResults?"supabase":apiPayload?"api-football":"demo";
  const refreshSeconds=apiPayload?.hasLive?30:300;
  return NextResponse.json({results,fixtures:apiPayload?.fixtures??{},source,hasLive:apiPayload?.hasLive??false,refreshSeconds,generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"public, s-maxage=30, stale-while-revalidate=15"}});
 }catch(error){console.error(error);return NextResponse.json({results:{},fixtures:{},source:"demo",hasLive:false,error:"No fue posible sincronizar resultados."},{status:200})}
}

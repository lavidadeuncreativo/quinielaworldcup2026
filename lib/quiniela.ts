export type Participant = { id:string; name:string; short:string; color:string; basePoints:number; baseExact:number };
export type Slot = { type:"team"; team:string } | { type:"winner"|"loser"; matchId:string };
export type MatchResult = { home:number; away:number; qualified?:"home"|"away"|null; final?:boolean; completedAt?:string };
export type Match = { id:string; stage:"r32"|"r16"|"qf"|"sf"|"third"|"final"; date:string; time:string; venue:string; home:Slot; away:Slot; excluded?:boolean; fixedWinner?:string; baseResult?:MatchResult; includedInBase?:boolean };
export type Prediction = [number,number,("home"|"away")?] | null;
export type ResultMap = Record<string,MatchResult>;
export type Standing = Participant & { points:number; exact:number; recent:number; rank:number };
export type PointAward = Participant & { awarded:number; reason:string; prediction:Prediction };

const team=(name:string):Slot=>({type:"team",team:name});
const winner=(id:number):Slot=>({type:"winner",matchId:String(id)});
const loser=(id:number):Slot=>({type:"loser",matchId:String(id)});

export const participants:Participant[]=[
{id:"israel",name:"Israel Cabrera",short:"IC",basePoints:17,baseExact:4,color:"#b9c8ff"},
{id:"isra",name:"Isra chico",short:"IS",basePoints:12,baseExact:2,color:"#c9ffd5"},
{id:"alfre",name:"Tío Alfre",short:"TA",basePoints:12,baseExact:2,color:"#ffe0c7"},
{id:"liz",name:"Liz Flores",short:"LF",basePoints:11,baseExact:2,color:"#ffd4ea"},
{id:"rebeca",name:"Rebeca Granados",short:"RG",basePoints:10,baseExact:1,color:"#e1d7ff"},
{id:"alfredito",name:"Alfredito",short:"AL",basePoints:9,baseExact:1,color:"#fff0b8"},
{id:"nuria",name:"Nuria",short:"NU",basePoints:8,baseExact:1,color:"#c8f3ff"},
{id:"pedro",name:"Pedro",short:"PE",basePoints:7,baseExact:1,color:"#dbe8dd"},
{id:"rebe",name:"Rebe mamá",short:"RM",basePoints:7,baseExact:0,color:"#ffd8d1"}
];

export const stageLabels:Record<Match["stage"],string>={r32:"Ronda de 32",r16:"Octavos de final",qf:"Cuartos de final",sf:"Semifinales",third:"Tercer lugar",final:"Final"};
export const flags:Record<string,string>={Sudáfrica:"🇿🇦",Canadá:"🇨🇦",Alemania:"🇩🇪",Paraguay:"🇵🇾","Países Bajos":"🇳🇱",Marruecos:"🇲🇦",Brasil:"🇧🇷",Japón:"🇯🇵",Francia:"🇫🇷",Suecia:"🇸🇪","Costa de Marfil":"🇨🇮",Noruega:"🇳🇴",México:"🇲🇽",Ecuador:"🇪🇨",Inglaterra:"🏴","RD Congo":"🇨🇩","Estados Unidos":"🇺🇸","Bosnia y Herzegovina":"🇧🇦",Bélgica:"🇧🇪",Senegal:"🇸🇳",Portugal:"🇵🇹",Croacia:"🇭🇷",España:"🇪🇸",Austria:"🇦🇹",Suiza:"🇨🇭",Argelia:"🇩🇿",Argentina:"🇦🇷","Cabo Verde":"🇨🇻",Colombia:"🇨🇴",Ghana:"🇬🇭",Australia:"🇦🇺",Egipto:"🇪🇬","Por definir":"◌"};

export const matches:Match[]=[
{id:"73",stage:"r32",date:"28 JUN",time:"13:00",venue:"Los Ángeles",home:team("Sudáfrica"),away:team("Canadá"),excluded:true,fixedWinner:"Canadá"},
{id:"74",stage:"r32",date:"29 JUN",time:"12:00",venue:"Boston",home:team("Alemania"),away:team("Paraguay"),includedInBase:true,baseResult:{home:1,away:1,qualified:"away",final:true,completedAt:"2026-06-29T20:00:00Z"}},
{id:"75",stage:"r32",date:"29 JUN",time:"15:00",venue:"Monterrey",home:team("Países Bajos"),away:team("Marruecos"),includedInBase:true,baseResult:{home:1,away:1,qualified:"away",final:true,completedAt:"2026-06-29T23:00:00Z"}},
{id:"76",stage:"r32",date:"29 JUN",time:"21:00",venue:"Houston",home:team("Brasil"),away:team("Japón"),includedInBase:true,baseResult:{home:2,away:1,final:true,completedAt:"2026-06-30T05:00:00Z"}},
{id:"77",stage:"r32",date:"30 JUN",time:"16:30",venue:"Nueva York/Nueva Jersey",home:team("Francia"),away:team("Suecia"),includedInBase:true,baseResult:{home:3,away:0,final:true,completedAt:"2026-06-30T22:30:00Z"}},
{id:"78",stage:"r32",date:"30 JUN",time:"13:00",venue:"Dallas",home:team("Costa de Marfil"),away:team("Noruega"),includedInBase:true,baseResult:{home:1,away:2,final:true,completedAt:"2026-06-30T21:00:00Z"}},
{id:"79",stage:"r32",date:"30 JUN",time:"21:00",venue:"Ciudad de México",home:team("México"),away:team("Ecuador"),includedInBase:true,baseResult:{home:2,away:0,final:true,completedAt:"2026-07-01T05:00:00Z"}},
{id:"80",stage:"r32",date:"1 JUL",time:"12:00",venue:"Atlanta",home:team("Inglaterra"),away:team("RD Congo"),includedInBase:true,baseResult:{home:2,away:1,final:true,completedAt:"2026-07-01T20:00:00Z"}},
{id:"81",stage:"r32",date:"1 JUL",time:"20:00",venue:"Nueva York/Nueva Jersey",home:team("Estados Unidos"),away:team("Bosnia y Herzegovina"),includedInBase:true,baseResult:{home:2,away:0,final:true,completedAt:"2026-07-02T04:00:00Z"}},
{id:"82",stage:"r32",date:"1 JUL",time:"16:00",venue:"Seattle",home:team("Bélgica"),away:team("Senegal"),includedInBase:true,baseResult:{home:2,away:2,qualified:"home",final:true,completedAt:"2026-07-02T00:00:00Z"}},
{id:"83",stage:"r32",date:"2 JUL",time:"19:00",venue:"Toronto",home:team("Portugal"),away:team("Croacia"),baseResult:{home:2,away:1,final:true,completedAt:"2026-07-03T03:00:00Z"}},
{id:"84",stage:"r32",date:"2 JUL",time:"17:00",venue:"Los Ángeles",home:team("España"),away:team("Austria"),includedInBase:true,baseResult:{home:3,away:0,final:true,completedAt:"2026-07-02T23:00:00Z"}},
{id:"85",stage:"r32",date:"2 JUL",time:"23:00",venue:"San Francisco",home:team("Suiza"),away:team("Argelia"),baseResult:{home:2,away:0,final:true,completedAt:"2026-07-03T07:00:00Z"}},
{id:"86",stage:"r32",date:"3 JUL",time:"18:00",venue:"Miami",home:team("Argentina"),away:team("Cabo Verde"),baseResult:{home:1,away:1,qualified:"home",final:true,completedAt:"2026-07-04T01:00:00Z"}},
{id:"87",stage:"r32",date:"3 JUL",time:"21:30",venue:"Kansas City",home:team("Colombia"),away:team("Ghana"),baseResult:{home:1,away:0,final:true,completedAt:"2026-07-04T03:30:00Z"}},
{id:"88",stage:"r32",date:"3 JUL",time:"14:00",venue:"Dallas",home:team("Australia"),away:team("Egipto"),baseResult:{home:1,away:1,qualified:"away",final:true,completedAt:"2026-07-03T21:00:00Z"}},
{id:"89",stage:"r16",date:"4 JUL",time:"17:00",venue:"Filadelfia",home:winner(74),away:winner(77),baseResult:{home:0,away:1,final:true,completedAt:"2026-07-05T01:00:00Z"}},
{id:"90",stage:"r16",date:"4 JUL",time:"13:00",venue:"Houston",home:winner(73),away:winner(75),baseResult:{home:0,away:3,final:true,completedAt:"2026-07-04T19:11:00Z"}},
{id:"91",stage:"r16",date:"5 JUL",time:"16:00",venue:"Nueva York/Nueva Jersey",home:winner(76),away:winner(78),baseResult:{home:1,away:2,final:true,completedAt:"2026-07-05T22:00:00Z"}},
{id:"92",stage:"r16",date:"5 JUL",time:"20:00",venue:"Ciudad de México",home:winner(79),away:winner(80),baseResult:{home:2,away:3,final:true,completedAt:"2026-07-06T04:00:00Z"}},
{id:"93",stage:"r16",date:"6 JUL",time:"15:00",venue:"Dallas",home:winner(83),away:winner(84)},
{id:"94",stage:"r16",date:"6 JUL",time:"20:00",venue:"Seattle",home:winner(81),away:winner(82)},
{id:"95",stage:"r16",date:"7 JUL",time:"12:00",venue:"Atlanta",home:winner(86),away:winner(88)},
{id:"96",stage:"r16",date:"7 JUL",time:"16:00",venue:"Vancouver",home:winner(85),away:winner(87)},
{id:"97",stage:"qf",date:"9 JUL",time:"16:00",venue:"Boston",home:winner(89),away:winner(90)},
{id:"98",stage:"qf",date:"10 JUL",time:"15:00",venue:"Los Ángeles",home:winner(93),away:winner(94)},
{id:"99",stage:"qf",date:"11 JUL",time:"17:00",venue:"Miami",home:winner(91),away:winner(92)},
{id:"100",stage:"qf",date:"11 JUL",time:"21:00",venue:"Kansas City",home:winner(95),away:winner(96)},
{id:"101",stage:"sf",date:"14 JUL",time:"15:00",venue:"Dallas",home:winner(97),away:winner(98)},
{id:"102",stage:"sf",date:"15 JUL",time:"15:00",venue:"Atlanta",home:winner(99),away:winner(100)},
{id:"103",stage:"third",date:"18 JUL",time:"17:00",venue:"Miami",home:loser(101),away:loser(102)},
{id:"104",stage:"final",date:"19 JUL",time:"15:00",venue:"Nueva York/Nueva Jersey",home:winner(101),away:winner(102)}
];

const predictions:Record<string,Record<string,Prediction>>={
"83":{israel:[2,1],isra:[1,1],alfre:[1,2],liz:[2,1],rebeca:[1,0],alfredito:[2,1],nuria:[2,1],pedro:[2,1],rebe:[3,2]},
"84":{israel:[2,0],isra:[2,0],alfre:[2,1],liz:[2,0],rebeca:[2,0],alfredito:[2,0],nuria:[2,0],pedro:[3,0],rebe:[1,3]},
"85":{israel:[1,0],isra:[1,0],alfre:[1,1,"away"],liz:[1,0],rebeca:[2,0],alfredito:[1,0],nuria:[1,0],pedro:[3,1],rebe:[2,1]},
"86":{israel:[3,0],isra:[3,0],alfre:null,liz:[3,0],rebeca:[3,0],alfredito:null,nuria:null,pedro:[3,1],rebe:[1,0]},
"87":{israel:[2,1],isra:[2,1],alfre:null,liz:[2,1],rebeca:[2,1],alfredito:null,nuria:null,pedro:[1,2],rebe:[2,3]},
"88":{israel:[1,1],isra:[1,1],alfre:null,liz:[1,1],rebeca:[1,2],alfredito:null,nuria:null,pedro:[0,2],rebe:[1,2]},
"89":{israel:[0,2],isra:[1,3],alfre:[0,2],liz:[0,3],rebeca:[0,2],alfredito:[0,2],nuria:[1,3],pedro:[1,3],rebe:[0,1]},
"90":{israel:[1,2],isra:[1,2],alfre:[1,1,"away"],liz:[0,3],rebeca:[1,2],alfredito:[1,2],nuria:[1,2],pedro:[1,2],rebe:[1,2]},
"91":{israel:[2,2,"home"],isra:[2,1],alfre:[3,1],liz:[2,1],rebeca:[2,1],alfredito:[1,2],nuria:[2,1],pedro:[2,1],rebe:[2,1]},
"92":{israel:[2,1],isra:[2,1],alfre:[2,1],liz:[2,1],rebeca:[2,1],alfredito:[0,2],nuria:[1,0],pedro:[2,1],rebe:[1,0]},
"93":{israel:[2,2,"home"],isra:[2,2,"home"],alfre:[1,2],liz:[1,2],rebeca:[3,2],alfredito:[0,2],nuria:[1,2],pedro:[2,1],rebe:[1,0]},
"94":{israel:[2,1],isra:[1,2],alfre:[1,1,"home"],liz:[1,2],rebeca:[1,2],alfredito:[1,0],nuria:[0,1],pedro:[1,3],rebe:[0,2]},
"95":{israel:[3,1],isra:[2,1],alfre:[3,2],liz:[3,1],rebeca:[2,1],alfredito:[3,1],nuria:[2,0],pedro:[1,2],rebe:[1,2]},
"96":{israel:[1,2],isra:[0,1],alfre:[1,2],liz:[1,2],rebeca:[1,2],alfredito:[1,1,"home"],nuria:[1,1],pedro:[1,2],rebe:[1,2]}
};

export function getResult(match:Match,results:ResultMap={}){return results[match.id]??match.baseResult??null}
const scoreSide=(h:number,a:number):"home"|"away"|null=>h===a?null:h>a?"home":"away";
export function winningSide(match:Match,results:ResultMap={}):"home"|"away"|null{if(match.excluded)return match.fixedWinner===resolveTeam(match.home,results)?"home":"away";const r=getResult(match,results);if(!r)return null;return r.home===r.away?(r.qualified??null):scoreSide(r.home,r.away)}
export function resolveTeam(slot:Slot,results:ResultMap={}):string{if(slot.type==="team")return slot.team;const source=matches.find(m=>m.id===slot.matchId);if(!source)return "Por definir";const won=winningSide(source,results);if(!won)return "Por definir";const side=slot.type==="winner"?won:won==="home"?"away":"home";return resolveTeam(source[side],results)}
export function matchTeams(match:Match,results:ResultMap={}){return{home:resolveTeam(match.home,results),away:resolveTeam(match.away,results)}}
export function scorePrediction(pred:Prediction,result:MatchResult){if(!pred)return{points:0,exact:0};const[ph,pa,pq]=pred;const actual=scoreSide(result.home,result.away),expected=scoreSide(ph,pa);if(ph===result.home&&pa===result.away)return{points:3+(actual===null&&pq===result.qualified?1:0),exact:1};if(actual!==null)return{points:expected===actual||pq===actual?1:0,exact:0};if(pq&&pq===result.qualified)return{points:1,exact:0};if(expected&&expected===result.qualified)return{points:1,exact:0};return{points:0,exact:0}}
export function buildStandings(results:ResultMap={}):Standing[]{const table=participants.map(p=>{let points=p.basePoints,exact=p.baseExact,recent=0;matches.forEach(m=>{if(m.excluded||m.includedInBase)return;const r=getResult(m,results);if(!r)return;const score=scorePrediction(predictions[m.id]?.[p.id]??null,r);points+=score.points;exact+=score.exact;recent+=score.points});return{...p,points,exact,recent,rank:0}}).sort((a,b)=>b.points-a.points||b.exact-a.exact||a.name.localeCompare(b.name,"es"));let last="",rank=0;table.forEach((p,i)=>{const key=`${p.points}-${p.exact}`;if(key!==last)rank=i+1;p.rank=rank;last=key});return table}
export const completedMatches=(results:ResultMap={})=>matches.filter(m=>!m.excluded&&Boolean(getResult(m,results)));
export const latestCompletedMatch=(results:ResultMap={})=>completedMatches(results).sort((a,b)=>{const ar=getResult(a,results),br=getResult(b,results);const at=ar?.completedAt?Date.parse(ar.completedAt):matches.indexOf(a);const bt=br?.completedAt?Date.parse(br.completedAt):matches.indexOf(b);return at-bt}).at(-1)??null;
export const nextPlayableMatch=(results:ResultMap={})=>matches.find(m=>{if(m.excluded||getResult(m,results))return false;const t=matchTeams(m,results);return t.home!=="Por definir"&&t.away!=="Por definir"})??null;
export function pointAwardsForMatch(match:Match,results:ResultMap={}):PointAward[]{const result=getResult(match,results);if(!result)return[];const teams=matchTeams(match,results);return participants.map(participant=>{const prediction=predictions[match.id]?.[participant.id]??null;const score=scorePrediction(prediction,result);let reason="";if(score.points===4)reason=`Empate exacto y clasificado correcto en ${teams.home} vs ${teams.away}.`;else if(score.exact)reason=`Marcador exacto en ${teams.home} vs ${teams.away}.`;else if(score.points===1)reason=result.home===result.away?`Acertó al equipo clasificado en ${teams.home} vs ${teams.away}.`:`Acertó al equipo ganador en ${teams.home} vs ${teams.away}.`;return{...participant,awarded:score.points,reason,prediction}}).filter(item=>item.awarded>0).sort((a,b)=>b.awarded-a.awarded||a.name.localeCompare(b.name,"es"))}

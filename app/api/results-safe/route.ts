import { NextRequest, NextResponse } from "next/server";
import { matches, type Match } from "@/lib/quiniela";

export const dynamic = "force-dynamic";

const monthMap:Record<string,number>={JUN:5,JUL:6};
const NO_MATCH_SECONDS=10800;
const MATCH_SECONDS=900;

function fallbackDate(match:Match){
  const [dayText,monthText]=match.date.split(" "),[h,m]=match.time.split(":").map(Number);
  return new Date(Date.UTC(2026,monthMap[monthText]??6,Number(dayText),h+6,m));
}

function cadence(now=new Date()){
  const current=now.getTime();
  const windows=matches.filter(match=>!match.excluded).map(match=>{
    const kickoff=fallbackDate(match).getTime();
    return {start:kickoff-15*60*1000,end:kickoff+3*60*60*1000};
  });
  const inMatchWindow=windows.some(window=>current>=window.start&&current<=window.end);
  if(inMatchWindow)return {seconds:MATCH_SECONDS,mode:"match-window"};
  const nextStart=windows.map(window=>window.start).filter(start=>start>current).sort((a,b)=>a-b)[0];
  if(nextStart){
    const secondsUntilWindow=Math.max(60,Math.floor((nextStart-current)/1000));
    return {seconds:Math.min(NO_MATCH_SECONDS,secondsUntilWindow),mode:"waiting-for-match"};
  }
  return {seconds:NO_MATCH_SECONDS,mode:"no-match"};
}

export async function GET(request:NextRequest){
  const currentCadence=cadence();
  try{
    const response=await fetch(new URL("/api/results",request.url),{next:{revalidate:currentCadence.seconds}});
    const data=await response.json();
    const refreshSeconds=data?.hasLive?MATCH_SECONDS:currentCadence.seconds;
    return NextResponse.json({...data,refreshSeconds,cadence:data?.hasLive?"live":currentCadence.mode,quotaMode:"safe"},{headers:{"Cache-Control":`public, s-maxage=${refreshSeconds}, stale-while-revalidate=60`}});
  }catch(error){
    console.error(error);
    return NextResponse.json({results:{},fixtures:{},source:"demo",hasLive:false,refreshSeconds:NO_MATCH_SECONDS,cadence:"error",quotaMode:"safe",error:"No fue posible sincronizar resultados."},{status:200,headers:{"Cache-Control":`public, s-maxage=${NO_MATCH_SECONDS}, stale-while-revalidate=60`}});
  }
}

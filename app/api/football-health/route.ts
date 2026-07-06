import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request:NextRequest){
  const key = process.env.API_FOOTBALL_KEY ?? process.env.SPORTS_API_KEY;
  const force = request.nextUrl.searchParams.get("force") === "1";
  const base = {
    ok: Boolean(key),
    apiFootballKeyPresent: Boolean(process.env.API_FOOTBALL_KEY),
    sportsApiKeyPresent: Boolean(process.env.SPORTS_API_KEY),
    note: force ? "force=1 makes one real API-Football request." : "Add ?force=1 to make one real API-Football request and verify the external service.",
    generatedAt: new Date().toISOString(),
  };

  if(!key || !force){
    return NextResponse.json(base,{headers:{"Cache-Control":"no-store"}});
  }

  const endpoint = "https://v3.football.api-sports.io/fixtures?league=1&season=2026&from=2026-07-06&to=2026-07-06";
  try{
    const response = await fetch(endpoint,{headers:{"x-apisports-key":key},cache:"no-store"});
    const json = await response.json();
    return NextResponse.json({
      ...base,
      externalStatus: response.status,
      externalOk: response.ok,
      resultCount: Array.isArray(json?.response) ? json.response.length : null,
      apiErrors: json?.errors ?? null,
      apiMessage: json?.message ?? null,
    },{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    return NextResponse.json({...base,externalOk:false,error:error instanceof Error ? error.message : "Unknown error"},{status:200,headers:{"Cache-Control":"no-store"}});
  }
}

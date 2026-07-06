import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(){
  const hasApiFootballKey = Boolean(process.env.API_FOOTBALL_KEY || process.env.SPORTS_API_KEY);
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    checks: {
      automaticResults: hasApiFootballKey ? "ready" : "missing API_FOOTBALL_KEY",
      aiRecap: hasOpenAIKey ? "ready" : "missing OPENAI_API_KEY",
      supabaseOverride: hasSupabase ? "ready" : "not configured"
    },
    safeToShare: "No secrets are returned by this endpoint. It only reports whether each variable exists."
  },{
    headers:{ "Cache-Control":"no-store" }
  });
}

import { NextResponse } from "next/server";
import type { MatchResult, ResultMap } from "@/lib/quiniela";

export const dynamic="force-dynamic";
type Row={external_id:string;home_score:number|null;away_score:number|null;qualified_side:"home"|"away"|null;status:string};

export async function GET(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return NextResponse.json({results:{},source:"demo"});
 try{
  const response=await fetch(`${url}/rest/v1/matches?select=external_id,home_score,away_score,qualified_side,status&status=eq.final`,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:"no-store"});
  if(!response.ok)throw new Error(`Supabase ${response.status}`);
  const rows=await response.json() as Row[];
  const results:ResultMap={};
  rows.forEach(row=>{if(row.home_score===null||row.away_score===null)return;const result:MatchResult={home:row.home_score,away:row.away_score,qualified:row.qualified_side,final:true};results[row.external_id]=result});
  return NextResponse.json({results,source:"supabase"});
 }catch(error){console.error(error);return NextResponse.json({results:{},source:"demo"})}
}

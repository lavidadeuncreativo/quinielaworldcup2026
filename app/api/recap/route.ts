import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function fallbackRecap(data:Record<string,unknown>){
 const standings = Array.isArray(data.standings) ? data.standings as Array<{name?:string;points?:number;rank?:number}> : [];
 const leader = standings[0];
 if(leader?.name) return `${leader.name} va liderando con ${leader.points ?? "?"} puntos. La tabla ya está actualizada con el último resultado disponible; revisa el próximo partido porque puede mover la pelea por el podio.`;
 return "La tabla está actualizada con los últimos resultados disponibles. Revisa el próximo partido para ver cómo puede moverse la clasificación.";
}

function extractText(body:any){
 if(typeof body?.output_text === "string" && body.output_text.trim()) return body.output_text.trim();
 if(Array.isArray(body?.output)) return body.output.flatMap((item:any)=>item?.content??[]).map((content:any)=>content?.text??"").join(" ").trim();
 return "";
}

export async function POST(request:NextRequest){
 const key=process.env.OPENAI_API_KEY;
 const model=process.env.OPENAI_MODEL||"gpt-4.1-mini";
 const data=await request.json();
 if(!key)return NextResponse.json({recap:fallbackRecap(data)});
 const input=[
  "Genera un resumen breve, útil y emocionante para una quiniela familiar del Mundial 2026.",
  "Escribe en español de México, máximo 70 palabras, sin markdown.",
  "Incluye: líder actual, último resultado si viene en los datos, próximo partido si viene en los datos y por qué importa para la tabla.",
  "No inventes resultados, horarios ni probabilidades. Usa solo los datos JSON.",
  JSON.stringify(data)
 ].join("\n");
 try{
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model,input,max_output_tokens:220})});
  if(!response.ok)throw new Error(`OpenAI ${response.status}`);
  const body=await response.json();
  const recap=extractText(body)||fallbackRecap(data);
  return NextResponse.json({recap});
 }catch(error){console.error(error);return NextResponse.json({recap:fallbackRecap(data)})}
}

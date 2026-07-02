import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
 const key=process.env.OPENAI_API_KEY;
 const model=process.env.OPENAI_MODEL||"gpt-5-mini";
 if(!key)return NextResponse.json({recap:"La tabla está lista. Conecta OPENAI_API_KEY en Vercel para activar resúmenes automáticos después de cada partido."});
 const data=await request.json();
 const input=["Escribe un resumen breve de una quiniela familiar de fútbol.","Máximo 55 palabras. No inventes datos, probabilidades ni porcentajes.","Menciona líder y último resultado solo si aparecen. Español de México, tono emocionante y claro.",JSON.stringify(data)].join("\n");
 try{
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model,input,max_output_tokens:160})});
  if(!response.ok)throw new Error(`OpenAI ${response.status}`);
  const body=await response.json();
  const fallback=Array.isArray(body.output)?body.output.flatMap((item:{content?:Array<{text?:string}>})=>item.content??[]).map((item:{text?:string})=>item.text??"").join(" ").trim():"";
  return NextResponse.json({recap:body.output_text||fallback||"Resumen generado."});
 }catch(error){console.error(error);return NextResponse.json({error:"No fue posible generar el resumen automático."},{status:502})}
}

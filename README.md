# Quiniela Familiar 2026

Aplicación mobile-first para publicar la tabla, consultar partidos, calcular puntos, generar un resumen con IA y compartir la clasificación como imagen.

## Incluye

- Next.js + TypeScript.
- Tabla actual de 9 participantes.
- Motor de puntuación y desempate.
- Calendario completo de eliminación directa.
- Alias aleatorio para visitantes.
- Imagen 1080 × 1350 para WhatsApp.
- Endpoint preparado para Supabase.
- Endpoint opcional para resúmenes con OpenAI.

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy en Vercel

1. En Vercel abre **Add New → Project**.
2. Importa `lavidadeuncreativo/quinielaworldcup2026`.
3. Vercel detectará Next.js automáticamente.
4. Agrega las variables de entorno necesarias.
5. Ejecuta el deploy.

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
SPORTS_API_URL=
SPORTS_API_KEY=
SPORTS_COMPETITION_ID=
ADMIN_SECRET=
CRON_SECRET=
```

Nunca publiques `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` ni `SPORTS_API_KEY` dentro del código del navegador.

## Arquitectura final

1. El proveedor deportivo informa marcador, estado y clasificado.
2. Una función de Supabase normaliza el resultado.
3. El motor matemático calcula y audita los puntos.
4. OpenAI redacta el resumen; no decide resultados ni puntos.

## Siguiente etapa

- Crear el proyecto de Supabase.
- Añadir tablas de participantes, partidos, pronósticos y auditoría.
- Conectar una API de resultados.
- Programar la sincronización con Supabase Cron.
- Agregar panel administrador y bloqueo de pronósticos.
- Activar Supabase Auth anónimo para identidades aleatorias persistentes.

Proyecto familiar no oficial. No utiliza logotipos ni tipografía oficial del torneo.

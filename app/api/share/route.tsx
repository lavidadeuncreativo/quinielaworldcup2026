import { ImageResponse } from "next/og";
import { buildStandings } from "@/lib/quiniela";

export const runtime = "edge";

const medal = (rank: number) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "•");
const tone = (rank: number) =>
  rank === 1
    ? { bg: "linear-gradient(180deg,#ffdf73,#fff6d8)", border: "#efcb66" }
    : rank === 2
      ? { bg: "linear-gradient(180deg,#edf2fb,#ffffff)", border: "#d8dfef" }
      : rank === 3
        ? { bg: "linear-gradient(180deg,#f2c49c,#fff0e3)", border: "#e6bc93" }
        : { bg: "#ffffff", border: "#ebefed" };

export async function GET() {
  const table = buildStandings({});
  return new ImageResponse(
    <div style={{ width: "1080px", height: "1350px", display: "flex", flexDirection: "column", padding: "68px", color: "white", background: "linear-gradient(145deg,#07131f,#0d2a3d)", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: "28px", fontWeight: 800 }}>
          <div style={{ width: "62px", height: "62px", borderRadius: "20px", background: "#c6ff3d", color: "#102230", display: "flex", alignItems: "center", justifyContent: "center" }}>Q</div>
          Quiniela Familiar 2026
        </div>
        <div style={{ fontSize: "20px", color: "#9db2c0" }}>Tabla no oficial</div>
      </div>

      <div style={{ marginTop: "62px", fontSize: "82px", lineHeight: 0.96, letterSpacing: "-5px", fontWeight: 900 }}>Mira cómo va la tabla.</div>
      <div style={{ marginTop: "18px", fontSize: "26px", color: "#b7c9d4" }}>Clasificación general después del último resultado contabilizado.</div>

      <div style={{ marginTop: "44px", display: "flex", gap: "16px" }}>
        {table.slice(0, 3).map((p) => {
          const style = tone(p.rank);
          return (
            <div key={p.id} style={{ flex: 1, borderRadius: "30px", padding: "28px", background: style.bg, border: `2px solid ${style.border}`, color: "#102230", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "40px" }}>{medal(p.rank)}</div>
              <div style={{ marginTop: "18px", width: "76px", height: "76px", borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{p.short}</div>
              <div style={{ marginTop: "14px", fontSize: "26px", fontWeight: 800 }}>{p.name}</div>
              <div style={{ marginTop: "10px", fontSize: "42px", fontWeight: 900 }}>{p.points}</div>
              <div style={{ fontSize: "15px", color: "#55636e" }}>{p.exact} exactos</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px", padding: "24px", borderRadius: "34px", background: "#f5f7f4", color: "#102230" }}>
        {table.slice(3).map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", minHeight: "82px", padding: "0 24px", borderRadius: "22px", background: "white" }}>
            <div style={{ width: "58px", fontSize: "25px", fontWeight: 900 }}>{p.rank}</div>
            <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: p.color, color: "#102230", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{p.short}</div>
            <div style={{ flex: 1, marginLeft: "18px", fontSize: "25px", fontWeight: 800 }}>{p.name}</div>
            <div style={{ fontSize: "34px", fontWeight: 900, color: "#2b57ff" }}>{p.points}</div>
            <div style={{ marginLeft: "8px", fontSize: "16px", fontWeight: 800, opacity: 0.72 }}>PTS</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", color: "#93a9b8", fontSize: "20px", fontWeight: 700 }}>
        <span>$1,800 MXN · 9 participantes</span>
        <span>quiniela familiar</span>
      </div>
    </div>,
    { width: 1080, height: 1350 }
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./overrides.css";
import "./photo-overrides.css";

export const metadata: Metadata = {
  title: "Quiniela Familiar 2026",
  description: "Clasificación, resultados y pronósticos de la quiniela familiar.",
  applicationName: "Quiniela Familiar 2026",
};

export const viewport: Viewport = {
  themeColor: "#07131f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

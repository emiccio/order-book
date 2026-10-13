import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

// Variables con sufijo -face (no --font-display / --font-body a secas):
// esos dos nombres los define app/globals.css dentro de @theme inline, y si
// next/font los pisara acá con el mismo nombre literal de familia ("Bricolage
// Grotesque") en vez del font-face calibrado, se pierde el fallback con
// métricas ajustadas que evita el salto de layout mientras carga la fuente.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display-face",
  fallback: ["ui-rounded", "Segoe UI", "system-ui", "sans-serif"],
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-face",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Libreta de Ventas",
  description: "Pedidos, cobros y ganancia para revendedoras y emprendedoras.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${bricolage.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#A3245C",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
          Sabé quién te debe y cuánto ganaste, sin cuaderno
        </div>
        <div style={{ fontSize: 30, marginTop: 24, opacity: 0.9, maxWidth: 950 }}>
          Libreta de Ventas — pedidos, cobros y ganancia por ciclo
        </div>
      </div>
    ),
    { ...size },
  );
}

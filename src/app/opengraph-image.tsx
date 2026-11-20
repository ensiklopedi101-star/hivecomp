import { ImageResponse } from "next/og";

export const alt = "HiveComp — Lima Brand. Satu Rumah. Satu Pintu Masuk.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  const brands = [
    { name: "PopBeez", color: "#ff4d8d" },
    { name: "NusaBeez", color: "#ff453a" },
    { name: "Portal-Hub", color: "#38bdf8" },
    { name: "BlinkBeez", color: "#a78bfa" },
    { name: "E-Beez", color: "#34d399" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#050505",
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(255, 176, 0, 0.22), transparent 55%), radial-gradient(circle at 15% 85%, rgba(255, 77, 141, 0.14), transparent 50%)",
          padding: "64px 72px",
          color: "#f5f5f4",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <svg width="46" height="46" viewBox="0 0 128 128" aria-hidden="true">
              <path
                fill="#ffb000"
                fillRule="evenodd"
                d="M64 7 113 35.5v57L64 121 15 92.5v-57L64 7ZM41 34v60h14V72h18v22h14V34H73v24H55V34H41Z"
              />
            </svg>
            <div
              style={{
                display: "flex",
                fontSize: "28px",
                fontWeight: 800,
                letterSpacing: "0.18em",
              }}
            >
              <span>HIVE</span>
              <span style={{ color: "#ffb000" }}>COMP</span>
            </div>
          </div>
          <div
            style={{
              fontSize: "16px",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "#ffb000",
              border: "1px solid rgba(255,176,0,0.35)",
              borderRadius: "999px",
              padding: "10px 22px",
            }}
          >
            Grup Media & Commerce
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "76px",
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
            }}
          >
            <span>Lima Brand. Satu Rumah.</span>
            <span style={{ color: "#ffb000" }}>Satu Pintu Masuk.</span>
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#a8a29e",
              maxWidth: "860px",
              lineHeight: 1.45,
            }}
          >
            PopBeez, NusaBeez, Portal-Hub, BlinkBeez, dan E-Beez dalam satu
            ekosistem terpadu untuk audiens dan mitra.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", gap: "14px" }}>
            {brands.map((b) => (
              <div
                key={b.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${b.color}`,
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "999px",
                    backgroundColor: b.color,
                  }}
                />
                <span>{b.name}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: "18px",
              color: "#78716c",
              letterSpacing: "0.14em",
            }}
          >
            www.hivecomp.my.id
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

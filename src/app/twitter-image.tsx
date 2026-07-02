import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #F8F9FF 0%, #EDE9FF 50%, #8B7CFF 100%)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#8B7CFF",
            letterSpacing: "0.08em",
          }}
        >
          {siteConfig.tagline}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 72,
            fontWeight: 900,
            color: "#222222",
            lineHeight: 1.1,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            marginTop: 24,
            maxWidth: 760,
            fontSize: 28,
            color: "#555555",
            lineHeight: 1.5,
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    ),
    { ...size }
  );
}

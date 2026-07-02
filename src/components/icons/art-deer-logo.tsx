import { cn } from "@/lib/utils";

export function ArtDeerBrandLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 268 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ART DEER"
      role="img"
      className={cn(
        "h-[54px] w-auto shrink-0 [--logo-art:#8B7CFF] [--logo-ink:#111111]",
        className
      )}
    >
      <g stroke="var(--logo-ink)">
        <rect x="4" y="15.5" width="38" height="38" fill="none" strokeWidth="1.35" />
        <rect x="10" y="8.5" width="38" height="38" fill="none" strokeWidth="1.35" />
      </g>

      <path
        fill="var(--logo-ink)"
        d="M11.5 46.5H25.8L28.1 40.4L29.4 34.2C30.1 31.1 29.7 28.2 27.6 26.1L24.8 23.8C22.8 22.2 20.1 21.8 17.8 22.8C15.2 24 13.7 26.5 13.2 29.4L11.5 46.5ZM20.4 21.6C22.1 20.6 24.2 20.7 25.8 21.8C27.2 22.8 28.1 24.4 28.3 26.2L29.1 21.8L30.4 13.6L31.6 8.4L28.2 12.8L26.4 17.4L24.6 21.4L22.8 17.2L20.7 12.1L18.5 8.2L19.6 13.1L20.8 17.6L20.4 21.6Z"
      />

      <text
        x="62"
        y="36.8"
        fontFamily='"Pretendard Variable", Pretendard, ui-sans-serif, system-ui, sans-serif'
        fontSize="22.5"
        fontWeight="700"
        letterSpacing="0.02em"
      >
        <tspan fill="var(--logo-art)">ART</tspan>
        <tspan dx="10.5" fill="var(--logo-ink)">
          DEER
        </tspan>
      </text>
    </svg>
  );
}

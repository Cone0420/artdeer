import type { PortfolioItem } from "./portfolio-data";

export function PortfolioThumbnail({
  type,
  className,
}: {
  type: PortfolioItem["image"];
  className?: string;
}) {
  if (type === "purple-girl") {
    return (
      <svg viewBox="0 0 400 300" className={className} aria-hidden="true">
        <rect width="400" height="300" fill="#2d1b69" />
        <circle cx="60" cy="50" r="2" fill="white" opacity="0.65" />
        <circle cx="320" cy="40" r="1.5" fill="white" opacity="0.5" />
        <ellipse cx="200" cy="250" rx="70" ry="20" fill="#8B7CFF" opacity="0.28" />
        <circle cx="200" cy="160" r="55" fill="#C4B5FD" opacity="0.55" />
        <path d="M145 130 Q200 90 255 130 L245 195 Q200 220 155 195 Z" fill="#EDE9FF" opacity="0.92" />
        <circle cx="178" cy="155" r="5" fill="#333" />
        <circle cx="222" cy="155" r="5" fill="#333" />
      </svg>
    );
  }

  if (type === "night-blue") {
    return (
      <svg viewBox="0 0 400 300" className={className} aria-hidden="true">
        <rect width="400" height="300" fill="#0f172a" />
        <rect width="400" height="300" fill="url(#nightBluePf)" />
        <ellipse cx="200" cy="220" rx="100" ry="28" fill="#6366F1" opacity="0.22" />
        <rect x="110" y="100" width="180" height="90" rx="10" fill="#312e81" opacity="0.65" />
        <defs>
          <linearGradient id="nightBluePf" x1="0" y1="0" x2="400" y2="300">
            <stop stopColor="#1e1b4b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (type === "cute-purple") {
    return (
      <svg viewBox="0 0 400 300" className={className} aria-hidden="true">
        <rect width="400" height="300" fill="#F5F3FF" />
        <ellipse cx="190" cy="165" rx="65" ry="58" fill="#EDE9FF" />
        <ellipse cx="190" cy="170" rx="52" ry="46" fill="white" />
        <circle cx="165" cy="155" r="6" fill="#333" />
        <circle cx="215" cy="155" r="6" fill="#333" />
        <ellipse cx="280" cy="220" rx="32" ry="24" fill="white" stroke="#C4B5FD" strokeWidth="3" />
      </svg>
    );
  }

  if (type === "starry-night") {
    return (
      <svg viewBox="0 0 400 300" className={className} aria-hidden="true">
        <rect width="400" height="300" fill="#1a1030" />
        <circle cx="50" cy="50" r="1.5" fill="white" opacity="0.85" />
        <circle cx="350" cy="60" r="1.5" fill="white" opacity="0.75" />
        <ellipse cx="200" cy="230" rx="110" ry="35" fill="#312e81" opacity="0.55" />
        <rect x="0" y="160" width="400" height="140" fill="url(#starryPf)" />
        <defs>
          <linearGradient id="starryPf" x1="0" y1="160" x2="0" y2="300">
            <stop stopColor="#1e1b4b" stopOpacity="0" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (type === "channel") {
    return (
      <svg viewBox="0 0 400 300" className={className} aria-hidden="true">
        <rect width="400" height="300" fill="#1e1b4b" />
        <ellipse cx="200" cy="170" rx="120" ry="40" fill="#8B7CFF" opacity="0.35" />
        <rect x="50" y="100" width="300" height="16" rx="8" fill="#C4B5FD" opacity="0.3" />
        <circle cx="110" cy="130" r="22" fill="#6366f1" opacity="0.5" />
        <circle cx="290" cy="120" r="16" fill="#818cf8" opacity="0.4" />
      </svg>
    );
  }

  if (type === "guild") {
    return (
      <svg viewBox="0 0 400 300" className={className} aria-hidden="true">
        <rect width="400" height="300" fill="#EDE9FF" />
        <path
          d="M200 40 L290 80 V180 C290 210 200 240 200 240 C200 240 110 210 110 180 V80 Z"
          fill="url(#shieldPf)"
          stroke="#C4B5FD"
          strokeWidth="3"
        />
        <path d="M200 70 V210 M150 140 H250" stroke="#8B7CFF" strokeWidth="4" strokeLinecap="round" />
        <defs>
          <linearGradient id="shieldPf" x1="110" y1="40" x2="290" y2="240">
            <stop stopColor="#E8E4FF" />
            <stop offset="1" stopColor="#8B7CFF" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (type === "youtube") {
    return (
      <svg viewBox="0 0 400 300" className={className} aria-hidden="true">
        <rect width="400" height="300" fill="#1a1030" />
        <rect x="40" y="50" width="320" height="200" rx="14" fill="#2d1b69" />
        <rect x="50" y="60" width="300" height="180" rx="10" fill="url(#ytPf)" />
        <circle cx="200" cy="150" r="28" fill="white" opacity="0.95" />
        <path d="M188 132l36 18-36 18V132z" fill="#8B7CFF" />
        <defs>
          <linearGradient id="ytPf" x1="50" y1="60" x2="350" y2="240">
            <stop stopColor="#4c1d95" />
            <stop offset="1" stopColor="#1a1030" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 300" className={className} aria-hidden="true">
      <rect width="400" height="300" fill="#1f2937" />
      <rect x="130" y="80" width="140" height="105" rx="10" fill="#374151" stroke="#6B7280" strokeWidth="2" />
      <circle cx="200" cy="130" r="26" fill="#4B5563" stroke="#9CA3AF" strokeWidth="2" />
      <rect x="240" y="60" width="60" height="45" rx="5" fill="white" opacity="0.8" transform="rotate(10 270 82)" />
      <rect x="90" y="70" width="55" height="40" rx="5" fill="white" opacity="0.7" transform="rotate(-8 117 90)" />
    </svg>
  );
}

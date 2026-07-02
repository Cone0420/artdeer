export function DeerLogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <circle cx="24" cy="28" r="14" fill="#EDE9FF" />
      <path
        d="M16 14 L14 6 M24 12 L24 4 M32 14 L34 6"
        stroke="#8B7CFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M18 24 C18 20 20 18 24 18 C28 18 30 20 30 24 C30 28 28 32 24 34 C20 32 18 28 18 24 Z"
        fill="#8B7CFF"
      />
      <circle cx="20" cy="24" r="1.5" fill="white" />
      <circle cx="28" cy="24" r="1.5" fill="white" />
      <path
        d="M22 28 Q24 30 26 28"
        stroke="white"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  );
}

export function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 3C6.477 3 2 6.463 2 10.714c0 2.742 1.817 5.145 4.545 6.523-.198.726-.717 2.627-.82 3.037-.13.544.2.537.422.39.183-.12 2.922-1.974 4.11-2.773.244.016.487.023.743.023 5.523 0 10-3.463 10-7.714S17.523 3 12 3z"
      />
    </svg>
  );
}

export function KakaoBadge({ className }: { className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-md bg-[#FEE500] text-[#3B1E1E] ${className ?? ""}`}
    >
      <KakaoIcon className="size-3" />
    </span>
  );
}

/** 프로젝트 전역 오픈채팅 버튼 아이콘 (18px, 노란색 카카오) */
export function OpenChatIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#FEE500] text-[#3B1E1E] ${className ?? ""}`}
    >
      <KakaoIcon className="size-[11px]" />
    </span>
  );
}

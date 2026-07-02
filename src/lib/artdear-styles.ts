const EASE_PREMIUM = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const GPU = "will-change-transform [transform:translateZ(0)]";
const CARD_TRANSITION = `transition-[transform,box-shadow,border-color] duration-300 ${EASE_PREMIUM} ${GPU}`;

export const artdear = {
  container: "mx-auto w-full max-w-[1400px]",
  section:
    "px-4 py-14 sm:px-5 sm:py-16 md:px-6 md:py-20 lg:px-10 lg:py-24 xl:px-12",
  sectionTitle:
    "flex items-center gap-2.5 text-[16px] font-bold tracking-wide text-artdear-text sm:text-[17px] md:text-[18px] lg:text-[20px]",
  sectionTitleIcon: "size-5 shrink-0 text-artdear-purple",
  sectionSubtitle: "mt-1.5 text-[13px] text-artdear-text-subtle sm:mt-2 sm:text-[14px]",
  sectionLink: `group inline-flex items-center gap-1.5 text-[13px] font-semibold text-artdear-purple transition-[color] duration-300 ${EASE_PREMIUM} hover:text-artdear-purple-dark sm:text-[14px]`,
  sectionLinkIcon: `size-4 shrink-0 transition-transform duration-300 ${EASE_PREMIUM} group-hover:translate-x-1`,
  sectionLinkBackIcon: `size-4 shrink-0 transition-transform duration-300 ${EASE_PREMIUM} group-hover:-translate-x-1`,
  card: `rounded-[16px] border border-artdear-border-card bg-artdear-card shadow-[var(--shadow-artdear-card)] ${CARD_TRANSITION} sm:rounded-[18px] lg:rounded-[22px]`,
  cardLg: `rounded-[16px] border border-artdear-border-card bg-artdear-card shadow-[var(--shadow-artdear-card)] ${CARD_TRANSITION} sm:rounded-[18px] lg:rounded-[22px]`,
  cardInteractive:
    "hover:-translate-y-1 hover:scale-[1.01] hover:border-artdear-purple/45 hover:shadow-[var(--shadow-artdear-card-hover)]",
  panel: `rounded-[16px] border border-artdear-border-card bg-artdear-panel shadow-[var(--shadow-artdear-card)] ${CARD_TRANSITION} sm:rounded-[18px] lg:rounded-[22px]`,
  panelInteractive: `hover:-translate-y-1 hover:border-artdear-purple/45 hover:shadow-[var(--shadow-artdear-card-hover)] ${CARD_TRANSITION}`,
  glass: `glass rounded-[16px] border shadow-[var(--shadow-artdear-glass)] transition-[box-shadow,border-color] duration-300 ${EASE_PREMIUM} sm:rounded-[18px] lg:rounded-[22px]`,
  btnGlow: `transition-[transform,box-shadow] duration-300 ${EASE_PREMIUM} ${GPU} hover:-translate-y-px`,
  btnPrimary: `inline-flex items-center justify-center gap-2 rounded-full bg-artdear-purple px-5 text-[13px] font-semibold text-white shadow-[var(--shadow-artdear-btn)] transition-[background-color,box-shadow,transform] duration-300 ${EASE_PREMIUM} ${GPU} hover:-translate-y-px hover:bg-artdear-purple-dark hover:shadow-[var(--shadow-artdear-btn-glow)] sm:px-6 sm:text-sm lg:px-7`,
  btnPrimaryLg: "h-11 text-[14px] sm:h-12 sm:text-[15px] lg:h-[52px] lg:text-[16px]",
  btnSecondary: `inline-flex items-center justify-center gap-1.5 rounded-full border border-artdear-border-strong bg-artdear-btn-secondary px-3.5 text-[11px] font-medium text-artdear-text-muted shadow-[var(--shadow-artdear-card)] transition-[background-color,border-color,box-shadow,transform] duration-300 ${EASE_PREMIUM} ${GPU} hover:-translate-y-px hover:border-artdear-purple hover:bg-artdear-btn-secondary-hover hover:shadow-[var(--shadow-artdear-btn-soft)] sm:gap-2 sm:px-4 sm:text-[12px] lg:px-5 lg:text-sm`,
  btnSecondarySoft: `inline-flex items-center justify-center gap-2 rounded-full bg-artdear-purple-light px-4 text-[12px] font-medium text-artdear-purple shadow-[var(--shadow-artdear-card)] transition-[background-color,box-shadow,transform] duration-300 ${EASE_PREMIUM} ${GPU} hover:-translate-y-px hover:bg-artdear-purple-light-hover hover:shadow-[var(--shadow-artdear-btn-soft)] sm:px-5 sm:text-[13px] lg:text-sm`,
  btnCard: `inline-flex h-8 min-w-0 items-center justify-center gap-1 rounded-full bg-artdear-btn-card px-2 text-[10px] font-medium text-artdear-text-muted shadow-[var(--shadow-artdear-card)] transition-[background-color,color,box-shadow,transform] duration-300 ${EASE_PREMIUM} ${GPU} hover:-translate-y-px hover:bg-artdear-purple-light hover:text-artdear-purple hover:shadow-[var(--shadow-artdear-btn-soft)] sm:h-9 sm:gap-1.5 sm:px-3 sm:text-[11px]`,
  imageHoverInner: `h-full w-full ${GPU} transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]`,
  imageHoverOverlay: `pointer-events-none absolute inset-0 bg-artdear-purple/0 transition-[background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-artdear-purple/[0.06]`,
  textHoverPurple: `transition-colors duration-300 ${EASE_PREMIUM} group-hover:text-artdear-purple`,
  header:
    "fixed top-0 left-0 right-0 z-[9999] isolate border-b border-[#eee] bg-[rgba(255,255,255,0.96)] transition-[box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  headerScrolled: "shadow-[var(--shadow-artdear-header)]",
} as const;

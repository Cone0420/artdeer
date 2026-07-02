"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Headphones,
  Mail,
  PencilLine,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { externalHref } from "@/lib/settings-data";
import { useSettings } from "@/hooks/use-settings-store";
import { DiscordIcon, OpenChatIcon } from "@/components/icons/brand-icons";
import { FadeInSection, StaggerContainer, StaggerItem } from "@/components/ui/fade-in-section";
import { SectionTitleIcon } from "@/components/ui/section-title-icon";

const steps = [
  { label: "문의", description: "디스코드 또는 오픈채팅으로 문의", icon: Headphones },
  { label: "상담", description: "원하는 디자인과 컨셉 상담", icon: PencilLine },
  { label: "작업", description: "디자인 제작", icon: Settings },
  { label: "수정", description: "수정 요청 및 피드백", icon: Mail },
  { label: "완료", description: "최종 파일 전달 및 작업 완료!", icon: CheckCircle2 },
] as const;

function StepArrow() {
  return (
    <>
      <ChevronRight
        aria-hidden
        className="hidden size-5 shrink-0 text-artdear-text-light lg:block"
        strokeWidth={2}
      />
      <ChevronDown
        aria-hidden
        className="size-5 shrink-0 text-artdear-text-light lg:hidden"
        strokeWidth={2}
      />
    </>
  );
}

const inquiryButtonHoverClass =
  "cursor-pointer transition-[transform,box-shadow,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform [transform:translateZ(0)] hover:-translate-y-1";

export function HowToOrder() {
  const { settings } = useSettings();
  const discordLink = externalHref(settings?.discordLink ?? "#");
  const kakaoLink = externalHref(settings?.kakaoLink ?? "#");

  return (
    <FadeInSection id="order">
      <section
        className={cn(artdear.section, "relative overflow-hidden bg-artdear-section")}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-artdear-section" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[min(32vw,280px)] bg-[radial-gradient(ellipse_85%_75%_at_0%_50%,rgba(139,124,255,0.025),transparent_72%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-[min(32vw,280px)] bg-[radial-gradient(ellipse_85%_75%_at_100%_50%,rgba(139,124,255,0.025),transparent_72%)]"
        />
        <div className={cn(artdear.container, "relative z-[1]")}>
          <div className="grid gap-4 sm:gap-5 md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div
              className={cn(
                artdear.panel,
                artdear.glass,
                "relative flex min-h-full flex-col overflow-hidden p-4 sm:p-6 md:p-8"
              )}
            >
              <div className="w-full text-left">
                <h2 className="flex items-center gap-2.5 text-[18px] font-bold tracking-wide text-artdear-text md:text-[20px]">
                  <SectionTitleIcon />
                  ORDER
                </h2>
                <p className="mt-2.5 text-[14px] text-artdear-text-subtle sm:mt-3">
                  편하신 방법으로 문의 & 상담해보세요!
                </p>
              </div>

              <div className="mt-5 flex w-full flex-1 items-center justify-center sm:mt-6">
                <div className="flex w-full max-w-[460px] flex-col items-center justify-center gap-4 min-[375px]:flex-row sm:gap-6">
                <a
                  href={discordLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    inquiryButtonHoverClass,
                    "flex min-w-[140px] flex-1 flex-col items-center rounded-[16px] bg-artdear-purple px-3 py-5 text-center text-white shadow-[var(--shadow-artdear-btn)] hover:bg-artdear-purple-dark hover:shadow-[var(--shadow-artdear-btn-glow)] sm:max-w-[220px] sm:rounded-[18px] sm:px-4 sm:py-7"
                  )}
                >
                  <DiscordIcon className="size-6 shrink-0 sm:size-8" />
                  <span className="mt-2 whitespace-nowrap text-[13px] font-bold leading-tight sm:mt-3 sm:text-[15px]">
                    디스코드 문의
                  </span>
                  <span className="mt-0.5 whitespace-nowrap text-[11px] leading-tight text-white/80 sm:mt-1 sm:text-[12px]">
                    DM / 서버 문의
                  </span>
                </a>
                <a
                  href={kakaoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    inquiryButtonHoverClass,
                    "flex min-w-[140px] flex-1 flex-col items-center rounded-[16px] border border-artdear-border-strong bg-artdear-card px-3 py-5 text-center hover:border-artdear-purple hover:bg-artdear-panel hover:shadow-[var(--shadow-artdear-btn-soft)] sm:max-w-[220px] sm:rounded-[18px] sm:px-4 sm:py-7"
                  )}
                >
                  <OpenChatIcon />
                  <span className="mt-2 whitespace-nowrap text-[13px] font-bold leading-tight text-artdear-text sm:mt-3 sm:text-[15px]">
                    오픈채팅 문의
                  </span>
                  <span className="mt-0.5 whitespace-nowrap text-[11px] leading-tight text-artdear-text-subtle sm:mt-1 sm:text-[12px]">
                    카카오 오픈채팅
                  </span>
                </a>
                </div>
              </div>
            </div>

            <div
              className={cn(
                artdear.panel,
                artdear.glass,
                "p-4 sm:p-6 md:p-8 lg:p-10"
              )}
              id="how-to-order"
            >
              <h2 className="flex items-center gap-2.5 text-[18px] font-bold tracking-wide text-artdear-text md:text-[20px]">
                <SectionTitleIcon />
                HOW TO ORDER
              </h2>
              <p className="mt-2 text-[14px] text-artdear-text-subtle">
                의뢰부터 완료까지, 아트디어의 작업 진행 순서입니다.
              </p>

              <StaggerContainer className="mt-6 flex flex-col items-center sm:mt-8 md:mt-9 lg:flex-row lg:items-start lg:justify-between lg:gap-2 xl:gap-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <StaggerItem key={step.label} className="w-full lg:w-auto lg:flex-1">
                      <div className="flex flex-col items-center lg:flex-row lg:items-start">
                        <div className="flex w-full max-w-[240px] flex-col items-center text-center sm:max-w-[260px] lg:mx-auto lg:max-w-none lg:w-full lg:min-w-0 lg:flex-1 lg:px-2">
                          <div className="flex size-[48px] items-center justify-center rounded-[16px] bg-artdear-purple-light text-artdear-purple shadow-[var(--shadow-artdear-card)] sm:size-[52px] md:size-[56px] md:rounded-[18px]">
                            <Icon className="size-6 md:size-7" strokeWidth={1.8} />
                          </div>
                          <h3 className="mt-3 text-[14px] font-bold text-artdear-text sm:mt-4 sm:text-[15px] md:text-[16px]">
                            {step.label}
                          </h3>
                          <p className="mt-1 max-w-[220px] text-[12px] leading-relaxed text-artdear-text-subtle sm:mt-1.5 sm:text-[13px] lg:max-w-none">
                            {step.description}
                          </p>
                        </div>

                        {index < steps.length - 1 ? (
                          <div className="flex items-center justify-center py-3 lg:mt-7 lg:px-1 lg:py-0">
                            <StepArrow />
                          </div>
                        ) : null}
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>
    </FadeInSection>
  );
}

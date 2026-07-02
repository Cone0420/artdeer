import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section id="contact" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-primary-foreground md:px-16 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,oklch(1_0_0/10%),transparent_50%)]"
          />

          <div className="relative max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              프로젝트를 시작할 준비가
              <br />
              되셨나요?
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              아이디어를 공유해 주시면 24시간 내에 맞춤 제안서를
              보내드립니다.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                render={<Link href="mailto:hello@asset.studio" />}
              >
                <Mail data-icon="inline-start" />
                hello@asset.studio
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                render={<Link href="#order" />}
              >
                무료 상담 신청
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

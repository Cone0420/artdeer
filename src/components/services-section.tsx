import { Layers, Palette, Rocket, Smartphone } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const services = [
  {
    icon: Palette,
    title: "브랜드 디자인",
    description:
      "로고, 아이덴티티, 브랜드 가이드라인까지 — 브랜드의 본질을 시각적으로 표현합니다.",
  },
  {
    icon: Layers,
    title: "UI/UX 디자인",
    description:
      "사용자 중심의 인터페이스 설계로 직관적이고 아름다운 디지털 경험을 만듭니다.",
  },
  {
    icon: Rocket,
    title: "웹 개발",
    description:
      "Next.js 기반의 고성능 웹사이트와 웹 애플리케이션을 빠르고 안정적으로 구축합니다.",
  },
  {
    icon: Smartphone,
    title: "반응형 & 모바일",
    description:
      "모든 디바이스에서 완벽하게 작동하는 반응형 디자인을 제공합니다.",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="border-t border-border bg-muted/30 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Services
          </p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            제공 서비스
          </h2>
          <p className="mt-4 text-muted-foreground">
            아이디어 구상부터 런칭까지, 프로젝트 전 과정을 함께합니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <Card key={service.title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <service.icon className="size-5 text-primary" />
                </div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

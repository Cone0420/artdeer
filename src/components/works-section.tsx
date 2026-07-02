import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const works = [
  {
    title: "Finova 브랜드 리뉴얼",
    category: "Branding",
    description: "핀테크 스타트업의 전체 브랜드 아이덴티티 재설계",
    color: "bg-gradient-to-br from-neutral-200 to-neutral-300",
  },
  {
    title: "GreenLeaf 이커머스",
    category: "Web Design",
    description: "친환경 라이프스타일 브랜드 온라인 쇼핑몰 구축",
    color: "bg-gradient-to-br from-neutral-300 to-neutral-400",
  },
  {
    title: "Nova 대시보드",
    category: "UI/UX",
    description: "SaaS 플랫폼 관리자 대시보드 UX 설계 및 개발",
    color: "bg-gradient-to-br from-neutral-400 to-neutral-500",
  },
];

export function WorksSection() {
  return (
    <section id="works" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Works
            </p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              최근 작업물
            </h2>
            <p className="mt-4 text-muted-foreground">
              다양한 산업군의 클라이언트와 함께한 프로젝트입니다.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {works.map((work) => (
            <Card
              key={work.title}
              className="group overflow-hidden pt-0 transition-shadow hover:shadow-lg"
            >
              <div
                className={`aspect-[4/3] w-full ${work.color} transition-transform group-hover:scale-[1.02]`}
              />
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{work.title}</CardTitle>
                  <Badge variant="outline">{work.category}</Badge>
                </div>
                <CardDescription>{work.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

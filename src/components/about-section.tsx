import { CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const values = [
  "명확한 커뮤니케이션과 투명한 프로세스",
  "데이터 기반의 디자인 의사결정",
  "런칭 이후에도 지속적인 유지보수 지원",
  "빠른 프로토타이핑과 반복적 개선",
];

export function AboutSection() {
  return (
    <section id="about" className="border-t border-border bg-muted/30 px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            About
          </p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            에셋을 선택하는 이유
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            우리는 단순히 예쁜 디자인을 만드는 것이 아닙니다. 비즈니스 목표에
            부합하는 전략적 디자인과 기술적 완성도를 동시에 추구합니다.
          </p>
        </div>

        <ul className="space-y-4">
          {values.map((value, index) => (
            <li key={value}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-sm leading-relaxed">{value}</span>
              </div>
              {index < values.length - 1 && <Separator className="mt-4" />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Headphones, Info, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { SectionShell } from "@/components/ui/section-shell";
import { useFaqItems } from "@/hooks/use-faq-store";
import { useSettings } from "@/hooks/use-settings-store";
import { externalHref } from "@/lib/settings-data";
import styles from "./Faq.module.css";

import { SectionTitleIcon } from "@/components/ui/section-title-icon";

function FaqSpeechIllustration() {
  return (
    <svg viewBox="0 0 220 180" className="h-auto w-full max-w-[220px]" aria-hidden="true">
      <circle cx="168" cy="36" r="3" fill="#C4B5FD" opacity="0.8" />
      <circle cx="48" cy="28" r="2" fill="#DDD6FE" />
      <path
        d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"
        fill="#DDD6FE"
        transform="translate(182 120) scale(0.55)"
      />
      <ellipse cx="118" cy="118" rx="62" ry="18" fill="#EDE9FF" opacity="0.55" />
      <rect x="118" y="52" width="88" height="72" rx="18" fill="#8B7CFF" />
      <path
        d="M118 96 L118 124 C118 132 108 136 102 130 L88 118 L118 118 Z"
        fill="#8B7CFF"
      />
      <text x="152" y="98" textAnchor="middle" fill="#fff" fontSize="34" fontWeight="700">
        ?
      </text>
      <rect x="36" y="68" width="78" height="58" rx="16" fill="#ffffff" stroke="#ECEAFB" strokeWidth="2" />
      <circle cx="58" cy="97" r="5" fill="#C4B5FD" />
      <circle cx="75" cy="97" r="5" fill="#C4B5FD" />
      <circle cx="92" cy="97" r="5" fill="#C4B5FD" />
    </svg>
  );
}

const FaqAccordionItem = memo(function FaqAccordionItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={cn(styles.accordion, open && styles.accordionOpen)}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={styles.trigger}
      >
        <span className={styles.questionMark}>Q.</span>
        <span className={styles.questionText}>{question}</span>
        <span className={styles.toggle}>
          {open ? <Minus className="size-4" strokeWidth={2.5} /> : <Plus className="size-4" strokeWidth={2.5} />}
        </span>
      </button>

      <div className={cn(styles.answerWrap, open ? styles.answerWrapOpen : styles.answerWrapClosed)}>
        <div className={styles.answerInner}>
          <div className={styles.answer}>
            <span className={styles.answerMark}>A.</span>
            <p className={styles.answerText}>{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export function Faq() {
  const { items, ready } = useFaqItems();
  const { settings } = useSettings();
  const [openId, setOpenId] = useState<string | null>(null);
  const discordLink = externalHref(settings?.discordLink ?? "#");

  if (ready && items.length === 0) {
    return null;
  }

  return (
    <FadeInSection>
      <SectionShell id="faq" className={cn("bg-background/80", styles.shell)}>
        <div className={styles.wrapper}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={styles.container}
          >
            <div className={styles.layout}>
              <aside className={styles.intro}>
                <div>
                  <h2 className={styles.title}>
                    <SectionTitleIcon animated />
                    FAQ
                  </h2>
                  <p className={styles.subtitle}>
                    의뢰 전 가장 많이 문의해주시는
                    <br />
                    내용을 확인해보세요.
                  </p>
                  <p className={styles.eyebrow}>FREQUENTLY ASKED QUESTIONS</p>
                </div>

                <div className={styles.divider} aria-hidden="true" />

                <div className={styles.illustrationWrap}>
                  <FaqSpeechIllustration />
                </div>

                <div className={styles.contactCard}>
                  <div className={styles.contactIcon}>
                    <Headphones className="size-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className={styles.contactTitle}>추가 문의가 필요하신가요?</p>
                    <p className={styles.contactText}>
                      디스코드 또는 오픈채팅을 통해
                      <br />
                      언제든지 문의해주세요!
                    </p>
                  </div>
                </div>
              </aside>

              <div className={styles.list}>
                {!ready ? (
                  Array.from({ length: 6 }).map((_, index) => <div key={index} className={styles.skeleton} />)
                ) : (
                  items.map((item) => (
                    <FaqAccordionItem
                      key={item.id}
                      question={item.question}
                      answer={item.answer}
                      open={openId === item.id}
                      onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <p className={styles.footerNote}>
            <Info className="size-4 shrink-0 text-artdear-purple/70" aria-hidden="true" />
            <span>
              더 자세한 정보는{" "}
              <Link href={discordLink} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                고객센터
              </Link>
              를 통해 확인하실 수 있습니다.
            </span>
          </p>
        </div>
      </SectionShell>
    </FadeInSection>
  );
}

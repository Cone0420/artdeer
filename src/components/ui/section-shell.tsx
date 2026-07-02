"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { SectionTitleIcon } from "@/components/ui/section-title-icon";

export function SectionShell({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn(artdear.section, className)}>
      <div className={artdear.container}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  linkHref,
  linkLabel,
  className,
}: {
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between lg:mb-12",
        className
      )}
    >
      <div>
        <h2 className={artdear.sectionTitle}>
          <SectionTitleIcon animated />
          {title}
        </h2>
        {subtitle ? <p className={artdear.sectionSubtitle}>{subtitle}</p> : null}
      </div>
      {linkHref && linkLabel ? (
        <Link href={linkHref} className={artdear.sectionLink}>
          {linkLabel}
          <ArrowRight className={artdear.sectionLinkIcon} />
        </Link>
      ) : null}
    </motion.div>
  );
}

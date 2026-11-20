"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 36,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionTag({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  return (
    <Reveal>
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em] text-hive">
        <span className="clip-hex inline-block h-2.5 w-2.5 shrink-0 bg-hive" />
        <span>
          ( {index} ) — {label}
        </span>
      </div>
    </Reveal>
  );
}

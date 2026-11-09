// Ported verbatim from https://21st.dev/@aceternity/components/timeline — copy: https://raw.githubusercontent.com/Deepender25/21st.dev-Component-Skill-/3de21651777d1c23cb2deed3a0ffc978c4270259/components/aceternity/timeline.tsx
// Changes: this header; title/intro/container props (the original hard-codes a changelog); neutral/white/purple classes → preset tokens (no .dark class here). Shims: framer-motion→motion/react, next/image→<img> (vite aliases).
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data, container, title = "From survey to finished floor", intro = "A typical garage job, step by step. Your survey confirms the timings." }: { data: TimelineEntry[]; container?: React.RefObject<HTMLElement | null>; title?: React.ReactNode; intro?: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
    ...(container ? { container } : {}),
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-[var(--bg)] font-sans md:px-10"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-4xl mb-4 text-[var(--ink)] max-w-4xl" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h2>
        <p className="text-[var(--muted)] text-sm md:text-base max-w-sm">
          {intro}
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-[var(--bg)] flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-[var(--surface)] border border-[var(--line)] p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-[var(--muted)]" style={{ fontFamily: "var(--font-display)" }}>
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-[var(--muted)]" style={{ fontFamily: "var(--font-display)" }}>
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-[var(--line)] to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-[var(--accent)] via-[var(--accent2)] to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

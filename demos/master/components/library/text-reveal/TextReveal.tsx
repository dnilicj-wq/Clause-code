// Ported verbatim from Magic UI (MIT) https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/text-reveal.tsx. Imports adapted; text-black/white + dark: variants → preset --ink (this app has no .dark class); container prop for scroll boxes.

import {
  useRef,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
  type RefObject,
} from "react"
import { motion, MotionValue, useScroll, useTransform } from "motion/react"

import { cn } from "@/src/lib/cn"

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string
  /** Optional scroll container (defaults to the page). Added for lab cards. */
  container?: RefObject<HTMLElement | null>
}

export const TextReveal: FC<TextRevealProps> = ({ children, className, container }) => {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    ...(container ? { container } : {}),
  })

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string")
  }

  const words = children.split(" ")

  return (
    <div ref={sectionRef} className={cn("relative z-0 h-[200vh]", className)}>
      <div
        className={
          "sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center bg-transparent px-4 py-20"
        }
      >
        <span
          className={
            "flex flex-wrap p-5 text-2xl font-bold text-[color-mix(in_srgb,var(--ink)_20%,transparent)] md:p-8 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl"
          }
        >
          {words.map((word, i) => {
            const start = i / words.length
            const end = start + 1 / words.length
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            )
          })}
        </span>
      </div>
    </div>
  )
}

interface WordProps {
  children: ReactNode
  progress: MotionValue<number>
  range: [number, number]
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1])
  return (
    <span className="xl:lg-3 relative mx-1 lg:mx-1.5">
      <span className="absolute opacity-30">{children}</span>
      <motion.span
        style={{ opacity: opacity }}
        className={"text-[var(--ink)]"}
      >
        {children}
      </motion.span>
    </span>
  )
}

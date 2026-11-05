// Ported from Magic UI; shadcn --primary → preset --accent; dark: variants resolved to preset tokens (this app has no .dark class) and /alpha colours rewritten as color-mix. Originally ported verbatim from Magic UI (MIT) https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/shiny-button.tsx. Only imports adapted.

import React from "react"
import { motion, type MotionProps } from "motion/react"

import { cn } from "@/src/lib/cn"

const animationProps: MotionProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
}

interface ShinyButtonProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps>,
    MotionProps {
  children: React.ReactNode
  className?: string
}

export const ShinyButton = React.forwardRef<
  HTMLButtonElement,
  ShinyButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      className={cn(
        "relative cursor-pointer rounded-lg border px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out border-[var(--line)] bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--accent)_14%,transparent)_0%,transparent_60%)] hover:shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_22%,transparent)]",
        className
      )}
      {...animationProps}
      {...props}
    >
      <span
        className="relative block size-full text-sm tracking-wide text-[var(--ink)] uppercase"
        style={{
          maskImage:
            "linear-gradient(-75deg,var(--accent) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),var(--accent) calc(var(--x) + 100%))",
        }}
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          WebkitMask:
            "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          backgroundImage:
            "linear-gradient(-75deg,color-mix(in srgb,var(--accent) 10%,transparent) calc(var(--x) + 20%),color-mix(in srgb,var(--accent) 70%,transparent) calc(var(--x) + 25%),color-mix(in srgb,var(--accent) 10%,transparent) calc(var(--x) + 100%))",
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] p-px"
      />
    </motion.button>
  )
})

ShinyButton.displayName = "ShinyButton"

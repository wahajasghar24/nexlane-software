'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Motion primitives for Nexlane (UI UX Pro Max: Standard motion tier).
 * - Stagger list on load: 300-450ms, subtle rise+fade
 * - Respects prefers-reduced-motion (no animation when set)
 */

const ease = [0.22, 0.61, 0.36, 1] as const

export function useStaggerVariants(distance = 12): Variants {
  const reduce = useReducedMotion()
  if (reduce) {
    return {
      hidden: { opacity: 1, y: 0 },
      show: { opacity: 1, y: 0, transition: { duration: 0 } },
    }
  }
  return {
    hidden: { opacity: 0, y: distance },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease },
    },
  }
}

export function useStaggerContainer(delay = 0.05): Variants {
  const reduce = useReducedMotion()
  if (reduce) {
    return {
      hidden: {},
      show: { transition: { staggerChildren: 0 } },
    }
  }
  return {
    hidden: {},
    show: { transition: { staggerChildren: delay } },
  }
}

/** Wrap a list: children <StaggerItem> animate in sequence on mount */
export function StaggerGroup({ children, className, delay }: { children: ReactNode; className?: string; delay?: number }) {
  const container = useStaggerContainer(delay)
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

/** Single animated item — must live inside <StaggerGroup> */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const variants = useStaggerVariants()
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  )
}

/** Simple fade-in for page sections */
export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

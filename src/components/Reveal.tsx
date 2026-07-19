'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  once?: boolean;
}

const offset = 22;

function initialOffset(direction: Direction) {
  switch (direction) {
    case 'up':
      return { y: offset };
    case 'down':
      return { y: -offset };
    case 'left':
      return { x: offset };
    case 'right':
      return { x: -offset };
    default:
      return {};
  }
}

/**
 * Fades + slides its children into view on scroll. Respects the user's
 * reduced-motion preference by rendering statically.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className,
  once = true,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, ...(reduceMotion ? {} : initialOffset(direction)) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        // Slow, soft, candlelit reveals.
        duration: reduceMotion ? 0 : 1.2,
        delay: reduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PremiumSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

export default function PremiumSection({ children, className = '', id, delay = 0 }: PremiumSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

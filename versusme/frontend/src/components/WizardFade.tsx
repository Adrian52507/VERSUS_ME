"use client";

import { motion } from "framer-motion";

export default function WizardFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      key="wizard-anim"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

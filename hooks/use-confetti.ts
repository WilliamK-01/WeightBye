"use client";

import confetti from "canvas-confetti";

export function useConfetti() {
  const blast = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return { blast };
}

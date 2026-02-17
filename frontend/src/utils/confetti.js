import confetti from "canvas-confetti";

export default function triggerConfetti(x, y) {
  // Normalize coordinates to 0-1 range if they are pixel values
  // canvas-confetti expects origin in 0-1 range
  const originX = x / window.innerWidth;
  const originY = y / window.innerHeight;

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: originX, y: originY },
    colors: ["#6750a4", "#eaddff", "#21005d", "#625b71", "#e8def8"],
    disableForReducedMotion: true,
  });
}

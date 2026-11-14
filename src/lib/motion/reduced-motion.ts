/**
 * prefers-reduced-motion.
 * Com redução ativa: sem Lenis, sem parallax, sem SplitText animado;
 * reveals viram nada (conteúdo já está visível) e a transição de página é desligada pelo Astro.
 */

export const MQ_REDUCE = '(prefers-reduced-motion: reduce)';
export const MQ_NO_PREFERENCE = '(prefers-reduced-motion: no-preference)';

/** Condições para gsap.matchMedia(). */
export const MOTION_CONDITIONS = {
  reduce: MQ_REDUCE,
  full: MQ_NO_PREFERENCE,
} as const;

export function prefersReducedMotion(): boolean {
  return window.matchMedia(MQ_REDUCE).matches;
}

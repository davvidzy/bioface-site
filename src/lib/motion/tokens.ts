/**
 * Tokens de movimento. Espelho de src/styles/tokens.css (seção "Movimento").
 * Ao alterar um, altere o outro.
 */

/** Durações em segundos (GSAP usa segundos). */
export const DURATION = {
  fast: 0.2, // --duration-fast: 200ms
  base: 0.4, // --duration-base: 400ms
  slow: 0.8, // --duration-slow: 800ms
  page: 0.45, // --duration-page: 450ms
  fluida: 0.75, // --duration-fluida: 750ms (ritmo padrão)
} as const;

/** Curvas bezier dos easings nomeados (mesmos valores do CSS). */
export const EASE_BEZIER = {
  outSoft: [0.22, 1, 0.36, 1], // --ease-out-soft
  inOutSoft: [0.65, 0, 0.35, 1], // --ease-in-out-soft
  standard: [0.4, 0, 0.2, 1], // --ease-standard
} as const;

export type EaseName = keyof typeof EASE_BEZIER;

/** Nomes registrados no CustomEase (ver lib/motion/index.ts). */
export const EASE: Record<EaseName, string> = {
  outSoft: 'outSoft',
  inOutSoft: 'inOutSoft',
  standard: 'standard',
};

/** --reveal-distance: 24px */
export const REVEAL_DISTANCE = 24;

/** Ponto do viewport em que um reveal dispara. */
export const REVEAL_START = 'top 88%';

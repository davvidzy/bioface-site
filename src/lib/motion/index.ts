/**
 * Núcleo do movimento: registra plugins do GSAP, cria a instância única do Lenis
 * e sincroniza o Lenis com o ticker do GSAP.
 *
 * Plugins registrados só quando usados, para caber no orçamento de JS (≤ 90 KB gzip).
 * Flip entra aqui quando o design pedir (import { Flip } from 'gsap/Flip').
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import { EASE, EASE_BEZIER, type EaseName } from './tokens';
import { MQ_REDUCE } from './reduced-motion';
import { definirLenis, getLenis } from './instancia';

let registrado = false;

function bezierParaPath([x1, y1, x2, y2]: readonly number[]): string {
  return `M0,0 C${x1},${y1} ${x2},${y2} 1,1`;
}

export function registrarPlugins(): void {
  if (registrado) return;
  registrado = true;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  (Object.keys(EASE_BEZIER) as EaseName[]).forEach((nome) => {
    CustomEase.create(EASE[nome], bezierParaPath(EASE_BEZIER[nome]));
  });
  gsap.defaults({ ease: EASE.outSoft });
}

/**
 * Cria o Lenis uma única vez, sincronizado com o gsap.ticker.
 * Não cria com prefers-reduced-motion; destrói se a preferência mudar.
 */
export function iniciarLenis(): Lenis | null {
  const atual = getLenis();
  if (atual || window.matchMedia(MQ_REDUCE).matches) return atual;

  // anchors: false porque âncoras são tratadas por lib/ancoras.ts (foco + rolagem).
  const lenis = new Lenis({ autoRaf: false, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tickLenis);
  gsap.ticker.lagSmoothing(0);
  definirLenis(lenis);
  return lenis;
}

function tickLenis(time: number): void {
  getLenis()?.raf(time * 1000);
}

export function destruirLenis(): void {
  const lenis = getLenis();
  if (!lenis) return;
  gsap.ticker.remove(tickLenis);
  lenis.destroy();
  definirLenis(null);
}

export { gsap, ScrollTrigger, SplitText, getLenis };

/**
 * Animações declarativas via data-attributes.
 * A marcação declara a intenção; os timings vivem aqui e nos tokens.
 *
 *   data-reveal="fade"    fade + leve deslocamento (único reveal ativo na Fase 0)
 *   data-reveal="lines"   linhas com SplitText (acessível: aria do plugin)
 *   data-parallax="0.2"   deslocamento proporcional ao scroll
 *
 * Princípio: o CSS nunca esconde nada. O estado inicial oculto é aplicado aqui,
 * no momento da animação. Sem JS (ou com reduced motion), tudo fica visível.
 */
import { gsap, SplitText } from './index';
import { DURATION, EASE, REVEAL_DISTANCE, REVEAL_START } from './tokens';

function revealFade(el: HTMLElement): void {
  gsap.from(el, {
    autoAlpha: 0,
    y: REVEAL_DISTANCE,
    duration: DURATION.slow,
    ease: EASE.outSoft,
    scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
  });
}

function revealLines(el: HTMLElement): void {
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    // Leitor de tela lê a frase inteira, não pedaço por pedaço.
    aria: 'auto',
    // Refaz o split no resize e quando as fontes carregam.
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 100,
        duration: DURATION.slow,
        stagger: 0.08,
        ease: EASE.outSoft,
        scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
      });
    },
  });
}

function parallax(el: HTMLElement): void {
  const fator = Number(el.dataset['parallax']);
  if (!Number.isFinite(fator) || fator === 0) return;
  gsap.to(el, {
    yPercent: -fator * 50,
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

const REVEALS: Record<string, (el: HTMLElement) => void> = {
  fade: revealFade,
  lines: revealLines,
};

/** Cria todas as animações declaradas dentro de `raiz`. Chamar dentro de um gsap.context. */
export function criarReveals(raiz: ParentNode = document): void {
  raiz.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const tipo = el.dataset['reveal'] ?? '';
    REVEALS[tipo]?.(el);
  });
  raiz.querySelectorAll<HTMLElement>('[data-parallax]').forEach(parallax);
}

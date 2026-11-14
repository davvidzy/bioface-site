/**
 * Animações declarativas via data-attributes.
 * A marcação declara a intenção; os timings vivem aqui e nos tokens.
 *
 *   data-reveal="fade"     fade + leve subida
 *   data-reveal="lines"    linhas sobem de dentro de uma máscara (títulos; SplitText acessível)
 *   data-reveal="stagger"  os filhos diretos entram em sequência (cards, listas, passos)
 *   data-reveal="imagem"   a imagem se revela de baixo para cima (clip-path, sem zoom)
 *   data-reveal="linha"    fio que se desenha de cima para baixo
 *   data-parallax="0.2"    deslocamento proporcional ao scroll (marcas d'água)
 *
 * Tudo no mesmo ritmo do site (DURATION.fluida, ease out-soft), uma vez só, ao entrar na tela.
 *
 * Princípio: o CSS nunca esconde nada. O estado inicial oculto é aplicado aqui,
 * no momento da animação. Sem JS (ou com reduced motion), tudo fica visível.
 */
import { gsap, ScrollTrigger, SplitText } from './index';
import { DURATION, EASE, REVEAL_DISTANCE, REVEAL_START } from './tokens';

function revealFade(el: HTMLElement): void {
  gsap.from(el, {
    autoAlpha: 0,
    y: REVEAL_DISTANCE,
    duration: DURATION.fluida,
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
        duration: DURATION.fluida,
        stagger: 0.08,
        ease: EASE.outSoft,
        scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
      });
    },
  });
}

/** Filhos diretos em sequência: fade + leve subida, 80ms entre um e outro. */
function revealStagger(el: HTMLElement): void {
  const filhos = Array.from(el.children) as HTMLElement[];
  if (filhos.length === 0) return;
  gsap.from(filhos, {
    autoAlpha: 0,
    y: REVEAL_DISTANCE,
    duration: DURATION.fluida,
    stagger: 0.08,
    ease: EASE.outSoft,
    clearProps: 'transform',
    scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
  });
}

/**
 * Imagem que se revela de baixo para cima, como uma cortina que desce.
 * Só clip-path: a foto não muda de escala (regra do projeto: nunca zoom nas imagens).
 */
function revealImagem(el: HTMLElement): void {
  gsap.fromTo(
    el,
    { clipPath: 'inset(100% 0% 0% 0%)' },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: DURATION.fluida * 1.6,
      ease: EASE.inOutSoft,
      clearProps: 'clipPath',
      scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
    },
  );
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

/** Fio que se desenha de cima para baixo (conectores entre seções). */
function revealLinha(el: HTMLElement): void {
  gsap.from(el, {
    scaleY: 0,
    transformOrigin: '50% 0%',
    duration: DURATION.slow * 1.5,
    ease: EASE.inOutSoft,
    scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
  });
}

const REVEALS: Record<string, (el: HTMLElement) => void> = {
  fade: revealFade,
  lines: revealLines,
  stagger: revealStagger,
  imagem: revealImagem,
  linha: revealLinha,
};

interface OpcoesReveal {
  /** Não anima o que já está na tela (evita piscar quando o movimento chega depois da pintura). */
  ignorarVisiveis?: boolean;
}

/** Cria todas as animações declaradas dentro de `raiz`. Chamar dentro de um gsap.context. */
export function criarReveals(raiz: ParentNode = document, opcoes: OpcoesReveal = {}): void {
  raiz.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (opcoes.ignorarVisiveis && ScrollTrigger.isInViewport(el)) return;
    const tipo = el.dataset['reveal'] ?? '';
    REVEALS[tipo]?.(el);
  });
  raiz.querySelectorAll<HTMLElement>('[data-parallax]').forEach(parallax);
}

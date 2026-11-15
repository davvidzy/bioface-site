/**
 * Links #ancora na mesma página: rolagem até o destino e foco nele (teclado e leitor de tela).
 * Carregado sempre, porque não pode depender do módulo de movimento (que chega sob demanda).
 * Com o Lenis ativo, a rolagem é pelo lenis.scrollTo; sem ele, nativa.
 */
import { getLenis } from './motion/instancia';
import { MQ_REDUCE, MQ_TOQUE } from './motion/reduced-motion';

function tratarAncora(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
  if (!link) return;
  const url = new URL(link.href);
  if (url.pathname !== window.location.pathname || !url.hash) return;
  const alvo = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!alvo) return;

  event.preventDefault();
  history.pushState(history.state, '', url.hash);
  if (!alvo.hasAttribute('tabindex') && !alvo.matches('a, button, input, select, textarea')) {
    alvo.setAttribute('tabindex', '-1');
  }
  alvo.focus({ preventScroll: true });

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(alvo);
  } else {
    // Sem Lenis. Toque (celular): rolagem suave nativa, o Lenis nunca nasce ali.
    // Reduced motion ou movimento ainda carregando no desktop: salto direto (uma rolagem
    // suave seria interrompida se o Lenis nascer no meio dela).
    const suave =
      window.matchMedia(MQ_TOQUE).matches && !window.matchMedia(MQ_REDUCE).matches;
    alvo.scrollIntoView({ block: 'start', behavior: suave ? 'smooth' : 'instant' });
  }
}

let iniciado = false;

export function initAncoras(): void {
  if (iniciado) return;
  iniciado = true;
  // Captura: roda antes do ClientRouter, que também trata links de hash.
  document.addEventListener('click', tratarAncora, { capture: true });
}

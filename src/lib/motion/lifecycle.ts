/**
 * Ciclo de vida do movimento com o ClientRouter do Astro.
 *
 * - Carregado sob demanda na primeira interação (BaseLayout); monta a página atual na hora.
 * - astro:page-load    cria as animações da página dentro de gsap.matchMedia (que é um gsap.context)
 * - astro:before-swap  reverte o contexto e mata os ScrollTriggers da página que sai
 * - fontes e imagens   ScrollTrigger.refresh() depois de carregarem (medidas mudam)
 * - âncoras            links #ancora usam lenis.scrollTo; o foco vai para o destino
 */
import {
  gsap,
  ScrollTrigger,
  registrarPlugins,
  iniciarLenis,
  destruirLenis,
  getLenis,
} from './index';
import { criarReveals } from './reveal';
import { MOTION_CONDITIONS, MQ_REDUCE } from './reduced-motion';

let mm: gsap.MatchMedia | null = null;
let iniciado = false;
/** Na primeira montagem o movimento chega depois da pintura: o que já está na tela fica como está. */
let primeiraMontagem = true;

function montarPagina(): void {
  mm?.revert();
  mm = gsap.matchMedia();
  mm.add(MOTION_CONDITIONS, (ctx) => {
    const { full } = ctx.conditions as { full: boolean; reduce: boolean };
    if (full) {
      iniciarLenis();
      criarReveals(document, { ignorarVisiveis: primeiraMontagem });
    } else {
      // Reduced motion: sem Lenis, sem reveals. Conteúdo já está visível.
      destruirLenis();
    }
  });

  // Depois de navegar, o Lenis precisa saber a altura e a posição da página nova.
  const lenis = getLenis();
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  }

  primeiraMontagem = false;
  agendarRefresh();
}

function desmontarPagina(): void {
  mm?.revert();
  mm = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

/** Refresh depois de fontes e imagens: os reveals dependem de posições corretas. */
function agendarRefresh(): void {
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  document.querySelectorAll<HTMLImageElement>('main img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', refresh, { once: true });
  });
}

/** Links #ancora: rolagem pelo Lenis e foco no destino (teclado e leitor de tela). */
function tratarAncoras(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
  if (!link) return;
  const url = new URL(link.href);
  if (url.pathname !== window.location.pathname || !url.hash) return;
  const alvo = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!alvo) return;

  event.preventDefault();
  history.pushState(null, '', url.hash);
  if (!alvo.hasAttribute('tabindex') && !alvo.matches('a, button, input, select, textarea')) {
    alvo.setAttribute('tabindex', '-1');
  }
  alvo.focus({ preventScroll: true });

  const lenis = getLenis();
  const offset = -parseFloat(getComputedStyle(alvo).scrollMarginTop || '0');
  if (lenis) lenis.scrollTo(alvo, { offset });
  else alvo.scrollIntoView({ block: 'start' });
}

/**
 * Foco por Tab precisa continuar levando o elemento para a área visível, na hora.
 * Com o Lenis ativo, a rolagem nativa do foco chega animada e fica para trás de Tabs rápidos;
 * aqui o elemento fora da tela é trazido imediatamente.
 */
function garantirFocoVisivel(event: FocusEvent): void {
  const lenis = getLenis();
  const el = event.target;
  if (!lenis || !(el instanceof HTMLElement) || el === document.body) return;
  const r = el.getBoundingClientRect();
  if (r.top >= 0 && r.bottom <= window.innerHeight) return;
  const margem = Math.min(window.innerHeight / 4, 160);
  lenis.scrollTo(el, { immediate: true, force: true, offset: -margem });
}

export function iniciarMovimento(): void {
  if (iniciado) return;
  iniciado = true;
  registrarPlugins();

  document.addEventListener('astro:page-load', montarPagina);
  document.addEventListener('astro:before-swap', desmontarPagina);
  // Captura: roda antes do ClientRouter, que também trata links de hash.
  document.addEventListener('click', tratarAncoras, { capture: true });
  document.addEventListener('focusin', garantirFocoVisivel);

  // Carregado sob demanda: o astro:page-load da primeira página já passou.
  montarPagina();

  // Se a preferência mudar com a página aberta, o matchMedia refaz tudo; o Lenis segue junto.
  window.matchMedia(MQ_REDUCE).addEventListener('change', (e) => {
    if (e.matches) destruirLenis();
  });
}

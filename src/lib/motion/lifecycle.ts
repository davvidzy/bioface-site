/**
 * Ciclo de vida do movimento com o ClientRouter do Astro.
 *
 * - Carregado sob demanda na primeira interação (BaseLayout); monta a página atual na hora.
 * - astro:page-load    cria as animações da página dentro de gsap.matchMedia (que é um gsap.context)
 * - astro:before-swap  reverte o contexto e mata os ScrollTriggers da página que sai
 * - fontes e imagens   ScrollTrigger.refresh() depois de carregarem (medidas mudam)
 * - foco por teclado   elemento fora da tela é trazido na hora (com Lenis)
 * Âncoras ficam em lib/ancoras.ts, carregado sempre.
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
  // Na primeira montagem não: forçar a posição cancelaria uma rolagem nativa em andamento
  // (ex.: a âncora que foi a própria primeira interação).
  const lenis = getLenis();
  if (lenis && !primeiraMontagem) {
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

/**
 * Foco por Tab precisa continuar levando o elemento para a área visível, na hora.
 * Com o Lenis ativo, a rolagem nativa do foco chega animada e fica para trás de Tabs rápidos;
 * aqui o elemento fora da tela é trazido imediatamente.
 */
function garantirFocoVisivel(event: FocusEvent): void {
  const lenis = getLenis();
  const el = event.target;
  if (!lenis || !(el instanceof HTMLElement) || el === document.body) return;
  // tabindex="-1" só recebe foco programático (âncoras, <main>): a rolagem já é tratada lá.
  if (el.getAttribute('tabindex') === '-1') return;
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
  document.addEventListener('focusin', garantirFocoVisivel);

  // Carregado sob demanda: o astro:page-load da primeira página já passou.
  montarPagina();

  // Se a preferência mudar com a página aberta, o matchMedia refaz tudo; o Lenis segue junto.
  window.matchMedia(MQ_REDUCE).addEventListener('change', (e) => {
    if (e.matches) destruirLenis();
  });
}

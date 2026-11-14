/**
 * Linha do tempo horizontal do Método ("Como trabalhamos").
 * Recriada a partir da referência Timeline (Hyperiux Vault), adaptada ao Astro sem React.
 *
 * O layout horizontal e o "pin" são CSS (position: sticky dentro de uma seção alta; ver
 * Metodo.astro). Aqui só entra o movimento, todo atrelado ao scroll (scrub):
 * - o trilho desliza para a esquerda enquanto a seção passa;
 * - a linha central se desenha da esquerda para a direita;
 * - cada etapa, ao chegar perto do centro da tela, sobe o fio, acende o ponto e revela
 *   título e texto, que sobem de dentro de uma máscara (overflow: hidden no bloco).
 *
 * Só no desktop e sem prefers-reduced-motion (gsap.matchMedia em lifecycle.ts).
 * Criado dentro do contexto do matchMedia: o revert desfaz tudo.
 */
import { gsap } from './index';

export function criarLinhaDoTempo(raiz: ParentNode = document): void {
  raiz.querySelectorAll<HTMLElement>('[data-linha-do-tempo]').forEach(montar);
}

function montar(secao: HTMLElement): void {
  const trilho = secao.querySelector<HTMLElement>('[data-ldt-trilho]');
  const linha = secao.querySelector<HTMLElement>('[data-ldt-linha]');
  if (!trilho || !linha) return;

  // Quanto o trilho precisa andar para a última etapa chegar à tela.
  const distancia = () => Math.max(0, trilho.scrollWidth - window.innerWidth);

  const deslize = gsap.to(trilho, {
    x: () => -distancia(),
    ease: 'none',
    scrollTrigger: {
      trigger: secao,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  // O monograma do canto acompanha o trilho, na mesma velocidade.
  const marca = secao.querySelector<HTMLElement>('[data-ldt-marca]');
  if (marca) {
    gsap.to(marca, {
      x: () => -distancia(),
      ease: 'none',
      scrollTrigger: {
        trigger: secao,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }

  gsap.fromTo(
    linha,
    { scaleX: 0 },
    {
      scaleX: 1,
      transformOrigin: '0% 50%',
      ease: 'none',
      // A linha cresce junto com o scroll da seção inteira. (Usar a própria linha como
      // gatilho não funciona: com scaleX 0 a largura medida é zero e ela "pula" inteira.)
      scrollTrigger: {
        trigger: secao,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    },
  );

  secao.querySelectorAll<HTMLElement>('[data-ldt-etapa]').forEach((etapa) => {
    const fio = etapa.querySelector<HTMLElement>('[data-ldt-fio]');
    const ponto = etapa.querySelector<HTMLElement>('[data-ldt-ponto]');
    const linhas = Array.from(etapa.querySelectorAll<HTMLElement>('[data-ldt-texto]'));
    const embaixo = etapa.dataset['lado'] === 'baixo';

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: etapa,
        containerAnimation: deslize,
        start: 'left 85%',
        end: 'left 52%',
        scrub: true,
      },
    });

    if (fio) {
      // O fio nasce na linha central: de baixo para cima (etapas de cima) ou o contrário.
      tl.fromTo(
        fio,
        { scaleY: 0 },
        { scaleY: 1, transformOrigin: embaixo ? '50% 0%' : '50% 100%', duration: 0.4 },
      );
    }
    if (ponto) tl.fromTo(ponto, { scale: 0 }, { scale: 1, duration: 0.25 }, '-=0.1');
    if (linhas.length) {
      tl.fromTo(
        linhas,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' },
        '-=0.25',
      );
    }
  });
}

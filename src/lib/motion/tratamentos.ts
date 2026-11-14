/**
 * Seção de tratamentos no desktop: a seção fixa na tela (pin) e o scroll troca a categoria.
 * Uma categoria por vez, alternando os lados; a maca 3D gira e desliza de leve entre poses.
 * A rolagem encaixa em cada categoria (snap), para nunca parar no meio da transição.
 *
 * Só roda com movimento completo e tela de desktop em paisagem (lifecycle.ts).
 * Fora disso, o layout estático do componente fica: poster + categorias empilhadas.
 *
 * Acessibilidade: categorias fora de vez só ficam com opacity 0 (continuam no
 * leitor de tela, sem elementos focáveis dentro), nunca visibility/display.
 */
import { gsap } from './index';
import { MACA, type EstadoMaca } from './maca-config';
import { EASE } from './tokens';
import type { Maca3D } from './maca3d';

/** Quanto de rolagem cada troca de categoria consome, em alturas de tela. */
const ROLAGEM_POR_TROCA = 0.9;
const DESLOCAMENTO = 48;

export function criarTratamentos(raiz: ParentNode = document): (() => void) | undefined {
  const bloco = raiz.querySelector<HTMLElement>('[data-tratamentos]');
  const palco = bloco?.querySelector<HTMLElement>('[data-trat-palco]');
  if (!bloco || !palco) return undefined;
  const categorias = gsap.utils.toArray<HTMLElement>('[data-trat-cat]', bloco);
  if (categorias.length < 2) return undefined;

  bloco.classList.add('trat--animado');
  const pose0 = MACA.poses[0] ?? { ry: 0, x: 0, z: 0 };
  const estado: EstadoMaca = { ...pose0 };
  const VOLTA = Math.PI * 2;

  // Entrada: enquanto a seção chega, a maca vem lá de trás, girando, até a 1ª pose.
  gsap.fromTo(
    estado,
    { z: MACA.entrada.z, ry: pose0.ry + MACA.entrada.voltas * VOLTA },
    {
      z: pose0.z,
      ry: pose0.ry,
      ease: 'none',
      scrollTrigger: { trigger: bloco, start: 'top bottom', end: 'top top', scrub: 0.8 },
    },
  );
  // Texto entra e sai pelo próprio lado (eixo x): ímpares à esquerda, pares à direita.
  const lado = (i: number) => (i % 2 === 0 ? -1 : 1);
  categorias.forEach((c, i) => i > 0 && gsap.set(c, { opacity: 0, x: lado(i) * DESLOCAMENTO }));

  const tl = gsap.timeline({
    defaults: { ease: EASE.inOutSoft },
    scrollTrigger: {
      trigger: bloco,
      start: 'top top',
      end: () => `+=${window.innerHeight * ROLAGEM_POR_TROCA * (categorias.length - 1)}`,
      pin: true,
      scrub: 0.8,
      snap: {
        // Direcional: qualquer rolagem para baixo leva à próxima categoria (nunca puxa de volta).
        snapTo: 'labelsDirectional',
        duration: { min: 0.25, max: 0.7 },
        delay: 0.05,
        ease: EASE.inOutSoft,
      },
      invalidateOnRefresh: true,
    },
  });

  tl.addLabel('categoria-1');
  categorias.forEach((categoria, i) => {
    if (i === 0) return;
    const anterior = categorias[i - 1]!;
    const pose = MACA.poses[i] ?? pose0;
    const anteriorPose = MACA.poses[i - 1] ?? pose0;
    tl.to({}, { duration: 0.3 }); // repouso na categoria atual
    // Posições absolutas (t): rótulos extras virariam pontos de snap.
    const t = tl.duration();
    tl.to(anterior, { opacity: 0, x: lado(i - 1) * DESLOCAMENTO, duration: 0.45 }, t)
      // Continua chegando (z só aumenta), gira no próprio eixo e desliza para o lado livre.
      // fromTo explícito: a entrada também anima o estado, então o início não é lido dele.
      .fromTo(
        estado,
        { ry: anteriorPose.ry, x: anteriorPose.x, z: anteriorPose.z },
        {
          ry: pose.ry - MACA.voltasPorTroca * VOLTA,
          x: pose.x,
          z: pose.z,
          duration: 1,
          immediateRender: false,
        },
        t,
      )
      .fromTo(
        categoria,
        { opacity: 0, x: lado(i) * DESLOCAMENTO },
        { opacity: 1, x: 0, duration: 0.45 },
        t + 0.55,
      )
      .addLabel(`categoria-${i + 1}`);
  });
  tl.to({}, { duration: 0.3 }); // repouso final antes de soltar o pin

  // 3D sob demanda: só baixa three.js e o modelo quando a seção se aproxima.
  let maca: Maca3D | undefined;
  let cancelado = false;
  const io = new IntersectionObserver(
    async ([entrada]) => {
      if (!entrada?.isIntersecting) return;
      io.disconnect();
      try {
        const { criarMaca3D } = await import('./maca3d');
        if (cancelado) return;
        const criada = await criarMaca3D(palco, estado);
        if (cancelado) return criada.destruir();
        maca = criada;
        palco.classList.add('trat__palco--3d');
      } catch (erro) {
        // Sem WebGL ou falha de rede: o layout segue sem a maca, conteúdo intacto.
        console.warn('[tratamentos] 3D indisponível', erro);
      }
    },
    { rootMargin: '100% 0px' },
  );
  io.observe(bloco);

  return () => {
    cancelado = true;
    io.disconnect();
    maca?.destruir();
    palco.classList.remove('trat__palco--3d');
    bloco.classList.remove('trat--animado');
    gsap.set(categorias, { clearProps: 'opacity,transform' });
  };
}

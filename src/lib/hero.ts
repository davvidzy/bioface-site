/**
 * Imagem do hero (retrato da Maria). Compartilhada entre o <picture> do Hero e o preload
 * no <head> da Home, para os dois escolherem exatamente o mesmo arquivo.
 * Desktop: ocupa a metade direita da tela, até a borda. Celular: largura toda, abaixo do texto.
 */
import { getImage } from 'astro:assets';
import heroRetrato from '@/assets/pessoas/hero-mobile.jpg';

const LARGURAS = [480, 720, 941];
export const SIZES_HERO = '(min-width: 56rem) 50vw, 100vw';

export async function imagemHero() {
  const [avif, webp, jpg] = await Promise.all(
    (['avif', 'webp', 'jpg'] as const).map((format) =>
      getImage({ src: heroRetrato, widths: LARGURAS, format, quality: format === 'jpg' ? 80 : 70 }),
    ),
  );
  return { avif: avif!, webp: webp!, jpg: jpg!, meta: heroRetrato };
}

/** Preload (AVIF) para o LCP começar a baixar junto com o HTML. */
export async function preloadsHero() {
  const { avif } = await imagemHero();
  return [{ media: 'all', srcset: avif.srcSet.attribute }];
}

/**
 * Imagens do hero com direção de arte por orientação.
 * Compartilhado entre o <picture> do Hero e o preload no <head> da Home,
 * para os dois escolherem exatamente o mesmo arquivo.
 */
import { getImage } from 'astro:assets';
import heroPaisagem from '@/assets/pessoas/hero-desktop.jpg';
import heroRetrato from '@/assets/pessoas/hero-mobile.jpg';

export const MEDIA_RETRATO = '(orientation: portrait)';
export const MEDIA_PAISAGEM = '(orientation: landscape)';

const LARGURAS_PAISAGEM = [960, 1280, 1672];
const LARGURAS_RETRATO = [480, 720, 941];

async function variantes(src: ImageMetadata, widths: number[]) {
  const [avif, webp, jpg] = await Promise.all(
    (['avif', 'webp', 'jpg'] as const).map((format) =>
      getImage({ src, widths, format, quality: format === 'jpg' ? 80 : 70 }),
    ),
  );
  return { avif: avif!, webp: webp!, jpg: jpg! };
}

export async function imagensHero() {
  return {
    paisagem: { ...(await variantes(heroPaisagem, LARGURAS_PAISAGEM)), meta: heroPaisagem },
    retrato: { ...(await variantes(heroRetrato, LARGURAS_RETRATO)), meta: heroRetrato },
  };
}

/** Links de preload (AVIF) por orientação, para o LCP começar a baixar junto com o HTML. */
export async function preloadsHero() {
  const { paisagem, retrato } = await imagensHero();
  return [
    { media: MEDIA_RETRATO, srcset: retrato.avif.srcSet.attribute },
    { media: MEDIA_PAISAGEM, srcset: paisagem.avif.srcSet.attribute },
  ];
}

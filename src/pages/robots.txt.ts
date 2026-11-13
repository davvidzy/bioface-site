import type { APIRoute } from 'astro';
import { INDEXAR } from '@/lib/seo';

/**
 * Enquanto a cliente não contratar, a prévia de prospecção não deve ser indexada.
 * Para liberar no deploy definitivo: INDEXAR=true no ambiente de build.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).toString();
  const corpo = INDEXAR
    ? `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`
    : `# Prévia de prospecção: indexação desligada (INDEXAR != true).\nUser-agent: *\nDisallow: /\n`;
  return new Response(corpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO(conteudo): trocar pelo domínio definitivo quando a cliente contratar.
const SITE_PADRAO = 'https://bioface-preview.vercel.app';

/**
 * SITE_URL vem do painel da hospedagem. Aceita o valor com ou sem "https://", com
 * espaços, aspas ou barra no fim. Vazio ou inválido: usa o padrão, sem quebrar o build.
 * @param {string | undefined} valor
 */
function normalizarSite(valor) {
  const limpo = (valor ?? '').trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
  if (!limpo) return SITE_PADRAO;
  const comProtocolo = /^https?:\/\//i.test(limpo) ? limpo : `https://${limpo}`;
  try {
    return new URL(comProtocolo).origin;
  } catch {
    console.warn(`[astro.config] SITE_URL inválida ("${valor}"); usando ${SITE_PADRAO}.`);
    return SITE_PADRAO;
  }
}

const SITE = normalizarSite(process.env.SITE_URL);

// Landing page única: o sitemap tem a Home e a política de privacidade.
const EXCLUIR_DO_SITEMAP = new Set(['/404']);

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    // CSS do site é pequeno (~10 KB): inline no HTML, sem pedidos que bloqueiam a pintura.
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, '') || '/';
        return !EXCLUIR_DO_SITEMAP.has(path);
      },
    }),
  ],
});

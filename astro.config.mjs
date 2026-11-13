// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// TODO(conteudo): trocar pelo domínio definitivo quando a cliente contratar.
const SITE = process.env.SITE_URL ?? 'https://bioface-preview.vercel.app';

/**
 * Páginas de tratamento com pendente: true ficam fora do sitemap (e recebem noindex).
 * Lido direto do frontmatter porque a config roda antes das Content Collections.
 */
const DIR_PROCEDIMENTOS = new URL('./src/content/procedimentos/', import.meta.url);
const tratamentosPendentes = readdirSync(DIR_PROCEDIMENTOS)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => /^pendente:\s*true\s*$/m.test(readFileSync(new URL(f, DIR_PROCEDIMENTOS), 'utf8')))
  .map((f) => `/tratamentos/${f.replace(/\.md$/, '')}`);

const EXCLUIR_DO_SITEMAP = new Set(['/404', ...tratamentosPendentes]);

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
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

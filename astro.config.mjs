// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO(conteudo): trocar pelo domínio definitivo quando a cliente contratar.
const SITE = process.env.SITE_URL ?? 'https://bioface-preview.vercel.app';

// Landing page única: o sitemap tem a Home e a política de privacidade.
const EXCLUIR_DO_SITEMAP = new Set(['/404']);

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

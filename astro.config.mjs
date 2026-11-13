// @ts-check
import { defineConfig } from 'astro/config';

// TODO(conteudo): trocar pelo domínio definitivo quando a cliente contratar.
const SITE = process.env.SITE_URL ?? 'https://bioface-preview.vercel.app';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});

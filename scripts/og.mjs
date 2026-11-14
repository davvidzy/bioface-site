/**
 * Gera uma imagem Open Graph (1200×630) por página, a partir do build em dist/.
 * Usa as fontes self-hosted reais via Playwright, então não depende das fontes do servidor.
 *
 *   npm run og    (faz o build, gera public/og/*.png e faz o build de novo)
 *
 * Rode de novo quando um título de página mudar. Os PNGs ficam versionados em public/og/.
 */
import { readdirSync, readFileSync, mkdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { chromium } from '@playwright/test';

const RAIZ = process.cwd();
const DIST = join(RAIZ, 'dist');
const SAIDA = join(RAIZ, 'public', 'og');
// Fontes embutidas como data URL: a página do setContent não pode ler file://.
const fonte = (nome) =>
  `data:font/woff2;base64,${readFileSync(join(RAIZ, 'public', 'fonts', nome)).toString('base64')}`;
const DISPLAY = fonte('newsreader-latin.woff2');
const TEXTO = fonte('instrument-sans-latin.woff2');
const WORDMARK = readFileSync(join(RAIZ, 'src', 'assets', 'brand', 'wordmark.svg'), 'utf8');

function listarHtml(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) return listarHtml(p);
    return nome.endsWith('.html') ? [p] : [];
  });
}

function nomeOg(arquivo) {
  const rel = relative(DIST, arquivo)
    .split(sep)
    .join('/')
    .replace(/\.html$/, '');
  return rel === 'index' ? 'padrao' : rel.replace(/\//g, '-');
}

const decodificar = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();

function extrair(html, regex) {
  const m = html.match(regex);
  return m ? decodificar(m[1]) : '';
}

const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function template({ titulo, eyebrow }) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
    @font-face { font-family: 'Newsreader'; font-weight: 400 500; src: url('${DISPLAY}') format('woff2'); }
    @font-face { font-family: 'Instrument Sans'; font-weight: 400 600; src: url('${TEXTO}') format('woff2'); }
    * { margin: 0; box-sizing: border-box; }
    body { width: 1200px; height: 630px; background: #401e2f; color: #faf6f1;
      display: flex; flex-direction: column; justify-content: space-between; padding: 72px 80px; }
    .marca svg { width: 260px; height: auto; display: block; }
    .eyebrow { font: 500 22px/1.4 'Instrument Sans'; letter-spacing: .12em; text-transform: uppercase; color: #edc9a7; margin-bottom: 20px; }
    h1 { font: 400 76px/1.04 'Newsreader'; letter-spacing: -0.01em; max-width: 980px; }
    .rodape { font: 500 22px/1.4 'Instrument Sans'; color: #f3e3d2; }
  </style></head><body>
    <div class="marca">${WORDMARK}</div>
    <div>${eyebrow ? `<p class="eyebrow">${escapar(eyebrow)}</p>` : ''}<h1>${escapar(titulo)}</h1></div>
    <p class="rodape">Maria Guedes · Biomédica esteta · Lago Sul, Brasília</p>
  </body></html>`;
}

const paginas = listarHtml(DIST).filter((f) => !f.endsWith(`${sep}404.html`));
mkdirSync(SAIDA, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const arquivo of paginas) {
  const html = readFileSync(arquivo, 'utf8');
  const titulo = extrair(html, /<h1[^>]*>([\s\S]*?)<\/h1>/);
  const eyebrow = extrair(html, /<p class="eyebrow t-eyebrow"[^>]*>([\s\S]*?)<\/p>/);
  await page.setContent(template({ titulo, eyebrow }), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const nome = nomeOg(arquivo);
  await page.screenshot({ path: join(SAIDA, `${nome}.png`), type: 'png' });
  console.log(`og/${nome}.png  ${titulo}`);
}
await browser.close();

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROTAS } from './rotas';

/**
 * Critério de aceite: zero violações do axe em todas as rotas.
 * wcag2aaa inclui color-contrast-enhanced (7:1), o alvo do projeto.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

test.describe('axe: zero violações', () => {
  // Com reduced motion o conteúdo está no estado final (sem reveal em andamento),
  // então o axe mede contraste e visibilidade reais.
  test.use({ reducedMotion: 'reduce' });

  for (const rota of ROTAS) {
    test(`${rota}`, async ({ page }) => {
      await page.goto(rota, { waitUntil: 'networkidle' });
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const resumo = violations.map((v) => ({
        regra: v.id,
        impacto: v.impact,
        alvos: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
      }));
      expect(resumo, JSON.stringify(resumo, null, 2)).toEqual([]);
    });
  }
});

test.describe('axe: estados interativos', () => {
  test.use({ reducedMotion: 'reduce' });

  test('FAQ aberto e mapa carregado na Home', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    for (const summary of await page.locator('details summary').all()) await summary.click();
    const { violations } = await new AxeBuilder({ page })
      .withTags(TAGS)
      .exclude('iframe') // conteúdo do Google Maps não é nosso
      .analyze();
    expect(violations.map((v) => v.id)).toEqual([]);
  });

  // javaScriptEnabled: false também desliga o axe. Simulamos "sem JS" removendo
  // os <script> executáveis do HTML (o JSON-LD fica, não é código).
  test('sem JavaScript', async ({ page }) => {
    test.setTimeout(90_000);
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue();
      const resposta = await route.fetch();
      const html = (await resposta.text()).replace(
        /<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g,
        '',
      );
      await route.fulfill({ response: resposta, body: html });
    });
    for (const rota of ['/', '/resultados', '/tratamentos/tratamento-melasma']) {
      await page.goto(rota);
      expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(
        false,
      );
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations.map((v) => `${rota}: ${v.id}`)).toEqual([]);
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('WhatsApp', () => {
  test('todo link de agendamento abre wa.me com mensagem e avisa nova aba', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('a[data-track="whatsapp_click"]');
    expect(await links.count()).toBeGreaterThan(0);
    for (const link of await links.all()) {
      const href = (await link.getAttribute('href')) ?? '';
      expect(href).toMatch(/^https:\/\/wa\.me\/\d*\?text=/);
      expect(decodeURIComponent(href)).toContain('Vim pelo site');
      await expect(link).toHaveAttribute('target', '_blank');
      expect(await link.textContent()).toContain('nova aba');
    }
  });

  test('CTA da página de tratamento leva o nome do tratamento', async ({ page }) => {
    await page.goto('/tratamentos/tratamento-melasma');
    const href = await page
      .locator('[data-cta-final] a[data-track="whatsapp_click"]')
      .getAttribute('href');
    expect(decodeURIComponent(href ?? '')).toContain('avaliação sobre Tratamento para melasma');
  });
});

test.describe('Conteúdo e SEO', () => {
  test('um h1 por página', async ({ page }) => {
    for (const rota of ['/', '/tratamentos', '/resultados', '/sobre', '/privacidade']) {
      await page.goto(rota);
      await expect(page.locator('h1')).toHaveCount(1);
    }
  });

  test('tratamento pendente recebe noindex', async ({ page }) => {
    await page.goto('/tratamentos/fios-de-pdo');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('aviso de variação aparece junto de resultados', async ({ page }) => {
    await page.goto('/resultados');
    await expect(page.getByText('Resultados variam de pessoa para pessoa.')).toBeVisible();
  });
});

test.describe('Comparador antes/depois', () => {
  test('teclado move o controle e anuncia porcentagem', async ({ page }) => {
    await page.goto('/resultados');
    const controle = page.locator('[data-ba] input[type="range"]').first();
    await controle.focus();
    await page.keyboard.press('ArrowRight');
    await expect(controle).toHaveAttribute('aria-valuetext', '51% antes, 49% depois');
    await page.keyboard.press('End');
    await expect(controle).toHaveAttribute('aria-valuetext', '100% antes, 0% depois');
  });
});

test.describe('Movimento', () => {
  test('sem JS todo conteúdo fica visível', async ({ browser }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false });
    const page = await contexto.newPage();
    await page.goto('/');
    for (const el of await page.locator('[data-reveal]').all()) {
      await expect(el).toHaveCSS('opacity', '1');
    }
    await contexto.close();
  });

  test('carrega na primeira interação, revela ao rolar e sobrevive à navegação', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'fluxo de ponteiro e roda do mouse');
    const erros: string[] = [];
    page.on('pageerror', (e) => erros.push(e.message));
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).not.toHaveClass(/lenis/);

    await page.mouse.move(200, 200);
    await expect(page.locator('html')).toHaveClass(/lenis/);
    // Abaixo da dobra: escondido pelo JS até o scroll chegar.
    await expect(page.locator('#faq-titulo')).toHaveCSS('opacity', '0');
    await page.locator('#faq-titulo').scrollIntoViewIfNeeded();
    await expect(page.locator('#faq-titulo')).toHaveCSS('opacity', '1', { timeout: 3000 });

    await page.locator('header a[href="/tratamentos"]').click();
    await page.waitForURL('**/tratamentos');
    await expect(page.locator('html')).toHaveAttribute('data-js', '');
    await page.locator('.categorias-nav a[href="#contorno"]').click();
    await expect(page.locator('#contorno')).toBeFocused();
    expect(erros).toEqual([]);
  });

  test('reduced motion: sem Lenis e conteúdo visível', async ({ browser }) => {
    const contexto = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await contexto.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await expect(page.locator('#faq-titulo')).toHaveCSS('opacity', '1');
    await contexto.close();
  });
});

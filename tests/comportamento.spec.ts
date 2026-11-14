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
});

test.describe('Hero', () => {
  test('ocupa a tela inteira e tem título, descrição e CTA', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('.hero');
    const altura = await hero.evaluate((h) => h.getBoundingClientRect().height);
    expect(Math.round(altura)).toBe(page.viewportSize()?.height);
    await expect(hero.locator('h1')).toHaveCount(1);
    await expect(hero.locator('.hero__descricao')).toBeVisible();
    await expect(hero.locator('a[data-origem="hero"]')).toBeVisible();
  });

  test('foto certa por orientação', async ({ page, isMobile }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const src = await page.locator('.hero img').evaluate((i) => (i as HTMLImageElement).currentSrc);
    expect(src).toContain(isMobile ? 'hero-mobile' : 'hero-desktop');
  });

  test('descrição em no máximo 2 linhas', async ({ page }) => {
    await page.goto('/');
    const linhas = await page.locator('.hero__descricao').evaluate((p) => {
      const lh = parseFloat(getComputedStyle(p).lineHeight);
      return Math.round(p.getBoundingClientRect().height / lh);
    });
    expect(linhas).toBeLessThanOrEqual(2);
  });

  test('mobile: botão flutuante oculto com o hero na tela', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'botão flutuante só existe no mobile');
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-floating-whatsapp]')).toHaveAttribute('data-oculto', '');
    await page.locator('#tratamentos').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-floating-whatsapp]')).not.toHaveAttribute('data-oculto', '');
  });
});

test.describe('Conteúdo e SEO', () => {
  test('um h1 por página', async ({ page }) => {
    for (const rota of ['/', '/privacidade', '/404']) {
      await page.goto(rota);
      await expect(page.locator('h1')).toHaveCount(1);
    }
  });

  test('cada âncora do header tem uma seção na Home', async ({ page, isMobile }) => {
    test.skip(isMobile, 'navegação do header só aparece no desktop');
    await page.goto('/');
    for (const link of await page.locator('header nav a').all()) {
      const ancora = ((await link.getAttribute('href')) ?? '').split('#')[1] ?? '';
      await expect(page.locator(`section#${ancora}`)).toHaveCount(1);
    }
  });

  test('aviso de variação aparece junto de resultados', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('#resultados').getByText('Resultados variam de pessoa para pessoa.'),
    ).toBeVisible();
  });
});

test.describe('Comparador antes/depois', () => {
  test('teclado move o controle e anuncia porcentagem', async ({ page }) => {
    await page.goto('/');
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

    // Ida e volta pela política de privacidade (ClientRouter) e âncora na volta.
    await page.locator('footer a[href="/privacidade"]').click();
    await page.waitForURL('**/privacidade');
    await page.locator('header a[href="/"]').click();
    await page.waitForURL((url) => url.pathname === '/');
    await expect(page.locator('html')).toHaveAttribute('data-js', '');
    // Durante a View Transition a camada ::view-transition cobre a página e recebe os cliques.
    await page.waitForFunction(() =>
      document.getAnimations().every((a) => a.playState !== 'running'),
    );
    await page.locator('header nav a[href="/#tratamentos"]').click();
    await expect(page.locator('#tratamentos')).toBeFocused();
    expect(erros).toEqual([]);
  });

  test('âncora como primeira interação: rola e foca o destino', async ({ page, isMobile }) => {
    test.skip(isMobile, 'navegação do header só aparece no desktop');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('header nav a[href="/#duvidas"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#duvidas')).toBeFocused();
    await expect(page.locator('#duvidas')).toBeInViewport();
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

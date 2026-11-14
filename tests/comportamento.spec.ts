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
  test('altura, título, descrição e CTA', async ({ page, isMobile }) => {
    await page.goto('/');
    const hero = page.locator('.hero');
    const altura = await hero.evaluate((h) => h.getBoundingClientRect().height);
    const tela = page.viewportSize()!.height;
    // Desktop: exatamente a tela. Celular: maior de propósito (foto inteira abaixo do texto).
    if (isMobile) expect(altura).toBeGreaterThan(tela);
    else expect(Math.round(altura)).toBe(tela);
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

test.describe('Menu do celular', () => {
  test('abre, mostra os links e fecha ao tocar num link', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'menu hambúrguer só no celular');
    await page.goto('/', { waitUntil: 'networkidle' });
    const menu = page.locator('[data-menu-movel]');
    await expect(page.locator('header nav[aria-label="Principal"]')).toBeHidden();
    await menu.locator('summary').click();
    await expect(menu.locator('[data-menu-link]')).toHaveCount(4);
    await expect(menu.locator('a[data-origem="menu"]')).toBeVisible();
    await menu.locator('[data-menu-link]', { hasText: 'Dúvidas' }).click();
    await expect(menu).not.toHaveAttribute('open', '');
    await expect(page.locator('#duvidas')).toBeInViewport();
  });

  test('Esc fecha e devolve o foco ao botão', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'menu hambúrguer só no celular');
    await page.goto('/');
    const botao = page.locator('[data-menu-movel] summary');
    await botao.click();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-menu-movel]')).not.toHaveAttribute('open', '');
    await expect(botao).toBeFocused();
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
    for (const link of await page.locator('header nav[aria-label="Principal"] a').all()) {
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

test.describe('Tratamentos', () => {
  test('desktop: seção fixa, uma categoria por vez e maca 3D', async ({ page, isMobile }) => {
    test.skip(isMobile, 'cena 3D só no desktop');
    test.setTimeout(90_000);
    const erros: string[] = [];
    page.on('pageerror', (e) => erros.push(e.message));
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.mouse.move(200, 200); // primeira interação carrega o movimento
    const bloco = page.locator('[data-tratamentos]');
    await expect(bloco).toHaveClass(/trat--animado/);

    const opacidades = () =>
      page
        .locator('[data-trat-cat]')
        .evaluateAll((cs) => cs.map((c) => Number(getComputedStyle(c).opacity)));
    const topo = await bloco.evaluate((b) => b.getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => window.scrollTo(0, y), topo);
    await expect(page.locator('.trat__palco--3d canvas')).toBeAttached({ timeout: 30_000 });
    await expect.poll(opacidades).toEqual([1, 0, 0]);

    // Rola com a roda do mouse, como uma pessoa: a seção fica presa e as categorias
    // aparecem uma por vez, em ordem (o snap sempre assenta numa categoria inteira).
    const vistas: number[] = [0];
    let presa = false;
    for (let passo = 0; passo < 20 && vistas.at(-1) !== 2; passo++) {
      await page.mouse.wheel(0, 220);
      // Espera a rolagem assentar (snap concluído) antes de ler, como quem para para ler.
      let anterior = -1;
      for (let t = 0; t < 30; t++) {
        await page.waitForTimeout(250);
        const y = await page.evaluate(() => Math.round(scrollY));
        if (y === anterior) break;
        anterior = y;
      }
      const o = await opacidades();
      const atual = o.indexOf(1);
      if (o.filter((v) => v === 1).length === 1 && atual !== vistas.at(-1)) vistas.push(atual);
      if (Math.round(await bloco.evaluate((b) => b.getBoundingClientRect().top)) === 0)
        presa = true;
    }
    expect(vistas).toEqual([0, 1, 2]);
    expect(presa).toBe(true);
    expect(erros).toEqual([]);
  });

  test('mobile: layout estático com imagem, sem baixar o 3D', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'regra do mobile');
    const pedidos3d: string[] = [];
    page.on('request', (r) => {
      if (/maca\.glb|maca3d/.test(r.url())) pedidos3d.push(r.url());
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#tratamentos').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-tratamentos]')).not.toHaveClass(/trat--animado/);
    await expect(page.locator('img.trat__poster')).toBeVisible();
    await expect(page.locator('[data-trat-cat]')).toHaveCount(3);
    expect(pedidos3d).toEqual([]);
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
      document
        .getAnimations()
        // Ignora animações infinitas de propósito (halo do CTA do hero).
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .every((a) => a.playState !== 'running'),
    );
    await page.locator('header nav[aria-label="Principal"] a[href="/#tratamentos"]').click();
    await expect(page.locator('#tratamentos')).toBeFocused();
    expect(erros).toEqual([]);
  });

  test('âncora como primeira interação: rola e foca o destino', async ({ page, isMobile }) => {
    test.skip(isMobile, 'navegação do header só aparece no desktop');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('header nav[aria-label="Principal"] a[href="/#duvidas"]').focus();
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

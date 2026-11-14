# BioFace Estética Avançada | Brief de arquitetura para o Claude Code

> Este arquivo é a fonte da verdade estrutural do projeto. Leia inteiro antes de criar ou alterar qualquer coisa.
> Fase atual: **design da prévia** (a Fase 0 de estrutura está concluída). A direção visual está na seção 6.1.1. Desempenho, SEO e Lighthouse ficam para a etapa final.

---

## 1. Contexto do projeto

- **Cliente:** BioFace Estética Avançada. Marca centrada na profissional **Maria Guedes, biomédica esteta**, 18 anos de atuação, Lago Sul, Brasília/DF.
- **Posicionamento:** resultados naturais. O maior medo do público é ficar artificial. Toda decisão de conteúdo, imagem e movimento reforça sutileza, precisão e confiança.
- **Público:** majoritariamente mulheres de 35 a 60 anos, alta renda, chegam por indicação ou por busca local no Google ("harmonização Lago Sul", "melasma Brasília"). Já chegam com alguma confiança: o site confirma a indicação e remove atrito.
- **Objetivo único de conversão:** agendar uma avaliação via WhatsApp. Não existe venda online, preço público ou checkout.
- **Contexto comercial:** é uma prévia de prospecção. A cliente ainda não contratou. Conteúdo real é parcial e várias informações estão pendentes (ver seção 12).
- **Ambição:** nível Awwwards. Experiência com movimento, transições entre páginas e tipografia editorial. Não é uma landing page estática.

### Fonte de material
Figma: `https://www.figma.com/design/FDfWwtVIEb88Y0hhe6oKgv/BioFace`

| Página Figma | Node | Conteúdo |
|---|---|---|
| Brand | `0:1` | Logo (ícone circular em imagem raster), wordmark BIOFACE em vetor (`1:109`), monograma BF (`1:108`) |
| Design System | `1:115` | **Usar `Fundações v2` (`7:2`)**: cores, temas, regras e tipografia. Variáveis `Primitivos` e `Cor` + 11 estilos de texto. Frames `1:116` e `1:122` estão substituídos. |
| Antes X Depois | `1:125` | 5 pares de antes/depois (frames `1:126`, `1:135`, `1:138`, `1:141`, `1:144`) + `Notas de revisão` (`7:160`) |
| Procedimentos | `1:147` | **Usar `Procedimentos v2` (`7:122`)**: 12 tratamentos corrigidos e agrupados. Frame `1:148` está substituído. |

Use o MCP do Figma (`get_design_context`, `get_screenshot`, `get_metadata`) para ler. O código que ele devolve é React + Tailwind de referência: **converta para a stack deste projeto, não instale Tailwind.**

---

## 2. Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Astro 6** (TypeScript strict) | Site de conteúdo com pouco JS por padrão, ótimo LCP, Content Collections tipadas, View Transitions nativas. Requer Node 22+. |
| Animação | **GSAP 3** (core, ScrollTrigger, SplitText, Flip, CustomEase) | Padrão de mercado para sites de prêmio. Todos os plugins são gratuitos para uso comercial, instalados direto do pacote `gsap` no npm. |
| Scroll suave | **Lenis** | Scroll suave leve, sincronizado com o ticker do GSAP. |
| Transição de páginas | **Astro `<ClientRouter />`** (View Transitions) | Navegação sem recarregar, com hooks de ciclo de vida para montar e desmontar animações. |
| Estilo | **CSS puro** com custom properties (tokens) + estilos escopados dos componentes `.astro` | Design autoral e movimento complexo pedem controle fino. Sem Tailwind, sem UI kit. |
| Imagens | `astro:assets` (`<Image />`, `<Picture />`) com AVIF/WebP | Responsivo, lazy, dimensões explícitas, zero CLS. |
| Fontes | Self-hosted, WOFF2 com subset Latin + Latin Extended | Performance e controle de licença. |
| Conteúdo | Content Collections (arquivos em `src/content/`) | Tipado com Zod, pronto para plugar um CMS depois sem refatorar páginas. |
| Deploy | Build estático (`output: 'static'`) em Vercel ou Cloudflare Pages | URL de preview para enviar à cliente. |
| Qualidade | ESLint, Prettier, `astro check`, Lighthouse CI, axe (via Playwright) | A11y e performance medidos, não presumidos. |

**Não adicione dependências fora desta lista sem justificar no PR/commit.** Candidatos futuros, só se o design pedir: `ogl` ou `three` para efeito WebGL em imagem, Keystatic ou Sanity como CMS.

### Versões
Fixe versões exatas no `package.json`. Rode `npm view <pacote> version` antes de instalar para pegar a estável atual.

---

## 3. Mapa do site

> **Atualização de 2026-11-14:** a pedido, cada um dos 3 objetivos ganhou uma página própria (`/tratamentos/[categoria]`), aberta pelos cards da Home. As páginas por tratamento continuam fora.
>
> **Decisão de 2026-11-13: landing page única.** Tudo acontece na Home. As páginas `/tratamentos`, `/tratamentos/[slug]`, `/resultados` e `/sobre` foram removidas a pedido. **Não recrie rotas novas** sem pedido explícito. As seções 6.2 a 6.5 abaixo ficam só como referência de conteúdo para as seções da Home.

```
/                                   Home (header navega por âncoras)
/tratamentos/[categoria]            Uma página por objetivo (pele, rejuvenescimento, contorno), com os tratamentos em cards
/privacidade                        Política de privacidade (LGPD, obrigatória)
/404                                Página não encontrada, com caminho de volta
```

Âncoras da Home (header): `#tratamentos`, `#resultados`, `#sobre`, `#duvidas`; o Método é `#metodo` e o CTA final é `#contato`.

Não existe `/contato`: o contato é o WhatsApp (header, hero, linhas de tratamento, Método e CTA final) e o bloco de localização fica no CTA final da Home.

Consequência aceita: sem uma página por tratamento, o SEO local depende da Home (title, description, JSON-LD de `HealthAndBeautyBusiness` e `FAQPage`). A collection `procedimentos` continua com o modelo completo (seção 5), pronta se as páginas voltarem.

---

## 4. Taxonomia dos tratamentos

O Figma lista 12 tratamentos faciais. Na interface eles são agrupados **pelo objetivo da paciente**, não pelo nome técnico. A paciente busca o problema dela, não "bioestimulador de colágeno".

> **Hipótese a validar com a Maria.** O agrupamento abaixo é uma proposta. Mantenha a categoria como campo de dado, nunca hardcoded em componente.

| Categoria (slug) | Rótulo na interface | Tratamentos |
|---|---|---|
| `pele` | Saúde e qualidade da pele | Limpeza de pele; Tratamento para acne; Tratamento para melasma; Peelings químicos; Microagulhamento |
| `rejuvenescimento` | Firmeza e rejuvenescimento | Bioestimuladores de colágeno; Fios de PDO; Tecnologias (laser, ultrassom microfocado e outros); Tratamentos regenerativos; Rejuvenescimento das pálpebras com jato de plasma |
| `contorno` | Expressão e contorno | Toxina botulínica; Preenchimento facial |

### Correções já aplicadas no Figma (`Procedimentos v2`)
- "Microagumento" virou **Microagulhamento**; "Peeling químicos" virou **Peelings químicos**.
- "Blefaroplastia sem corte" virou **Rejuvenescimento das pálpebras com jato de plasma**. Blefaroplastia é o nome de uma cirurgia, e usar o termo para um procedimento não cirúrgico pode gerar problema com conselhos profissionais. Marque `TODO(validar-cliente)`.
- Cada categoria tem uma frase de apoio já escrita no Figma; use-a como `descricao` da categoria.

### Slugs
`limpeza-de-pele`, `tratamento-acne`, `tratamento-melasma`, `peelings-quimicos`, `microagulhamento`, `bioestimuladores-de-colageno`, `fios-de-pdo`, `tecnologias`, `tratamentos-regenerativos`, `jato-de-plasma-palpebras`, `toxina-botulinica`, `preenchimento-facial`

São 12 itens no node `1:150`, um arquivo por item. "Tecnologias" agrupa laser e ultrassom microfocado num item só; se a cliente quiser páginas separadas para cada tecnologia, ele vira categoria própria depois.

---

## 5. Modelo de conteúdo

Defina tudo em `src/content.config.ts` com Zod. Campos sem conteúdo real recebem placeholder marcado e **nunca** texto clínico inventado.

### `procedimentos` (um `.md` por tratamento)
```ts
{
  nome: string,                 // "Tratamento para melasma"
  categoria: 'pele' | 'rejuvenescimento' | 'contorno',
  ordem: number,                // ordem dentro da categoria
  destaque: boolean,            // aparece na Home
  problema: string,             // a dor em linguagem da paciente, 1 frase
  resumo: string,               // 1 a 2 frases para cards
  paraQuem: string[],           // indicações
  comoFunciona: string,         // corpo em markdown
  expectativa: {                // tudo opcional até a cliente informar
    sessoes?: string,
    duracaoSessao?: string,
    recuperacao?: string,
    inicioResultado?: string,
    duracaoResultado?: string,
  },
  faq: { pergunta: string, resposta: string }[],
  relacionados: reference('procedimentos')[],
  seo: { title: string, description: string },
  pendente: boolean,            // true enquanto o conteúdo não for validado
}
```

### `resultados` (um `.json` por par)
```ts
{
  procedimento: reference('procedimentos'),
  antes: image(),
  depois: image(),
  alt: { antes: string, depois: string },  // descrição clínica neutra
  legenda?: string,
  intervalo?: string,          // "após 30 dias"
  consentimento: boolean,      // GATE: só renderiza se true
}
```
**Regra dura:** um resultado com `consentimento: false` não é renderizado em nenhum lugar. Na prévia de prospecção, use `true` apenas nos 5 pares do Figma, que já são públicos no Instagram da cliente, e registre isso em comentário.

### `depoimentos`
```ts
{ autora: string /* nome e inicial */, texto: string, origem: 'google' | 'instagram', procedimento?: reference('procedimentos'), data?: date, pendente: boolean }
```
Sem depoimento real, **não invente**. Renderize a seção com estado de placeholder visível apenas em ambiente de desenvolvimento.

### `faq` (geral, um `.json`)
Perguntas transversais: dor, segurança dos produtos, avaliação é paga?, como agendar, formas de pagamento, "quanto custa?" (resposta: definido na avaliação, porque cada plano é individual).

### `site` (config única em `src/data/site.ts`)
```ts
{
  marca: 'BioFace Estética Avançada',
  responsavel: { nome: 'Maria Guedes', titulo: 'Biomédica esteta', registro: 'CRBM TODO' },
  anosAtuacao: 18,
  endereco: { logradouro: 'TODO', bairro: 'Lago Sul', cidade: 'Brasília', uf: 'DF', cep: 'TODO', geo: { lat: null, lng: null } },
  whatsapp: 'TODO', // só dígitos, com DDI 55
  horarios: [],
  instagram: 'https://www.instagram.com/bioface_/',
  linktree: 'https://linktr.ee/bioface_',
}
```

---

## 6. Arquitetura de cada página

Cada seção tem um **job**. Se uma seção não cumpre o job, ela sai. A ordem segue a sequência de decisão da paciente: quem é, o que faz, funciona, como é o processo, posso confiar, como agendo.

### 6.1 Home `/`

> **Revisão de 2026-11-14** (diagnóstico de design): a página passou de 13 para 10 seções. Filosofia e "Como funciona" viraram uma seção só (Método); a frase sobre naturalidade entrou como citação da Maria. Credenciais voltaram como faixa de fatos abaixo do hero. Depoimentos e Espaço só aparecem quando houver material real.

| # | Seção | Job | Conteúdo | Tema | CTA |
|---|---|---|---|---|---|
| 1 | Header | Navegar e converter de qualquer ponto | Logo do Figma (monograma + wordmark), âncoras com a seção atual marcada, botão "Agendar avaliação" | topo: sem fundo, tema claro, logo vinho menor e mais respiro; ao rolar: pílula vinho (tema escuro) com o logo âmbar | WhatsApp |
| 2 | Hero | Em 3 segundos: quem, o quê, onde | Foto em tela cheia com degradê; frase-manifesto sem itálico (2 linhas no desktop, 3 no celular), descrição curta em Body (2 linhas) e CTA, alinhados à esquerda (versão mantida a pedido em 2026-11-14) | claro (`bg/default`) | WhatsApp |
| 3 | Credenciais | Transformar promessa em fato | Faixa muito discreta: uma linha curta por fato, de tamanhos parecidos, separadas por ponto dourado (anos, formação, nº de tratamentos, bairro). CRBM e nota do Google entram quando a cliente informar | claro | nenhum |
| 4 | Tratamentos | Mostrar amplitude sem sobrecarregar | 3 cards, um por objetivo (número, quantidade, nome, nomes dos tratamentos), cada um levando a `/tratamentos/[categoria]`. Na página da categoria: cards dos tratamentos (número contínuo 01 a 12, nome, a dor numa frase), cada um abrindo o WhatsApp com o nome do tratamento | claro | página da categoria; WhatsApp por tratamento |
| 5 | Resultados | Prova visual | Comparador em moldura 3:4 à esquerda; à direita título, caso atual (contador e região) e miniaturas meio antes/meio depois. Sem o aviso "resultados variam" (removido a pedido; validar com a cliente) | `bg/subtle` | nenhum |
| 6 | Método | Diferenciar e reduzir ansiedade | "Como a Maria trabalha": frase de método + 3 passos | escuro (wine/900) | WhatsApp |
| 7 | Maria | Autoridade e vínculo humano | Foto grande, nome em Display/XL, citação dela, trajetória | escuro | nenhum |
| 8 | Depoimentos | Prova social de terceiros | Só com reviews reais; sem material, a seção não aparece | escuro | nenhum |
| 9 | Espaço | Ambiente premium | Só com fotos reais da clínica; sem material, não aparece | escuro | nenhum |
| 10 | FAQ | Responder objeções | Só perguntas já respondidas pela cliente | escuro | nenhum |
| 11 | CTA final + localização | Última chance de conversão | Chamada, endereço, horários, mapa sob demanda | wine/950 | WhatsApp |
| 12 | Rodapé | Confiança e conformidade | Responsável técnica com CRBM, Instagram, `/privacidade` (o endereço fica só no CTA final) | wine/950 | nenhum |

Sem botão flutuante de WhatsApp no mobile (removido a pedido em 2026-11-14).

### 6.1.1 Direção visual (decidida em 2026-11-14)

- **Narrativa de luz:** a página começa no creme e escurece aos poucos até o vinho (creme → `bg/subtle` → wine/900 → wine/950), como o dia indo para o entardecer. As passagens entre fundos são faixas de degradê decorativas (`components/ui/Transicao.astro`), fora das seções, para nenhum texto ficar sobre a transição.
- **Itálico só no título do CTA final.** O `h1` do hero e os outros títulos são retos.
- **Um único botão de CTA em todo o site** (`components/ui/Button.astro`): pílula com hover "fluido" (preenchimento em elipse que sobe de baixo, rótulo que rola para a cópia invertida, leve crescimento). Cores pelo tema: vinho no claro, dourado no escuro. Sem variantes.
- **Ritmo único de movimento:** toda mudança de estado usa `--motion-fluido` (750ms, `--ease-out-soft`).
- **Texto corrido com no mínimo Body/M (18px).** Legendas e rótulos curtos podem usar Body/S.
- **Sem linhas de conexão entre seções.** O espaço em branco e a mudança de fundo separam.
- **Pendências na prévia:** lacunas pequenas aparecem como "A confirmar: …" em itálico discreto. Textos de apresentação escritos para a prévia (frase do método, citação e trajetória da Maria, frase de dor de cada tratamento) levam a marca "Rascunho para aprovação" e `TODO(validar-cliente)` no código. Isso não vale para conteúdo clínico, números, preços ou depoimentos: esses continuam sem invenção.

**Fica fora de propósito:** tabela de preços, blog, newsletter, "missão, visão e valores", contador animado de números sem fonte, carrossel automático.

### 6.2 Índice `/tratamentos` (removida: landing única, ver seção 3)
1. Cabeçalho da página (`h1` + 1 frase sobre avaliação individual)
2. Navegação por categoria (âncoras ou filtro, operável por teclado)
3. 3 blocos de categoria, cada um com seus cards
4. CTA: "Não sabe qual é o seu caso? A avaliação define." → WhatsApp

### 6.3 Template `/tratamentos/[slug]` (removida: landing única, ver seção 3)
1. Breadcrumb (Tratamentos › Categoria › Nome)
2. Hero: `h1` com o nome + `problema` em linguagem da paciente
3. Para quem é (`paraQuem`)
4. Como funciona (`comoFunciona`)
5. O que esperar (`expectativa` como lista de definição `<dl>`; omitir campos vazios)
6. Resultados deste tratamento (filtra `resultados` pelo slug; omitir a seção se não houver nenhum)
7. Perguntas frequentes deste tratamento
8. Tratamentos relacionados
9. CTA com mensagem pré-preenchida com o nome do tratamento

Se `pendente: true`, a página é gerada mas recebe `noindex` e não entra no sitemap.

### 6.4 `/resultados` (removida: os comparadores ficam na seção Resultados da Home)
1. Cabeçalho + aviso: resultados variam de pessoa para pessoa
2. Filtro por tratamento (só os que têm resultado)
3. Grade de comparadores antes/depois
4. CTA → WhatsApp

### 6.5 `/sobre` (removida: conteúdo vai para as seções Sobre, Espaço e CTA final da Home)
1. Maria Guedes: foto, formação, 18 anos de trajetória
2. Filosofia de trabalho (versão longa da seção 4 da Home)
3. O espaço (galeria)
4. Localização, horários, mapa
5. CTA

---

## 7. Arquitetura de pastas

```
src/
  content.config.ts
  content/
    procedimentos/*.md
    resultados/*.json
    depoimentos/*.json
    faq.json
  data/
    site.ts
  assets/
    brand/                 # wordmark.svg, monograma.svg (exportar dos nodes 1:109 e 1:108)
    resultados/            # pares antes/depois
    pessoas/ espaco/
  components/
    ui/                    # Button, Link, Accordion, BeforeAfter, Breadcrumb, WhatsAppLink
    sections/              # uma pasta/arquivo por seção da seção 6
    layout/                # Header, Footer, FloatingWhatsApp, SkipLink
  layouts/
    BaseLayout.astro       # <html lang="pt-BR">, SEO, ClientRouter, init de motion
  pages/                   # rotas da seção 3
  lib/
    motion/
      index.ts             # registra plugins GSAP, cria Lenis, sincroniza ticker
      reveal.ts            # animações declarativas via data-attributes
      lifecycle.ts         # init/destroy em astro:page-load e astro:before-swap
      reduced-motion.ts
    whatsapp.ts            # builder de link com mensagem e origem
    seo.ts                 # meta, Open Graph, JSON-LD
    analytics.ts           # eventos (no-op até definir ferramenta)
  styles/
    reset.css
    tokens.css             # cores, tipografia, espaçamento, easing, durações, z-index
    typography.css
    global.css
public/
  fonts/
```

---

## 8. Infraestrutura de movimento

O design das animações vem depois. Agora você constrói **o sistema** que vai recebê-las.

### Princípios
1. **Conteúdo visível por padrão.** Nenhum elemento começa com `opacity: 0` no CSS. O estado inicial oculto é aplicado pelo JS no momento da animação. Sem JS, o site está completo e legível.
2. **Declarativo.** As seções marcam intenção no HTML (`data-reveal="lines"`, `data-reveal="fade"`, `data-parallax="0.2"`). O `lib/motion/reveal.ts` lê os atributos e cria as animações. Na fase de design, ajustamos timings sem tocar na marcação.
3. **Uma instância de Lenis**, criada uma vez, sincronizada com `gsap.ticker`; `ScrollTrigger.update` no evento de scroll do Lenis.
4. **Ciclo de vida com o ClientRouter:** criar animações em `astro:page-load` dentro de `gsap.context()`; reverter o contexto e matar os ScrollTriggers em `astro:before-swap`; `ScrollTrigger.refresh()` depois de fontes e imagens carregarem.
5. **`prefers-reduced-motion`:** via `gsap.matchMedia()`. Com redução ativa: sem Lenis, sem parallax, sem SplitText animado; transições viram fade curto ou nada.
6. **Tokens de movimento** em `tokens.css` e espelhados em `lib/motion` (durações, easings nomeados como `--ease-out-soft`). Nada de número mágico espalhado.
7. **SplitText acessível:** usar a opção de aria do plugin, para que o leitor de tela leia a frase inteira e não letra por letra; refazer o split no resize.
8. **Âncoras e teclado com Lenis:** links `#ancora` usam `lenis.scrollTo`; foco por Tab precisa continuar levando o elemento para a área visível.

### Entregável da Fase 0
Sistema funcionando com **um único reveal de exemplo** (fade + leve deslocamento) aplicado aos títulos de seção, e uma transição de página simples (fade). Nada além disso.

---

## 9. Acessibilidade (alvo WCAG 2.2 AAA onde aplicável)

- Contraste de texto **mínimo 7:1**; texto grande (≥ 24px, ou ≥ 18,66px em negrito) mínimo 4,5:1.
- `lang="pt-BR"`, skip link para `#conteudo`, landmarks (`header`, `nav`, `main`, `footer`), um `h1` por página, hierarquia sem saltos.
- Foco visível e consistente em todo elemento interativo (`:focus-visible`, contorno ≥ 2px com contraste ≥ 3:1 contra o fundo adjacente).
- Alvos de toque ≥ 44 × 44px.
- **Comparador antes/depois:** implementar com `<input type="range">` nativo por baixo (teclado e leitor de tela de graça), `aria-label` descritivo, valor anunciado em porcentagem. Arrasto com mouse/toque é enhancement.
- Acordeão do FAQ com `<details>/<summary>` ou botão com `aria-expanded` + `aria-controls`.
- Links de WhatsApp: texto explícito ("Agendar avaliação pelo WhatsApp") e aviso de que abre em outro app/aba.
- Imagens de antes/depois: `alt` clínico e neutro ("Região dos lábios antes do tratamento"), sem adjetivos promocionais.
- Mapa: carregar sob demanda com fallback em texto (endereço + link para o Google Maps).
- Testar com axe em todas as rotas no CI; zero violações é critério de aceite.

### Pares de cor aprovados (calculados, todos AAA)
A paleta foi refeita a partir do dourado rosado do logo. O âmbar `#E8A04D` do Figma original foi **removido**: não pertence à marca e falhava em contraste (2,1:1 sobre claro).

| Tema | Par | Contraste |
|---|---|---|
| Claro | `text/primary` wine/900 sobre cream/50 | 13,5:1 |
| Claro | `text/secondary` wine/700 sobre cream/50 | 9,3:1 |
| Claro | `text/accent` gold/900 sobre cream/50 | 8,4:1 |
| Claro | Botão: cream/50 sobre wine/900 | 13,5:1 |
| Escuro | `text/primary` cream/50 sobre wine/900 | 13,5:1 |
| Escuro | `text/secondary` gold/100 sobre wine/900 | 11,6:1 |
| Escuro | `text/accent` gold/200 sobre wine/900 | 9,4:1 |
| Escuro | Botão: wine/900 sobre gold/200 | 9,4:1 |

Usos proibidos: gold/400 e gold/600 como texto sobre creme (1,9:1 e 2,6:1); wine/700 sobre wine/900 como texto (1,45:1); wine/500 em texto corrido (5,2:1, serve só para borda).

**Anel de foco:** contorno de 2px na cor `focus/ring`, com **4px de afastamento** do elemento (`outline-offset: 4px`). Sem o afastamento, o anel encosta num botão da mesma cor e o foco fica invisível.

---

## 10. Tokens (fonte: Figma, página Design System, frame `Fundações v2`, node `7:2`)

As variáveis do Figma já têm `code syntax` WEB igual aos nomes abaixo. Coleções: `Primitivos` (1 modo) e `Cor` (modos `Claro` e `Escuro`). Os frames `Colors` e `Typography` antigos estão marcados como substituídos: **não use**.

```css
:root {
  /* primitivos */
  --wine-950: #2B1420;
  --wine-900: #401E2F;
  --wine-700: #613448;
  --wine-500: #8A5A70;
  --gold-100: #F3E3D2;
  --gold-200: #EDC9A7;
  --gold-400: #D2AD8C;
  --gold-600: #BC9477;
  --gold-900: #5E4331;
  --cream-50: #FAF6F1;
  --cream-100: #F2EADF;

  /* semânticos, tema claro (padrão) */
  --color-bg-default: var(--cream-50);
  --color-bg-subtle: var(--cream-100);
  --color-text-primary: var(--wine-900);
  --color-text-secondary: var(--wine-700);
  --color-text-accent: var(--gold-900);
  --color-action-primary-bg: var(--wine-900);
  --color-action-primary-text: var(--cream-50);
  --color-border-default: var(--wine-500);
  --color-focus-ring: var(--wine-900);
  --color-accent-decorative: var(--gold-400);

  --font-display: 'Newsreader', 'Times New Roman', serif;
  --font-body: 'Instrument Sans', system-ui, sans-serif;
  --measure: 68ch; /* comprimento de linha alvo: 60 a 80 caracteres */
}

/* seções escuras: aplicar data-theme="escuro" na <section> */
[data-theme='escuro'] {
  --color-bg-default: var(--wine-900);
  --color-bg-subtle: var(--wine-950);
  --color-text-primary: var(--cream-50);
  --color-text-secondary: var(--gold-100);
  --color-text-accent: var(--gold-200);
  --color-action-primary-bg: var(--gold-200);
  --color-action-primary-text: var(--wine-900);
  --color-border-default: var(--gold-400);
  --color-focus-ring: var(--gold-200);
}
```

O tema é **por seção**, não por preferência do sistema: a narrativa da página alterna seções claras e escuras. Componentes só consomem tokens semânticos, nunca primitivos.

### Tipografia
- **Decisão de 2026-11-14:** display em **Newsreader** e texto em **Instrument Sans** (ambas SIL OFL), no lugar de Cormorant Garamond e Inter. As tabelas abaixo continuam valendo para tamanhos e entrelinhas; onde diz Cormorant, leia Newsreader, e onde diz Inter, leia Instrument Sans.
- **Display:** Newsreader variável (peso 400 a 500, tamanho óptico automático). Mais robusta em tamanho pequeno que a Cormorant, então a regra "nunca abaixo de 24px" não se aplica mais.
- **Texto:** Instrument Sans **Regular 400** no corpo, Medium 500 em rótulos e botões.
- Self-host em WOFF2, subset Latin + Latin Extended, `font-display: swap`, preload só da Newsreader (regular e itálico do hero).

Estilos de texto no Figma (desktop; no código, vire `clamp()` com mínimo para mobile):

| Estilo | Fonte | Tamanho / entrelinha | Espaçamento |
|---|---|---|---|
| Display/XL | Cormorant Garamond Regular | 96 / 100% | -1,5% |
| Display/L | Cormorant Garamond Regular | 72 / 104% | -1% |
| Heading/H2 | Cormorant Garamond Regular | 52 / 112% | -0,5% |
| Heading/H3 | Cormorant Garamond Medium | 34 / 120% | 0 |
| Heading/H3 Itálico | Cormorant Garamond Italic | 34 / 120% | 0 |
| Eyebrow | Inter Medium, caixa alta | 13 / 140% | 12% |
| Body/L | Inter Regular | 20 / 160% | 0 |
| Body/M | Inter Regular | 18 / 160% | 0 |
| Body/S | Inter Regular | 16 / 150% | 0 |
| Label/Botão | Inter Medium | 16 / 120% | 1% |
| Caption | Inter Regular | 14 / 145% | 0,5% |

Mínimos no mobile: Display/XL 48px, Display/L 40px, H2 34px, H3 26px (aqui a Cormorant passa a usar Medium), Body/M 17px. O Eyebrow de 13px é exceção aceita por ser rótulo curto em caixa alta com contraste ≥ 8:1; nunca use 13px em frase.

---

## 11. SEO, conversão e conformidade

### SEO
- `title` e `description` únicos por página; Open Graph com imagem por página.
- JSON-LD: `LocalBusiness` (com tipo de negócio de saúde e beleza adequado) na Home e em `/sobre` com endereço, geo, horários, telefone; `FAQPage` onde houver FAQ; `BreadcrumbList` nas páginas de tratamento.
- `sitemap.xml` (excluindo páginas `pendente`) e `robots.txt`.
- URLs em português, minúsculas, sem acento.

### WhatsApp (`lib/whatsapp.ts`)
- `buildWhatsAppLink({ procedimento?, origem })` gera `https://wa.me/<numero>?text=<mensagem codificada>`.
- Mensagem padrão: "Olá! Vim pelo site e gostaria de agendar uma avaliação." Com procedimento: "...uma avaliação sobre {nome}."
- Todo clique dispara `analytics.track('whatsapp_click', { origem, procedimento })`. A ferramenta de analytics ainda não foi escolhida: implemente como no-op.

### Conformidade
- **Antes e depois:** só com `consentimento: true`. Antes da publicação real, a cliente precisa confirmar autorização escrita das pacientes e as regras atuais do conselho dela (CRBM) sobre publicidade com antes/depois.
- **Linguagem:** sem promessa de resultado garantido, sem "o melhor", sem "sem dor" absoluto. Sempre "resultados variam de pessoa para pessoa" perto de qualquer resultado.
- **Rodapé:** responsável técnica com número de registro.
- **LGPD:** página `/privacidade`; banner de consentimento só se entrar analytics com cookies.

---

## 12. Pendências de conteúdo (bloqueiam a versão final, não a Fase 0)

Marque cada lacuna no código como `TODO(conteudo)` ou `TODO(validar-cliente)` para que um `grep` liste tudo.

- [ ] Número do CRBM da Maria Guedes
- [ ] Endereço completo, CEP, coordenadas, horários
- [ ] Número de WhatsApp de agendamento
- [ ] Fotos profissionais da Maria e do espaço (as do Instagram não têm qualidade para hero)
- [ ] Formação e trajetória para `/sobre`
- [ ] Conteúdo clínico de cada tratamento (indicações, sessões, recuperação, duração)
- [ ] Validação do agrupamento por categoria (seção 4) e do nome do procedimento de pálpebras
- [ ] Antes/depois: originais **sem o texto "Antes/Depois" gravado na imagem**, mesmo enquadramento e mesma proporção nos dois lados, e indicação de qual tratamento é cada par. Os 5 pares do Figma têm texto gravado e alturas diferentes entre antes (≈1012px) e depois (≈953px), o que quebra um comparador por sobreposição.
- [ ] Depoimentos reais (de preferência do Google)
- [x] ~~Licença da fonte display~~: resolvido com Cormorant Garamond (OFL)
- [x] ~~Âmbar fora da marca e sem contraste~~: paleta refeita a partir do logo (seção 10)
- [ ] Apresentar à cliente a nova paleta e a nova fonte display como parte da proposta

---

## 13. Regras de trabalho para o Claude Code

1. **Fase 0 é estrutura.** Layout em wireframe: tipografia de fallback, cinzas, espaçamento básico, grid simples. Não tente "deixar bonito". Qualquer estilo além disso será jogado fora.
2. **Nunca invente conteúdo clínico, números, depoimentos, preços ou credenciais.** Placeholder visível e marcado.
3. **HTML semântico primeiro**, JS depois. Toda página tem que funcionar com JS desligado (exceto enhancements).
4. **Componentes de seção recebem dados por props** vindos das collections. Nada de texto hardcoded em componente, exceto microcopy de UI.
5. **Copy:** português do Brasil, tom sóbrio e acolhedor, frases curtas. Não use travessão longo (—) em textos; reescreva com vírgula, dois-pontos ou ponto.
6. **Performance:** orçamento inicial de JS ≤ 90 KB gzip na Home; LCP < 2,0s em 4G simulado; CLS < 0,05; imagens sempre com `width`/`height`.
7. **Commits pequenos**, um por passo do roteiro abaixo.

### Roteiro da Fase 0
1. Scaffold Astro 6 + TypeScript strict + ESLint/Prettier; `astro check` passando.
2. `tokens.css`, `reset.css`, `typography.css` com os placeholders da seção 10; fontes de fallback self-hosted.
3. Content Collections com schemas da seção 5; 12 arquivos de procedimentos com o que existe no Figma e `pendente: true`; 5 resultados com as imagens exportadas do Figma.
4. `site.ts`, `lib/whatsapp.ts`, `lib/seo.ts`, `lib/analytics.ts` (no-op).
5. `BaseLayout` com SEO, skip link, Header, Footer, FloatingWhatsApp, `ClientRouter`.
6. Todas as rotas da seção 3 com as seções da seção 6 em wireframe.
7. Componente `BeforeAfter` acessível (seção 9).
8. Infraestrutura de movimento (seção 8) com o único reveal de exemplo e a transição fade.
9. Sitemap, robots, JSON-LD, Open Graph.
10. Playwright + axe em todas as rotas; Lighthouse CI com os orçamentos da regra 6.
11. Rodar `grep -rn "TODO(" src` e gerar `PENDENCIAS.md` com a lista atualizada.

**Critério de pronto da Fase 0:** site navegável de ponta a ponta em wireframe, todas as rotas geradas a partir das collections, zero violações no axe, orçamentos de performance atendidos e o sistema de movimento pronto para receber o design.

import { site, faltando, linkGoogleMaps } from '@/data/site';

export interface SeoProps {
  title: string;
  description: string;
  /** Caminho da página, ex.: "/tratamentos". Gera canonical e og:url. */
  path: string;
  /** Imagem Open Graph (URL absoluta ou caminho relativo ao site). */
  image?: string | undefined;
  /** Páginas pendentes recebem noindex e saem do sitemap. */
  noindex?: boolean | undefined;
  /** Blocos JSON-LD da página. */
  jsonLd?: Record<string, unknown>[] | undefined;
}

export const SITE_NAME = site.marca;
export const DEFAULT_OG_IMAGE = '/og/padrao.png';

/**
 * Indexação liberada só com INDEXAR=true no build (deploy definitivo).
 * Sem isso, todas as páginas recebem noindex e o robots.txt bloqueia tudo:
 * é uma prévia de prospecção e a cliente ainda não contratou.
 */
export const INDEXAR = import.meta.env['INDEXAR'] === 'true' || process.env['INDEXAR'] === 'true';

/**
 * Nome do arquivo Open Graph de uma rota, gerado por scripts/og.mjs em public/og/.
 * "/" → "padrao", "/tratamentos/fios-de-pdo" → "tratamentos-fios-de-pdo".
 */
export function nomeOg(path: string): string {
  const limpo = path.replace(/^\/+|\/+$/g, '');
  return limpo === '' ? 'padrao' : limpo.replace(/\//g, '-');
}

export function absoluteUrl(path: string, base: URL | string | undefined): string {
  if (!base) return path;
  return new URL(path, base).toString();
}

// ---------- JSON-LD ----------

/**
 * LocalBusiness com tipo de saúde e beleza.
 * Campos ainda não informados (endereço, geo, telefone, horários) são omitidos,
 * nunca preenchidos com valor falso.
 */
export function jsonLdLocalBusiness(base: URL | string | undefined): Record<string, unknown> {
  const { endereco, responsavel } = site;
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    '@id': absoluteUrl('/#negocio', base),
    name: site.marca,
    url: absoluteUrl('/', base),
    image: absoluteUrl(DEFAULT_OG_IMAGE, base),
    hasMap: linkGoogleMaps(),
    sameAs: [site.instagram, site.linktree],
    founder: {
      '@type': 'Person',
      name: responsavel.nome,
      jobTitle: responsavel.titulo,
    },
    address: {
      '@type': 'PostalAddress',
      ...(faltando(endereco.logradouro) ? {} : { streetAddress: endereco.logradouro }),
      ...(faltando(endereco.cep) ? {} : { postalCode: endereco.cep }),
      addressLocality: endereco.cidade,
      addressRegion: endereco.uf,
      addressCountry: 'BR',
    },
  };
  if (endereco.geo.lat !== null && endereco.geo.lng !== null) {
    ld['geo'] = {
      '@type': 'GeoCoordinates',
      latitude: endereco.geo.lat,
      longitude: endereco.geo.lng,
    };
  }
  if (!faltando(site.whatsapp)) {
    ld['telephone'] = `+${site.whatsapp.replace(/\D/g, '')}`;
  }
  if (site.horarios.length > 0) {
    ld['openingHoursSpecification'] = site.horarios.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dias,
      opens: h.abre,
      closes: h.fecha,
    }));
  }
  return ld;
}

/** FAQPage só com perguntas respondidas (pendentes ficam de fora). */
export function jsonLdFaq(
  itens: { pergunta: string; resposta: string; pendente?: boolean }[],
): Record<string, unknown> | null {
  const respondidas = itens.filter((i) => !i.pendente && !/^\s*TODO\(/.test(i.resposta));
  if (respondidas.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: respondidas.map((i) => ({
      '@type': 'Question',
      name: i.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: i.resposta },
    })),
  };
}

export interface Migalha {
  nome: string;
  /** Sem href = página atual. */
  href?: string;
}

export function jsonLdBreadcrumb(
  migalhas: Migalha[],
  base: URL | string | undefined,
  pathAtual: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: migalhas.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.nome,
      item: absoluteUrl(m.href ?? pathAtual, base),
    })),
  };
}

/**
 * Categorias de tratamento, agrupadas pelo objetivo da paciente.
 * Fonte: Figma, Procedimentos v2 (7:122), com textos revisados em 2026-11-15
 * ("BioFace · Textos de tratamentos e categorias").
 * - resumo: frase curta ("Para X e Y."), no card da Home;
 * - descricao: texto longo, no topo da página da categoria.
 *
 * TODO(validar-cliente): o agrupamento é proposta. Validar com a Maria antes de publicar.
 * Por isso a categoria é dado (aqui e no frontmatter), nunca texto fixo em componente.
 */
export const CATEGORIAS = [
  {
    slug: 'pele',
    rotulo: 'Saúde e qualidade da pele',
    /** Uma palavra, para o card da Home. */
    curto: 'Pele',
    resumo: 'Para manchas, acne e textura.',
    descricao:
      'Cuidam da base: limpeza, controle de acne e manchas e renovação da textura. É por aqui que a pele ganha saúde e viço.',
  },
  {
    slug: 'rejuvenescimento',
    rotulo: 'Firmeza e rejuvenescimento',
    curto: 'Rejuvenescer',
    resumo: 'Para flacidez e sinais do tempo.',
    descricao:
      'Estimulam o colágeno e devolvem sustentação à pele. Os resultados aparecem aos poucos e de forma natural.',
  },
  {
    slug: 'contorno',
    rotulo: 'Expressão e contorno',
    curto: 'Expressões',
    resumo: 'Para rugas, volume e contorno.',
    descricao:
      'Suavizam linhas de expressão e repõem o volume perdido. A proposta é realçar seus traços, sem mudar quem você é.',
  },
] as const;

export type Categoria = (typeof CATEGORIAS)[number];
export type CategoriaSlug = Categoria['slug'];

export const CATEGORIA_SLUGS = CATEGORIAS.map((c) => c.slug) as [CategoriaSlug, ...CategoriaSlug[]];

export function getCategoria(slug: CategoriaSlug): Categoria {
  const categoria = CATEGORIAS.find((c) => c.slug === slug);
  if (!categoria) throw new Error(`Categoria desconhecida: ${slug}`);
  return categoria;
}

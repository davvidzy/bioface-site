/**
 * Categorias de tratamento, agrupadas pelo objetivo da paciente.
 * Fonte: Figma, Procedimentos v2 (7:122). Rótulo e frase de apoio vêm de lá.
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
    descricao: 'Para manchas, acne e textura.',
  },
  {
    slug: 'rejuvenescimento',
    rotulo: 'Firmeza e rejuvenescimento',
    curto: 'Rejuvenescer',
    descricao: 'Para flacidez e sinais do tempo.',
  },
  {
    slug: 'contorno',
    rotulo: 'Expressão e contorno',
    curto: 'Expressões',
    descricao: 'Para rugas, volume e contorno.',
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

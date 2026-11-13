import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { CATEGORIAS, type CategoriaSlug } from '@/data/categorias';

/**
 * Convenção de lacuna: texto que começa com o marcador de pendência (conteudo ou validar-cliente)
 * ainda depende da cliente e é renderizado como placeholder visível.
 */
const PREFIXO_PENDENTE = /^\s*TODO\((conteudo|validar-cliente)\)\s*:?\s*/;

export function isPendente(texto: string | undefined | null): boolean {
  return !texto || PREFIXO_PENDENTE.test(texto);
}

/** Remove o prefixo TODO para exibir só a descrição da lacuna no placeholder. */
export function descricaoPendente(texto: string): string {
  return texto.replace(PREFIXO_PENDENTE, '');
}

/** Corpo markdown sem comentários HTML: vazio significa "ainda não escrito". */
export function corpoVazio(body: string | undefined): boolean {
  return !body || body.replace(/<!--[\s\S]*?-->/g, '').trim() === '';
}

export const IS_DEV = import.meta.env.DEV;

// ---------- Procedimentos ----------

export type Procedimento = CollectionEntry<'procedimentos'>;

export async function getProcedimentos(): Promise<Procedimento[]> {
  const todos = await getCollection('procedimentos');
  const ordemCategoria = (c: CategoriaSlug) => CATEGORIAS.findIndex((cat) => cat.slug === c);
  return todos.sort(
    (a, b) =>
      ordemCategoria(a.data.categoria) - ordemCategoria(b.data.categoria) ||
      a.data.ordem - b.data.ordem,
  );
}

export async function getProcedimentosPorCategoria() {
  const todos = await getProcedimentos();
  return CATEGORIAS.map((categoria) => ({
    categoria,
    procedimentos: todos.filter((p) => p.data.categoria === categoria.slug),
  }));
}

// ---------- Resultados (antes e depois) ----------

export type Resultado = CollectionEntry<'resultados'>;

/**
 * REGRA DURA: um resultado sem consentimento não é renderizado em nenhum lugar.
 * Todo acesso a resultados para renderização passa por aqui.
 */
export async function resultadosPublicaveis(
  filtro?: (r: Resultado) => boolean,
): Promise<Resultado[]> {
  const todos = await getCollection('resultados', (r) => r.data.consentimento === true);
  return (filtro ? todos.filter(filtro) : todos).sort((a, b) => a.id.localeCompare(b.id));
}

export async function resultadosDoProcedimento(slug: string): Promise<Resultado[]> {
  return resultadosPublicaveis((r) => r.data.procedimento?.id === slug);
}

/** Procedimentos que têm pelo menos um resultado publicável (para o filtro de /resultados). */
export async function procedimentosComResultado(): Promise<Procedimento[]> {
  const resultados = await resultadosPublicaveis();
  const ids = new Set(resultados.map((r) => r.data.procedimento?.id).filter(Boolean));
  const procedimentos = await getProcedimentos();
  return procedimentos.filter((p) => ids.has(p.id));
}

export async function nomeDoProcedimento(r: Resultado): Promise<string | undefined> {
  if (!r.data.procedimento) return undefined;
  const p = await getEntry(r.data.procedimento);
  return p?.data.nome;
}

// ---------- Depoimentos ----------

/** Depoimentos pendentes só aparecem em desenvolvimento, como placeholder. */
export async function getDepoimentos() {
  const todos = await getCollection('depoimentos');
  return IS_DEV ? todos : todos.filter((d) => !d.data.pendente);
}

// ---------- FAQ geral ----------

export async function getFaqGeral() {
  const todos = await getCollection('faq');
  return todos.sort((a, b) => a.data.ordem - b.data.ordem);
}

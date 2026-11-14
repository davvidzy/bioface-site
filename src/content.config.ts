import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIA_SLUGS } from './data/categorias';

/*
 * Modelo de conteúdo (CLAUDE.md, seção 5).
 *
 * Convenção para lacunas: todo texto que ainda depende da cliente começa com
 * o marcador de conteúdo pendente e é renderizado como placeholder visível (ver src/lib/conteudo.ts).
 * Nunca preencher com texto clínico inventado.
 */

const procedimentos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/procedimentos' }),
  // O corpo do .md é o "comoFunciona" (markdown).
  schema: z.object({
    nome: z.string(),
    categoria: z.enum(CATEGORIA_SLUGS),
    ordem: z.number().int().positive(),
    destaque: z.boolean(),
    problema: z.string(),
    resumo: z.string(),
    paraQuem: z.array(z.string()),
    expectativa: z.object({
      sessoes: z.string().optional(),
      duracaoSessao: z.string().optional(),
      recuperacao: z.string().optional(),
      inicioResultado: z.string().optional(),
      duracaoResultado: z.string().optional(),
    }),
    faq: z.array(
      z.object({
        pergunta: z.string(),
        resposta: z.string(),
        /** true: resposta ainda precisa da confirmação da Maria (aparece na prévia, fica fora do JSON-LD). */
        pendente: z.boolean().default(false),
      }),
    ),
    relacionados: z.array(reference('procedimentos')),
    seo: z.object({ title: z.string(), description: z.string() }),
    pendente: z.boolean(),
  }),
});

const resultados = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/resultados' }),
  schema: ({ image }) =>
    z.object({
      /*
       * Diferença em relação ao brief: opcional.
       * O Figma não informa qual tratamento aparece em cada par, e atribuir um
       * resultado a um tratamento é informação clínica que não pode ser inventada.
       * Quando a cliente informar, preencher; a legenda do comparador passa a mostrar.
       */
      procedimento: reference('procedimentos').optional(),
      antes: image(),
      depois: image(),
      alt: z.object({ antes: z.string(), depois: z.string() }),
      legenda: z.string().optional(),
      intervalo: z.string().optional(),
      /** GATE: só renderiza se true. Ver src/lib/conteudo.ts → resultadosPublicaveis(). */
      consentimento: z.boolean(),
    }),
});

const depoimentos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/depoimentos' }),
  schema: z.object({
    autora: z.string(), // nome e inicial
    texto: z.string(),
    origem: z.enum(['google', 'instagram']),
    procedimento: reference('procedimentos').optional(),
    data: z.coerce.date().optional(),
    pendente: z.boolean(),
  }),
});

const faq = defineCollection({
  loader: file('./src/content/faq.json'),
  schema: z.object({
    pergunta: z.string(),
    resposta: z.string(),
    ordem: z.number().int().positive(),
    pendente: z.boolean(),
  }),
});

export const collections = { procedimentos, resultados, depoimentos, faq };

/**
 * Gera PENDENCIAS.md a partir dos marcadores TODO(...) em src/.
 * Equivale a `grep -rn "TODO(" src` (mais o astro.config.mjs), agrupado por tipo e por lacuna.
 *
 *   npm run pendencias
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const RAIZ = process.cwd();
const SRC = join(RAIZ, 'src');
const EXTENSOES = /\.(astro|ts|mjs|js|md|json|css)$/;
const MARCADOR = /TODO\(([a-z-]+)\)\s*:?\s*(.*?)(?=TODO\(|$)/g;

const TIPOS = {
  conteudo: 'Conteúdo que a cliente precisa enviar',
  'validar-cliente': 'Decisões para validar com a cliente',
};

function listar(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) return listar(p);
    return EXTENSOES.test(nome) ? [p] : [];
  });
}

/** Limpa o fim da linha: aspas, vírgulas e fechamentos de comentário/string. */
function limpar(texto) {
  return texto
    .replace(/\\"/g, '"')
    .replace(/\s*(-->|\*\/\}?|\*\/)\s*$/, '')
    .replace(/["',]+\s*$/, '')
    .replace(/[.;]+\s*$/, '')
    .trim();
}

const ocorrencias = [];
for (const arquivo of [...listar(SRC), join(RAIZ, 'astro.config.mjs')]) {
  const rel = relative(RAIZ, arquivo).split(sep).join('/');
  readFileSync(arquivo, 'utf8')
    .split(/\r?\n/)
    .forEach((linha, i) => {
      for (const m of linha.matchAll(MARCADOR)) {
        ocorrencias.push({
          tipo: m[1],
          texto: limpar(m[2]) || '(sem descrição)',
          arquivo: rel,
          linha: i + 1,
        });
      }
    });
}

let md = `# Pendências\n\n`;
md += `Gerado por \`npm run pendencias\` a partir dos marcadores \`TODO(...)\` em \`src/\`.\n`;
md += `Não edite à mão: resolva no código e gere de novo.\n\n`;
md += `Total: ${ocorrencias.length} marcadores.\n`;

for (const [tipo, titulo] of Object.entries(TIPOS)) {
  const doTipo = ocorrencias.filter((o) => o.tipo === tipo);
  if (doTipo.length === 0) continue;
  // Agrupa a mesma lacuna repetida em vários arquivos (ex.: os 12 tratamentos).
  const grupos = new Map();
  for (const o of doTipo) {
    if (!grupos.has(o.texto)) grupos.set(o.texto, []);
    grupos.get(o.texto).push(o);
  }
  md += `\n## ${titulo} (\`TODO(${tipo})\`)\n\n`;
  for (const [texto, lista] of grupos) {
    const locais = lista.map((o) => `[${o.arquivo}:${o.linha}](${o.arquivo}#L${o.linha})`);
    if (lista.length <= 2) {
      md += `- [ ] ${texto}. ${locais.join(', ')}\n`;
    } else {
      md += `- [ ] ${texto}. Em ${lista.length} arquivos:\n`;
      md += locais.map((l) => `  - ${l}\n`).join('');
    }
  }
}

const outros = ocorrencias.filter((o) => !(o.tipo in TIPOS));
if (outros.length > 0) {
  md += `\n## Outros marcadores\n\n`;
  md += outros
    .map((o) => `- [ ] \`TODO(${o.tipo})\` ${o.texto}. ${o.arquivo}:${o.linha}\n`)
    .join('');
}

writeFileSync(join(RAIZ, 'PENDENCIAS.md'), md);
console.log(`PENDENCIAS.md: ${ocorrencias.length} marcadores.`);

import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/**
 * Todas as rotas geradas no build, lidas de dist/.
 * Assim o teste cobre automaticamente toda página nova das collections.
 */
const DIST = join(process.cwd(), 'dist');

function listar(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) return listar(p);
    return nome.endsWith('.html') ? [p] : [];
  });
}

export const ROTAS: string[] = listar(DIST)
  .map((arquivo) => {
    const rel = relative(DIST, arquivo)
      .split(sep)
      .join('/')
      .replace(/\.html$/, '');
    return rel === 'index' ? '/' : `/${rel}`;
  })
  .sort();

/**
 * Registro da instância do Lenis, sem importar GSAP nem Lenis.
 * Permite que código carregado sempre (ex.: âncoras) use o scroll suave se ele já existir,
 * sem puxar o bundle de movimento para o carregamento inicial.
 */
import type Lenis from 'lenis';

let instancia: Lenis | null = null;

export function definirLenis(lenis: Lenis | null): void {
  instancia = lenis;
}

export function getLenis(): Lenis | null {
  return instancia;
}

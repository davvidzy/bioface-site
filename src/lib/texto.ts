/**
 * Títulos com ênfase: um trecho entre asteriscos vira itálico da Cormorant.
 *   "O que *natural* significa aqui" → O que <em>natural</em> significa aqui
 * Escapa o resto do texto, então é seguro usar com set:html.
 */
const escapar = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function enfase(texto: string): string {
  return escapar(texto).replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** Mesmo texto sem os asteriscos (para atributos, SEO, aria-label). */
export function semEnfase(texto: string): string {
  return texto.replace(/\*([^*]+)\*/g, '$1');
}

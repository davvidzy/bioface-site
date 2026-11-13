/**
 * Analytics: no-op até a ferramenta ser escolhida.
 * TODO(validar-cliente): escolher a ferramenta. Se usar cookies, entra banner de consentimento (LGPD).
 *
 * Para plugar: implementar o corpo de `track` e nada mais muda no site.
 */

export type EventoAnalytics = 'whatsapp_click';

export type PropsAnalytics = Record<string, string | undefined>;

export function track(evento: EventoAnalytics, props: PropsAnalytics = {}): void {
  if (import.meta.env.DEV) {
    console.debug('[analytics]', evento, props);
  }
}

let iniciado = false;

/**
 * Delegação única no document: qualquer elemento com data-track dispara o evento.
 * Sobrevive às trocas de página do ClientRouter porque o document persiste.
 */
export function initTracking(): void {
  if (iniciado) return;
  iniciado = true;
  document.addEventListener('click', (event) => {
    const alvo = (event.target as Element | null)?.closest<HTMLElement>('[data-track]');
    if (!alvo) return;
    const evento = alvo.dataset['track'] as EventoAnalytics;
    track(evento, {
      origem: alvo.dataset['origem'],
      procedimento: alvo.dataset['procedimento'],
    });
  });
}

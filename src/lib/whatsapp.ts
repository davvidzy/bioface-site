import { site, faltando } from '@/data/site';

/** De onde veio o clique. Usado em analytics para saber qual CTA converte. */
export type OrigemWhatsApp =
  'header' | 'menu' | 'hero' | 'tratamentos' | 'como-funciona' | 'cta-final' | 'rodape' | '404';

export interface WhatsAppLinkOptions {
  /** Nome do tratamento, exatamente como aparece no site. */
  procedimento?: string | undefined;
  origem: OrigemWhatsApp;
}

// Mensagem definida pela clínica (link oficial de agendamento).
const MENSAGEM_PADRAO = 'Olá, gostaria de agendar uma avaliação na Bioface';

export function mensagemWhatsApp(procedimento?: string): string {
  if (!procedimento) return MENSAGEM_PADRAO;
  return `${MENSAGEM_PADRAO} sobre ${procedimento}`;
}

/**
 * Gera https://wa.me/<numero>?text=<mensagem>.
 * Enquanto o número não for informado (TODO), gera https://wa.me/?text=<mensagem>,
 * que abre o WhatsApp com a mensagem pronta e pede para escolher o contato.
 * A origem não vai na URL: vai para o analytics via data-attributes (ver WhatsAppLink.astro).
 */
export function buildWhatsAppLink({ procedimento }: WhatsAppLinkOptions): string {
  const numero = faltando(site.whatsapp) ? '' : site.whatsapp.replace(/\D/g, '');
  // URLSearchParams codifica como o link da clínica (espaço vira "+").
  const query = new URLSearchParams({ text: mensagemWhatsApp(procedimento) });
  return `https://wa.me/${numero}?${query.toString()}`;
}

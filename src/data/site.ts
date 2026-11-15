/**
 * Configuração única do site (CLAUDE.md, seção 5).
 * Campos "TODO" bloqueiam a versão final, não a Fase 0. Ver PENDENCIAS.md.
 */

export interface Horario {
  /** Dias no formato schema.org, ex.: ["Monday", "Tuesday"]. */
  dias: string[];
  /** Rótulo legível, ex.: "Segunda a sexta". */
  rotulo: string;
  abre: string; // "09:00"
  fecha: string; // "18:00"
}

export interface Site {
  marca: string;
  responsavel: { nome: string; titulo: string; registro: string };
  anosAtuacao: number;
  endereco: {
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    geo: { lat: number | null; lng: number | null };
  };
  whatsapp: string;
  horarios: Horario[];
  /** Dias sem atendimento, em texto (ex.: "Sábado e domingo"). */
  fechado: string;
  /** URL de incorporação do mapa (Google Maps > Compartilhar > Incorporar). */
  mapaEmbed: string;
  /** Ficha da clínica no Google Maps (Perfil da Empresa), pelo CID do embed. */
  googleMaps: string;
  instagram: string;
  linktree: string;
}

export const site: Site = {
  marca: 'BioFace Estética Avançada',
  responsavel: {
    nome: 'Maria Guedes',
    titulo: 'Biomédica esteta',
    registro: 'CRBM TODO', // TODO(conteudo): número do CRBM da Maria Guedes
  },
  anosAtuacao: 18,
  endereco: {
    logradouro: 'St. de Mansões Dom Bosco, Conj. 12, CL ST, Bloco E, sala 105',
    bairro: 'Lago Sul',
    cidade: 'Brasília',
    uf: 'DF',
    cep: '71680-120',
    geo: { lat: -15.8576144, lng: -47.8315178 }, // do embed do Google Maps
  },
  whatsapp: '556182521783', // agendamento da clínica, só dígitos, com DDI 55
  horarios: [
    {
      dias: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      rotulo: 'Segunda a sexta',
      abre: '09:00',
      fecha: '18:00',
    },
  ],
  fechado: 'Sábado e domingo',
  googleMaps: 'https://maps.google.com/?cid=2675938867319635107',
  mapaEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3837.980648107704!2d-47.8315178!3d-15.8576144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a23553af0ee35%3A0x2522d838db3f7ca3!2sBioface%20Est%C3%A9tica%20Avan%C3%A7ada!5e0!3m2!1spt-BR!2sbr!4v1794713457210!5m2!1spt-BR!2sbr',
  instagram: 'https://www.instagram.com/bioface_/',
  linktree: 'https://linktr.ee/bioface_',
};

/** Verdadeiro quando o valor ainda é placeholder (vazio ou contém "TODO"). */
export function faltando(valor: string | null | undefined): boolean {
  return !valor || valor.includes('TODO');
}

export function enderecoCompleto(): string | null {
  const { logradouro, bairro, cidade, uf, cep } = site.endereco;
  if (faltando(logradouro)) return null;
  const cepTexto = faltando(cep) ? '' : `, CEP ${cep}`;
  return `${logradouro}, ${bairro}, ${cidade}/${uf}${cepTexto}`;
}

/** Link da ficha da clínica no Google Maps; sem ela, uma busca pelo endereço. */
export function linkGoogleMaps(): string {
  if (!faltando(site.googleMaps)) return site.googleMaps;
  // Busca pelo nome + endereço: abre a ficha da clínica no Maps (com fotos e rotas).
  const endereco = enderecoCompleto();
  const consulta = endereco
    ? `${site.marca}, ${endereco}`
    : `${site.marca}, ${site.endereco.bairro}, ${site.endereco.cidade}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}

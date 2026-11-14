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
    logradouro: 'TODO', // TODO(conteudo): endereço completo
    bairro: 'Lago Sul',
    cidade: 'Brasília',
    uf: 'DF',
    cep: 'TODO', // TODO(conteudo): CEP
    geo: { lat: null, lng: null }, // TODO(conteudo): coordenadas
  },
  whatsapp: '556182521783', // agendamento da clínica, só dígitos, com DDI 55
  horarios: [], // TODO(conteudo): horários de atendimento
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

/** Link de busca no Google Maps: funciona mesmo sem coordenadas. */
export function linkGoogleMaps(): string {
  const { lat, lng } = site.endereco.geo;
  const consulta =
    lat !== null && lng !== null
      ? `${lat},${lng}`
      : (enderecoCompleto() ?? `${site.marca}, ${site.endereco.bairro}, ${site.endereco.cidade}`);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}

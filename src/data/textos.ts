/**
 * Copy do site. Componentes de seção recebem estes textos por props.
 * Tom: português do Brasil, sóbrio e acolhedor, frases curtas, sem travessão longo.
 * Sem promessa de resultado garantido, sem "o melhor", sem "sem dor" absoluto.
 *
 * Landing page única: tudo acontece na Home; a navegação usa âncoras das seções.
 * Texto que só a Maria pode fornecer leva o marcador de conteúdo pendente e vira placeholder visível.
 */
import { site } from './site';

export const AVISO_RESULTADOS = 'Resultados variam de pessoa para pessoa.';

/** Âncoras da Home, na ordem da página. Usadas no header. */
export const navegacao = [
  { ancora: 'tratamentos', rotulo: 'Tratamentos' },
  { ancora: 'resultados', rotulo: 'Resultados' },
  { ancora: 'sobre', rotulo: 'Sobre' },
  { ancora: 'duvidas', rotulo: 'Dúvidas' },
] as const;

export const home = {
  seo: {
    title: 'BioFace Estética Avançada | Maria Guedes, biomédica esteta no Lago Sul',
    description: `Estética facial com resultados naturais. ${site.responsavel.nome}, biomédica esteta há ${site.anosAtuacao} anos no Lago Sul, Brasília. Agende sua avaliação pelo WhatsApp.`,
  },
  hero: {
    // TODO(validar-cliente): frase-manifesto do h1 (o medo central é ficar artificial).
    titulo: 'Natural é quando o resultado *parece seu*.',
    descricao: `Realçar, nunca transformar. Há ${site.anosAtuacao} anos cuidando de rostos no ${site.endereco.bairro}.`,
    // Imagem fictícia da Maria para a prévia (confirmado pela equipe em 2026-11-13).
    // TODO(validar-cliente): jaleco com "Dra." e "Medicina Estética" não cabe para biomédica.
    alt: `${site.responsavel.nome}, ${site.responsavel.titulo.toLowerCase()}, de jaleco, sorrindo.`,
  },
  filosofia: {
    titulo: 'O que *natural* significa aqui',
    texto:
      'TODO(conteudo): em 2 ou 3 frases, como a Maria define um resultado natural no método dela.',
    // TODO(conteudo): 3 fotos verticais (3:4) para a filosofia: detalhe de procedimento, mãos, espaço.
    imagens: 3,
  },
  tratamentos: {
    titulo: 'Tratamentos que *fazemos*',
  },
  resultados: {
    titulo: 'Antes e *depois*',
  },
  comoFunciona: {
    titulo: 'Do primeiro contato ao *seu plano*',
    // TODO(validar-cliente): confirmar o fluxo de atendimento.
    passos: [
      {
        titulo: 'Contato',
        texto: 'Você manda uma mensagem pelo WhatsApp e combinamos o dia da sua avaliação.',
      },
      {
        titulo: 'Avaliação presencial',
        texto: 'A Maria conversa com você, avalia sua pele e entende o que você deseja.',
      },
      {
        titulo: 'Plano personalizado',
        texto: 'Você recebe um plano individual, com os tratamentos indicados para o seu caso.',
      },
    ],
  },
  sobre: {
    titulo: `${site.responsavel.nome.split(' ')[0]} *${site.responsavel.nome.split(' ').slice(1).join(' ')}*`,
    subtitulo: `${site.responsavel.titulo}, ${site.anosAtuacao} anos de atuação`,
    texto: 'TODO(conteudo): trajetória resumida da Maria em 2 ou 3 frases.',
  },
  depoimentos: {
    titulo: 'O que dizem as *pacientes*',
  },
  espaco: {
    titulo: 'Um ambiente pensado *para você*',
    fotos: 3,
  },
  faq: {
    titulo: 'Perguntas *frequentes*',
  },
  ctaFinal: {
    titulo: 'Agende sua *avaliação*',
    texto: 'A avaliação é o primeiro passo para um plano feito para você.',
  },
};

export const localizacao = {
  endereco: 'Endereço',
  horarios: 'Horários',
  mapa: 'Ver no Google Maps',
  carregarMapa: 'Mostrar mapa aqui',
  tituloMapa: `Mapa com a localização da ${site.marca}`,
};

export const privacidade = {
  seo: {
    title: 'Política de privacidade | BioFace',
    description: `Como a ${site.marca} trata dados pessoais, de acordo com a LGPD.`,
  },
  titulo: 'Política de privacidade',
};

export const naoEncontrada = {
  seo: {
    title: 'Página não encontrada | BioFace',
    description: 'A página que você procurou não existe ou mudou de endereço.',
  },
  titulo: 'Página não encontrada',
  texto: 'O endereço pode ter mudado. Estes caminhos podem ajudar:',
};

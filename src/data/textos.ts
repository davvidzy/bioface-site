/**
 * Copy do site. Componentes de seção recebem estes textos por props.
 * Tom: português do Brasil, sóbrio e acolhedor, frases curtas, sem travessão longo.
 * Sem promessa de resultado garantido, sem "o melhor", sem "sem dor" absoluto.
 *
 * Landing page única: tudo acontece na Home; a navegação usa âncoras das seções.
 * Texto que só a Maria pode fornecer leva o marcador de conteúdo pendente e vira placeholder visível.
 */
import { site } from './site';

/** Âncoras da Home, na ordem da página. Usadas no header. */
export const navegacao = [
  { ancora: 'tratamentos', rotulo: 'Tratamentos' },
  { ancora: 'resultados', rotulo: 'Resultados' },
  { ancora: 'sobre', rotulo: 'Sobre' },
  { ancora: 'duvidas', rotulo: 'Dúvidas' },
] as const;

/*
 * Títulos sem itálico (inclusive hero e CTA final); o itálico fica só na citação da Maria.
 * Os demais títulos são retos: quando tudo é destaque, nada é.
 *
 * Textos marcados como rascunho: escritos para a prévia a partir do brief, sem conteúdo
 * clínico nem números novos. Ficam marcados só no código (TODO(validar-cliente)), sem
 * selo visível na página.
 */
export const home = {
  seo: {
    title: 'BioFace Estética Avançada | Maria Guedes, biomédica esteta no Lago Sul',
    description: `Estética facial com resultados naturais. ${site.responsavel.nome}, biomédica esteta há ${site.anosAtuacao} anos no Lago Sul, Brasília. Agende sua avaliação pelo WhatsApp.`,
  },
  hero: {
    // TODO(validar-cliente): frase-manifesto do h1 (o medo central é ficar artificial).
    titulo: 'Natural é quando o resultado parece seu.',
    descricao: `Realçar, nunca transformar. Há ${site.anosAtuacao} anos cuidando de rostos no ${site.endereco.bairro}.`,
    // Imagem fictícia da Maria para a prévia (confirmado pela equipe em 2026-11-13).
    // TODO(validar-cliente): jaleco com "Dra." e "Medicina Estética" não cabe para biomédica.
    alt: `${site.responsavel.nome}, ${site.responsavel.titulo.toLowerCase()}, de jaleco, sorrindo.`,
  },
  /** Faixa de fatos logo abaixo do hero. Só fatos já confirmados no brief. */
  /** Uma linha por fato, com tamanhos parecidos (14 a 18 caracteres). */
  credenciais: [
    `${site.anosAtuacao} anos de atuação`,
    'Biomédica esteta',
    // O total de tratamentos entra na Home, contado da collection.
    `${site.endereco.bairro}, ${site.endereco.cidade}`,
    // TODO(conteudo): quando houver, entrar com o número do CRBM e a nota do Google.
  ],
  tratamentos: {
    titulo: 'Tratamentos',
  },
  resultados: {
    titulo: 'Antes e depois',
  },
  metodo: {
    titulo: 'Como trabalhamos',
    /** Legenda sob o título, abaixo da linha do tempo. */
    etapas: '1–3 etapas',
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
    titulo: site.responsavel.nome,
    subtitulo: `${site.responsavel.titulo}, ${site.anosAtuacao} anos de atuação`,
    // TODO(validar-cliente): rascunho para aprovação; trocar pela frase dela.
    citacao: 'O melhor elogio é quando ninguém percebe o que foi feito, só que você está bem.',
    alt: `${site.responsavel.nome}, de jaleco branco e braços cruzados, em fundo claro`,
  },
  depoimentos: {
    titulo: 'O que dizem sobre a Maria',
  },
  espaco: {
    titulo: 'O espaço',
    fotos: 3,
  },
  faq: {
    titulo: 'Perguntas frequentes',
  },
  ctaFinal: {
    titulo: 'Agende sua avaliação',
    texto: 'Na avaliação, a Maria entende o seu rosto e monta um plano só seu.',
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

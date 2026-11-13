/**
 * Copy das páginas. Componentes de seção recebem estes textos por props.
 * Tom: português do Brasil, sóbrio e acolhedor, frases curtas, sem travessão longo.
 * Sem promessa de resultado garantido, sem "o melhor", sem "sem dor" absoluto.
 *
 * Texto que só a Maria pode fornecer fica como "TODO(conteudo): ..." e vira placeholder visível.
 */
import { site } from './site';

export const AVISO_RESULTADOS = 'Resultados variam de pessoa para pessoa.';

export const home = {
  seo: {
    title: 'BioFace Estética Avançada | Maria Guedes, biomédica esteta no Lago Sul',
    description: `Estética facial com resultados naturais. ${site.responsavel.nome}, biomédica esteta há ${site.anosAtuacao} anos no Lago Sul, Brasília. Agende sua avaliação pelo WhatsApp.`,
  },
  hero: {
    eyebrow: `${site.endereco.bairro}, ${site.endereco.cidade}`,
    // TODO(validar-cliente): promessa central do h1.
    titulo: 'Estética facial com resultados naturais',
    apoio: `${site.responsavel.nome}, ${site.responsavel.titulo.toLowerCase()} há ${site.anosAtuacao} anos.`,
  },
  credenciais: {
    titulo: 'Credenciais',
  },
  filosofia: {
    eyebrow: 'Filosofia',
    titulo: 'O que natural significa aqui',
    texto:
      'TODO(conteudo): em 2 ou 3 frases, como a Maria define um resultado natural no método dela.',
  },
  tratamentos: {
    eyebrow: 'Tratamentos',
    titulo: 'Escolha pelo que você quer resolver',
    intro: 'Os tratamentos estão agrupados pelo seu objetivo. A indicação final sai da avaliação.',
  },
  resultados: {
    eyebrow: 'Resultados',
    titulo: 'Antes e depois',
    link: 'Ver todos os resultados',
  },
  comoFunciona: {
    eyebrow: 'Como funciona',
    titulo: 'Do primeiro contato ao seu plano',
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
    eyebrow: 'Quem cuida de você',
    titulo: site.responsavel.nome,
    texto: 'TODO(conteudo): trajetória resumida da Maria em 2 ou 3 frases.',
    link: 'Conhecer a Maria',
  },
  depoimentos: {
    eyebrow: 'Depoimentos',
    titulo: 'O que dizem as pacientes',
  },
  espaco: {
    eyebrow: 'O espaço',
    titulo: 'Um ambiente pensado para você',
    fotos: 3,
  },
  faq: {
    eyebrow: 'Dúvidas',
    titulo: 'Perguntas frequentes',
  },
  ctaFinal: {
    titulo: 'Agende sua avaliação',
    texto: 'A avaliação é o primeiro passo para um plano feito para você.',
  },
};

export const tratamentosIndice = {
  seo: {
    title: 'Tratamentos faciais no Lago Sul, Brasília | BioFace',
    description:
      'Tratamentos faciais para pele, firmeza e contorno, agrupados pelo seu objetivo. Agende uma avaliação individual com Maria Guedes.',
  },
  titulo: 'Tratamentos faciais',
  intro: 'Cada plano é definido na avaliação individual, a partir do que você deseja resolver.',
  navegacao: 'Categorias de tratamento',
  cta: {
    titulo: 'Não sabe qual é o seu caso?',
    texto: 'A avaliação define.',
  },
};

export const tratamento = {
  breadcrumbRaiz: 'Tratamentos',
  paraQuem: 'Para quem é',
  comoFunciona: 'Como funciona',
  expectativa: 'O que esperar',
  expectativaRotulos: {
    sessoes: 'Sessões',
    duracaoSessao: 'Duração da sessão',
    recuperacao: 'Recuperação',
    inicioResultado: 'Início do resultado',
    duracaoResultado: 'Duração do resultado',
  },
  resultados: 'Resultados deste tratamento',
  faq: 'Perguntas frequentes',
  relacionados: 'Tratamentos relacionados',
  cta: {
    titulo: 'Quer saber se este tratamento é para você?',
    texto: 'A indicação é feita na avaliação individual.',
  },
};

export const resultados = {
  seo: {
    title: 'Resultados: antes e depois | BioFace',
    description: `Antes e depois de tratamentos faciais com ${site.responsavel.nome}, no Lago Sul, Brasília. ${AVISO_RESULTADOS}`,
  },
  titulo: 'Resultados',
  intro: 'Fotos de pacientes que autorizaram a publicação.',
  filtro: 'Filtrar por tratamento',
  filtroTodos: 'Todos',
  cta: {
    titulo: 'Quer entender o que é possível no seu caso?',
    texto: 'Cada rosto é único. A avaliação mostra o caminho.',
  },
};

export const sobre = {
  seo: {
    title: `${site.responsavel.nome}, biomédica esteta no Lago Sul | BioFace`,
    description: `Conheça ${site.responsavel.nome}, biomédica esteta há ${site.anosAtuacao} anos, e o espaço da BioFace no Lago Sul, Brasília.`,
  },
  titulo: site.responsavel.nome,
  subtitulo: `${site.responsavel.titulo}, ${site.anosAtuacao} anos de atuação`,
  formacao: {
    titulo: 'Formação e trajetória',
    texto: 'TODO(conteudo): formação, especializações e trajetória da Maria.',
  },
  filosofia: {
    titulo: 'Filosofia de trabalho',
    texto: 'TODO(conteudo): versão longa da filosofia, o que natural significa no método da Maria.',
  },
  espaco: {
    titulo: 'O espaço',
    fotos: 4,
  },
  localizacao: {
    titulo: 'Como chegar',
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

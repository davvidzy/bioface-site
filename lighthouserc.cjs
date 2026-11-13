/**
 * Lighthouse CI com os orçamentos da regra 6 do CLAUDE.md.
 * Perfil mobile padrão do Lighthouse (4G simulado, CPU 4x mais lenta).
 *
 *   npm run build && npm run lhci
 *
 * Relatórios ficam em .lighthouseci/ (nada é enviado para servidor público).
 */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/index.html', '/tratamentos/tratamento-melasma.html', '/resultados.html'],
      numberOfRuns: 3,
    },
    assert: {
      // Mediana dos 3 runs (o padrão do LHCI é o melhor run, otimista demais).
      aggregationMethod: 'median-run',
      assertions: {
        // LCP < 2,0 s em 4G simulado
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
        // CLS < 0,05
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        // JS inicial ≤ 90 KB (tamanho transferido, comprimido)
        'resource-summary:script:size': ['error', { maxNumericValue: 90 * 1024 }],
        // Imagens sempre com width/height
        'unsized-images': 'error',
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:performance': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};

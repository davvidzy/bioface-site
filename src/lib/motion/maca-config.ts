/**
 * Cena 3D da maca na seção de tratamentos.
 * Uma pose por categoria: a maca gira de leve e desliza para o lado oposto ao texto
 * (categorias ímpares à esquerda → maca à direita, e vice-versa).
 * Unidades: radianos (ry) e unidades de cena (x); a maca é normalizada para `tamanho`.
 */
export interface PoseMaca {
  /** Rotação no eixo vertical, em radianos. */
  ry: number;
  /** Deslocamento horizontal na cena (positivo = direita). */
  x: number;
}

/** Estado animado pelo scroll: a pose atual mais a elevação durante as trocas. */
export interface EstadoMaca extends PoseMaca {
  y: number;
}

export const MACA = {
  modelo: '/models/maca.glb',
  /** Maior dimensão da maca, normalizada, em unidades de cena. */
  tamanho: 1.9,
  fov: 26,
  camera: [0, 1.4, 6.4] as const,
  alvo: [0, -0.1, 0] as const,
  /** "Respiro" contínuo: amplitude e velocidade. */
  respiro: { rotacao: 0.05, altura: 0.035, velocidade: 0.6 },
  /** Quanto a maca sobe no meio de cada troca de categoria. */
  elevacao: 0.12,
  /** Reação ao mouse (só em ponteiro fino): inclinação máxima e suavização por quadro. */
  mouse: { giro: 0.14, inclinacao: 0.06, suavizacao: 0.06 },
  poses: [
    // Sempre do mesmo lado da maca, girando até o perfil: ~0,6 rad por troca.
    { ry: -0.2, x: 0.5 },
    { ry: -0.85, x: -0.5 },
    { ry: -1.45, x: 0.45 },
  ] satisfies PoseMaca[],
};

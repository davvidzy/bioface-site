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

export const MACA = {
  modelo: '/models/maca.glb',
  /** Maior dimensão da maca, normalizada, em unidades de cena. */
  tamanho: 2.3,
  fov: 26,
  camera: [0, 1.4, 6.4] as const,
  alvo: [0, -0.1, 0] as const,
  /** "Respiro" contínuo, bem sutil: amplitude e velocidade. */
  respiro: { rotacao: 0.015, altura: 0.012, velocidade: 0.7 },
  poses: [
    // Sempre do mesmo lado da maca, girando aos poucos até o perfil (movimento sutil).
    { ry: -0.6, x: 0.55 },
    { ry: -1.0, x: -0.6 },
    { ry: -1.35, x: 0.45 },
  ] satisfies PoseMaca[],
};

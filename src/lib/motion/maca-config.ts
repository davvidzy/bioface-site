/**
 * Cena 3D da maca na seção de tratamentos.
 * Uma pose por categoria: a maca gira de leve e desliza para o lado oposto ao texto
 * (categorias ímpares à esquerda → maca à direita, e vice-versa).
 * Unidades: radianos (ry) e unidades de cena (x); a maca é normalizada para `tamanho`.
 */
export interface PoseMaca {
  /** Rotação no próprio eixo (vertical), em radianos. */
  ry: number;
  /** Deslocamento horizontal na cena (positivo = direita). */
  x: number;
  /** Profundidade: mais negativo = mais longe (menor). Cresce a cada categoria. */
  z: number;
}

/** Estado animado pelo scroll. */
export type EstadoMaca = PoseMaca;

export const MACA = {
  modelo: '/models/maca.glb',
  /** Maior dimensão da maca, normalizada, em unidades de cena. */
  tamanho: 1.9,
  fov: 26,
  camera: [0, 0.75, 6.4] as const,
  alvo: [0, -0.05, 0] as const,
  /** "Respiro" contínuo: amplitude e velocidade. */
  respiro: { rotacao: 0.04, altura: 0.008, velocidade: 0.6 },
  /**
   * Movimento contínuo, sempre para a frente: a maca vem lá de trás (entrada, enquanto a
   * seção chega), girando no próprio eixo, e a cada categoria se aproxima mais (cresce).
   * Nunca recua. Quase nada de movimento vertical.
   */
  entrada: { z: -12, voltas: 1 },
  /** Voltas inteiras no próprio eixo a cada troca (o ângulo final é o da pose). */
  voltasPorTroca: 1,
  /** Reação ao mouse (só em ponteiro fino): inclinação máxima e suavização por quadro. */
  mouse: { giro: 0.14, inclinacao: 0.06, suavizacao: 0.06 },
  poses: [
    // Mesmo lado da maca, girando até o perfil; z sempre aumenta (vem chegando).
    { ry: -0.2, x: 0.5, z: -1.8 },
    { ry: -0.85, x: -0.55, z: -0.9 },
    { ry: -1.45, x: 0.5, z: 0 },
  ] satisfies PoseMaca[],
};

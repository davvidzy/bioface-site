/**
 * Otimiza um modelo 3D (GLB) para a web e grava em public/models/.
 *
 *   npm run otimizar-3d -- "C:/caminho/modelo.glb" [nome-saida]
 *
 * Original da Tripo3D: 27 MB, 965 mil triângulos (o peso é quase todo geometria).
 * Resultado: ~770 KB, 96 mil triângulos, visualmente igual no enquadramento da seção.
 * - simplify 10%: reduz triângulos (meshoptimizer), com erro máximo de 0,05% do tamanho
 * - meshopt: comprime a geometria (o site precisa do MeshoptDecoder no GLTFLoader)
 * - webp 2048: textura menor sem perder resolução
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const [entrada, nome = 'maca'] = process.argv.slice(2);
if (!entrada) {
  console.error('Uso: npm run otimizar-3d -- <arquivo.glb> [nome-saida]');
  process.exit(1);
}

const saida = join('public', 'models', `${nome}.glb`);
const args = [
  'optimize',
  entrada,
  saida,
  '--compress',
  'meshopt',
  '--texture-compress',
  'webp',
  '--texture-size',
  '2048',
  '--simplify-ratio',
  '0.1',
  '--simplify-error',
  '0.0005',
];
const r = spawnSync('gltf-transform', args, { stdio: 'inherit', shell: true });
process.exit(r.status ?? 1);

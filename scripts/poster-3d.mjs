/**
 * Gera a imagem estática (poster) da maca a partir de public/models/maca.glb.
 * Usada no celular, com reduced motion e sem JS, no lugar do 3D.
 *
 *   npm run poster-3d
 *
 * Renderiza com o mesmo three.js do site, fundo transparente, em src/assets/3d/maca.png.
 */
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from '@playwright/test';

const RAIZ = process.cwd();
const THREE = join(RAIZ, 'node_modules', 'three');
const SAIDA = join(RAIZ, 'src', 'assets', '3d', 'maca.png');
const LARGURA = 1600;
const ALTURA = 1200;

const pagina = `<!doctype html><html><head><style>html,body{margin:0;background:transparent}</style>
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
</head><body><script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
r.setSize(${LARGURA}, ${ALTURA}); r.setClearColor(0x000000, 0);
r.toneMapping = THREE.NeutralToneMapping;
document.body.appendChild(r.domElement);
const cena = new THREE.Scene();
cena.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
const cam = new THREE.PerspectiveCamera(26, ${LARGURA} / ${ALTURA}, 0.1, 100);
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const { scene: modelo } = await loader.loadAsync('/maca.glb');
const caixa = new THREE.Box3().setFromObject(modelo);
const tam = caixa.getSize(new THREE.Vector3());
modelo.position.sub(caixa.getCenter(new THREE.Vector3()));
const pivo = new THREE.Group(); pivo.add(modelo);
pivo.scale.setScalar(2.6 / Math.max(tam.x, tam.y, tam.z));
pivo.rotation.y = -0.6;
cena.add(pivo);
cam.position.set(0, 1.4, 6.4); cam.lookAt(0, -0.1, 0);
r.render(cena, cam); window.__pronto = true;
</script></body></html>`;

const tipos = { '.js': 'text/javascript', '.glb': 'model/gltf-binary' };
const servidor = http
  .createServer(async (req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
    try {
      if (url === '/') {
        res.writeHead(200, { 'content-type': 'text/html' });
        return res.end(pagina);
      }
      const arquivo = url.startsWith('/three/')
        ? join(THREE, url.slice('/three/'.length))
        : join(RAIZ, 'public', 'models', url.slice(1));
      res.writeHead(200, { 'content-type': tipos[extname(arquivo)] ?? 'application/octet-stream' });
      res.end(await readFile(arquivo));
    } catch {
      res.writeHead(404);
      res.end();
    }
  })
  .listen(4411);

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA } });
await page.goto('http://localhost:4411/');
await page.waitForFunction(() => window.__pronto, null, { timeout: 120_000 });
await mkdir(join(RAIZ, 'src', 'assets', '3d'), { recursive: true });
await page.locator('canvas').screenshot({ path: SAIDA, omitBackground: true });
await browser.close();
servidor.close();
console.log(`Poster gerado: ${SAIDA}`);

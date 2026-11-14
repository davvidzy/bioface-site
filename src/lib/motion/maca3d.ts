/**
 * Cena three.js da maca. Carregada sob demanda (import dinâmico) só no desktop,
 * quando a seção de tratamentos se aproxima da tela.
 *
 * Leveza:
 * - renderiza só enquanto o palco está visível (IntersectionObserver)
 * - pixel ratio limitado a 1,5; sem sombras; luz por ambiente (RoomEnvironment)
 * - reage ao mouse (inclinação suave), só com ponteiro fino
 * - a pose vem de fora (`estado`), animada pelo timeline do ScrollTrigger
 */
import {
  Box3,
  Group,
  Mesh,
  NeutralToneMapping,
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  type Material,
  type Texture,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap } from './index';
import { MACA, type EstadoMaca } from './maca-config';

export interface Maca3D {
  destruir(): void;
}

export async function criarMaca3D(palco: HTMLElement, estado: EstadoMaca): Promise<Maca3D> {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NeutralToneMapping;

  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.classList.add('trat__canvas');

  const cena = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const ambiente = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environment = ambiente;

  const camera = new PerspectiveCamera(MACA.fov, 1, 0.1, 100);
  camera.position.set(...MACA.camera);
  camera.lookAt(...MACA.alvo);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const { scene: modelo } = await loader.loadAsync(MACA.modelo);

  // Centraliza e normaliza o tamanho; o pivô é o que gira e desliza.
  const caixa = new Box3().setFromObject(modelo);
  const tamanho = caixa.getSize(new Vector3());
  modelo.position.sub(caixa.getCenter(new Vector3()));
  const pivo = new Group();
  pivo.add(modelo);
  pivo.scale.setScalar(MACA.tamanho / Math.max(tamanho.x, tamanho.y, tamanho.z));
  cena.add(pivo);

  palco.appendChild(canvas);

  const ajustar = () => {
    const w = palco.clientWidth;
    const h = palco.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  ajustar();
  const ro = new ResizeObserver(ajustar);
  ro.observe(palco);

  let visivel = true;
  const io = new IntersectionObserver(([e]) => {
    visivel = Boolean(e?.isIntersecting);
  });
  io.observe(palco);

  // Reação ao mouse: só com ponteiro fino (mouse/trackpad), sem efeito em toque.
  const alvoMouse = { x: 0, y: 0 };
  const mouse = { x: 0, y: 0 };
  const ponteiroFino = window.matchMedia('(pointer: fine)').matches;
  const aoMover = (e: PointerEvent) => {
    alvoMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    alvoMouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (ponteiroFino) window.addEventListener('pointermove', aoMover, { passive: true });

  const { rotacao, altura, velocidade } = MACA.respiro;
  const { giro, inclinacao, suavizacao } = MACA.mouse;
  const quadro = (tempo: number) => {
    if (!visivel) return;
    mouse.x += (alvoMouse.x - mouse.x) * suavizacao;
    mouse.y += (alvoMouse.y - mouse.y) * suavizacao;
    pivo.rotation.y = estado.ry + Math.sin(tempo * velocidade) * rotacao + mouse.x * giro;
    pivo.rotation.x = mouse.y * inclinacao;
    pivo.position.x = estado.x;
    pivo.position.y = Math.sin(tempo * velocidade * 1.3) * altura;
    pivo.position.z = estado.z;
    renderer.render(cena, camera);
  };
  gsap.ticker.add(quadro);

  return {
    destruir() {
      gsap.ticker.remove(quadro);
      window.removeEventListener('pointermove', aoMover);
      ro.disconnect();
      io.disconnect();
      modelo.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          const materiais = Array.isArray(o.material) ? o.material : [o.material];
          materiais.forEach((m: Material & { map?: Texture | null }) => {
            m.map?.dispose();
            m.dispose();
          });
        }
      });
      ambiente.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}

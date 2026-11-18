import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

/* ============================================================
   CONFIG
   ============================================================ */
const MODEL_URL = './assets/action6-white-blended-normal.meshopt.glb';
const ACCENT = 0x70e6ff;
const ACCENT_WARM = 0xffb36b;
const MODEL_SCALE = 1.62;
const FLOOR_Y = -1.25;
const DEFAULT_CAMERA = new THREE.Vector3(4.15, 2.52, 6.78);
const DEFAULT_TARGET = new THREE.Vector3(0, 0.015, 0);
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const NARROW_LAYOUT = window.matchMedia('(max-width: 1180px)');

const THEME_SCENE = {
  dark: {
    fog: 0x04080c,
    fogDensity: 0.034,
    exposure: 1.12,
    hemiSky: 0xbcecff,
    hemiGround: 0x080c10,
    hemiIntensity: 1.22,
    keyColor: 0xfff8ef,
    keyIntensity: 3.3,
    fillColor: 0x8ecaff,
    fillIntensity: 1.25,
    rimColor: 0x3cdcf5,
    rimIntensity: 34,
    warmColor: 0xff9b5f,
    warmIntensity: 15,
    environmentIntensity: 1.0,
    shellColor: 0xffffff,
    shellEmissive: 0x2ab7d4,
    shellEnvIntensity: 1.0,
    accent: 0x70e6ff,
    glow: 0x70e6ff,
    cage: 0x70e6ff,
    gridColorA: 0x2b899e,
    gridColorB: 0x12323d,
    gridOpacity: 0.28,
    ringColor: 0x70e6ff,
    ringOpacity: 0.3,
    tickColor: 0x7ddff0,
    tickOpacity: 0.26,
    dustColor: 0x9ddff0,
    dustOpacity: 0.5,
    dustSize: 0.018,
    isLight: false,
  },
  light: {
    fog: 0xe6eff5,
    fogDensity: 0.018,
    exposure: 1.05,
    hemiSky: 0xffffff,
    hemiGround: 0x6f8793,
    hemiIntensity: 1.58,
    keyColor: 0xffffff,
    keyIntensity: 3.55,
    fillColor: 0xd7eaf4,
    fillIntensity: 1.55,
    rimColor: 0x178ca8,
    rimIntensity: 28,
    warmColor: 0xffb174,
    warmIntensity: 9,
    environmentIntensity: 0.96,
    shellColor: 0xedf2f4,
    shellEmissive: 0x0a6d84,
    shellEnvIntensity: 0.9,
    accent: 0x007f9b,
    glow: 0x00839f,
    cage: 0x007f9b,
    gridColorA: 0x2f8fa8,
    gridColorB: 0x9db9c4,
    gridOpacity: 0.34,
    ringColor: 0x087a94,
    ringOpacity: 0.34,
    tickColor: 0x2c8ca4,
    tickOpacity: 0.3,
    dustColor: 0x2a7d92,
    dustOpacity: 0.26,
    dustSize: 0.016,
    isLight: true,
  },
};

const THEMES = {
  deep: {
    id: 'deep',
    label: 'DEEP',
    name: '深水',
    mode: 'dark',
    icon: 'wave',
    pano: './assets/capture/pano-deep.webp',
    field: './assets/capture/field-deep.webp',
    panoOpacity: 0.55,
    fieldOpacity: 0.22,
    accent: '#70e6ff',
    accentHex: 0x70e6ff,
    meta: '#05080d',
  },
  daylight: {
    id: 'daylight',
    label: 'DAYLIGHT',
    name: '晴水',
    mode: 'light',
    icon: 'sun',
    pano: './assets/capture/pano-daylight.webp',
    field: './assets/capture/field-daylight.webp',
    panoOpacity: 0.38,
    fieldOpacity: 0.14,
    accent: '#007f9b',
    accentHex: 0x007f9b,
    meta: '#eaf1f6',
  },
  dive: {
    id: 'dive',
    label: 'DIVE',
    name: '深蓝',
    mode: 'dark',
    icon: 'drop',
    pano: './assets/capture/pano-dive.webp',
    field: './assets/capture/field-dive.webp',
    panoOpacity: 0.48,
    fieldOpacity: 0.22,
    accent: '#5ce8ff',
    accentHex: 0x5ce8ff,
    meta: '#041017',
  },
  trail: {
    id: 'trail',
    label: 'TRAIL',
    name: '山径',
    mode: 'light',
    icon: 'mountain',
    pano: './assets/capture/pano-trail.webp',
    field: './assets/capture/field-trail.webp',
    panoOpacity: 0.32,
    fieldOpacity: 0.18,
    accent: '#3c6b4a',
    accentHex: 0x3c6b4a,
    meta: '#eef5ed',
  },
  moto: {
    id: 'moto',
    label: 'MOTO',
    name: '公路',
    mode: 'dark',
    icon: 'road',
    pano: './assets/capture/pano-moto.webp',
    field: './assets/capture/field-moto.webp',
    panoOpacity: 0.5,
    fieldOpacity: 0.22,
    accent: '#ffb36b',
    accentHex: 0xffb36b,
    meta: '#060b12',
  },
  snow: {
    id: 'snow',
    label: 'SNOW',
    name: '雪线',
    mode: 'light',
    icon: 'snow',
    pano: './assets/capture/pano-snow.webp',
    field: './assets/capture/field-snow.webp',
    panoOpacity: 0.36,
    fieldOpacity: 0.16,
    accent: '#2f7f9d',
    accentHex: 0x2f7f9d,
    meta: '#eef7fb',
  },
};

function getThemeScene(themeId) {
  const theme = THEMES[themeId] || THEMES.deep;
  const base = THEME_SCENE[theme.mode];
  return {
    ...base,
    accent: theme.accentHex,
    glow: theme.accentHex,
    cage: theme.accentHex,
    shellEmissive: theme.accentHex,
    ringColor: theme.accentHex,
    tickColor: theme.accentHex,
  };
}

/* ============================================================
   PART DATA
   ============================================================ */
const PART_DATA = [
  {
    id: 'lens',
    no: '01',
    name: '镜头模组',
    en: 'VARIABLE APERTURE OPTICS',
    category: '光学系统',
    short: 'f/2.0–4.0 · 155°',
    description: '可变光圈超广角镜头总成，前组镜片与快拆保护镜环构成整机最外侧的光学入口。',
    specs: [
      ['光圈范围', 'f/2.0 – f/4.0'],
      ['对角线视场', '155°'],
      ['特殊模式', '星芒 / f/2.8 固定'],
      ['前组结构', '快拆保护镜环'],
    ],
    tags: ['可变光圈', '超广角', '保护镜环'],
    specsShort: ['可变光圈 f/2.0–f/4.0', '155° 超广视场'],
    pivot: [0.47, 0.22, 0.35],
    anchor: [0.49, 0.30, 0.54],
    direction: [1.0, 0.75, 0.35],
    distance: 0.92,
    labelSide: 'right',
    shell: true,
    categoryTone: 'OPTICS',
  },
  {
    id: 'front',
    no: '02',
    name: '前置屏与前壳',
    en: 'FRONT DISPLAY / SHELL',
    category: '人机界面',
    short: '1.46″ OLED · 331 ppi',
    description: '前面板集成 1.46 英寸方形 OLED 自拍屏与 ACTION 标识，为正面取景提供实时预览。',
    specs: [
      ['屏幕尺寸', '1.46″ OLED'],
      ['分辨率', '342 × 342'],
      ['像素密度', '331 ppi'],
      ['峰值亮度', '800 cd/m²'],
    ],
    tags: ['自拍取景', 'OLED', '全贴合'],
    specsShort: ['1.46″ 方形 OLED', '800 nit'],
    pivot: [-0.12, 0.0, 0.30],
    anchor: [-0.30, 0.18, 0.36],
    direction: [-0.6, -0.35, 0.65],
    distance: 0.55,
    labelSide: 'left',
    shell: true,
    categoryTone: 'DISPLAY',
  },
  {
    id: 'top',
    no: '03',
    name: '顶部控制仓',
    en: 'TOP CONTROL DECK',
    category: '交互 / 收音',
    short: '快门键 · 三麦克风',
    description: '顶部集中快门键、录制状态指示与三麦克风开孔，构成主要握持交互面。',
    specs: [
      ['主要按键', '快门 / 自定义'],
      ['麦克风', '3 阵列'],
      ['指示灯', '录制状态'],
      ['防护结构', '密封上盖'],
    ],
    tags: ['快门键', '三麦克风', 'IP68'],
    specsShort: ['快门 · 三麦克风', 'IP68 密封'],
    pivot: [0.0, 0.55, 0.0],
    anchor: [-0.16, 0.68, 0.03],
    direction: [0.0, 1.0, 0.0],
    distance: 0.33,
    labelSide: 'right',
    shell: true,
    categoryTone: 'CONTROL',
  },
  {
    id: 'left',
    no: '04',
    name: '左侧电池仓',
    en: 'BATTERY BAY / SIDE COVER',
    category: '能源 / 结构',
    short: '电池仓盖 · 滑动锁',
    description: '侧盖整合电池仓与机械锁止结构，是整机能源模块的维护入口。',
    specs: [
      ['电池', '1950 mAh'],
      ['额定电压', '3.87 V'],
      ['锁止方式', '滑动式快拆'],
      ['防护等级', 'IP68 密封'],
    ],
    tags: ['可换电池', '密封舱', '快拆锁'],
    specsShort: ['1950 mAh 电池仓', '滑动式锁止'],
    pivot: [-0.65, 0.0, 0.0],
    anchor: [-0.94, 0.02, -0.02],
    direction: [-1.0, 0.0, 0.02],
    distance: 0.34,
    labelSide: 'left',
    shell: true,
    categoryTone: 'POWER',
  },
  {
    id: 'right',
    no: '05',
    name: '接口与散热侧盖',
    en: 'I/O & THERMAL RAIL',
    category: '连接 / 散热',
    short: 'USB-C 3.1 · Wi-Fi 6',
    description: '右侧结构承担 USB-C 数据与供电、存储扩展以及机身内部热量传导。',
    specs: [
      ['接口', 'USB-C 3.1'],
      ['无线', 'Wi-Fi 6'],
      ['蓝牙', 'Bluetooth 5.1'],
      ['存储', '50 GB + microSD'],
    ],
    tags: ['USB-C', 'Wi-Fi 6', '散热'],
    specsShort: ['USB-C 3.1 · Wi-Fi 6', '50 GB 内置存储'],
    pivot: [0.65, 0.0, 0.0],
    anchor: [0.94, 0.0, -0.06],
    direction: [1.0, 0.0, 0.0],
    distance: 0.34,
    labelSide: 'right',
    shell: true,
    categoryTone: 'I/O',
  },
  {
    id: 'bottom',
    no: '06',
    name: '磁吸快拆底座',
    en: 'MAGNETIC QUICK-RELEASE',
    category: '安装 / 结构',
    short: '磁吸定位 · 双向卡扣',
    description: '底部磁吸快拆结构适配 DJI 生态配件，通过磁吸预定位与卡扣实现快速锁止。',
    specs: [
      ['安装方式', '磁吸快拆'],
      ['定位结构', '双向卡扣'],
      ['兼容生态', 'Osmo Action 配件'],
      ['底部防护', '密封底盖'],
    ],
    tags: ['磁吸快拆', '生态兼容', '密封'],
    specsShort: ['磁吸预定位', '双向卡扣'],
    pivot: [0.0, -0.55, 0.0],
    anchor: [0.05, -0.69, 0.02],
    direction: [0.0, -1.0, 0.0],
    distance: 0.33,
    labelSide: 'left',
    shell: true,
    categoryTone: 'MOUNT',
  },
  {
    id: 'back',
    no: '07',
    name: '主屏与后壳',
    en: 'REAR DISPLAY / CHASSIS',
    category: '显示 / 结构',
    short: '2.5″ OLED · 800 nit',
    description: '后壳集成 2.5 英寸触控主屏，并作为主板与电池的结构保护背板。',
    specs: [
      ['屏幕尺寸', '2.5″ OLED'],
      ['峰值亮度', '800 cd/m²'],
      ['触控', '全功能触摸'],
      ['结构角色', '密封背板'],
    ],
    tags: ['主取景屏', '触控', '结构背板'],
    specsShort: ['2.5″ OLED 触控屏', '800 nit'],
    pivot: [0.0, 0.0, -0.32],
    anchor: [0.08, 0.15, -0.56],
    direction: [0.0, -0.02, -1.0],
    distance: 0.42,
    labelSide: 'right',
    shell: true,
    categoryTone: 'DISPLAY',
  },
  {
    id: 'sensor',
    no: '08',
    name: '影像传感器',
    en: '1/1.1″ CMOS SENSOR',
    category: '影像核心',
    short: '38 MP · 13.5 挡',
    description: '1/1.1 英寸方形 CMOS 提供 38MP 静态影像与 13.5 挡动态范围，是整机成像核心。',
    specs: [
      ['传感器', '1/1.1″ 方形 CMOS'],
      ['有效像素', '38 MP'],
      ['动态范围', '13.5 挡'],
      ['视频能力', '8K/30 · 4K/120'],
    ],
    tags: ['1/1.1″', '38MP', '13.5 挡'],
    specsShort: ['1/1.1″ CMOS', '38 MP · 13.5 挡'],
    pivot: [0.47, 0.23, 0.15],
    anchor: [0.48, 0.25, 0.205],
    direction: [0.0, 0.12, 1.0],
    distance: 0.6,
    labelSide: 'right',
    generated: true,
    cage: [0.64, 0.64, 0.22],
    categoryTone: 'IMAGING',
  },
  {
    id: 'board',
    no: '09',
    name: '主板与无线模组',
    en: 'MAINBOARD & WIRELESS',
    category: '计算 / 连接',
    short: 'Wi-Fi 6 · 50 GB',
    description: '主板集成影像处理、无线连接与内置存储，连接镜头、屏幕与电池模块。',
    specs: [
      ['无线连接', 'Wi-Fi 6 / BT 5.1'],
      ['内置存储', '50 GB'],
      ['视频处理', '8K/30 · 4K/120'],
      ['数据接口', 'USB 3.1'],
    ],
    tags: ['影像 SoC', 'Wi-Fi 6', '50GB'],
    specsShort: ['影像 SoC · Wi-Fi 6', '50 GB 内置存储'],
    pivot: [-0.05, 0.0, 0.05],
    anchor: [-0.06, 0.10, 0.12],
    direction: [-0.7, -0.4, 0.75],
    distance: 0.86,
    labelSide: 'left',
    generated: true,
    cage: [1.26, 0.92, 0.17],
    categoryTone: 'COMPUTE',
  },
  {
    id: 'battery',
    no: '10',
    name: '1950 mAh 电池',
    en: 'EXTREME BATTERY PLUS',
    category: '能源',
    short: '3.87 V · 约 4 h',
    description: '1950 mAh 耐寒电池支持约 4 小时 1080p 续航与快速充电，可于 -20°C 环境工作。',
    specs: [
      ['容量', '1950 mAh'],
      ['电压', '3.87 V'],
      ['续航', '约 240 min'],
      ['工作温度', '最低 -20°C'],
    ],
    tags: ['1950 mAh', '快充', '耐寒'],
    specsShort: ['1950 mAh · 3.87 V', '约 4 小时续航'],
    pivot: [-0.26, -0.03, -0.07],
    anchor: [-0.26, -0.10, -0.18],
    direction: [0.6, -0.5, 0.7],
    distance: 0.8,
    labelSide: 'left',
    generated: true,
    cage: [0.9, 1.1, 0.28],
    categoryTone: 'POWER',
  },
];

const PART_NORMALS = {
  lens: [0, 0, 1],
  front: [0, 0, 1],
  back: [0, 0, -1],
  top: [0, 1, 0],
  bottom: [0, -1, 0],
  left: [-1, 0, 0],
  right: [1, 0, 0],
};

const INTERNAL_IDS = new Set(PART_DATA.filter((d) => d.generated).map((d) => d.id));
const PART_BY_ID = new Map(PART_DATA.map((d) => [d.id, d]));

/* ============================================================
   DOM
   ============================================================ */
const stage = document.getElementById('stage');
const canvas = document.getElementById('scene');
const labelsEl = document.getElementById('labels');
const leadersEl = document.getElementById('leaders');
const selectedCard = document.getElementById('selectedCard');
const partList = document.getElementById('partList');
const progressBar = document.getElementById('progressBar');
const explodeAllBtn = document.getElementById('explodeAll');
const resetPartsBtn = document.getElementById('resetParts');
const autoRotateBtn = document.getElementById('autoRotate');
const resetCameraBtn = document.getElementById('resetCamera');
const helpBtn = document.getElementById('helpBtn');
const helpLayer = document.getElementById('helpLayer');
const helpClose = document.getElementById('helpClose');
const loaderEl = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');
const loaderPct = document.getElementById('loaderPct');
const errorLayer = document.getElementById('errorLayer');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const themePaddle = document.getElementById('themePaddle');
const themePaddleOptions = document.getElementById('themePaddleOptions');
const themeMeta = document.querySelector('meta[name="theme-color"]');
let currentTheme = THEMES[document.documentElement.dataset.theme]
  ? document.documentElement.dataset.theme
  : 'deep';

/* ============================================================
   SCENE
   ============================================================ */
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x04080c, 0.034);

const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
camera.position.copy(DEFAULT_CAMERA);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

/* Full-screen 360° world layer, rendered behind the info panel. */
const worldCanvas = document.getElementById('worldCanvas');
const worldRenderer = new THREE.WebGLRenderer({
  canvas: worldCanvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
worldRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
worldRenderer.setClearColor(0x000000, 0);
worldRenderer.outputColorSpace = THREE.SRGBColorSpace;
worldRenderer.toneMapping = THREE.NoToneMapping;
const worldScene = new THREE.Scene();
const worldCamera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);

const controls = new OrbitControls(camera, canvas);
controls.target.copy(DEFAULT_TARGET);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 4.2;
controls.maxDistance = 16;
controls.minPolarAngle = 0.22;
controls.maxPolarAngle = Math.PI * 0.72;
controls.rotateSpeed = 0.62;
controls.zoomSpeed = 0.82;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.55;
controls.update();

/* environment & light */
const pmrem = new THREE.PMREMGenerator(renderer);
const roomEnvironment = new RoomEnvironment();
scene.environment = pmrem.fromScene(roomEnvironment, 0.035).texture;
roomEnvironment.dispose?.();
pmrem.dispose();

const hemiLight = new THREE.HemisphereLight(0xbcecff, 0x080c10, 1.22);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xfff8ef, 3.3);
keyLight.position.set(5.5, 7.5, 6.5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8ecaff, 1.25);
fillLight.position.set(-6.5, 1.5, 3.5);
scene.add(fillLight);

const cyanRim = new THREE.PointLight(0x3cdcf5, 34, 18, 2);
cyanRim.position.set(-4.2, 3.2, -4.0);
scene.add(cyanRim);

const warmRim = new THREE.PointLight(0xff9b5f, 15, 12, 2);
warmRim.position.set(4.0, -2.0, -2.5);
scene.add(warmRim);

/* model root */
const modelRoot = new THREE.Group();
modelRoot.scale.setScalar(MODEL_SCALE);
scene.add(modelRoot);

/* ============================================================
   CAPTURE FIELD — spatial background plates
   ============================================================ */
const captureWorldGroup = new THREE.Group();
captureWorldGroup.name = 'capture_world_360';
const captureFieldGroup = new THREE.Group();
captureFieldGroup.name = 'capture_field';
worldScene.add(captureWorldGroup);
scene.add(captureFieldGroup);

const capturePanoGeometry = new THREE.SphereGeometry(30, 96, 48);
const captureFieldGeometry = new THREE.PlaneGeometry(8.4, 8.4);

function makeCaptureWorldMaterial() {
  return new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    side: THREE.BackSide,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
    fog: false,
  });
}

const panoMaterials = new Map();
const fieldMaterials = new Map();
const fieldMeshes = [];
const captureLoaded = {};

function makeCaptureFieldMaterial(mode) {
  return new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    fog: false,
    blending: mode === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending,
  });
}

Object.values(THEMES).forEach((theme, index) => {
  const panoMaterial = makeCaptureWorldMaterial();
  const panoMesh = new THREE.Mesh(capturePanoGeometry, panoMaterial);
  panoMesh.renderOrder = -30 + index * 0.01;
  panoMesh.frustumCulled = false;
  captureWorldGroup.add(panoMesh);

  const fieldMaterial = makeCaptureFieldMaterial(theme.mode);
  const fieldMesh = new THREE.Mesh(captureFieldGeometry, fieldMaterial);
  fieldMesh.renderOrder = -10 + index * 0.01;
  fieldMesh.frustumCulled = false;
  captureFieldGroup.add(fieldMesh);
  fieldMeshes.push(fieldMesh);

  panoMaterial.userData = { kind: 'pano', themeId: theme.id, url: theme.pano };
  fieldMaterial.userData = { kind: 'field', themeId: theme.id, url: theme.field };
  panoMaterials.set(theme.id, panoMaterial);
  fieldMaterials.set(theme.id, fieldMaterial);
  captureLoaded[theme.id] = { pano: false, field: false };
});

const captureTextureLoader = new THREE.TextureLoader();

function loadCaptureTexture(themeId, type, url, material) {
  captureTextureLoader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      material.map = texture;
      material.needsUpdate = true;
      if (captureLoaded[themeId]) captureLoaded[themeId][type] = true;
    },
    undefined,
    (error) => {
      console.warn(`[Action6] Capture layer failed to load: ${url}`, error);
    },
  );
}

Object.values(THEMES).forEach((theme) => {
  loadCaptureTexture(theme.id, 'pano', theme.pano, panoMaterials.get(theme.id));
  loadCaptureTexture(theme.id, 'field', theme.field, fieldMaterials.get(theme.id));
});


/* ============================================================
   AMBIENT SCENE DRESSING
   ============================================================ */
const ambientGroup = new THREE.Group();
scene.add(ambientGroup);

function makeParticles() {
  const count = 320;
  const positions = new Float32Array(count * 3);
  const rand = seededRandom(1216);
  for (let i = 0; i < count; i += 1) {
    const radius = 2.2 + rand() * 6.5;
    const theta = rand() * Math.PI * 2;
    const y = (rand() - 0.5) * 7;
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * radius;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const cfg = getThemeScene(currentTheme);
  const mat = new THREE.PointsMaterial({
    color: cfg.dustColor,
    size: cfg.dustSize,
    transparent: true,
    opacity: cfg.dustOpacity,
    depthWrite: false,
    blending: cfg.isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.name = 'dust';
  return points;
}

const dust = makeParticles();
ambientGroup.add(dust);

function makePlatform(theme) {
  const cfg = getThemeScene(theme);
  const floor = new THREE.Group();
  floor.name = `platform_${theme}`;
  floor.position.y = FLOOR_Y;

  const glowTexture = makeCanvasTexture(512, 512, (ctx, w, h) => {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, w * 0.48);
    if (cfg.isLight) {
      gradient.addColorStop(0, 'rgba(18, 53, 68, 0.18)');
      gradient.addColorStop(0.23, 'rgba(33, 84, 101, 0.1)');
      gradient.addColorStop(0.5, 'rgba(70, 140, 158, 0.045)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(97, 214, 242, 0.28)');
      gradient.addColorStop(0.22, 'rgba(79, 187, 218, 0.13)');
      gradient.addColorStop(0.58, 'rgba(38, 97, 117, 0.045)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  });
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  const disc = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 6.4),
    new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      opacity: cfg.isLight ? 0.9 : 0.9,
      depthWrite: false,
      blending: cfg.isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  disc.rotation.x = -Math.PI / 2;
  floor.add(disc);

  if (cfg.isLight) {
    const shadowTexture = makeCanvasTexture(256, 256, (ctx, w, h) => {
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w * 0.47);
      gradient.addColorStop(0, 'rgba(18, 41, 52, 0.34)');
      gradient.addColorStop(0.35, 'rgba(22, 48, 60, 0.17)');
      gradient.addColorStop(0.72, 'rgba(29, 62, 75, 0.035)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    });
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 2.6),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = 0.002;
    floor.add(contact);
  }

  const grid = new THREE.GridHelper(12, 30, cfg.gridColorA, cfg.gridColorB);
  grid.material.transparent = true;
  grid.material.opacity = cfg.gridOpacity;
  grid.material.depthWrite = false;
  grid.material.blending = cfg.isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
  floor.add(grid);

  const ringMat = new THREE.MeshBasicMaterial({
    color: cfg.ringColor,
    transparent: true,
    opacity: cfg.ringOpacity,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: cfg.isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
    toneMapped: false,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.95, 1.962, 180), ringMat);
  ring.rotation.x = -Math.PI / 2;
  floor.add(ring);

  const innerRing = new THREE.Mesh(new THREE.RingGeometry(1.18, 1.185, 140), ringMat.clone());
  innerRing.material.opacity = cfg.ringOpacity * 0.48;
  innerRing.rotation.x = -Math.PI / 2;
  floor.add(innerRing);

  const tickGeo = new THREE.BoxGeometry(0.012, 0.002, 0.08);
  const tickMat = new THREE.MeshBasicMaterial({
    color: cfg.tickColor,
    transparent: true,
    opacity: cfg.tickOpacity,
    depthWrite: false,
    blending: cfg.isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
    toneMapped: false,
  });
  const tickCount = 64;
  const ticks = new THREE.InstancedMesh(tickGeo, tickMat, tickCount);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < tickCount; i += 1) {
    const angle = (i / tickCount) * Math.PI * 2;
    const radius = 2.42;
    const isMajor = i % 8 === 0;
    matrix.makeRotationY(-angle);
    matrix.setPosition(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
    const scale = new THREE.Vector3(1, 1, isMajor ? 1.9 : 0.72);
    matrix.scale(scale);
    ticks.setMatrixAt(i, matrix);
  }
  ticks.instanceMatrix.needsUpdate = true;
  floor.add(ticks);

  return floor;
}

let platformGroup = null;

function disposeGroup(root) {
  root.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (material.map) material.map.dispose();
        material.dispose();
      });
    }
  });
}

function rebuildPlatform(theme) {
  if (platformGroup) {
    ambientGroup.remove(platformGroup);
    disposeGroup(platformGroup);
  }
  platformGroup = makePlatform(theme);
  ambientGroup.add(platformGroup);
}

/* ============================================================
   THEME
   ============================================================ */
function applySceneTheme(theme) {
  const cfg = getThemeScene(theme);
  const isLight = cfg.isLight;

  scene.fog.color.setHex(cfg.fog);
  scene.fog.density = cfg.fogDensity;
  scene.environmentIntensity = cfg.environmentIntensity;
  renderer.toneMappingExposure = cfg.exposure;

  hemiLight.color.setHex(cfg.hemiSky);
  hemiLight.groundColor.setHex(cfg.hemiGround);
  hemiLight.intensity = cfg.hemiIntensity;

  keyLight.color.setHex(cfg.keyColor);
  keyLight.intensity = cfg.keyIntensity;
  fillLight.color.setHex(cfg.fillColor);
  fillLight.intensity = cfg.fillIntensity;
  cyanRim.color.setHex(cfg.rimColor);
  cyanRim.intensity = cfg.rimIntensity;
  warmRim.color.setHex(cfg.warmColor);
  warmRim.intensity = cfg.warmIntensity;

  dust.material.color.setHex(cfg.dustColor);
  dust.material.opacity = cfg.dustOpacity;
  dust.material.size = cfg.dustSize;
  dust.material.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
  dust.material.needsUpdate = true;

  INTERNAL_MATS.cyanGlow.color.setHex(cfg.accent);
  INTERNAL_MATS.amberGlow.color.setHex(isLight ? 0xc86b2e : 0xffb36b);

  rebuildPlatform(theme);
}

function applyModelTheme(theme) {
  if (!runtime.size) return;
  const cfg = getThemeScene(theme);
  const isLight = cfg.isLight;

  runtime.forEach((part) => {
    if (part.isShell) {
      part.material.color.setHex(cfg.shellColor);
      part.material.emissive.setHex(cfg.shellEmissive);
      part.material.envMapIntensity = cfg.shellEnvIntensity;
      part.material.needsUpdate = true;

      part.glow.material.color.setHex(cfg.glow);
      part.glow.material.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      part.glow.material.needsUpdate = true;
    } else if (part.cage) {
      part.cage.material.color.setHex(cfg.cage);
    }
  });
}

const THEME_ICON_SVG = {
  wave: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9.5c2.5-2 4.5 2 7 0s4.5 2 7 0 2.8-.1 4 .9M3 15c2.5-2 4.5 2 7 0s4.5 2 7 0 2.8-.1 4 .9M3 20.2c2.5-2 4.5 2 7 0s4.5 2 7 0 2.8-.1 4 .9"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.6"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.4 5.4l1.4 1.4M17.2 17.2l1.4 1.4M18.6 5.4l-1.4 1.4M6.8 17.2l-1.4 1.4"/></svg>',
  drop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8c3.2 4.3 6.2 7.3 6.2 10.4a6.2 6.2 0 0 1-12.4 0C5.8 10.1 8.8 7.1 12 2.8Z"/><path d="M8 14.2c1.3 1 2.4 1 3.8 0s2.5-1 3.8 0"/></svg>',
  mountain: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2.8 19.2 5.3-8 3.2 4.4 3.4-5.8 6.5 9.4H2.8Z"/><path d="m8.1 11.2 1.8 1.2 1.4-1.2"/></svg>',
  road: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.4 21 10 3M15.6 21 14 3M12 5.2v3M12 11.6v3M12 18v2.1"/></svg>',
  snow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8v18.4M4 7.4l16 9.2M20 7.4 4 16.6M8.8 4.2 12 7l3.2-2.8M8.8 19.8 12 17l3.2 2.8M3.4 10.4 4 14.5l-1.1 2M20.6 10.4 20 14.5l1.1 2"/></svg>',
};

function themeIcon(themeId) {
  return THEME_ICON_SVG[THEMES[themeId]?.icon] || THEME_ICON_SVG.wave;
}

function buildThemePaddle() {
  themePaddleOptions.innerHTML = Object.values(THEMES)
    .map(
      (theme) => `
        <button
          class="theme-paddle-option"
          type="button"
          role="radio"
          data-theme="${theme.id}"
          aria-checked="false"
          aria-label="${theme.name} · ${theme.label}"
          title="${theme.label} · ${theme.name}"
        >
          ${themeIcon(theme.id)}
        </button>
      `,
    )
    .join('');

  themePaddleOptions.addEventListener('click', (event) => {
    const option = event.target.closest('.theme-paddle-option');
    if (!option) return;
    switchTheme(option.dataset.theme);
  });

  themePaddleOptions.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const options = [...themePaddleOptions.querySelectorAll('.theme-paddle-option')];
    const current = options.indexOf(document.activeElement);
    if (current < 0) return;
    const dir = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const next = (current + dir + options.length) % options.length;
    options[next].focus();
    switchTheme(options[next].dataset.theme);
  });
}

function updateThemePaddleUI(themeId) {
  const ids = Object.keys(THEMES);
  const index = Math.max(0, ids.indexOf(themeId));
  themePaddle.style.setProperty('--paddle-index', index);
  themePaddleOptions.querySelectorAll('.theme-paddle-option').forEach((option) => {
    const selected = option.dataset.theme === themeId;
    option.classList.toggle('is-selected', selected);
    option.setAttribute('aria-checked', String(selected));
  });
}

function applyTheme(theme, options = {}) {
  const next = THEMES[theme] ? theme : 'deep';
  const themeData = THEMES[next];
  const { persist = true } = options;
  currentTheme = next;

  document.documentElement.dataset.theme = next;
  document.documentElement.dataset.mode = themeData.mode;
  document.documentElement.style.colorScheme = themeData.mode;
  if (themeMeta) themeMeta.setAttribute('content', themeData.meta);

  updateThemePaddleUI(next);
  applySceneTheme(next);
  applyModelTheme(next);

  if (persist) {
    try {
      window.localStorage.setItem('oa6-theme', next);
    } catch (error) {
      /* Local storage may be unavailable in private mode. */
    }
  }
}

let themeTransitionTimer = 0;

function switchTheme(themeId) {
  if (!THEMES[themeId] || themeId === currentTheme) return;
  document.documentElement.classList.add('theme-switching');
  window.clearTimeout(themeTransitionTimer);
  applyTheme(themeId);
  themeTransitionTimer = window.setTimeout(() => {
    document.documentElement.classList.remove('theme-switching');
  }, 450);
}


/* ============================================================
   UTILITIES
   ============================================================ */
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function makeCanvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

function roundedMesh(w, h, d, radius, material, segments = 3) {
  return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, segments, radius), material);
}

function addFastener(group, x, y, z, material, radius = 0.022) {
  const hole = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.004, 8, 24), material);
  hole.position.set(x, y, z);
  group.add(hole);
  return hole;
}

/* ============================================================
   MATERIALS FOR CODE-GENERATED INTERNALS
   ============================================================ */
const INTERNAL_MATS = {
  pcb: new THREE.MeshStandardMaterial({
    color: 0x123c33,
    roughness: 0.62,
    metalness: 0.18,
  }),
  pcbBack: new THREE.MeshStandardMaterial({
    color: 0x10271f,
    roughness: 0.8,
    metalness: 0.08,
  }),
  dark: new THREE.MeshStandardMaterial({
    color: 0x0b1117,
    roughness: 0.4,
    metalness: 0.55,
  }),
  darkSoft: new THREE.MeshStandardMaterial({
    color: 0x151c22,
    roughness: 0.62,
    metalness: 0.3,
  }),
  metal: new THREE.MeshStandardMaterial({
    color: 0x9aacb5,
    roughness: 0.28,
    metalness: 0.96,
  }),
  metalDark: new THREE.MeshStandardMaterial({
    color: 0x39464e,
    roughness: 0.38,
    metalness: 0.85,
  }),
  gold: new THREE.MeshStandardMaterial({
    color: 0xc9965a,
    roughness: 0.3,
    metalness: 0.94,
  }),
  copper: new THREE.MeshStandardMaterial({
    color: 0xb56b3e,
    roughness: 0.33,
    metalness: 0.88,
  }),
  battery: new THREE.MeshStandardMaterial({
    color: 0x15191e,
    roughness: 0.52,
    metalness: 0.35,
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x8adfff,
    roughness: 0.06,
    metalness: 0.05,
    transparent: true,
    opacity: 0.32,
    transmission: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    emissive: 0x11465a,
    emissiveIntensity: 0.35,
  }),
  cyanGlow: new THREE.MeshBasicMaterial({
    color: ACCENT,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }),
  amberGlow: new THREE.MeshBasicMaterial({
    color: ACCENT_WARM,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }),
};

/* ============================================================
   RUNTIME STATE
   ============================================================ */
const runtime = new Map();
const pickMeshes = [];
let selectedId = null;
let hoveredId = null;
let modelReady = false;
let activeCameraTween = null;
let dragging = false;
let pointerDownAt = null;
let lastHoverCheck = 0;

const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
const tmpVec = new THREE.Vector3();
const tmpVec2 = new THREE.Vector3();

/* ============================================================
   UI BUILD
   ============================================================ */
function buildPartList() {
  partList.innerHTML = '';
  PART_DATA.forEach((data) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'part-row';
    row.dataset.id = data.id;
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', 'false');
    row.innerHTML = `
      <span class="row-index">${data.no}</span>
      <span class="row-name">${data.name}</span>
      <span class="row-state"><i></i></span>
    `;
    row.addEventListener('click', () => activatePart(data.id, { fromList: true }));
    partList.appendChild(row);
  });
}

function buildLabels() {
  labelsEl.innerHTML = '';
  leadersEl.innerHTML = '';

  PART_DATA.forEach((data) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'part-label';
    button.dataset.id = data.id;
    button.setAttribute('aria-label', `${data.name}，点击查看详情`);
    button.innerHTML = `
      <span class="label-no">${data.no}</span>
      <span class="label-name">${data.name}</span>
    `;
    button.addEventListener('pointerenter', () => {
      if (!modelReady) return;
      setHovered(data.id);
    });
    button.addEventListener('pointerleave', () => {
      setHovered(null);
    });
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      activatePart(data.id);
    });
    labelsEl.appendChild(button);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.style.opacity = '0';
    leadersEl.appendChild(path);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '2.1');
    dot.style.opacity = '0';
    leadersEl.appendChild(dot);

    const part = runtime.get(data.id);
    if (part) {
      part.label = button;
      part.leader = path;
      part.dot = dot;
    }
  });
}

function updateListState() {
  let opened = 0;
  runtime.forEach((part, id) => {
    const row = partList.querySelector(`[data-id="${id}"]`);
    const isOpen = part.target > 0.5;
    if (isOpen) opened += 1;
    if (row) {
      row.classList.toggle('is-selected', selectedId === id);
      row.classList.toggle('is-open', isOpen);
      row.setAttribute('aria-selected', String(selectedId === id));
    }
    if (part.label) {
      part.label.classList.toggle('is-selected', selectedId === id);
    }
  });
  const total = PART_DATA.length;
  const openAll = opened === total;
  progressBar.style.width = `${(opened / total) * 100}%`;
  explodeAllBtn.classList.toggle('is-active', openAll);
  explodeAllBtn.dataset.tooltip = openAll ? '全部归位' : '全部拆解';
  explodeAllBtn.setAttribute('aria-label', openAll ? '全部归位' : '全部拆解');
  stage.classList.toggle('is-expanded', opened > 0);
  syncSelectedStatus();
}

function syncSelectedStatus() {
  if (!selectedId) return;
  const part = runtime.get(selectedId);
  if (!part) return;
  const isOpen = part.target > 0.5;
  selectedCard.classList.toggle('is-open', isOpen);
  const dot = selectedCard.querySelector('.sel-dot');
  if (dot) dot.classList.toggle('is-open', isOpen);
  const status = selectedCard.querySelector('.sr-only-status');
  if (status) status.textContent = isOpen ? '已拆解' : '装配状态';
}

function renderSelectedCard() {
  if (!selectedId) {
    selectedCard.classList.add('is-empty');
    selectedCard.parentElement?.classList.add('is-empty');
    selectedCard.innerHTML = '';
    return;
  }

  selectedCard.classList.remove('is-empty');
  selectedCard.parentElement?.classList.remove('is-empty');
  const data = PART_BY_ID.get(selectedId);
  const part = runtime.get(selectedId);
  if (!data) return;
  const isOpen = part ? part.target > 0.5 : false;
  selectedCard.classList.toggle('is-open', isOpen);
  selectedCard.innerHTML = `
    <div class="sel-top">
      <span class="sel-index">${data.no}</span>
      <span class="sel-dot ${isOpen ? 'is-open' : ''}"></span>
      <span class="visually-hidden sr-only-status">${isOpen ? '已拆解' : '装配状态'}</span>
    </div>
    <h2 class="sel-title">${data.name}</h2>
    <div class="spec-grid">
      ${data.specs.map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join('')}
    </div>
  `;
}

/* ============================================================
   MODEL LOADING
   ============================================================ */
function setLoader(progress) {
  const pct = clamp(Math.round(progress), 0, 100);
  loaderBar.style.width = `${pct}%`;
  loaderPct.textContent = `${String(pct).padStart(2, '0')}%`;
}

function showError(message) {
  loaderEl.classList.add('is-done');
  errorMessage.textContent = message;
  errorLayer.classList.add('is-visible');
}

function loadModel() {
  if (window.location.protocol === 'file:') {
    showError('浏览器禁止 file:// 协议读取外部 GLB 模型。请使用项目内的本地 HTTP 服务打开页面。');
    return;
  }

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    MODEL_URL,
    (gltf) => {
      handleGltfLoaded(gltf);
    },
    (event) => {
      if (event.total) {
        const ratio = event.loaded / event.total;
        setLoader(6 + ratio * 81);
      } else {
        setLoader(42);
      }
    },
    (error) => {
      console.error('[Action6] GLB load failed:', error);
      showError('未能读取 action6-white-blended-normal.glb。请确认 assets 目录完整，并通过本地 HTTP 服务器访问。');
    },
  );
}

async function handleGltfLoaded(gltf) {
  setLoader(90);
  await nextFrame();
  await nextFrame();

  try {
    buildModel(gltf);
  } catch (error) {
    console.error('[Action6] Build failed:', error);
    showError(`模型解析失败：${error.message || error}`);
    return;
  }

  setLoader(100);
  modelReady = true;
  renderSelectedCard();
  updateListState();
  updateLabelsState();

  setTimeout(() => {
    loaderEl.classList.add('is-done');
    if (REDUCED_MOTION) controls.update();
  }, 380);
}

function buildModel(gltf) {
  gltf.scene.updateMatrixWorld(true);
  let sourceMesh = null;
  gltf.scene.traverse((object) => {
    if (!sourceMesh && object.isMesh) sourceMesh = object;
  });
  if (!sourceMesh) throw new Error('GLB 中未找到网格对象');

  const baked = bakeGeometry(sourceMesh);
  const buckets = splitGeometry(baked);

  /* Build shell sections from the source mesh */
  buckets.forEach((indices, id) => {
    const data = PART_BY_ID.get(id);
    if (!data || !indices.length) return;
    const pivot = data.pivot;
    const geometry = buildSectionGeometry(baked, indices, pivot);
    const material = sourceMesh.material.clone();
    material.side = THREE.DoubleSide;
    material.envMapIntensity = 1.0;
    material.emissive = new THREE.Color(0x2ab7d4);
    material.emissiveIntensity = 0;
    material.needsUpdate = true;

    const group = new THREE.Group();
    group.name = `part_${id}`;
    group.position.fromArray(pivot);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.partId = id;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
    pickMeshes.push(mesh);

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const glow = new THREE.Mesh(geometry, glowMaterial);
    glow.scale.setScalar(1.012);
    glow.renderOrder = 6;
    glow.raycast = () => {};
    group.add(glow);

    modelRoot.add(group);

    runtime.set(id, {
      id,
      data,
      group,
      mesh,
      glow,
      material,
      isShell: true,
      target: 0,
      current: 0,
      label: null,
      leader: null,
      dot: null,
    });
  });

  /* Code-generated modules */
  PART_DATA.filter((data) => data.generated).forEach((data) => {
    const group = createGeneratedPart(data);
    group.name = `part_${data.id}`;
    group.position.fromArray(data.pivot);
    modelRoot.add(group);

    group.traverse((child) => {
      if (child.isMesh && !child.userData.ignorePick) {
        child.userData.partId = data.id;
        pickMeshes.push(child);
      }
    });

    const cageMaterial = new THREE.LineBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const cage = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(...data.cage)),
      cageMaterial,
    );
    cage.renderOrder = 20;
    cage.raycast = () => {};
    cage.userData.ignorePick = true;
    group.add(cage);

    runtime.set(data.id, {
      id: data.id,
      data,
      group,
      cage,
      isShell: false,
      target: 0,
      current: 0,
      label: null,
      leader: null,
      dot: null,
    });
  });

  addInternalChassis();
  buildLabels();

  /* Default selection: highlight the lens as an entry point. */
  selectedId = 'lens';
  renderSelectedCard();
  updateListState();
  updateLabelsState();
  applyModelTheme(currentTheme);
  modelRoot.updateMatrixWorld(true);
}

/* ============================================================
   GEOMETRY BAKING / CLASSIFICATION / SECTION BUILDING
   ============================================================ */
function bakeGeometry(mesh) {
  const geo = mesh.geometry;
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = geo.attributes.uv;
  const uv1 = geo.attributes.uv1 || geo.attributes.uv2 || null;
  const index = geo.index ? geo.index.array : null;
  const triCount = index ? index.length / 3 : pos.count / 3;

  const posArray = new Float32Array(pos.count * 3);
  const norArray = new Float32Array(nor.count * 3);
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    posArray[i * 3] = v.x;
    posArray[i * 3 + 1] = v.y;
    posArray[i * 3 + 2] = v.z;
    n.fromBufferAttribute(nor, i).applyMatrix3(normalMatrix).normalize();
    norArray[i * 3] = n.x;
    norArray[i * 3 + 1] = n.y;
    norArray[i * 3 + 2] = n.z;
  }

  const bbox = new THREE.Box3().setFromArray(posArray);
  const center = bbox.getCenter(new THREE.Vector3());
  for (let i = 0; i < posArray.length; i += 3) {
    posArray[i] -= center.x;
    posArray[i + 1] -= center.y;
    posArray[i + 2] -= center.z;
  }

  const uvArray = uv ? new Float32Array(pos.count * 2) : null;
  const uv1Array = uv1 ? new Float32Array(pos.count * 2) : null;
  for (let i = 0; i < pos.count; i += 1) {
    if (uvArray) {
      uvArray[i * 2] = uv.getX(i);
      uvArray[i * 2 + 1] = uv.getY(i);
    }
    if (uv1Array) {
      uv1Array[i * 2] = uv1.getX(i);
      uv1Array[i * 2 + 1] = uv1.getY(i);
    }
  }

  return {
    posArray,
    norArray,
    uvArray,
    uv1Array,
    index,
    triCount,
    center,
    bbox,
  };
}

function splitGeometry(baked) {
  const { posArray, norArray, index, triCount } = baked;
  const buckets = new Map([
    ['lens', []],
    ['front', []],
    ['back', []],
    ['top', []],
    ['bottom', []],
    ['left', []],
    ['right', []],
  ]);

  const lensCenterX = 0.47;
  const lensCenterY = 0.23;
  const lensFrontZ = 0.365;
  const lensRadius = 0.60;

  for (let tri = 0; tri < triCount; tri += 1) {
    const ia = index ? index[tri * 3] : tri * 3;
    const ib = index ? index[tri * 3 + 1] : tri * 3 + 1;
    const ic = index ? index[tri * 3 + 2] : tri * 3 + 2;

    const ax = posArray[ia * 3];
    const ay = posArray[ia * 3 + 1];
    const az = posArray[ia * 3 + 2];
    const bx = posArray[ib * 3];
    const by = posArray[ib * 3 + 1];
    const bz = posArray[ib * 3 + 2];
    const cx = posArray[ic * 3];
    const cy = posArray[ic * 3 + 1];
    const cz = posArray[ic * 3 + 2];

    const centerX = (ax + bx + cx) / 3;
    const centerY = (ay + by + cy) / 3;
    const centerZ = (az + bz + cz) / 3;

    const nx = norArray[ia * 3] + norArray[ib * 3] + norArray[ic * 3];
    const ny = norArray[ia * 3 + 1] + norArray[ib * 3 + 1] + norArray[ic * 3 + 1];
    const nz = norArray[ia * 3 + 2] + norArray[ib * 3 + 2] + norArray[ic * 3 + 2];

    let id;
    const radius = Math.hypot(centerX - lensCenterX, centerY - lensCenterY);
    if (centerZ > lensFrontZ && radius < lensRadius) {
      id = 'lens';
    } else if (Math.abs(nx) >= Math.abs(ny) && Math.abs(nx) >= Math.abs(nz)) {
      id = nx >= 0 ? 'right' : 'left';
    } else if (Math.abs(ny) >= Math.abs(nz)) {
      id = ny >= 0 ? 'top' : 'bottom';
    } else {
      id = nz >= 0 ? 'front' : 'back';
    }

    const bucket = buckets.get(id);
    if (bucket) bucket.push(ia, ib, ic);
  }

  return buckets;
}

function buildSectionGeometry(baked, indices, pivot) {
  const { posArray, norArray, uvArray, uv1Array } = baked;
  const remap = new Map();
  const newIndices = new Uint32Array(indices.length);
  let cursor = 0;

  for (let i = 0; i < indices.length; i += 1) {
    const oldIndex = indices[i];
    let newIndex = remap.get(oldIndex);
    if (newIndex === undefined) {
      newIndex = cursor;
      remap.set(oldIndex, newIndex);
      cursor += 1;
    }
    newIndices[i] = newIndex;
  }

  const positions = new Float32Array(cursor * 3);
  const normals = new Float32Array(cursor * 3);
  const uvs = uvArray ? new Float32Array(cursor * 2) : null;
  const uv1s = uv1Array ? new Float32Array(cursor * 2) : null;

  remap.forEach((newIndex, oldIndex) => {
    positions[newIndex * 3] = posArray[oldIndex * 3] - pivot[0];
    positions[newIndex * 3 + 1] = posArray[oldIndex * 3 + 1] - pivot[1];
    positions[newIndex * 3 + 2] = posArray[oldIndex * 3 + 2] - pivot[2];
    normals[newIndex * 3] = norArray[oldIndex * 3];
    normals[newIndex * 3 + 1] = norArray[oldIndex * 3 + 1];
    normals[newIndex * 3 + 2] = norArray[oldIndex * 3 + 2];
    if (uvs && uvArray) {
      uvs[newIndex * 2] = uvArray[oldIndex * 2];
      uvs[newIndex * 2 + 1] = uvArray[oldIndex * 2 + 1];
    }
    if (uv1s && uv1Array) {
      uv1s[newIndex * 2] = uv1Array[oldIndex * 2];
      uv1s[newIndex * 2 + 1] = uv1Array[oldIndex * 2 + 1];
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  if (uvs) geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  if (uv1s) geometry.setAttribute('uv1', new THREE.BufferAttribute(uv1s, 2));
  geometry.setIndex(new THREE.BufferAttribute(newIndices, 1));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/* ============================================================
   CODE-GENERATED MODULES
   ============================================================ */
function createGeneratedPart(data) {
  switch (data.id) {
    case 'sensor':
      return createSensorModule();
    case 'board':
      return createMainboardModule();
    case 'battery':
      return createBatteryModule();
    default:
      return new THREE.Group();
  }
}

function makeSensorTexture() {
  return makeCanvasTexture(512, 512, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#07161d');
    bg.addColorStop(1, '#0a2230');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(112, 230, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 48; x < w - 40; x += 26) {
      for (let y = 48; y < h - 40; y += 26) {
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = 'rgba(112, 230, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    const glow = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, 140);
    glow.addColorStop(0, 'rgba(112, 230, 255, 0.42)');
    glow.addColorStop(1, 'rgba(112, 230, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(170, 244, 255, 0.84)';
    ctx.font = '500 23px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('1/1.1" CMOS', w / 2, 104);
    ctx.fillStyle = 'rgba(112, 230, 255, 0.66)';
    ctx.font = '400 16px "SF Mono", monospace';
    ctx.fillText('38 MP  /  13.5 STOPS', w / 2, 132);

    ctx.fillStyle = 'rgba(112, 230, 255, 0.5)';
    ctx.font = '400 13px "SF Mono", monospace';
    ctx.fillText('IMAGE SENSOR ARRAY', w / 2, 424);
  });
}

function createSensorModule() {
  const group = new THREE.Group();

  const pcb = roundedMesh(0.56, 0.56, 0.032, 0.025, INTERNAL_MATS.pcb, 2);
  pcb.position.z = -0.072;
  group.add(pcb);

  addFastener(group, -0.225, -0.225, -0.052, INTERNAL_MATS.gold, 0.019);
  addFastener(group, 0.225, -0.225, -0.052, INTERNAL_MATS.gold, 0.019);
  addFastener(group, -0.225, 0.225, -0.052, INTERNAL_MATS.gold, 0.019);
  addFastener(group, 0.225, 0.225, -0.052, INTERNAL_MATS.gold, 0.019);

  const packageBody = roundedMesh(0.43, 0.4, 0.07, 0.022, INTERNAL_MATS.darkSoft, 3);
  packageBody.position.z = -0.025;
  group.add(packageBody);

  const ceramic = roundedMesh(0.34, 0.32, 0.016, 0.012, INTERNAL_MATS.dark, 2);
  ceramic.position.z = 0.019;
  group.add(ceramic);

  const sensorTexture = makeSensorTexture();
  const sensorPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.31, 0.31),
    new THREE.MeshBasicMaterial({
      map: sensorTexture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  sensorPlane.position.z = 0.03;
  group.add(sensorPlane);

  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.32), INTERNAL_MATS.glass.clone());
  glass.material.opacity = 0.2;
  glass.position.z = 0.038;
  group.add(glass);

  const frameMat = INTERNAL_MATS.gold;
  const frameBars = [
    [0, 0.18, 0.4, 0.018],
    [0, -0.18, 0.4, 0.018],
    [-0.2, 0, 0.018, 0.34],
    [0.2, 0, 0.018, 0.34],
  ];
  frameBars.forEach(([x, y, w, h]) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.012), frameMat);
    bar.position.set(x, y, 0.04);
    group.add(bar);
  });

  for (let i = 0; i < 10; i += 1) {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.018, 0.008), INTERNAL_MATS.gold);
    pin.position.set(-0.18 + i * 0.04, -0.345, -0.048);
    group.add(pin);
  }

  const connector = roundedMesh(0.2, 0.055, 0.035, 0.01, INTERNAL_MATS.dark, 2);
  connector.position.set(0, -0.375, -0.06);
  group.add(connector);

  const flex = roundedMesh(0.19, 0.02, 0.16, 0.008, INTERNAL_MATS.copper, 2);
  flex.position.set(0, -0.4, -0.13);
  flex.rotation.x = -0.15;
  group.add(flex);

  const mountRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.275, 0.013, 10, 64),
    INTERNAL_MATS.metalDark,
  );
  mountRing.position.z = 0.002;
  group.add(mountRing);

  const accent = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 0.008, 0.004),
    INTERNAL_MATS.cyanGlow,
  );
  accent.position.set(-0.17, 0.245, 0.045);
  group.add(accent);

  for (let i = 0; i < 4; i += 1) {
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.032, 0.026),
      INTERNAL_MATS.metal,
    );
    cap.position.set(-0.23 + i * 0.09, -0.27, -0.04);
    group.add(cap);
  }

  return group;
}

function makeChipTexture(title, subtitle, accent = '#70e6ff') {
  return makeCanvasTexture(384, 256, (ctx, w, h) => {
    ctx.fillStyle = '#0a0e12';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = accent;
    ctx.font = '600 33px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, h / 2 - 5);
    ctx.fillStyle = 'rgba(201, 224, 231, 0.5)';
    ctx.font = '400 17px "SF Mono", monospace';
    ctx.fillText(subtitle, w / 2, h / 2 + 30);
    ctx.fillStyle = 'rgba(112, 230, 255, 0.17)';
    for (let i = 0; i < 18; i += 1) {
      const x = 20 + (i * 19) % (w - 40);
      ctx.fillRect(x, h - 25, 8, 3);
    }
  });
}

function addChip(group, x, y, z, w, h, texture, material = INTERNAL_MATS.dark) {
  const chip = roundedMesh(w, h, 0.028, 0.008, material, 2);
  chip.position.set(x, y, z);
  group.add(chip);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.86, h * 0.8),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  label.position.set(x, y, z + 0.015);
  group.add(label);
  return chip;
}

function createMainboardModule() {
  const group = new THREE.Group();

  const board = roundedMesh(1.16, 0.84, 0.034, 0.025, INTERNAL_MATS.pcb, 3);
  group.add(board);

  const rear = roundedMesh(1.12, 0.80, 0.012, 0.02, INTERNAL_MATS.pcbBack, 2);
  rear.position.z = -0.022;
  group.add(rear);

  /* copper traces */
  const tracePositions = [];
  const rand = seededRandom(9918);
  for (let i = 0; i < 26; i += 1) {
    const side = i % 2 === 0 ? 1 : -1;
    const startX = -0.53 + rand() * 0.34;
    const startY = side * (0.06 + rand() * 0.3);
    const endX = -0.06 + rand() * 0.22;
    const endY = side * (0.12 + rand() * 0.22);
    const midX = startX + (endX - startX) * 0.55;
    tracePositions.push(startX, startY, 0.019, midX, startY, 0.019);
    tracePositions.push(midX, startY, 0.019, midX, endY, 0.019);
    tracePositions.push(midX, endY, 0.019, endX, endY, 0.019);

    if (i % 3 === 0) {
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.013, 0.013, 0.003, 12),
        INTERNAL_MATS.gold,
      );
      pad.rotation.x = Math.PI / 2;
      pad.position.set(endX, endY, 0.023);
      group.add(pad);
    }
  }
  const traceGeo = new THREE.BufferGeometry();
  traceGeo.setAttribute('position', new THREE.Float32BufferAttribute(tracePositions, 3));
  const traces = new THREE.LineSegments(
    traceGeo,
    new THREE.LineBasicMaterial({
      color: 0x66c2a2,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    }),
  );
  group.add(traces);

  const socTexture = makeChipTexture('VISION', 'IMAGE SoC', '#b8f5ff');
  addChip(group, -0.16, 0.12, 0.026, 0.32, 0.27, socTexture);

  const wifiTexture = makeChipTexture('Wi-Fi 6', 'BT 5.1 / 2.4+5G', '#70e6ff');
  addChip(group, 0.34, 0.25, 0.023, 0.2, 0.14, wifiTexture);

  const storageTexture = makeChipTexture('50 GB', 'INTERNAL NAND', '#ffcf9a');
  addChip(group, -0.34, -0.29, 0.023, 0.22, 0.12, storageTexture);

  const shield = roundedMesh(0.3, 0.21, 0.034, 0.012, INTERNAL_MATS.metal, 2);
  shield.position.set(0.28, -0.23, 0.027);
  group.add(shield);

  addFastener(group, -0.51, 0.35, 0.02, INTERNAL_MATS.gold, 0.023);
  addFastener(group, 0.51, 0.35, 0.02, INTERNAL_MATS.gold, 0.023);
  addFastener(group, -0.51, -0.35, 0.02, INTERNAL_MATS.gold, 0.023);
  addFastener(group, 0.51, -0.35, 0.02, INTERNAL_MATS.gold, 0.023);

  for (let i = 0; i < 4; i += 1) {
    const standoff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.035, 16),
      INTERNAL_MATS.gold,
    );
    standoff.rotation.x = Math.PI / 2;
    const positions = [
      [-0.5, 0.34],
      [0.5, 0.34],
      [-0.5, -0.34],
      [0.5, -0.34],
    ];
    standoff.position.set(positions[i][0], positions[i][1], -0.038);
    group.add(standoff);
  }

  const connector = roundedMesh(0.2, 0.055, 0.055, 0.012, INTERNAL_MATS.darkSoft, 2);
  connector.position.set(0.0, -0.44, 0.03);
  group.add(connector);

  for (let i = 0; i < 8; i += 1) {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.035, 0.006), INTERNAL_MATS.gold);
    pin.position.set(-0.07 + i * 0.02, -0.44, 0.061);
    group.add(pin);
  }

  const led = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.014, 0.005), INTERNAL_MATS.cyanGlow);
  led.position.set(0.46, -0.1, 0.023);
  group.add(led);

  const crystal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.016, 24),
    INTERNAL_MATS.metal,
  );
  crystal.rotation.x = Math.PI / 2;
  crystal.position.set(-0.08, -0.34, 0.028);
  group.add(crystal);

  return group;
}

function makeBatteryLabel() {
  return makeCanvasTexture(512, 640, (ctx, w, h) => {
    ctx.fillStyle = '#171a1e';
    ctx.fillRect(0, 0, w, h);

    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, 'rgba(112, 230, 255, 0.1)');
    bg.addColorStop(0.55, 'rgba(112, 230, 255, 0.015)');
    bg.addColorStop(1, 'rgba(255, 179, 107, 0.1)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(112, 230, 255, 0.8)';
    ctx.fillRect(42, 52, 64, 4);
    ctx.fillStyle = 'rgba(201, 224, 231, 0.55)';
    ctx.font = '400 17px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('EXTREME BATTERY PLUS', 42, 88);

    ctx.fillStyle = '#e9f5fa';
    ctx.font = '300 116px "SF Mono", monospace';
    ctx.fillText('1950', 38, 236);
    ctx.fillStyle = 'rgba(112, 230, 255, 0.78)';
    ctx.font = '400 34px "SF Mono", monospace';
    ctx.fillText('mAh', 330, 232);

    ctx.strokeStyle = 'rgba(201, 224, 231, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(42, 282);
    ctx.lineTo(w - 42, 282);
    ctx.stroke();

    ctx.fillStyle = 'rgba(201, 224, 231, 0.7)';
    ctx.font = '400 20px "SF Mono", monospace';
    ctx.fillText('3.87 V', 42, 326);
    ctx.fillText('Li-ion', 42, 358);
    ctx.fillText('-20°C', 42, 390);

    ctx.fillStyle = 'rgba(112, 230, 255, 0.52)';
    ctx.font = '400 13px "SF Mono", monospace';
    ctx.fillText('OSMO ACTION SERIES', 42, 452);

    ctx.strokeStyle = 'rgba(255, 179, 107, 0.38)';
    ctx.beginPath();
    ctx.moveTo(42, 510);
    ctx.lineTo(w - 42, 510);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 179, 107, 0.66)';
    ctx.font = '400 14px "SF Mono", monospace';
    ctx.fillText('DO NOT PIERCE / DO NOT DISASSEMBLE', 42, 546);

    for (let i = 0; i < 6; i += 1) {
      ctx.fillStyle = `rgba(112, 230, 255, ${0.1 + i * 0.035})`;
      ctx.fillRect(42 + i * 16, 582, 8, 8);
    }
  });
}

function createBatteryModule() {
  const group = new THREE.Group();

  const body = roundedMesh(0.82, 1.04, 0.17, 0.055, INTERNAL_MATS.battery, 5);
  group.add(body);

  const frontPlate = roundedMesh(0.8, 1.01, 0.012, 0.045, INTERNAL_MATS.darkSoft, 3);
  frontPlate.position.z = 0.088;
  group.add(frontPlate);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.74, 0.9),
    new THREE.MeshBasicMaterial({
      map: makeBatteryLabel(),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  label.position.z = 0.095;
  group.add(label);

  const contactMat = INTERNAL_MATS.gold;
  for (let i = 0; i < 3; i += 1) {
    const contact = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.032, 0.012), contactMat);
    contact.position.set(-0.12 + i * 0.12, 0.492, 0.054);
    group.add(contact);
  }

  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.82, 0.006), INTERNAL_MATS.cyanGlow);
  strip.position.set(-0.388, -0.03, 0.097);
  group.add(strip);

  const tab = roundedMesh(0.16, 0.1, 0.014, 0.012, INTERNAL_MATS.copper, 2);
  tab.position.set(0.22, 0.5, 0.032);
  group.add(tab);

  const seam = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.006, 0.18),
    INTERNAL_MATS.dark,
  );
  seam.position.set(0, -0.2, 0);
  group.add(seam);

  return group;
}

function addInternalChassis() {
  const group = new THREE.Group();
  group.name = 'internal_chassis';
  group.position.z = -0.215;
  const material = new THREE.MeshStandardMaterial({
    color: 0x1b252c,
    roughness: 0.48,
    metalness: 0.8,
  });

  const top = roundedMesh(1.72, 0.075, 0.1, 0.025, material, 2);
  top.position.y = 0.59;
  group.add(top);

  const bottom = roundedMesh(1.72, 0.075, 0.1, 0.025, material, 2);
  bottom.position.y = -0.59;
  group.add(bottom);

  const left = roundedMesh(0.075, 1.12, 0.1, 0.025, material, 2);
  left.position.x = -0.86;
  group.add(left);

  const right = roundedMesh(0.075, 1.12, 0.1, 0.025, material, 2);
  right.position.x = 0.86;
  group.add(right);

  const spreader = roundedMesh(0.9, 0.7, 0.018, 0.03, INTERNAL_MATS.copper, 2);
  spreader.position.set(-0.1, 0.02, -0.02);
  spreader.raycast = () => {};
  group.add(spreader);

  group.traverse((child) => {
    if (child.isMesh) child.userData.ignorePick = true;
  });

  modelRoot.add(group);
}

/* ============================================================
   INTERACTION
   ============================================================ */
function getPointerNdc(event) {
  const rect = canvas.getBoundingClientRect();
  pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  return pointerNdc;
}

function pickAt(event) {
  if (!modelReady) return null;
  getPointerNdc(event);
  raycaster.setFromCamera(pointerNdc, camera);
  const hits = raycaster.intersectObjects(pickMeshes, false);
  if (!hits.length) return null;
  return hits[0].object.userData.partId || null;
}

function setHovered(id) {
  if (hoveredId === id) return;
  hoveredId = id;
  runtime.forEach((part, partId) => {
    if (part.label) part.label.classList.toggle('is-hovered', partId === id);
  });
  canvas.classList.toggle('is-hovering', Boolean(id));
}

function activatePart(id, options = {}) {
  if (!modelReady || !runtime.has(id)) return;
  const { fromList = false } = options;
  const part = runtime.get(id);

  if (selectedId === id && fromList) {
    part.target = 1;
  } else if (selectedId === id) {
    part.target = part.target > 0.5 ? 0 : 1;
  } else {
    selectedId = id;
    if (part.target <= 0.5) part.target = 1;
  }

  if (fromList) {
    const row = partList.querySelector(`[data-id="${id}"]`);
    row?.scrollIntoView({ block: 'nearest' });
  }
  renderSelectedCard();
  updateListState();
  updateLabelsState();
}

function deselectPart() {
  if (!selectedId) return;
  selectedId = null;
  renderSelectedCard();
  updateListState();
  updateLabelsState();
}

function getAnchorWorld(part, progress = part.current) {
  const data = part.data;
  const dir = new THREE.Vector3(...data.direction).normalize();
  const target = new THREE.Vector3(...data.anchor).addScaledVector(dir, data.distance * progress);
  return modelRoot.localToWorld(target);
}

function startCameraTween(position, target, duration = 1.0) {
  if (REDUCED_MOTION) {
    camera.position.copy(position);
    controls.target.copy(target);
    controls.update();
    return;
  }
  activeCameraTween = {
    fromPos: camera.position.clone(),
    toPos: position.clone(),
    fromTarget: controls.target.clone(),
    toTarget: target.clone(),
    started: performance.now(),
    duration: duration * 1000,
  };
}

function resetCamera() {
  startCameraTween(DEFAULT_CAMERA.clone(), DEFAULT_TARGET.clone(), 0.9);
}

function ensureTeardownFraming() {
  const distance = camera.position.distanceTo(controls.target);
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  const widthFit = 2.55 / Math.tan(hFov / 2);
  const heightFit = 2.02 / Math.tan(vFov / 2);
  const desired = Math.max(8.9, Math.max(widthFit, heightFit) * 1.12);
  if (distance + 0.08 >= desired) return;
  const target = controls.target.clone();
  const direction = camera.position.clone().sub(target).normalize();
  startCameraTween(target.clone().addScaledVector(direction, desired), target, 1.0);
}

function toggleAllExplode() {
  if (!modelReady) return;
  const allOpen = [...runtime.values()].every((part) => part.target > 0.5);
  runtime.forEach((part) => {
    part.target = allOpen ? 0 : 1;
  });
  if (!allOpen) ensureTeardownFraming();
  updateListState();
  renderSelectedCard();
  updateLabelsState();
}

function resetAllParts() {
  if (!modelReady) return;
  runtime.forEach((part) => {
    part.target = 0;
  });
  updateListState();
  renderSelectedCard();
  updateLabelsState();
}

function toggleAutoRotate() {
  controls.autoRotate = !controls.autoRotate;
  autoRotateBtn.classList.toggle('is-active', controls.autoRotate);
  autoRotateBtn.setAttribute('aria-pressed', String(controls.autoRotate));
}

function toggleHelp(force) {
  const shouldOpen = typeof force === 'boolean' ? force : !helpLayer.classList.contains('is-open');
  helpLayer.classList.toggle('is-open', shouldOpen);
  if (shouldOpen) helpClose.focus();
}



/* ============================================================
   LABELS
   ============================================================ */
function updateLabelsState() {
  runtime.forEach((part) => {
    if (!part.label) return;
    part.label.classList.toggle('is-selected', selectedId === part.id);
    part.label.classList.toggle('is-hovered', hoveredId === part.id);
  });
}

function updateLabels() {
  if (!modelReady) return;
  if (NARROW_LAYOUT.matches) return;
  const stageWidth = stage.clientWidth;
  const stageHeight = stage.clientHeight;
  if (!stageWidth || !stageHeight) return;

  const columns = { left: [], right: [] };

  runtime.forEach((part) => {
    if (!part.label) return;
    const isExternal = !INTERNAL_IDS.has(part.id);
    const visible = isExternal || part.current > 0.03 || selectedId === part.id || hoveredId === part.id;

    if (!visible) {
      setLabelVisibility(part, false);
      return;
    }

    const anchor = getAnchorWorld(part, part.current);
    if (!part.data.generated && part.current < 0.08) {
      const normal = PART_NORMALS[part.id];
      if (normal) {
        tmpVec2
          .set(normal[0], normal[1], normal[2])
          .normalize();
        const toCamera = tmpVec.copy(camera.position).sub(anchor).normalize();
        if (tmpVec2.dot(toCamera) < -0.5) {
          setLabelVisibility(part, false);
          return;
        }
      }
    }

    tmpVec.copy(anchor).project(camera);
    if (tmpVec.z > 1 || tmpVec.z < -1) {
      setLabelVisibility(part, false);
      return;
    }

    const ax = (tmpVec.x * 0.5 + 0.5) * stageWidth;
    const ay = (-tmpVec.y * 0.5 + 0.5) * stageHeight;
    if (ax < -70 || ax > stageWidth + 70 || ay < -50 || ay > stageHeight + 50) {
      setLabelVisibility(part, false);
      return;
    }

    const side = part.data.labelSide === 'right' ? 'right' : 'left';
    columns[side].push({ part, ax, ay });
  });

  const compact = stageHeight < 700;
  const safeTop = compact ? 96 : 118;
  const safeBottom = stageHeight - (compact ? 78 : 102);
  const edge = clamp(stageWidth * 0.105, 88, 126);
  const visibleIds = new Set();

  Object.entries(columns).forEach(([side, items]) => {
    items.sort((a, b) => a.ay - b.ay);
    if (!items.length) return;

    const n = items.length;
    const gap = n > 1 ? clamp((safeBottom - safeTop) / (n + 0.45), 46, 82) : 0;
    const total = (n - 1) * gap;
    const center = (safeTop + safeBottom) / 2;
    const start = center - total / 2;
    const x = side === 'left' ? edge : stageWidth - edge;

    items.forEach((item, i) => {
      const { part, ax, ay } = item;
      const y = start + i * gap;
      const w = part.label.offsetWidth || 136;
      const h = part.label.offsetHeight || 30;

      visibleIds.add(part.id);
      part.label.style.left = `${x}px`;
      part.label.style.top = `${y}px`;
      part.label.classList.toggle('is-selected', selectedId === part.id);
      part.label.classList.toggle('is-hovered', hoveredId === part.id);
      part.label.style.zIndex = selectedId === part.id ? '12' : hoveredId === part.id ? '11' : '1';
      part.label.classList.add('is-visible');
      part.label.style.opacity = '1';
      part.label.style.pointerEvents = 'auto';

      const ex = side === 'left' ? x + w / 2 : x - w / 2;
      const ey = clamp(ay, y - h / 2 + 8, y + h / 2 - 8);
      const dx = ex - ax;
      const dy = ey - ay;
      const c1x = ax + dx * 0.46;
      const c1y = ay + dy * 0.06;
      const c2x = ex - dx * 0.12;
      const c2y = ey - dy * 0.5;

      part.leader.setAttribute(
        'd',
        `M ${ax.toFixed(1)} ${ay.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      );
      part.leader.style.opacity = '1';
      part.leader.classList.toggle('is-active', selectedId === part.id || hoveredId === part.id);

      part.dot.setAttribute('cx', ax.toFixed(1));
      part.dot.setAttribute('cy', ay.toFixed(1));
      part.dot.style.opacity = '1';
      part.dot.classList.toggle('is-active', selectedId === part.id || hoveredId === part.id);
    });
  });

  runtime.forEach((part) => {
    if (!visibleIds.has(part.id)) setLabelVisibility(part, false);
  });
}

function setLabelVisibility(part, visible) {
  if (!part.label) return;
  if (!visible) {
    part.label.classList.remove('is-visible');
    part.label.style.opacity = '0';
    part.label.style.pointerEvents = 'none';
    if (part.leader) part.leader.style.opacity = '0';
    if (part.dot) part.dot.style.opacity = '0';
  } else {
    part.label.classList.add('is-visible');
    part.label.style.opacity = '1';
    part.label.style.pointerEvents = 'auto';
  }
}

/* ============================================================
   EVENT HANDLERS
   ============================================================ */
function onPointerMove(event) {
  if (!modelReady) return;
  const now = performance.now();
  if (dragging || now - lastHoverCheck < 45) return;
  lastHoverCheck = now;
  const id = pickAt(event);
  setHovered(id);
}

function onPointerDown(event) {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  activeCameraTween = null;
  pointerDownAt = { x: event.clientX, y: event.clientY, time: performance.now() };
  dragging = false;
}

function onPointerUp(event) {
  if (!pointerDownAt) return;
  const dx = event.clientX - pointerDownAt.x;
  const dy = event.clientY - pointerDownAt.y;
  const moved = Math.hypot(dx, dy);
  const quick = performance.now() - pointerDownAt.time < 650;
  pointerDownAt = null;
  if (moved > 6 || !quick) {
    dragging = false;
    return;
  }
  dragging = false;
  const id = pickAt(event);
  if (id) {
    activatePart(id);
  } else {
    deselectPart();
  }
}

function onPointerLeave() {
  setHovered(null);
}

function onKeyDown(event) {
  if (event.target instanceof HTMLElement) {
    const tag = event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable) return;
    if ((tag === 'BUTTON' || tag === 'A') && (event.key === ' ' || event.code === 'Space' || event.key === 'Enter')) return;
  }
  if (helpLayer.classList.contains('is-open') && event.key !== 'Escape') return;
  if (event.key === 'Escape') {
    if (helpLayer.classList.contains('is-open')) {
      toggleHelp(false);
    } else {
      deselectPart();
    }
    return;
  }
  if (event.key === ' ' || event.code === 'Space') {
    event.preventDefault();
    toggleAllExplode();
    return;
  }
  if (event.key.toLowerCase() === 'r') {
    resetCamera();
    return;
  }
  if (event.key.toLowerCase() === 't') {
    const ids = Object.keys(THEMES);
    const index = Math.max(0, ids.indexOf(currentTheme));
    switchTheme(ids[(index + 1) % ids.length]);
    return;
  }
  if (event.key.toLowerCase() === 'h') {
    toggleHelp();
    return;
  }
  if (event.key.toLowerCase() === 'a') {
    toggleAutoRotate();
    return;
  }
  if (/^[0-9]$/.test(event.key)) {
    const index = event.key === '0' ? 9 : Number(event.key) - 1;
    const data = PART_DATA[index];
    if (data) activatePart(data.id, { fromList: true });
  }
}


let captureInitialized = false;

function updateCaptureScene(now, dt) {
  const theme = THEMES[currentTheme] || THEMES.deep;
  const isLight = theme.mode === 'light';
  const openCount = runtime.size ? [...runtime.values()].filter((part) => part.target > 0.5).length : 0;
  const explosion = openCount / Math.max(1, PART_DATA.length);
  const focus = selectedId === 'lens' ? 1 : selectedId === 'sensor' ? 0.78 : 0;

  const worldTarget = clamp(theme.panoOpacity - explosion * 0.14, 0, 0.72);
  const fieldTarget = clamp(theme.fieldOpacity + focus * (isLight ? 0.04 : 0.06) - explosion * 0.045, 0, 0.4);
  const ease = 1 - Math.exp(-dt * 2.4);

  if (!captureInitialized && captureLoaded[currentTheme]?.pano) {
    panoMaterials.forEach((material, themeId) => {
      material.opacity = themeId === currentTheme ? worldTarget : 0;
    });
    fieldMaterials.forEach((material, themeId) => {
      material.opacity = themeId === currentTheme && captureLoaded[themeId]?.field ? fieldTarget : 0;
    });
    captureInitialized = true;
  } else {
    panoMaterials.forEach((material, themeId) => {
      const target = themeId === currentTheme && captureLoaded[themeId]?.pano ? worldTarget : 0;
      material.opacity += (target - material.opacity) * ease;
    });
    fieldMaterials.forEach((material, themeId) => {
      const target = themeId === currentTheme && captureLoaded[themeId]?.field ? fieldTarget : 0;
      material.opacity += (target - material.opacity) * ease;
    });
  }

  captureFieldGroup.position.copy(controls.target);
  captureFieldGroup.quaternion.slerp(camera.quaternion, 1 - Math.exp(-dt * 6));
  const spin = Math.sin(now * 0.00004) * 0.035;
  fieldMeshes.forEach((mesh) => {
    mesh.rotation.z = spin;
  });
  captureFieldGroup.scale.setScalar(1 + focus * 0.035 + explosion * 0.015 + Math.sin(now * 0.00006) * 0.004);
}

/* ============================================================
   RENDER LOOP
   ============================================================ */
let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  if (activeCameraTween) {
    const t = clamp((now - activeCameraTween.started) / activeCameraTween.duration, 0, 1);
    const eased = easeInOutCubic(t);
    camera.position.lerpVectors(activeCameraTween.fromPos, activeCameraTween.toPos, eased);
    controls.target.lerpVectors(activeCameraTween.fromTarget, activeCameraTween.toTarget, eased);
    if (t >= 1) activeCameraTween = null;
  }

  controls.update(dt);
  updateCaptureScene(now, dt);

  if (modelReady) {
    updatePartAnimation(dt, now);
    modelRoot.updateMatrixWorld(true);
    updateLabels();
  }

  if (!REDUCED_MOTION) {
    dust.rotation.y += dt * 0.008;
    dust.position.y = Math.sin(now * 0.00012) * 0.04;
  }

  worldCamera.position.copy(camera.position);
  worldCamera.quaternion.copy(camera.quaternion);
  worldCamera.fov = camera.fov;
  worldCamera.updateProjectionMatrix();
  worldRenderer.render(worldScene, worldCamera);
  renderer.render(scene, camera);
}

function updatePartAnimation(dt, now) {
  runtime.forEach((part) => {
    const target = part.target;
    const speed = target > part.current ? 5.6 : 4.3;
    const k = 1 - Math.exp(-dt * speed);
    part.current += (target - part.current) * k;
    if (Math.abs(target - part.current) < 0.0008) part.current = target;

    const progress = easeOutCubic(clamp(part.current, 0, 1));
    const data = part.data;
    const dir = tmpVec2.set(...data.direction).normalize();
    const explosion = data.distance * progress;
    part.group.position.set(
      data.pivot[0] + dir.x * explosion,
      data.pivot[1] + dir.y * explosion,
      data.pivot[2] + dir.z * explosion,
    );

    const selected = selectedId === part.id;
    const hovered = hoveredId === part.id;
    const highlight = selected ? 1 : hovered ? 0.58 : 0;
    const pulse = 0.92 + Math.sin(now * 0.0032 + data.pivot[0] * 5) * 0.08;

    if (part.isShell) {
      const glowTarget = (selected ? 0.13 : hovered ? 0.07 : 0) * pulse;
      part.glow.material.opacity += (glowTarget - part.glow.material.opacity) * Math.min(1, dt * 8);
      const emissiveTarget = selected ? 0.16 : hovered ? 0.075 : 0;
      part.material.emissiveIntensity += (emissiveTarget - part.material.emissiveIntensity) * Math.min(1, dt * 8);
    } else if (part.cage) {
      const cageTarget = selected ? 0.42 : hovered ? 0.18 : 0;
      part.cage.material.opacity += (cageTarget - part.cage.material.opacity) * Math.min(1, dt * 8);
    }
  });
}



/* ============================================================
   RESIZE / INIT
   ============================================================ */
function onResize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  const worldWidth = window.innerWidth;
  const worldHeight = window.innerHeight;
  worldRenderer.setSize(worldWidth, worldHeight, false);
  worldCamera.aspect = worldWidth / worldHeight;
  worldCamera.updateProjectionMatrix();
  if (modelReady) {
    if (width < 700 && [...runtime.values()].some((part) => part.target > 0.5)) {
      ensureTeardownFraming();
    }
    updateLabels();
  }
}

function bindUI() {
  explodeAllBtn.addEventListener('click', toggleAllExplode);
  resetPartsBtn.addEventListener('click', resetAllParts);
  resetCameraBtn.addEventListener('click', resetCamera);
  autoRotateBtn.addEventListener('click', toggleAutoRotate);
  helpBtn.addEventListener('click', () => toggleHelp(true));
  helpClose.addEventListener('click', () => toggleHelp(false));
  helpLayer.addEventListener('click', (event) => {
    if (event.target === helpLayer) toggleHelp(false);
  });
  retryBtn.addEventListener('click', () => window.location.reload());

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('pointercancel', onPointerLeave);
  document.addEventListener('click', (event) => {
    if (event.target === canvas) return; // handled by the canvas pointerup path
    if (event.target.closest('.panel, .topbar, .controls-dock, .part-label, .help-layer, .error-layer, .loader, button, a')) return;
    deselectPart();
  });
  window.addEventListener('keydown', onKeyDown);
  controls.addEventListener('start', () => {
    activeCameraTween = null;
    dragging = true;
    setHovered(null);
  });
  controls.addEventListener('end', () => {
    dragging = false;
  });

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(stage);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 200));
}

function init() {
  buildThemePaddle();
  applyTheme(currentTheme, { persist: false });
  buildPartList();
  bindUI();
  onResize();
  renderSelectedCard();
  updateListState();
  setLoader(3);
  loadModel();
  requestAnimationFrame(animate);
}

init();

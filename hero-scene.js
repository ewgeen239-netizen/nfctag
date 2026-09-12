import * as THREE from "/assets/vendor/three.module.min.js";

const host = document.querySelector("#hero-scene");
const canvas = host.querySelector("canvas");
const toggle = document.querySelector("#scene-toggle");
const status = document.querySelector("#scene-status");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const t = (text) => (window.nfcTranslate ? window.nfcTranslate(text) : text);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
} catch {
  host.classList.add("scene-unavailable");
  status.textContent = "3D недоступно. Посмотри интерактивный пример визитки.";
  toggle.hidden = true;
}
if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0.1, 1, 11.8);
  camera.lookAt(0.1, 0.05, 0);
  scene.add(new THREE.HemisphereLight(0xecf2de, 0x27232b, 2.8));
  const key = new THREE.DirectionalLight(0xffeee0, 4);
  key.position.set(-4, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc9b4ef, 3);
  rim.position.set(4, 2, -2);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xd8fa86, 0.7);
  fill.position.set(-4, -1, 1);
  scene.add(fill);
  const skin = new THREE.MeshStandardMaterial({
    color: 0xc58d6b,
    roughness: 0.6,
    metalness: 0,
  });
  const nails = new THREE.MeshStandardMaterial({
    color: 0xd7af94,
    roughness: 0.45,
  });
  const sleeve = new THREE.MeshStandardMaterial({
    color: 0x30332f,
    roughness: 0.94,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x151715,
    metalness: 0.7,
    roughness: 0.24,
  });
  function roundedShape(w, h, r) {
    const shape = new THREE.Shape(),
      x = -w / 2,
      y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  }
  function slab(w, h, depth, r, material) {
    const geometry = new THREE.ExtrudeGeometry(roundedShape(w, h, r), {
      depth,
      bevelEnabled: true,
      bevelSize: 0.035,
      bevelThickness: 0.025,
      bevelSegments: 3,
      curveSegments: 10,
      steps: 1,
    });
    return new THREE.Mesh(geometry, material);
  }
  function face(w, h, r, material) {
    const geometry = new THREE.ShapeGeometry(roundedShape(w, h, r), 12);
    const position = geometry.attributes.position,
      uv = geometry.attributes.uv;
    for (let i = 0; i < position.count; i++)
      uv.setXY(
        i,
        (position.getX(i) + w / 2) / w,
        (position.getY(i) + h / 2) / h,
      );
    return new THREE.Mesh(geometry, material);
  }
  function ball(parent, position, scale, material) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  }
  function segment(parent, start, end, radius, material) {
    const a = new THREE.Vector3(...start),
      b = new THREE.Vector3(...end),
      direction = b.clone().sub(a);
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(
        radius,
        Math.max(0.01, direction.length()),
        6,
        12,
      ),
      material,
    );
    mesh.position.copy(a.add(b).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize(),
    );
    parent.add(mesh);
    return mesh;
  }
  function hand(pointing) {
    const group = new THREE.Group();
    ball(group, [0, 0, 0], [0.48, 0.6, 0.23], skin);
    segment(group, [0, -0.4, 0], [0.08, -1.2, -0.1], 0.28, skin);
    segment(group, [0.08, -1.12, -0.1], [0.28, -2.6, -0.3], 0.36, sleeve);
    for (let i = 0; i < 4; i++) {
      const x = -0.31 + i * 0.21;
      const points =
        pointing && i === 0
          ? [
              [x, 0.35, 0],
              [x - 0.03, 0.87, -0.05],
              [x - 0.04, 1.28, -0.1],
              [x - 0.04, 1.59, -0.13],
            ]
          : [
              [x, 0.32, 0],
              [x, 0.78, -0.05],
              [x, 0.85, 0.23],
              [x, 0.54, 0.34],
            ];
      const radius = 0.105 - (i === 3 ? 0.018 : 0);
      for (let j = 0; j < 3; j++)
        segment(group, points[j], points[j + 1], radius * (1 - j * 0.09), skin);
      const tip = points[3];
      ball(
        group,
        [tip[0], tip[1] + 0.04, tip[2] + 0.07],
        [radius * 0.63, 0.095, 0.024],
        nails,
      );
    }
    segment(group, [-0.39, -0.17, 0.06], [-0.67, 0.13, 0.15], 0.14, skin);
    segment(group, [-0.67, 0.13, 0.15], [-0.59, 0.43, 0.25], 0.12, skin);
    ball(group, [-0.59, 0.44, 0.34], [0.073, 0.1, 0.022], nails);
    return group;
  }
  const phone = new THREE.Group();
  phone.position.set(0.78, 0.12, 0);
  phone.rotation.set(-0.05, -0.12, -0.055);
  scene.add(phone);
  phone.add(slab(2.42, 4.65, 0.17, 0.28, dark));
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 512;
  screenCanvas.height = 960;
  const screenContext = screenCanvas.getContext("2d");
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.colorSpace = THREE.SRGBColorSpace;
  const screen = face(
    2.23,
    4.43,
    0.24,
    new THREE.MeshBasicMaterial({ map: screenTexture }),
  );
  screen.position.z = 0.211;
  phone.add(screen);
  const island = slab(
    0.66,
    0.15,
    0.02,
    0.07,
    new THREE.MeshBasicMaterial({ color: 0x080908 }),
  );
  island.position.set(0, 2.02, 0.221);
  phone.add(island);
  const cardCanvas = document.createElement("canvas");
  cardCanvas.width = 768;
  cardCanvas.height = 480;
  const cardTexture = new THREE.CanvasTexture(cardCanvas);
  cardTexture.colorSpace = THREE.SRGBColorSpace;
  const cardRig = new THREE.Group();
  scene.add(cardRig);
  const card = new THREE.Group();
  card.rotation.set(0.12, -0.22, 0.18);
  cardRig.add(card);
  card.add(
    slab(
      2.8,
      1.75,
      0.045,
      0.12,
      new THREE.MeshStandardMaterial({ color: 0xf2f1e9, roughness: 0.4 }),
    ),
  );
  const print = face(
    2.78,
    1.73,
    0.115,
    new THREE.MeshBasicMaterial({ map: cardTexture }),
  );
  print.position.z = 0.075;
  card.add(print);
  const holding = hand(false);
  holding.position.set(0.23, -1.3, -0.18);
  holding.rotation.set(0.05, 0.18, -0.12);
  holding.scale.setScalar(0.87);
  card.add(holding);
  const pointer = hand(true);
  pointer.position.set(2, -1.9, 1.1);
  pointer.rotation.z = -0.18;
  pointer.scale.setScalar(0.82);
  scene.add(pointer);
  function rr(ctx, x, y, w, h, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }
  function text(ctx, value, x, y, size, color = "#eeeeE7", weight = 500) {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px Arial, sans-serif`;
    ctx.fillText(value, x, y);
  }
  function drawCard() {
    const c = cardCanvas.getContext("2d");
    c.fillStyle = "#f1f0e9";
    c.fillRect(0, 0, 768, 480);
    text(c, "NFC )))", 45, 65, 25, "#1c2018", 700);
    text(c, "HELLO.", 42, 240, 86, "#252822", 700);
    text(c, "IT’S ME.", 42, 320, 86, "#252822", 700);
    for (let row = 0; row < 7; row++)
      for (let col = 0; col < 4; col++) {
        c.beginPath();
        c.arc(
          505 + col * 46 + Math.sin(row) * 12,
          70 + row * 47,
          12,
          0,
          Math.PI * 2,
        );
        c.fillStyle = (row + col) % 3 === 0 ? "#c6a9e4" : "#c9df82";
        c.fill();
      }
    text(c, t("Александр"), 460, 427, 35, "#303328", 500);
    cardTexture.needsUpdate = true;
  }
  function wrap(ctx, value, x, y, maxWidth, lineHeight, fontSize, color) {
    ctx.font = `400 ${fontSize}px Arial`;
    ctx.fillStyle = color;
    let line = "";
    for (const word of value.split(" ")) {
      const next = line ? line + " " + word : word;
      if (ctx.measureText(next).width > maxWidth) {
        ctx.fillText(line, x, y);
        y += lineHeight;
        line = word;
      } else line = next;
    }
    ctx.fillText(line, x, y);
    return y + lineHeight;
  }
  function drawScreen(stage, alpha = 1) {
    const c = screenContext;
    c.clearRect(0, 0, 512, 960);
    if (stage < 3) {
      c.fillStyle = "#c6c8bb";
      c.fillRect(0, 0, 512, 960);
      const g = c.createRadialGradient(440, 450, 0, 300, 450, 600);
      g.addColorStop(0, "#dedbdc");
      g.addColorStop(0.5, "#929e89");
      g.addColorStop(1, "#3d4a3d");
      c.fillStyle = g;
      c.fillRect(0, 0, 512, 960);
      text(c, "09:41", 85, 224, 104, "#f7f8ef", 300);
      text(c, "NFC", 219, 870, 24, "#e5ebdb", 600);
      if (stage >= 1) {
        c.save();
        c.globalAlpha = alpha;
        rr(c, 25, 78, 462, 133, 28, "#f6f5eeee");
        text(c, "NFC", 49, 119, 21, "#4c5345", 700);
        wrap(c, t("Открыть визитку"), 49, 156, 415, 30, 25, "#1c2419");
        text(c, t("Без приложения"), 49, 191, 17, "#626a59");
        c.restore();
      }
    } else {
      c.fillStyle = "#f2f3ed";
      c.fillRect(0, 0, 512, 960);
      rr(c, 0, 0, 512, 380, 0, "#e1e5d8");
      c.beginPath();
      c.arc(256, 180, 104, 0, Math.PI * 2);
      c.fillStyle = "#d8fa86";
      c.fill();
      text(c, "A", 207, 220, 114, "#283320", 500);
      text(c, t("Александр"), 35, 343, 44, "#22271c", 600);
      text(c, t("Дизайнер"), 35, 397, 24, "#526337", 400);
      const end = wrap(
        c,
        t("Визуальные решения для смелых идей."),
        35,
        453,
        430,
        35,
        24,
        "#535c49",
      );
      rr(c, 35, end + 12, 190, 50, 12, "#e3ebd1");
      text(c, "UI / UX", 65, end + 45, 22, "#425329");
      [t("Телефон"), "Instagram", "Telegram", t("Сохранить контакт")].forEach(
        (label, i) => {
          let y = 650 + i * 66;
          text(c, label, 43, y, 25, "#2c3224");
          text(c, "↗", 447, y, 26, "#617640");
          c.fillStyle = "#22222218";
          c.fillRect(35, y + 21, 442, 1);
        },
      );
    }
    rr(c, 177, 928, 158, 6, 3, stage < 3 ? "#eef3e5" : "#a4aa9a");
    screenTexture.needsUpdate = true;
  }
  let elapsed = reduced.matches ? 8 : 0,
    paused = reduced.matches,
    visible = true,
    last = 0,
    lastDraw = 0,
    stage = -1,
    frame = 0;
  const smooth = (value) => {
    value = Math.max(0, Math.min(1, value));
    return value * value * (3 - 2 * value);
  };
  function render(time) {
    frame = requestAnimationFrame(render);
    if (!visible || document.hidden) {
      last = time;
      return;
    }
    if (time - lastDraw < 33 || (paused && stage !== -1)) return;
    const dt = last ? Math.min((time - last) / 1000, 0.1) : 0;
    last = time;
    lastDraw = time;
    if (!paused) elapsed = (elapsed + dt) % 12;
    const approach =
      smooth((elapsed - 0.8) / 2.4) * (1 - smooth((elapsed - 9.6) / 1.8));
    cardRig.position.set(
      -1.75 + approach * 0.95,
      -0.6 + approach * 1.5,
      1.05 - approach * 0.48,
    );
    cardRig.rotation.z = -0.11 + approach * 0.13;
    const tap =
      smooth((elapsed - 4.4) / 1.1) * (1 - smooth((elapsed - 6.3) / 1.0));
    pointer.position.set(
      2.3 - tap * 1.18,
      -1.95 + tap * 2.06,
      1.03 - tap * 0.53,
    );
    pointer.rotation.z = -0.22 + tap * 0.15;
    const press =
      smooth((elapsed - 5.4) / 0.22) * (1 - smooth((elapsed - 5.75) / 0.2));
    pointer.position.z -= press * 0.17;
    const next = elapsed < 3.2 ? 0 : elapsed < 5.4 ? 1 : elapsed < 5.9 ? 2 : 3;
    if (next !== stage) {
      stage = next;
      drawScreen(stage);
      status.textContent = [
        "Поднеси карту",
        "Открой уведомление",
        "Коснись ссылки",
        "Твоя визитка открыта",
      ][stage];
    }
    renderer.render(scene, camera);
  }
  function resize() {
    const box = host.getBoundingClientRect();
    if (!box.width || !box.height) return;
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height;
    camera.position.z = camera.aspect < 1 ? 12.9 : 11.8;
    camera.updateProjectionMatrix();
    stage = -1;
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      last = 0;
    },
    { threshold: 0.05 },
  );
  visibilityObserver.observe(host);
  toggle.onclick = () => {
    paused = !paused;
    toggle.textContent = paused ? "Продолжить" : "Пауза";
    toggle.setAttribute("aria-pressed", String(paused));
    last = 0;
  };
  function onMotion() {
    paused = reduced.matches;
    if (paused) elapsed = 8;
    toggle.textContent = paused ? "Воспроизвести" : "Пауза";
    toggle.setAttribute("aria-pressed", String(paused));
    stage = -1;
  }
  reduced.addEventListener("change", onMotion);
  document.addEventListener("nfc-language-change", () => {
    drawCard();
    stage = -1;
  });
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    renderer.dispose();
  });
  drawCard();
  resize();
  onMotion();
  requestAnimationFrame(render);
}

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
  const cameraBase = new THREE.Vector3(0.1, 1, 11.8);
  const cameraTarget = new THREE.Vector3(0.1, 0.05, 0);
  camera.position.copy(cameraBase);
  camera.lookAt(cameraTarget);
  scene.add(new THREE.HemisphereLight(0xecf2de, 0x27232b, 2.6));
  const key = new THREE.DirectionalLight(0xffeee0, 4);
  key.position.set(-4, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc9b4ef, 3);
  rim.position.set(4, 2, -2);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xd8fa86, 0.7);
  fill.position.set(-4, -1, 1);
  scene.add(fill);

  // Two people: the phone owner and the card holder have different skin and sleeves.
  const skinMaterial = (color, sheen) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.56,
      metalness: 0,
      sheen: 0.7,
      sheenRoughness: 0.75,
      sheenColor: sheen,
    });
  const ownerSkin = skinMaterial(0xc99474, 0xffc6aa);
  const guestSkin = skinMaterial(0x9c6a4f, 0xe0a07e);
  const nails = new THREE.MeshStandardMaterial({
    color: 0xe7c7b4,
    roughness: 0.28,
  });
  const ownerSleeve = new THREE.MeshStandardMaterial({
    color: 0x30332f,
    roughness: 0.94,
  });
  const guestSleeve = new THREE.MeshStandardMaterial({
    color: 0x4a4455,
    roughness: 0.9,
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

  // Tapered capsule along +y: a smooth finger phalanx or forearm.
  function limb(length, r0, r1, flat = 1) {
    const points = [];
    for (let i = 0; i <= 6; i++) {
      const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2);
      points.push(new THREE.Vector2(Math.cos(a) * r0, Math.sin(a) * r0));
    }
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * (Math.PI / 2);
      points.push(
        new THREE.Vector2(Math.cos(a) * r1, length + Math.sin(a) * r1),
      );
    }
    const geometry = new THREE.LatheGeometry(points, 16);
    geometry.scale(1, 1, flat);
    geometry.computeVertexNormals();
    return geometry;
  }
  // Rounded, slightly domed palm that narrows toward the wrist.
  function palmGeometry() {
    const geometry = new THREE.SphereGeometry(1, 32, 24);
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const box = (v) => Math.sign(v) * Math.abs(v) ** 0.55;
      const y = box(p.getY(i));
      const k = (y + 1) / 2;
      p.setXYZ(
        i,
        box(p.getX(i)) * 0.44 * (0.82 + 0.18 * k),
        y * 0.5,
        p.getZ(i) * (0.13 + 0.05 * Math.sin(Math.PI * k)),
      );
    }
    geometry.computeVertexNormals();
    return geometry;
  }
  function chain(parent, base, lengths, radius, skin) {
    const joints = [];
    let joint = new THREE.Group();
    joint.position.set(...base);
    parent.add(joint);
    lengths.forEach((length, i) => {
      joints.push(joint);
      const r0 = radius * (1 - i * 0.1),
        r1 = radius * (1 - (i + 1) * 0.1);
      joint.add(new THREE.Mesh(limb(length, r0, r1, 0.86), skin));
      if (i === lengths.length - 1) {
        const nail = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), nails);
        nail.position.set(0, length * 0.62, r1 * 0.66);
        nail.scale.set(r1 * 0.78, length * 0.4, r1 * 0.3);
        joint.add(nail);
        joints.tip = new THREE.Object3D();
        joints.tip.position.set(0, length + r1 * 0.6, -r1 * 0.35);
        joint.add(joints.tip);
      } else {
        const next = new THREE.Group();
        next.position.y = length;
        joint.add(next);
        joint = next;
      }
    });
    return joints;
  }
  // Right hand in local space: fingers +y, back of the hand and nails toward +z.
  function hand(skin, sleeve) {
    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);
    body.add(new THREE.Mesh(palmGeometry(), skin));
    const fingers = [
      [-0.3, 0.44, [0.4, 0.26, 0.2], 0.1],
      [-0.1, 0.48, [0.45, 0.29, 0.21], 0.104],
      [0.1, 0.46, [0.42, 0.27, 0.2], 0.097],
      [0.29, 0.4, [0.32, 0.2, 0.17], 0.084],
    ].map(([x, y, lengths, radius]) =>
      chain(body, [x, y, 0.01], lengths, radius, skin),
    );
    const thenar = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), skin);
    thenar.position.set(-0.3, -0.18, -0.05);
    thenar.scale.set(0.2, 0.3, 0.14);
    body.add(thenar);
    const thumbBase = new THREE.Group();
    thumbBase.position.set(-0.36, -0.22, -0.03);
    thumbBase.rotation.set(0.1, -0.7, 0.85);
    body.add(thumbBase);
    const thumb = chain(thumbBase, [0, 0, 0], [0.34, 0.27, 0.22], 0.125, skin);
    const arm = new THREE.Mesh(limb(2.4, 0.25, 0.34, 0.78), skin);
    arm.rotation.z = Math.PI;
    arm.position.y = -0.32;
    body.add(arm);
    const cuff = new THREE.Mesh(limb(3.2, 0.39, 0.45, 0.88), sleeve);
    cuff.rotation.z = Math.PI;
    cuff.position.y = -1.15;
    body.add(cuff);
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.05, 10, 28), sleeve);
    rib.rotation.x = Math.PI / 2;
    rib.scale.set(1, 0.86, 1);
    rib.position.y = -1.18;
    body.add(rib);
    return { root, body, fingers, thumb, thumbBase };
  }
  // curl: index, middle, ring, little (0 straight, 1 fist); thumb: 0 open, 1 folded.
  function pose(h, curl, thumb, spread = 0) {
    h.fingers.forEach((joints, i) => {
      joints.forEach(
        (joint, k) => (joint.rotation.x = -curl[i] * [1.0, 1.45, 1.05][k]),
      );
      joints[0].rotation.z = (1.5 - i) * 0.07 * spread;
    });
    h.thumb.forEach(
      (joint, k) => (joint.rotation.x = -thumb * [0.35, 0.75, 0.85][k]),
    );
  }

  const phoneRig = new THREE.Group();
  scene.add(phoneRig);
  const phone = new THREE.Group();
  phoneRig.add(phone);
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

  // The owner's left hand cradles the phone from below: fingers behind, thumb over the bottom edge.
  const holder = hand(ownerSkin, ownerSleeve);
  holder.root.scale.set(-0.9, 0.9, 0.9);
  holder.root.position.set(0.1, -2.35, -0.22);
  holder.root.rotation.set(0.08, Math.PI, 0.25);
  holder.thumbBase.rotation.set(-0.3, -1.3, 0.6);
  phoneRig.add(holder.root);

  // NFC field rings around the contact point on the back of the phone.
  const rings = [0, 1, 2].map(() => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.94, 1, 64),
      new THREE.MeshBasicMaterial({
        color: 0xd8fa86,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    ring.position.set(-0.55, 1.45, -0.12);
    phone.add(ring);
    return ring;
  });

  const cardCanvas = document.createElement("canvas");
  cardCanvas.width = 768;
  cardCanvas.height = 480;
  const cardTexture = new THREE.CanvasTexture(cardCanvas);
  cardTexture.colorSpace = THREE.SRGBColorSpace;
  const cardRig = new THREE.Group();
  scene.add(cardRig);
  const card = new THREE.Group();
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
  // The guest pinches the lower-left corner: fingers over the print, thumb behind.
  const guest = hand(guestSkin, guestSleeve);
  guest.root.scale.setScalar(0.86);
  guest.root.position.set(-1.3, -0.95, 0.16);
  guest.root.rotation.set(0, 0.35, -0.9);
  card.add(guest.root);

  // The owner's right hand taps and scrolls with the index finger.
  const pointer = hand(ownerSkin, ownerSleeve);
  pointer.root.scale.setScalar(0.84);
  scene.add(pointer.root);

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
  function drawLock(c, ui) {
    c.fillStyle = "#c6c8bb";
    c.fillRect(0, 0, 512, 960);
    const g = c.createRadialGradient(440, 450, 0, 300, 450, 600);
    g.addColorStop(0, "#dedbdc");
    g.addColorStop(0.5, "#929e89");
    g.addColorStop(1, "#3d4a3d");
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 960);
    text(c, "09:41", 85, 224 + ui.notice * 150, 104, "#f7f8ef", 300);
    text(c, "NFC", 219, 870, 24, "#e5ebdb", 600);
    if (ui.notice > 0) {
      c.save();
      c.globalAlpha = Math.min(1, ui.notice * 1.4);
      c.translate(0, (ui.notice - 1) * 150);
      const scale = 1 - ui.pressed * 0.03;
      c.translate(256, 145);
      c.scale(scale, scale);
      c.translate(-256, -145);
      rr(c, 25, 78, 462, 133, 28, ui.pressed ? "#e5e8dcee" : "#f6f5eeee");
      text(c, "NFC", 49, 119, 21, "#4c5345", 700);
      text(c, "now", 420, 119, 18, "#7a8270", 400);
      wrap(c, t("Открыть визитку"), 49, 156, 415, 30, 25, "#1c2419");
      text(c, t("Без приложения"), 49, 191, 17, "#626a59");
      c.restore();
    }
  }
  function drawProfile(c, scroll) {
    c.fillStyle = "#f2f3ed";
    c.fillRect(0, 0, 512, 960);
    c.save();
    c.translate(0, -scroll);
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
    [
      t("Телефон"),
      "Instagram",
      "Telegram",
      "WhatsApp",
      "Email",
      t("Сохранить контакт"),
    ].forEach((label, i) => {
      const y = 650 + i * 66;
      text(c, label, 43, y, 25, "#2c3224");
      text(c, "↗", 447, y, 26, "#617640");
      c.fillStyle = "#22222218";
      c.fillRect(35, y + 21, 442, 1);
    });
    c.restore();
  }
  function drawScreen(ui) {
    const c = screenContext;
    c.clearRect(0, 0, 512, 960);
    if (ui.open < 1) drawLock(c, ui);
    if (ui.open > 0) {
      // The profile slides up over the lock screen like an opening app.
      c.save();
      c.translate(0, (1 - ui.open) * 960);
      c.globalAlpha = Math.min(1, ui.open * 2);
      drawProfile(c, ui.scroll);
      c.restore();
    }
    if (ui.ripple > 0 && ui.ripple < 1) {
      c.beginPath();
      c.arc(ui.rippleX, ui.rippleY, 18 + ui.ripple * 70, 0, Math.PI * 2);
      c.fillStyle = `rgba(40, 52, 30, ${0.22 * (1 - ui.ripple)})`;
      c.fill();
    }
    rr(c, 177, 928, 158, 6, 3, ui.open < 0.5 ? "#eef3e5" : "#a4aa9a");
    if (ui.dim > 0) {
      c.fillStyle = `rgba(4, 5, 4, ${ui.dim})`;
      c.fillRect(0, 0, 512, 960);
    }
    screenTexture.needsUpdate = true;
  }

  const LOOP = 12;
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const smooth = (value) => {
    value = clamp(value);
    return value * value * (3 - 2 * value);
  };
  const span = (time, from, to) => clamp((time - from) / (to - from));
  const bell = (time, from, to) => Math.sin(Math.PI * span(time, from, to));
  // Settles slightly past the target, like a hand stopping a movement.
  const settle = (value) => {
    value = clamp(value) - 1;
    return 1 + 2.1 * value ** 3 + 1.1 * value ** 2;
  };
  // Sum of incommensurate waves: continuous, organic micro-movement.
  const drift = (seed, time) =>
    Math.sin(time * 0.83 + seed) * 0.55 +
    Math.sin(time * 1.97 + seed * 1.7) * 0.3 +
    Math.sin(time * 4.41 + seed * 2.9) * 0.15;
  const lerp = (a, b, k) => a + (b - a) * k;
  const phoneLocal = (x, y, z) => new THREE.Vector3(x, y, z);

  // Fingertip path in phone space: [time, point]. Screen surface is z≈0.3.
  const rest = phoneLocal(3.4, -4.6, 1.8);
  const notice = phoneLocal(-0.42, 1.52, 0.3);
  const scrollStart = phoneLocal(0.12, -0.35, 0.3);
  const scrollEnd = phoneLocal(0.2, 0.95, 0.3);
  const lift = (point, height = 0.42) =>
    point.clone().add(new THREE.Vector3(0.1, -0.22, height));
  const fingerPath = [
    [0, rest],
    [4.1, rest],
    [5.25, lift(notice)],
    [5.42, notice],
    [5.62, notice],
    [5.9, lift(notice, 0.3)],
    [6.3, lift(scrollStart, 0.25)],
    [6.5, scrollStart],
    [7.3, scrollEnd],
    [7.55, lift(scrollEnd, 0.35)],
    [7.9, lift(scrollEnd, 0.4)],
    [9.3, rest],
    [LOOP, rest],
  ];
  function fingerAt(time) {
    for (let i = 1; i < fingerPath.length; i++) {
      const [end, to] = fingerPath[i];
      if (time <= end) {
        const [start, from] = fingerPath[i - 1];
        return from.clone().lerp(to, smooth(span(time, start, end)));
      }
    }
    return rest.clone();
  }
  const touching = (time) =>
    (time >= 5.42 && time <= 5.62) || (time >= 6.5 && time <= 7.3);

  const cardStart = new THREE.Vector3(-4.4, -3.1, 1.5);
  const cardAway = new THREE.Vector3(-3.4, -5.6, 0.4);
  const cardContact = phoneLocal(-1.02, 1.5, -0.3);
  const worldPoint = new THREE.Vector3();
  const tipPoint = new THREE.Vector3();
  const pointerVector = { x: 0, y: 0 };
  const cameraOffset = { x: 0, y: 0 };

  let elapsed = 0,
    life = 0,
    paused = false,
    visible = true,
    last = 0,
    lastDraw = 0,
    stage = -1,
    screenKey = "",
    needsDraw = true,
    frame = 0;
  const frameInterval = (navigator.hardwareConcurrency || 8) <= 4 ? 33 : 16;

  function update(time, alive) {
    // Phone: held in a living hand — breathing, drift, a buzz on contact, a push on tap.
    const buzz = bell(time, 3.2, 3.55);
    const press = bell(time, 5.4, 5.68);
    phoneRig.position.set(
      0.78 + drift(1, alive) * 0.035 + Math.sin(time * 140) * 0.014 * buzz,
      0.12 + drift(2, alive) * 0.04 + Math.sin(alive * 1.6) * 0.018,
      drift(3, alive) * 0.03 - press * 0.05,
    );
    phoneRig.rotation.set(
      -0.05 + drift(4, alive) * 0.018 - press * 0.025,
      -0.12 + drift(5, alive) * 0.025,
      -0.055 + drift(6, alive) * 0.014,
    );
    pose(
      holder,
      [0.04 + drift(7, alive) * 0.02, 0.05, 0.06, 0.08],
      0.1 + press * 0.08,
      0.3,
    );
    phoneRig.updateMatrixWorld(true);

    // Card: swings in behind the phone, hunts for the antenna, holds, then leaves.
    const approach = settle(span(time, 0.6, 2.7));
    const depth = smooth(span(time, 0.6, 1.8));
    const hunt = bell(time, 2.5, 3.2);
    const leave = smooth(span(time, 4.7, 6.3));
    worldPoint.copy(cardContact);
    worldPoint.x += Math.sin(time * 9) * 0.06 * hunt;
    worldPoint.y += Math.cos(time * 7) * 0.05 * hunt;
    worldPoint.z -= bell(time, 3.15, 4.6) * 0.03;
    phone.localToWorld(worldPoint);
    const inside = new THREE.Vector3(
      lerp(cardStart.x, worldPoint.x, approach),
      lerp(cardStart.y, worldPoint.y, approach),
      lerp(cardStart.z, worldPoint.z, depth),
    );
    cardRig.position.copy(inside.lerp(cardAway, leave));
    cardRig.position.x += drift(8, alive) * 0.03;
    cardRig.position.y += drift(9, alive) * 0.035;
    const turn = 1 - smooth(span(time, 0.6, 2.6)) + leave;
    card.rotation.set(
      0.06 + turn * 0.4 + drift(10, alive) * 0.02,
      -0.1 + turn * 0.55 + drift(11, alive) * 0.03,
      0.14 + turn * 0.35 + drift(12, alive) * 0.02,
    );
    pose(guest, [0.5, 0.55, 0.6, 0.66], 0.35 + hunt * 0.1, 0.4);

    // Pointer: index extends on the way in, taps, then drags the profile upward.
    const enter = smooth(span(time, 4.1, 5.2));
    const exit = smooth(span(time, 7.9, 9.2));
    const reach = enter * (1 - exit);
    const contact = touching(time) ? 1 : 0;
    pose(
      pointer,
      [
        lerp(0.55, 0.06, reach) + bell(time, 5.42, 5.62) * 0.16,
        lerp(0.7, 0.92, reach),
        lerp(0.75, 1.0, reach),
        lerp(0.8, 1.05, reach),
      ],
      0.55,
      0.2,
    );
    pointer.root.rotation.set(
      -0.42 + contact * 0.06 + drift(13, alive) * 0.03,
      0.18 + drift(14, alive) * 0.04,
      0.42 - bell(time, 6.5, 7.3) * 0.08 + drift(15, alive) * 0.03,
    );
    worldPoint.copy(fingerAt(time));
    if (!contact) {
      worldPoint.x += drift(16, alive) * 0.03 * reach;
      worldPoint.y += drift(17, alive) * 0.03 * reach;
    }
    phone.localToWorld(worldPoint);
    // Place the hand so the fingertip lands exactly on the path (simple IK by translation).
    pointer.root.position.copy(worldPoint);
    pointer.root.updateMatrixWorld(true);
    pointer.fingers[0].tip.getWorldPosition(tipPoint);
    pointer.root.position.add(worldPoint.sub(tipPoint));

    rings.forEach((ring, i) => {
      const k = span(time, 3.2 + i * 0.28, 4.3 + i * 0.28);
      ring.visible = k > 0 && k < 1;
      ring.scale.setScalar(0.25 + smooth(k) * 1.9);
      ring.material.opacity = 0.5 * (1 - k) * Math.min(1, k * 8);
    });

    const tapRipple = span(time, 5.42, 5.95);
    const ui = {
      notice: smooth(span(time, 3.35, 3.75)),
      pressed: time >= 5.42 && time <= 5.7 ? 1 : 0,
      open: smooth(span(time, 5.7, 6.15)),
      scroll: Math.round(smooth(span(time, 6.5, 7.3)) * 210),
      ripple: tapRipple > 0 ? tapRipple : 0,
      rippleX: 150,
      rippleY: 150,
      dim:
        smooth(span(time, 11.2, 11.9)) * 0.92 +
        (1 - smooth(span(time, 0, 0.4))) * 0.92,
    };
    ui.dim = Math.min(0.92, ui.dim);
    const nextKey = [
      ui.notice.toFixed(2),
      ui.pressed,
      ui.open.toFixed(2),
      ui.scroll,
      ui.ripple.toFixed(2),
      ui.dim.toFixed(2),
    ].join();
    if (nextKey !== screenKey) {
      screenKey = nextKey;
      drawScreen(ui);
    }
    const next = time < 3.35 ? 0 : time < 5.42 ? 1 : time < 5.7 ? 2 : 3;
    if (next !== stage) {
      stage = next;
      status.textContent = [
        "Поднеси карту",
        "Открой уведомление",
        "Коснись ссылки",
        "Твоя визитка открыта",
      ][stage];
    }

    // Gentle parallax toward the visitor's pointer.
    cameraOffset.x = lerp(cameraOffset.x, pointerVector.x, 0.06);
    cameraOffset.y = lerp(cameraOffset.y, pointerVector.y, 0.06);
    camera.position.set(
      cameraBase.x + cameraOffset.x * 0.5 + Math.sin(alive * 0.21) * 0.08,
      cameraBase.y - cameraOffset.y * 0.3,
      camera.position.z,
    );
    camera.lookAt(cameraTarget);
  }

  function render(time) {
    frame = requestAnimationFrame(render);
    if (!visible || document.hidden) {
      last = time;
      return;
    }
    if (time - lastDraw < frameInterval || (paused && !needsDraw)) return;
    const dt = last ? Math.min((time - last) / 1000, 0.1) : 0;
    last = time;
    lastDraw = time;
    if (!paused) {
      elapsed = (elapsed + dt) % LOOP;
      life += dt;
    }
    needsDraw = false;
    update(elapsed, life);
    renderer.render(scene, camera);
  }
  function resize() {
    const box = host.getBoundingClientRect();
    if (!box.width || !box.height) return;
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height;
    camera.position.z = camera.aspect < 1 ? 12.9 : 11.8;
    camera.updateProjectionMatrix();
    screenKey = "";
    needsDraw = true;
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
  host.addEventListener("pointermove", (event) => {
    if (reduced.matches || event.pointerType !== "mouse") return;
    const box = host.getBoundingClientRect();
    pointerVector.x = ((event.clientX - box.left) / box.width) * 2 - 1;
    pointerVector.y = ((event.clientY - box.top) / box.height) * 2 - 1;
  });
  host.addEventListener("pointerleave", () => {
    pointerVector.x = 0;
    pointerVector.y = 0;
  });
  toggle.onclick = () => {
    paused = !paused;
    toggle.textContent = paused ? "Продолжить" : "Пауза";
    toggle.setAttribute("aria-pressed", String(paused));
    last = 0;
    needsDraw = true;
  };
  function onMotion() {
    paused = reduced.matches;
    // A still frame that tells the whole story: card detected, finger opening the card.
    if (paused) elapsed = 5.5;
    toggle.textContent = paused ? "Воспроизвести" : "Пауза";
    toggle.setAttribute("aria-pressed", String(paused));
    stage = -1;
    needsDraw = true;
  }
  reduced.addEventListener("change", onMotion);
  document.addEventListener("nfc-language-change", () => {
    drawCard();
    screenKey = "";
    stage = -1;
    needsDraw = true;
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

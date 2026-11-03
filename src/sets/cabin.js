// The Keddie Cabin 28 set — built entirely in code.
// Coordinates:
//   Origin (x 0, z 0): Cabin 28 living room & front porch.
//   Surroundings: Sierra Nevada pine forest (tall evergreen trees, dark mountain terrain).
//   Back room: Hallway and children's bedroom (z 4.2 .. 8.5).
//   Remote clearing (Feather Falls / Demolished site): offset OX = 50.
import * as THREE from 'three';
import { floorPlanks, walnut, wallpaper, rug, glow } from '../core/tex.js';
import { asphalt, brick, paintWall } from '../core/tex2.js';

export const OX = 50; // remote clearing offset
const CEIL = 2.7;

export const CABIN = {
  CEIL,
  door: { x: 0.15, w: 0.95, h: 2.1, z: -2.8, hinge: -0.32 },
  phoneBox: new THREE.Vector3(-2.2, 1.4, -2.96),
  wireCut: new THREE.Vector3(-2.2, 1.15, -2.96),
  lamp: new THREE.Vector3(-0.2, 0.92, 1.05),
  bedBoys: new THREE.Vector3(-1.6, 0.45, 6.2),
  bedTina: new THREE.Vector3(1.6, 0.45, 6.2),
  table: new THREE.Vector3(-0.2, 0.42, 1.05),
  clearing: new THREE.Vector3(OX, 0, 0),
};

function scaleUV(g, su, sv) {
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  return g;
}

function boxGeo(w, h, d, tile = 0.6) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile);
    }
  }
  return g;
}

export function buildCabin(scene, renderer) {
  const root = new THREE.Group();
  scene.add(root);

  const add = (m, cast = true, recv = true, parent = root) => {
    m.castShadow = cast;
    m.receiveShadow = recv;
    parent.add(m);
    return m;
  };

  const box = (w, h, d, mat, x, y, z, o = {}) => {
    const m = add(new THREE.Mesh(boxGeo(w, h, d, o.tile ?? 0.6), mat), o.cast ?? true, o.recv ?? true, o.parent ?? root);
    m.position.set(x, y, z);
    if (o.ry) m.rotation.y = o.ry;
    if (o.rx) m.rotation.x = o.rx;
    if (o.rz) m.rotation.z = o.rz;
    return m;
  };

  const plane = (w, h, mat, x, y, z, o = {}) => {
    const m = add(new THREE.Mesh(scaleUV(new THREE.PlaneGeometry(w, h), o.su ?? 1, o.sv ?? 1), mat), false, o.recv ?? true, o.parent ?? root);
    m.position.set(x, y, z);
    m.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0);
    if (o.order != null) m.renderOrder = o.order;
    return m;
  };

  // ==================== MATERIALS ====================
  const fl = floorPlanks(3);
  const wDark = walnut(5, { dark: 0.65 });
  const wLight = walnut(12, { dark: 0.85 });
  const wSiding = walnut(21, { dark: 0.55, stretch: 28 });
  const wTrunk = walnut(42, { dark: 0.45, stretch: 36 });

  const M = {
    floor: new THREE.MeshStandardMaterial({
      map: fl.map,
      roughnessMap: fl.rough,
      roughness: 0.95,
      metalness: 0,
      transparent: true,
      opacity: 0.84,
    }),
    siding: new THREE.MeshStandardMaterial({
      map: wSiding.map,
      roughnessMap: wSiding.rough,
      roughness: 0.88,
      color: 0x6e523e,
    }),
    sidingOut: new THREE.MeshStandardMaterial({
      map: wSiding.map,
      roughnessMap: wSiding.rough,
      roughness: 0.92,
      color: 0x3d2b20,
    }),
    trim: new THREE.MeshStandardMaterial({
      map: wDark.map,
      roughnessMap: wDark.rough,
      roughness: 0.82,
      color: 0x302118,
    }),
    ground: new THREE.MeshStandardMaterial({
      color: 0x0c0f0a,
      roughness: 0.98,
      metalness: 0.05,
    }),
    pineBark: new THREE.MeshStandardMaterial({
      map: wTrunk.map,
      roughnessMap: wTrunk.rough,
      roughness: 0.95,
      color: 0x221610,
    }),
    needles: new THREE.MeshStandardMaterial({
      color: 0x0c1a10,
      roughness: 0.96,
      metalness: 0.02,
    }),
    cloth: new THREE.MeshStandardMaterial({
      color: 0x252320,
      roughness: 0.95,
    }),
    drape: new THREE.MeshStandardMaterial({
      color: 0x181412,
      roughness: 0.92,
    }),
    blanket: new THREE.MeshStandardMaterial({
      color: 0xc8bc9f,
      roughness: 0.85,
    }),
    brass: new THREE.MeshStandardMaterial({
      color: 0xba9248,
      metalness: 0.8,
      roughness: 0.35,
    }),
    shade: new THREE.MeshStandardMaterial({
      color: 0xf2e2be,
      emissive: 0xf2e2be,
      emissiveIntensity: 0.85,
      roughness: 0.9,
    }),
    evidence: new THREE.MeshStandardMaterial({
      color: 0xf4ec1c,
      roughness: 0.4,
    }),
    wire: new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.6,
    }),
    metalBox: new THREE.MeshStandardMaterial({
      color: 0x444b46,
      metalness: 0.7,
      roughness: 0.4,
    }),
  };

  // ==================== ENVIRONMENT & SKY ====================
  const envBox = new THREE.BoxGeometry(60, 60, 60);
  const envMat = new THREE.MeshBasicMaterial({ color: 0x020306, side: THREE.BackSide });
  const envMesh = new THREE.Mesh(envBox, envMat);
  const envScene = new THREE.Scene();
  envScene.add(envMesh);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(envScene).texture;
  pmrem.dispose();

  // ==================== 1. CABIN STRUCTURE ====================
  // Ground around cabin
  plane(40, 40, M.ground, 0, -0.01, 2, { rx: -Math.PI / 2, su: 8, sv: 8 });

  // Living room floor (y = 0)
  const fL = plane(7.4, 7.2, M.floor, 0, 0, 0.7, { rx: -Math.PI / 2, su: 3, sv: 3, order: 2 });
  fL.receiveShadow = true;

  // Bedroom floor (z = 4.2 .. 8.4)
  const fB = plane(7.4, 4.2, M.floor, 0, 0, 6.3, { rx: -Math.PI / 2, su: 3, sv: 2, order: 2 });
  fB.receiveShadow = true;

  // Ceiling
  plane(7.4, 11.4, M.trim, 0, CEIL, 2.8, { rx: Math.PI / 2, su: 4, sv: 6 });
  // Ceiling timber beams
  for (let bz = -2.5; bz <= 8.0; bz += 1.8) {
    box(7.5, 0.16, 0.22, M.trim, 0, CEIL - 0.08, bz);
  }

  // --- Walls ---
  // Left wall (x = -3.7, faces +x)
  box(0.18, CEIL, 11.4, M.siding, -3.7, CEIL / 2, 2.8, { tile: 1.5 });
  // Right wall (x = +3.7, faces -x)
  box(0.18, CEIL, 11.4, M.siding, 3.7, CEIL / 2, 2.8, { tile: 1.5 });
  // Back wall of bedroom (z = 8.5)
  box(7.4, CEIL, 0.18, M.siding, 0, CEIL / 2, 8.5, { tile: 1.5 });

  // Partition wall between Living room and Bedroom (z = 4.2) with central hallway opening
  const P_LEFT_W = 2.6, P_RIGHT_W = 3.2, P_GAP = 1.6;
  box(P_LEFT_W, CEIL, 0.16, M.siding, -2.4, CEIL / 2, 4.2);
  box(P_RIGHT_W, CEIL, 0.16, M.siding, 2.1, CEIL / 2, 4.2);
  box(P_GAP, 0.5, 0.16, M.siding, 0, CEIL - 0.25, 4.2);

  // Front Wall (z = -2.8) with front door opening (x = 0.15, w = 0.95, h = 2.1)
  const D = CABIN.door;
  const wl = D.x - D.w / 2, wr = D.x + D.w / 2;
  box(wl - (-3.7), CEIL, 0.2, M.sidingOut, (-3.7 + wl) / 2, CEIL / 2, D.z, { tile: 1.5 });
  box(3.7 - wr, CEIL, 0.2, M.sidingOut, (3.7 + wr) / 2, CEIL / 2, D.z, { tile: 1.5 });
  box(D.w, CEIL - D.h, 0.2, M.sidingOut, D.x, (CEIL + D.h) / 2, D.z);

  // Door frame casing
  box(0.08, D.h + 0.08, 0.24, M.trim, wl - 0.03, (D.h + 0.08) / 2, D.z);
  box(0.08, D.h + 0.08, 0.24, M.trim, wr + 0.03, (D.h + 0.08) / 2, D.z);
  box(D.w + 0.14, 0.08, 0.24, M.trim, D.x, D.h + 0.04, D.z);

  // --- Front Door (hinged on left, swings into room) ---
  const frontDoor = new THREE.Group();
  frontDoor.position.set(D.hinge, 0, D.z + 0.04);
  root.add(frontDoor);
  const doorPanel = box(D.w, D.h, 0.05, M.trim, D.w / 2, D.h / 2, 0, { parent: frontDoor });
  const knob = add(new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 12), M.brass), true, true, frontDoor);
  knob.position.set(D.w - 0.08, 0.98, 0.05);

  // --- Front Porch ---
  // Deck planks at y = 0.06
  box(6.2, 0.12, 2.2, M.trim, 0, 0.06, -3.9);
  // Porch roof overhang
  box(6.4, 0.15, 2.4, M.trim, 0, 2.55, -3.9);
  // Porch posts
  box(0.14, 2.5, 0.14, M.trim, -2.8, 1.25, -4.8);
  box(0.14, 2.5, 0.14, M.trim, 2.8, 1.25, -4.8);
  // Porch steps
  box(2.2, 0.1, 0.4, M.trim, 0, 0.02, -5.15);

  // --- Telephone Box on Exterior Siding ---
  const phoneBox = box(0.24, 0.32, 0.12, M.metalBox, CABIN.phoneBox.x, CABIN.phoneBox.y, CABIN.phoneBox.z);
  // Wire leading from roof down to box
  const wireTop = box(0.015, 1.1, 0.015, M.wire, CABIN.phoneBox.x, CABIN.phoneBox.y + 0.65, CABIN.phoneBox.z);
  // Cut wire dangling down
  const wireCutBottom = box(0.015, 0.45, 0.015, M.wire, CABIN.wireCut.x, CABIN.wireCut.y - 0.25, CABIN.wireCut.z);
  wireCutBottom.rotation.z = 0.12;

  // --- Living Room Props ---
  // Table
  const table = box(1.3, 0.42, 0.75, M.trim, CABIN.table.x, CABIN.table.y / 2, CABIN.table.z);
  // Sofa
  const sofa = new THREE.Group();
  sofa.position.set(-1.8, 0, 1.2);
  sofa.rotation.y = Math.PI / 2;
  root.add(sofa);
  box(2.0, 0.45, 0.85, M.cloth, 0, 0.25, 0, { parent: sofa });
  box(2.0, 0.55, 0.25, M.cloth, 0, 0.55, -0.32, { parent: sofa }); // backrest
  box(0.25, 0.4, 0.85, M.cloth, -0.9, 0.45, 0, { parent: sofa }); // arm L
  box(0.25, 0.4, 0.85, M.cloth, 0.9, 0.45, 0, { parent: sofa }); // arm R

  // Table Lamp
  const lampRoot = new THREE.Group();
  lampRoot.position.copy(CABIN.lamp);
  root.add(lampRoot);
  const lampBase = add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.24, 16), M.brass), true, false, lampRoot);
  lampBase.position.y = 0.12;
  const lampShade = add(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.26, 20), M.shade), true, false, lampRoot);
  lampShade.position.y = 0.32;

  const tlamp = new THREE.PointLight(0xffc68c, 2.2, 7.5, 1.8);
  tlamp.position.set(0, 0.35, 0);
  tlamp.castShadow = true;
  tlamp.shadow.mapSize.set(512, 512);
  tlamp.shadow.bias = -0.003;
  lampRoot.add(tlamp);

  // Porch amber lantern
  const porchLamp = new THREE.PointLight(0xffa255, 1.4, 9, 2);
  porchLamp.position.set(0, 2.3, -3.8);
  porchLamp.castShadow = false;
  root.add(porchLamp);

  // Subtle accent light on exterior phone junction box
  const phoneLamp = new THREE.PointLight(0xffcaa0, 1.1, 4.5, 2);
  phoneLamp.position.set(-2.2, 1.6, -3.4);
  phoneLamp.castShadow = false;
  root.add(phoneLamp);

  // Cold moonlight / exterior fill
  const moon = new THREE.DirectionalLight(0x223652, 0.35);
  moon.position.set(-8, 14, -10);
  moon.castShadow = false;
  root.add(moon);

  // Soft ambient fill
  const hemi = new THREE.HemisphereLight(0x1a2432, 0x080806, 0.16);
  root.add(hemi);

  // --- Bedroom Props ---
  // Bed 1 (Boys' bed on left: x = -1.8, z = 6.2)
  const bed1 = new THREE.Group();
  bed1.position.set(-1.8, 0, 6.2);
  root.add(bed1);
  box(1.2, 0.45, 2.0, M.trim, 0, 0.22, 0, { parent: bed1, cast: false });
  box(1.15, 0.16, 1.9, M.blanket, 0, 0.48, 0, { parent: bed1, cast: false });
  box(1.2, 0.85, 0.1, M.trim, 0, 0.45, 0.95, { parent: bed1, cast: false }); // headboard

  // Bed 2 (Tina's bed on right: x = 1.8, z = 6.2)
  const bed2 = new THREE.Group();
  bed2.position.set(1.8, 0, 6.2);
  root.add(bed2);
  box(1.2, 0.45, 2.0, M.trim, 0, 0.22, 0, { parent: bed2, cast: false });
  const tinaBlanket = box(1.15, 0.14, 1.6, M.blanket, 0, 0.46, -0.15, { parent: bed2, cast: false });
  tinaBlanket.rotation.y = 0.08;
  box(0.55, 0.12, 0.35, M.cloth, 0, 0.52, 0.7, { parent: bed2, cast: false }); // pillow
  box(1.2, 0.85, 0.1, M.trim, 0, 0.45, 0.95, { parent: bed2, cast: false }); // headboard

  // Bedroom dim night light
  const bedLamp = new THREE.PointLight(0x7090b0, 0.35, 6, 2);
  bedLamp.position.set(0, 2.1, 6.2);
  bedLamp.castShadow = false;
  root.add(bedLamp);

  // --- Forensic Evidence Markers (tent cards) ---
  const evidenceGroup = new THREE.Group();
  evidenceGroup.visible = false;
  root.add(evidenceGroup);

  const makeEvidenceTent = (num, x, z, ry = 0) => {
    const tent = new THREE.Group();
    tent.position.set(x, 0.01, z);
    tent.rotation.y = ry;
    evidenceGroup.add(tent);

    const g = new THREE.ConeGeometry(0.12, 0.16, 3);
    const m = new THREE.Mesh(g, M.evidence);
    m.rotation.y = Math.PI / 6;
    m.position.y = 0.08;
    tent.add(m);
    return tent;
  };

  const ev1 = makeEvidenceTent('1', -0.6, 1.8, 0.3);
  const ev2 = makeEvidenceTent('2', 0.8, 0.4, -0.4);
  const ev3 = makeEvidenceTent('3', -1.2, -0.5, 0.1);

  // Overturned stool / chair in living room
  const overturnedChair = new THREE.Group();
  overturnedChair.position.set(0.6, 0.18, 1.6);
  overturnedChair.rotation.set(1.4, 0.3, 0.8);
  evidenceGroup.add(overturnedChair);
  box(0.42, 0.06, 0.42, M.trim, 0, 0, 0, { parent: overturnedChair });
  for (const [lx, lz] of [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]) {
    box(0.04, 0.42, 0.04, M.trim, lx, -0.21, lz, { parent: overturnedChair });
  }

  // ==================== 2. PINE FOREST TREES ====================
  const treeGroup = new THREE.Group();
  root.add(treeGroup);

  function makePineTree(x, z, scale = 1.0) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.set(scale, scale, scale);
    treeGroup.add(tree);

    // Trunk
    const trunkH = 8.5;
    const trunkG = new THREE.CylinderGeometry(0.2, 0.32, trunkH, 6);
    const trunk = add(new THREE.Mesh(trunkG, M.pineBark), false, true, tree);
    trunk.position.y = trunkH / 2;

    // Conical needle layers (3 clean silhouette layers)
    const layers = [
      { y: 4.2, r: 2.1, h: 3.2 },
      { y: 6.5, r: 1.5, h: 2.8 },
      { y: 8.4, r: 0.9, h: 2.2 },
    ];
    for (const lyr of layers) {
      const coneG = new THREE.ConeGeometry(lyr.r, lyr.h, 6);
      const cone = add(new THREE.Mesh(coneG, M.needles), false, true, tree);
      cone.position.y = lyr.y;
    }
    return tree;
  }

  // Cluster pine trees around cabin perimeter
  const treePositions = [
    [-6.5, -7.5, 1.2], [-4.2, -8.2, 0.9], [4.5, -8.0, 1.1], [7.2, -6.8, 1.3],
    [-7.8, -2.5, 1.15], [-8.2, 2.5, 1.0], [-7.5, 7.5, 1.25],
    [7.8, -1.8, 1.1], [8.2, 3.2, 1.3], [7.6, 8.0, 1.15],
    [-3.5, 11.2, 1.2], [0.5, 12.0, 1.35], [4.2, 11.5, 1.1],
    [-11.0, -5.0, 1.4], [11.5, -4.5, 1.3],
  ];
  for (const [tx, tz, ts] of treePositions) {
    makePineTree(tx, tz, ts);
  }

  // ==================== 3. REMOTE CLEARING / DEMOLISHED SITE (OX = 50) ====================
  const clearingGroup = new THREE.Group();
  clearingGroup.position.set(OX, 0, 0);
  root.add(clearingGroup);

  // Clearing ground
  plane(36, 36, M.ground, 0, -0.01, 0, { parent: clearingGroup, rx: -Math.PI / 2, su: 6, sv: 6 });
  // Demolished foundation outline (dirt patch where Cabin 28 once stood)
  const dirtPatch = plane(9, 12, M.trim, 0, 0.005, 0, { parent: clearingGroup, rx: -Math.PI / 2, su: 2, sv: 2 });
  dirtPatch.material.color = new THREE.Color(0x18130e);

  // Weathered wooden marker post
  const post = box(0.18, 1.4, 0.18, M.trim, -2.5, 0.7, -1.5, { parent: clearingGroup });
  const signBoard = box(0.9, 0.35, 0.06, M.trim, -2.5, 1.25, -1.5, { parent: clearingGroup });

  // Trees encircling the clearing
  const clearingTrees = [
    [-8, -8, 1.2], [0, -10, 1.3], [8, -8, 1.1],
    [-9, 0, 1.15], [9, 0, 1.25],
    [-8, 8, 1.3], [0, 9.5, 1.4], [8, 8, 1.2],
  ];
  for (const [tx, tz, ts] of clearingTrees) {
    const t = makePineTree(OX + tx, tz, ts);
  }

  return {
    root,
    frontDoor,
    tlamp,
    lampShade,
    porchLamp,
    phoneLamp,
    bedLamp,
    moon,
    evidenceGroup,
    wireCutBottom,
    envTex,
    CABIN,
  };
}

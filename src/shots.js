// CABIN 28 — Shot list. 1981 Keddie Cabin 28 unsolved true-crime reconstruction.
// All shots keyed strictly to narration sentence & word timings.
import * as THREE from 'three';
import { stand, local, ldir, V } from './core/figure.js';
import { caption, hook, stamp, sfxWord, toScreen, CAP_Y, CREAM, YEL } from './core/text.js';
import { T, s as S0, e as E0, w as W0 } from './core/timing.js';
import { W, H, LAND, UI } from './core/engine.js';
import { CABIN, OX } from './sets/cabin.js';
import { walk, sit, handsUp, handsHidden, pathAt, pathLen, travel } from './poses.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const dolly = (a, b, k, fov = [50, 50], o = {}) => ({
  pos: lerp(a[0], b[0], k),
  look: lerp(a[1], b[1], k),
  fov: fov[0] + (fov[1] - fov[0]) * k,
  ...o,
});

export function buildShots(timing) {
  const S = timing.S;
  const s = (i) => S[i].start;
  const e = (i) => S[i].end;
  const w = (i, word, n = 0) => W0(i, word, n);

  const tEnd = timing.dur + 0.9;
  const shots = [];
  const cues = [];
  const cue = (t, type, o = {}) => cues.push({ t, type, dur: 1, gain: 1, ...o });

  const add = (id, start, note, setup, over) => {
    shots.push({ id, start, note, setup, over });
  };

  // --- Sound Cues & Score Arc ---
  cue(0.0, 'night', { dur: 63 });
  cue(0.0, 'arc', { v: 0.35 });
  cue(s(2), 'arc', { v: 0.55 });
  cue(w(2, 'cut'), 'snip', { gain: 1.0 });
  cue(w(2, 'cleanly'), 'swell', { dur: 1.8, gain: 0.6 });
  cue(s(3) + 0.2, 'door', { gain: 0.8 });
  cue(s(3) + 0.6, 'step', { gain: 0.7 });
  cue(s(4), 'arc', { v: 0.72 });
  cue(w(4, 'off'), 'click', { gain: 0.9 });
  cue(s(6) + 0.1, 'door', { gain: 0.6 });
  cue(s(8), 'arc', { v: 0.5 });
  cue(s(10), 'arc', { v: 0.95 });
  cue(w(10, 'missing'), 'sting', { gain: 1.2 });
  cue(s(12), 'arc', { v: 0.45 });
  cue(s(14), 'arc', { v: 0.85 });
  cue(s(14) + 1.2, 'sting', { gain: 0.9 });

  // ==================== SHOTS ====================

  // S01: Exterior establishing wide of Cabin 28 surrounded by pine trees at night
  add(
    'S01',
    0.0,
    'establishing cabin in pines',
    (wd, lt, tt) => {
      const k = sm(lt / (s(1) - 0.0));
      return {
        cam: dolly(
          [[0, 4.4, -14.8], [0, 1.8, -3.8]],
          [[0, 3.2, -11.5], [0, 1.6, -3.8]],
          k,
          [52, 48],
          { shake: 0.08 }
        ),
        exposure: 0.92,
        bloom: 0.55,
      };
    },
    (ctx, wd, lt, tt, t) => {
      // White condensed hook caption with boxed word
      hook(ctx, ['APRIL 1981', 'KEDDIE', 'CABIN 28'], 2, {
        alpha: clamp(t / 0.5) * clamp((s(1) - t) / 0.4),
        size: LAND ? 58 : 78,
      });
      // Cream date stamp in upper center
      stamp(ctx, '1981', {
        x: W / 2,
        y: LAND ? 260 : 420,
        size: LAND ? 140 : 190,
        alpha: clamp(t / 0.6) * clamp((s(1) - t) / 0.5),
      });
    }
  );

  // S02: Low tracking through pine trees toward the dark cabin; intruder silhouette watching
  add(
    'S02',
    s(1),
    'cold pitch black silent pines',
    (wd, lt, tt) => {
      const dur = s(2) - s(1);
      const k = sm(lt / dur);

      // Prowling intruder watching from the pines
      wd.intruder.visible = true;
      wd.intruder.gain = 0.85;
      const P = stand([-3.4, -6.8], 35, tt, { lean: 4, hunch: 6, nod: 8 });
      wd.intruder.pose(P);

      return {
        cam: dolly(
          [[-4.5, 0.95, -9.2], [-0.5, 1.3, -3.8]],
          [[-3.2, 1.15, -7.2], [-0.2, 1.35, -3.8]],
          k,
          [48, 48],
          { shake: 0.14 }
        ),
        exposure: 0.88,
        bloom: 0.5,
      };
    },
    (ctx, wd, lt, tt, t) => {
      stamp(ctx, 'APRIL 11', {
        x: W / 2,
        y: LAND ? 280 : 460,
        size: LAND ? 110 : 150,
        alpha: clamp((t - s(1)) / 0.4) * clamp((s(2) - t) / 0.4),
      });
    }
  );

  // S03: Exterior wall close-up: telephone junction box; ember hand cuts the wire
  add(
    'S03',
    s(2),
    'outside phone wire cut',
    (wd, lt, tt) => {
      const dur = s(3) - s(2);
      const k = sm(lt / dur);
      const tCut = w(2, 'cut');

      // Intruder standing beside the box outdoors, reaching in
      wd.intruder.visible = true;
      wd.intruder.gain = 0.95;
      const pos = [-1.75, -3.4], yaw = -35;
      const P = stand(pos, yaw, tt, { lean: 4, hunch: 4 });
      const reachK = clamp((tt - s(2)) / (tCut - s(2) + 1e-4));
      P.ik.handL = {
        target: V(CABIN.phoneBox.x + 0.04, CABIN.phoneBox.y - 0.12 + 0.12 * reachK, CABIN.phoneBox.z - 0.04),
        pole: ldir(yaw, 1, -0.4, -0.3),
        rot: [-60, 0, 0],
      };
      wd.intruder.pose(P);

      if (tt >= tCut) {
        wd.cabin.wireCutBottom.rotation.z = 0.22 + 0.08 * Math.sin((tt - tCut) * 8);
      }

      return {
        cam: dolly(
          [[-2.2, 1.38, -4.2], [CABIN.phoneBox.x, CABIN.phoneBox.y - 0.05, CABIN.phoneBox.z]],
          [[-2.2, 1.36, -3.95], [CABIN.phoneBox.x, CABIN.phoneBox.y - 0.05, CABIN.phoneBox.z]],
          k,
          [48, 46],
          { shake: 0.08 }
        ),
        exposure: 0.95,
        bloom: 0.58,
      };
    },
    (ctx, wd, lt, tt, t) => {
      const tCut = w(2, 'cut');
      if (t >= tCut && t < tCut + 1.2) {
        const pt = toScreen(wd.camera, CABIN.wireCut);
        if (!pt.behind) {
          sfxWord(ctx, 'Snip.', pt.x + 40, pt.y - 30, (t - tCut) / 1.2, { size: 68 });
        }
      }
    }
  );

  // S04: Front door unlatching and easing open; intruder steps over threshold
  add(
    'S04',
    s(3),
    'intruder enters front door',
    (wd, lt, tt) => {
      const dur = s(4) - s(3);
      const k = sm(lt / dur);

      // Front door creaks open inwards
      const openK = sm(clamp(lt / 1.8));
      wd.cabin.frontDoor.rotation.y = -openK * 1.35;

      // Intruder walks through the doorway into the living room
      wd.intruder.visible = true;
      wd.intruder.gain = 1.0;
      const pts = [[0.15, -3.8], [0.15, -2.2], [0.0, -1.0]];
      const d = travel(tt, s(3) + 0.4, 0.95, pathLen(pts));
      const P = walk(pts, d, tt, { nod: 6, lean: 5 });
      wd.intruder.pose(P);

      return {
        cam: dolly(
          [[0.15, 0.95, -0.4], [0.15, 1.2, -2.8]],
          [[0.15, 0.9, -0.65], [0.15, 1.25, -2.8]],
          k,
          [52, 50],
          { shake: 0.11 }
        ),
        exposure: 0.9,
        bloom: 0.55,
      };
    }
  );

  // S05: Living room table lamp clicked off; plunge into oxblood shadow
  add(
    'S05',
    s(4),
    'lamp clicked off curtains drawn',
    (wd, lt, tt) => {
      const dur = s(5) - s(4);
      const k = sm(lt / dur);
      const tOff = w(4, 'off');

      const isOff = tt >= tOff;
      wd.cabin.tlamp.intensity = isOff ? 0.05 : 2.2;
      wd.cabin.lampShade.material.emissiveIntensity = isOff ? 0.04 : 0.85;

      // Intruder standing at coffee table reaching down to switch
      wd.intruder.visible = true;
      wd.intruder.gain = 1.0;
      const pos = [-0.75, 1.05], yaw = 80;
      const P = stand(pos, yaw, tt, { lean: 6, hunch: 5 });
      P.ik.handR = {
        target: V(CABIN.lamp.x - 0.04, CABIN.lamp.y + 0.12, CABIN.lamp.z),
        pole: ldir(yaw, -1, -0.5, 0.3),
        rot: [-50, 0, 0],
      };
      wd.intruder.pose(P);

      return {
        cam: dolly(
          [[-0.6, 1.45, -0.4], [CABIN.table.x, 0.65, CABIN.table.z]],
          [[-0.5, 1.35, -0.2], [CABIN.table.x, 0.65, CABIN.table.z]],
          k,
          [52, 50],
          { shake: 0.09 }
        ),
        exposure: isOff ? 0.85 : 0.95,
        bloom: isOff ? 0.65 : 0.5,
      };
    },
    (ctx, wd, lt, tt, t) => {
      const tOff = w(4, 'off');
      if (t >= tOff && t < tOff + 0.8) {
        const pt = toScreen(wd.camera, CABIN.lamp);
        if (!pt.behind) {
          sfxWord(ctx, 'Click.', pt.x + 35, pt.y - 25, (t - tOff) / 0.8, { size: 62 });
        }
      }
    }
  );

  // S06: Dawn: Sheila walking toward the porch in cold blue light
  add(
    'S06',
    s(5),
    'morning daughter walks home',
    (wd, lt, tt) => {
      const dur = s(6) - s(5);
      const k = sm(lt / dur);

      // Morning dawn light
      wd.cabin.porchLamp.intensity = 0.2;
      wd.cabin.moon.color = new THREE.Color(0x5a7a9a);
      wd.cabin.moon.intensity = 0.65;

      // Sheila walking toward porch
      wd.sheila.visible = true;
      wd.sheila.gain = 0.95;
      const pts = [[-2.5, -8.5], [-1.2, -6.8], [0.0, -5.2]];
      const d = travel(tt, s(5), 1.1, pathLen(pts));
      const P = walk(pts, d, tt, { nod: 3, lean: 2 });
      wd.sheila.pose(P);

      return {
        cam: dolly(
          [[-0.8, 1.5, -9.8], [0.0, 1.2, -4.5]],
          [[-0.2, 1.4, -7.5], [0.0, 1.2, -4.5]],
          k,
          [50, 48],
          { shake: 0.12 }
        ),
        exposure: 0.92,
        bloom: 0.45,
      };
    },
    (ctx, wd, lt, tt, t) => {
      stamp(ctx, '7:45 A.M.', {
        x: W / 2,
        y: LAND ? 280 : 440,
        size: LAND ? 120 : 160,
        alpha: clamp((t - s(5)) / 0.4) * clamp((s(6) - t) / 0.4),
      });
    }
  );

  // S07: Front door open: entering into scene of devastation
  add(
    'S07',
    s(6),
    'front door opened devastation',
    (wd, lt, tt) => {
      const dur = s(7) - s(6);
      const k = sm(lt / dur);

      // Front door left slightly ajar
      wd.cabin.frontDoor.rotation.y = -1.1;

      // Sheila at the door threshold looking in
      wd.sheila.visible = true;
      wd.sheila.gain = 0.9;
      const P = stand([0.15, -2.6], 0, tt, { lean: 7, hunch: 5, nod: 12 });
      wd.sheila.pose(P);

      return {
        cam: dolly(
          [[0.15, 1.45, -4.2], [0.15, 1.1, 0.5]],
          [[0.15, 1.35, -2.8], [0.15, 1.0, 0.8]],
          k,
          [54, 50],
          { shake: 0.14 }
        ),
        exposure: 0.88,
        bloom: 0.5,
      };
    }
  );

  // S08: Living room interior: forensic evidence markers on floor
  add(
    'S08',
    s(7),
    'three victims motionless forensic markers',
    (wd, lt, tt) => {
      const dur = s(8) - s(7);
      const k = sm(lt / dur);

      // Forensic evidence group visible & lit by morning window light
      wd.cabin.evidenceGroup.visible = true;
      wd.cabin.moon.intensity = 0.85;
      wd.cabin.tlamp.intensity = 0.6;

      return {
        cam: dolly(
          [[0.2, 2.4, 0.1], [0.0, 0.15, 1.2]],
          [[0.1, 2.15, 0.3], [0.0, 0.15, 1.2]],
          k,
          [54, 52],
          { shake: 0.08 }
        ),
        exposure: 0.95,
        bloom: 0.5,
      };
    },
    (ctx, wd, lt, tt, t) => {
      stamp(ctx, 'CABIN 28', {
        x: W / 2,
        y: LAND ? 280 : 440,
        size: LAND ? 110 : 150,
        alpha: clamp((t - s(7)) / 0.5) * clamp((s(8) - t) / 0.5),
      });
    }
  );

  // S09: Back bedroom: three young boys sleeping unharmed in beds
  add(
    'S09',
    s(8),
    'three boys unharmed in back bedroom',
    (wd, lt, tt) => {
      const dur = s(9) - s(8);
      const k = sm(lt / dur);

      // Boys visible in their bed (dim, peaceful)
      wd.boy1.visible = true;
      wd.boy1.gain = 0.55;
      const P1 = stand([-1.8, 6.2], 90, tt, { nod: 15, lean: 10 });
      P1.root.pos = [0, -0.4, 0];
      wd.boy1.pose(P1);

      return {
        cam: dolly(
          [[-0.6, 1.35, 3.8], [-1.8, 0.65, 6.2]],
          [[-1.0, 1.15, 4.8], [-1.8, 0.55, 6.2]],
          k,
          [48, 46],
          { shake: 0.09 }
        ),
        exposure: 0.88,
        bloom: 0.48,
      };
    }
  );

  // S10: Low angle from bedroom floor: tall intruder shadows passing the hallway door
  add(
    'S10',
    s(9),
    'shadows passing the bedroom door',
    (wd, lt, tt) => {
      const dur = s(10) - s(9);
      const k = sm(lt / dur);

      // Two intruders passing slowly through hallway opening
      wd.intruder.visible = true;
      wd.intruder.gain = 0.95;
      const pts1 = [[-1.2, 3.8], [0.2, 3.8], [1.5, 3.8]];
      const d1 = travel(tt, s(9), 0.7, pathLen(pts1));
      const P1 = walk(pts1, d1, tt, { nod: 6, lean: 4 });
      wd.intruder.pose(P1);

      wd.partner.visible = true;
      wd.partner.gain = 0.65;
      const pts2 = [[-1.8, 3.6], [-0.5, 3.6], [0.8, 3.6]];
      const d2 = travel(tt, s(9) + 0.35, 0.7, pathLen(pts2));
      const P2 = walk(pts2, d2, tt, { nod: 4, lean: 3 });
      wd.partner.pose(P2);

      return {
        cam: dolly(
          [[-1.4, 0.38, 5.8], [0.0, 1.2, 3.8]],
          [[-1.2, 0.42, 5.4], [0.0, 1.2, 3.8]],
          k,
          [54, 52],
          { shake: 0.13 }
        ),
        exposure: 0.86,
        bloom: 0.6,
      };
    }
  );

  // S11: Missing person reveal: Tina's empty bed; sting on missing
  add(
    'S11',
    s(10),
    'tina sharp missing empty bed',
    (wd, lt, tt) => {
      const dur = s(11) - s(10);
      const k = sm(lt / dur);

      // Cold bedside light over the empty bed and disheveled quilt
      wd.cabin.bedLamp.position.set(1.8, 2.4, 6.0);
      wd.cabin.bedLamp.intensity = 2.4;

      return {
        cam: dolly(
          [[1.8, 1.8, 4.5], [1.8, 0.45, 6.2]],
          [[1.8, 1.5, 4.9], [1.8, 0.45, 6.2]],
          k,
          [48, 44],
          { shake: 0.08 }
        ),
        exposure: 0.98,
        bloom: 0.55,
      };
    },
    (ctx, wd, lt, tt, t) => {
      stamp(ctx, 'TINA SHARP · AGE 12', {
        x: W / 2,
        y: LAND ? 240 : 360,
        size: LAND ? 85 : 120,
        alpha: clamp((t - s(10)) / 0.4) * clamp((s(11) - t) / 0.4),
      });
    }
  );

  // S12: Deep forest: Feather Falls / Camp 18 clearing, 30 miles south
  add(
    'S12',
    s(11),
    'remains found 30 miles in forest',
    (wd, lt, tt) => {
      const dur = s(12) - s(11);
      const k = sm(lt / dur);

      wd.cabin.moon.position.set(OX - 6, 14, -8);
      wd.cabin.moon.intensity = 0.8;

      return {
        cam: dolly(
          [[OX - 2.0, 1.4, -6.5], [OX, 2.2, -0.5]],
          [[OX - 1.0, 1.9, -4.5], [OX, 2.2, -0.5]],
          k,
          [52, 48],
          { shake: 0.12 }
        ),
        exposure: 0.92,
        bloom: 0.5,
      };
    },
    (ctx, wd, lt, tt, t) => {
      stamp(ctx, '30 MILES SOUTH', {
        x: W / 2,
        y: LAND ? 260 : 380,
        size: LAND ? 95 : 135,
        alpha: clamp((t - s(11)) / 0.4) * clamp((s(12) - t) / 0.4),
      });
      stamp(ctx, 'CAMP EIGHTEEN · 1984', {
        x: W / 2,
        y: LAND ? 340 : 500,
        size: LAND ? 70 : 95,
        alpha: clamp((t - s(11)) / 0.4) * clamp((s(12) - t) / 0.4),
      });
    }
  );

  // S13: Modern day: Cabin 28 demolished site
  add(
    'S13',
    s(12),
    'cabin demolished four decades later',
    (wd, lt, tt) => {
      const dur = s(13) - s(12);
      const k = sm(lt / dur);

      wd.cabin.moon.position.set(OX - 6, 14, -8);
      wd.cabin.moon.intensity = 0.8;

      return {
        cam: dolly(
          [[OX + 0.5, 3.4, -9.5], [OX, 0.4, 0.0]],
          [[OX + 0.2, 2.5, -6.8], [OX, 0.4, 0.0]],
          k,
          [50, 48],
          { shake: 0.09 }
        ),
        exposure: 0.9,
        bloom: 0.45,
      };
    },
    (ctx, wd, lt, tt, t) => {
      stamp(ctx, 'DEMOLISHED · 2004', {
        x: W / 2,
        y: LAND ? 280 : 440,
        size: LAND ? 100 : 140,
        alpha: clamp((t - s(12)) / 0.4) * clamp((s(13) - t) / 0.4),
      });
    }
  );

  // S14: Case file: officially unsolved
  add(
    'S14',
    s(13),
    'investigation officially unsolved',
    (wd, lt, tt) => {
      const dur = s(14) - s(13);
      const k = sm(lt / dur);

      return {
        cam: dolly(
          [[0.0, 1.8, -4.5], [0.0, 0.8, -3.2]],
          [[0.0, 1.6, -4.0], [0.0, 0.8, -3.2]],
          k,
          [48, 46],
          { shake: 0.08 }
        ),
        exposure: 0.9,
        bloom: 0.55,
      };
    },
    (ctx, wd, lt, tt, t) => {
      stamp(ctx, 'CASE UNSOLVED', {
        x: W / 2,
        y: LAND ? 280 : 440,
        size: LAND ? 115 : 165,
        alpha: clamp((t - s(13)) / 0.35) * clamp((s(14) - t) / 0.35),
      });
    }
  );

  // S15: Final shot: camera pulls back into dark pines, two ember silhouettes watch; fade to black
  add(
    'S15',
    s(14),
    'intruders never caught fade to black',
    (wd, lt, tt) => {
      const dur = tEnd - s(14);
      const k = sm(lt / dur);

      // Two glowing ember intruders standing in the dark pines looking directly at camera
      wd.intruder.visible = true;
      wd.intruder.gain = 1.0;
      const P1 = stand([-0.42, -7.2], 180, tt, { lean: 2, hunch: 4, nod: 3 });
      wd.intruder.pose(P1);

      wd.partner.visible = true;
      wd.partner.gain = 0.85;
      const P2 = stand([0.45, -7.6], 180, tt, { lean: 3, hunch: 5, nod: 2 });
      wd.partner.pose(P2);

      // Fade to black in the final 1.5 seconds
      const black = clamp((lt - (dur - 1.5)) / 1.4);

      return {
        cam: dolly(
          [[0.0, 1.45, -9.8], [0.0, 1.35, -5.0]],
          [[0.0, 1.7, -13.5], [0.0, 1.35, -5.0]],
          k,
          [50, 54],
          { shake: 0.09 }
        ),
        exposure: 0.92 * (1 - black * 0.5),
        bloom: 0.6,
        black,
      };
    }
  );

  shots.cues = cues;
  return shots;
}

// ==================== CAPTIONS ====================
let CAPTIONS = [];

export function buildCaptions(timing) {
  const S = timing.S;
  const s = (i) => S[i].start;
  const e = (i) => S[i].end;

  const caps = [];
  const yel = (text, from, to, o = {}) => caps.push({ text, from, to, ...o });

  // Sentence captions from S01 onwards
  for (let i = 1; i < S.length; i++) {
    yel(S[i].text, s(i), e(i));
  }

  CAPTIONS = caps;
  return caps;
}

export function drawCaptions(ctx, t) {
  if (!CAPTIONS.length) buildCaptions(T);
  const fade = 0.08;
  for (const c of CAPTIONS) {
    if (t < c.from - fade || t > c.to + fade) continue;
    const alpha = clamp(Math.min((t - c.from) / fade, (c.to - t) / fade));
    caption(ctx, c.text, { alpha, italic: c.italic, color: c.color || YEL });
  }
}

import * as THREE from 'three';

/** Build a LatheGeometry from a flat [r, y, r, y, ...] list. */
export const latheFromPairs = (pairs: number[], segments = 56) => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < pairs.length; i += 2) {
    pts.push(new THREE.Vector2(pairs[i], pairs[i + 1]));
  }
  return new THREE.LatheGeometry(pts, segments);
};

interface ScrollOptions {
  height: number;       // vertical rise
  topRadius: number;    // outer radius of upper curl
  bottomRadius: number; // outer radius of lower curl (0 = simple C-scroll)
  turns?: number;
  tube: number;
}

/**
 * Classical cast brass S-scroll / C-scroll bracket lying in XY plane.
 */
export const makeScrollGeometry = ({
  height,
  topRadius,
  bottomRadius,
  turns = 1.15,
  tube,
}: ScrollOptions) => {
  const pts: THREE.Vector3[] = [];
  const maxA = turns * Math.PI * 2;
  const steps = 40;

  // Lower curl
  if (bottomRadius > 0) {
    for (let i = steps; i >= 1; i--) {
      const th = (i / steps) * maxA * 0.85;
      const r = bottomRadius * (1 - 0.72 * (th / maxA));
      const a = Math.PI + th;
      pts.push(new THREE.Vector3(bottomRadius + Math.cos(a) * r, Math.sin(a) * r, 0));
    }
  }

  // Smooth S-curve spine
  pts.push(new THREE.Vector3(0, 0, 0));
  pts.push(new THREE.Vector3(topRadius * 0.38, height * 0.5, 0));

  // Upper curl
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * maxA;
    const r = topRadius * (1 - 0.72 * (th / maxA));
    pts.push(new THREE.Vector3(-topRadius + Math.cos(th) * r, height + Math.sin(th) * r, 0));
  }

  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  return new THREE.TubeGeometry(curve, 128, tube, 12, false);
};

/**
 * Creates an authentic Victorian / Roberval pierced open-work balance beam
 * with graceful parabolic taper, rounded trunnion eyes, and precision lightening cutouts.
 */
export const makePiercedBeamGeometry = (halfSpan: number) => {
  const shape = new THREE.Shape();
  const s = halfSpan;

  // Outer arch contour: deep diamond-curved center boss tapering to end trunnion eyes
  shape.moveTo(0, 0.21);
  shape.bezierCurveTo(s * 0.22, 0.20, s * 0.52, 0.125, s - 0.14, 0.085);
  // Right end rounded bearing eye
  shape.absarc(s, 0, 0.095, Math.PI * 0.55, -Math.PI * 0.55, true);
  shape.bezierCurveTo(s * 0.52, -0.125, s * 0.22, -0.20, 0, -0.21);
  shape.bezierCurveTo(-s * 0.22, -0.20, -s * 0.52, -0.125, -(s - 0.14), -0.085);
  // Left end rounded bearing eye
  shape.absarc(-s, 0, 0.095, -Math.PI * 0.45, Math.PI * 0.45, true);
  shape.bezierCurveTo(-s * 0.52, 0.125, -s * 0.22, 0.20, 0, 0.21);

  // Symmetric circular lightening cutouts along each arm
  const cutoutOffsets = [0.58, 1.12, 1.62, 2.08, 2.46];
  const cutoutRadii = [0.082, 0.068, 0.054, 0.042, 0.032];

  cutoutOffsets.forEach((x, idx) => {
    if (x >= s - 0.25) return;
    const r = cutoutRadii[idx];

    const holeRight = new THREE.Path();
    holeRight.absarc(x, 0, r, 0, Math.PI * 2, true);
    shape.holes.push(holeRight);

    const holeLeft = new THREE.Path();
    holeLeft.absarc(-x, 0, r, 0, Math.PI * 2, true);
    shape.holes.push(holeLeft);
  });

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.09,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.015,
    bevelThickness: 0.015,
    curveSegments: 40,
  });
  geo.center();
  return geo;
};

/**
 * Creates a sleek parallel lower Roberval stay-rod geometry with end bearing eyes.
 */
export const makeStayRodGeometry = (halfSpan: number) => {
  const shape = new THREE.Shape();
  const s = halfSpan;

  shape.moveTo(0, 0.055);
  shape.quadraticCurveTo(s * 0.5, 0.048, s - 0.08, 0.045);
  shape.absarc(s, 0, 0.052, Math.PI * 0.5, -Math.PI * 0.5, true);
  shape.quadraticCurveTo(s * 0.5, -0.048, 0, -0.055);
  shape.quadraticCurveTo(-s * 0.5, -0.048, -(s - 0.08), -0.045);
  shape.absarc(-s, 0, 0.052, -Math.PI * 0.5, Math.PI * 0.5, true);
  shape.quadraticCurveTo(-s * 0.5, 0.048, 0, 0.055);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.008,
    bevelThickness: 0.008,
    curveSegments: 24,
  });
  geo.center();
  return geo;
};

/**
 * Creates a sculpted clockwork spade-and-lancet pointer needle with an open diamond eye.
 */
export const makePointerNeedleGeometry = () => {
  const shape = new THREE.Shape();

  // Start at bottom counterweight neck (y = -0.32) up to sharp tip (y = 0.88)
  shape.moveTo(0, -0.36);
  shape.bezierCurveTo(0.055, -0.36, 0.065, -0.26, 0.022, -0.18);
  shape.lineTo(0.026, 0.42);
  // Open diamond swell before tip
  shape.lineTo(0.058, 0.56);
  shape.lineTo(0.022, 0.68);
  // Razor-sharp lancet tip
  shape.lineTo(0, 0.90);
  shape.lineTo(-0.022, 0.68);
  shape.lineTo(-0.058, 0.56);
  shape.lineTo(-0.026, 0.42);
  shape.lineTo(-0.022, -0.18);
  shape.bezierCurveTo(-0.065, -0.26, -0.055, -0.36, 0, -0.36);

  // Diamond cutout inside the swell
  const diamondHole = new THREE.Path();
  diamondHole.moveTo(0, 0.47);
  diamondHole.lineTo(0.028, 0.56);
  diamondHole.lineTo(0, 0.64);
  diamondHole.lineTo(-0.028, 0.56);
  diamondHole.closePath();
  shape.holes.push(diamondHole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.005,
    bevelThickness: 0.005,
    curveSegments: 24,
  });
  geo.translate(0, 0, -0.009);
  return geo;
};

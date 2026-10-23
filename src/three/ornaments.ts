import * as THREE from 'three';

/** Build a LatheGeometry from a flat [r, y, r, y, ...] list. */
export const latheFromPairs = (pairs: number[], segments = 48) => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < pairs.length; i += 2) pts.push(new THREE.Vector2(pairs[i], pairs[i + 1]));
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
  turns = 1.1,
  tube,
}: ScrollOptions) => {
  const pts: THREE.Vector3[] = [];
  const maxA = turns * Math.PI * 2;
  const steps = 36;

  // Lower curl
  if (bottomRadius > 0) {
    for (let i = steps; i >= 1; i--) {
      const th = (i / steps) * maxA * 0.85;
      const r = bottomRadius * (1 - 0.72 * (th / maxA));
      const a = Math.PI + th;
      pts.push(new THREE.Vector3(bottomRadius + Math.cos(a) * r, Math.sin(a) * r, 0));
    }
  }

  // Straight / S-curve stem
  pts.push(new THREE.Vector3(0, 0, 0));
  pts.push(new THREE.Vector3(topRadius * 0.35, height * 0.5, 0));

  // Upper curl
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * maxA;
    const r = topRadius * (1 - 0.72 * (th / maxA));
    pts.push(new THREE.Vector3(-topRadius + Math.cos(th) * r, height + Math.sin(th) * r, 0));
  }

  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  return new THREE.TubeGeometry(curve, 120, tube, 8, false);
};

/**
 * Creates an authentic Victorian pierced open-work truss beam shape with circular cutouts.
 */
export const makePiercedBeamGeometry = (halfSpan: number) => {
  const shape = new THREE.Shape();
  const s = halfSpan;

  // Outer arch contour: wide center, elegant taper, rounded end eyes
  shape.moveTo(0, 0.16);
  shape.quadraticCurveTo(s * 0.35, 0.13, s * 0.72, 0.08);
  shape.quadraticCurveTo(s - 0.18, 0.065, s - 0.06, 0.09);
  // End rounded eye
  shape.absarc(s, 0, 0.09, Math.PI / 2, -Math.PI / 2, true);
  shape.quadraticCurveTo(s - 0.18, -0.065, s * 0.72, -0.08);
  shape.quadraticCurveTo(s * 0.35, -0.13, 0, -0.16);
  shape.quadraticCurveTo(-s * 0.35, -0.13, -s * 0.72, -0.08);
  shape.quadraticCurveTo(-(s - 0.18), -0.065, -(s - 0.06), -0.09);
  // Left end rounded eye
  shape.absarc(-s, 0, 0.09, -Math.PI / 2, Math.PI / 2, true);
  shape.quadraticCurveTo(-(s - 0.18), 0.065, -s * 0.72, 0.08);
  shape.quadraticCurveTo(-s * 0.35, 0.13, 0, 0.16);

  // Pierced holes (lightening cutouts typical of Victorian precision scales)
  // Symmetric cutouts along each arm
  const cutoutOffsets = [0.65, 1.35, 2.05];
  const cutoutRadii = [0.075, 0.055, 0.04];

  cutoutOffsets.forEach((x, idx) => {
    const r = cutoutRadii[idx];
    // Right arm hole
    const holeRight = new THREE.Path();
    holeRight.absarc(x, 0, r, 0, Math.PI * 2, true);
    shape.holes.push(holeRight);

    // Left arm hole
    const holeLeft = new THREE.Path();
    holeLeft.absarc(-x, 0, r, 0, Math.PI * 2, true);
    shape.holes.push(holeLeft);
  });

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.11,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.016,
    bevelThickness: 0.016,
    curveSegments: 32,
  });
};

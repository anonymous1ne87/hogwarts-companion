export type Pt = [number, number];

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Closed Catmull-Rom spline through the points, as an SVG path. */
export function smoothClosed(p: Pt[]): string {
  const n = p.length;
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += ` C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  }
  return d + "Z";
}

/** Open Catmull-Rom spline through the points, as an SVG path. */
export function smoothOpen(p: Pt[]): string {
  const n = p.length;
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = p[Math.max(i - 1, 0)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(i + 2, n - 1)];
    d += ` C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/**
 * A gentle quadratic curve from a to b, sampled as Leaflet [lat, lng] pairs.
 * Our CRS uses lat = y and lng = x. `bend` is the control-point offset as a fraction of the length.
 */
export function curve(a: { x: number; y: number }, b: { x: number; y: number }, bend: number, steps = 20): [number, number][] {
  const dx = b.x - a.x, dy = b.y - a.y;
  const c = { x: (a.x + b.x) / 2 - dy * bend, y: (a.y + b.y) / 2 + dx * bend };
  const out: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    out.push([u * u * a.y + 2 * u * t * c.y + t * t * b.y, u * u * a.x + 2 * u * t * c.x + t * t * b.x]);
  }
  return out;
}

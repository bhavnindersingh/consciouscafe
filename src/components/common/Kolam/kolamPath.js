/**
 * A sikku kolam: the single unbroken line drawn around a grid of dots at Tamil
 * doorsteps each morning, closing where it began.
 *
 * Construction (a "mirror curve"): `cols` × `rows` cells with a dot at each
 * centre. The line runs diagonally between the midpoints of cell edges, so it
 * frames every dot in a diamond and crosses itself between neighbours; at the
 * grid's edge it turns back, looping round the outer dot. With
 * gcd(cols, rows) = 1 that is one closed loop through every crossing twice.
 *
 * Returns { d, dots, width, height }: an SVG path (cubic Béziers through the
 * points, so the edge turns are round) in units where a cell is `cell` wide.
 */
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export function kolamPoints(cols, rows) {
  if (gcd(cols, rows) !== 1) throw new Error('cols and rows must share no factor, or the line breaks into several loops');
  const start = { x: 0.5, y: 0, dx: 1, dy: 1 };
  const pts = [];
  let { x, y, dx, dy } = start;
  do {
    pts.push({ x, y, edge: x === 0 || x === cols || y === 0 || y === rows });
    x += dx / 2; y += dy / 2;
    if (x === 0 || x === cols) dx = -dx;
    if (y === 0 || y === rows) dy = -dy;
  } while (!(x === start.x && y === start.y && dx === start.dx && dy === start.dy) && pts.length <= 4 * cols * rows);
  return pts;
}

export function kolamPath(cols, rows, { cell = 40, bulge = 0.22 } = {}) {
  const pts = kolamPoints(cols, rows).map((p) => {
    // push the turns out past the grid so the loop wraps round the outer dot
    let { x, y } = p;
    if (x === 0) x -= bulge; else if (x === cols) x += bulge;
    if (y === 0) y -= bulge; else if (y === rows) y += bulge;
    return { x: (x + bulge + 0.1) * cell, y: (y + bulge + 0.1) * cell };
  });
  const n = pts.length;
  const at = (i) => pts[(i + n) % n];
  const f = (v) => Math.round(v * 100) / 100;
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = at(i - 1); const p1 = at(i); const p2 = at(i + 1); const p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  const pad = bulge + 0.1;
  const dots = [];
  for (let i = 0; i < cols; i += 1) for (let j = 0; j < rows; j += 1) dots.push({ cx: f((i + 0.5 + pad) * cell), cy: f((j + 0.5 + pad) * cell) });
  return { d: `${d}Z`, dots, width: f((cols + 2 * pad) * cell), height: f((rows + 2 * pad) * cell) };
}

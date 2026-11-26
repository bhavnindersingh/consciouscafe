import { kolamPoints, kolamPath } from './kolamPath';

test('one closed line: every crossing twice, every edge turn once', () => {
  const pts = kolamPoints(7, 5);
  expect(pts).toHaveLength(4 * 7 * 5);
  const seen = {};
  pts.forEach((p) => { const k = `${p.x},${p.y}`; seen[k] = (seen[k] || 0) + 1; });
  const visits = Object.entries(seen);
  expect(visits.filter(([, v]) => v === 1).length).toBe(2 * (7 + 5)); // the turns at the edge
  expect(visits.every(([k, v]) => v === (pts.find((p) => `${p.x},${p.y}` === k).edge ? 1 : 2))).toBe(true);
});

test('a grid whose sides share a factor would break into loops, so it is refused', () => {
  expect(() => kolamPoints(6, 4)).toThrow(/share no factor/);
});

test('the path closes, and there is a dot in every cell', () => {
  const k = kolamPath(5, 3);
  expect(k.d.endsWith('Z')).toBe(true);
  expect(k.dots).toHaveLength(15);
  expect(k.width).toBeGreaterThan(k.height);
});

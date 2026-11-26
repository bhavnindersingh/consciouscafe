import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { kolamPath } from './kolamPath';
import './Kolam.css';

/**
 * A sikku kolam (kolamPath.js), drawn once: the dots are set down first, then
 * the line runs round them when it comes into view — the page's one moving
 * moment. Someone who prefers reduced motion (or a browser without
 * IntersectionObserver) sees it already drawn. Decorative: hidden from
 * screen readers; the words beside it carry the meaning.
 */
export default function Kolam({ cols = 7, rows = 5, className = '' }) {
  const k = useMemo(() => kolamPath(cols, rows), [cols, rows]);
  const box = useRef(null);
  const line = useRef(null);
  const [len, setLen] = useState(null);
  const [drawn, setDrawn] = useState(false);

  // measured before the first paint, so the line never shows and then erases itself
  useLayoutEffect(() => {
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (still || typeof IntersectionObserver === 'undefined' || !line.current?.getTotalLength) { setDrawn(true); return undefined; }
    setLen(line.current.getTotalLength());
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setDrawn(true); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(box.current);
    return () => io.disconnect();
  }, [k]);

  const dash = len ? { strokeDasharray: len, strokeDashoffset: drawn ? 0 : len } : undefined;
  return (
    <svg ref={box} className={`kolam${drawn ? ' is-drawn' : ''} ${className}`} viewBox={`0 0 ${k.width} ${k.height}`} aria-hidden="true" focusable="false">
      {k.dots.map((p) => <circle key={`${p.cx},${p.cy}`} className="kolam-dot" cx={p.cx} cy={p.cy} r="2.6" />)}
      <path ref={line} className="kolam-line" d={k.d} style={dash} />
    </svg>
  );
}

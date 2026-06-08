import React from "react";

/* CSS-only entrance wrapper. Content is visible by default (animation has no
   fill-mode) so it can never get stuck hidden — safe for SSR/print. */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div", style }) {
  const d = delay ? ` d${delay}` : "";
  return <Tag style={style} className={`reveal${d} ${className}`}>{children}</Tag>;
}

export const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BagIcon = ({ s = 17 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
  </svg>
);

import React from 'react';
import { dateBlock, kindLabel } from '../../utils/sanctuary';

export const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div', style }) => (
  <Tag style={style} className={`reveal${delay ? ` d${delay}` : ''} ${className}`}>{children}</Tag>
);

/** The calendar tile: TUE / 10 / NOV, in IST. */
export const DateTile = ({ iso, small = false }) => {
  const d = dateBlock(iso);
  return (
    <div className={`sn-tile${small ? ' sm' : ''}`} aria-hidden="true">
      <span className="sn-tile-dow">{d.weekday}</span>
      <span className="sn-tile-day">{d.day}</span>
      <span className="sn-tile-mon">{d.month}</span>
    </div>
  );
};

export const KindTag = ({ kind }) => <span className={`sn-kind sn-kind-${kind}`}>{kindLabel(kind)}</span>;

export const Field = ({ label, error, hint, children, htmlFor }) => (
  <label className={`sn-field${error ? ' has-error' : ''}`} htmlFor={htmlFor}>
    <span className="sn-label">{label}</span>
    {children}
    {error ? <span className="sn-err" role="alert">{error}</span> : hint ? <span className="sn-hint">{hint}</span> : null}
  </label>
);

export const Spinner = ({ label = 'Loading' }) => (
  <div className="sn-loading" role="status" aria-live="polite"><span className="sn-spin" />{label}</div>
);

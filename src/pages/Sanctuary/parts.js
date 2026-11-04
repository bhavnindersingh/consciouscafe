import React from 'react';
import { Link } from 'react-router-dom';
import { dateBlock, kindLabel, formatWhen, priceLabel, seatsLabel, isFull } from '../../utils/sanctuary';
import { imageUrl } from '../../services/sanctuaryService';

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

/**
 * One gathering in a list (calendar, host page, more dates). A collapsed weekly
 * series (collapseSeries) also carries `repeat` and `more`.
 */
export const GatheringRow = ({ o, showHost = true, compact = false }) => {
  const img = !compact && imageUrl(o.image_path);
  const full = isFull(o);
  return (
    <Link className={`sn-row${img ? ' has-img' : ''}${compact ? ' compact' : ''}`} to={`/sanctuary/${o.id}`}>
      <DateTile iso={o.starts_at} small={compact} />
      <div className="sn-row-main">
        <span className="sn-row-tags">
          <KindTag kind={o.kind} />
          {o.repeat && <span className="sn-repeat">{o.repeat}</span>}
        </span>
        <span className="sn-row-title">{o.title}</span>
        <span className="sn-row-meta">
          {formatWhen(o.starts_at, o.ends_at)}
          {showHost && o.host_name ? <> · with {o.host_name}</> : null}
          {o.more ? <> · and {o.more} more {o.more === 1 ? 'date' : 'dates'}</> : null}
        </span>
      </div>
      {img && <img className="sn-row-img" src={img} alt="" loading="lazy" />}
      <div className="sn-row-side">
        <span className="sn-price">{priceLabel(o.price_inr)}</span>
        <span className={`sn-seats${full ? ' full' : ''}`}>{seatsLabel(o.seats_left, o.capacity)}</span>
        <span className="sn-row-go">{full ? 'Details' : 'Reserve'} <Arrow s={14} /></span>
      </div>
    </Link>
  );
};

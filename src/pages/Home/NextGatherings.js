import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { listGatherings } from '../../services/sanctuaryService';
import { collapseSeries, dateBlock, formatWhen, kindLabel } from '../../utils/sanctuary';

/* The home page's "Next at the Sanctuary" list: the same rows the /sanctuary
   calendar shows, capped at a few, read from the live RPC. The fetch waits
   until the section is near the viewport (or the browser is idle) so the
   hero's first paint never queues behind it. The shell renders at once with a
   reserved height, so nothing below it jumps when the rows arrive.
   Styles: App.css, `home-next-*` (sanctuary.css only loads on /sanctuary). */

const MAX_ROWS = 3;

const Arrow = ({ s = 14 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Tile = ({ iso }) => {
  const d = dateBlock(iso);
  return (
    <span className="home-tile" aria-hidden="true">
      <span className="home-tile-dow">{d.weekday}</span>
      <span className="home-tile-day">{d.day}</span>
      <span className="home-tile-mon">{d.month}</span>
    </span>
  );
};

const Row = ({ o }) => (
  <li className="home-next-item">
    <Link className="home-next-row" to={`/sanctuary/${o.id}`}>
      <Tile iso={o.starts_at} />
      <span className="home-next-main">
        <span className="home-next-tags">
          <span className={`home-next-kind is-${o.kind}`}>{kindLabel(o.kind)}</span>
          {o.repeat && <span className="home-next-repeat">{o.repeat}</span>}
        </span>
        <span className="home-next-title">{o.title}</span>
        <span className="home-next-meta">
          {formatWhen(o.starts_at, o.ends_at)}
          {o.host_name ? <> · with {o.host_name}</> : null}
          {o.more ? <> · and {o.more} more {o.more === 1 ? 'date' : 'dates'}</> : null}
        </span>
      </span>
      <span className="home-next-go">Details <Arrow /></span>
    </Link>
  </li>
);

/** Resolves when `el` is near the viewport, or after `ms` of idle time, whichever comes first. */
function whenNear(el, ms = 2500) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    const timer = setTimeout(finish, ms);
    if (typeof IntersectionObserver === 'undefined' || !el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { clearTimeout(timer); io.disconnect(); finish(); }
    }, { rootMargin: '900px 0px' });
    io.observe(el);
  });
}

export default function NextGatherings() {
  const ref = useRef(null);
  const [state, setState] = useState({ status: 'loading', items: [] });

  useEffect(() => {
    let alive = true;
    whenNear(ref.current)
      .then(() => listGatherings())
      .then((rows) => alive && setState({ status: 'ready', items: collapseSeries(rows).slice(0, MAX_ROWS) }))
      .catch(() => alive && setState({ status: 'error', items: [] }));
    return () => { alive = false; };
  }, []);

  const { status, items } = state;
  const one = status === 'ready' && items.length === 1;

  return (
    <div className="home-next" ref={ref} aria-busy={status === 'loading'}>
      <div className="home-next-head">
        <h3 className="home-next-h">{one ? 'Next at the Sanctuary' : 'What’s on at the Sanctuary'}</h3>
        <Link className="tlink home-next-all" to="/sanctuary">Full calendar <Arrow s={16} /></Link>
      </div>

      {status === 'loading' && (
        <p className="home-next-note" role="status">Looking up the calendar…</p>
      )}

      {status === 'error' && (
        <div className="home-next-note home-next-error">
          <p>The calendar didn’t load just now.</p>
          <Link className="tlink" to="/sanctuary">Open the calendar <Arrow s={16} /></Link>
        </div>
      )}

      {status === 'ready' && items.length === 0 && (
        <div className="home-next-note home-next-empty">
          <p>Nothing on the calendar just yet. Classes, workshops and evenings appear here as hosts publish them.</p>
          <Link className="tlink" to="/sanctuary/host">Host at the Sanctuary <Arrow s={16} /></Link>
        </div>
      )}

      {status === 'ready' && items.length > 0 && (
        <ul className="home-next-list">
          {items.map((o) => <Row o={o} key={o.id} />)}
        </ul>
      )}
    </div>
  );
}

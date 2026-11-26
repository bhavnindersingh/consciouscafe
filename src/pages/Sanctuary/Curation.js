import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { imageUrl } from '../../services/sanctuaryService';
import { formatWhen, priceLabel, isFree, seatsLabel } from '../../utils/sanctuary';
import { DateTile, KindTag } from './parts';

// Show this many on a wide screen before "Show all"; a phone scrolls sideways through all.
const FIRST = 6;

const initialsOf = (name) => String(name || '').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

/**
 * One event outside the Sanctuary as a card. The whole card opens the event's
 * own page (reserve there, like anything on the calendar; the organiser's
 * profile is one tap from it). Nothing here leaves the site.
 */
export function OutsideCard({ o }) {
  const img = imageUrl(o.image_path);
  const avatar = imageUrl(o.host_avatar_path);
  return (
    <Link className={`sn-cur-card${img ? ' has-img' : ''}`} to={`/sanctuary/${o.id}`}>
      {img && <img className="sn-cur-img" src={img} alt="" loading="lazy" />}
      <div className="sn-cur-top">
        <DateTile iso={o.starts_at} small />
        <div className="sn-cur-main">
          <span className="sn-row-tags">
            <KindTag kind={o.kind} />
            {o.repeat && <span className="sn-repeat">{o.repeat}</span>}
          </span>
          <span className="sn-cur-title">{o.title}</span>
          <span className="sn-cur-meta">
            {formatWhen(o.starts_at, o.ends_at)}{o.more ? ` · and ${o.more} more ${o.more === 1 ? 'date' : 'dates'}` : ''}
          </span>
          <span className="sn-cur-place">
            <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="10" r="2.4" fill="currentColor" /></svg>
            {o.location}
          </span>
        </div>
      </div>
      <div className="sn-cur-foot">
        {o.host_name && (
          <span className="sn-cur-host">
            <span className="sn-cur-avatar" aria-hidden="true">{avatar ? <img src={avatar} alt="" loading="lazy" /> : initialsOf(o.host_name)}</span>
            with {o.host_name}
          </span>
        )}
        <span className="sn-cur-price">{isFree(o.price_inr) ? 'Free' : priceLabel(o.price_inr)} · {seatsLabel(o.seats_left, o.capacity)}</span>
      </div>
      <span className="sn-cur-go">See details</span>
    </Link>
  );
}

/**
 * "Linda's curation" on /sanctuary, under the Sanctuary's own calendar: events,
 * workshops and classes at other places around Auroville. Organisers add them
 * like any event ("Somewhere else" in the editor); our team approves each one.
 * `events`: published outside events, weekly series collapsed. None, nothing rendered.
 */
export default function Curation({ events }) {
  const [all, setAll] = useState(false);
  if (!events || !events.length) return null;
  return (
    <section className="section tight sn-cur" id="curation" aria-labelledby="sn-cur-h">
      <div className="sn-cur-head">
        <h2 id="sn-cur-h" className="sn-cur-h">Linda’s curation</h2>
        <p className="sn-cur-lede">Classes, workshops and evenings outside the Sanctuary, chosen by Linda. Reserve a place here, the same way.</p>
      </div>
      <ul className={`sn-cur-list${all ? ' is-open' : ''}`}>
        {events.map((o) => <li key={o.id}><OutsideCard o={o} /></li>)}
      </ul>
      {events.length > FIRST && !all && (
        <button type="button" className="sn-act sn-cur-more" onClick={() => setAll(true)}>Show all {events.length}</button>
      )}
    </section>
  );
}

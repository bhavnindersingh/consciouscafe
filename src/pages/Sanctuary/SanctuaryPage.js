import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO, breadcrumb } from '../../utils/seoData';
import { listGatherings } from '../../services/sanctuaryService';
import { OFFERING_KINDS } from '../../constants/sanctuary';
import {
  filterByKind, groupByMonth, formatWhen, priceLabel, seatsLabel, isFull,
} from '../../utils/sanctuary';
import { Arrow, Reveal, DateTile, KindTag, Spinner } from './parts';
import './sanctuary.css';

const FILTERS = [{ value: 'all', plural: 'Everything' }, ...OFFERING_KINDS];

const SanctuaryPage = () => {
  const navigate = useNavigate();
  const seo = generatePageSEO('sanctuary');
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [kind, setKind] = useState('all');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setError(null);
    listGatherings()
      .then((rows) => alive && setItems(rows))
      .catch((e) => alive && setError(e));
    return () => { alive = false; };
  }, [attempt]);

  const counts = useMemo(() => {
    const c = { all: items?.length || 0 };
    for (const k of OFFERING_KINDS) c[k.value] = (items || []).filter((o) => o.kind === k.value).length;
    return c;
  }, [items]);
  const groups = useMemo(() => groupByMonth(filterByKind(items || [], kind)), [items, kind]);

  return (
    <main className="sn-view">
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url={seo.url}
        structuredData={[breadcrumb([{ name: 'Home', path: '/' }, { name: 'Sanctuary', path: '/sanctuary' }])]}
      />

      <header className="sn-hero">
        <Reveal><span className="eyebrow">Conscious Sanctuary · Auroville Road</span></Reveal>
        <Reveal delay={1} as="h1" className="display">Gather, move,<br /><em>be still.</em></Reveal>
        <Reveal delay={2} as="p" className="lede">
          Classes, workshops and evenings beside the café — led by teachers and makers we trust.
          Reserve a place; pay at the door.
        </Reveal>
      </header>

      <section className="section tight sn-calendar" aria-labelledby="sn-cal-h">
        <h2 id="sn-cal-h" className="sr-only">What’s on</h2>
        <div className="sn-filters" role="tablist" aria-label="Filter by kind">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={kind === f.value}
              className={`sn-chip${kind === f.value ? ' on' : ''}`}
              onClick={() => setKind(f.value)}
              disabled={!items}
            >
              {f.plural}{items ? <span className="sn-chip-n">{counts[f.value]}</span> : null}
            </button>
          ))}
        </div>

        {error ? (
          <div className="sn-empty">
            <p className="sn-empty-h">We couldn’t load the calendar.</p>
            <p>Check your connection and try again.</p>
            <button className="btn" onClick={() => setAttempt((n) => n + 1)}>Try again <Arrow /></button>
          </div>
        ) : !items ? (
          <Spinner label="Loading what’s on" />
        ) : groups.length === 0 ? (
          <div className="sn-empty">
            <p className="sn-empty-h">
              {kind === 'all' ? 'The calendar is quiet for now.' : `No ${FILTERS.find((f) => f.value === kind).plural.toLowerCase()} on the calendar yet.`}
            </p>
            <p>New gatherings appear here as hosts add them — or bring one of your own.</p>
            {kind !== 'all' && <button className="btn" onClick={() => setKind('all')}>See everything <Arrow /></button>}
          </div>
        ) : (
          groups.map((g) => (
            <div className="sn-month" key={g.key}>
              <h3 className="sn-month-h">{g.key}</h3>
              <ul className="sn-list">
                {g.items.map((o) => (
                  <li key={o.id}>
                    <Link className="sn-row" to={`/sanctuary/${o.id}`}>
                      <DateTile iso={o.starts_at} />
                      <div className="sn-row-main">
                        <KindTag kind={o.kind} />
                        <span className="sn-row-title">{o.title}</span>
                        <span className="sn-row-meta">
                          {formatWhen(o.starts_at, o.ends_at)}
                          {o.host_name ? <> · with {o.host_name}</> : null}
                        </span>
                      </div>
                      <div className="sn-row-side">
                        <span className="sn-price">{priceLabel(o.price_inr)}</span>
                        <span className={`sn-seats${isFull(o) ? ' full' : ''}`}>{seatsLabel(o.seats_left, o.capacity)}</span>
                        <span className="sn-row-go">{isFull(o) ? 'Details' : 'Reserve'} <Arrow s={14} /></span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <section className="section forest sn-host-band">
        <div className="sn-band-inner">
          <Reveal><span className="eyebrow">For teachers, makers &amp; guides</span></Reveal>
          <Reveal delay={1} as="h2" className="display">Host something <em>here.</em></Reveal>
          <Reveal delay={2} as="p" className="lede">
            A class, a weekend workshop, a sound circle. Sign in with Google, tell us a little about
            your work, and once we’ve said hello you can put gatherings on this calendar yourself.
          </Reveal>
          <Reveal delay={3}>
            <button className="btn on-dark" onClick={() => navigate('/sanctuary/host')}>Host at the Sanctuary <Arrow /></button>
          </Reveal>
        </div>
      </section>
    </main>
  );
};

export default SanctuaryPage;

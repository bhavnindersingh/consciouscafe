import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO, breadcrumb } from '../../utils/seoData';
import { listGatherings } from '../../services/sanctuaryService';
import { OFFERING_KINDS } from '../../constants/sanctuary';
import { filterByKind, groupByMonth, collapseSeries } from '../../utils/sanctuary';
import { Arrow, Reveal, Spinner, GatheringRow } from './parts';
import CalendarView from './CalendarView';
import './sanctuary.css';

const FILTERS = [{ value: 'all', plural: 'Everything' }, ...OFFERING_KINDS];

const SanctuaryPage = () => {
  const navigate = useNavigate();
  const seo = generatePageSEO('sanctuary');
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [kind, setKind] = useState('all');
  const [attempt, setAttempt] = useState(0);
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'calendar' ? 'calendar' : 'list';
  const setView = (v) => setParams(v === 'calendar' ? { view: 'calendar' } : {}, { replace: true });

  useEffect(() => {
    let alive = true;
    setError(null);
    listGatherings()
      .then((rows) => alive && setItems(rows))
      .catch((e) => alive && setError(e));
    return () => { alive = false; };
  }, [attempt]);

  // A weekly class counts (and lists) once; the calendar shows every date.
  const collapsed = useMemo(() => collapseSeries(items || []), [items]);
  const counts = useMemo(() => {
    const c = { all: collapsed.length };
    for (const k of OFFERING_KINDS) c[k.value] = collapsed.filter((o) => o.kind === k.value).length;
    return c;
  }, [collapsed]);
  const groups = useMemo(() => groupByMonth(filterByKind(collapsed, kind)), [collapsed, kind]);
  const dated = useMemo(() => filterByKind(items || [], kind), [items, kind]);

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
        <div className="sn-toolbar">
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
        <div className="sn-seg sn-view-switch" role="radiogroup" aria-label="Show as">
          {[['list', 'List'], ['calendar', 'Calendar']].map(([v, label]) => (
            <button key={v} type="button" role="radio" aria-checked={view === v}
              className={`sn-seg-opt${view === v ? ' on' : ''}`} onClick={() => setView(v)}>{label}</button>
          ))}
        </div>
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
        ) : view === 'calendar' ? (
          <CalendarView items={dated} />
        ) : (
          groups.map((g) => (
            <div className="sn-month" key={g.key}>
              <h3 className="sn-month-h">{g.key}</h3>
              <ul className="sn-list">
                {g.items.map((o) => <li key={o.id}><GatheringRow o={o} /></li>)}
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
            A class, a weekend workshop, a sound circle. Sign in, tell us a little about your work,
            and once we’ve said hello you can put gatherings on this calendar yourself — weekly
            classes too.
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

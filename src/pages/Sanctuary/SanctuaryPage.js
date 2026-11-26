import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO, breadcrumb } from '../../utils/seoData';
import { listGatherings } from '../../services/sanctuaryService';
import { OFFERING_KINDS } from '../../constants/sanctuary';
import { filterByKind, groupByMonth, collapseSeries, inHouse } from '../../utils/sanctuary';
import { Reveal, GatheringRow, PageSkeleton, onRadioKeys, tabStop } from './parts';
import CalendarView from './CalendarView';
import SanctuaryHero from './SanctuaryHero';
import Curation from './Curation';
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

  // The Sanctuary is one room with one calendar: in-house events only. Events
  // elsewhere around Auroville are Linda's curation, further down.
  const here = useMemo(() => (items || []).filter(inHouse), [items]);
  const away = useMemo(() => collapseSeries((items || []).filter((o) => !inHouse(o))), [items]);
  // A weekly class counts (and lists) once; the calendar shows every date.
  const collapsed = useMemo(() => collapseSeries(here), [here]);
  const counts = useMemo(() => {
    const c = { all: collapsed.length };
    for (const k of OFFERING_KINDS) c[k.value] = collapsed.filter((o) => o.kind === k.value).length;
    return c;
  }, [collapsed]);
  const groups = useMemo(() => groupByMonth(filterByKind(collapsed, kind)), [collapsed, kind]);
  const dated = useMemo(() => filterByKind(here, kind), [here, kind]);

  return (
    <main className="sn-view">
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url={seo.url}
        structuredData={[breadcrumb([{ name: 'Home', path: '/' }, { name: 'Sanctuary', path: '/sanctuary' }])]}
      />

      <SanctuaryHero events={collapsed} onSeeWhatsOn={() => {
        const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        document.getElementById('whats-on')?.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' });
      }} />

      <section className="section tight sn-calendar" id="whats-on" aria-labelledby="sn-cal-h">
        <h2 id="sn-cal-h" className="sr-only">What’s on</h2>
        <div className="sn-toolbar">
        {/* one choice of several: a radio group, arrow keys move it */}
        <div className="sn-filters" role="radiogroup" aria-label="Show" onKeyDown={onRadioKeys}>
          {FILTERS.map((f, i) => (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={kind === f.value}
              tabIndex={tabStop(kind === f.value, i === 0, true)}
              className={`sn-chip${kind === f.value ? ' on' : ''}`}
              onClick={() => setKind(f.value)}
              disabled={!items}
            >
              {f.plural}{items ? <span className="sn-chip-n">{counts[f.value]}</span> : null}
            </button>
          ))}
        </div>
        <div className="sn-seg sn-view-switch" role="radiogroup" aria-label="Show as" onKeyDown={onRadioKeys}>
          {[['list', 'List'], ['calendar', 'Calendar']].map(([v, label], i) => (
            <button key={v} type="button" role="radio" aria-checked={view === v} tabIndex={tabStop(view === v, i === 0, true)}
              className={`sn-seg-opt${view === v ? ' on' : ''}`} onClick={() => setView(v)}>{label}</button>
          ))}
        </div>
        </div>

        {error ? (
          <div className="sn-empty">
            <p className="sn-empty-h">We couldn’t load the calendar.</p>
            <p>Check your connection and try again.</p>
            <button className="btn" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
          </div>
        ) : !items ? (
          <PageSkeleton kind="list" label="Loading what’s on" />
        ) : groups.length === 0 ? (
          <div className="sn-empty">
            <p className="sn-empty-h">
              {kind === 'all' ? 'The calendar is quiet for now.' : `No ${FILTERS.find((f) => f.value === kind).plural.toLowerCase()} on the calendar yet.`}
            </p>
            <p>New events appear here as organisers add them{away.length && kind === 'all' ? ' — meanwhile, see what’s on around Auroville below' : ' — or bring one of your own'}.</p>
            {kind !== 'all'
              ? <button className="btn" onClick={() => setKind('all')}>See everything</button>
              : <button className="btn" onClick={() => navigate('/sanctuary/host')}>Become an organiser</button>}
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

      <Curation events={away} />

      <section className="section forest sn-host-band">
        <div className="sn-band-inner">
          <Reveal as="h2" className="display">Teach, make or gather people? Organise it with us.</Reveal>
          <Reveal delay={2} as="p" className="lede">
            A class, a weekend workshop, a sound circle — in the Sanctuary, or at your own space around
            Auroville for Linda’s curation. Sign in, make your organiser profile, and send us your events;
            our team looks at each one before it goes live.
          </Reveal>
          <Reveal delay={3}>
            <button className="btn on-dark" onClick={() => navigate('/sanctuary/host')}>Become an organiser</button>
          </Reveal>
        </div>
      </section>
    </main>
  );
};

export default SanctuaryPage;

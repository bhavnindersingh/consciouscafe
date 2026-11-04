import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { breadcrumb } from '../../utils/seoData';
import { getGathering, reservePlaces, imageUrl, listSeriesDates } from '../../services/sanctuaryService';
import { LIMITS } from '../../constants/sanctuary';
import {
  formatWhen, priceLabel, isFree, seatsLabel, rsvpState, validateRsvp, rsvpErrorMessage,
  googleCalendarUrl, isUuid, kindLabel, repeatLabel, weekdaysOf,
} from '../../utils/sanctuary';
import { Arrow, Reveal, DateTile, KindTag, Field, Spinner, GatheringRow } from './parts';
import './sanctuary.css';

const WHATSAPP_URL = 'https://wa.me/918754561269';

const CLOSED_COPY = {
  cancelled: ['This gathering has been cancelled.', 'The host has called it off. Have a look at what else is on.'],
  past: ['This one has passed.', 'Have a look at what’s coming up next.'],
  started: ['This one is under way.', 'Reservations closed when it began.'],
  full: ['Every place is taken.', 'Message us on WhatsApp to hear if a place opens up.'],
};

function RsvpForm({ gathering, onDone }) {
  const maxSeats = gathering.capacity == null ? LIMITS.seatsPerRsvp : Math.min(LIMITS.seatsPerRsvp, gathering.seats_left);
  const [form, setForm] = useState({ name: '', phone: '', email: '', seats: 1 });
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const { errors: errs, value } = validateRsvp(form, maxSeats);
    setErrors(errs);
    setFailure(null);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await reservePlaces({ offeringId: gathering.id, ...value });
      onDone({ ...value, seatsLeft: res?.seats_left ?? null });
    } catch (err) {
      setFailure(rsvpErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="sn-form" onSubmit={submit} noValidate>
      <Field label="Your name" error={errors.name} htmlFor="sn-r-name">
        <input id="sn-r-name" autoComplete="name" value={form.name} onChange={set('name')} maxLength={LIMITS.nameMax} />
      </Field>
      <Field label="Phone" error={errors.phone} hint="So the host can reach you if anything changes." htmlFor="sn-r-phone">
        <input id="sn-r-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" value={form.phone} onChange={set('phone')} />
      </Field>
      <Field label="Email (optional)" error={errors.email} htmlFor="sn-r-email">
        <input id="sn-r-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} maxLength={LIMITS.emailMax} />
      </Field>
      <Field label="Places" error={errors.seats} htmlFor="sn-r-seats">
        <select id="sn-r-seats" value={form.seats} onChange={set('seats')}>
          {Array.from({ length: Math.max(1, maxSeats) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'place' : 'places'}</option>
          ))}
        </select>
      </Field>
      {failure && <p className="sn-failure" role="alert">{failure}</p>}
      <button type="submit" className="btn forest sn-submit" disabled={busy}>
        {busy ? 'Reserving…' : 'Reserve my place'} {!busy && <Arrow />}
      </button>
      <p className="sn-fine">
        {isFree(gathering.price_inr) ? 'Free to attend.' : `${priceLabel(gathering.price_inr)} per person, paid at the venue.`}
        {' '}Your number is shared only with the host.
      </p>
    </form>
  );
}

const GatheringPage = () => {
  const { id } = useParams();
  const [g, setG] = useState(undefined); // undefined = loading, null = not found
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const [series, setSeries] = useState([]); // every upcoming date of its weekly series

  useEffect(() => {
    let alive = true;
    setG(undefined); setError(null); setDone(null); setSeries([]);
    if (!isUuid(id)) { setG(null); return undefined; }
    getGathering(id)
      .then((row) => {
        if (!alive) return;
        setG(row);
        if (row?.series_id) listSeriesDates(row.series_id).then((d) => alive && setSeries(d)).catch(() => {});
      })
      .catch((e) => alive && setError(e));
    return () => { alive = false; };
  }, [id]);

  if (error) {
    return (
      <main className="sn-view sn-detail-view">
        <div className="sn-empty sn-pad">
          <p className="sn-empty-h">We couldn’t load this gathering.</p>
          <p>Check your connection and try again.</p>
          <button className="btn" onClick={() => window.location.reload()}>Reload <Arrow /></button>
        </div>
      </main>
    );
  }
  if (g === undefined) return <main className="sn-view sn-detail-view"><Spinner /></main>;
  if (g === null) {
    return (
      <main className="sn-view sn-detail-view">
        <SEO title="Not on the calendar | Conscious Sanctuary" noIndex />
        <div className="sn-empty sn-pad">
          <p className="sn-empty-h">This gathering isn’t on the calendar.</p>
          <p>It may have been taken down, or the link is incomplete.</p>
          <Link className="btn" to="/sanctuary">See what’s on <Arrow /></Link>
        </div>
      </main>
    );
  }

  const state = rsvpState(g);
  const pageUrl = `${window.location.origin}/sanctuary/${g.id}`;
  const img = imageUrl(g.image_path);
  const when = formatWhen(g.starts_at, g.ends_at);
  const repeat = series.length > 1 ? repeatLabel(weekdaysOf(series)) : '';
  const otherDates = series.filter((o) => o.id !== g.id).slice(0, 6);

  return (
    <main className="sn-view sn-detail-view">
      <SEO
        title={`${g.title} — ${kindLabel(g.kind)} | Conscious Sanctuary`}
        description={(g.description || `${kindLabel(g.kind)} at Conscious Sanctuary, Auroville Road. ${when}.`).slice(0, 160)}
        url={`/sanctuary/${g.id}`}
        image={img || undefined}
        noIndex={state === 'past' || state === 'cancelled'}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: g.title,
            startDate: g.starts_at,
            endDate: g.ends_at,
            eventStatus: g.status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: { '@type': 'Place', name: g.location, address: 'Auroville Road, Tamil Nadu 605101, India' },
            ...(img ? { image: [img] } : {}),
            ...(g.description ? { description: g.description } : {}),
            ...(g.host_name ? { organizer: { '@type': 'Person', name: g.host_name } } : {}),
            offers: {
              '@type': 'Offer',
              price: isFree(g.price_inr) ? 0 : Number(g.price_inr),
              priceCurrency: 'INR',
              availability: state === 'full' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
              url: pageUrl,
            },
          },
          breadcrumb([{ name: 'Home', path: '/' }, { name: 'Sanctuary', path: '/sanctuary' }, { name: g.title, path: `/sanctuary/${g.id}` }]),
        ]}
      />

      <div className="sn-detail">
        <div className="sn-detail-main">
          <Reveal><Link className="sn-back" to="/sanctuary">← All gatherings</Link></Reveal>
          <Reveal delay={1} className="sn-detail-head">
            <DateTile iso={g.starts_at} />
            <div>
              <span className="sn-row-tags">
                <KindTag kind={g.kind} />
                {repeat && <span className="sn-repeat">{repeat}</span>}
              </span>
              <h1 className="display sn-detail-title">{g.title}</h1>
            </div>
          </Reveal>
          {img && (
            <Reveal delay={2} className="sn-detail-img">
              <img src={img} alt="" loading="eager" />
            </Reveal>
          )}
          {g.description && (
            <Reveal delay={2} className="sn-prose">
              {g.description.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
            </Reveal>
          )}
          {g.host_name && (
            <Reveal delay={3} className="sn-hostline">
              <span className="sn-label">Your host</span>
              {g.host_id
                ? <Link className="sn-hostname" to={`/sanctuary/hosts/${g.host_id}`}>{g.host_name}</Link>
                : <span className="sn-hostname">{g.host_name}</span>}
              {g.host_link && /^https?:\/\//i.test(g.host_link) && (
                <a href={g.host_link} target="_blank" rel="noopener noreferrer nofollow">{g.host_link.replace(/^https?:\/\/(www\.)?/i, '')} ↗</a>
              )}
            </Reveal>
          )}
          {otherDates.length > 0 && (
            <section className="sn-more" aria-labelledby="sn-more-h">
              <h2 id="sn-more-h" className="sn-more-h">More dates</h2>
              <ul className="sn-list">
                {otherDates.map((o) => <li key={o.id}><GatheringRow o={o} showHost={false} compact /></li>)}
              </ul>
            </section>
          )}
        </div>

        <aside className="sn-panel" aria-label="Reserve">
          <dl className="sn-facts">
            <div><dt>When</dt><dd>{when}</dd></div>
            <div><dt>Where</dt><dd>{g.location}</dd></div>
            <div><dt>Price</dt><dd>{isFree(g.price_inr) ? 'Free' : `${priceLabel(g.price_inr)} · pay at the venue`}</dd></div>
            <div><dt>Places</dt><dd>{seatsLabel(g.seats_left, g.capacity)}</dd></div>
          </dl>

          {done ? (
            <div className="sn-done" role="status">
              <p className="sn-done-h">You’re in, {done.name.split(' ')[0]}.</p>
              <p>{done.seats} {done.seats === 1 ? 'place is' : 'places are'} held for you — {when}.</p>
              <a className="btn" href={googleCalendarUrl(g, pageUrl)} target="_blank" rel="noopener noreferrer">Add to Google Calendar <Arrow /></a>
              <p className="sn-fine">Can’t make it after all? Message us on <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp</a> so someone else can have your place.</p>
            </div>
          ) : state === 'open' ? (
            <RsvpForm
              gathering={g}
              onDone={(d) => {
                setDone(d);
                // the RPC returns what is left after this booking
                if (d.seatsLeft !== null) setG((prev) => ({ ...prev, seats_left: d.seatsLeft }));
              }}
            />
          ) : (
            <div className="sn-closed">
              <p className="sn-done-h">{CLOSED_COPY[state][0]}</p>
              <p>{CLOSED_COPY[state][1]}</p>
              {state === 'full'
                ? <a className="btn" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp us <Arrow /></a>
                : <Link className="btn" to="/sanctuary">See what’s on <Arrow /></Link>}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
};

export default GatheringPage;

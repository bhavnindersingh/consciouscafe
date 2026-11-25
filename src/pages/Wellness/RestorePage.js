import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO, breadcrumb } from '../../utils/seoData';
import { getMenu, getSlots, book } from '../../services/wellnessService';
import {
  LIMITS, CAFE_PHONE, CAFE_PHONE_TEL, CAFE_WHATSAPP_URL, BOOKING_PATH, SERVICE_KEYS, SERVICE_COPY,
} from '../../constants/wellness';
import { RESTORE_PHOTOS } from '../../data/restorePhotos';
import { getGumletUrl } from '../../utils/gumlet';
import {
  quote, rupees, toPaise, priceLine, gstLabel, orderServices, usesLabel, dayStrip, weekChunkStart, slotsFor, seatCap,
  placesLabel, slotRange, slotLine, dayTile, dayCaption, stillBookable, validateBooking, bookErrorMessage, shouldRefetch,
} from '../../utils/wellness';
import { istToday } from '../../utils/sanctuary';
import { Arrow, Reveal, Field, Spinner, PinnedBar, scrollToEl, PageSkeleton, onRadioKeys, tabStop } from '../Sanctuary/parts';
import '../Sanctuary/sanctuary.css';
import './wellness.css';

/* The page: the two rooms (hero), then booking, how it works, questions.
   While the POS has no session switched on, booking is one tap to WhatsApp
   with the session named; once it has, it's the flow below.

   The booking flow, top to bottom: session → day → time → places →
   details, with the bill beside it. Slots are read a week at a time from
   today (weekChunkStart) and cached per week; a refusal of `full` or
   `not_found` re-reads the week and drops the pick if it is gone. The pay
   button is disabled while the request is in flight, and the page hands over
   to PhonePe with window.location.assign. */

const Step = ({ title, note, children, id }) => (
  <section className="wl-step" aria-labelledby={id}>
    <h2 className="wl-step-h" id={id}>{title}{note ? <span className="wl-step-note">{note}</span> : null}</h2>
    {children}
  </section>
);

/** wa.me with the request already written, so booking by WhatsApp is one tap. */
const waLink = (what = 'the ice bath or the sauna') => `${CAFE_WHATSAPP_URL}?text=${encodeURIComponent(
  `Hi! I’d like to book ${what} at Conscious Sanctuary. When could I come?`,
)}`;

// The two rooms, as the hero shows them. Wording from the landing pages.
const ROOMS = [
  { key: 'ice_bath', word: 'Cold', title: 'The ice bath', line: 'Meet the cold, steady the breath and step out sharper than you went in.' },
  { key: 'sauna', word: 'Heat', title: 'The Ayurvedic sauna', line: 'Deep, dry warmth to slow your breathing, let the day go and reset.' },
];

function Room({ room }) {
  const photo = RESTORE_PHOTOS[room.key];
  return (
    <article className={`wl-room wl-room-${room.key}${photo ? ' has-photo' : ''}`}>
      {photo && <img src={getGumletUrl(photo, { width: 1400, quality: 72, format: 'auto' })} alt="" loading="lazy" decoding="async" />}
      <span className="wl-room-word" aria-hidden="true">{room.word}</span>
      <h2 className="wl-room-h">{room.title}</h2>
      <p>{room.line}</p>
    </article>
  );
}

const CancelLine = () => (
  <p className="wl-cancel-line">
    Need to cancel? Call or WhatsApp <a href={CAFE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{CAFE_PHONE}</a> — we refund in full.{' '}
    <a href="/terms-of-service#sanctuary-payments">Payment and refund terms</a>.
  </p>
);

const RestorePage = () => {
  const seo = generatePageSEO('sanctuary/restore');
  const [menu, setMenu] = useState(undefined); // undefined = loading, null = failed
  const [attempt, setAttempt] = useState(0);
  const [service, setService] = useState(null);
  const [day, setDay] = useState(() => istToday());
  const [weeks, setWeeks] = useState({}); // { 'YYYY-MM-DD' (chunk start): { rows, loading, error } }
  const [picked, setPicked] = useState(null); // one wellness_slots row
  const [seats, setSeats] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  const billRef = useRef(null);
  const bookRef = useRef(null);

  // Set on mount as well as cleared on unmount: React's StrictMode (development)
  // mounts, unmounts and mounts again, which left this false for good and the
  // times stuck on "Finding times" on localhost.
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    let on = true;
    setMenu(undefined);
    getMenu()
      .then((m) => {
        if (!on) return;
        const services = orderServices(m.services);
        setMenu({ settings: m.settings || {}, services });
        if (services.length === 1) setService(services[0].key);
      })
      .catch(() => on && setMenu(null));
    return () => { on = false; };
  }, [attempt]);

  const today = istToday();
  const chunk = weekChunkStart(day, today);
  const week = weeks[chunk];

  const loadWeek = useCallback((start) => {
    setWeeks((w) => ({ ...w, [start]: { rows: w[start]?.rows || [], loading: true, error: null } }));
    getSlots(start, LIMITS.slotsPerFetchDays)
      .then((rows) => alive.current && setWeeks((w) => ({ ...w, [start]: { rows, loading: false, error: null } })))
      .catch((e) => alive.current && setWeeks((w) => ({ ...w, [start]: { rows: w[start]?.rows || [], loading: false, error: e } })));
  }, []);

  useEffect(() => {
    if (menu && menu.services.length && !weeks[chunk]) loadWeek(chunk);
  }, [menu, chunk, weeks, loadWeek]);

  // After a re-read, the pick follows the fresh row (its places may have moved);
  // one that vanished or filled up is let go.
  useEffect(() => {
    if (!picked || !week || week.loading) return;
    if (!stillBookable(week.rows, picked, 1)) { setPicked(null); return; }
    const fresh = week.rows.find((s) => s.service === picked.service && s.slot_start === picked.slot_start);
    if (fresh && fresh !== picked && fresh.places_left !== picked.places_left) setPicked(fresh);
  }, [week, picked]);

  const settings = menu?.settings || {};
  const services = menu?.services || [];
  const chosen = services.find((s) => s.key === service) || null;
  const days = useMemo(() => dayStrip(settings.book_ahead_days ?? 14), [settings.book_ahead_days]);
  const daySlots = useMemo(() => (service && week ? slotsFor(week.rows, service, day) : []), [service, week, day]);
  const cap = picked ? seatCap(settings.max_seats ?? 1, picked.places_left) : 0;
  const bill = chosen && picked ? quote(chosen.price_inr, seats, settings.gst_rate) : null;

  useEffect(() => { if (cap && seats > cap) setSeats(cap); }, [cap, seats]);

  const pickService = (key) => { setService(key); setPicked(null); setFailure(null); };
  const pickDay = (d) => { setDay(d); setPicked(null); setFailure(null); };
  const pickSlot = (s) => {
    setPicked(s); setFailure(null); setErrors((e) => ({ ...e, seats: undefined }));
    // On one column the bill is below the form — bring it into view once a time is chosen.
    if (window.matchMedia && window.matchMedia('(max-width: 860px)').matches && billRef.current) {
      setTimeout(() => billRef.current && billRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  };
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => (er[k] ? { ...er, [k]: undefined } : er)); // editing clears its error
  };
  /** Blur-first: a details field is checked when it's left. */
  const blurCheck = (k) => () => {
    const msg = validateBooking({ ...form, seats }, cap).errors[k];
    setErrors((er) => (er[k] === msg ? er : { ...er, [k]: msg }));
  };

  const pay = async (e) => {
    e.preventDefault();
    if (busy) return;
    // the button is never a dead end: it says what's still missing and goes there
    if (!chosen || !picked) {
      setFailure(!chosen ? 'Choose a session first.' : 'Pick a day and a time first.');
      document.getElementById(!chosen ? 'wl-h-svc' : 'wl-h-time')?.scrollIntoView({ block: 'center' });
      return;
    }
    const { errors: errs, value } = validateBooking({ ...form, seats }, cap);
    setErrors(errs);
    setFailure(null);
    if (Object.keys(errs).length) { document.getElementById({ name: 'wl-name', phone: 'wl-phone', email: 'wl-email' }[Object.keys(errs)[0]])?.focus(); return; }
    setBusy(true);
    try {
      const res = await book({ service: chosen.key, slotStart: picked.slot_start, ...value });
      if (!res || !res.redirectUrl) throw new Error('no redirect');
      window.location.assign(res.redirectUrl); // over to PhonePe; stay disabled while the page leaves
    } catch (err) {
      if (!alive.current) return;
      setFailure(bookErrorMessage(err));
      setBusy(false);
      if (shouldRefetch(err)) loadWeek(chunk);
    }
  };

  const loaded = Boolean(menu);
  const open = loaded && services.length > 0;
  const closed = loaded && services.length === 0;
  const from = open ? Math.min(...services.map((s) => Number(s.price_inr) || 0)) : 0;
  const hour = settings.slot_minutes === 60 ? 'an hour' : settings.slot_minutes ? `${settings.slot_minutes} minutes` : null;
  const toBook = () => scrollToEl(bookRef.current);
  const faqs = [
    ['Is it for first-timers?', 'Yes. It’s simple and well-held, so first-timers and regulars alike can settle in and breathe.'],
    ['Can I do both?', 'Yes. The sauna and the ice bath sit side by side, so you can book the hot-and-cold contrast ritual as one session.'],
    ['Where is it?', 'At the Conscious Sanctuary on Auroville Road, beside Conscious Café — a short drive from Pondicherry.'],
    open && ['How do I cancel?', `Call or WhatsApp ${CAFE_PHONE} and we refund your booking in full.`],
  ].filter(Boolean);

  let booking;
  if (!loaded) {
    booking = menu === undefined ? <PageSkeleton kind="list" label="Opening the booking desk" /> : (
      <div className="wl-closed">
        <p className="wl-closed-h">We couldn’t load the booking desk.</p>
        <p>Check your connection and try again, or <a href={waLink()} target="_blank" rel="noopener noreferrer">book on WhatsApp</a>.</p>
        <button className="btn" onClick={() => setAttempt((n) => n + 1)}>Try again <Arrow /></button>
      </div>
    );
  } else if (closed) {
    booking = (
      <div className="wl-ask">
        <h2 className="wl-sec-h" id="wl-book-h">Book on WhatsApp</h2>
        <p className="wl-step-hint">Online booking opens soon. Until then, tap what you’d like and we’ll find you a time.</p>
        <div className="wl-ask-list">
          {SERVICE_KEYS.map((k) => (
            <a key={k} className="wl-ask-opt" href={waLink(SERVICE_COPY[k].ask)} target="_blank" rel="noopener noreferrer">
              <span className="wl-svc-name">{SERVICE_COPY[k].name}</span>
              <span className="wl-svc-desc">{SERVICE_COPY[k].line}</span>
              <span className="wl-ask-go">WhatsApp us <Arrow s={14} /></span>
            </a>
          ))}
        </div>
        <p className="sn-fine">Or call <a href={CAFE_PHONE_TEL}>{CAFE_PHONE}</a>.</p>
      </div>
    );
  } else {
    booking = (
      <form onSubmit={pay} noValidate>
        {/* the steps carry their own heads; this one names the section for screen readers */}
        <h2 className="sr-only" id="wl-book-h">Book a session</h2>
        <div className="wl-grid">
          <div className="wl-steps">
            <Step id="wl-h-svc" title="Choose a session">
              <div className="wl-services" role="radiogroup" aria-labelledby="wl-h-svc" onKeyDown={onRadioKeys}>
                {services.map((s, i) => (
                  <button
                    key={s.key} type="button" role="radio" aria-checked={service === s.key} tabIndex={tabStop(service === s.key, i === 0, Boolean(service))}
                    className={`wl-svc${service === s.key ? ' on' : ''}`} onClick={() => pickService(s.key)}
                  >
                    {s.uses && s.uses.length > 1 ? <span className="wl-svc-uses">{usesLabel(s.uses)}</span> : null}
                    <span className="wl-svc-name">{s.name}</span>
                    {s.description || SERVICE_COPY[s.key] ? <span className="wl-svc-desc">{s.description || SERVICE_COPY[s.key].line}</span> : null}
                    <span className="wl-svc-price">{priceLine(s.price_inr)}</span>
                  </button>
                ))}
              </div>
            </Step>

            <Step id="wl-h-day" title="Pick a day">
              <div className="wl-days" role="radiogroup" aria-labelledby="wl-h-day" onKeyDown={onRadioKeys}>
                {days.map((d) => {
                  const t = dayTile(d);
                  const caption = dayCaption(d);
                  return (
                    <span className="wl-day-wrap" key={d}>
                      <button
                        type="button" role="radio" aria-checked={day === d} tabIndex={day === d ? 0 : -1} aria-label={`${t.weekday} ${t.day} ${t.month}${caption ? `, ${caption}` : ''}`}
                        className={`wl-day${day === d ? ' on' : ''}`} onClick={() => pickDay(d)}
                      >
                        <span className="wl-day-dow">{t.weekday}</span>
                        <span className="wl-day-num">{t.day}</span>
                        <span className="wl-day-mon">{t.month}</span>
                      </button>
                      <span className="wl-day-cap" aria-hidden="true">{caption}</span>
                    </span>
                  );
                })}
              </div>
            </Step>

            <Step id="wl-h-time" title="Pick a time" note={settings.slot_minutes ? `${settings.slot_minutes} minutes` : null}>
              {!service ? (
                <p className="wl-step-hint">Choose a session first — each one has its own times.</p>
              ) : !week || (week.loading && !week.rows.length) ? (
                <Spinner label="Finding times" />
              ) : week.error && !week.rows.length ? (
                <p className="wl-step-hint">We couldn’t load the times. <button type="button" className="sn-act strong" onClick={() => loadWeek(chunk)}>Try again</button></p>
              ) : daySlots.length === 0 ? (
                <p className="wl-empty-day">No times on this day — pick another.</p>
              ) : (
                <div className="wl-slots" role="radiogroup" aria-labelledby="wl-h-time" onKeyDown={onRadioKeys}>
                  {daySlots.map((s, i) => {
                    const on = picked && picked.slot_start === s.slot_start;
                    const full = s.places_left <= 0;
                    return (
                      <button
                        key={s.slot_start} type="button" role="radio" aria-checked={!!on} disabled={full}
                        tabIndex={tabStop(Boolean(on), i === daySlots.findIndex((x) => x.places_left > 0), Boolean(picked && daySlots.some((x) => x.slot_start === picked.slot_start)))}
                        className={`wl-slot${on ? ' on' : ''}${!full && s.places_left <= 2 ? ' few' : ''}`} onClick={() => pickSlot(s)}
                      >
                        <span className="wl-slot-time">{slotRange(s.slot_start, s.slot_end)}</span>
                        <span className="wl-slot-left">{placesLabel(s.places_left)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </Step>

            {picked && (
              <>
                <Step id="wl-h-seats" title="How many places?" note={`${placesLabel(picked.places_left)} at ${slotRange(picked.slot_start, picked.slot_end)}`}>
                  <div className="wl-seats" role="radiogroup" aria-labelledby="wl-h-seats" onKeyDown={onRadioKeys}>
                    {Array.from({ length: cap }, (_, i) => i + 1).map((n) => (
                      <button key={n} type="button" role="radio" aria-checked={seats === n} tabIndex={seats === n ? 0 : -1} aria-label={`${n} ${n === 1 ? 'place' : 'places'}`}
                        className={`wl-seat${seats === n ? ' on' : ''}`} onClick={() => setSeats(n)}>{n}</button>
                    ))}
                  </div>
                  {errors.seats ? <p className="sn-err" role="alert">{errors.seats}</p> : null}
                </Step>

                <Step id="wl-h-you" title="Your details">
                  <div className="sn-form">
                    <Field label="Your name" error={errors.name} htmlFor="wl-name">
                      <input id="wl-name" onBlur={blurCheck('name')} autoComplete="name" value={form.name} onChange={set('name')} maxLength={LIMITS.nameMax} />
                    </Field>
                    <Field label="Phone" error={errors.phone} hint="So we can reach you if anything changes." htmlFor="wl-phone">
                      <input id="wl-phone" onBlur={blurCheck('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" value={form.phone} onChange={set('phone')} />
                    </Field>
                    <Field label="Email" error={errors.email} hint="Your receipt and the booking details go here." htmlFor="wl-email">
                      <input id="wl-email" onBlur={blurCheck('email')} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} maxLength={LIMITS.emailMax} />
                    </Field>
                  </div>
                </Step>
              </>
            )}
          </div>

          <aside className="sn-panel wl-bill" aria-label="Your booking" ref={billRef}>
            <h2 className="wl-bill-h">Your booking</h2>
            <dl className="sn-facts">
              <div><dt>Session</dt>{chosen ? <dd>{chosen.name}</dd> : <dd className="wl-pending">choose one</dd>}</div>
              <div><dt>When</dt>{picked ? <dd>{slotLine(picked.slot_start, picked.slot_end)}</dd> : <dd className="wl-pending">pick a day and time</dd>}</div>
              <div><dt>Places</dt>{picked ? <dd>{seats} {seats === 1 ? 'person' : 'people'}</dd> : <dd className="wl-pending">—</dd>}</div>
            </dl>
            {bill ? (
              <dl className="wl-sum">
                <div><dt>{chosen.name} × {seats}</dt><dd>{rupees(bill.basePaise)}</dd></div>
                <div><dt>{gstLabel(settings.gst_rate)}</dt><dd>{rupees(bill.gstPaise)}</dd></div>
                <div className="wl-total"><dt>Total</dt><dd>{rupees(bill.totalPaise)}</dd></div>
              </dl>
            ) : null}
            {failure ? <p className="sn-failure" role="alert">{failure}</p> : null}
            <button type="submit" className="btn forest wl-pay" disabled={busy}>
              {busy ? 'Taking you to PhonePe…' : bill ? `Pay ${rupees(bill.totalPaise)} with PhonePe` : 'Pay with PhonePe'} {!busy && <Arrow />}
            </button>
            <CancelLine />
            <p className="sn-fine">Your place is held for {settings.hold_minutes || 10} minutes while you pay. Questions? <a href={CAFE_PHONE_TEL}>Call us</a>.</p>
          </aside>
        </div>
      </form>
    );
  }

  return (
    <main className="sn-view wl-view">
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url={seo.url}
        structuredData={[breadcrumb([{ name: 'Home', path: '/' }, { name: 'Sanctuary', path: '/sanctuary' }, { name: 'Ice bath & sauna', path: BOOKING_PATH }])]}
      />

      <header className="wl-hero">
        <div className="wl-hero-text">
          <Reveal><span className="eyebrow">Conscious Sanctuary · Auroville Road</span></Reveal>
          <Reveal delay={1} as="h1" className="display">Ice bath &amp;<br /><em>Ayurvedic sauna.</em></Reveal>
          <Reveal delay={2} as="p" className="lede">
            Heat, cold, or both in turn.
            {open ? ' Book your time and pay online.' : closed ? ' Message us and we’ll find you a time.' : ''}
          </Reveal>
          <Reveal delay={3} className="wl-hero-cta">
            {closed
              ? <a className="btn forest" href={waLink()} target="_blank" rel="noopener noreferrer">Book on WhatsApp <Arrow /></a>
              : <button type="button" className="btn forest" onClick={toBook}>Book a session <Arrow /></button>}
            <a className="sn-act" href={CAFE_PHONE_TEL}>Call {CAFE_PHONE}</a>
            {from > 0 ? <span className="wl-from">From {rupees(toPaise(from))} per person + GST</span> : null}
          </Reveal>
        </div>
        <div className="wl-duo">
          {ROOMS.map((r) => <Room key={r.key} room={r} />)}
        </div>
      </header>

      <section className="section tight wl-book" id="book" ref={bookRef} aria-labelledby={loaded ? 'wl-book-h' : undefined}>
        {booking}
      </section>

      <section className="section tight wl-more" aria-labelledby="wl-how-h">
        <h2 className="wl-sec-h" id="wl-how-h">How it works</h2>
        <ol className="wl-how">
          <li>
            <span className="wl-how-n" aria-hidden="true">1</span>
            <h3>Choose cold, heat or both</h3>
            <p>The ice bath, the Ayurvedic sauna, or a contrast session of the two.</p>
          </li>
          <li>
            <span className="wl-how-n" aria-hidden="true">2</span>
            <h3>{hour ? `Book ${hour}` : 'Book a time'}</h3>
            <p>{open ? 'Pick a day and a time here, and pay online with PhonePe.' : 'Message us on WhatsApp or call, and we’ll find you a time.'}</p>
          </li>
          <li>
            <span className="wl-how-n" aria-hidden="true">3</span>
            <h3>Finish in the café</h3>
            <p>Round it off next door with a kombucha or a cold-pressed juice.</p>
          </li>
        </ol>
      </section>

      <section className="section tight wl-more wl-faq" aria-labelledby="wl-faq-h">
        <h2 className="wl-sec-h" id="wl-faq-h">Questions</h2>
        {faqs.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>

      <section className="section tight wl-more wl-end" aria-labelledby="wl-end-h">
        <h2 className="wl-sec-h" id="wl-end-h">Ready for the cold, the heat, or both?</h2>
        <div className="wl-hero-cta">
          {closed
            ? <a className="btn forest" href={waLink()} target="_blank" rel="noopener noreferrer">Book on WhatsApp <Arrow /></a>
            : <button type="button" className="btn forest" onClick={toBook}>Book a session <Arrow /></button>}
          <a className="sn-act" href={CAFE_PHONE_TEL}>Call {CAFE_PHONE}</a>
        </div>
      </section>

      {loaded && (
        <PinnedBar target={bookRef}>
          {(away) => (
            <>
              <div className="sn-reserve-bar-info">
                <span className="sn-price">Ice bath &amp; sauna</span>
                <span className="sn-seats">{from > 0 ? `From ${rupees(toPaise(from))} + GST` : 'Auroville Road'}</span>
              </div>
              {closed
                ? <a className="btn forest" href={waLink()} target="_blank" rel="noopener noreferrer" tabIndex={away ? -1 : undefined}>WhatsApp <Arrow /></a>
                : <button type="button" className="btn forest" onClick={toBook} tabIndex={away ? -1 : undefined}>Book <Arrow /></button>}
            </>
          )}
        </PinnedBar>
      )}
    </main>
  );
};

export default RestorePage;

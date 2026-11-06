import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO, breadcrumb } from '../../utils/seoData';
import { getMenu, getSlots, book } from '../../services/wellnessService';
import { LIMITS, CAFE_PHONE, CAFE_PHONE_TEL, CAFE_WHATSAPP_URL, BOOKING_PATH } from '../../constants/wellness';
import {
  quote, rupees, priceLine, gstLabel, orderServices, usesLabel, dayStrip, weekChunkStart, slotsFor, seatCap,
  placesLabel, slotRange, slotLine, dayTile, dayCaption, stillBookable, validateBooking, bookErrorMessage, shouldRefetch,
} from '../../utils/wellness';
import { istToday } from '../../utils/sanctuary';
import { Arrow, Reveal, Field, Spinner } from '../Sanctuary/parts';
import '../Sanctuary/sanctuary.css';
import './wellness.css';

/* The booking page, one flow top to bottom: session → day → time → places →
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

const CancelLine = () => (
  <p className="wl-cancel-line">
    Need to cancel? Call or WhatsApp <a href={CAFE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{CAFE_PHONE}</a> — we refund in full.
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

  useEffect(() => () => { alive.current = false; }, []);

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
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pay = async (e) => {
    e.preventDefault();
    if (busy || !chosen || !picked) return;
    const { errors: errs, value } = validateBooking({ ...form, seats }, cap);
    setErrors(errs);
    setFailure(null);
    if (Object.keys(errs).length) return;
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

  const head = (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url={seo.url}
        structuredData={[breadcrumb([{ name: 'Home', path: '/' }, { name: 'Sanctuary', path: '/sanctuary' }, { name: 'Ice bath & sauna', path: BOOKING_PATH }])]}
      />
      <header className="sn-hero wl-hero">
        <Reveal><span className="eyebrow">Conscious Sanctuary · Auroville Road</span></Reveal>
        <Reveal delay={1} as="h1" className="display">Ice bath &amp;<br /><em>Ayurvedic sauna.</em></Reveal>
        <Reveal delay={2} as="p" className="lede">
          Book a time for the cold, the heat, or both in turn. Each time slot has a few places, so you may share it with others. Pay online with PhonePe.
        </Reveal>
      </header>
    </>
  );

  if (menu === undefined) {
    return <main className="sn-view wl-view">{head}<section className="section tight wl-book"><Spinner label="Opening the booking desk" /></section></main>;
  }
  if (menu === null) {
    return (
      <main className="sn-view wl-view">{head}
        <section className="section tight wl-book">
          <div className="wl-closed">
            <p className="wl-closed-h">We couldn’t load the booking desk.</p>
            <p>Check your connection and try again.</p>
            <button className="btn" onClick={() => setAttempt((n) => n + 1)}>Try again <Arrow /></button>
          </div>
        </section>
      </main>
    );
  }
  if (!services.length) {
    return (
      <main className="sn-view wl-view">{head}
        <section className="section tight wl-book">
          <div className="wl-closed" role="status">
            <p className="wl-closed-h">Booking opens soon.</p>
            <p>The rooms aren’t taking online bookings just yet. Call or WhatsApp us on {CAFE_PHONE} and we’ll find you a time.</p>
            <a className="btn" href={CAFE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp us <Arrow /></a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="sn-view wl-view">
      {head}
      <form className="section tight wl-book" onSubmit={pay} noValidate>
        <div className="wl-grid">
          <div className="wl-steps">
            <Step id="wl-h-svc" title="Choose a session">
              <div className="wl-services" role="radiogroup" aria-labelledby="wl-h-svc">
                {services.map((s) => (
                  <button
                    key={s.key} type="button" role="radio" aria-checked={service === s.key}
                    className={`wl-svc${service === s.key ? ' on' : ''}`} onClick={() => pickService(s.key)}
                  >
                    {s.uses && s.uses.length > 1 ? <span className="wl-svc-uses">{usesLabel(s.uses)}</span> : null}
                    <span className="wl-svc-name">{s.name}</span>
                    {s.description ? <span className="wl-svc-desc">{s.description}</span> : null}
                    <span className="wl-svc-price">{priceLine(s.price_inr)}</span>
                  </button>
                ))}
              </div>
            </Step>

            <Step id="wl-h-day" title="Pick a day">
              <div className="wl-days" role="radiogroup" aria-labelledby="wl-h-day">
                {days.map((d) => {
                  const t = dayTile(d);
                  const caption = dayCaption(d);
                  return (
                    <span className="wl-day-wrap" key={d}>
                      <button
                        type="button" role="radio" aria-checked={day === d} aria-label={`${t.weekday} ${t.day} ${t.month}${caption ? `, ${caption}` : ''}`}
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
                <div className="wl-slots" role="radiogroup" aria-labelledby="wl-h-time">
                  {daySlots.map((s) => {
                    const on = picked && picked.slot_start === s.slot_start;
                    const full = s.places_left <= 0;
                    return (
                      <button
                        key={s.slot_start} type="button" role="radio" aria-checked={!!on} disabled={full}
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
                  <div className="wl-seats" role="radiogroup" aria-labelledby="wl-h-seats">
                    {Array.from({ length: cap }, (_, i) => i + 1).map((n) => (
                      <button key={n} type="button" role="radio" aria-checked={seats === n} aria-label={`${n} ${n === 1 ? 'place' : 'places'}`}
                        className={`wl-seat${seats === n ? ' on' : ''}`} onClick={() => setSeats(n)}>{n}</button>
                    ))}
                  </div>
                  {errors.seats ? <p className="sn-err" role="alert">{errors.seats}</p> : null}
                </Step>

                <Step id="wl-h-you" title="Your details">
                  <div className="sn-form">
                    <Field label="Your name" error={errors.name} htmlFor="wl-name">
                      <input id="wl-name" autoComplete="name" value={form.name} onChange={set('name')} maxLength={LIMITS.nameMax} />
                    </Field>
                    <Field label="Phone" error={errors.phone} hint="So we can reach you if anything changes." htmlFor="wl-phone">
                      <input id="wl-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" value={form.phone} onChange={set('phone')} />
                    </Field>
                    <Field label="Email" error={errors.email} hint="Your receipt and the booking details go here." htmlFor="wl-email">
                      <input id="wl-email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} maxLength={LIMITS.emailMax} />
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
            <button type="submit" className="btn forest wl-pay" disabled={busy || !bill}>
              {busy ? 'Taking you to PhonePe…' : bill ? `Pay ${rupees(bill.totalPaise)} with PhonePe` : 'Pay with PhonePe'} {!busy && <Arrow />}
            </button>
            <CancelLine />
            <p className="sn-fine">Your place is held for {settings.hold_minutes || 10} minutes while you pay. Questions? <a href={CAFE_PHONE_TEL}>Call us</a>.</p>
          </aside>
        </div>
      </form>
    </main>
  );
};

export default RestorePage;

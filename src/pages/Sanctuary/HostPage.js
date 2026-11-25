import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { useAuth } from '../../context/AuthContext';
import {
  getMyHost, requestToHost, updateMyHost, listMyGatherings, getMyGathering, saveGathering,
  setGatheringStatus, deleteDraft, listRsvps, setRsvpStatus, uploadImage, imageUrl,
  createSeries, updateSeries, setSeriesStatus, deleteSeriesDrafts,
} from '../../services/sanctuaryService';
import { OFFERING_KINDS, LIMITS, IMAGE_TYPES, HOST_AUTH_COPY, WEEKDAYS } from '../../constants/sanctuary';
import {
  emptyOfferingForm, offeringToForm, duplicateForm, validateOffering, splitHostOfferings,
  seatsTaken, formatWhen, canPublish, isPast, isUuid, formatDay, formatClock,
  cleanEmail, cleanCode, authErrorKind,
  groupHostSeries, repeatLabel, weekdaysOf, weekdayOf, addDays, validateRepeat, seriesRows,
  seriesSummary, durationMinutes, durationLabel, priceLabel, seatsLabel, istToIso,
} from '../../utils/sanctuary';
import { Arrow, DateTile, KindTag, Field, Spinner } from './parts';
import './sanctuary.css';

// The database isn't there yet (migration not applied) or the provider is off.
const notOpenYet = (e) => /PGRST20[25]|42P01|does not exist|provider is not enabled|Unsupported provider/i
  .test(`${e?.code || ''} ${e?.message || ''}`);

/** A destructive button that asks for a second tap instead of a browser dialog. */
function ArmButton({ children, armed: armedLabel, onConfirm, className = 'sn-act', disabled }) {
  const [armed, setArmed] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const click = () => {
    if (armed) { clearTimeout(timer.current); setArmed(false); onConfirm(); return; }
    setArmed(true);
    timer.current = setTimeout(() => setArmed(false), 4000);
  };
  return (
    <button type="button" className={`${className}${armed ? ' armed' : ''}`} onClick={click} disabled={disabled}>
      {armed ? armedLabel : children}
    </button>
  );
}

// ── Before the dashboard ─────────────────────────────────────────────────────

/** Email → code → signed in. On success the auth context swaps this page out. */
function EmailSignIn() {
  const { sendEmailCode, verifyEmailCode } = useAuth();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (!wait) return undefined;
    const t = setTimeout(() => setWait((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async (raw) => {
    const to = cleanEmail(raw);
    if (!to) { setFailure(HOST_AUTH_COPY.bad_email); return; }
    setBusy(true); setFailure(null);
    const { error } = await sendEmailCode(to);
    setBusy(false);
    const kind = authErrorKind(error);
    // Rate-limited means a code went out moments ago — let them use it.
    if (!error || kind === 'slow_down') { setSentTo(to); setCode(''); setWait(LIMITS.codeResendSeconds); }
    if (error) setFailure(HOST_AUTH_COPY[kind]);
  };

  const verify = async (e) => {
    e.preventDefault();
    const token = cleanCode(code);
    if (!token) { setFailure('Enter the code from the email — just the numbers.'); return; }
    setBusy(true); setFailure(null);
    const { error } = await verifyEmailCode(sentTo, token);
    if (error) { setBusy(false); setFailure(HOST_AUTH_COPY[authErrorKind(error)]); }
  };

  if (!sentTo) {
    return (
      <form className="sn-form" onSubmit={(e) => { e.preventDefault(); if (!busy) send(email); }} noValidate>
        <div className="sn-inline">
          <Field label="Your email" htmlFor="sn-h-email">
            <input id="sn-h-email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} maxLength={LIMITS.emailMax} />
          </Field>
          <button type="submit" className="btn" disabled={busy}>{busy ? 'Sending…' : 'Email me a code'}</button>
        </div>
        {failure && <p className="sn-failure" role="alert">{failure}</p>}
      </form>
    );
  }

  return (
    <form className="sn-form" onSubmit={verify} noValidate>
      <p className="sn-sent">We’ve emailed a sign-in code to <strong>{sentTo}</strong>. It can take a minute — check spam too.</p>
      <div className="sn-inline sn-code">
        <Field label="Code from the email" htmlFor="sn-h-code">
          <input id="sn-h-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={12}
            value={code} onChange={(e) => setCode(e.target.value)} autoFocus />
        </Field>
        <button type="submit" className="btn forest" disabled={busy}>{busy ? 'Checking…' : 'Sign in'} {!busy && <Arrow />}</button>
      </div>
      {failure && <p className="sn-failure" role="alert">{failure}</p>}
      <div className="sn-gate-actions">
        <button type="button" className="sn-act" disabled={busy || wait > 0} onClick={() => send(sentTo)}>
          {wait > 0 ? `Send a new code in ${wait}s` : 'Send a new code'}
        </button>
        <button type="button" className="sn-act" disabled={busy} onClick={() => { setSentTo(null); setFailure(null); }}>
          Use a different email
        </button>
      </div>
    </form>
  );
}

function SignIn() {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);
  const go = async () => {
    setBusy(true); setFailure(null);
    const { error } = await signInWithGoogle('/sanctuary/host');
    if (error) {
      setBusy(false);
      setFailure(notOpenYet(error)
        ? 'Host sign-in opens very soon. Until then, message us on WhatsApp and we’ll set you up.'
        : 'We couldn’t reach Google just now. Please try again.');
    }
  };
  return (
    <div className="sn-gate">
      <span className="eyebrow">Conscious Sanctuary</span>
      <h1 className="display">Host at the <em>Sanctuary.</em></h1>
      <p className="lede">
        Teach a class, run a workshop, gather people for an evening. Sign in and tell us about your
        work — once we’ve said hello, you can publish to the calendar yourself and see who’s coming.
      </p>
      <button className="btn forest sn-google" onClick={go} disabled={busy}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
        {busy ? 'Opening Google…' : 'Continue with Google'}
      </button>
      {failure && <p className="sn-failure" role="alert">{failure}</p>}
      <p className="sn-or">or with your email</p>
      <EmailSignIn />
      <p className="sn-fine">We only use your name and email to know who you are. Visitors never need an account.</p>
    </div>
  );
}

function HostDetailsForm({ initial, submitLabel, onSubmit }) {
  const [form, setForm] = useState({
    displayName: initial.display_name || '', phone: initial.phone || '', link: initial.link || '', bio: initial.bio || '',
  });
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const v = { displayName: form.displayName.trim(), phone: form.phone.trim(), link: form.link.trim(), bio: form.bio.trim() };
    const errs = {};
    if (v.displayName.length < LIMITS.hostNameMin || v.displayName.length > LIMITS.hostNameMax) errs.displayName = 'The name visitors will see, 2–80 characters.';
    if (v.phone.length > LIMITS.hostPhoneMax) errs.phone = 'That number is too long.';
    if (v.link && !/^https?:\/\/\S+\.\S+/i.test(v.link)) errs.link = 'A full link, starting with https://';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setFailure(null);
    try { await onSubmit(v); } catch (err) { setFailure(err.message || 'Could not save. Please try again.'); setBusy(false); }
  };

  return (
    <form className="sn-form" onSubmit={submit} noValidate>
      <Field label="Name visitors will see" error={errors.displayName} htmlFor="sn-h-name">
        <input id="sn-h-name" value={form.displayName} onChange={set('displayName')} maxLength={LIMITS.hostNameMax} autoComplete="name" />
      </Field>
      <Field label="Phone (for us, not shown publicly)" error={errors.phone} htmlFor="sn-h-phone">
        <input id="sn-h-phone" type="tel" value={form.phone} onChange={set('phone')} maxLength={LIMITS.hostPhoneMax} autoComplete="tel" />
      </Field>
      <Field label="Website or Instagram (optional)" error={errors.link} hint="Shown on your gatherings." htmlFor="sn-h-link">
        <input id="sn-h-link" type="url" placeholder="https://" value={form.link} onChange={set('link')} maxLength={LIMITS.linkMax} />
      </Field>
      <Field label="About your work" hint="What you teach or hold, and how long you’ve been at it." htmlFor="sn-h-bio">
        <textarea id="sn-h-bio" rows={5} value={form.bio} onChange={set('bio')} maxLength={LIMITS.bioMax} />
      </Field>
      {failure && <p className="sn-failure" role="alert">{failure}</p>}
      <button type="submit" className="btn forest sn-submit" disabled={busy}>{busy ? 'Saving…' : submitLabel} {!busy && <Arrow />}</button>
    </form>
  );
}

function StatusPanel({ host, onSignOut }) {
  const copy = {
    requested: ['Thank you — we’ll be in touch.', 'Your request is with us. We usually reply within a few days, by phone or email. You’ll be able to publish gatherings here as soon as we’ve said yes.'],
    declined: ['We can’t take this on right now.', 'Thank you for reaching out. If things change on either side, write to us.'],
    paused: ['Your hosting is paused.', 'Your gatherings are hidden from the calendar for now. Message us to pick things back up.'],
  }[host.status];
  return (
    <div className="sn-gate">
      <span className="eyebrow">Host at the Sanctuary</span>
      <h1 className="display sn-gate-h">{copy[0]}</h1>
      <p className="lede">{copy[1]}</p>
      {host.decision_note && <blockquote className="sn-note">{host.decision_note}</blockquote>}
      <dl className="sn-facts">
        <div><dt>Name</dt><dd>{host.display_name}</dd></div>
        {host.email && <div><dt>Email</dt><dd>{host.email}</dd></div>}
        {host.link && <div><dt>Link</dt><dd>{host.link}</dd></div>}
      </dl>
      <div className="sn-gate-actions">
        <a className="btn" href="https://wa.me/918754561269" target="_blank" rel="noopener noreferrer">WhatsApp us <Arrow /></a>
        <button className="sn-act" onClick={onSignOut}>Sign out</button>
      </div>
    </div>
  );
}

// ── The dashboard ───────────────────────────────────────────────────────────

/** One gathering on the host's dashboard, with its actions. */
function HostRow({ o, taken, copied, onCopy, act, nested = false }) {
  const t = taken[o.id] || 0;
  const past = isPast(o);
  return (
    <li className={`sn-hrow st-${o.status}${nested ? ' nested' : ''}`}>
      <DateTile iso={o.starts_at} small />
      <div className="sn-hrow-main">
        <div className="sn-hrow-tags">
          {!nested && <KindTag kind={o.kind} />}
          <span className={`sn-status st-${o.status}`}>{{ draft: 'Draft', published: past ? 'Done' : 'Live', cancelled: 'Cancelled' }[o.status]}</span>
        </div>
        {!nested && <span className="sn-row-title">{o.title}</span>}
        <span className="sn-row-meta">
          {formatWhen(o.starts_at, o.ends_at)} · {o.capacity ? `${t} of ${o.capacity} reserved` : `${t} reserved`}
        </span>
      </div>
      <div className="sn-hrow-acts">
        <Link className="sn-act" to={`/sanctuary/host/rsvps/${o.id}`}>Guests ({t})</Link>
        {!past && o.status !== 'cancelled' && <Link className="sn-act" to={`/sanctuary/host/edit/${o.id}`}>Edit</Link>}
        {!nested && <Link className="sn-act" to="/sanctuary/host/new" state={{ duplicateOf: o.id }}>Duplicate</Link>}
        {o.status === 'published' && !past && (
          <button className="sn-act" onClick={() => onCopy(o.id)}>{copied === o.id ? 'Copied' : 'Copy link'}</button>
        )}
        {o.status === 'draft' && canPublish(o) && (
          <button className="sn-act strong" onClick={() => act(() => setGatheringStatus(o.id, 'published'))}>Publish</button>
        )}
        {o.status === 'published' && !past && (
          <ArmButton armed="Tap again to cancel it" onConfirm={() => act(() => setGatheringStatus(o.id, 'cancelled'))}>Cancel</ArmButton>
        )}
        {o.status === 'draft' && (
          <ArmButton armed="Tap again to delete" onConfirm={() => act(() => deleteDraft(o.id))}>Delete</ArmButton>
        )}
      </div>
    </li>
  );
}

/** A weekly series as one entry; its dates open underneath. */
function SeriesGroup({ rows, tab, taken, copied, onCopy, act }) {
  const [open, setOpen] = useState(false);
  const first = rows[0];
  const booked = rows.reduce((n, o) => n + (taken[o.id] || 0), 0);
  const live = rows.filter((o) => o.status === 'published' && !isPast(o));
  return (
    <li className="sn-hseries">
      <div className={`sn-hrow st-${first.status}`}>
        <DateTile iso={first.starts_at} small />
        <div className="sn-hrow-main">
          <div className="sn-hrow-tags">
            <KindTag kind={first.kind} />
            <span className="sn-repeat">{repeatLabel(weekdaysOf(rows))}</span>
          </div>
          <span className="sn-row-title">{first.title}</span>
          <span className="sn-row-meta">
            {rows.length} dates · next {formatWhen(first.starts_at, first.ends_at)} · {booked} reserved
          </span>
        </div>
        <div className="sn-hrow-acts">
          <button className="sn-act" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? 'Hide dates' : 'Show dates'}</button>
          {tab !== 'past' && <Link className="sn-act" to={`/sanctuary/host/edit/${first.id}`} state={{ scope: 'following' }}>Edit all</Link>}
          {tab === 'drafts' && (
            <button className="sn-act strong" onClick={() => act(() => setSeriesStatus(first.series_id, 'draft', 'published'))}>Publish all</button>
          )}
          {tab === 'drafts' && (
            <ArmButton armed="Tap again to delete every draft" onConfirm={() => act(() => deleteSeriesDrafts(first.series_id))}>Delete all</ArmButton>
          )}
          {tab === 'upcoming' && live.length > 0 && (
            <ArmButton armed={`Tap again to cancel ${live.length} dates`} onConfirm={() => act(() => setSeriesStatus(first.series_id, 'published', 'cancelled'))}>Cancel all</ArmButton>
          )}
        </div>
      </div>
      {open && (
        <ul className="sn-hlist sn-hlist-nested">
          {rows.map((o) => <HostRow key={o.id} o={o} taken={taken} copied={copied} onCopy={onCopy} act={act} nested />)}
        </ul>
      )}
    </li>
  );
}

function Dashboard({ host, onSignOut }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  const [taken, setTaken] = useState({});
  const [tab, setTab] = useState('upcoming');
  const [failure, setFailure] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = useCallback(async () => {
    try {
      const [g, r] = await Promise.all([listMyGatherings(), listRsvps()]);
      setRows(g); setTaken(seatsTaken(r)); setFailure(null);
    } catch (e) {
      setFailure(e.message || 'Could not load your gatherings.');
      setRows((prev) => prev || []);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const split = useMemo(() => splitHostOfferings(rows || []), [rows]);
  const act = async (fn) => {
    setFailure(null);
    try { await fn(); await load(); } catch (e) { setFailure(e.message || 'That didn’t work. Please try again.'); }
  };
  const copyLink = async (id) => {
    const url = `${window.location.origin}/sanctuary/${id}`;
    try { await navigator.clipboard.writeText(url); setCopied(id); setTimeout(() => setCopied(null), 2000); } catch { window.prompt('Copy this link', url); }
  };

  const TABS = [['upcoming', 'Upcoming'], ['drafts', 'Drafts'], ['past', 'Past']];
  const list = split[tab];
  // Past stays date by date; upcoming and drafts show a weekly class once.
  const entries = useMemo(() => (tab === 'past' ? list.map((o) => ({ key: o.id, row: o })) : groupHostSeries(list)), [list, tab]);
  const shared = { taken, copied, onCopy: copyLink, act };

  return (
    <div className="sn-dash">
      <div className="sn-dash-head">
        <div>
          <span className="eyebrow">Host at the Sanctuary</span>
          <h1 className="display sn-dash-h">Welcome, <em>{host.display_name.split(' ')[0]}.</em></h1>
        </div>
        <div className="sn-dash-tools">
          <button className="btn forest" onClick={() => navigate('/sanctuary/host/new')}>New gathering <Arrow /></button>
          <Link className="sn-act" to={`/sanctuary/hosts/${host.user_id}`}>Your public page</Link>
          <Link className="sn-act" to="/sanctuary/host/profile">Your details</Link>
          <button className="sn-act" onClick={onSignOut}>Sign out</button>
        </div>
      </div>

      <div className="sn-filters" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`sn-chip${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>
            {label}<span className="sn-chip-n">{rows ? (k === 'past' ? split[k].length : groupHostSeries(split[k]).length) : '–'}</span>
          </button>
        ))}
      </div>

      {failure && <p className="sn-failure" role="alert">{failure}</p>}

      {!rows ? <Spinner /> : list.length === 0 ? (
        <div className="sn-empty">
          <p className="sn-empty-h">{{ upcoming: 'Nothing coming up yet.', drafts: 'No drafts.', past: 'Nothing in the past yet.' }[tab]}</p>
          {tab !== 'past' && <button className="btn" onClick={() => navigate('/sanctuary/host/new')}>Create a gathering <Arrow /></button>}
        </div>
      ) : (
        <ul className="sn-hlist">
          {entries.map((e) => (e.series
            ? <SeriesGroup key={e.key} rows={e.series} tab={tab} {...shared} />
            : <HostRow key={e.key} o={e.row} {...shared} />))}
        </ul>
      )}
    </div>
  );
}

// ── Create / edit ───────────────────────────────────────────────────────────

// A new gathering happens once unless the host says otherwise.
const NO_REPEAT = { repeat: 'once', weekdays: [], untilDate: '' };

// One line under each kind, so a host can tell them apart before choosing.
const KIND_HINTS = {
  event: 'An evening or an afternoon: a talk, a concert, a circle.',
  class: 'A regular practice: yoga, movement, breath.',
  workshop: 'Deeper and hands-on, for a few hours or a weekend.',
};

// Which error a changed field can clear.
const ERROR_OF = {
  kind: 'kind', title: 'title', description: 'description', startDate: 'start', startTime: 'start',
  endDate: 'end', endTime: 'end', location: 'location', price: 'price', capacity: 'capacity',
  repeat: 'repeat', weekdays: 'repeat', untilDate: 'repeat',
};

// The order the form reads in, so a failed save lands on the first problem.
const ERROR_ORDER = ['kind', 'title', 'start', 'end', 'repeat', 'location', 'price', 'capacity', 'description'];

/** A label over a group of buttons or radios. Field is a <label>, which can't hold several controls. */
const Group = ({ label, id, error, hint, children }) => (
  <div className={`sn-field${error ? ' has-error' : ''}`}>
    <span className="sn-label" id={id}>{label}</span>
    {children}
    {error ? <span className="sn-err" role="alert">{error}</span> : hint ? <span className="sn-hint">{hint}</span> : null}
  </div>
);

const Step = ({ title, note, children }) => (
  <section className="sn-step">
    <h2 className="sn-step-h">{title}{note && <span className="sn-step-note">{note}</span>}</h2>
    {children}
  </section>
);

/** The calendar row as visitors will see it, built from the form as typed. Not a link: there is no page yet. */
function Preview({ value, hostName, repeat, more, editing }) {
  const img = imageUrl(value.image_path);
  const when = value.starts_at ? formatWhen(value.starts_at, value.ends_at || undefined) : 'Pick a date and time';
  return (
    <div className="sn-pv">
      {value.starts_at ? <DateTile iso={value.starts_at} /> : (
        <div className="sn-tile is-empty" aria-hidden="true">
          <span className="sn-tile-dow">&nbsp;</span><span className="sn-tile-day">–</span><span className="sn-tile-mon">&nbsp;</span>
        </div>
      )}
      <div className="sn-row-main">
        <span className="sn-row-tags">
          <KindTag kind={value.kind} />
          {repeat && <span className="sn-repeat">{repeat}</span>}
        </span>
        <span className={`sn-row-title${value.title ? '' : ' is-empty'}`}>{value.title || 'Your title'}</span>
        <span className="sn-row-meta">
          {when}
          {hostName ? <> · with {hostName}</> : null}
          {more ? <> · and {more} more {more === 1 ? 'date' : 'dates'}</> : null}
        </span>
      </div>
      {img && <img className="sn-row-img" src={img} alt="" />}
      <div className="sn-row-side">
        <span className="sn-price">{priceLabel(value.price_inr)}</span>
        {/* editing: some places may be taken already, so show the total, not what's left */}
        <span className="sn-seats">{editing && value.capacity ? `${value.capacity} ${value.capacity === 1 ? 'place' : 'places'}` : seatsLabel(value.capacity, value.capacity)}</span>
      </div>
    </div>
  );
}

function Editor({ userId, hostName }) {
  const { gid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const duplicateOf = location.state?.duplicateOf;
  const [form, setForm] = useState(gid || duplicateOf ? null : { ...emptyOfferingForm(), ...NO_REPEAT });
  // Editing one date of a weekly series: just it, or it and every later date.
  const [scope, setScope] = useState(location.state?.scope === 'following' ? 'following' : 'one');
  const [original, setOriginal] = useState(null);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoFailure, setPhotoFailure] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [multiDay, setMultiDay] = useState(false);

  useEffect(() => {
    const src = gid || duplicateOf;
    if (!src) return;
    if (!isUuid(src)) { navigate('/sanctuary/host', { replace: true }); return; }
    getMyGathering(src).then((row) => {
      if (!row) { navigate('/sanctuary/host', { replace: true }); return; }
      if (gid) { setOriginal(row); setForm(offeringToForm(row)); } else { setForm({ ...duplicateForm(row), ...NO_REPEAT }); }
    }).catch((e) => setFailure(e.message));
  }, [gid, duplicateOf, navigate]);

  if (!form) return failure ? <p className="sn-failure">{failure}</p> : <Spinner />;

  /** Change fields, and drop any error they were showing. */
  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    const keys = Object.keys(patch).map((k) => ERROR_OF[k]).filter(Boolean);
    setErrors((e) => {
      if (!keys.some((k) => e[k])) return e;
      const next = { ...e };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  };
  const set = (k) => (e) => update({ [k]: e.target.value });

  const isPublished = original?.status === 'published';
  const inSeries = Boolean(gid && original?.series_id);
  const following = inSeries && scope === 'following';
  const weekly = !gid && form.repeat === 'weekly';
  const repeatCheck = weekly ? validateRepeat(form) : null;
  const seriesOk = Boolean(repeatCheck && !repeatCheck.errors.repeat);
  const { value } = validateOffering(form);
  const showEndDate = multiDay || Boolean(form.endDate);
  const duration = durationLabel(value.starts_at, value.ends_at);
  const endsEarly = Boolean(value.starts_at && value.ends_at && !duration);

  const setRepeat = (repeat) => {
    if (repeat !== 'weekly') { update({ repeat }); return; }
    const wd = weekdayOf(form.startDate);
    update({
      repeat,
      weekdays: form.weekdays.length ? form.weekdays : (wd === null ? [] : [wd]),
      untilDate: form.untilDate || (form.startDate ? addDays(form.startDate, 49) : ''),
    });
  };
  const toggleDay = (v) => update({ weekdays: form.weekdays.includes(v) ? form.weekdays.filter((d) => d !== v) : [...form.weekdays, v] });
  const oneDay = () => { setMultiDay(false); update({ endDate: '' }); };
  const manyDays = () => { setMultiDay(true); if (form.startDate) update({ endDate: addDays(form.startDate, 1) }); };

  const upload = async (file) => {
    if (!file) return;
    setUploading(true); setPhotoFailure(null);
    try { const path = await uploadImage(userId, file); update({ imagePath: path }); } catch (err) { setPhotoFailure(err.message || 'That photo didn’t upload. Try again, or try another one.'); }
    setUploading(false);
  };
  const onPick = (e) => { const file = e.target.files?.[0]; e.target.value = ''; upload(file); };
  const drop = {
    onDragOver: (e) => { e.preventDefault(); if (!uploading) setDragging(true); },
    onDragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); },
    onDrop: (e) => { e.preventDefault(); setDragging(false); if (!uploading) upload(e.dataTransfer.files?.[0]); },
  };

  /** Bring the first field that needs attention into view and put the cursor in it. */
  const goToError = (errs) => {
    const key = ERROR_ORDER.find((k) => errs[k]);
    const id = {
      kind: 'sn-e-kind-event', title: 'sn-e-title', start: 'sn-e-date', end: 'sn-e-end',
      repeat: form.weekdays.length ? 'sn-e-until' : 'sn-e-day-1', location: 'sn-e-loc', price: 'sn-e-price',
      capacity: 'sn-e-cap', description: 'sn-e-desc',
    }[key];
    const el = id && document.getElementById(id);
    if (!el) return;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' });
    el.focus({ preventScroll: true });
  };

  const save = async (status) => {
    const { errors: errs, value: row0 } = validateOffering(form);
    const rep = weekly ? validateRepeat(form) : { errors: {}, dates: [] };
    Object.assign(errs, rep.errors);
    if (status === 'published' && row0.starts_at && !canPublish(row0)) errs.start = 'That time has already passed.';
    setErrors(errs); setFailure(null);
    if (Object.keys(errs).length) { goToError(errs); return; }
    setBusy(true);
    const row = { ...row0, ...(status ? { status } : {}) };
    try {
      if (following) {
        await updateSeries(original.series_id, original.starts_at, row0, form.startTime, durationMinutes(row0));
      } else if (weekly) {
        await createSeries(userId, seriesRows(form, row, rep.dates, crypto.randomUUID()));
      } else {
        await saveGathering(userId, row, gid || null);
      }
      navigate('/sanctuary/host');
    } catch (err) {
      setFailure(err.message || 'Could not save. Please try again.');
      setBusy(false);
    }
  };

  const errorCount = Object.keys(errors).length;
  const missing = [!value.title && 'a title', !value.starts_at && 'a date'].filter(Boolean);
  const heading = following ? 'Edit every later date' : gid ? 'Edit gathering' : duplicateOf ? 'Duplicate gathering' : 'New gathering';
  const sideNote = following
    ? 'Saving updates every later date in this series.'
    : isPublished
      ? 'This is live. Your changes show on the calendar as soon as you save.'
      : weekly && seriesOk
        ? `Publishing puts all ${repeatCheck.dates.length} dates on the calendar. A draft stays here, where only you can see it.`
        : 'Publishing puts it on the calendar straight away. A draft stays here, where only you can see it.';
  const descLen = form.description.length;

  return (
    <div className="sn-editor sn-editor-wide">
      <div className="sn-editor-head">
        <Link className="sn-back" to="/sanctuary/host">← Your gatherings</Link>
        <h1 className="display sn-dash-h">{heading}</h1>
        {duplicateOf && <p className="sn-hint">Same details, one week later. Change anything before you save.</p>}
        {inSeries && (
          <div className="sn-scope">
            <div className="sn-seg" role="radiogroup" aria-label="Change">
              {[['one', 'This date only'], ['following', 'This and later dates']].map(([v, label]) => (
                <button type="button" key={v} role="radio" aria-checked={scope === v}
                  className={`sn-seg-opt${scope === v ? ' on' : ''}`} onClick={() => setScope(v)}>{label}</button>
              ))}
            </div>
            <p className="sn-hint">
              {following
                ? 'Every later date keeps its own day and takes these details, start time and length. Cancelled dates are left alone.'
                : 'Only this date changes. The rest of the series stays as it is.'}
            </p>
          </div>
        )}
      </div>

      <form className="sn-editor-grid" onSubmit={(e) => { e.preventDefault(); save(isPublished || following ? undefined : 'draft'); }} noValidate>
        <div className="sn-steps">
          <Step title="What it is">
            <Group label="Kind" id="sn-e-kind-l" error={errors.kind}>
              <div className="sn-kinds" role="radiogroup" aria-labelledby="sn-e-kind-l">
                {OFFERING_KINDS.map((k) => (
                  <label key={k.value} className={`sn-kindcard k-${k.value}${form.kind === k.value ? ' on' : ''}`}>
                    <input type="radio" className="sr-only" name="sn-e-kind" id={`sn-e-kind-${k.value}`} value={k.value}
                      checked={form.kind === k.value} onChange={() => update({ kind: k.value })} />
                    <span className="sn-kindcard-name">{k.label}</span>
                    <span className="sn-kindcard-desc">{KIND_HINTS[k.value]}</span>
                  </label>
                ))}
              </div>
            </Group>
            <Field label="Title" error={errors.title} htmlFor="sn-e-title"
              hint={form.title.length > LIMITS.titleMax - 30 ? `${form.title.length} of ${LIMITS.titleMax} characters` : null}>
              <input id="sn-e-title" className="sn-title-input" value={form.title} onChange={set('title')} maxLength={LIMITS.titleMax}
                placeholder="Morning Hatha, Full-moon sound bath…" />
            </Field>
          </Step>

          <Step title="When" note="Auroville time">
            {showEndDate ? (
              <div className="sn-grid2">
                <Field label={weekly ? 'First date' : 'Starts on'} error={errors.start} htmlFor="sn-e-date">
                  <input id="sn-e-date" type="date" value={form.startDate} onChange={set('startDate')} disabled={following} />
                </Field>
                <Field label="Start time" htmlFor="sn-e-start">
                  <input id="sn-e-start" type="time" value={form.startTime} onChange={set('startTime')} />
                </Field>
                <Field label="Ends on" htmlFor="sn-e-enddate">
                  <input id="sn-e-enddate" type="date" value={form.endDate} min={form.startDate || undefined} onChange={set('endDate')} disabled={following} />
                </Field>
                <Field label="End time" error={errors.end} htmlFor="sn-e-end">
                  <input id="sn-e-end" type="time" value={form.endTime} onChange={set('endTime')} />
                </Field>
              </div>
            ) : (
              <div className="sn-grid3">
                <Field label={weekly ? 'First date' : 'Date'} error={errors.start} htmlFor="sn-e-date">
                  <input id="sn-e-date" type="date" value={form.startDate} onChange={set('startDate')} disabled={following} />
                </Field>
                <Field label="Starts" htmlFor="sn-e-start">
                  <input id="sn-e-start" type="time" value={form.startTime} onChange={set('startTime')} />
                </Field>
                <Field label="Ends" error={errors.end} htmlFor="sn-e-end">
                  <input id="sn-e-end" type="time" value={form.endTime} onChange={set('endTime')} />
                </Field>
              </div>
            )}
            <div className="sn-when-foot">
              <span className="sn-dur" aria-live="polite">
                {duration ? `Runs ${duration}` : endsEarly && !errors.end ? 'It ends before it starts. Check the times.' : ''}
              </span>
              {!following && (showEndDate
                ? <button type="button" className="sn-act" onClick={oneDay}>Make it one day</button>
                : <button type="button" className="sn-act" onClick={manyDays}>Make it multi-day</button>)}
            </div>

            {!gid && (
              <Group label="Repeats" id="sn-e-repeat-l" error={errors.repeat}>
                <div className="sn-seg" role="radiogroup" aria-labelledby="sn-e-repeat-l">
                  {[['once', 'Once'], ['weekly', 'Weekly']].map(([v, label]) => (
                    <button type="button" key={v} role="radio" aria-checked={form.repeat === v}
                      className={`sn-seg-opt${form.repeat === v ? ' on' : ''}`} onClick={() => setRepeat(v)}>{label}</button>
                  ))}
                </div>
              </Group>
            )}
            {weekly && (
              <div className="sn-repeatbox">
                <Group label="On these days" id="sn-e-days-l">
                  <div className="sn-days" role="group" aria-labelledby="sn-e-days-l">
                    {WEEKDAYS.map((w) => (
                      <button type="button" key={w.value} id={`sn-e-day-${w.value}`} aria-pressed={form.weekdays.includes(w.value)} aria-label={w.name}
                        className={`sn-day${form.weekdays.includes(w.value) ? ' on' : ''}`} onClick={() => toggleDay(w.value)}>
                        {w.short}
                      </button>
                    ))}
                  </div>
                </Group>
                <Field label="Last date" htmlFor="sn-e-until">
                  <input id="sn-e-until" type="date" value={form.untilDate} min={form.startDate || undefined} onChange={set('untilDate')} />
                </Field>
                <p className="sn-repeat-preview" aria-live="polite">
                  {seriesOk
                    ? <><strong>{repeatLabel(form.weekdays)}</strong>, {seriesSummary(repeatCheck.dates)}. Each date has its own places and guest list.</>
                    : repeatCheck?.errors.repeat}
                </p>
                {seriesOk && (
                  <ul className="sn-series-dates" aria-label="The dates">
                    {repeatCheck.dates.map((d) => <li key={d}>{formatDay(istToIso(d, '12:00'))}</li>)}
                  </ul>
                )}
              </div>
            )}
          </Step>

          <Step title="Where, price and places">
            <Field label="Where" error={errors.location} hint="Change this only if it’s somewhere else." htmlFor="sn-e-loc">
              <input id="sn-e-loc" value={form.location} onChange={set('location')} maxLength={LIMITS.locationMax} />
            </Field>
            <div className="sn-grid2">
              <Field label="Price per person" error={errors.price} hint="Blank if it’s free. Guests pay at the venue." htmlFor="sn-e-price">
                <span className="sn-money">
                  <span aria-hidden="true">₹</span>
                  <input id="sn-e-price" type="number" min="0" step="1" inputMode="decimal" value={form.price} onChange={set('price')} />
                </span>
              </Field>
              <Field label="Places" error={errors.capacity} hint="Blank for no limit." htmlFor="sn-e-cap">
                <input id="sn-e-cap" type="number" min="1" max={LIMITS.capacityMax} step="1" inputMode="numeric" value={form.capacity} onChange={set('capacity')} />
              </Field>
            </div>
          </Step>

          <Step title="In your words">
            <Field label="Description" error={errors.description} htmlFor="sn-e-desc"
              hint={descLen > LIMITS.descriptionMax - 1000
                ? `${descLen.toLocaleString('en-IN')} of ${LIMITS.descriptionMax.toLocaleString('en-IN')} characters`
                : 'Who it’s for, what to bring, what to expect. A blank line starts a new paragraph.'}>
              <textarea id="sn-e-desc" rows={9} value={form.description} onChange={set('description')} maxLength={LIMITS.descriptionMax} />
            </Field>
          </Step>

          <Step title="Photo" note="Optional">
            <div className={`sn-photo${dragging ? ' drag' : ''}`} {...drop}>
              {form.imagePath ? (
                <>
                  <img src={imageUrl(form.imagePath)} alt="" />
                  <div className="sn-photo-acts">
                    <label className="sn-act">
                      {uploading ? 'Uploading…' : 'Replace'}
                      <input type="file" className="sr-only" accept={IMAGE_TYPES.join(',')} onChange={onPick} disabled={uploading} />
                    </label>
                    <button type="button" className="sn-act" disabled={uploading} onClick={() => update({ imagePath: null })}>Remove</button>
                  </div>
                </>
              ) : (
                <label className="sn-photo-drop">
                  <input type="file" className="sr-only" accept={IMAGE_TYPES.join(',')} onChange={onPick} disabled={uploading} />
                  <span className="sn-photo-drop-h">{uploading ? 'Uploading…' : 'Add a photo'}</span>
                  <span className="sn-hint">Choose one<span className="sn-photo-dnd">, or drop it here</span>. JPG, PNG or WebP, up to 5 MB.</span>
                </label>
              )}
            </div>
            {photoFailure
              ? <p className="sn-failure" role="alert">{photoFailure}</p>
              : <p className="sn-hint">It leads your row on the calendar and the top of your page, shown whole and never cropped.</p>}
          </Step>
        </div>

        <aside className="sn-panel sn-editor-side" aria-label="Preview and save">
          <div className="sn-side-top">
            <h2 className="sn-side-h">How it will look</h2>
            <Preview
              value={value}
              hostName={hostName}
              repeat={seriesOk ? repeatLabel(form.weekdays) : ''}
              more={seriesOk ? repeatCheck.dates.length - 1 : 0}
              editing={Boolean(gid)}
            />
            <p className="sn-side-note">{sideNote}</p>
          </div>
          {errorCount > 0 ? (
            <p className="sn-side-warn">{errorCount === 1 ? 'One field needs a look' : `${errorCount} fields need a look`} before this can be saved.</p>
          ) : !isPublished && !following && missing.length > 0 ? (
            <p className="sn-side-todo">Add {missing.join(' and ')} to publish.</p>
          ) : null}
          {failure && <p className="sn-failure" role="alert">{failure}</p>}
          <div className="sn-editor-acts">
            {following ? (
              <button type="submit" className="btn forest" disabled={busy || uploading}>{busy ? 'Saving…' : 'Save every later date'}</button>
            ) : isPublished ? (
              <button type="submit" className="btn forest" disabled={busy || uploading}>{busy ? 'Saving…' : 'Save changes'}</button>
            ) : (
              <>
                <button type="button" className="btn forest" disabled={busy || uploading} onClick={() => save('published')}>
                  {busy ? 'Saving…' : weekly ? 'Publish all dates' : 'Publish'} {!busy && <Arrow />}
                </button>
                <button type="submit" className="btn" disabled={busy || uploading}>Save as draft</button>
              </>
            )}
            <Link className="sn-act" to="/sanctuary/host">Leave without saving</Link>
          </div>
        </aside>
      </form>
    </div>
  );
}

// ── Guests ──────────────────────────────────────────────────────────────────

function Guests() {
  const { gid } = useParams();
  const [g, setG] = useState(null);
  const [rows, setRows] = useState(null);
  const [failure, setFailure] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const [o, r] = await Promise.all([getMyGathering(gid), listRsvps(gid)]);
      setG(o); setRows(r); setFailure(null);
    } catch (e) { setFailure(e.message); setRows((p) => p || []); }
  }, [gid]);
  useEffect(() => { if (isUuid(gid)) load(); else setRows([]); }, [gid, load]);

  if (!rows) return <Spinner />;
  if (!g) return <div className="sn-empty"><p className="sn-empty-h">Not one of your gatherings.</p><Link className="btn" to="/sanctuary/host">Back <Arrow /></Link></div>;

  const confirmed = rows.filter((r) => r.status === 'confirmed');
  const seats = confirmed.reduce((n, r) => n + r.seats, 0);
  const copyPhones = async () => {
    const text = confirmed.map((r) => `${r.name}\t${r.phone}`).join('\n');
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt('Copy', text); }
  };

  return (
    <div className="sn-guests">
      <Link className="sn-back" to="/sanctuary/host">← Your gatherings</Link>
      <span className="eyebrow">Guests</span>
      <h1 className="display sn-dash-h">{g.title}</h1>
      <p className="sn-row-meta">{formatWhen(g.starts_at, g.ends_at)} · {seats}{g.capacity ? ` of ${g.capacity}` : ''} places reserved by {confirmed.length} {confirmed.length === 1 ? 'person' : 'people'}</p>
      {failure && <p className="sn-failure" role="alert">{failure}</p>}
      {rows.length === 0 ? (
        <div className="sn-empty"><p className="sn-empty-h">No reservations yet.</p><p>Share the link to your gathering to get the word out.</p></div>
      ) : (
        <>
          <button className="sn-act" onClick={copyPhones} disabled={!confirmed.length}>{copied ? 'Copied' : 'Copy names & numbers'}</button>
          <table className="sn-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Places</th><th>Reserved</th><th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.status === 'cancelled' ? 'is-cancelled' : ''}>
                  <td data-label="Name">{r.name}</td>
                  <td data-label="Phone"><a href={`tel:${r.phone}`}>{r.phone}</a></td>
                  <td data-label="Email">{r.email ? <a href={`mailto:${r.email}`}>{r.email}</a> : '—'}</td>
                  <td data-label="Places">{r.seats}</td>
                  <td data-label="Reserved">{formatDay(r.created_at)}, {formatClock(r.created_at)}</td>
                  <td>
                    {r.status === 'confirmed'
                      ? <ArmButton armed="Tap again" onConfirm={async () => { try { await setRsvpStatus(r.id, 'cancelled'); load(); } catch (e) { setFailure(e.message); } }}>Cancel</ArmButton>
                      : <span className="sn-status st-cancelled">Cancelled</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function Profile({ host, onSaved }) {
  const navigate = useNavigate();
  return (
    <div className="sn-editor">
      <Link className="sn-back" to="/sanctuary/host">← Your gatherings</Link>
      <h1 className="display sn-dash-h">Your details</h1>
      <HostDetailsForm initial={host} submitLabel="Save" onSubmit={async (v) => { onSaved(await updateMyHost(host.user_id, v)); navigate('/sanctuary/host'); }} />
    </div>
  );
}

// ── The page ────────────────────────────────────────────────────────────────

const HostPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [host, setHost] = useState(undefined); // undefined = loading, null = never asked
  const [failure, setFailure] = useState(null);

  useEffect(() => {
    if (!user) { setHost(undefined); return; }
    let alive = true;
    getMyHost(user.id)
      .then((h) => alive && setHost(h))
      .catch((e) => alive && setFailure(e));
    return () => { alive = false; };
  }, [user]);

  const out = async () => { await signOut(); navigate('/sanctuary'); };

  let body;
  if (loading) body = <Spinner />;
  else if (!user) body = <SignIn />;
  else if (failure) {
    body = (
      <div className="sn-gate">
        <h1 className="display sn-gate-h">{notOpenYet(failure) ? 'Hosting opens very soon.' : 'Something went wrong.'}</h1>
        <p className="lede">{notOpenYet(failure) ? 'We’re putting the finishing touches on it. Message us on WhatsApp in the meantime.' : 'Please reload the page and try again.'}</p>
        <button className="sn-act" onClick={out}>Sign out</button>
      </div>
    );
  } else if (host === undefined) body = <Spinner />;
  else if (host === null) {
    const meta = user.user_metadata || {};
    body = (
      <div className="sn-gate">
        <span className="eyebrow">Signed in as {user.email}</span>
        <h1 className="display sn-gate-h">Tell us about <em>your work.</em></h1>
        <p className="lede">A few lines is plenty. We read every request and reply personally.</p>
        <HostDetailsForm
          initial={{ display_name: meta.full_name || meta.name || '' }}
          submitLabel="Send my request"
          onSubmit={async (v) => setHost(await requestToHost(user.id, v))}
        />
        <button className="sn-act" onClick={out}>Not you? Sign out</button>
      </div>
    );
  } else if (host.status !== 'approved') body = <StatusPanel host={host} onSignOut={out} />;
  else {
    body = (
      <Routes>
        <Route index element={<Dashboard host={host} onSignOut={out} />} />
        <Route path="new" element={<Editor userId={user.id} hostName={host.display_name} />} />
        <Route path="edit/:gid" element={<Editor userId={user.id} hostName={host.display_name} />} />
        <Route path="rsvps/:gid" element={<Guests />} />
        <Route path="profile" element={<Profile host={host} onSaved={setHost} />} />
        <Route path="*" element={<Dashboard host={host} onSignOut={out} />} />
      </Routes>
    );
  }

  return (
    <main className="sn-view sn-host-view">
      <SEO title="Host at the Sanctuary | Conscious Sanctuary" url="/sanctuary/host" noIndex />
      {body}
    </main>
  );
};

export default HostPage;

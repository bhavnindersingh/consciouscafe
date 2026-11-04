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
  seriesSummary, durationMinutes,
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

function Editor({ userId }) {
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

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isPublished = original?.status === 'published';
  const inSeries = Boolean(gid && original?.series_id);
  const following = inSeries && scope === 'following';
  const weekly = !gid && form.repeat === 'weekly';
  const repeatCheck = weekly ? validateRepeat(form) : null;

  const setRepeat = (repeat) => setForm((f) => {
    if (repeat !== 'weekly') return { ...f, repeat };
    const wd = weekdayOf(f.startDate);
    return {
      ...f,
      repeat,
      weekdays: f.weekdays.length ? f.weekdays : (wd === null ? [] : [wd]),
      untilDate: f.untilDate || (f.startDate ? addDays(f.startDate, 49) : ''),
    };
  });
  const toggleDay = (v) => setForm((f) => ({
    ...f, weekdays: f.weekdays.includes(v) ? f.weekdays.filter((d) => d !== v) : [...f.weekdays, v],
  }));

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true); setFailure(null);
    try { const path = await uploadImage(userId, file); setForm((f) => ({ ...f, imagePath: path })); } catch (err) { setFailure(err.message || 'Upload failed.'); }
    setUploading(false);
  };

  const save = async (status) => {
    const { errors: errs, value } = validateOffering(form);
    const rep = weekly ? validateRepeat(form) : { errors: {}, dates: [] };
    Object.assign(errs, rep.errors);
    if (status === 'published' && value.starts_at && !canPublish(value)) errs.start = 'That time has already passed.';
    setErrors(errs); setFailure(null);
    if (Object.keys(errs).length) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setBusy(true);
    const row = { ...value, ...(status ? { status } : {}) };
    try {
      if (following) {
        await updateSeries(original.series_id, original.starts_at, value, form.startTime, durationMinutes(value));
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

  return (
    <div className="sn-editor">
      <Link className="sn-back" to="/sanctuary/host">← Your gatherings</Link>
      <h1 className="display sn-dash-h">{following ? 'Edit every later date' : gid ? 'Edit gathering' : duplicateOf ? 'Duplicate gathering' : 'New gathering'}</h1>
      {duplicateOf && <p className="sn-hint">Same details, one week later — change anything before you save.</p>}
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

      <form className="sn-form sn-form-wide" onSubmit={(e) => { e.preventDefault(); save(isPublished || following ? undefined : 'draft'); }} noValidate>
        <Field label="Kind" error={errors.kind}>
          <div className="sn-seg" role="radiogroup">
            {OFFERING_KINDS.map((k) => (
              <button type="button" key={k.value} role="radio" aria-checked={form.kind === k.value}
                className={`sn-seg-opt${form.kind === k.value ? ' on' : ''}`} onClick={() => setForm((f) => ({ ...f, kind: k.value }))}>
                {k.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Title" error={errors.title} htmlFor="sn-e-title">
          <input id="sn-e-title" value={form.title} onChange={set('title')} maxLength={LIMITS.titleMax} placeholder="Morning Hatha, Full-moon sound bath…" />
        </Field>

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
        <Field label="Ends on a later day? (optional)" hint="For a weekend or multi-day workshop. Times are Auroville time." htmlFor="sn-e-enddate">
          <input id="sn-e-enddate" type="date" value={form.endDate} min={form.startDate || undefined} onChange={set('endDate')} disabled={following} />
        </Field>

        {!gid && (
          <Field label="Repeats" error={errors.repeat}>
            <div className="sn-seg" role="radiogroup" aria-label="Repeats">
              {[['once', 'Once'], ['weekly', 'Weekly']].map(([v, label]) => (
                <button type="button" key={v} role="radio" aria-checked={form.repeat === v}
                  className={`sn-seg-opt${form.repeat === v ? ' on' : ''}`} onClick={() => setRepeat(v)}>{label}</button>
              ))}
            </div>
          </Field>
        )}
        {weekly && (
          <div className="sn-repeatbox">
            <Field label="On these days">
              <div className="sn-days" role="group" aria-label="Days of the week">
                {WEEKDAYS.map((w) => (
                  <button type="button" key={w.value} aria-pressed={form.weekdays.includes(w.value)} aria-label={w.name}
                    className={`sn-day${form.weekdays.includes(w.value) ? ' on' : ''}`} onClick={() => toggleDay(w.value)}>
                    {w.short}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Last date" htmlFor="sn-e-until">
              <input id="sn-e-until" type="date" value={form.untilDate} min={form.startDate || undefined} onChange={set('untilDate')} />
            </Field>
            <p className="sn-repeat-preview" aria-live="polite">
              {repeatCheck && !repeatCheck.errors.repeat
                ? <><strong>{repeatLabel(form.weekdays)}</strong> — {seriesSummary(repeatCheck.dates)}. Each date has its own places and guest list.</>
                : repeatCheck?.errors.repeat}
            </p>
          </div>
        )}

        <Field label="Where" error={errors.location} htmlFor="sn-e-loc">
          <input id="sn-e-loc" value={form.location} onChange={set('location')} maxLength={LIMITS.locationMax} />
        </Field>
        <div className="sn-grid2">
          <Field label="Price per person (₹)" error={errors.price} hint="Leave blank for free. Paid at the venue." htmlFor="sn-e-price">
            <input id="sn-e-price" type="number" min="0" step="1" inputMode="decimal" value={form.price} onChange={set('price')} />
          </Field>
          <Field label="Places" error={errors.capacity} hint="Leave blank for no limit." htmlFor="sn-e-cap">
            <input id="sn-e-cap" type="number" min="1" max={LIMITS.capacityMax} step="1" inputMode="numeric" value={form.capacity} onChange={set('capacity')} />
          </Field>
        </div>
        <Field label="Description" error={errors.description} hint="What happens, who it’s for, what to bring. A blank line starts a new paragraph." htmlFor="sn-e-desc">
          <textarea id="sn-e-desc" rows={8} value={form.description} onChange={set('description')} maxLength={LIMITS.descriptionMax} />
        </Field>

        <Field label="Image (optional)" hint="JPG, PNG or WebP, up to 5 MB. A wide photo works best.">
          <div className="sn-image">
            {form.imagePath ? <img src={imageUrl(form.imagePath)} alt="" /> : <div className="sn-image-empty">No image</div>}
            <div className="sn-image-acts">
              <label className="sn-act">
                {uploading ? 'Uploading…' : form.imagePath ? 'Replace' : 'Upload'}
                <input type="file" accept={IMAGE_TYPES.join(',')} onChange={onImage} disabled={uploading} hidden />
              </label>
              {form.imagePath && <button type="button" className="sn-act" onClick={() => setForm((f) => ({ ...f, imagePath: null }))}>Remove</button>}
            </div>
          </div>
        </Field>

        {failure && <p className="sn-failure" role="alert">{failure}</p>}
        <div className="sn-editor-acts">
          {following ? (
            <button type="submit" className="btn forest" disabled={busy || uploading}>{busy ? 'Saving…' : 'Save every later date'}</button>
          ) : isPublished ? (
            <button type="submit" className="btn forest" disabled={busy || uploading}>{busy ? 'Saving…' : 'Save changes'}</button>
          ) : (
            <>
              <button type="button" className="btn forest" disabled={busy || uploading} onClick={() => save('published')}>{busy ? 'Saving…' : weekly ? 'Publish all dates' : 'Publish'} <Arrow /></button>
              <button type="submit" className="btn" disabled={busy || uploading}>Save as draft</button>
            </>
          )}
          <Link className="sn-act" to="/sanctuary/host">Back</Link>
        </div>
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
        <Route path="new" element={<Editor userId={user.id} />} />
        <Route path="edit/:gid" element={<Editor userId={user.id} />} />
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

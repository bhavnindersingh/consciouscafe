import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { useAuth } from '../../context/AuthContext';
import {
  getMyHost, requestToHost, updateMyHost, listMyGatherings, getMyGathering, saveGathering,
  setGatheringStatus, deleteDraft, listRsvps, setRsvpStatus, uploadImage, imageUrl,
  createSeries, updateSeries, setSeriesStatus, deleteSeriesDrafts, uploadVideo, removeVideo, listRoomBusy,
} from '../../services/sanctuaryService';
import { OFFERING_KINDS, LIMITS, IMAGE_TYPES, VIDEO_TYPES, HOST_AUTH_COPY, WEEKDAYS } from '../../constants/sanctuary';
import {
  emptyOfferingForm, offeringToForm, duplicateForm, validateOffering, splitHostOfferings,
  seatsTaken, formatWhen, canPublish, isPast, isUuid, formatDay, formatClock,
  cleanEmail, cleanCode, authErrorKind,
  groupHostSeries, repeatLabel, weekdaysOf, weekdayOf, addDays, validateRepeat, seriesRows,
  seriesSummary, durationMinutes, durationLabel, priceLabel, seatsLabel, istToIso, parseVideoLink, elsewhere,
  withWhere, looksLikeSanctuary, roomWindow, roomClashes, busyLabel, roomTakenMessage, isoToIstParts, inHouse,
} from '../../utils/sanctuary';
import {
  Arrow, DateTile, KindTag, Field, Spinner, GatheringVideo, VideoTag, useKeyboardOpen,
  ConfirmButton, PageSkeleton, onRadioKeys, tabStop, useFieldErrors,
} from './parts';
import OrganiserPageEditor from './OrganiserPageEditor';
import './sanctuary.css';

// The database isn't there yet (migration not applied) or the provider is off.
const notOpenYet = (e) => /PGRST20[25]|42P01|does not exist|provider is not enabled|Unsupported provider/i
  .test(`${e?.code || ''} ${e?.message || ''}`);


/**
 * Before drafts at the Sanctuary go for review (the dashboard's Send buttons;
 * the editor checks the same): refuse a time a live event already has. Throws
 * the message to show. If the check itself fails, it lets them through — the
 * database still refuses a clash when our team approves.
 */
async function checkRoom(list) {
  const times = list.filter(inHouse);
  if (!times.length) return;
  const w = roomWindow(times);
  let busy;
  try { busy = await listRoomBusy(w.from, w.to); } catch { return; }
  const { taken } = roomClashes(busy, times, list.map((o) => o.id));
  if (!taken.length) return;
  if (taken.length === 1) throw new Error(roomTakenMessage(taken[0].busy));
  throw new Error(`The Sanctuary is taken on ${taken.length} of these dates — first ${formatDay(taken[0].want.starts_at)}: ${busyLabel(taken[0].busy)}. Use Edit to change the time.`);
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

  const [emailErr, setEmailErr] = useState(null);
  const [codeErr, setCodeErr] = useState(null);
  const send = async (raw) => {
    const to = cleanEmail(raw);
    if (!to) { setEmailErr(HOST_AUTH_COPY.bad_email); document.getElementById('sn-h-email')?.focus(); return; }
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
    if (!token) { setCodeErr('Type the code from the email — just the numbers.'); document.getElementById('sn-h-code')?.focus(); return; }
    setBusy(true); setFailure(null);
    const { error } = await verifyEmailCode(sentTo, token);
    if (error) { setBusy(false); setFailure(HOST_AUTH_COPY[authErrorKind(error)]); }
  };

  if (!sentTo) {
    return (
      <form className="sn-form" onSubmit={(e) => { e.preventDefault(); if (!busy) send(email); }} noValidate>
        <div className="sn-inline">
          <Field label="Your email" htmlFor="sn-h-email" error={emailErr}>
            <input id="sn-h-email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com"
              value={email} onChange={(e) => { setEmail(e.target.value); setEmailErr(null); }} maxLength={LIMITS.emailMax}
              onBlur={() => setEmailErr(email.trim() && !cleanEmail(email) ? HOST_AUTH_COPY.bad_email : null)} />
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
        <Field label="Code from the email" htmlFor="sn-h-code" error={codeErr}>
          <input id="sn-h-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={12}
            value={code} onChange={(e) => { setCode(e.target.value); setCodeErr(null); }} autoFocus
            onBlur={() => setCodeErr(code.trim() && !cleanCode(code) ? 'Just the numbers from the email.' : null)} />
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
      <h1 className="display">Organise with <em>the Sanctuary.</em></h1>
      <p className="lede">
        Teach a class, run a workshop, gather people for an evening — here, or at your own space.
        Sign in and tell us about your work. Once we’ve said hello, you build your own profile and send
        events to the calendar; our team looks at each one before it goes live.
      </p>
      <button className="btn forest sn-google" onClick={go} disabled={busy}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
        {busy ? 'Opening Google…' : 'Sign in with Google'}
      </button>
      {failure && <p className="sn-failure" role="alert">{failure}</p>}
      <p className="sn-or">or with your email</p>
      <EmailSignIn />
      <p className="sn-fine">We only use your name and email to know who you are. Visitors never need an account.</p>
    </div>
  );
}

/** The request form's rules: { errors, value }. */
function validateHostDetails(form) {
  const v = { displayName: form.displayName.trim(), phone: form.phone.trim(), link: form.link.trim(), bio: form.bio.trim() };
  const errors = {};
  if (v.displayName.length < LIMITS.hostNameMin || v.displayName.length > LIMITS.hostNameMax) errors.displayName = 'The name people will see, 2–80 characters.';
  if (v.phone.length > LIMITS.hostPhoneMax) errors.phone = 'That number is too long.';
  if (v.link && !/^https?:\/\/\S+\.\S+/i.test(v.link)) errors.link = 'A full link, starting with https://';
  return { errors, value: v };
}

function HostDetailsForm({ initial, submitLabel, onSubmit }) {
  const [form, setForm] = useState({
    displayName: initial.display_name || '', phone: initial.phone || '', link: initial.link || '', bio: initial.bio || '',
  });
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);
  const { errors, blur, clear, all } = useFieldErrors(validateHostDetails, form);
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); clear(k); };

  const submit = async (e) => {
    e.preventDefault();
    const { errors: errs, value: v } = all();
    if (Object.keys(errs).length) { document.getElementById({ displayName: 'sn-h-name', phone: 'sn-h-phone', link: 'sn-h-link' }[Object.keys(errs)[0]])?.focus(); return; }
    setBusy(true); setFailure(null);
    try { await onSubmit(v); } catch (err) { setFailure(err.message || 'Could not save. Please try again.'); setBusy(false); }
  };

  return (
    <form className="sn-form" onSubmit={submit} noValidate>
      <Field label="Name visitors will see" error={errors.displayName} htmlFor="sn-h-name">
        <input id="sn-h-name" value={form.displayName} onChange={set('displayName')} onBlur={blur('displayName')} maxLength={LIMITS.hostNameMax} autoComplete="name" />
      </Field>
      <Field label="Phone (for us, not shown publicly)" error={errors.phone} htmlFor="sn-h-phone">
        <input id="sn-h-phone" type="tel" value={form.phone} onChange={set('phone')} onBlur={blur('phone')} maxLength={LIMITS.hostPhoneMax} autoComplete="tel" />
      </Field>
      <Field label="Website or Instagram (optional)" error={errors.link} hint="Shown on your events and profile." htmlFor="sn-h-link">
        <input id="sn-h-link" type="url" placeholder="https://" value={form.link} onChange={set('link')} onBlur={blur('link')} maxLength={LIMITS.linkMax} />
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
    requested: ['Thank you — we’ll be in touch.', 'Your request is with us. We usually reply within a few days, by phone or email. You’ll be able to send events to the calendar here as soon as we’ve said yes.'],
    declined: ['We can’t take this on right now.', 'Thank you for reaching out. If things change on either side, write to us.'],
    paused: ['Your profile is paused.', 'Your events are hidden from the calendar for now. Message us to pick things back up.'],
  }[host.status];
  return (
    <div className="sn-gate">
      <span className="eyebrow">Organiser</span>
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

/**
 * A row's actions. The first ones always show; the rest show inline where there's
 * room and fold into "More" on a phone (sanctuary.css), so a row is one line of
 * actions instead of two ragged ones.
 */
function RowActs({ main, more }) {
  const extra = more.filter(Boolean);
  const menu = useRef(null);
  // a menu closes on a tap anywhere else, and on Escape
  useEffect(() => {
    const close = (e) => {
      const d = menu.current;
      if (!d?.open) return;
      if (e.type === 'keydown' ? e.key === 'Escape' : !d.contains(e.target)) {
        d.open = false;
        if (e.type === 'keydown') d.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, []);
  return (
    <div className="sn-hrow-acts">
      {main}
      {extra.length > 0 && (
        <>
          <span className="sn-acts-wide">{extra}</span>
          <details className="sn-acts-more" ref={menu}>
            <summary className="sn-act">More</summary>
            <div className="sn-acts-menu">{extra}</div>
          </details>
        </>
      )}
    </div>
  );
}

const sentBack = (o) => o.status === 'draft' && Boolean(o.review_note);
const statusWord = (o, past) => (sentBack(o) ? 'Sent back'
  : { draft: 'Draft', in_review: 'In review', published: past ? 'Done' : 'Live', cancelled: 'Cancelled' }[o.status] || o.status);

/** One event on the organiser's dashboard, with its actions. */
function HostRow({ o, taken, copied, onCopy, act, nested = false }) {
  const t = taken[o.id] || 0;
  const past = isPast(o);
  return (
    <li className={`sn-hrow st-${o.status}${nested ? ' nested' : ''}`}>
      <DateTile iso={o.starts_at} small />
      <div className="sn-hrow-main">
        <div className="sn-hrow-tags">
          {!nested && <KindTag kind={o.kind} />}
          <span className={`sn-status st-${sentBack(o) ? 'sent-back' : o.status}`}>{statusWord(o, past)}</span>
          {o.status === 'published' && o.edited_after_review && <span className="sn-hrow-flag">Changed since approval</span>}
        </div>
        {!nested && <span className="sn-row-title">{o.title}</span>}
        <span className="sn-row-meta">
          {formatWhen(o.starts_at, o.ends_at)}
          {elsewhere(o.location) ? <> · {elsewhere(o.location)}</> : null}
          {o.status === 'published' || o.status === 'cancelled' ? <> · {o.capacity ? `${t} of ${o.capacity} reserved` : `${t} reserved`}</> : null}
        </span>
        {sentBack(o) && <span className="sn-hrow-note">Sent back: “{o.review_note}” Change what’s needed and submit again.</span>}
        {o.status === 'in_review' && <span className="sn-hrow-note quiet">Waiting for our team to look at it. You’ll hear by email.</span>}
      </div>
      <RowActs
        main={<>
          {o.status === 'draft' && canPublish(o) && (
            <button className="sn-act strong" onClick={() => act(async () => { await checkRoom([o]); await setGatheringStatus(o.id, 'in_review'); }, 'Sent for review. You’ll hear by email when it’s live.')}>Send for review</button>
          )}
          {(o.status === 'published' || o.status === 'cancelled') && <Link className="sn-act" to={`/sanctuary/host/rsvps/${o.id}`}>See guests ({t})</Link>}
          {!past && o.status !== 'cancelled' && <Link className="sn-act" to={`/sanctuary/host/edit/${o.id}`}>Edit</Link>}
        </>}
        more={[
          o.status === 'in_review' && (
            <button key="w" className="sn-act" onClick={() => act(() => setGatheringStatus(o.id, 'draft'))}>Move back to drafts</button>
          ),
          !nested && <Link key="d" className="sn-act" to="/sanctuary/host/new" state={{ duplicateOf: o.id }}>Duplicate</Link>,
          o.status === 'published' && !past && (
            <button key="c" className="sn-act" onClick={() => onCopy(o.id)}>{copied === o.id ? 'Copied' : 'Copy link'}</button>
          ),
          o.status === 'published' && !past && (
            <ConfirmButton key="x" title={`Cancel “${o.title}”?`} confirmLabel="Cancel event" keepLabel="Keep it on"
              body={t ? `${t} ${t === 1 ? 'person has' : 'people have'} a place. Everyone who gave an email hears it’s off. This can’t be undone.` : 'It comes off the calendar. This can’t be undone.'}
              onConfirm={() => act(() => setGatheringStatus(o.id, 'cancelled'))}>Cancel</ConfirmButton>
          ),
          o.status === 'draft' && (
            <ConfirmButton key="del" title={`Delete the draft “${o.title}”?`} confirmLabel="Delete draft" body="It’s gone for good — it was never on the calendar."
              onConfirm={() => act(() => deleteDraft(o.id))}>Delete</ConfirmButton>
          ),
        ]}
      />
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
            <button className="sn-act strong" onClick={() => act(async () => { await checkRoom(rows.filter((r) => r.status === 'draft')); await setSeriesStatus(first.series_id, 'draft', 'in_review'); }, 'All dates sent for review. You’ll hear by email when they’re live.')}>Send all for review</button>
          )}
          {tab === 'drafts' && (
            <ConfirmButton title={`Delete every draft date of “${first.title}”?`} confirmLabel="Delete drafts" body="Dates already on the calendar stay. The drafts are gone for good."
              onConfirm={() => act(() => deleteSeriesDrafts(first.series_id))}>Delete all</ConfirmButton>
          )}
          {tab === 'upcoming' && live.length > 0 && (
            <ConfirmButton title={`Cancel all ${live.length} dates of “${first.title}”?`} confirmLabel={`Cancel ${live.length} dates`} keepLabel="Keep them on"
              body={booked ? `${booked} ${booked === 1 ? 'place is' : 'places are'} booked across them; everyone who gave an email hears it’s off. This can’t be undone.` : 'They come off the calendar. This can’t be undone.'}
              onConfirm={() => act(() => setSeriesStatus(first.series_id, 'published', 'cancelled'))}>Cancel all</ConfirmButton>
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

/** "1–20 of 34", Previous / Next — always shown; the buttons keep their words when they can't be used. */
function Pager({ page, size, total, onPage, label }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const from = total ? page * size + 1 : 0;
  const to = Math.min(total, (page + 1) * size);
  return (
    <nav className="sn-pager" aria-label={label}>
      <span className="sn-pager-n">{from}–{to} of {total}</span>
      <button type="button" className="sn-act" disabled={page === 0} onClick={() => onPage(page - 1)}>Previous</button>
      <button type="button" className="sn-act" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>Next</button>
    </nav>
  );
}

const DASH_PAGE = 20;
const GUEST_PAGE = 50;

function Dashboard({ host, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState(null);
  const [taken, setTaken] = useState({});
  const [tab, setTab] = useState('upcoming');
  const [failure, setFailure] = useState(null);
  const [notice, setNotice] = useState(location.state?.notice || null);
  const [copied, setCopied] = useState(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  // a notice handed over by the editor ("Sent for review…") shows once
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, []);

  const load = useCallback(async () => {
    try {
      const [g, r] = await Promise.all([listMyGatherings(), listRsvps()]);
      setRows(g); setTaken(seatsTaken(r)); setFailure(null);
    } catch (e) {
      setFailure(e.message || 'Your events didn’t load. Check the connection and try again.');
      setRows((prev) => prev || []);
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [tab, query]);

  const split = useMemo(() => splitHostOfferings(rows || []), [rows]);
  const act = async (fn, done) => {
    setFailure(null); setNotice(null);
    try { await fn(); await load(); if (done) setNotice(done); } catch (e) { setFailure(e.message || 'That didn’t work. Please try again.'); }
  };
  const copyLink = async (id) => {
    const url = `${window.location.origin}/sanctuary/${id}`;
    try { await navigator.clipboard.writeText(url); setCopied(id); setTimeout(() => setCopied(null), 2000); } catch { window.prompt('Copy this link', url); }
  };

  const TABS = [['upcoming', 'Upcoming'], ['drafts', 'Drafts'], ['past', 'Past']];
  const q = query.trim().toLowerCase();
  const list = useMemo(() => split[tab].filter((o) => !q || `${o.title} ${o.location}`.toLowerCase().includes(q)), [split, tab, q]);
  // Past stays date by date; upcoming and drafts show a weekly class once.
  const entries = useMemo(() => (tab === 'past' ? list.map((o) => ({ key: o.id, row: o })) : groupHostSeries(list)), [list, tab]);
  const shown = entries.slice(page * DASH_PAGE, (page + 1) * DASH_PAGE);
  const shared = { taken, copied, onCopy: copyLink, act };
  const count = (k) => (rows ? (k === 'past' ? split[k].length : groupHostSeries(split[k]).length) : '–');
  const thinProfile = !host.avatar_path || !String(host.bio || '').trim();

  return (
    <div className="sn-dash">
      <div className="sn-dash-head">
        <div>
          <span className="eyebrow">Organiser</span>
          <h1 className="display sn-dash-h">Welcome, <em>{host.display_name.split(' ')[0]}.</em></h1>
        </div>
        <div className="sn-dash-tools">
          <button className="btn forest" onClick={() => navigate('/sanctuary/host/new')}>Create an event <Arrow /></button>
          <div className="sn-dash-links">
            <Link className="sn-act" to="/sanctuary/host/profile">Edit your profile</Link>
            <Link className="sn-act" to={`/sanctuary/hosts/${host.user_id}`}>Visit your profile</Link>
            <button className="sn-act" onClick={onSignOut}>Sign out</button>
          </div>
        </div>
      </div>

      {notice && (
        <p className="sn-notice" role="status">
          {notice}
          <button type="button" className="sn-act" onClick={() => setNotice(null)}>Dismiss</button>
        </p>
      )}
      {thinProfile && (
        <div className="sn-nudge">
          <p><strong>Finish your profile.</strong> Add a photo and a few lines about your work — people book people they can picture.</p>
          <Link className="btn" to="/sanctuary/host/profile">Edit your profile <Arrow /></Link>
        </div>
      )}

      <div className="sn-dash-bar">
        <div className="sn-filters" role="tablist" aria-label="Your events" onKeyDown={onRadioKeys}>
          {TABS.map(([k, label], i) => (
            <button key={k} role="tab" id={`sn-dtab-${k}`} aria-selected={tab === k} aria-controls="sn-dpanel" tabIndex={tabStop(tab === k, i === 0, true)}
              className={`sn-chip${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>
              {label}<span className="sn-chip-n">{count(k)}</span>
            </button>
          ))}
        </div>
        <label className="sn-search" htmlFor="sn-dsearch">
          <span className="sn-label">Search your events</span>
          <input id="sn-dsearch" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title or place" autoComplete="off" />
        </label>
      </div>

      {failure && <p className="sn-failure" role="alert">{failure}</p>}

      <div className="sn-frame" role="tabpanel" id="sn-dpanel" aria-labelledby={`sn-dtab-${tab}`}>
        {!rows ? <PageSkeleton kind="list" label="Loading your events" /> : entries.length === 0 ? (
          q ? (
            <div className="sn-empty sn-empty-in">
              <p className="sn-empty-h">No events match “{query.trim()}”.</p>
              <p>Search looks at titles and places.</p>
              <button className="btn" onClick={() => setQuery('')}>Clear search <Arrow /></button>
            </div>
          ) : (
            <div className="sn-empty sn-empty-in">
              <p className="sn-empty-h">{{ upcoming: 'Nothing coming up yet.', drafts: 'No drafts or events in review.', past: 'Nothing in the past yet.' }[tab]}</p>
              <p>{tab === 'past' ? 'Events you’ve held land here once they’re over.' : 'Create an event and send it for review — once it’s approved it goes on the calendar.'}</p>
              {tab !== 'past' && <button className="btn" onClick={() => navigate('/sanctuary/host/new')}>Create an event <Arrow /></button>}
            </div>
          )
        ) : (
          <ul className="sn-hlist">
            {shown.map((e) => (e.series
              ? <SeriesGroup key={e.key} rows={e.series} tab={tab} {...shared} />
              : <HostRow key={e.key} o={e.row} {...shared} />))}
          </ul>
        )}
        {rows && <Pager page={page} size={DASH_PAGE} total={entries.length} onPage={setPage} label="Pages of your events" />}
      </div>
    </div>
  );
}

// ── Create / edit ───────────────────────────────────────────────────────────

/** An organiser's own space as one line ('Garden Shala, Auroville Road'), or ''. */
const placeLine = (h) => [h.place_name, h.place_address].filter(Boolean).join(', ').slice(0, LIMITS.locationMax);

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
  endDate: 'end', endTime: 'end', where: 'location', location: 'location', price: 'price', capacity: 'capacity',
  repeat: 'repeat', weekdays: 'repeat', untilDate: 'repeat',
  videoMode: 'video', videoUrl: 'video', videoPath: 'video',
};

// Fields that move the wanted time — changing one clears a "the Sanctuary is taken" error.
const ROOM_FIELDS = new Set(['where', 'startDate', 'startTime', 'endDate', 'endTime', 'repeat', 'weekdays', 'untilDate']);

// The order the form reads in, so a failed save lands on the first problem.
const ERROR_ORDER = ['kind', 'title', 'location', 'start', 'end', 'repeat', 'room', 'price', 'capacity', 'description', 'video'];

/** A busy slot on the day being looked at: '7 – 9 pm', or the whole span when it runs over days. */
const slotLabel = (b) => (isoToIstParts(b.starts_at).date === isoToIstParts(b.ends_at).date
  ? `${formatClock(b.starts_at, false)} – ${formatClock(b.ends_at)}`
  : formatWhen(b.starts_at, b.ends_at));

/**
 * The Sanctuary is one room. Under the time, what else has it then: the day's
 * bookings for a one-off (each that overlaps marked), or which of a weekly
 * series' dates are taken. Live events block; ones waiting for review only hold.
 */
function RoomCheck({ state, wanted, clashes, mine, weekly, multiDay, error, following }) {
  if (!wanted.length) return null;
  const day = formatDay(wanted[0].starts_at);
  const taken = clashes.taken.length > 0;
  return (
    <div className={`sn-room${taken ? ' is-taken' : ''}${error ? ' has-error' : ''}`} aria-live="polite">
      {error && <p className="sn-err" role="alert">{error}</p>}
      {state.failed ? (
        <p className="sn-hint">Couldn’t check the Sanctuary’s other bookings just now. They’re checked again when you send this for review.</p>
      ) : state.rows === null ? (
        <Spinner label="Checking the Sanctuary’s calendar" />
      ) : weekly ? (
        <>
          {!taken && !clashes.held.length && <p className="sn-room-ok">The Sanctuary is free on all {wanted.length} dates at that time.</p>}
          {taken && (
            <>
              <p className="sn-room-h">Taken on {clashes.taken.length} of your dates</p>
              <ul className="sn-room-list">
                {clashes.taken.map((c) => <li key={`${c.want.starts_at}${c.busy.id}`} className="is-clash"><span className="sn-room-when">{formatDay(c.want.starts_at)}</span><span>{c.busy.title ? `“${c.busy.title}”, ` : ''}{slotLabel(c.busy)}</span></li>)}
              </ul>
              <p className="sn-hint">Change the time or the days, or choose somewhere else.</p>
            </>
          )}
          {clashes.held.length > 0 && (
            <p className="sn-hint">{clashes.held.length === 1 ? 'One of your dates overlaps' : `${clashes.held.length} of your dates overlap`} an event waiting for review — whichever is approved first gets the time.</p>
          )}
        </>
      ) : (
        <>
          {(() => {
            const rows = state.rows.filter((b) => !mine.includes(b.id));
            const clash = new Set([...clashes.taken, ...clashes.held].map((c) => c.busy.id));
            if (!rows.length) return <p className="sn-room-ok">The Sanctuary is free all day on {day}.</p>;
            return (
              <>
                <p className="sn-room-h">The Sanctuary on {day}{multiDay ? ' and the days after' : ''}</p>
                <ul className="sn-room-list">
                  {rows.map((b) => (
                    <li key={b.id} className={clash.has(b.id) ? 'is-clash' : ''}>
                      <span className="sn-room-when">{slotLabel(b)}</span>
                      <span>{b.title || 'Held — waiting for review'}</span>
                      {clash.has(b.id) && <span className="sn-room-tag">{b.status === 'published' ? 'Clashes' : 'Overlaps'}</span>}
                    </li>
                  ))}
                </ul>
              </>
            );
          })()}
          {taken && !error && <p className="sn-room-warn">Your time overlaps {busyLabel(clashes.taken[0].busy)}. Pick another time, or choose somewhere else.</p>}
          {!taken && clashes.held.length > 0 && <p className="sn-hint">Someone has asked for part of this time and is waiting for review. Whichever is approved first gets it.</p>}
        </>
      )}
      {multiDay && <p className="sn-hint">A multi-day event has the Sanctuary day and night, from its start to its end.</p>}
      {following && <p className="sn-hint">Later dates are checked when you save.</p>}
    </div>
  );
}

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
          <VideoTag o={value} />
        </span>
        <span className={`sn-row-title${value.title ? '' : ' is-empty'}`}>{value.title || 'Your title'}</span>
        <span className="sn-row-meta">
          {when}
          {elsewhere(value.location) ? <> · {elsewhere(value.location)}</> : null}
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

function Editor({ userId, hostName, place = '' }) {
  const { gid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const duplicateOf = location.state?.duplicateOf;
  // a new event starts at the Sanctuary; the organiser's own space is ready under "Somewhere else"
  const ownPlace = place && !looksLikeSanctuary(place) ? place : '';
  const [form, setForm] = useState(gid || duplicateOf ? null : { ...emptyOfferingForm(), location: ownPlace, ...NO_REPEAT });
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
  const [clip, setClip] = useState({ busy: false, progress: 0, failure: null });
  // Clips this editor put in storage: the only ones it may delete when they're
  // replaced or dropped (a saved path can be shared by every date of a series).
  const uploadedHere = useRef(new Set());
  const stopClip = useRef(null);
  const typing = useKeyboardOpen();
  useEffect(() => {
    const stop = stopClip; // leaving mid-upload stops it
    return () => stop.current?.abort();
  }, []);

  useEffect(() => {
    const src = gid || duplicateOf;
    if (!src) return;
    if (!isUuid(src)) { navigate('/sanctuary/host', { replace: true }); return; }
    getMyGathering(src).then((row) => {
      if (!row) { navigate('/sanctuary/host', { replace: true }); return; }
      // every form carries the repeat fields, so nothing that reads them (goToError) meets undefined
      if (gid) { setOriginal(row); setForm({ ...offeringToForm(row), ...NO_REPEAT }); } else { setForm({ ...duplicateForm(row), ...NO_REPEAT }); }
    }).catch((e) => setFailure(e.message));
  }, [gid, duplicateOf, navigate]);

  // Unsaved work survives a closed tab or a dropped connection: the form is kept
  // in this browser (localStorage, per organiser and event) until it's saved or
  // discarded. Nothing here is private — it's the event as typed.
  const draftKey = `sn-event-draft:${userId}:${gid || (duplicateOf ? `dup-${duplicateOf}` : 'new')}`;
  const initial = useRef(null); // the form as it opened, as JSON
  const savedOk = useRef(false);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (!form || initial.current !== null) return;
    initial.current = JSON.stringify(form);
    try {
      const kept = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (kept && JSON.stringify(kept) !== initial.current) {
        // a draft kept by an older version may lack newer fields: lay it over the defaults
        setForm({ ...emptyOfferingForm(), ...NO_REPEAT, ...withWhere(kept) }); setRestored(true);
        if (kept.endDate) setMultiDay(true);
      }
    } catch { /* a broken draft is ignored */ }
  }, [form, draftKey]);
  const dirty = Boolean(form && initial.current !== null && JSON.stringify(form) !== initial.current);
  useEffect(() => {
    if (!form || initial.current === null || savedOk.current) return undefined;
    const t = setTimeout(() => {
      try { if (dirty) localStorage.setItem(draftKey, JSON.stringify(form)); else localStorage.removeItem(draftKey); } catch { /* storage off or full */ }
    }, 400);
    return () => clearTimeout(t);
  }, [form, dirty, draftKey]);
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { if (savedOk.current) return; e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // The Sanctuary's other bookings around the wanted time(s), fetched once the dates settle.
  const wanted = useMemo(() => {
    if (!form || form.where !== 'sanctuary') return [];
    const { value: v } = validateOffering(form);
    if (!v.starts_at || !v.ends_at || new Date(v.ends_at) <= new Date(v.starts_at)) return [];
    if (!gid && form.repeat === 'weekly') {
      const rep = validateRepeat(form);
      if (!rep.errors.repeat) return seriesRows(form, v, rep.dates, null).map((r) => ({ starts_at: r.starts_at, ends_at: r.ends_at }));
    }
    return [{ starts_at: v.starts_at, ends_at: v.ends_at }];
  }, [form, gid]);
  const roomKey = JSON.stringify(roomWindow(wanted));
  const [roomState, setRoomState] = useState({ key: '', rows: null, failed: false });
  useEffect(() => {
    const w = JSON.parse(roomKey);
    if (!w) return undefined;
    let on = true;
    const t = setTimeout(() => {
      listRoomBusy(w.from, w.to)
        .then((rows) => on && setRoomState({ key: roomKey, rows, failed: false }))
        .catch(() => on && setRoomState({ key: roomKey, rows: null, failed: true }));
    }, 300);
    return () => { on = false; clearTimeout(t); };
  }, [roomKey]);

  if (!form) return failure ? <p className="sn-failure" role="alert">{failure}</p> : <PageSkeleton kind="form" label="Opening the event" />;

  const discardDraft = () => {
    try { localStorage.removeItem(draftKey); } catch { /* fine */ }
    setForm(JSON.parse(initial.current)); setRestored(false); setErrors({});
  };
  /** Check one field when it's left (blur-first); typing clears it again (update). */
  const blurCheck = (k) => () => {
    const errs = { ...validateOffering(form).errors, ...(form.repeat === 'weekly' && !gid ? validateRepeat(form).errors : {}) };
    setErrors((e) => (e[k] === errs[k] ? e : { ...e, [k]: errs[k] }));
  };

  /** Change fields, and drop any error they were showing. */
  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    const keys = Object.keys(patch).map((k) => ERROR_OF[k]).filter(Boolean);
    if (Object.keys(patch).some((k) => ROOM_FIELDS.has(k))) keys.push('room');
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
  const mine = gid ? [gid] : [];
  const room = roomState.key === roomKey ? roomState : { rows: null, failed: false };
  const clashes = room.rows ? roomClashes(room.rows, wanted, mine) : { taken: [], held: [] };

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

  const dropClip = (path) => {
    if (!path || !uploadedHere.current.has(path)) return;
    uploadedHere.current.delete(path);
    removeVideo(path).catch(() => {});
  };
  const pickClip = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const before = form.videoPath;
    const ctrl = new AbortController();
    stopClip.current = ctrl;
    setClip({ busy: true, progress: 0, failure: null });
    try {
      const path = await uploadVideo(userId, file, {
        signal: ctrl.signal,
        onProgress: (p) => setClip((c) => ({ ...c, progress: p })),
      });
      uploadedHere.current.add(path);
      dropClip(before);
      update({ videoPath: path, videoMode: 'upload' });
      setClip({ busy: false, progress: 0, failure: null });
    } catch (err) {
      setClip({ busy: false, progress: 0, failure: err.aborted ? null : err.message });
    }
  };
  const clearClip = () => { dropClip(form.videoPath); update({ videoPath: null }); };
  const link = parseVideoLink(form.videoUrl);

  /** Bring the first field that needs attention into view and put the cursor in it. */
  const goToError = (errs) => {
    const key = ERROR_ORDER.find((k) => errs[k]);
    const id = {
      kind: 'sn-e-kind-event', title: 'sn-e-title', start: 'sn-e-date', end: 'sn-e-end', room: 'sn-e-date',
      repeat: form.weekdays.length ? 'sn-e-until' : 'sn-e-day-1', location: form.where === 'outside' ? 'sn-e-loc' : 'sn-e-where-sanctuary', price: 'sn-e-price',
      capacity: 'sn-e-cap', description: 'sn-e-desc', video: 'sn-e-video',
    }[key];
    const el = id && document.getElementById(id);
    if (!el) return;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' });
    el.focus({ preventScroll: true });
  };

  const save = async (status) => {
    if (uploading || clip.busy) {
      setFailure('A photo or video is still uploading. Save again once it’s finished.');
      requestAnimationFrame(() => document.getElementById('sn-e-failure')?.scrollIntoView({ block: 'center' }));
      return;
    }
    const { errors: errs, value: row0 } = validateOffering(form);
    const rep = weekly ? validateRepeat(form) : { errors: {}, dates: [] };
    Object.assign(errs, rep.errors);
    if (status === 'in_review' && row0.starts_at && !canPublish(row0)) errs.start = 'That time has already passed.';
    setFailure(null);
    if (Object.keys(errs).length) { setErrors(errs); goToError(errs); return; }
    setBusy(true);
    // One room: a time that's taken by a live event can't be approved, so say so now.
    // Asked fresh, not from what's on screen; the database checks again on approval.
    if (row0.at_sanctuary && status !== 'draft' && !following) {
      const times = weekly ? seriesRows(form, row0, rep.dates, null) : [row0];
      const w = roomWindow(times);
      try {
        const { taken } = roomClashes(await listRoomBusy(w.from, w.to), times, mine);
        if (taken.length) {
          errs.room = taken.length === 1 ? roomTakenMessage(taken[0].busy)
            : `The Sanctuary is taken on ${taken.length} of these dates (listed here). Change the time or the days, or choose somewhere else.`;
        }
      } catch { /* couldn't ask — the database still refuses a clash */ }
    }
    setErrors(errs);
    if (Object.keys(errs).length) { setBusy(false); goToError(errs); return; }
    const row = { ...row0, ...(status ? { status } : {}) };
    try {
      if (following) {
        await updateSeries(original.series_id, original.starts_at, row0, form.startTime, durationMinutes(row0));
      } else if (weekly) {
        await createSeries(userId, seriesRows(form, row, rep.dates, crypto.randomUUID()));
      } else {
        await saveGathering(userId, row, gid || null);
      }
      // a clip uploaded here and then left on the other tab would sit in storage unused
      if (form.videoPath && row0.video_path !== form.videoPath) dropClip(form.videoPath);
      savedOk.current = true;
      try { localStorage.removeItem(draftKey); } catch { /* fine */ }
      const notice = following ? 'Every later date is updated.'
        : status === 'in_review' ? (weekly ? 'All dates sent for review. You’ll hear by email when they’re live.' : 'Sent for review. You’ll hear by email when it’s live.')
          : status === 'draft' ? 'Saved as a draft. Only you can see it.'
            : 'Changes saved. They’re live now.';
      navigate('/sanctuary/host', { state: { notice } });
    } catch (err) {
      // 23P01: two saves raced for the same time and the other one won
      setFailure(err.code === '23P01' ? 'Someone has just taken that time at the Sanctuary. Pick another time.' : err.message || 'Could not save. Please try again.');
      setBusy(false);
      // on a phone the message sits under the form, behind the save bar
      requestAnimationFrame(() => document.getElementById('sn-e-failure')?.scrollIntoView({ block: 'center' }));
    }
  };

  const errorCount = Object.keys(errors).length;
  const missing = [!value.title && 'a title', !value.starts_at && 'a date'].filter(Boolean);
  const heading = following ? 'Edit every later date' : gid ? 'Edit event' : duplicateOf ? 'Duplicate event' : 'New event';
  const inReview = original?.status === 'in_review';
  const sideNote = following
    ? 'Saving updates every later date in this series.'
    : isPublished
      ? 'This is live. Your changes show straight away; our team may take another look.'
      : inReview
        ? 'This is waiting for review. Your changes save to it, and it goes on the calendar once our team approves it.'
        : weekly && seriesOk
          ? `Submitting sends all ${repeatCheck.dates.length} dates for review together. Once our team approves them, they’re on the calendar and you’ll hear by email.`
          : form.where === 'outside'
            ? 'Our team looks at every event first; once approved, this one is in Linda’s curation of what’s on around Auroville, and you’ll hear by email. A draft stays here, where only you can see it.'
            : 'Our team looks at every event before it goes on the Sanctuary’s calendar; you’ll hear by email. A draft stays here, where only you can see it.';
  const descLen = form.description.length;

  return (
    <div className="sn-editor sn-editor-wide">
      <div className="sn-editor-head">
        <Link className="sn-back" to="/sanctuary/host">← Your events</Link>
        <h1 className="display sn-dash-h">{heading}</h1>
        {duplicateOf && <p className="sn-hint">Same details, one week later. Change anything before you save.</p>}
        {restored && (
          <p className="sn-notice" role="status">
            Your unsaved changes from last time are back.
            <button type="button" className="sn-act" onClick={discardDraft}>Discard them</button>
          </p>
        )}
        <p className="sn-hint sn-required-note">Everything is needed unless it says optional. Your work is kept on this device as you type.</p>
        {original?.status === 'draft' && original?.review_note && (
          <div className="sn-sentback" role="note">
            <span className="sn-label">Sent back for changes</span>
            <p>“{original.review_note}”</p>
            <span className="sn-hint">Change what’s needed, then submit it again.</span>
          </div>
        )}
        {inSeries && (
          <div className="sn-scope">
            <div className="sn-seg" role="radiogroup" aria-label="Change" onKeyDown={onRadioKeys}>
              {[['one', 'This date only'], ['following', 'This and later dates']].map(([v, label], i) => (
                <button type="button" key={v} role="radio" aria-checked={scope === v} tabIndex={tabStop(scope === v, i === 0, true)}
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

      <form className={`sn-editor-grid${typing ? ' kb-open' : ''}`} onSubmit={(e) => { e.preventDefault(); save(isPublished || following || inReview ? undefined : 'draft'); }} noValidate>
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
              <span className="sn-hint sn-kind-now">{KIND_HINTS[form.kind]}</span>
            </Group>
            <Field label="Title" error={errors.title} htmlFor="sn-e-title"
              hint={form.title.length > LIMITS.titleMax - 30 ? `${form.title.length} of ${LIMITS.titleMax} characters` : null}>
              <input id="sn-e-title" className="sn-title-input" value={form.title} onChange={set('title')} maxLength={LIMITS.titleMax}
                placeholder="Morning Hatha, Full-moon sound bath…" onBlur={blurCheck('title')} />
            </Field>
          </Step>

          <Step title="Where and when" note="Auroville time">
            <Group label="Where" id="sn-e-where-l"
              hint={following ? 'A weekly series stays where it started. To hold it somewhere else, cancel the later dates and create a new one.'
                : form.where === 'outside' ? 'Somewhere around Auroville other than the Sanctuary. It goes in Linda’s curation, not on the Sanctuary’s calendar.'
                  : 'The Sanctuary holds one event at a time — you’ll see what’s already on once you pick a date.'}>
              <div className="sn-seg sn-where" role="radiogroup" aria-labelledby="sn-e-where-l" onKeyDown={onRadioKeys}>
                {[['sanctuary', 'At Conscious Sanctuary'], ['outside', 'Somewhere else']].map(([v, label], i) => (
                  <button type="button" key={v} id={`sn-e-where-${v}`} role="radio" aria-checked={form.where === v}
                    tabIndex={tabStop(form.where === v, i === 0, true)} disabled={following}
                    className={`sn-seg-opt${form.where === v ? ' on' : ''}`} onClick={() => update({ where: v })}>{label}</button>
                ))}
              </div>
            </Group>
            {form.where === 'outside' && (
              <>
                <Field label="The place" error={errors.location} htmlFor="sn-e-loc"
                  hint="The name people will look for, and the area — “The Clay House, Kottakarai”. It links to a map.">
                  <input id="sn-e-loc" value={form.location} onChange={set('location')} maxLength={LIMITS.locationMax} onBlur={blurCheck('location')} />
                </Field>
                {ownPlace && form.location !== ownPlace && (
                  <div className="sn-places">
                    <button type="button" className="sn-place" onClick={() => update({ location: ownPlace })}>Use your place: {ownPlace.split(',')[0]}</button>
                  </div>
                )}
              </>
            )}
            {showEndDate ? (
              <div className="sn-grid2">
                <Field label={weekly ? 'First date' : 'Starts on'} error={errors.start} htmlFor="sn-e-date">
                  <input id="sn-e-date" type="date" value={form.startDate} onChange={set('startDate')} disabled={following} onBlur={blurCheck('start')} />
                </Field>
                <Field label="Start time" htmlFor="sn-e-start">
                  <input id="sn-e-start" type="time" value={form.startTime} onChange={set('startTime')} onBlur={blurCheck('start')} />
                </Field>
                <Field label="Ends on" htmlFor="sn-e-enddate">
                  <input id="sn-e-enddate" type="date" value={form.endDate} min={form.startDate || undefined} onChange={set('endDate')} disabled={following} onBlur={blurCheck('end')} />
                </Field>
                <Field label="End time" error={errors.end} htmlFor="sn-e-end">
                  <input id="sn-e-end" type="time" value={form.endTime} onChange={set('endTime')} onBlur={blurCheck('end')} />
                </Field>
              </div>
            ) : (
              <div className="sn-grid3">
                <Field label={weekly ? 'First date' : 'Date'} error={errors.start} htmlFor="sn-e-date">
                  <input id="sn-e-date" type="date" value={form.startDate} onChange={set('startDate')} disabled={following} onBlur={blurCheck('start')} />
                </Field>
                <Field label="Starts" htmlFor="sn-e-start">
                  <input id="sn-e-start" type="time" value={form.startTime} onChange={set('startTime')} onBlur={blurCheck('start')} />
                </Field>
                <Field label="Ends" error={errors.end} htmlFor="sn-e-end">
                  <input id="sn-e-end" type="time" value={form.endTime} onChange={set('endTime')} onBlur={blurCheck('end')} />
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
                <div className="sn-seg" role="radiogroup" aria-labelledby="sn-e-repeat-l" onKeyDown={onRadioKeys}>
                  {[['once', 'Once'], ['weekly', 'Weekly']].map(([v, label], i) => (
                    <button type="button" key={v} role="radio" aria-checked={form.repeat === v} tabIndex={tabStop(form.repeat === v, i === 0, true)}
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
                  <input id="sn-e-until" type="date" value={form.untilDate} min={form.startDate || undefined} onChange={set('untilDate')} onBlur={blurCheck('repeat')} />
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
            <RoomCheck state={room} wanted={wanted} clashes={clashes} mine={mine} weekly={weekly && seriesOk}
              multiDay={showEndDate} error={errors.room} following={following} />
          </Step>

          <Step title="Price and places">
            <div className="sn-grid2">
              <Field label="Price per person (optional)" error={errors.price} hint="Blank if it’s free. Guests pay at the venue." htmlFor="sn-e-price">
                <span className="sn-money">
                  <span aria-hidden="true">₹</span>
                  <input id="sn-e-price" type="number" min="0" step="1" inputMode="decimal" value={form.price} onChange={set('price')} onBlur={blurCheck('price')} />
                </span>
              </Field>
              <Field label="Places (optional)" error={errors.capacity} hint="Blank for no limit." htmlFor="sn-e-cap">
                <input id="sn-e-cap" type="number" min="1" max={LIMITS.capacityMax} step="1" inputMode="numeric" value={form.capacity} onChange={set('capacity')} onBlur={blurCheck('capacity')} />
              </Field>
            </div>
          </Step>

          <Step title="In your words">
            <Field label="Description (optional)" error={errors.description} htmlFor="sn-e-desc"
              hint={descLen > LIMITS.descriptionMax - 1000
                ? `${descLen.toLocaleString('en-IN')} of ${LIMITS.descriptionMax.toLocaleString('en-IN')} characters`
                : 'Who it’s for, what to bring, what to expect. A blank line starts a new paragraph.'}>
              <textarea id="sn-e-desc" rows={9} value={form.description} onChange={set('description')} maxLength={LIMITS.descriptionMax} onBlur={blurCheck('description')} />
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
                    <button type="button" className="sn-act" aria-label="Remove photo" disabled={uploading} onClick={() => update({ imagePath: null })}>Remove</button>
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
              : <p className="sn-hint">It leads the event’s row on the calendar and the top of its page, shown whole and never cropped.</p>}
          </Step>

          <Step title="Video" note="Optional">
            <Group label="Add a video" id="sn-e-video-l">
              <div className="sn-seg" role="radiogroup" aria-labelledby="sn-e-video-l" onKeyDown={onRadioKeys}>
                {[['link', 'Paste a link'], ['upload', 'Upload a clip']].map(([v, label], i) => (
                  <button type="button" key={v} role="radio" aria-checked={form.videoMode === v} tabIndex={tabStop(form.videoMode === v, i === 0, true)}
                    className={`sn-seg-opt${form.videoMode === v ? ' on' : ''}`} onClick={() => update({ videoMode: v })}>{label}</button>
                ))}
              </div>
            </Group>
            {form.videoMode === 'link' ? (
              <>
                <Field label="Link" error={errors.video} htmlFor="sn-e-video"
                  hint={link
                    ? `${link.label} video. It plays on your event’s page.`
                    : form.videoUrl.trim()
                      ? 'Paste the whole link, from the video’s Share button.'
                      : 'From YouTube, Vimeo or Instagram: tap Share, then Copy link.'}>
                  <input id="sn-e-video" type="url" inputMode="url" autoComplete="off" autoCapitalize="none" spellCheck={false}
                    value={form.videoUrl} onChange={set('videoUrl')} maxLength={500} placeholder="youtube.com/watch?v=… or an Instagram reel" onBlur={blurCheck('video')} />
                </Field>
                {link && <GatheringVideo url={form.videoUrl} title={form.title} className="sn-video-edit" />}
              </>
            ) : (
              <div className="sn-photo sn-clip">
                {clip.busy ? (
                  <div className="sn-upload" aria-live="polite">
                    <span className="sn-upload-h">Uploading… {Math.round(clip.progress * 100)}%</span>
                    <div className="sn-progress" role="progressbar" aria-label="Uploading video"
                      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clip.progress * 100)}>
                      <span style={{ width: `${Math.max(2, clip.progress * 100)}%` }} />
                    </div>
                    <span className="sn-hint">Keep this page open until it finishes.</span>
                    <button type="button" className="sn-act" onClick={() => stopClip.current?.abort()}>Stop</button>
                  </div>
                ) : form.videoPath ? (
                  <>
                    <GatheringVideo path={form.videoPath} title={form.title} className="sn-video-edit" />
                    <div className="sn-photo-acts">
                      <label className="sn-act">
                        Replace
                        <input type="file" className="sr-only" accept={[...VIDEO_TYPES, '.mp4', '.mov', '.webm'].join(',')} onChange={pickClip} />
                      </label>
                      <button type="button" className="sn-act" aria-label="Remove video" onClick={clearClip}>Remove</button>
                    </div>
                  </>
                ) : (
                  <label className="sn-photo-drop">
                    <input id="sn-e-video" type="file" className="sr-only" accept={[...VIDEO_TYPES, '.mp4', '.mov', '.webm'].join(',')} onChange={pickClip} />
                    <span className="sn-photo-drop-h">Add a clip</span>
                    <span className="sn-hint">MP4 or MOV, up to 50 MB: about a minute from a phone. Longer? Put it on YouTube and paste the link.</span>
                  </label>
                )}
                {clip.failure && <p className="sn-failure" role="alert">{clip.failure}</p>}
              </div>
            )}
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
          {failure && <p className="sn-failure" id="sn-e-failure" role="alert">{failure}</p>}
          {/* On a phone this row is pinned to the bottom of the screen (sanctuary.css). */}
          <div className="sn-editor-acts">
            {following ? (
              <button type="submit" className="btn forest" disabled={busy}>{busy ? 'Saving…' : 'Save every later date'}</button>
            ) : isPublished || inReview ? (
              <button type="submit" className="btn forest" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
            ) : (
              <>
                <button type="button" className="btn forest" disabled={busy} onClick={() => save('in_review')}>
                  {busy ? 'Sending…' : weekly ? 'Send all for review' : 'Send for review'} {!busy && <Arrow />}
                </button>
                <button type="submit" className="btn" disabled={busy}>Save draft</button>
              </>
            )}
            <Link className="sn-act sn-leave" to="/sanctuary/host">Leave without saving</Link>
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
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [query]);

  const load = useCallback(async () => {
    try {
      const [o, r] = await Promise.all([getMyGathering(gid), listRsvps(gid)]);
      setG(o); setRows(r); setFailure(null);
    } catch (e) { setFailure(e.message); setRows((p) => p || []); }
  }, [gid]);
  useEffect(() => { if (isUuid(gid)) load(); else setRows([]); }, [gid, load]);

  if (!rows) return <PageSkeleton kind="list" label="Loading the guest list" />;
  if (!g) return <div className="sn-empty"><p className="sn-empty-h">This isn’t one of your events.</p><Link className="btn" to="/sanctuary/host">Go to your events <Arrow /></Link></div>;

  const confirmed = rows.filter((r) => r.status === 'confirmed');
  const q = query.trim().toLowerCase();
  const digits = q.replace(/\D/g, '');
  const found = rows.filter((r) => !q || r.name.toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q)
    || (digits.length >= 3 && r.phone.replace(/\D/g, '').includes(digits)));
  const shownGuests = found.slice(page * GUEST_PAGE, (page + 1) * GUEST_PAGE);
  const seats = confirmed.reduce((n, r) => n + r.seats, 0);
  const copyPhones = async () => {
    const text = confirmed.map((r) => `${r.name}\t${r.phone}`).join('\n');
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt('Copy', text); }
  };

  return (
    <div className="sn-guests">
      <Link className="sn-back" to="/sanctuary/host">← Your events</Link>
      <span className="eyebrow">Guests</span>
      <h1 className="display sn-dash-h">{g.title}</h1>
      <p className="sn-row-meta">{formatWhen(g.starts_at, g.ends_at)} · {seats}{g.capacity ? ` of ${g.capacity}` : ''} places reserved by {confirmed.length} {confirmed.length === 1 ? 'person' : 'people'}</p>
      {failure && <p className="sn-failure" role="alert">{failure}</p>}
      {rows.length === 0 ? (
        <div className="sn-empty"><p className="sn-empty-h">No reservations yet.</p><p>Share the link to your gathering to get the word out.</p></div>
      ) : (
        <>
          <div className="sn-dash-bar">
            <button className="sn-act" onClick={copyPhones} disabled={!confirmed.length}>{copied ? 'Copied' : 'Copy names & numbers'}</button>
            <label className="sn-search" htmlFor="sn-gsearch">
              <span className="sn-label">Search guests</span>
              <input id="sn-gsearch" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, phone or email" autoComplete="off" />
            </label>
          </div>
          <div className="sn-frame">
          {found.length === 0 ? (
            <div className="sn-empty sn-empty-in">
              <p className="sn-empty-h">No guest matches “{query.trim()}”.</p>
              <p>Search looks at names, phone numbers and emails.</p>
              <button className="btn" onClick={() => setQuery('')}>Clear search <Arrow /></button>
            </div>
          ) : (
          <table className="sn-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Places</th><th>Reserved</th><th /></tr></thead>
            <tbody>
              {shownGuests.map((r) => (
                <tr key={r.id} className={r.status === 'cancelled' ? 'is-cancelled' : ''}>
                  <td data-label="Name">{r.name}</td>
                  <td data-label="Phone"><a href={`tel:${r.phone}`}>{r.phone}</a></td>
                  <td data-label="Email" className={r.email ? '' : 'is-blank'}>{r.email ? <a href={`mailto:${r.email}`}>{r.email}</a> : '—'}</td>
                  <td data-label="Places">{r.seats}<span className="sn-narrow"> {r.seats === 1 ? 'place' : 'places'}</span></td>
                  <td data-label="Reserved"><span className="sn-narrow">Reserved </span>{formatDay(r.created_at)}, {formatClock(r.created_at)}</td>
                  <td>
                    {r.status === 'confirmed'
                      ? <ConfirmButton title={`Cancel ${r.name}’s booking?`} confirmLabel="Cancel booking" keepLabel="Keep it"
                          body={`${r.seats} ${r.seats === 1 ? 'place' : 'places'} free up for someone else.${r.email ? ` ${r.name.split(' ')[0]} gets an email.` : ''}`}
                          onConfirm={async () => { try { await setRsvpStatus(r.id, 'cancelled'); await load(); } catch (e) { setFailure(e.message); } }}>Cancel</ConfirmButton>
                      : <span className="sn-status st-cancelled">Cancelled</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          <Pager page={page} size={GUEST_PAGE} total={found.length} onPage={setPage} label="Pages of guests" />
          </div>
        </>
      )}
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
        <Route path="new" element={<Editor userId={user.id} hostName={host.display_name} place={placeLine(host)} />} />
        <Route path="edit/:gid" element={<Editor userId={user.id} hostName={host.display_name} place={placeLine(host)} />} />
        <Route path="rsvps/:gid" element={<Guests />} />
        <Route path="profile" element={<OrganiserPageEditor host={host} onSaved={setHost} />} />
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

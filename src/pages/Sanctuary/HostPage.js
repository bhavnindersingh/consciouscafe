import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { useAuth } from '../../context/AuthContext';
import {
  getMyHost, requestToHost, updateMyHost, listMyGatherings, getMyGathering, saveGathering,
  setGatheringStatus, deleteDraft, listRsvps, setRsvpStatus, uploadImage, imageUrl,
  createSeries, updateSeries, setSeriesStatus, deleteSeriesDrafts, uploadVideo, removeVideo, listRoomBusy, listSeries,
} from '../../services/sanctuaryService';
import { OFFERING_KINDS, LIMITS, IMAGE_TYPES, VIDEO_TYPES, WEEKDAYS } from '../../constants/sanctuary';
import {
  emptyOfferingForm, offeringToForm, duplicateForm, validateOffering, splitHostOfferings,
  seatsTaken, formatWhen, canPublish, isPast, isUuid, formatDay, formatClock,
  groupHostSeries, repeatLabel, weekdaysOf, weekdayOf, addDays, validateRepeat, seriesRows,
  seriesSummary, durationMinutes, durationLabel, priceLabel, seatsLabel, istToIso, parseVideoLink, elsewhere,
  withWhere, looksLikeSanctuary, roomWindow, roomClashes, busyLabel, roomTakenMessage, isoToIstParts, inHouse,
  profileGaps, listWords, hostEventState, hostStateCounts, HOST_STATE_ORDER, seriesChange,
} from '../../utils/sanctuary';
import {
  DateTile, KindTag, Field, Spinner, GatheringVideo, VideoTag, useKeyboardOpen,
  ConfirmButton, PageSkeleton, onRadioKeys, tabStop, useFieldErrors,
} from './parts';
import OrganiserPageEditor from './OrganiserPageEditor';
import SignInCard, { notOpenYet } from './SignInCard';
import './sanctuary.css';



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

const WHATSAPP = 'https://wa.me/918754561269';

/** The way in for a new organiser, named the same wherever it's shown. */
const JOIN_STEPS = ['Sign in', 'Introduce yourself', 'Hear from us'];

/** Where someone is on the way in: the steps behind them ticked, this one marked. `at` counts from 1. */
function JoinSteps({ at }) {
  return (
    <ol className="sn-join" aria-label="Becoming an organiser">
      {JOIN_STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < at ? 'done' : n === at ? 'now' : 'next';
        return (
          <li key={label} className={`is-${state}`} aria-current={state === 'now' ? 'step' : undefined}>
            <span className="sn-join-n" aria-hidden="true">{state === 'done' ? '✓' : n}</span>
            <span>{label}{state === 'done' ? <span className="sr-only"> (done)</span> : null}</span>
          </li>
        );
      })}
    </ol>
  );
}

function SignIn() {
  // Grid areas (sanctuary.css): the invitation and its steps in column one, the
  // sign-in card in column two. On one column the card comes straight after the
  // heading, so someone coming back never scrolls past the pitch to sign in.
  return (
    <div className="sn-signin">
      <div className="sn-signin-head">
        <h1 className="display">Organise with the Sanctuary</h1>
        <p className="lede">
          Teach a class, run a workshop or gather people for an evening — in the Sanctuary, or at your own
          space around Auroville.
        </p>
      </div>

      <ol className="sn-signin-steps" aria-label="How it works for a new organiser">
        <li><span><strong>Sign in</strong> with Google or your email.</span></li>
        <li><span><strong>Introduce yourself</strong> to our team — who you are and what you’d like to hold. We read every introduction and reply personally.</span></li>
        <li><span><strong>Hear from us.</strong> Then build your profile and send your events; our team looks at each event before it goes live.</span></li>
      </ol>

      <SignInCard
        sub="New, or already organising with us — it’s the same way in."
        returnPath="/sanctuary/host"
        unavailable="Organiser sign-in opens very soon. Until then, message us on WhatsApp and we’ll set you up."
        fine="We only use your name and email to know who you are. You never need an account to book or order."
      />
    </div>
  );
}

/** The introduction's rules: { errors, value }. */
export function validateIntro(form) {
  const v = { displayName: form.displayName.trim(), intro: form.intro.trim(), link: form.link.trim(), phone: form.phone.trim() };
  const errors = {};
  if (v.displayName.length < LIMITS.hostNameMin || v.displayName.length > LIMITS.hostNameMax) errors.displayName = 'Your name as people will know it, 2–80 characters.';
  if (!v.intro) errors.intro = 'Write a few lines about yourself and what you’d like to hold.';
  else if (v.intro.length < LIMITS.introMin) errors.intro = 'A little more, please — a few lines, so we know who we’re saying yes to.';
  if (v.link && !/^https?:\/\/\S+\.\S+/i.test(v.link)) errors.link = 'A full link, starting with https://';
  if (v.phone.length > LIMITS.hostPhoneMax) errors.phone = 'That number is too long.';
  return { errors, value: v };
}

const INTRO_FIELD_ID = { displayName: 'sn-h-name', intro: 'sn-h-intro', link: 'sn-h-link', phone: 'sn-h-phone' };

/**
 * Introduce yourself — a note to our team, not a profile. It goes to the
 * owners (Mise OS → Sanctuary → Requests, and their inbox) and is never shown
 * on the site; the profile is built after we've said yes.
 */
function IntroForm({ initialName, onSubmit }) {
  const [form, setForm] = useState({ displayName: initialName || '', intro: '', link: '', phone: '' });
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);
  const { errors, blur, clear, all } = useFieldErrors(validateIntro, form);
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); clear(k); };

  const submit = async (e) => {
    e.preventDefault();
    const { errors: errs, value: v } = all();
    const first = Object.keys(INTRO_FIELD_ID).find((k) => errs[k]);
    if (first) { document.getElementById(INTRO_FIELD_ID[first])?.focus(); return; }
    setBusy(true); setFailure(null);
    try { await onSubmit(v); } catch (err) { setFailure(err.message || 'That didn’t send. Please try again.'); setBusy(false); }
  };

  return (
    <form className="sn-form sn-intro-form" onSubmit={submit} noValidate>
      <Field label="Your name" error={errors.displayName} hint="As people will know you on the calendar. You can change it later." htmlFor="sn-h-name">
        <input id="sn-h-name" value={form.displayName} onChange={set('displayName')} onBlur={blur('displayName')} maxLength={LIMITS.hostNameMax} autoComplete="name" />
      </Field>
      <Field label="Your introduction" error={errors.intro} hint="Who you are, what you’d like to hold — a class, a workshop, an evening — and where you’ve held it before." htmlFor="sn-h-intro">
        <textarea id="sn-h-intro" rows={7} value={form.intro} onChange={set('intro')} onBlur={blur('intro')} maxLength={LIMITS.introMax} />
      </Field>
      <Field label="Website or Instagram (optional)" error={errors.link} hint="So we can see your work." htmlFor="sn-h-link">
        <input id="sn-h-link" type="url" placeholder="https://" value={form.link} onChange={set('link')} onBlur={blur('link')} maxLength={LIMITS.linkMax} />
      </Field>
      <Field label="Phone (optional)" error={errors.phone} hint="In case we’d like to call. Never shown on the site." htmlFor="sn-h-phone">
        <input id="sn-h-phone" type="tel" value={form.phone} onChange={set('phone')} onBlur={blur('phone')} maxLength={LIMITS.hostPhoneMax} autoComplete="tel" />
      </Field>
      {failure && <p className="sn-failure" role="alert">{failure}</p>}
      <button type="submit" className="btn forest sn-submit" disabled={busy}>{busy ? 'Sending…' : 'Send my introduction'}</button>
    </form>
  );
}

/** Someone who has introduced themselves: waiting to hear, or told no / paused. */
function StatusPanel({ host }) {
  if (host.status === 'requested') {
    // older requests wrote the introduction into bio (before POS 20261130000000)
    const sent = String(host.intro || host.bio || '').trim();
    return (
      <div className="sn-gate">
        <JoinSteps at={3} />
        <h1 className="display sn-gate-h">Thank you, {host.display_name.split(' ')[0]}. Your introduction is with us.</h1>
        <p className="lede">
          We read every one and reply personally, usually within a few days, by email{host.phone ? ' or phone' : ''}.
          Once we’ve said yes, this is where you build your profile and send your first event.
        </p>
        <section className="sn-yours" aria-labelledby="sn-yours-h">
          <h2 id="sn-yours-h" className="sn-yours-h">What you sent</h2>
          {sent && <p className="sn-yours-intro">{sent}</p>}
          <dl className="sn-facts">
            <div><dt>Name</dt><dd>{host.display_name}</dd></div>
            {host.email && <div><dt>Email</dt><dd>{host.email}</dd></div>}
            {host.phone && <div><dt>Phone</dt><dd>{host.phone}</dd></div>}
            {host.link && <div><dt>Link</dt><dd>{host.link}</dd></div>}
          </dl>
        </section>
        <div className="sn-gate-actions">
          <a className="btn" href={WHATSAPP} target="_blank" rel="noopener noreferrer">Message us on WhatsApp ↗</a>
        </div>
      </div>
    );
  }
  const copy = {
    declined: ['We can’t take this on right now.', 'Thank you for reaching out. If things change on either side, write to us.'],
    paused: ['Your organising is paused.', 'Your profile and events are hidden from the calendar for now. Message us to pick things back up.'],
  }[host.status] || ['Something’s not right with your organiser account.', 'Message us and we’ll sort it out.'];
  return (
    <div className="sn-gate">
      <h1 className="display sn-gate-h">{copy[0]}</h1>
      <p className="lede">{copy[1]}</p>
      {host.decision_note && <blockquote className="sn-note">{host.decision_note}</blockquote>}
      <div className="sn-gate-actions">
        <a className="btn" href={WHATSAPP} target="_blank" rel="noopener noreferrer">Message us on WhatsApp ↗</a>
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

/**
 * Where an event stands (hostEventState), in the organiser's words: the chip
 * on its row; `n` words a count of a weekly class's dates; `group` and `hint`
 * head its part of Upcoming. The words match the mails our team's review
 * sends ("approved", "we'd like a change").
 */
const STATE = {
  sent_back: { word: 'Sent back', n: (k) => `${k} sent back`, group: 'Sent back to you', hint: 'Make the change in our team’s note, then send it again.' },
  now: { word: 'Happening now', n: (k) => `${k} happening now`, group: 'Happening now', hint: '' },
  in_review: { word: 'In review', n: (k) => `${k} in review`, group: 'Waiting for our team', hint: 'You’ll hear by email.' },
  live: { word: 'Approved', n: (k) => `${k} approved`, group: 'Approved', hint: 'On the calendar. Guests can book.' },
  draft: { word: 'Draft', n: (k) => `${k} ${k === 1 ? 'draft' : 'drafts'}`, group: 'Drafts', hint: 'Only you can see these.' },
  expired: { word: 'Date passed', n: (k) => `${k} past the date`, group: 'Date passed', hint: 'Never went live. Change the date to send it again.' },
  cancelled: { word: 'Cancelled', n: (k) => `${k} cancelled`, group: 'Cancelled', hint: '' },
  done: { word: 'Held', n: (k) => `${k} held`, group: 'Held', hint: '' },
};

/** The line under a row's time: when it was approved, sent, sent back — or why it can't go live. */
function stateLine(o, s) {
  if (s === 'live' || s === 'now') {
    const since = o.reviewed_at ? `On the calendar since ${formatDay(o.reviewed_at)}` : '';
    const line = [since, o.edited_after_review && 'changed since approval'].filter(Boolean).join(' · ');
    return line ? line[0].toUpperCase() + line.slice(1) : null;
  }
  if (s === 'in_review') {
    // a review_note left on an event in review means it was sent back once, and sent again
    const sent = o.review_note ? 'Sent again' : 'Sent for review';
    return `${sent}${o.submitted_at ? ` ${formatDay(o.submitted_at)}` : ''} · you’ll hear by email`;
  }
  if (s === 'sent_back') return o.reviewed_at ? `Sent back ${formatDay(o.reviewed_at)}` : null;
  if (s === 'expired') return o.status === 'in_review' ? 'Its date came before our team could approve it.' : 'Its date has come, so it can’t go live.';
  return null;
}

/** One event on the organiser's dashboard, with its actions. */
function HostRow({ o, taken, copied, onCopy, act, nested = false }) {
  const t = taken[o.id] || 0;
  const past = isPast(o);
  const s = hostEventState(o);
  const editTo = `/sanctuary/host/edit/${o.id}`;
  // the title opens what the row already offers: a published event's own page
  // (its owner strip has Edit and guests), or the editor for one not live yet
  const titleTo = o.status === 'published' ? `/sanctuary/${o.id}`
    : o.status === 'draft' || o.status === 'in_review' ? editTo : null;
  const line = stateLine(o, s);
  return (
    <li className={`sn-hrow st-${s}${nested ? ' nested' : ''}`}>
      <DateTile iso={o.starts_at} small />
      <div className="sn-hrow-main">
        <div className="sn-hrow-tags">
          {!nested && <KindTag kind={o.kind} />}
          <span className={`sn-status st-${s}`}>{STATE[s].word}</span>
        </div>
        {!nested && (titleTo
          ? <Link className="sn-row-title sn-hrow-title" to={titleTo}>{o.title}</Link>
          : <span className="sn-row-title">{o.title}</span>)}
        <span className="sn-row-meta">
          {formatWhen(o.starts_at, o.ends_at)}
          {elsewhere(o.location) ? <> · {elsewhere(o.location)}</> : null}
          {o.status === 'published' || o.status === 'cancelled' ? <> · {o.capacity ? `${t} of ${o.capacity} reserved` : `${t} reserved`}</> : null}
        </span>
        {line && <span className="sn-hrow-state">{line}</span>}
        {s === 'sent_back' && (
          <p className="sn-hrow-note">{o.review_note ? <>Our team’s note: “{o.review_note}”</> : 'Our team would like a change before it goes on the calendar.'}</p>
        )}
      </div>
      <RowActs
        main={<>
          {s === 'sent_back' && <Link className="sn-act strong" to={editTo}>Make changes</Link>}
          {s === 'expired' && <Link className="sn-act strong" to={editTo}>Change the date</Link>}
          {(s === 'draft' || s === 'sent_back') && canPublish(o) && (
            // a sent-back event: changed (and saved as a draft), it goes back from here
            <button className={`sn-act${s === 'draft' ? ' strong' : ''}`} onClick={() => act(async () => { await checkRoom([o]); await setGatheringStatus(o.id, 'in_review'); }, 'Sent for review. You’ll hear by email when it’s live.')}>{s === 'sent_back' ? 'Send again' : 'Send for review'}</button>
          )}
          {(o.status === 'published' || o.status === 'cancelled') && <Link className="sn-act" to={`/sanctuary/host/rsvps/${o.id}`}>See guests ({t})</Link>}
          {(s === 'draft' || s === 'in_review' || s === 'live' || s === 'now') && <Link className="sn-act" to={editTo}>Edit</Link>}
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
function SeriesGroup({ rows, taken, copied, onCopy, act }) {
  const [open, setOpen] = useState(false);
  // where its dates stand, most urgent first: one word when they agree, counts when they don't
  const states = hostStateCounts(rows, { dates: true });
  const lead = states[0][0];
  // the next date that's still on, not a cancelled one
  const first = rows.find((o) => o.status !== 'cancelled') || rows[0];
  const booked = rows.reduce((n, o) => n + (taken[o.id] || 0), 0);
  const live = rows.filter((o) => o.status === 'published' && !isPast(o));
  const drafts = rows.filter((o) => o.status === 'draft');
  const note = rows.find((o) => o.review_note && hostEventState(o) === 'sent_back')?.review_note;
  return (
    <li className="sn-hseries">
      <div className={`sn-hrow st-${lead}`}>
        <DateTile iso={first.starts_at} small />
        <div className="sn-hrow-main">
          <div className="sn-hrow-tags">
            <KindTag kind={first.kind} />
            <span className="sn-repeat">{repeatLabel(weekdaysOf(rows))}</span>
            {states.length === 1
              ? <span className={`sn-status st-${lead}`}>{STATE[lead].word}</span>
              : states.map(([s, k]) => <span key={s} className={`sn-status st-${s}`}>{STATE[s].n(k)}</span>)}
          </div>
          <span className="sn-row-title">{first.title}</span>
          <span className="sn-row-meta">
            {rows.length} dates · next {formatWhen(first.starts_at, first.ends_at)}{live.length ? ` · ${booked} reserved` : ''}
          </span>
          {note && <p className="sn-hrow-note">Our team’s note: “{note}”</p>}
        </div>
        <div className="sn-hrow-acts">
          <button className="sn-act" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? 'Hide dates' : 'Show dates'}</button>
          <Link className="sn-act" to={`/sanctuary/host/edit/${(rows.find((o) => o.status !== 'cancelled' && canPublish(o)) || first).id}`} state={{ scope: 'following' }}>Edit dates and details</Link>
          {drafts.some(canPublish) && (
            <button className="sn-act strong" onClick={() => act(async () => { await checkRoom(drafts); await setSeriesStatus(first.series_id, 'draft', 'in_review'); }, 'All dates sent for review. You’ll hear by email when they’re live.')}>Send all for review</button>
          )}
          {drafts.length > 0 && (
            <ConfirmButton title={`Delete every draft date of “${first.title}”?`} confirmLabel="Delete drafts" body="Dates already on the calendar stay. The drafts are gone for good."
              onConfirm={() => act(() => deleteSeriesDrafts(first.series_id))}>Delete drafts</ConfirmButton>
          )}
          {live.length > 0 && (
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

/**
 * A new organiser's first steps, until both are done: a profile people can
 * picture (profileGaps — the same list their own profile page names), and a
 * first event. The next step to take is the one primary button.
 */
function GetStarted({ gaps, hasEvents }) {
  const profileDone = gaps.length === 0;
  const steps = [
    {
      key: 'profile', done: profileDone, title: 'Build your profile',
      text: profileDone ? 'Done — it’s what people see when they tap your name.' : `Add ${listWords(gaps)}. People book people they can picture.`,
      to: '/sanctuary/host/profile', go: profileDone ? 'Edit your profile' : 'Build your profile',
    },
    {
      key: 'event', done: hasEvents, title: 'Create your first event',
      text: hasEvents ? 'Done — you’ll find it below.' : 'Our team looks at each event before it goes live; you’ll hear by email.',
      to: '/sanctuary/host/new', go: 'Create an event',
    },
  ];
  const next = steps.find((x) => !x.done)?.key;
  return (
    <section className="sn-setup" aria-labelledby="sn-setup-h">
      <h2 id="sn-setup-h" className="sn-setup-h">{hasEvents ? 'Finish your profile' : 'Get ready for your first event'}</h2>
      <ol className="sn-setup-list">
        <li className="is-done">
          <span className="sn-setup-mark" aria-hidden="true">✓</span>
          <div className="sn-setup-text"><strong>You’re approved</strong><span>Welcome to the Sanctuary.</span></div>
        </li>
        {steps.map((x) => (
          <li key={x.key} className={x.done ? 'is-done' : ''}>
            <span className="sn-setup-mark" aria-hidden="true">{x.done ? '✓' : ''}</span>
            <div className="sn-setup-text">
              <strong>{x.title}{x.done ? <span className="sr-only"> (done)</span> : null}</strong>
              <span>{x.text}</span>
            </div>
            {!x.done && <Link className={`btn${x.key === next ? ' forest' : ''}`} to={x.to}>{x.go}</Link>}
          </li>
        ))}
      </ol>
    </section>
  );
}

const DASH_PAGE = 20;
const GUEST_PAGE = 50;

function Dashboard({ host }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState(null);
  const [taken, setTaken] = useState({});
  // Upcoming holds everything not over yet — live, waiting, drafts, sent back —
  // in parts by where it stands, so nothing hides behind another tab
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

  const split = useMemo(() => {
    const { upcoming, drafts, past } = splitHostOfferings(rows || []);
    return { upcoming: [...upcoming, ...drafts].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)), past };
  }, [rows]);
  const act = async (fn, done) => {
    setFailure(null); setNotice(null);
    try { await fn(); await load(); if (done) setNotice(done); } catch (e) { setFailure(e.message || 'That didn’t work. Please try again.'); }
  };
  const copyLink = async (id) => {
    const url = `${window.location.origin}/sanctuary/${id}`;
    try { await navigator.clipboard.writeText(url); setCopied(id); setTimeout(() => setCopied(null), 2000); } catch { window.prompt('Copy this link', url); }
  };

  const TABS = [['upcoming', 'Upcoming'], ['past', 'Past']];
  const q = query.trim().toLowerCase();
  const list = useMemo(() => split[tab].filter((o) => !q || `${o.title} ${o.location}`.toLowerCase().includes(q)), [split, tab, q]);
  // Past stays date by date. Upcoming shows a weekly class once, in parts by
  // where each stands, most urgent first (a series by its most urgent date);
  // within a part, soonest first.
  const entries = useMemo(() => {
    if (tab === 'past') return list.map((o) => ({ key: o.id, row: o }));
    const rank = (e) => HOST_STATE_ORDER.indexOf(e.group);
    return groupHostSeries(list)
      .map((e) => ({ ...e, group: e.series ? hostStateCounts(e.series, { dates: true })[0][0] : hostEventState(e.row) }))
      .sort((a, b) => rank(a) - rank(b));
  }, [list, tab]);
  const shown = entries.slice(page * DASH_PAGE, (page + 1) * DASH_PAGE);
  const parts = [];
  for (const e of shown) {
    const last = parts[parts.length - 1];
    if (last && last.group === e.group) last.entries.push(e);
    else parts.push({ group: e.group, entries: [e] });
  }
  const partSize = (g) => entries.filter((e) => e.group === g).length;
  const shared = { taken, copied, onCopy: copyLink, act };
  const count = (k) => (rows ? (k === 'past' ? split[k].length : groupHostSeries(split[k]).length) : '–');
  const gaps = profileGaps(host);
  // a new organiser's checklist; before their first event, while it says "build your
  // profile" next, that's the page's one primary button
  const setup = Boolean(rows) && (gaps.length > 0 || rows.length === 0);
  const profileFirst = setup && gaps.length > 0 && rows.length === 0;

  return (
    <div className="sn-dash">
      <div className="sn-dash-head">
        <div>
          <h1 className="display sn-dash-h">Welcome, {host.display_name.split(' ')[0]}</h1>
        </div>
        <div className="sn-dash-tools">
          <button className={`btn${profileFirst ? '' : ' forest'}`} onClick={() => navigate('/sanctuary/host/new')}>Create an event</button>
          <div className="sn-dash-links">
            <Link className="sn-act" to="/sanctuary/host/profile">Edit your profile</Link>
            <Link className="sn-act" to={`/sanctuary/hosts/${host.user_id}`}>Visit your profile</Link>
          </div>
        </div>
      </div>

      {notice && (
        <p className="sn-notice" role="status">
          {notice}
          <button type="button" className="sn-act" onClick={() => setNotice(null)}>Dismiss</button>
        </p>
      )}
      {setup && <GetStarted gaps={gaps} hasEvents={rows.length > 0} />}

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
              <button className="btn" onClick={() => setQuery('')}>Clear search</button>
            </div>
          ) : (
            <div className="sn-empty sn-empty-in">
              <p className="sn-empty-h">{tab === 'past' ? 'Nothing in the past yet.' : 'Nothing coming up yet.'}</p>
              <p>{tab === 'past'
                ? 'Events you’ve held land here once they’re over.'
                : 'Create an event and send it for review. Drafts, events waiting for our team and approved ones all show here.'}</p>
              {tab !== 'past' && !setup && <button className="btn" onClick={() => navigate('/sanctuary/host/new')}>Create an event</button>}
            </div>
          )
        ) : tab === 'past' ? (
          <ul className="sn-hlist">
            {shown.map((e) => <HostRow key={e.key} o={e.row} {...shared} />)}
          </ul>
        ) : parts.map(({ group, entries: part }) => (
          <section key={group} className={`sn-part st-${group}`} aria-labelledby={`sn-part-${group}`}>
            <div className="sn-part-head">
              <h2 id={`sn-part-${group}`} className="sn-part-h">
                {STATE[group].group}<span className="sn-part-n">{partSize(group)}</span>
              </h2>
              {STATE[group].hint && <p className="sn-part-hint">{STATE[group].hint}</p>}
            </div>
            <ul className="sn-hlist">
              {part.map((e) => (e.series
                ? <SeriesGroup key={e.key} rows={e.series} {...shared} />
                : <HostRow key={e.key} o={e.row} {...shared} />))}
            </ul>
          </section>
        ))}
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

/**
 * A weekly class from `row` on, as the editor's days and last date. The days
 * are its pattern — weekdays it meets on more than once, so one date moved to
 * another day doesn't become a whole new weekday (every weekday when none repeats).
 */
function laterDays(dates, row) {
  const later = dates.filter((o) => o.status !== 'cancelled' && new Date(o.starts_at) >= new Date(row.starts_at));
  const list = later.length ? later : [row];
  const days = list.map((o) => weekdayOf(isoToIstParts(o.starts_at).date));
  const repeated = [...new Set(days.filter((d, i) => days.indexOf(d) !== i))];
  return { weekdays: repeated.length ? repeated : [...new Set(days)], untilDate: isoToIstParts(list[list.length - 1].starts_at).date };
}
const sameDays = (a, b) => a.length === b.length && a.every((d) => b.includes(d));

/** 'Mon 1 Dec, Mon 8 Dec and 3 more' — from 'YYYY-MM-DD' dates. */
const daysWords = (dates, max = 4) => {
  const days = dates.slice(0, max).map((d) => formatDay(istToIso(d, '12:00')));
  return dates.length > max ? `${days.join(', ')} and ${dates.length - max} more` : listWords(days);
};
const dayOfRow = (o) => isoToIstParts(o.starts_at).date;
const datesWord = (n) => (n === 1 ? '1 date' : `${n} dates`);

/** A date taken off a weekly class: a live one is cancelled (its guests hear); the rest go. */
async function takeOff(o) {
  if (o.status === 'published') { await setGatheringStatus(o.id, 'cancelled'); return; }
  // only a draft can be deleted: one waiting for review steps back to draft first
  if (o.status === 'in_review') await setGatheringStatus(o.id, 'draft');
  await deleteDraft(o.id);
}

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

/**
 * A weekly class's dates from here on, with what the new days or last date
 * change: dates added (new ones go to our team first, unless it's all drafts)
 * and dates taken off (anyone booked hears it's off).
 */
function LaterDates({ check, plan, weekdays, addStatus, booked, current }) {
  // as it is, until the days or the last date change
  if (!check) {
    return (
      <>
        <div className="sn-repeat-preview" aria-live="polite">
          <p><strong>{repeatLabel(weekdays)}</strong>, {seriesSummary(current)}.</p>
          <p>The dates stay as they are.</p>
        </div>
        <ul className="sn-series-dates" aria-label="The dates">{current.map((d) => <li key={d}>{formatDay(istToIso(d, '12:00'))}</li>)}</ul>
      </>
    );
  }
  if (!plan) return <p className="sn-repeat-preview" aria-live="polite">{check.errors.repeat}</p>;
  const added = new Set(plan.add);
  const n = check.dates.length;
  return (
    <>
      <div className="sn-repeat-preview" aria-live="polite">
        <p><strong>{repeatLabel(weekdays)}</strong>, {seriesSummary(check.dates)}.</p>
        {plan.add.length > 0 && <p>Adds {daysWords(plan.add)}{addStatus === 'draft' ? '.' : ' — new dates go to our team before they’re on the calendar.'}</p>}
        {plan.drop.length > 0 && <p>Takes off {daysWords(plan.drop.map(dayOfRow))}{booked ? ` — ${booked} booked on ${plan.drop.length === 1 ? 'it' : 'them'} will hear it’s off` : ''}.</p>}
        {!plan.add.length && !plan.drop.length && <p>The dates stay as they are.</p>}
      </div>
      <ul className="sn-series-dates" aria-label={`The ${n === 1 ? 'date' : 'dates'}`}>
        {check.dates.map((d) => (
          <li key={d}>{formatDay(istToIso(d, '12:00'))}{added.has(d) && <span className="sn-new"> new</span>}</li>
        ))}
      </ul>
    </>
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
  // a weekly class's dates and who's booked on them — for changing its later dates
  const [series, setSeries] = useState(null);
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
    getMyGathering(src).then(async (row) => {
      if (!row) { navigate('/sanctuary/host', { replace: true }); return; }
      // every form carries the repeat fields, so nothing that reads them (goToError) meets undefined
      if (!gid) { setForm({ ...duplicateForm(row), ...NO_REPEAT }); return; }
      // A weekly class: its days and last date from this date on, in the same first
      // form (so opening it never reads as unsaved changes). If they don't load,
      // "This and later dates" still changes the details, just not the dates.
      let later = {};
      if (row.series_id) {
        try {
          const [dates, rsvps] = await Promise.all([listSeries(row.series_id), listRsvps()]);
          later = laterDays(dates, row);
          setSeries({ rows: dates, taken: seatsTaken(rsvps), opened: later });
        } catch { /* details only */ }
      }
      setOriginal(row); setForm({ ...offeringToForm(row), ...NO_REPEAT, ...later });
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
    const errs = { ...validateOffering(form).errors, ...(form.repeat === 'weekly' && !gid ? validateRepeat(form).errors : {}), ...(laterCheck ? laterCheck.errors : {}) };
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
  // "This and later dates" of a weekly class: its days and last date, and what they change
  // Untouched days and last date mean details only: the dates are never re-worked
  // just because the class was opened.
  const fromDate = original ? isoToIstParts(original.starts_at).date : '';
  const showLater = Boolean(following && series);
  const datesChanged = showLater && (!sameDays(form.weekdays, series.opened.weekdays) || form.untilDate !== series.opened.untilDate);
  const laterCheck = datesChanged ? validateRepeat({ ...form, repeat: 'weekly', startDate: fromDate }, { min: 1 }) : null;
  const changeOf = (rows) => seriesChange(rows, original.starts_at, laterCheck.dates, { startTime: form.startTime, until: form.untilDate, pattern: series.opened.weekdays });
  const plan = laterCheck && !laterCheck.errors.repeat ? changeOf(series.rows) : null;
  const addStatus = original?.status === 'draft' ? 'draft' : 'in_review';
  const dropping = plan ? plan.drop : [];
  const dropBooked = dropping.reduce((n, o) => n + (series.taken[o.id] || 0), 0);
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
  // the later dates run from this date: undo a date moved under "This date only"
  const pickScope = (v) => {
    setScope(v);
    if (v === 'following' && original) {
      const o = offeringToForm(original);
      update({ startDate: o.startDate, endDate: o.endDate });
    }
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
    if (laterCheck) Object.assign(errs, laterCheck.errors);
    if (status === 'in_review' && row0.starts_at && !canPublish(row0)) errs.start = 'That time has already passed.';
    setFailure(null);
    if (Object.keys(errs).length) { setErrors(errs); goToError(errs); return; }
    setBusy(true);
    // New days for a weekly class: what to add and take off, worked out from the
    // dates as they are now — a retry after a half-finished save mustn't add twice.
    const fromForm = { ...form, startDate: fromDate };
    let change = null;
    if (laterCheck) {
      try { change = changeOf(await listSeries(original.series_id)); } catch (err) {
        setFailure(err.message || 'Could not save. Please try again.'); setBusy(false); return;
      }
    }
    // One room: a time that's taken by a live event can't be approved, so say so now.
    // Asked fresh, not from what's on screen; the database checks again on approval.
    const times = following ? (change && addStatus !== 'draft' ? seriesRows(fromForm, row0, change.add, null) : [])
      : status === 'draft' ? [] : weekly ? seriesRows(form, row0, rep.dates, null) : [row0];
    if (row0.at_sanctuary && times.length) {
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
        // new dates first, then every later date's details; taking dates off can't be undone, so last
        if (change?.add.length) await createSeries(userId, seriesRows(fromForm, { ...row0, status: addStatus }, change.add, original.series_id));
        await updateSeries(original.series_id, original.starts_at, row0, form.startTime, durationMinutes(row0));
        for (const o of change?.drop || []) await takeOff(o);
      } else if (weekly) {
        await createSeries(userId, seriesRows(form, row, rep.dates, crypto.randomUUID()));
      } else {
        await saveGathering(userId, row, gid || null);
      }
      // a clip uploaded here and then left on the other tab would sit in storage unused
      if (form.videoPath && row0.video_path !== form.videoPath) dropClip(form.videoPath);
      savedOk.current = true;
      try { localStorage.removeItem(draftKey); } catch { /* fine */ }
      // where the event now stands: what was asked for, or (a save of a live or
      // in-review event, or of its later dates) what it already was
      const now = status || original?.status;
      const added = change?.add.length ? `${datesWord(change.add.length)} added${addStatus === 'draft' ? '' : ' — new dates go live once our team approves them'}.` : '';
      const dropped = change?.drop.length ? `${datesWord(change.drop.length)} taken off.` : '';
      const notice = following ? ['Every later date is updated.', added, dropped].filter(Boolean).join(' ')
        : status === 'in_review' ? (weekly ? 'All dates sent for review. You’ll hear by email when they’re live.' : 'Sent for review. You’ll hear by email when it’s live.')
          : status === 'draft' ? 'Saved as a draft. Only you can see it.'
            : now === 'in_review' ? 'Changes saved. It goes live once our team approves it.'
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
  const heading = following ? 'Edit this and later dates' : gid ? 'Edit event' : duplicateOf ? 'Duplicate event' : 'New event';
  const inReview = original?.status === 'in_review';
  const sideNote = following
    ? 'Saving updates this date and every later one.'
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
            <span className="sn-hint">Change what’s needed, then send it for review again.</span>
          </div>
        )}
        {inSeries && (
          <div className="sn-scope">
            <div className="sn-seg" role="radiogroup" aria-label="Change" onKeyDown={onRadioKeys}>
              {[['one', 'This date only'], ['following', 'This and later dates']].map(([v, label], i) => (
                <button type="button" key={v} role="radio" aria-checked={scope === v} tabIndex={tabStop(scope === v, i === 0, true)}
                  className={`sn-seg-opt${scope === v ? ' on' : ''}`} onClick={() => pickScope(v)}>{label}</button>
              ))}
            </div>
            <p className="sn-hint">
              {following
                ? (series
                  ? 'This date and every later one take these details and times. Change the days or the last date to add dates or take some off.'
                  : 'Every later date keeps its own day and takes these details, start time and length. Cancelled dates are left alone.')
                : 'Only this date changes. The rest of the series stays as it is.'}
            </p>
          </div>
        )}
      </div>

      <form className={`sn-editor-grid${typing ? ' kb-open' : ''}`} noValidate onSubmit={(e) => {
        e.preventDefault();
        // taking live dates off asks first, even from Enter in a field
        if (following && dropping.length) { document.getElementById('sn-e-save')?.click(); return; }
        save(isPublished || following || inReview ? undefined : 'draft');
      }}>
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
                <Field label={following ? 'From' : weekly ? 'First date' : 'Starts on'} error={errors.start} htmlFor="sn-e-date">
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
                <Field label={following ? 'From' : weekly ? 'First date' : 'Date'} error={errors.start} htmlFor="sn-e-date">
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
            {(weekly || showLater) && (
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
                {showLater ? (
                  <LaterDates check={laterCheck} plan={plan} weekdays={form.weekdays} addStatus={addStatus} booked={dropBooked}
                    current={series.rows.filter((o) => o.status !== 'cancelled' && new Date(o.starts_at) >= new Date(original.starts_at)).map(dayOfRow)} />
                ) : (
                <>
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
                </>
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
            {following && dropping.length ? (
              <ConfirmButton id="sn-e-save" className="btn forest" disabled={busy}
                title={`Take ${datesWord(dropping.length)} off?`} confirmLabel="Take off and save" keepLabel="Keep them"
                body={`${daysWords(dropping.map(dayOfRow))} ${dropping.length === 1 ? 'goes' : 'go'}.${dropBooked ? ` ${dropBooked} ${dropBooked === 1 ? 'person has' : 'people have'} a place; everyone who gave an email hears it’s off.` : ''} This can’t be undone.`}
                onConfirm={() => save()}>{busy ? 'Saving…' : 'Save every later date'}</ConfirmButton>
            ) : following ? (
              <button type="submit" className="btn forest" disabled={busy}>{busy ? 'Saving…' : 'Save every later date'}</button>
            ) : isPublished || inReview ? (
              <button type="submit" className="btn forest" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
            ) : (
              <>
                <button type="button" className="btn forest" disabled={busy} onClick={() => save('in_review')}>
                  {busy ? 'Sending…' : weekly ? 'Send all for review' : 'Send for review'} 
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
  if (!g) return <div className="sn-empty"><p className="sn-empty-h">This isn’t one of your events.</p><Link className="btn" to="/sanctuary/host">Go to your events</Link></div>;

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
              <button className="btn" onClick={() => setQuery('')}>Clear search</button>
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
  const { user, loading, signOut, refreshHost } = useAuth();
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

  // "Not you?": signed out, the page is the sign-in again — the way to try another account
  const out = () => signOut();

  let body;
  if (loading) body = <Spinner />;
  else if (!user) body = <SignIn />;
  else if (failure) {
    body = (
      <div className="sn-gate">
        <h1 className="display sn-gate-h">{notOpenYet(failure) ? 'Organising opens very soon.' : 'Something went wrong.'}</h1>
        <p className="lede">{notOpenYet(failure) ? 'We’re putting the finishing touches on it. Message us on WhatsApp in the meantime.' : 'Please reload the page and try again.'}</p>
        <button className="sn-act" onClick={out}>Sign out</button>
      </div>
    );
  } else if (host === undefined) body = <Spinner />;
  else if (host === null) {
    const meta = user.user_metadata || {};
    body = (
      <div className="sn-gate">
        <JoinSteps at={2} />
        <h1 className="display sn-gate-h">Introduce yourself</h1>
        <p className="lede">
          A note to our team: who you are, and what you’d like to hold. Only we read it — your profile, the page
          people see, comes after we’ve said yes.
        </p>
        <IntroForm
          initialName={meta.full_name || meta.name || ''}
          onSubmit={async (v) => { setHost(await requestToHost(user.id, v)); refreshHost?.(); }}
        />
        <p className="sn-gate-who">
          Signed in as <strong>{user.email}</strong>
          <button className="sn-act" onClick={out}>Not you? Sign out</button>
        </p>
        <p className="sn-gate-who">
          Only here for your bookings? <Link className="sn-act" to="/account">Your account</Link>
        </p>
      </div>
    );
  } else if (host.status !== 'approved') body = <StatusPanel host={host} />;
  else {
    body = (
      <Routes>
        <Route index element={<Dashboard host={host} />} />
        <Route path="new" element={<Editor userId={user.id} hostName={host.display_name} place={placeLine(host)} />} />
        <Route path="edit/:gid" element={<Editor userId={user.id} hostName={host.display_name} place={placeLine(host)} />} />
        <Route path="rsvps/:gid" element={<Guests />} />
        <Route path="profile" element={<OrganiserPageEditor host={host} onSaved={(row) => { setHost(row); refreshHost?.(); }} />} />
        <Route path="*" element={<Dashboard host={host} />} />
      </Routes>
    );
  }

  return (
    <main className="sn-view sn-host-view">
      <SEO title="Organise with us | Conscious Sanctuary" url="/sanctuary/host" noIndex />
      {body}
    </main>
  );
};

export default HostPage;

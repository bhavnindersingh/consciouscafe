import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { dateBlock, kindLabel, formatWhen, formatTimes, priceLabel, seatsLabel, isFull, parseVideoLink, elsewhere } from '../../utils/sanctuary';
import { imageUrl, videoFileUrl } from '../../services/sanctuaryService';


export const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div', style }) => (
  <Tag style={style} className={`reveal${delay ? ` d${delay}` : ''} ${className}`}>{children}</Tag>
);

/** The calendar tile: TUE / 10 / NOV, in IST. */
export const DateTile = ({ iso, small = false }) => {
  const d = dateBlock(iso);
  return (
    <div className={`sn-tile${small ? ' sm' : ''}`} aria-hidden="true">
      <span className="sn-tile-dow">{d.weekday}</span>
      <span className="sn-tile-day">{d.day}</span>
      <span className="sn-tile-mon">{d.month}</span>
    </div>
  );
};

export const KindTag = ({ kind }) => <span className={`sn-kind sn-kind-${kind}`}>{kindLabel(kind)}</span>;

/** "▶ Video" beside the kind, when there is one we can actually play. */
export const VideoTag = ({ o }) => (o.video_path || parseVideoLink(o.video_url)
  ? <span className="sn-has-video"><svg width="9" height="9" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v16l14-8z" fill="currentColor" /></svg>Video</span>
  : null);

export const Field = ({ label, error, hint, children, htmlFor }) => (
  <label className={`sn-field${error ? ' has-error' : ''}`} htmlFor={htmlFor}>
    <span className="sn-label">{label}</span>
    {children}
    {error ? <span className="sn-err" role="alert">{error}</span> : hint ? <span className="sn-hint">{hint}</span> : null}
  </label>
);

/** True once `ms` have passed — so a loader never flashes for a load that's quicker than that. */
export function useDelayed(ms = 100) {
  const [ready, setReady] = useState(ms <= 0);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}

/** An inline "working on it" line for short waits (a step, a list); nothing for the first 100 ms. */
export const Spinner = ({ label = 'Loading' }) => {
  const show = useDelayed(100);
  return (
    <div className="sn-loading" role="status" aria-live="polite">
      {show && <><span className="sn-spin" />{label}</>}
    </div>
  );
};

/**
 * A page-shaped placeholder while a whole page loads (over a second on a slow
 * phone): the layout that is about to arrive, in quiet blocks — never a lone
 * spinner in the middle of the screen. Nothing for the first 100 ms.
 *   detail  — back link, kind, title, when and where, photo, words
 *   profile — cover, photo circle, name, a few lines
 *   list    — rows with a tile and two lines
 *   form    — a column of labelled fields
 */
export function PageSkeleton({ kind = 'detail', label = 'Loading' }) {
  const show = useDelayed(100);
  const Bar = ({ w = '100%', h = 14 }) => <span className="sn-skel" style={{ width: w, height: h }} />;
  const rows = (n) => Array.from({ length: n }, (_, i) => (
    <div className="sn-skel-row" key={i}><span className="sn-skel sn-skel-tile" /><div><Bar w="60%" h={22} /><Bar w="40%" /></div></div>
  ));
  return (
    <div className={`sn-skeleton sn-skel-${kind}`} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {show && kind === 'detail' && (
        <div className="sn-skel-page">
          <Bar w="120px" h={12} />
          <div className="sn-skel-head"><Bar w="20%" h={12} /><Bar w="70%" h={56} /><Bar w="45%" h={18} /><Bar w="35%" h={18} /></div>
          <span className="sn-skel sn-skel-img" />
          <Bar w="90%" /><Bar w="80%" /><Bar w="60%" />
        </div>
      )}
      {show && kind === 'profile' && (
        <>
          <span className="sn-skel sn-skel-cover" />
          <div className="sn-skel-page"><span className="sn-skel sn-skel-avatar" /><Bar w="50%" h={40} /><Bar w="35%" /><Bar w="90%" /><Bar w="75%" /></div>
        </>
      )}
      {show && kind === 'list' && <div className="sn-skel-list">{rows(4)}</div>}
      {show && kind === 'form' && (
        <div className="sn-skel-page sn-skel-form">
          <Bar w="40%" h={40} />
          {[0, 1, 2, 3].map((i) => <div key={i}><Bar w="20%" h={12} /><span className="sn-skel sn-skel-field" /></div>)}
        </div>
      )}
    </div>
  );
}

/**
 * Keep Tab inside `ref` while it's open, close on Escape, and put focus back
 * where it was when it closes. For dialogs and the photo viewer.
 * `returnRef`: where focus goes back to, when that isn't where it was — Safari
 * doesn't focus a button on click, so the calendar names its day.
 */
export function useFocusTrap(ref, onEscape, firstRef, returnRef) {
  useEffect(() => {
    const before = returnRef?.current || document.activeElement;
    (firstRef?.current || ref.current?.querySelector('button, a[href], input, textarea, select'))?.focus();
    const key = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onEscape(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const f = [...ref.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), textarea, select, [tabindex="0"]')];
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key, true);
    // preventScroll: closing by a click further down the page mustn't jump back up
    // to the trigger before that click lands
    return () => { document.removeEventListener('keydown', key, true); (returnRef?.current || before)?.focus?.({ preventScroll: true }); };
  }, [ref, onEscape, firstRef, returnRef]);
}

/**
 * The confirmation every destructive action gets: it names exactly what goes
 * ("Cancel “Kirtan evening”?"), says what happens to people, and puts the
 * destructive verb on a red button. Keep (the safe choice) has focus; Escape
 * and a tap outside cancel. No browser dialog.
 */
export function ConfirmDialog({ title, body, confirmLabel, keepLabel = 'Keep it', onConfirm, onClose, busy }) {
  const box = useRef(null);
  const keep = useRef(null);
  const close = useCallback(() => { if (!busy) onClose(); }, [busy, onClose]);
  useFocusTrap(box, close, keep);
  return (
    <div className="sn-dialog-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="sn-dialog" role="alertdialog" aria-modal="true" aria-labelledby="sn-dialog-h" aria-describedby={body ? 'sn-dialog-b' : undefined} ref={box}>
        <h2 id="sn-dialog-h" className="sn-dialog-h">{title}</h2>
        {body && <p id="sn-dialog-b" className="sn-dialog-b">{body}</p>}
        <div className="sn-dialog-acts">
          <button type="button" className="btn" ref={keep} onClick={close} disabled={busy}>{keepLabel}</button>
          <button type="button" className="btn sn-btn-danger" onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/** A quiet action button that opens ConfirmDialog; `onConfirm` may be async. */
export function ConfirmButton({ children, className = 'sn-act', title, body, confirmLabel, keepLabel, onConfirm, disabled }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); setOpen(false); }
  };
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} disabled={disabled}>{children}</button>
      {open && <ConfirmDialog title={title} body={body} confirmLabel={confirmLabel} keepLabel={keepLabel} busy={busy} onConfirm={go} onClose={() => setOpen(false)} />}
    </>
  );
}

/**
 * Arrow keys for a group of role="radio" (or role="tab") buttons — the WAI-ARIA
 * radio pattern: ←/→/↑/↓ move and select, Home/End jump. Put it on the group.
 */
export function onRadioKeys(e) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (step === undefined && e.key !== 'Home' && e.key !== 'End') return;
  const items = [...e.currentTarget.querySelectorAll('[role="radio"]:not([disabled]), [role="tab"]:not([disabled])')];
  const i = items.indexOf(document.activeElement);
  if (i < 0 || !items.length) return;
  e.preventDefault();
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + step + items.length) % items.length;
  items[next].focus();
  items[next].click();
}

/** Roving tab stop: only the chosen option (or the first, when none is) is in the Tab order. */
export const tabStop = (chosen, first, anyChosen) => (chosen || (!anyChosen && first) ? 0 : -1);

/**
 * Blur-first validation for a form: a field shows its error only after it has
 * been left once (or on submit), and the error clears as soon as it's edited.
 * `validate(values)` returns { errors }; field names map to error keys via `keyOf`.
 */
export function useFieldErrors(validate, values, keyOf = (k) => k) {
  const [errors, setErrors] = useState({});
  const latest = useRef(values);
  latest.current = values;
  const blur = (field) => () => {
    const k = keyOf(field);
    const e = validate(latest.current).errors[k];
    setErrors((er) => (er[k] === e ? er : { ...er, [k]: e }));
  };
  const clear = (field) => {
    const k = keyOf(field);
    setErrors((er) => (er[k] ? { ...er, [k]: undefined } : er));
  };
  const all = () => {
    const { errors: errs, value } = validate(latest.current);
    const real = Object.fromEntries(Object.entries(errs).filter(([, v]) => v));
    setErrors(real);
    return { errors: real, value };
  };
  return { errors, blur, clear, all, setErrors };
}

/**
 * One gathering in a list (calendar, host page, more dates). A collapsed weekly
 * series (collapseSeries) also carries `repeat` and `more`.
 */
/** `timeOnly`: the list is already under its day (the calendar pop-up), so the meta shows just the time. */
export const GatheringRow = ({ o, showHost = true, compact = false, timeOnly = false }) => {
  const img = !compact && imageUrl(o.image_path);
  const full = isFull(o);
  return (
    <Link className={`sn-row${img ? ' has-img' : ''}${compact ? ' compact' : ''}`} to={`/sanctuary/${o.id}`}>
      <DateTile iso={o.starts_at} small={compact} />
      <div className="sn-row-main">
        <span className="sn-row-tags">
          <KindTag kind={o.kind} />
          {o.repeat && <span className="sn-repeat">{o.repeat}</span>}
          <VideoTag o={o} />
        </span>
        <span className="sn-row-title">{o.title}</span>
        <span className="sn-row-meta">
          {timeOnly ? formatTimes(o.starts_at, o.ends_at) : formatWhen(o.starts_at, o.ends_at)}
          {elsewhere(o.location) ? <> · <span className="sn-row-place">{elsewhere(o.location)}</span></> : null}
          {showHost && o.host_name ? <> · with {o.host_name}</> : null}
          {o.more ? <> · and {o.more} more {o.more === 1 ? 'date' : 'dates'}</> : null}
        </span>
      </div>
      {img && <img className="sn-row-img" src={img} alt="" loading="lazy" />}
      <div className="sn-row-side">
        <span className="sn-price">{priceLabel(o.price_inr)}</span>
        <span className={`sn-seats${full ? ' full' : ''}`}>{seatsLabel(o.seats_left, o.capacity)}</span>
        <span className="sn-row-go">{full ? 'See details' : 'Reserve'}</span>
      </div>
    </Link>
  );
};

const PlayMark = () => (
  <span className="sn-video-play" aria-hidden="true">
    <svg width="22" height="22" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
  </span>
);

/**
 * A gathering's video: an uploaded clip, or a link. A link is parsed again here
 * (the stored text is the host's own), and only the provider + id parsed from it
 * reach the iframe — an address we don't recognise shows nothing. YouTube shows
 * its still with a play button and loads the player on the tap, which keeps a
 * phone from fetching a megabyte of player for a video nobody plays.
 */
export function GatheringVideo({ url, path, title = '', className = '' }) {
  const [playing, setPlaying] = useState(false);
  const file = videoFileUrl(path);
  if (file) {
    return (
      <div className={`sn-video is-file ${className}`}>
        {/* preload=metadata: the first frame and the length, not the whole clip */}
        <video src={`${file}#t=0.1`} controls playsInline preload="metadata" aria-label={title ? `Video: ${title}` : 'Video'} />
      </div>
    );
  }
  const v = parseVideoLink(url);
  if (!v) return null;
  const igPost = v.provider === 'instagram' && v.url.includes('/p/');
  const shape = `sn-video p-${v.provider}${v.vertical ? ' tall' : ''}${igPost ? ' ig-post' : ''} ${className}`;
  if (v.provider === 'youtube' && !playing) {
    return (
      <button type="button" className={`${shape} sn-video-poster`} onClick={() => setPlaying(true)}
        aria-label={`Play the video${title ? `: ${title}` : ''}`}>
        <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" />
        <PlayMark />
      </button>
    );
  }
  return (
    <div className={shape}>
      <iframe
        src={v.provider === 'youtube' ? `${v.embed}&autoplay=1` : v.embed}
        title={`${v.label} video${title ? `: ${title}` : ''}`}
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

/** Scroll an element to the top of the screen; no glide for reduced motion. */
export function scrollToEl(el) {
  if (!el) return;
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' });
}

/**
 * A bar pinned to the bottom of a phone's screen (one column only — the
 * .sn-reserve-bar rules in sanctuary.css). It steps away once `target` (a ref)
 * is on screen or scrolled past, so it never sits over the form it leads to.
 * `children` is called with `away`, to take its buttons out of the tab order.
 */
export function PinnedBar({ target, children }) {
  const [away, setAway] = useState(false);
  useEffect(() => {
    const el = target.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setAway(e.isIntersecting || e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  return (
    <div className={`sn-reserve-bar${away ? ' is-away' : ''}`} aria-hidden={away || undefined}>
      {children(away)}
    </div>
  );
}

/**
 * True while the on-screen keyboard is up: the visible area is then much shorter
 * than the screen was before it opened. Measured against the tallest window seen
 * at this width — some browsers shrink the window itself for the keyboard, so the
 * current innerHeight can't be the yardstick; turning the phone starts afresh.
 * Focus alone can't tell: closing Android's keyboard with Back leaves the field
 * focused, so a bar that hid on focus could stay hidden with the keyboard gone.
 * Pinch-zoom shrinks the visible area too; ignored.
 */
export function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return undefined;
    let width = window.innerWidth;
    let tallest = window.innerHeight;
    const check = () => {
      if (window.innerWidth !== width) { width = window.innerWidth; tallest = window.innerHeight; }
      tallest = Math.max(tallest, window.innerHeight);
      setOpen(vv.scale < 1.05 && tallest - vv.height > 150);
    };
    vv.addEventListener('resize', check);
    window.addEventListener('resize', check);
    check();
    return () => { vv.removeEventListener('resize', check); window.removeEventListener('resize', check); };
  }, []);
  return open;
}

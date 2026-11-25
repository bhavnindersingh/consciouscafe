import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGumletUrl } from '../../utils/gumlet';
import { imageUrl } from '../../services/sanctuaryService';
import { SANCTUARY_HERO_BRAND, SANCTUARY_HERO_EVENTS, SANCTUARY_HERO_EVENT_SECONDS } from '../../data/sanctuaryHero';
import { formatWhen, priceLabel, isFree, isFull, kindLabel, elsewhere } from '../../utils/sanctuary';
import { Arrow } from './parts';

const prefersStill = () => typeof window !== 'undefined'
  && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

const photo = (src, width) => getGumletUrl(src, { width, quality: 72, format: 'auto' });

/** The Sanctuary's own slide: the video, and the line that says what this place is. */
function BrandSlide({ still, onSeeWhatsOn }) {
  const b = SANCTUARY_HERO_BRAND;
  return (
    <>
      <div className="sn-hero-slide-media">
        <img
          src={photo(b.poster, 1400)}
          srcSet={[800, 1400, 2200].map((w) => `${photo(b.poster, w)} ${w}w`).join(', ')}
          sizes="100vw" alt="" fetchpriority="high" decoding="async"
        />
        {!still && (
          <div className="sn-hero-video">
            <iframe
              title="Conscious Sanctuary"
              src={`https://play.gumlet.io/embed/${b.gumletId}?background=true&autoplay=true&loop=true&disableControls=true&muted=true&preload=true`}
              allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="origin" tabIndex={-1}
            />
          </div>
        )}
      </div>
      <div className="sn-hero-inner">
        <span className="eyebrow on-dark">Auroville Road</span>
        <p className="display sn-hero-h">Come to Conscious Sanctuary.<br /><em>Meet the divine within.</em></p>
        <div className="sn-hero-cta">
          <button type="button" className="btn on-dark" onClick={onSeeWhatsOn}>See what’s on <Arrow /></button>
          <Link className="sn-hero-link" to="/sanctuary/restore">Book the ice bath &amp; sauna <Arrow s={14} /></Link>
        </div>
      </div>
    </>
  );
}

/** One gathering, big: its photo, when and where, and a way in. */
function EventSlide({ o, first, onSeeWhatsOn }) {
  const img = imageUrl(o.image_path);
  const place = elsewhere(o.location);
  const full = isFull(o);
  return (
    <>
      <div className="sn-hero-slide-media">
        {img && <img src={img} alt="" loading={first ? 'eager' : 'lazy'} decoding="async" />}
      </div>
      <div className="sn-hero-inner">
        <span className="eyebrow on-dark sn-hero-kind">
          {kindLabel(o.kind)}{o.repeat ? ` · ${o.repeat}` : ''}
        </span>
        <h2 className="display sn-hero-h sn-hero-title">{o.title}</h2>
        <p className="sn-hero-meta">
          {formatWhen(o.starts_at, o.ends_at)}
          {o.more ? ` · and ${o.more} more ${o.more === 1 ? 'date' : 'dates'}` : ''}
          <br />
          {[place || 'At the Sanctuary', o.host_name && `with ${o.host_name}`, isFree(o.price_inr) ? 'Free' : priceLabel(o.price_inr)].filter(Boolean).join(' · ')}
        </p>
        <div className="sn-hero-cta">
          <Link className="btn on-dark" to={`/sanctuary/${o.id}`}>{full ? 'See details' : 'Reserve a place'} <Arrow /></Link>
          <button type="button" className="sn-hero-link" onClick={onSeeWhatsOn}>See everything that’s on <Arrow s={14} /></button>
        </div>
      </div>
    </>
  );
}

/**
 * The top of /sanctuary: a carousel. The Sanctuary's own slide first, then the
 * next few gatherings on the calendar (`events`: collapseSeries rows, soonest
 * first). It moves on by itself and can be paused — anything that moves for
 * longer than five seconds must be (WCAG 2.2.2); arrows, dots, keys and a swipe
 * move it by hand. Someone who prefers reduced motion gets it paused, no video.
 * Only the slide on show is visible to a screen reader or the Tab key.
 */
export default function SanctuaryHero({ events = [], onSeeWhatsOn }) {
  const [still] = useState(prefersStill);
  const slides = useMemo(() => [
    { key: 'brand', type: 'brand' },
    ...events.slice(0, SANCTUARY_HERO_EVENTS).map((o) => ({ key: o.id, type: 'event', o })),
  ], [events]);
  const n = slides.length;
  const [at, setAt] = useState(0);
  const [paused, setPaused] = useState(still);
  const swipe = useRef(null);

  useEffect(() => { if (at >= n) setAt(0); }, [at, n]);
  useEffect(() => {
    if (paused || n < 2) return undefined;
    const seconds = slides[at]?.type === 'brand' ? SANCTUARY_HERO_BRAND.seconds : SANCTUARY_HERO_EVENT_SECONDS;
    const t = setTimeout(() => setAt((i) => (i + 1) % n), seconds * 1000);
    return () => clearTimeout(t);
  }, [at, paused, n, slides]);

  const go = (d) => setAt((i) => (i + d + n) % n);
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  };

  return (
    <header
      className={`sn-hero${still ? ' is-still' : ''}`}
      aria-roledescription="carousel"
      aria-label="Conscious Sanctuary — what’s on"
      onKeyDown={onKey}
      onTouchStart={(e) => { swipe.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (swipe.current === null) return;
        const dx = e.changedTouches[0].clientX - swipe.current;
        swipe.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <h1 className="sr-only">Conscious Sanctuary — classes, workshops and events</h1>
      {slides.map((s, i) => (
        <div
          key={s.key}
          className={`sn-hero-slide${i === at ? ' on' : ''}${s.type === 'event' ? ` is-event k-${s.o.kind}${s.o.image_path ? ' is-photo' : ''}` : ''}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${n}`}
        >
          {s.type === 'brand'
            ? <BrandSlide still={still} onSeeWhatsOn={onSeeWhatsOn} />
            : <EventSlide o={s.o} first={i === 1} onSeeWhatsOn={onSeeWhatsOn} />}
        </div>
      ))}

      {n > 1 && (
        <div className="sn-hero-ctrl">
          <button type="button" className="sn-hero-step" onClick={() => go(-1)} aria-label="Previous slide">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
          {slides.map((s, i) => (
            <button
              type="button" key={s.key}
              className={`sn-hero-dot${i === at ? ' on' : ''}`}
              aria-label={s.type === 'brand' ? 'Show the Sanctuary' : `Show ${s.o.title}`}
              aria-current={i === at || undefined}
              onClick={() => setAt(i)}
            >
              <span />
            </button>
          ))}
          {/* phones: a count instead of the dots, so every control is a full-size tap */}
          <span className="sn-hero-count" aria-hidden="true">{at + 1} / {n}</span>
          <button type="button" className="sn-hero-step" onClick={() => go(1)} aria-label="Next slide">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
          <button type="button" className="sn-hero-pause" onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Play the slideshow' : 'Pause the slideshow'}>
            {paused
              ? <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor" /></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" fill="currentColor" /></svg>}
          </button>
        </div>
      )}
    </header>
  );
}

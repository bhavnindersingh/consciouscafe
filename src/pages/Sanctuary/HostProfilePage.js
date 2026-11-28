import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { breadcrumb } from '../../utils/seoData';
import { useAuth } from '../../context/AuthContext';
import { getHost, listHostGatherings, imageUrl, getMyHost, listMyGatherings } from '../../services/sanctuaryService';
import {
  isUuid, collapseSeries, mapsUrl, safeHttpsLink, notYetPublic, profileGaps, listWords,
} from '../../utils/sanctuary';
import { Reveal, GatheringRow, PageSkeleton, useFocusTrap } from './parts';
import './sanctuary.css';

/** Full-screen photo viewer: previous / next buttons, arrow keys, Esc to close; focus returns where it was. */
function Lightbox({ photos, at, onMove, onClose }) {
  const box = useRef(null);
  const close = useRef(null);
  useFocusTrap(box, onClose, close); // Tab stays inside; Esc closes; focus goes back to the photo
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    document.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ''; };
  }, [onMove]);
  return (
    <div className="sn-lightbox" role="dialog" aria-modal="true" aria-label={`Photo ${at + 1} of ${photos.length}`} onClick={onClose} ref={box}>
      <img src={photos[at]} alt="" onClick={(e) => e.stopPropagation()} />
      <button type="button" className="sn-lb-close" ref={close} onClick={onClose} aria-label="Close">×</button>
      {photos.length > 1 && (
        <>
          <button type="button" className="sn-lb-prev" onClick={(e) => { e.stopPropagation(); onMove(-1); }} aria-label="Previous photo">‹</button>
          <button type="button" className="sn-lb-next" onClick={(e) => { e.stopPropagation(); onMove(1); }} aria-label="Next photo">›</button>
          <span className="sn-lb-count">{at + 1} / {photos.length}</span>
        </>
      )}
    </div>
  );
}

/** Why an organiser's own page isn't public — said to them, not to a visitor. */
const HIDDEN_COPY = {
  requested: ['Your profile isn’t public yet.', 'It goes up once we’ve said yes to your request. We usually reply within a few days.'],
  paused: ['Your profile is paused.', 'Visitors can’t see it, or your events, for now. Message us to pick things back up.'],
  declined: ['Your profile isn’t public.', 'We can’t take this on right now. If things change on either side, write to us.'],
};
const HIDDEN_FALLBACK = ['Your profile isn’t public right now.', 'Your organiser page says why.'];

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/**
 * Where "back" goes. Someone who came from an event (GatheringPage passes it in
 * the link's state) goes back to that event; the organiser to their events;
 * anyone else to the calendar. Only a path on this site is taken from state.
 */
function backTo(state, mine) {
  const from = state && state.from;
  if (from && typeof from.path === 'string' && from.path.startsWith('/sanctuary/') && typeof from.label === 'string' && from.label.trim()) {
    return { to: from.path, label: from.label.trim() };
  }
  return mine ? { to: '/sanctuary/host', label: 'Your events' } : { to: '/sanctuary', label: 'All events' };
}

/**
 * The organiser on their own profile: it's the page as visitors see it, with
 * a strip on top that says so, what's still empty, and what isn't public yet.
 */
function OwnerStrip({ host, own }) {
  const gaps = profileGaps(host);
  const waiting = own?.inReview || 0;
  const drafts = own?.drafts || 0;
  return (
    <div className="sn-org-owner">
      <div className="sn-nudge" role="region" aria-label="Your profile">
        <div className="sn-org-owner-text">
          <p><strong>This is your profile, as visitors see it.</strong></p>
          {gaps.length > 0 && <p>Add {listWords(gaps)} — people book people they can picture.</p>}
          {waiting > 0 && <p>{plural(waiting, 'event is', 'events are')} waiting for review. {waiting === 1 ? 'It shows' : 'They show'} here once {waiting === 1 ? 'it’s' : 'they’re'} approved.</p>}
          {drafts > 0 && <p>{plural(drafts, 'draft', 'drafts')} only you can see.</p>}
        </div>
        <div className="sn-org-owner-acts">
          <Link className="btn" to="/sanctuary/host/profile">Edit your profile</Link>
          <Link className="sn-act" to="/sanctuary/host">Manage your events</Link>
        </div>
      </div>
    </div>
  );
}

/** /sanctuary/hosts/:hostId — an approved organiser's profile, built by them (OrganiserPageEditor). */
const HostProfilePage = () => {
  const { hostId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [host, setHost] = useState(undefined); // undefined = loading, null = not found
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [viewing, setViewing] = useState(null); // index into the gallery, or null
  // The organiser on their own page (a host's id is their sign-in id). Never
  // waited on: the public page paints as it would for anyone, and the strip
  // joins it once their own row and events are read.
  const uid = user?.id || null;
  const mine = Boolean(uid) && uid === hostId;
  const [own, setOwn] = useState(undefined); // undefined = not read yet; { status, inReview, drafts }

  useEffect(() => {
    let alive = true;
    setHost(undefined); setError(null); setViewing(null);
    if (!isUuid(hostId)) { setHost(null); return undefined; }
    Promise.all([getHost(hostId), listHostGatherings(hostId)])
      .then(([h, rows]) => { if (alive) { setHost(h); setItems(rows); } })
      .catch((e) => alive && setError(e));
    return () => { alive = false; };
  }, [hostId]);

  useEffect(() => {
    setOwn(undefined);
    if (!mine) return undefined;
    let alive = true;
    Promise.all([getMyHost(uid).catch(() => null), listMyGatherings().catch(() => [])])
      .then(([row, rows]) => {
        if (alive) setOwn({ status: row?.status || null, ...notYetPublic(rows.filter((o) => o.host_id === uid)) });
      });
    return () => { alive = false; };
  }, [mine, uid]);

  const back = backTo(location.state, mine);
  const list = useMemo(() => collapseSeries(items), [items]);
  const photos = useMemo(() => (host?.gallery_paths || []).map(imageUrl).filter(Boolean), [host]);
  const move = useCallback((d) => setViewing((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);
  const closeViewer = useCallback(() => setViewing(null), []);

  if (error) {
    return (
      <main className="sn-view sn-detail-view">
        <div className="sn-empty sn-pad">
          <p className="sn-empty-h">We couldn’t load this page.</p>
          <p>Check your connection and try again.</p>
          <button className="btn" onClick={() => window.location.reload()}>Reload</button>
        </div>
      </main>
    );
  }
  if (host === undefined || (host === null && mine && own === undefined)) {
    return <main className="sn-view sn-detail-view"><PageSkeleton kind="profile" label="Loading the profile" /></main>;
  }
  if (host === null && mine) {
    const [h, p] = HIDDEN_COPY[own?.status] || HIDDEN_FALLBACK;
    return (
      <main className="sn-view sn-detail-view">
        <SEO title="Your profile | Conscious Sanctuary" noIndex />
        <div className="sn-empty sn-pad">
          <p className="sn-empty-h">{h}</p>
          <p>{p}</p>
          <Link className="btn" to="/sanctuary/host">Open your organiser page</Link>
        </div>
      </main>
    );
  }
  if (host === null) {
    return (
      <main className="sn-view sn-detail-view">
        <SEO title="Organiser not found | Conscious Sanctuary" noIndex />
        <div className="sn-empty sn-pad">
          <p className="sn-empty-h">This organiser isn’t on the calendar.</p>
          <p>The link may be incomplete, or they’re taking a break.</p>
          <Link className="btn" to="/sanctuary">See what’s on</Link>
        </div>
      </main>
    );
  }

  const first = host.display_name.split(' ')[0];
  const cover = imageUrl(host.cover_path);
  const avatar = imageUrl(host.avatar_path);
  const link = safeHttpsLink(host.link);
  const place = [host.place_name, host.place_address].filter(Boolean).join(', ');
  const initials = host.display_name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <main className={`sn-view sn-detail-view sn-org${cover ? '' : ' no-cover'}`}>
      <SEO
        title={`${host.display_name} | Conscious Sanctuary`}
        description={(host.tagline || host.bio || `Classes, workshops and events with ${host.display_name}.`).slice(0, 160)}
        url={`/sanctuary/hosts/${host.id}`}
        image={cover || avatar || undefined}
        structuredData={[
          { '@context': 'https://schema.org', '@type': 'Person', name: host.display_name, ...(link ? { url: link } : {}), ...(avatar ? { image: avatar } : {}) },
          breadcrumb([{ name: 'Home', path: '/' }, { name: 'Sanctuary', path: '/sanctuary' }, { name: host.display_name, path: `/sanctuary/hosts/${host.id}` }]),
        ]}
      />

      {mine && <OwnerStrip host={host} own={own} />}

      {/* no cover photo, no empty band: the profile photo and name start the page */}
      {cover && (
        <header className="sn-org-cover">
          <img src={cover} alt="" />
        </header>
      )}

      <div className="sn-org-body">
        <div className="sn-org-head">
          <div className="sn-org-avatar">{avatar ? <img src={avatar} alt="" /> : <span aria-hidden="true">{initials}</span>}</div>
          <div className="sn-org-id">
            <Link className="sn-back" to={back.to}>← {back.label}</Link>
            <h1 className="display sn-org-name">{host.display_name}</h1>
            {host.tagline && <p className="sn-org-tagline">{host.tagline}</p>}
            <div className="sn-org-links">
              {place && (
                <a href={mapsUrl(place)} target="_blank" rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="10" r="2.4" fill="currentColor" /></svg>
                  {place}
                </a>
              )}
              {link && <a href={link} target="_blank" rel="noopener noreferrer nofollow">{link.replace(/^https:\/\/(www\.)?/i, '').replace(/\/$/, '')} ↗</a>}
            </div>
          </div>
        </div>

        {host.bio && (
          <Reveal className="sn-prose sn-org-bio">
            {host.bio.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
          </Reveal>
        )}

        {photos.length > 0 && (
          <section className="sn-org-gallery" aria-labelledby="sn-org-g-h">
            <h2 id="sn-org-g-h" className="sn-month-h">{host.place_name ? `At ${host.place_name}` : 'Photos'}</h2>
            <ul>
              {photos.map((src, i) => (
                <li key={src}>
                  <button type="button" onClick={() => setViewing(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`}>
                    <img src={src} alt="" loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="sn-hostpage-list" aria-labelledby="sn-hp-h">
          <h2 id="sn-hp-h" className="sn-month-h">Coming up with {first}</h2>
          {list.length ? (
            <ul className="sn-list">{list.map((o) => <li key={o.id}><GatheringRow o={o} showHost={false} /></li>)}</ul>
          ) : mine ? (
            <div className="sn-empty">
              <p className="sn-empty-h">None of your events are on the calendar right now.</p>
              <p>An event shows here once it’s approved.</p>
              <Link className="btn" to="/sanctuary/host/new">Create an event</Link>
            </div>
          ) : (
            <div className="sn-empty">
              <p className="sn-empty-h">Nothing on the calendar right now.</p>
              <p>New dates appear here as soon as {first} adds them.</p>
              <Link className="btn" to="/sanctuary">See what else is on</Link>
            </div>
          )}
        </section>
      </div>

      {viewing !== null && photos[viewing] && <Lightbox photos={photos} at={viewing} onMove={move} onClose={closeViewer} />}
    </main>
  );
};

export default HostProfilePage;

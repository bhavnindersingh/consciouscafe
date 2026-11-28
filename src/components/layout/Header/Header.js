import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { getGumletUrl } from '../../../utils/gumlet';
import { accountMenu } from '../../../utils/account';
import AccountMenu from './AccountMenu';

const HIBISCUS = getGumletUrl('hibiscus.png', { width: 600, quality: 72, format: 'auto' });

const BagIcon = ({ s = 17 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
  </svg>
);

function viewFromPath(pathname) {
  if (pathname.startsWith('/menu')) return 'menu';
  if (pathname.startsWith('/about') || pathname.startsWith('/story')) return 'story';
  if (pathname.startsWith('/visit')) return 'visit';
  if (pathname.startsWith('/account')) return 'account';
  // an organiser's own pages (not /sanctuary/hosts/:id, a public profile)
  if (/^\/sanctuary\/host(\/|$)/.test(pathname)) return 'organiser';
  // the ice bath and sauna live under /sanctuary but have a tab of their own
  if (pathname.startsWith('/sanctuary/restore')) return 'restore';
  if (pathname.startsWith('/sanctuary')) return 'sanctuary';
  if (pathname.startsWith('/privacy') || pathname.startsWith('/terms')) return 'legal';
  return 'home';
}

const MM_ITEMS = [
  { id: 'home',   label: 'Home',      note: 'The kitchen, the ethos',  path: '/' },
  { id: 'menu',   label: 'Menu',      note: 'A season, plated',         path: '/menu' },
  { id: 'sanctuary', label: 'Sanctuary', note: 'Classes · workshops · events', path: '/sanctuary' },
  { id: 'restore', label: 'Ice bath & sauna', note: 'Cold, heat or both', path: '/sanctuary/restore' },
  { id: 'story',  label: 'Story',     note: 'Why we cook this way',     path: '/about' },
  { id: 'visit',  label: 'Visit',     note: 'Auroville Road',           path: '/visit' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { count, setBagOpen } = useCart();
  // Anyone may sign in — to see their bookings and orders (/account); an
  // organiser's events are in the same menu. Nothing while the session is still
  // being read, so the phone menu's label doesn't flicker.
  const { user, loading, hostRow, signOut } = useAuth();
  const signedIn = !loading && !!user;
  const me = signedIn ? accountMenu(user, hostRow) : null;

  const view = viewFromPath(location.pathname);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // How signing out went, said once under the header (and to screen readers).
  const [note, setNote] = useState('');
  useEffect(() => {
    if (!note) return undefined;
    const t = setTimeout(() => setNote(''), 4000);
    return () => clearTimeout(t);
  }, [note]);
  const signOutPhone = async () => {
    setMobileOpen(false);
    const { error } = (await signOut()) || {};
    setNote(error ? 'We couldn’t sign you out — check your connection and try again.' : 'You’re signed out.');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Clear over a full-bleed photo (home, the landing pages); solid wherever the
  // page starts on limewash — a dish's page puts its photo on one side only.
  const onPaper = /^\/(product|category)\//.test(location.pathname);
  const isSolid = scrolled || view !== 'home' || onPaper;

  const handleNav = (item) => {
    setMobileOpen(false);
    if (item.path) navigate(item.path);
  };

  // The open menu covers the page: focus goes in (to Close), Escape closes it,
  // the page behind doesn't scroll, and focus comes back to ☰ when it closes.
  const burgerRef = useRef(null);
  const closeRef = useRef(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!mobileOpen) {
      if (wasOpen.current) burgerRef.current?.focus();
      wasOpen.current = false;
      return undefined;
    }
    wasOpen.current = true;
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; };
  }, [mobileOpen]);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <nav className={`nav ${isSolid ? 'solid' : ''}`} role="banner">
        <button
          ref={burgerRef}
          className={`nav-burger ${mobileOpen ? 'is-open' : ''}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>

        {/* What's here on the left — food, the Sanctuary, the ice bath and sauna;
            about us and finding us on the right, with the bag and the way into
            Your account. The wordmark is the way home. */}
        <div className="nav-links">
          <button className={`nav-link ${view === 'menu' ? 'active' : ''}`} onClick={() => navigate('/menu')}>Menu</button>
          <button className={`nav-link ${view === 'sanctuary' ? 'active' : ''}`} onClick={() => navigate('/sanctuary')}>Sanctuary</button>
          <button className={`nav-link ${view === 'restore' ? 'active' : ''}`} onClick={() => navigate('/sanctuary/restore')}>Ice bath &amp; sauna</button>
        </div>

        <button className="brand" aria-label="Conscious Café Sanctuary, home" onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          {/* one line where it fits, the two names parted by a dot; stacked, café over
              sanctuary, with the dot between, where it doesn't — App.css */}
          <span className="b1"><span className="b1-a">Conscious Café</span><span className="b1-dot" aria-hidden="true"> · </span><span className="b1-b">Sanctuary</span></span>
        </button>

        <div className="nav-right">
          <button className={`nav-link ${view === 'story' ? 'active' : ''}`} onClick={() => navigate('/about')}>Story</button>
          <button className={`nav-link ${view === 'visit' ? 'active' : ''}`} onClick={() => navigate('/visit')}>Visit</button>
          <button className="bag" onClick={() => setBagOpen(true)} aria-label={`Shopping bag, ${count} items`}>
            <BagIcon /> <span className="bag-label">Bag</span>
            {count > 0 && <span className="count">{count}</span>}
          </button>
          {/* Your account, for anyone who books or orders (organisers too). Always
              drawn (no shift when the session arrives); signed in, it's your
              initial and opens a menu with Sign out. Phones reach the same from
              the ☰ menu. */}
          <AccountMenu active={view === 'account' || view === 'organiser'} onSignedOut={setNote} />
        </div>
        <p className={`nav-note${note ? ' on' : ''}`} role="status">{note}</p>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="mm-top">
          <span className="mm-brand"><span>Conscious Café</span> <span className="mm-dot" aria-hidden="true">·</span> <span>Sanctuary</span></span>
          <button ref={closeRef} className="mm-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">×</button>
        </div>
        <nav className="mm-list">
          {MM_ITEMS.map((n) => (
            <button key={n.id} className="mm-item" onClick={() => handleNav(n)}>
              <span className="mm-text">
                <span className="mm-label">{n.label}</span>
                <span className="mm-note">{n.note}</span>
              </span>
            </button>
          ))}
        </nav>
        <div className="mm-foot">
          <button className="mm-bag" onClick={() => { setBagOpen(true); setMobileOpen(false); }}>
            View bag{count > 0 ? ` · ${count}` : ''}
          </button>
          {!loading && !signedIn && (
            <button className="mm-account" onClick={() => handleNav({ path: '/account' })}>Sign in</button>
          )}
          {signedIn && (
            <div className="mm-acct">
              <div className="mm-acct-links">
                <button className="mm-account" onClick={() => handleNav({ path: '/account' })}>Your account</button>
                {me.items[1] && (
                  <button className="mm-account" onClick={() => handleNav({ path: me.items[1].to })}>{me.items[1].label}</button>
                )}
              </div>
              <p className="mm-acct-who">
                <span>Signed in as <strong>{me.email}</strong></span>
                <button type="button" className="mm-signout" onClick={signOutPhone}>Sign out</button>
              </p>
            </div>
          )}
          <div className="mm-contact">
            <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a>
            <a href="tel:+918754561269">+91 87545 61269</a>
            <span>Daily 9:30 — 21:00 · closed Tuesdays</span>
          </div>
        </div>
        <img className="mm-flower" src={HIBISCUS} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      </div>
    </>
  );
};

export default Header;

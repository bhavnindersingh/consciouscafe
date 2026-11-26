import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { getGumletUrl } from '../../../utils/gumlet';

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
  { id: 'story',  label: 'Story',     note: 'Why we cook this way',     path: '/about' },
  { id: 'sanctuary', label: 'Sanctuary', note: 'Classes · workshops · events', path: '/sanctuary' },
  { id: 'restore', label: 'Ice bath & sauna', note: 'Cold, heat or both', path: '/sanctuary/restore' },
  { id: 'visit',  label: 'Visit',     note: 'Auroville Road',           path: '/visit' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { count, setBagOpen } = useCart();
  // Only organisers ever sign in on this site: a session means one is here.
  // Nothing while the session is still being read, so the label doesn't flicker.
  const { user, loading } = useAuth();
  const organiser = !loading && !!user;

  const view = viewFromPath(location.pathname);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <nav className={`nav ${isSolid ? 'solid' : ''}${organiser ? ' has-organiser' : ''}`} role="banner">
        <button
          className={`nav-burger ${mobileOpen ? 'is-open' : ''}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>

        <div className="nav-links">
          <button className={`nav-link ${view === 'home' ? 'active' : ''}`} onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</button>
          <button className={`nav-link ${view === 'menu' ? 'active' : ''}`} onClick={() => navigate('/menu')}>Menu</button>
          <button className={`nav-link ${view === 'story' ? 'active' : ''}`} onClick={() => navigate('/about')}>Story</button>
        </div>

        <button className="brand" onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          {/* one line where it fits, the two names parted by a dot; stacked, café over
              sanctuary, where it doesn't (the dot then goes) — App.css */}
          <span className="b1"><span className="b1-a">Conscious Café</span><span className="b1-dot" aria-hidden="true"> · </span><span className="b1-b">Sanctuary</span></span>
        </button>

        <div className="nav-right">
          <button className={`nav-link ${view === 'sanctuary' ? 'active' : ''}`} onClick={() => navigate('/sanctuary')}>Sanctuary</button>
          <button className={`nav-link ${view === 'restore' ? 'active' : ''}`} onClick={() => navigate('/sanctuary/restore')}>Ice bath &amp; sauna</button>
          <button className={`nav-link ${view === 'visit' ? 'active' : ''}`} onClick={() => navigate('/visit')}>Visit</button>
          {organiser && (
            <button className={`nav-link ${view === 'organiser' ? 'active' : ''}`} onClick={() => navigate('/sanctuary/host')}>Your events</button>
          )}
          <button className="bag" onClick={() => setBagOpen(true)} aria-label={`Shopping bag, ${count} items`}>
            <BagIcon /> <span className="bag-label">Bag</span>
            {count > 0 && <span className="count">{count}</span>}
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="mm-top">
          <span className="mm-brand"><span>Conscious Café</span> <span>Sanctuary</span></span>
          <button className="mm-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">×</button>
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
          {!loading && (
            <button className="mm-organiser" onClick={() => handleNav({ path: '/sanctuary/host' })}>
              {organiser ? 'Your events' : 'Organiser sign-in'}
            </button>
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

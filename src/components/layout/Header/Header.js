import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';

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
  return 'home';
}

const MM_ITEMS = [
  { id: 'home',   label: 'Home',      note: 'The kitchen, the ethos',  path: '/' },
  { id: 'menu',   label: 'Menu',      note: 'A season, plated',         path: '/menu' },
  { id: 'story',  label: 'Story',     note: 'Why we cook this way',     path: '/about' },
  { id: 'gather', label: 'Sanctuary', note: 'Shala · temple · ice spa', gather: true },
  { id: 'visit',  label: 'Visit',     note: 'Auroville Road',           path: '/visit' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { count, setBagOpen } = useCart();

  const view = viewFromPath(location.pathname);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isSolid = scrolled || view !== 'home';

  const goGather = () => {
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById('gather');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 90);
  };

  const handleNav = (item) => {
    setMobileOpen(false);
    if (item.gather) goGather();
    else if (item.path) navigate(item.path);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <nav className={`nav ${isSolid ? 'solid' : ''}`} role="banner">
        <button
          className={`nav-burger ${mobileOpen ? 'is-open' : ''}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>

        <div className="nav-links">
          <button className={`nav-link ${view === 'home' ? 'active' : ''}`} onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>home</button>
          <button className={`nav-link ${view === 'menu' ? 'active' : ''}`} onClick={() => navigate('/menu')}>menu</button>
          <button className={`nav-link ${view === 'story' ? 'active' : ''}`} onClick={() => navigate('/about')}>story</button>
        </div>

        <button className="brand" onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="b1">Conscious Café</span>
        </button>

        <div className="nav-right">
          <button className="nav-link" onClick={goGather}>sanctuary</button>
          <button className={`nav-link ${view === 'visit' ? 'active' : ''}`} onClick={() => navigate('/visit')}>visit</button>
          <button className="bag" onClick={() => setBagOpen(true)} aria-label={`Shopping bag, ${count} items`}>
            <BagIcon /> <span className="bag-label">bag</span>
            {count > 0 && <span className="count">{count}</span>}
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="mm-top">
          <span className="mm-brand">Conscious Café</span>
          <button className="mm-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">×</button>
        </div>
        <nav className="mm-list">
          {MM_ITEMS.map((n, i) => (
            <button key={n.id} className="mm-item" onClick={() => handleNav(n)}>
              <span className="mm-idx">0{i + 1}</span>
              <span className="mm-text">
                <span className="mm-label">{n.label}</span>
                <span className="mm-note">{n.note}</span>
              </span>
              <span className="mm-arr">→</span>
            </button>
          ))}
        </nav>
        <div className="mm-foot">
          <button className="mm-bag" onClick={() => { setBagOpen(true); setMobileOpen(false); }}>
            View bag{count > 0 ? ` · ${count}` : ''}
          </button>
          <div className="mm-contact">
            <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a>
            <a href="tel:+918754561269">+91 87545 61269</a>
            <span>Daily 9:30 — 21:00 · closed Tuesdays</span>
          </div>
        </div>
        <img className="mm-flower" src="/hibiscus.png" alt="" aria-hidden="true" />
      </div>
    </>
  );
};

export default Header;

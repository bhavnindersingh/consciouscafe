import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BagIcon = ({ s = 17 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'home', label: 'home', path: '/' },
  { id: 'menu', label: 'menu', path: '/menu' },
  { id: 'story', label: 'story', anchor: true },
  { id: 'gather', label: 'sanctuary', anchor: true },
  { id: 'visit', label: 'visit', anchor: true },
];

const MM_ITEMS = [
  { id: 'home', label: 'Home', note: 'The kitchen, the ethos', path: '/' },
  { id: 'menu', label: 'Menu', note: 'A season, plated', path: '/menu' },
  { id: 'story', label: 'Story', note: 'Why we cook this way', anchor: true },
  { id: 'gather', label: 'Sanctuary', note: 'Shala · temple · ice spa', anchor: true },
  { id: 'visit', label: 'Visit', note: 'Auroville Road', anchor: true },
];

const Header = ({ cartItems = [], onCartToggle }) => {
  const [solid, setSolid] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cartItems.reduce((t, i) => t + (i.quantity || 1), 0);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToAnchor = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
  };

  const handleNav = (item) => {
    setMobileOpen(false);
    if (item.path) {
      navigate(item.path);
    } else if (item.anchor) {
      if (!isHome) {
        navigate('/');
        setTimeout(() => scrollToAnchor(item.id), 80);
      } else {
        scrollToAnchor(item.id);
      }
    }
  };

  const forceSolid = location.pathname !== '/';
  const isSolid = solid || forceSolid;

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <nav className={`nav ${isSolid ? 'solid' : ''}`} role="banner">
        <div className="nav-links">
          <button className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => handleNav(NAV_ITEMS[0])}>home</button>
          <button className={`nav-link ${location.pathname === '/menu' ? 'active' : ''}`} onClick={() => handleNav(NAV_ITEMS[1])}>menu</button>
          <button className="nav-link" onClick={() => handleNav(NAV_ITEMS[2])}>story</button>
        </div>

        <button className="brand" onClick={() => navigate('/')}>
          <span className="b1">Conscious Café</span>
          <span className="b2">Auroville Road · est. 2016</span>
        </button>

        <div className="nav-right">
          <button className="nav-link" onClick={() => handleNav(NAV_ITEMS[3])}>sanctuary</button>
          <button className="nav-link" onClick={() => handleNav(NAV_ITEMS[4])}>visit</button>
          <button className="bag" onClick={onCartToggle} aria-label={`Shopping bag, ${cartCount} items`}>
            <BagIcon /> <span className="bag-label">bag</span>
            {cartCount > 0 && <span className="count">{cartCount}</span>}
          </button>
          <button
            className={`nav-burger ${mobileOpen ? 'is-open' : ''}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span /><span /><span />
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
          <button className="mm-bag" onClick={() => { onCartToggle(); setMobileOpen(false); }}>
            View bag{cartCount > 0 ? ` · ${cartCount}` : ''}
          </button>
          <div className="mm-contact">
            <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a>
            <a href="tel:+918754561269">+91 87545 61269</a>
            <span>Daily 9:30 — 21:00 · closed Tuesdays</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
